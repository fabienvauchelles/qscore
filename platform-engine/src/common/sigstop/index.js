'use strict';



let sigCb;



function sigstop(callback) {
    if (!sigCb) {
        registerClosingSignals();
    }

    sigCb = callback;


    ////////////

    function registerClosingSignals() {
        const signals = [
            'SIGABRT',
            'SIGALRM',
            'SIGBUS',
            'SIGFPE',
            'SIGHUP',
            'SIGILL',
            'SIGINT',
            'SIGQUIT',
            'SIGSEGV',
            'SIGTERM',
            'SIGUSR1',
            'SIGUSR2',
            'SIGSYS',
            'SIGTRAP',
            'SIGVTALRM',
            'SIGXFSZ',
        ];

        signals.forEach((signal) => {
            process.on(signal, () => {
                if (sigCb) {
                    sigCb(signal);
                }
            });
        });
    }
}



////////////

module.exports = sigstop;
