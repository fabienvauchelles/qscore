===================
Simple installation
===================


Recommanded requirements
========================

You should use a virtual machine with theses specifications. It is recommanded but not required.

Hardware
--------

- RAM: 8Go
- vCPU: 2
- Hdd: 10Go

Software
--------

- OS: Ubuntu/Debian
- Node.js: 8.9
- Docker: 18.03-ce (with docker-compose)



Get your Auth0 credentials
==========================

See :doc:`Get credentials <auth0/index>`.

Remember your *Domain*, *Client ID* and *Identifier*.



Clone the repository
====================


Clone the QScore repository:

::

    git clone https://github.com/fabienvauchelles/qscore.git


Go in the :code:`qscore` directory:

::

    cd qscore


Configure parameters
====================

Go in the :code:`deployment/simple` directory:

::

   cd deployment/simple


Copy the configuration template:

::

    cp variables.examples.env variables.env


Fill the missing parameters in variables.env:

============================== ========================================================================== ================================================
Parameter                      Description                                                                Example
============================== ========================================================================== ================================================
AUTH_PLAYER_ISSUER             Use Domain from Auth0. Template is: https://<domain>/                      https://stuff.eu.auth0.com/
AUTH_PLAYER_JWKS_URI           Use Domain from Auth0. Template is: https://<domain>/.well-known/jwks.json https://stuff.eu.auth0.com/.well-known/jwks.json
NG_QS_AUTH_PLAYER_AUDIENCE     Use Identifier from Auth0                                                  https://www.stuff.com
NG_QS_AUTH_PLAYER_CLIENT_ID    Use Client ID from Auth0                                                   0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ
NG_QS_AUTH_PLAYER_DOMAIN       Use Domain from Auth0                                                      stuff.eu.auth0.com
NG_QS_AUTH_PLAYER_REDIRECT_URI Use your server URL like http://<your server url>/callback                 http://localhost:3000/callback
AUTH_ADMIN_SECRET              Use a random string                                                        FgkqZ41Qlal410q40calw412SQSF
============================== ========================================================================== ================================================



Build the frontend
==================

Go in the :code:`deployment/simple` directory:

::

    ./build_frontend.sh



Deploy the project
==================

Go in the :code:`deployment/simple` directory:

::

    docker-compose build
    docker-compose up -d


Connect to the interface
========================

See :doc:`Connect to QScore <connect/index>`.


Make yourself an admin
======================

See :doc:`Be an admin <admin/index>`.



Create your first competition
=============================

See :doc:`My first competition <competition/index>`.
