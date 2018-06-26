=======================================
Tutorial: Create your first competition
=======================================


Step 1: Login to QScore
-----------------------

Go to http://localhost:3000 and click on *Create Competition*

.. image:: step_1.jpg


Step 2: Fill the values
-----------------------

====================== ======= ========= ===================================================================
Values                 Type    Mandatory Description
====================== ======= ========= ===================================================================
Long Title             string  yes       Title of the competition in the card list
Short Title            string  yes       Title of the competition in the sidebar
Scorer Class           string  yes       Name of the Python class which scores the submissions
Password               string  no        Restrict access to the competition with a password
Published              boolean yes       Publish competition to non-admin
Hidden                 boolean yes       Competition is only visible with the link (hidden in the card list)
Submission delay       integer yes       Delay in milliseconds between 2 submissions
Scorer order           boolean yes       ASC=Smallest score wins / DESC=Highest score wins
Picture URL            url     no        Background image for the competition
Starting date          date    yes       Opening date of the competiton (DD/MM/YYYY hh:mm)
Ending date            date    yes       Closing date of the competiton (DD/MM/YYYY hh:mm)
Long Description       html    yes       Long description of the competition
Short Description      html    yes       Description of the competition in the card list
Evaluation Metric      html    yes       Metric used in the competition
File submission format html    yes       Format of the file which must be submitted
Rules                  html    yes       Rules of the competitions (and NDA)
Data Description       html    yes       Description of the Data
====================== ======= ========= ===================================================================


Step 3: Save
------------

Click on *Create*
