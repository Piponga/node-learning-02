const User = require('../../models/user').User;
const async = require('async');
const UIDGenerator = require('uid-generator');
const uidgen = new UIDGenerator();
const guestsUID = require('../../middleware/guets').guestsUID;

module.exports.get = function (req, res) {
    res.send('LOGIN GET request');
};

exports.post = function (req, res) {
    const guestname = req.body.guestname;

    uidgen.generate((err, uid) => {
        if (err) throw err;
        guestsUID[uid] = guestname;

        res.send(uid);
    });

    uidgen.generateSync();

    // const username = req.body.username;
    // const password = req.body.password;

    // User.authorize(username, password, (err, user) => {
    //     if (err) throw err;
    //
    //     req.session.user = user._id;
    //     res.send({});
    //     // res.json(req.session.user);
    // });
};