const mongoose = require('mongoose');
const config = require('../../config');

mongoose.connect(config.mongoose.uri, config.mongoose.options);
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

module.exports = mongoose;