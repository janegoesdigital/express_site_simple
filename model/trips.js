var mongoose = require('mongoose');
var tripSchema = new mongoose.Schema({
 start: String,
 to: String,
 // travelTime: Number,
 by: String,
 travelDate: Date,
 booked: Boolean,
 // bookedThrough: String,
 // cost: Number,
 // currency: String,
 // completed: Boolean
});

mongoose.model('Trip', tripSchema);
