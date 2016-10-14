var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gadgetUserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  passwordSHA256: { type: String, required: true },
});

module.exports = mongoose.model('GadgetUser', gadgetUserSchema);
