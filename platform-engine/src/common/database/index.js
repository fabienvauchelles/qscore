'use strict';



// It is not possible to merge client.js and index.js because it would cause a cross-dependency with the models
const
    client = require('./client');



// Load the models, this step has side effects on client
[
    require('../../model/competitions/competition/competition.model'),
    require('../../model/players/player/player.model'),
    require('../../model/players/competition/player-competition.model'),
    require('../../model/submissions/submission/submission.model'),
    require('../../model/leads/lead/lead.model'),
    require('../../model/materials/material/materiel.model'),
].forEach((model) => {
    if (model.associate) {
        model.associate();
    }
});


////////////

module.exports = client;
