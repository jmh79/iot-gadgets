var mongoose = require('mongoose');
var Schema = mongoose.Schema;

/* https://scotch.io/tutorials/using-mongoosejs-in-node-js-and-mongodb-applications */

var gadgetSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    lat: Number,  /* negative = south, positive = north */
    lng: Number   /* negative = west, positive = east */
  },
  extra: { },
  created_at: Date,
  updated_at: Date
});

module.exports = mongoose.model('Gadget', gadgetSchema);
