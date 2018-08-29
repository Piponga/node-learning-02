const express = require('express');

const app = express();

const port = 3000;


require('./app/routes')(app);

app.listen(port, (err) => {
    if (err) {
        return console.log('error in request', err);
    }
    console.log(`server is listening on ${port}`);
});