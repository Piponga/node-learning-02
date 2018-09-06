const User = require('../../models/user').User;
const async = require('async');

module.exports.get = function (req, res) {
    res.send('LOGIN GET request');
};

exports.post = function (req, res) {
    const username = req.body.username;
    const password = req.body.password;

    User.authorize(username, password, (err, user) => {
        if (err) throw err;

        req.session.user = user._id;
        res.send({});
        // res.json(req.session.user);
    });
};