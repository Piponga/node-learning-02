
module.exports = function (app) {
    app.get('/', require('./home').get);

    app.post('./login', require('./login/login').post);
    app.post('./logout', require('./login/logout').post);
};
