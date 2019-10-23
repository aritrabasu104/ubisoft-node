
const mongoose = require('mongoose'), Schema = mongoose.Schema;;
const PlayerStat = require('./PlayerStat');

const MatchSchema = new mongoose.Schema({
    matchName: { type: String, required: true },
    playerStats: [{ type: Schema.Types.ObjectId, ref: PlayerStat }]
});


mongoose.model('Match', MatchSchema);

module.exports = mongoose.model('Match');