var mongoose = require('mongoose');
var activitySchema = new mongoose.Schema({
 city: String,
 name: String,
 description: String,
 cost: Number,
 doIt: Boolean,
 booked: Boolean,
 date: Date,
 completed: Boolean,
 comments: String

});

mongoose.model('Activity', activitySchema);
