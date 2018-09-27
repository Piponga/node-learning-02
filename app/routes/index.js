// const checkAuth = require('../middleware/checkAuth');

module.exports = function (app) {

    app.get('/', require('./home/home').get);
    app.post('/', require('./home/home').post);

    app.get('/login', require('./login/login').get);
    app.post('/login', require('./login/login').post);

    app.post('/logout', require('./login/logout').post);

    // app.get('/chat', checkAuth, require('./chat').get);
    // app.get('/chat', require('./chat').get);
};
