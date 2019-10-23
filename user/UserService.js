const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Player = require('./models/Player');
const Match = require('./models/Match');
const PlayerStat = require('./models/PlayerStat');

class UserService {
    // CREATES A NEW PLAYER
    createPlayer(playerName) {
        return Player.create({ playerName });
    }
    // CREATES A NEW MATCH
    createMatch(matchName) {
        return Match.create({ matchName });
    }
    // CREATES A NEW STAT
    createStat(matchName, playerId, kills, score) {
        let currentMatch;
        return Match.find({ matchName }).exec().then(matches => {
            // if (err) return res.status(500).send(err.message + " : There was a problem finding the match.");
            if (matches.length === 0) return res.status(404).send("Invalid match name provided.");
            currentMatch = matches[0];
            return PlayerStat.find({
                player: ObjectId(playerId),
                match: currentMatch
            }).exec()
        }).then(playerStats => {
            const playerStatNew = {
                player: ObjectId(playerId),
                match: currentMatch,
                kills: kills,
                score: score,
                statTime: new Date().getTime()
            };
            // if (err) return res.status(500).send(err.message + " : There was a problem finding the player stats.");
            if (playerStats.length === 0) {
                return this.createPlayerAndUpdateRanks(playerStatNew, currentMatch);
            } else {
                const playerStatOld = playerStats[0];
                if (playerStatOld.score <= playerStatNew.score) {
                    return PlayerStat.findByIdAndRemove(playerStatOld.id).exec().then(() => {
                        return this.createPlayerAndUpdateRanks(playerStatNew, currentMatch);
                    });
                } else
                    return playerStatOld;
            }
        });
    }

    createPlayerAndUpdateRanks(playerStatNew, currentMatch) {
        return PlayerStat.create(playerStatNew).then(() => {
            return PlayerStat.find({ match: currentMatch }).then(playerStats => {
                let i = 0;
                playerStats.sort((item1, item2) => {
                    return item2.score - item1.score;
                }).forEach(item => {
                    item.rank = ++i;
                    item.save();
                })
                return playerStats;
            });
        });
    }

    // RETURNS ALL STATS  IN THE DATABASE FOR A PLAYER
    getPlayerStats(playerId) {
        return PlayerStat.find({ player: ObjectId(playerId) }).exec();
    }

    // RETURNS ALL THE PLAYERS IN THE DATABASE
    getAllPlayers() {
        return Player.find({}).exec();
    }

    // RETURNS THE LEADERBOARD FOR MATCH AND TIME LIMIT
    getMatchLeaderboard(matchName, timeInMillis) {
        return Match.find({ matchName }).exec().then(matches => {
            if (matches.length === 0) throw new Error("Invalid match name provided.");
            return PlayerStat.find({ match: matches[0] }).exec().then(playerStats => {
                return playerStats.filter(item => item.statTime > timeInMillis).sort((item1, item2) => item2.score - item1.score).slice(0, 99)
            })
        });
    }

    // RETURNS ADJACENT SCORES FOR THE USER
    getAdjacendScoresForUser(userId, matchName) {
        return Match.find({ matchName }).exec().then(matches => {
            if (matches.length === 0) throw new Error("Invalid match name provided.");
            return PlayerStat.find({ match: matches[0] }).exec().then(playerStats => {
                const targetPlayer = playerStats.filter(stat => {
                    return stat.player.toString() === userId
                });
                if (targetPlayer.length === 0) throw new Error("Invalid Player Id provided.");
                const targetRank = targetPlayer[0].rank;
                return playerStats.filter(stat => stat.rank <= (targetRank + 2) && stat.rank >= (targetRank - 2))
            });
        });
    }

    // RETURNS STATS FOR A MATCH WITHIN THE TIME
    getStatsForMatch(matchName, timeInMillis) {
        return Match.find({ matchName }).exec().then(matches => {
            if (matches.length === 0) throw new Error("Invalid match name provided.");
            return PlayerStat.find({ match: matches[0] }).exec().then(playerStats => {
                return playerStats.filter(item => item.statTime > timeInMillis).sort((item1, item2) => item2.score - item1.score).slice(0, 99)
            });
        });
    }
}
const instance = new UserService();

module.exports = instance;