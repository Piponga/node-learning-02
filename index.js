const express = require('express');

const app = express();

const port = 8080;

app.get('/', (req, res) => {
    res.send('Express simple response');
});

app.listen(port, (err) => {
    if (err) {
        return console.log('error in request', err);
    }
    console.log(`server is listening on ${port}`);
});