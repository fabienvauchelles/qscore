#!/bin/sh

GUI_DIR='../../gui'
NPM=`which npm`
VARIABLES_FILE='../deployment/simple/variables.env'

cd ${GUI_DIR}

rm -Rf node_modules package-lock.json

$NPM install

env $(cat ${VARIABLES_FILE} | grep "^[^#]" | xargs) $NPM run postinstall

$NPM run build:prod
