const mongoose = require('mongoose');
const config = require('../../config');
const databaseUrl = process.env.DATABASE_URL || config.mongoose.uri;

mongoose.connect(databaseUrl, config.mongoose.options);
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

module.exports = mongoose;