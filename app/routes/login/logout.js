exports.post = function (req, res) {
    const sid = req.session.id;
    const io = req.app.get('io');
    console.log('logout request');

    req.session.destroy(function(err) {
        console.log(444);
        io.sockets._events.sessreload(sid);
        if (err) throw next(err);

        res.redirect('/');
    });

    // req.session.destroy();
    // res.redirect('/');
};