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
  created_at: Date,
  updated_at: Date
});

/* Jokaiseen tietokannan päivitykseen liitetään aikaleima. */

gadgetSchema.pre('save', function(next) {
  var currentDate = new Date();
  this.updated_at = currentDate;
  if (!this.created_at)
    this.created_at = currentDate;
  next();
});

/* Omat metodit on määriteltävä ennen mongoose.model():n kutsumista! */

/*
gadgetSchema.methods.doSomething = function() {

};
*/

module.exports = mongoose.model('Gadget', gadgetSchema);