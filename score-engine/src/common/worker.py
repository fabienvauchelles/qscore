# -*- coding: utf-8 -*-

import sys
import traceback

from .logger import logger



class Worker:
    def __init__(self, api_client):
        self._client = api_client
        self._loaders = ClassLoader()


    def run(self, event):
        try:
            submission_id = event['submission_id']
            scorer_class = event['scorer_class']

            logger.info(f'[{self.__class__.__name__}] score(): scorer_class={scorer_class} / submission_id={submission_id}')

            # Load scorer instance
            scorer = self._loaders.get_instance(scorer_class)

            # Load data
            data_submission = self._client.load_submission_data(submission_id)

            # Score
            score = scorer.score(data_submission)

            self._client.update_submission_score(submission_id, score)

        except Exception as err:
            # Add error stacktracecaffeine

            self._client.update_submission_error(submission_id, str(err))

            exc_type, exc_value, exc_traceback = sys.exc_info()
            traceback.print_exception(exc_type, exc_value, exc_traceback, limit=None, file=sys.stdout)

            logger.error(f'[{self.__class__.__name__}]]Cannot update score. Error: {err}')



class ClassLoaderError(Exception):
    pass



class ClassLoader:
    def __init__(self):
        self._scorers = {}


    def get_instance(self, name):
        if not name or len(name) <= 0:
            raise ClassLoaderError('Scorer name is empty')

        instance = self._scorers.get(name)
        if not instance:
            try:
                instance_class = self._class_import(name)
            except Exception as err:
                raise ClassLoaderError('Cannot find scorer "{}" : {}'.format(name, err))

            instance = instance_class()
            self._scorers[name] = instance

        return instance


    def _class_import(self, name):
        components = name.split('.')
        mod = __import__('.'.join(components[0:-1]), fromlist=[components[-1]])
        return getattr(mod, components[-1])
