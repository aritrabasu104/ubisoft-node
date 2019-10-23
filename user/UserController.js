const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
const User = require('./models/User');
const Player = require('./models/Player');
const Match = require('./models/Match');
const PlayerStat = require('./models/PlayerStat');

// CREATES A NEW USER
router.post('/createPlayer', (req, res) => {
    Player.create({
        playerName: req.body.name,
    }).then(player => res.status(200).send(player))
        .catch(err => res.status(500).send(err.message + " : There was a problem adding the information to the database."));
});
router.post('/createMatch', (req, res) => {
    Match.create({
        matchName: req.body.name,
    }).then(match => res.status(200).send(match))
        .catch(err => res.status(500).send(err.message + " : There was a problem adding the information to the database."));
});

router.post('/playerStat', (req, res) => {
    //Player.findById(req.body.player).then(player => {
    if (!req.body.player || req.body.player.trim().length === 0) return res.status(404).send("No user found.");
    else if (!req.body.match || req.body.match.trim().length === 0) return res.status(404).send("No Match found.");
    Match.find({ matchName: req.body.match }, (err, matches) => {
        if (err) return res.status(500).send(err.message + " : There was a problem finding the match.");
        if (matches.length === 0) return res.status(404).send("Invalid match name provided.");
        const currentMatch = matches[0];
        PlayerStat.find({
            player: ObjectId(req.body.player),
            match: currentMatch
        }, (err, playerStats) => {
            const playerStatNew = {
                player: ObjectId(req.body.player),
                match: currentMatch,
                kills: req.body.kills,
                score: req.body.score,
                statTime: new Date().getTime()
            };
            if (err) return res.status(500).send(err.message + " : There was a problem finding the player stats.");
            if (playerStats.length === 0) {
                createPlayerAndUpdateRanks(playerStatNew, res, currentMatch);
            } else {
                const playerStatOld = playerStats[0];
                if (playerStatOld.score <= playerStatNew.score) {
                    PlayerStat.findByIdAndRemove(playerStatOld.id).then(() => {
                        createPlayerAndUpdateRanks(playerStatNew, res, currentMatch);
                    },
                        (err) => res.status(500).send(err.message + " : There was a problem finding the player stats."));
                } else
                    res.status(200).send(playerStats);
            }
        });

    });
    //},
    // err => res.status(500).send("There was a problem finding the user."))
});

const createPlayerAndUpdateRanks = function (playerStatNew, res, currentMatch) {
    PlayerStat.create(playerStatNew,
        (err, playerStat) => {
            if (err) return res.status(500).send(err.message + " : There was a problem adding the information to the database.");
            PlayerStat.find({ match: currentMatch }, (err, playerStats) => {
                if (err) return res.status(500).send(err.message + " : There was a problem adding the information to the database.");
                let i = 0;
                playerStats.sort((item1, item2) => {
                    return item2.score - item1.score;
                }).forEach(item => {
                    item.rank = ++i;
                    item.save();
                })
                res.status(200).send(playerStats);
            });
        });
}

// RETURNS ALL STATS  IN THE DATABASE FOR A PLAYER
router.get('/playerStats/:id', function (req, res) {
    PlayerStat.find({ player: ObjectId(req.params.id) }).exec().then((
        playersStats) => res.status(200).send(playersStats))
        .catch(err => res.status(500).send(err.message + " : There was a problem finding the playersStats."));
});


// RETURNS ALL THE PLAYERS IN THE DATABASE
router.get('/players', function (req, res) {

    Player.find({}, function (err, players) {
        if (err) return res.status(500).send("There was a problem finding the players.");
        res.status(200).send(players);
    });
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
    const timeInMillis = req.query.timeInMillis;
    Match.find({ matchName: req.query.matchName }, function (err, matches) {
        if (err) return res.status(500).send("There was a problem finding the matches.");
        if (matches.length === 0) return res.status(404).send("Invalid match name provided.");
        PlayerStat.find({ match: matches[0] }, function (err, playerStats) {
            if (err) return res.status(500).send("There was a problem finding the stats.");
            const result = playerStats.filter(item => item.statTime > timeInMillis).sort((item1, item2) => item2.score - item1.score).slice(0, 99)
            res.status(200).send(result);
        });
    });


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


// GETS A SINGLE USER FROM THE DATABASE
router.get('/:id', function (req, res) {
    User.findById(req.params.id, function (err, user) {
        if (err) return res.status(500).send("There was a problem finding the user.");
        if (!user) return res.status(404).send("No user found.");
        res.status(200).send(user);
    });
});

// DELETES A USER FROM THE DATABASE
router.delete('/:id', function (req, res) {
    User.findByIdAndRemove(req.params.id, function (err, user) {
        if (err) return res.status(500).send("There was a problem deleting the user.");
        res.status(200).send("User: " + user.name + " was deleted.");
    });
});

// UPDATES A SINGLE USER IN THE DATABASE
router.put('/:id', function (req, res) {
    User.findByIdAndUpdate(req.params.id, req.body, { new: true }, function (err, user) {
        if (err) return res.status(500).send("There was a problem updating the user.");
        res.status(200).send(user);
    });
});


module.exports = router;