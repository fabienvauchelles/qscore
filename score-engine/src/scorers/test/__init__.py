# -*- coding: utf-8 -*-

from .. import BaseScorer
from time import sleep

import pandas as pd


class Scorer(BaseScorer):

    def __init__(self):
        super().__init__()


    def score(self, data_submission):
        df_submission = pd.read_csv(data_submission)
        score = df_submission.iloc[0]['score']

        sleep(0.2)

        return score
