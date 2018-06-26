'use strict';

const
    amqp = require('amqp-connection-manager'),
    winston = require('winston');


const
    config = require('../../config').messaging;


class Messaging {

    constructor() {}


    openAndWaitForIt() {
        const {host, port, vhost, url, exchangeName} = config;

        winston.debug(`[Messaging] Connecting to ${host}:${port}/${vhost}...`);

        this.connection = amqp.connect([url]);

        this.connection.on('connect', () => winston.info(`[Messaging] Connected to ${host}:${port}/${vhost}`));
        this.connection.on('disconnect', () => winston.info(`[Messaging] Disconnected from ${host}:${port}/${vhost}`));

        this.channel = this.connection.createChannel({
            json: true,
            setup: (channel) => channel.assertExchange(exchangeName, 'topic', {durable: false, autoDelete: false}),
        });

        return this.channel.waitForConnect();
    }


    /**
     * Closes the connection properly
     */
    close() {
        return this.connection.close();
    }


    publish(scorerClass, submissionId) {
        winston.debug('[Messaging] publish(): scorerClass=', scorerClass, ' / submissionId=', submissionId);

        const payload = {
            scorer_class: scorerClass,
            submission_id: submissionId,
        };

        return this.channel.publish(config.exchangeName, scorerClass, payload);
    }
}



////////////

module.exports = new Messaging();
