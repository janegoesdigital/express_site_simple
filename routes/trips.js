var express = require('express'),
    router = express.Router(),
    mongoose = require('mongoose'), //mongo connection
    bodyParser = require('body-parser'), //parses information from POST
    methodOverride = require('method-override'); //used to manipulate POST

//Any requests to this controller must pass through this 'use' function
//Copy and pasted from method-override
router.use(bodyParser.urlencoded({ extended: true }));
router.use(methodOverride(function(req, res){
      if (req.body && typeof req.body === 'object' && '_method' in req.body) {
        // look in urlencoded POST bodies and delete it
        var method = req.body._method;
        delete req.body._method;
        return method;
      }
}));

//build the REST operations at the base for trips
//this will be accessible from http://127.0.0.1:3000/trips if the default route for / is left unchanged
router.route('/')
    //GET all trips
    .get(function(req, res, next) {
        //retrieve all trips from Monogo
        mongoose.model('Trip').find({}, function (err, trips) {
              if (err) {
                  return console.error(err);
              } else {
                  //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                  res.format({
                      //HTML response will render the index.jade file in the views/trips folder. We are also setting "trips" to be an accessible variable in our jade view
                    html: function(){
                        res.render('trips/index', {
                              title: 'Betty - here are all my Trips',
                              "trips" : trips
                          });
                    },
                    //JSON response will show all trips in JSON format
                    json: function(){
                        res.json(trips);
                    }
                });
              }
        });
    })
    //POST a new trip
    .post(function(req, res) {
        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms
        var start = req.body.start;
        var to = req.body.to;
        var travelDate = req.body.travelDate;
        var travelTime = req.body.travelTime;
        var booked = req.body.booked;
        var bookedThrough = req.body.bookedThrough;
        var cost = req.body.cost;
        var currency = req.body.currency;
        var completed = req.body.completed;
        //call the create function for our database
        mongoose.model('Trip').create({
         start: start,
         to: to,
         travelTime: travelTime,
         booked: booked,
         bookedThrough: bookedThrough,
         cost: cost,
         currency: currency,
         completed: completed
        }, function (err, trip) {
              if (err) {
                  res.send("There was a problem adding the information to the database.");
              } else {
                  //Trip has been created
                  console.log('POST creating new trip: ' + trip);
                  res.format({
                      //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function(){
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("trips");
                        // And forward to success page
                        res.redirect("/trips");
                    },
                    //JSON response will show the newly created trip
                    json: function(){
                        res.json(trip);
                    }
                });
              }
        });
    });

/* GET New Trip page. */
router.get('/new', function(req, res) {
    res.render('trips/new', { title: 'Add New Trip' });
});

// route middleware to validate :id
router.param('id', function(req, res, next, id) {
    //console.log('validating ' + id + ' exists');
    //find the ID in the Database
    mongoose.model('Trip').findById(id, function (err, trip) {
        //if it isn't found, we are going to repond with 404
        if (err) {
            console.log(id + ' was not found');
            res.status(404);
            var err = new Error('Not Found');
            err.status = 404;
            res.format({
                html: function(){
                    next(err);
                 },
                json: function(){
                       res.json({message : err.status  + ' ' + err});
                 }
            });
        //if it is found we continue on
        } else {
            //uncomment this next line if you want to see every JSON document response for every GET/PUT/DELETE call
            //console.log(trip);
            // once validation is done save the new item in the req
            req.id = id;
            // go to the next thing
            next();
        }
    });
});

router.route('/:id')
  .get(function(req, res) {
    mongoose.model('Trip').findById(req.id, function (err, trip) {
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
        console.log('GET Retrieving ID: ' + trip._id);
        // var tripTravelDate = trip.travelDate.toISOString();
        // tripTravelDate = tripTravelDate.substring(0, tripTravelDate.indexOf('T'))
        res.format({
          html: function(){
              res.render('trips/show', {
                // "tripTravel" : tripTravelDate,
                "trip" : trip
              });
          },
          json: function(){
              res.json(trip);
          }
        });
      }
    });
  });

router.route('/:id/edit')
	//GET the individual trip by Mongo ID
	.get(function(req, res) {
	    //search for the trip within Mongo
	    mongoose.model('Trip').findById(req.id, function (err, trip) {
	        if (err) {
	            console.log('GET Error: There was a problem retrieving: ' + err);
	        } else {
	            //Return the trip
	            console.log('GET Retrieving ID: ' + trip._id);
              // var tripTravelDate = trip.travelDate.toISOString();
              // tripTravelDate = tripTravelDate.substring(0, tripTravelDate.indexOf('T'));
	            res.format({
	                //HTML response will render the 'edit.jade' template
	                html: function(){
	                       res.render('trips/edit', {
	                          title: 'Trip ' + trip._id,
                            // "tripTravelDate" : tripTravelDate,
	                          "trip" : trip
	                      });
	                 },
	                 //JSON response will return the JSON output
	                json: function(){
	                       res.json(trip);
	                 }
	            });
	        }
	    });
	})
	//PUT to update a trip by ID
	.put(function(req, res) {
	    // Get our REST or form values. These rely on the "name" attributes
     var start = req.body.start;
     var to = req.body.to;
     var travelDate = req.body.travelDate;
     var travelTime = req.body.travelTime;
     var booked = req.body.booked;
     var bookedThrough = req.body.bookedThrough;
     var cost = req.body.cost;
     var currency = req.body.currency;
     var completed = req.body.completed;

	    //find the document by ID
	    mongoose.model('Trip').findById(req.id, function (err, trip) {
	        //update it
	        trip.update({
          start: start,
          to: to,
          travelDate: travelDate,
          travelTime: travelTime,
          booked: booked,
          bookedThrough: bookedThrough,
          cost: cost,
          currency: currency,
          completed: completed
	        }, function (err, tripID) {
	          if (err) {
	              res.send("There was a problem updating the information to the database: " + err);
	          }
	          else {
	                  //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
	                  res.format({
	                      html: function(){
	                           res.redirect("/trips/" + trip._id);
	                     },
	                     //JSON responds showing the updated values
	                    json: function(){
	                           res.json(trip);
	                     }
	                  });
	           }
	        })
	    });
	})
	//DELETE a Trip by ID
	.delete(function (req, res){
	    //find trip by ID
	    mongoose.model('Trip').findById(req.id, function (err, trip) {
	        if (err) {
	            return console.error(err);
	        } else {
	            //remove it from Mongo
	            trip.remove(function (err, trip) {
	                if (err) {
	                    return console.error(err);
	                } else {
	                    //Returning success messages saying it was deleted
	                    console.log('DELETE removing ID: ' + trip._id);
	                    res.format({
	                        //HTML returns us back to the main page, or you can create a success page
	                          html: function(){
	                               res.redirect("/trips");
	                         },
	                         //JSON returns the item with the message that is has been deleted
	                        json: function(){
	                               res.json({message : 'deleted',
	                                   item : trip
	                               });
	                         }
	                      });
	                }
	            });
	        }
	    });
	});

module.exports = router;
