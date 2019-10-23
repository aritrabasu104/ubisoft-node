
const mongoose = require('mongoose'), Schema = mongoose.Schema;;
const PlayerStat = require('./PlayerStat');

const PlayerSchema = new mongoose.Schema({
    playerName: { type: String, required: true },
    playerStats: [{ type: Schema.Types.ObjectId, ref: PlayerStat }]
}, {
    toObject: {
        transform: function (doc, ret) {
            delete ret;
        }
    }
});

mongoose.model('Player', PlayerSchema);

module.exports = mongoose.model('Player');
