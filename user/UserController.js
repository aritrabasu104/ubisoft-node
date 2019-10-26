const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
const UserService = require('./UserService');

// CREATES A NEW USER
router.post('/createPlayer', (req, res) => {
    UserService.createPlayer(req.body.name).then(player => res.status(200).send(player))
        .catch(err => res.status(err.code ? err.code : 500).send(err.message + " : There was a problem adding the information to the database."));
});

// CREATES A NEW MATCH
router.post('/createMatch', (req, res) => {
    UserService.createMatch(req.body.name).then(match => res.status(200).send(match))
        .catch(err => res.status(err.code ? err.code : 500).send(err.message + " : There was a problem adding the information to the database."));
});

// CREATES A NEW STAT
router.post('/playerStat', (req, res) => {
    if (!req.body.player || req.body.player.trim().length === 0) return res.status(404).send("No user found.");
    else if (!req.body.match || req.body.match.trim().length === 0) return res.status(404).send("No Match found.");
    UserService.createStat(req.body.match, req.body.player, req.body.kills, req.body.score)
        .then(playerStats => res.status(200).send(playerStats))
        .catch(err => res.status(err.code ? err.code : 500).send(err.message + " : There was a problem finding the player stats."));

});

// RETURNS ALL STATS  IN THE DATABASE FOR A PLAYER
router.get('/playerStats/:id', function (req, res) {
    UserService.getPlayerStats(req.params.id).then((
        playersStats) => res.status(200).send(playersStats.map(item => {
            const obj = item.toObject();
            delete obj.rank;
            return obj;
        })))
        .catch(err => res.status(err.code ? err.code : 500).send(err.message + " : There was a problem finding the player Stats."));
});

// RETURNS STATS FOR A MATCH WITHIN THE TIME
router.get('/playerStats', function (req, res) {
    UserService.getStatsForMatch(req.query.matchName, req.query.timeInMillis).then((
        playersStats) => res.status(200).send(playersStats.map(item => {
            const obj = item.toObject();
            delete obj.rank;
            return obj;
        })))
        .catch(err => res.status(err.code ? err.code : 500).send(err.message + " : There was a problem finding the match Stats."));
});

// RETURNS ALL THE PLAYERS IN THE DATABASE
router.get('/players', function (req, res) {
    UserService.getAllPlayers().then(players => res.status(200).send(players))
        .catch(err => res.status(err.code ? err.code : 500).send(err.message + " : There was a problem finding the players."));

});

// RETURNS ALL THE MATCHES IN THE DATABASE
router.get('/matches', function (req, res) {
    UserService.findAllMatches().then(matches => {
        res.status(200).send(matches);
    }).catch(err => res.status(err.code ? err.code : 500).send(err.message + " : There was a problem finding the matches."));
});

// RETURNS THE LEADERBOARD FOR MATCH AND TIME LIMIT
router.get('/LeaderBoard', function (req, res) {
    UserService.getMatchLeaderboard(req.query.matchName, req.query.timeInMillis)
        .then(playerStats => res.status(200).send(playerStats))
        .catch(err => res.status(err.code ? err.code : 500).send(err.message + " There was a problem finding the Leaderboard."));;
});

// RETURNS ADJACENT SCORES FOR THE USER
router.get('/LeaderBoard/:id', function (req, res) {
    UserService.getAdjacendScoresForUser(req.params.id, req.query.matchName)
        .then(playerStats => res.status(200).send(playerStats))
        .catch(err => res.status(err.code ? err.code : 500).send(err.message + " There was a problem finding the Leaderboard."));;
});





module.exports = router;