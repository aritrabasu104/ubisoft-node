
const mongoose = require('mongoose'), Schema = mongoose.Schema;;
const Player = require('./Player');
const Match = require('./Match');
const PlayerStatSchema = new mongoose.Schema({
  match: { type: Schema.Types.ObjectId, ref: Match, required: true },
  player: { type: Schema.Types.ObjectId, ref: Player, required: true },
  kills: { type: Number, required: true },
  score: { type: Number, required: true },
  rank: Number,
  statTime: Number
},
{
  toObject: {
      transform: function (doc, ret) {
          delete ret._id;
          delete ret.__v;
          delete ret.match;
          delete ret.statTime;
      }
  }
});
mongoose.model('PlayerStat', PlayerStatSchema);

module.exports = mongoose.model('PlayerStat');
