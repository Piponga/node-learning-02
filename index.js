const http = require('http');
const port = 8080;

const requestHandler = (req, res) => {
    console.log(req.uri);
    res.end('Simple HTTP Server response');
};

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
   if (err) {
       return console.log('error', err);
   }
    console.log(`server is listening on ${port}`);
});