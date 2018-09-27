const path = require('path');
const config = require('../../../config');

module.exports.get = function (req, res) {
    // const iframeSrc = process.env.NODE_ENV !== 'production' ? 'http://localhost:8081/' : config.web.iframeSrc;
    // res.render('home', {iframeSrc: iframeSrc});

    res.type('json');
    res.send(req.user);
};

exports.post = function (req, res) {
    // const iframeSrc = process.env.NODE_ENV !== 'production' ? 'http://localhost:8081/' : config.web.iframeSrc;
    // res.render('home', {iframeSrc: iframeSrc});
console.log(8888)
    res.type('json');
    res.send(req.user);
};
