# -*- coding: utf-8 -*-

import os


DEBUG = int(os.environ.get('DEBUG', 0))


RABBITMQ = {
    'host': os.environ.get('RABBITMQ_DEFAULT_HOST', 'localhost'),
    'port': os.environ.get('RABBITMQ_DEFAULT_PORT', 5672),
    'vhost': os.environ.get('RABBITMQ_DEFAULT_VHOST'),
    'user': os.environ.get('RABBITMQ_DEFAULT_USER', 'guest'),
    'password': os.environ.get('RABBITMQ_DEFAULT_PASS', 'guest'),
    'connection_attempts': 30,
    'retry_delay': 1,
    'reconnect_interval': 5,
    'exchange_name': os.environ.get('RABBITMQ_DEFAULT_EXCHANGE'),
    'queue_name': os.environ.get('RABBITMQ_DEFAULT_QUEUE'),
    'routing_key': os.environ.get('RABBITMQ_DEFAULT_ROUTING_KEY', '#'),
}


PLATFORM = {
    'url': os.environ.get('PLATFORM_URL'),
    'auth': {
        'admin': {
            'audience': os.environ.get('AUTH_ADMIN_AUDIENCE', 'https://qscore'),
            'issuer': os.environ.get('AUTH_ADMIN_ISSUER', 'https://qscore'),
            'secret': os.environ.get('AUTH_ADMIN_SECRET'),
        },
    }
}
