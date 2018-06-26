# -*- coding: utf-8 -*-

from .. import BaseScorer

import pandas as pd



class Scorer(BaseScorer):

    def __init__(self):
        super().__init__()


    def score(self, data_submission):
        df_submission = pd.read_csv(data_submission)
        df_reference = pd.read_csv('scorers/titanic/reference.csv')
        self.check_columns(df_reference, df_submission)

        df_submission = df_submission.rename(columns={
            'Survived': 'SurvivedPredicted',
        })

        df_control = df_reference.merge(df_submission)

        df_control['score'] = (df_control['Survived'] == df_control['SurvivedPredicted']).astype(int)
        return df_control['score'].mean()
