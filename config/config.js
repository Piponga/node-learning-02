module.exports = {
  port: 5000,
  mongoose: {
    uri: 'mongodb://piponga:q1w2e3r4t5y6@ds020938.mlab.com:20938/test_db01',
    // uri: 'mongodb://localhost/chat',
    options: {
      keepAlive: 1,
      useNewUrlParser: true
    }
  },
  session: {
    secret: 'Secret1234',
    key: 'sid',
    cookie: {
      path: '/',
      httpOnly: true,
      maxAge: null
    }
  },
  web: {
    iframeSrc: 'https://piponga.com/tmp/nodejs/roomwars/'
  }
};