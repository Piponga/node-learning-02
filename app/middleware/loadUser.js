const User = require('../models/user').User;
const Rnd = require('../lib/Rnd');

module.exports = function (req, res, next) {
    // req.user = res.locals.user = 'Guest' + Rnd.integer(100000);
    // next();

    req.user = res.locals.user = null;

    if (!req.session.user) return next();

    User.findById(req.session.user, (err, user) => {
        if (err) throw next(err);

        req.user = res.locals.user = user;
        next();
    });
};