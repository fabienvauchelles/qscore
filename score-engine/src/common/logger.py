# -*- coding: utf-8 -*-

from . import config

import logging



__all__ = ['logger']



level = logging.DEBUG if config.DEBUG else logging.INFO

# Logger
logger = logging.getLogger('score-engine')
ch = logging.StreamHandler()
logger.setLevel(level)
ch.setLevel(level)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(process)d - %(thread)d - %(levelname)s - %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)
