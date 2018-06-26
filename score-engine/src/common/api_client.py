# -*- coding: utf-8 -*-

from .logger import logger

import datetime
import io
import jwt
import requests



class PlatformError(Exception):
    pass



class ApiClient:

    def __init__(self, config):
        self._config = config


    def load_submission_data(self, submission_id):
        logger.info(f'[{self.__class__.__name__}] load_submission_data(): submission_id={submission_id}')

        token = self._create_admin_token()

        res = requests.get(
            url='{0}/submissions/{1}/data'.format(self._config['url'], submission_id),
            headers={'Authorization': f'Bearer {token}'}
        )

        if res.status_code != 200:
            raise PlatformError(f'Cannot find submission data with id={submission_id}')

        return io.StringIO(res.content.decode('utf-8'))


    def update_submission_score(self, submission_id, score):
        logger.info(f'[{self.__class__.__name__}] update_submission_score(): submission_id={submission_id} / score={score}')

        token = self._create_admin_token()

        payload = {
            'score': score
        }

        res = requests.put(
            url='{0}/submissions/{1}/score'.format(self._config['url'], submission_id),
            json=payload,
            headers={'Authorization': f'Bearer {token}'}

        )

        if res.status_code != 200:
            raise PlatformError(f'Cannot update submission score={score} with id={submission_id}. Error: {res.content}')


    def update_submission_error(self, submission_id, message):
        logger.info(f'[{self.__class__.__name__}] update_submission_error(): submission_id={submission_id} / message={message}')

        token = self._create_admin_token()

        payload = {
            'message': message
        }

        res = requests.put(
            url='{0}/submissions/{1}/error'.format(self._config['url'], submission_id),
            json=payload,
            headers={'Authorization': f'Bearer {token}'}

        )

        if res.status_code != 200:
            raise PlatformError(f'Cannot update submission error message={message} with id={submission_id}. Error: {res.content}')


    def _create_admin_token(self):
        constraints = {
            'iss': self._config['auth']['admin']['issuer'],
            'aud': self._config['auth']['admin']['audience'],
            'exp': datetime.datetime.utcnow() + datetime.timedelta(1),
        }

        payload = {**constraints}

        return jwt.encode(payload, self._config['auth']['admin']['secret']).decode('ascii')