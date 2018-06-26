# -*- coding: utf-8 -*-

from common.api_client import ApiClient
from common.logger import logger
from common import config
from common.messaging import MessagingConnection
from common.worker import Worker

import signal



if __name__ == '__main__':
    api_client = ApiClient(config.PLATFORM)

    worker = Worker(api_client)

    connection = MessagingConnection(config.RABBITMQ, worker)

    def stop_messaging(sig, frame):
        logger.info(f'Signal {sig} received, stopping worker')
        connection.stop()

    signal.signal(signal.SIGINT, stop_messaging)
    signal.signal(signal.SIGHUP, stop_messaging)
    signal.signal(signal.SIGABRT, stop_messaging)
    signal.signal(signal.SIGTERM, stop_messaging)
    signal.signal(signal.SIGQUIT, stop_messaging)

    # Starting the messaging connection
    connection.start()
