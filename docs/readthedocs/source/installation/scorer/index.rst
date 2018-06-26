======================
Create your own scorer
======================


Create the scorer
=================

Step 1: Create a new directory for your scorer
----------------------------------------------

1. Go in the :code:`score-engine/src/scorers` directory
2. Create a new directory for your scorer

::

    mkdir myscorer


Step 2: Create a new scorer
---------------------------

Create a new scorer file :code:`__init__.py`:

.. code-block:: python

    # -*- coding: utf-8 -*-

    from .. import BaseScorer
    import pandas as pd


    class Scorer(BaseScorer):

        def __init__(self):
            super().__init__()


        def score(self, data_submission):
            df_submission = pd.read_csv(data_submission)

            score = # Score processing

            return score


Re-Deploy the project
=====================

Go in the :code:`deployment/simple` directory:

::

    docker-compose down
    docker-compose build
    docker-compose up -d


Use the new scorer in your competition
======================================

1. Go to http://localhost:3000
2. Open the competition
3. Select *Edit info* on the sidebar
4. Write :code:`scorers.myscorer.Scorer` in Scorer Class
5. Click on *Update*



Example 1: Scorer of MDSF 2016
==============================

Here is the scorer of the competition "Le Meilleur Data Scientist de France 2016".

We use a MAPE_ metric:

.. code-block:: python

    # -*- coding: utf-8 -*-

    from .. import BaseScorer
    import pandas as pd
    import numpy as np

    # Mean Absolute Percentage Error
    def mape_error(y_true, y_pred):
        return np.mean(np.abs((y_true - y_pred) / y_true))[0]

    class Scorer(BaseScorer):
        def __init__(self):
            super().__init__()

        def score(self, data_submission):
            df_submission = pd.read_csv(
                data_submission,
                sep=';',
                decimal='.',
                index_col=0,
                header=0,
                names=['id', 'price'],
            )

            submission_columns_count = df_submission.shape[1]
            if submission_columns_count != 1:
                raise Exception('Submission has {} columns and should have 1 columns with ";" separator'.format(
                    submission_columns_count
                ))

            df_reference = pd.read_csv(
                'scorers/mdsf2016/y_test.csv',
                sep=';',
                decimal='.',
                index_col=0,
                header=0,
                names=['id', 'price'],
            )

            reference_rows_count = df_reference.shape[0]
            submission_rows_count = df_submission.shape[0]
            if submission_rows_count != reference_rows_count:
                raise Exception('Submission has {} rows and should have {} rows'.format(
                    submission_rows_count, reference_rows_count)
                )

            df_reference.sort_index(inplace=True)
            df_submission.sort_index(inplace=True)

            score = mape_error(df_reference, df_submission)
            return score


Example 2: Scorer of MDSF 2018
==============================

Here is the scorer of the competition "Le Meilleur Data Scientist de France 2018".

We use a Logloss_ metric:

.. code-block:: python

    # -*- coding: utf-8 -*-

    from .. import BaseScorer
    from sklearn.metrics import log_loss
    import pandas as pd

    class Scorer(BaseScorer):
        def __init__(self):
            super().__init__()

        def score(self, data_submission):
            df_submission = pd.read_csv(
                data_submission,
                sep=',',
                decimal='.',
                header=0,
                names=['id', 'cl1', 'cl2', 'cl3'],
                index_col=0,
            )

            submission_columns_count = df_submission.shape[1]
            if submission_columns_count != 3:
                raise Exception('Submission has {} columns and should have 3 columns with comma separator'.format(
                    submission_columns_count
                ))

            df_reference = pd.read_csv(
                'scorers/mdsf2018/y_test.csv',
                sep=',',
                decimal='.',
                index_col=0,
                header=0,
                names=['id', 'delai_vente'],
            )

            reference_rows_count = df_reference.shape[0]
            submission_rows_count = df_submission.shape[0]
            if submission_rows_count != reference_rows_count:
                raise Exception('Submission has {} rows and should have {} rows'.format(
                    submission_rows_count, reference_rows_count)
                )

            df_reference.sort_index(inplace=True)
            df_submission.sort_index(inplace=True)

            score = log_loss(df_reference, df_submission)
            return score


.. _MAPE: https://en.wikipedia.org/wiki/Mean_absolute_percentage_error
.. _Logloss: http://scikit-learn.org/stable/modules/generated/sklearn.metrics.log_loss.html