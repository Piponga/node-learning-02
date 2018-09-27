const User = require('../models/user').User;
const Rnd = require('../lib/Rnd');
const guestName = require('./guestName');



module.exports = function (req, res, next) {
    // let user = {
    //     username: 'Guest' + Rnd.integer(100000)
    // };
    //
    // req.user = res.locals.user = user;
    // next();

    req.user = res.locals.user = null;

    if (!req.session.user) {
        let user = {
            username: guestName()
        };

        req.user = res.locals.user = user;
        return next();
    }

    User.findById(req.session.user, (err, user) => {
        if (err) throw next(err);

        req.user = res.locals.user = user;
        next();
    });
};