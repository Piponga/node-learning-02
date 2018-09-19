const path = require('path');
const config = require('../../../config');

module.exports.get = function (req, res) {
    const iframeSrc = process.env.NODE_ENV !== 'production' ? 'http://localhost:8081/' : config.web.iframeSrc;
    res.render('home', {iframeSrc: iframeSrc});
};
