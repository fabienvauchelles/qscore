# -*- coding: utf-8 -*-



class ScorerException(Exception):
    def __init__(self, message='Server Error', code=500):
        Exception.__init__(self, message)
        self.message = message
        self.code = code
