# -*- coding: utf-8 -*-



class ScorerError(Exception):
    pass



class BaseScorer:
    def score(self, df_submission):
        raise ScorerError('Score not implemented')


    def check_columns(self, reference, predict):
        reference_cols = set(reference.columns.tolist())
        predict_cols = set(predict.columns.tolist())
        diff = reference_cols - predict_cols
        if len(diff) > 0:
            raise ScorerError('Columns must be {}'.format(','.join(reference_cols)))
