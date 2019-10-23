const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
const Player = require('./models/Player');
const Match = require('./models/Match');
const PlayerStat = require('./models/PlayerStat');
const UserService = require('./UserService');

// CREATES A NEW USER
router.post('/createPlayer', (req, res) => {
    UserService.createPlayer(req.body.name).then(player => res.status(200).send(player))
        .catch(err => res.status(500).send(err.message + " : There was a problem adding the information to the database."));
});

// CREATES A NEW MATCH
router.post('/createMatch', (req, res) => {
    UserService.createMatch(req.body.name).then(match => res.status(200).send(match))
        .catch(err => res.status(500).send(err.message + " : There was a problem adding the information to the database."));
});

// CREATES A NEW STAT
router.post('/playerStat', (req, res) => {
    if (!req.body.player || req.body.player.trim().length === 0) return res.status(404).send("No user found.");
    else if (!req.body.match || req.body.match.trim().length === 0) return res.status(404).send("No Match found.");
    UserService.createStat(req.body.match, req.body.player, req.body.kills, req.body.score)
        .then(playerStats => res.status(200).send(playerStats))
        .catch(err => res.status(500).send(err.message + " : There was a problem finding the player stats."));

});

// RETURNS ALL STATS  IN THE DATABASE FOR A PLAYER
router.get('/playerStats/:id', function (req, res) {
    UserService.getPlayerStats(req.params.id).then((
        playersStats) => res.status(200).send(playersStats))
        .catch(err => res.status(500).send(err.message + " : There was a problem finding the playersStats."));
});


// RETURNS ALL THE PLAYERS IN THE DATABASE
router.get('/players', function (req, res) {
    UserService.getAllPlayers().then(players => res.status(200).send(players))
        .catch(err => res.status(500).send("There was a problem finding the players."));

});

// RETURNS ALL THE MATCHES IN THE DATABASE
router.get('/matches', function (req, res) {
    Match.find({}, function (err, matches) {
        if (err) return res.status(500).send("There was a problem finding the matches.");
        res.status(200).send(matches);
    });
});


// RETURNS THE LEADERBOARD FOR MATCH AND TIME LIMIT
router.get('/LeaderBoard', function (req, res) {
    UserService.getMatchLeaderboard(req.query.matchName, req.query.timeInMillis)
        .then(playerStats => res.status(200).send(playerStats))
        .catch(err => res.status(500).send(err.message + " There was a problem finding the Leaderboard."));;
});

// RETURNS THE LEADERBOARD FOR MATCH AND TIME LIMIT
router.get('/LeaderBoard/:id', function (req, res) {
    Match.find({ matchName: req.query.matchName }, function (err, matches) {
        if (err) return res.status(500).send("There was a problem finding the matches.");
        if (matches.length === 0) return res.status(404).send("Invalid match name provided.");
        PlayerStat.find({ match: matches[0] }, function (err, playerStats) {
            if (err) return res.status(500).send("There was a problem finding the stats.");
            const targetPlayer = playerStats.filter(stat => {
                return stat.player.toString() === req.params.id
            });
            if (targetPlayer.length === 0) res.status(404).send("Invalid Player Id provided.");
            const targetRank = targetPlayer[0].rank;
            const result = playerStats.filter(stat => stat.rank <= (targetRank + 2) && stat.rank >= (targetRank - 2))
            res.status(200).send(result);
        });
    });
});





module.exports = router;