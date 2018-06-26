# -*- coding: utf-8 -*-

from .logger import logger
from threading import Event

import json
import pika
import threading



class MessagingConnection(threading.Thread):

    def __init__(self, config, worker):
        super().__init__()

        self._config = config
        self._worker = worker

        self._connected = threading.Event()
        self._connection = None
        self._channel = None


    def start(self):
        super().start()

        logger.info('[Messaging] Connecting to messaging service')
        # Starting train worker
        # It waits until the connection to the messaging server is established
        while not self._connected.wait():
            logger.info('[Messaging] Waiting for messaging service')

        # Create channel
        self._create_channel()


    def run(self):
        """Override method of Thread"""
        self._connect()
        self._connection.ioloop.start()


    def stop(self):
        logger.info('[Messaging] Stopping ...')
        self._connection.close()
        self._connection.ioloop.stop()
        logger.info('[Messaging] Stopped')


    def _create_channel(self):
        self._channel = MessagingChannel()

        if self._is_connected():
            self._channel.connect(self._connection)

        # Create exchange
        self._channel.create_exchange(self._config['exchange_name'])

        # Create queue with callback
        self._channel.create_queue(self._config['exchange_name'],
                                   self._config['routing_key'],
                                   self._worker.run,
                                   self._config['queue_name'],
                                   durable=True)


    def _connect(self):
        parameters = pika.ConnectionParameters(
            credentials=pika.credentials.PlainCredentials(
                self._config['user'],
                self._config['password']
            ),
            host=self._config['host'],
            port=int(self._config['port']),
            virtual_host=self._config['vhost'],
            connection_attempts=self._config['connection_attempts'],
            retry_delay=self._config['retry_delay'],
        )

        url = 'amqp://{}:{}/{}'.format(self._config['host'], self._config['port'], self._config['vhost'])
        logger.info('[Messaging] Connection to the Messaging server %s', url)
        self._connection = pika.SelectConnection(
            parameters,
            on_open_callback=self._on_connection_open,
            on_open_error_callback=self._on_connection_error,
            on_close_callback=self._on_connection_closed,
            stop_ioloop_on_close=False
        )


    def _is_connected(self):
        return self._connection and self._connection.is_open


    def _on_connection_error(self, connection_unused, error_message=None):
        logger.info('[Messaging] Error during connection to the Messaging server')
        self._connection.add_timeout(5, self._reconnect)


    def _on_connection_closed(self, connection, reply_code, reply_text):
        logger.info('[Messaging] Disconnected from the Messaging server')
        self._connection.add_timeout(5, self._reconnect)
        if self._channel:
            self._channel.disconnect()
        self._connected.clear()


    def _on_connection_open(self, unused_connection):
        logger.info('[Messaging] Connected to the Messaging server')
        if self._channel:
            self._channel.connect(self._connection)
        self._connected.set()


    def _reconnect(self):
        logger.info('[Messaging] Reconnection ...')
        self._connection.ioloop.stop()
        self._connect()
        self._connection.ioloop.start()



class MessagingChannelException(Exception):
    pass



class MessagingChannel:

    def __init__(self):
        self._ready = Event()
        self._channel = None

        self._exchange = None
        self._queue = None


    def connect(self, connection):
        self._channel = None
        connection.channel(on_open_callback=self._on_channel_open)


    def create_exchange(self, name):
        self._exchange = MessagingExchange(name)

        if self._channel:
            self._exchange.connect(self._channel)


    def create_queue(self, exchange_name, routing_key, callback, queue_name, **config):
        self._queue = MessagingQueue(exchange_name, routing_key, callback, queue_name, **config)

        if self._channel:
            self._queue.connect(self._channel)


    def disconnect(self):
        if self._channel:
            self._channel.close()
            logger.info('[MessagingChannel] Channel is down.')

        self._exchange.close()

        if self._queue:
            self._queue.close()

        self._channel = None


    def _on_channel_close(self, channel, reply_code, reply_text):
        self._channel = None
        self._ready.clear()


    def _on_channel_open(self, channel):
        self._channel = channel
        self._channel.add_on_close_callback(self._on_channel_close)

        logger.info('[MessagingChannel] Channel up, waking up')

        self._exchange.connect(self._channel)

        if self._queue:
            self._queue.connect(self._channel)

        self._ready.set()



class MessagingExchange:

    def __init__(self, name):
        self._name = name

        self._channel = None


    def close(self):
        logger.info('[MessagingExchange] Channel is down. Exchange %s unavailable' % self._name)
        self._channel = None


    def connect(self, channel):
        self._channel = channel
        self._channel.exchange_declare(callback=self._on_exchange_declare_ok,
                                       exchange=self._name,
                                       exchange_type='topic',
                                       auto_delete=False,
                                       durable=False)


    def _on_exchange_declare_ok(self, unused_frame):
        logger.info('[MessagingExchange] Exchange %s is up.', self._name)



class MessagingQueue:

    def __init__(self, exchange_name, routing_key, callback, queue_name='', **config):
        self._exchange_name = exchange_name
        self._queue_name = queue_name
        self._routing_key = routing_key
        self._callback = callback
        self._config = config

        self._channel = None


    def close(self):
        logger.info('[MessagingQueue] Channel is down. Queue %s unavailable' % self._given_name)
        self._channel = None


    def connect(self, channel):
        self._channel = channel
        self._channel.queue_declare(self.on_queue_declare_ok, self._queue_name, **self._config)


    def consume(self, callback):
        def on_message(channel, method_frame, header_frame, body):
            try:
                self._callback(json.loads(body))
                channel.basic_ack(delivery_tag=method_frame.delivery_tag)
            except pika.exceptions.ChannelClosed as error:
                logger.error('[MessagingSimpleQueue] Channel has been closed %s', error)
            except Exception as error:
                logger.error('Invalid message %s. Error %s. Message dropped', body, error)
                channel.basic_nack(delivery_tag=method_frame.delivery_tag, requeue=False)

        def _consume(channel, method_frame, header_frame, body):
            # Start the message processing into a dedicated thread to be able to continue to handle heartbeats
            # Warning the pika chanel object if not thread safe so the messages shall be processed one by one
            # See prefetch_count below on queue bind
            threading.Thread(target=on_message, args=(channel, method_frame, header_frame, body)).start()

        logger.info('[MessagingSimpleQueue] Starting consuming on %s', self._routing_key)
        self._channel.basic_consume(_consume, queue=self._given_name, no_ack=False)
        self._callback = callback


    def on_queue_declare_ok(self, method_frame):
        self._given_name = method_frame.method.queue
        self._channel.queue_bind(self.on_queue_bind_ok, self._given_name, self._exchange_name, routing_key=self._routing_key)


    def on_queue_bind_ok(self, unused_frame):
        # Do not increase the prefetch count, the pika chanel object is not thread safe
        self._channel.basic_qos(prefetch_count=1)

        # Reinstall consumer handler after reconnection
        if self._callback:
            self.consume(self._callback)