//This defines the packages we need

var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');

//This makes sure the request get passed through these functions
router.use(bodyParser.urlencoded({extended: true}));
router.use(methodOverride(function(req,res){
 if (req.body && typeof req.body === 'object' && '_method' in req.body){
 //look in urlencoded POST bodies and delete it
 var method = req.body._method;
 delete req.body._method;
 return method;
}
}));

//GET - for getting all the trips from the database to display it - and POST for creating a new trips

router.route('/')
 //get all trips from Mongodb
 .get(function(req,res,next){
  mongoose.model('Trip');

});

//GET for getting the trips from DB and POST for adding new trips

router.route('/')
 .get(function(req,res,next){
  mongoose.model('Trip').find({}, function( err, trips){
   if(err) {
     return console.error(err);
    } else {
      res.format({
       html: function(){
        res.render('trips/index', {
         title: 'All my trips',
         "trips": trips
          });
           },
        json: function(){
          res.json(trips);
      }
    });
    }
});
})
.post(function(req,res){
 //GET values from POST request.  These rely on the 'name attributes' in the forms
  var start = req.body.start;
  var to = req.body.to;
  var travelTime = req.body.travelTime;
  var booked = req.body.booked;
  var bookedThrough = req.body.bookedThrough;
  var cost = req.body.cost;
  var currency = req.body.currency;
  var completed = req.body.completed;
//call the create function of the BD
  mongoose.model('Trip').create({
 //call the create function of the DB
   start: start,
   to: to,
   travelTime: travelTime,
   booked: booked,
   bookedThrough: bookedThrough,
   cost: cost,
   currency: currency,
   completed: completed
   }, function(err, trip) {
    if(err) {
     res.send("Oh no!  There was a problem adding the information to the database!!!!");
    } else {
     console.log('POST creating new trip: ' + trip);
      res.format({
       //HTML function - set locaction and redirect back to home page
      html: function(){
         //if it worked, set the header to show trips
        res.location("trips");
        //redirect back to the trips page
        res.redirect("/trips");
         },
      json: function(){
       res.json(trip);
       }
     });
    }
   });
  });

//GET NEW trip page

router.get('/new', function(req,res){
  res.render('trips/new', {title: 'Add a new trip Betty!'});
});


// route middleware to validate :id
router.param('id', function(req, res, next, id) {
    //console.log('validating ' + id + ' exists');
    //find the ID in the Database
    mongoose.model('Trip').findById(id, function (err, trip) {
        //if it isn't found, we are going to repond with 404
        if (err) {
            console.log(id + ' grrr - it was not found');
            res.status(404);
            var err = new Error('Oh no - not found');
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
            console.log(trip);
            // once validation is done save the new item in the req
            req.id = id;
            // go to the next thing
            next();
        }
    });
});

//GET an individual trip from Mongo to display it - willl be wired up to show.jade

router.route('/:id')
  .get(function(req, res) {
    mongoose.model('Trip').findById(req.id, function (err, trip) {
      if (err) {
        console.log('Oh no! There was a GET Error: There was a problem retrieving: ' + err);
      } else {
        console.log('Betty, the GET Retrieving ID: ' + trip._id);
        // var tripstart = trip.start.toISOString();
        var tripstart = tripstart.substring(0, tripstart.indexOf('T'));
        res.format({
          html: function(){
              res.render('trips/show', {
                "tripstart" : tripstart,
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


//EDIT and update - will be hooked up to edit.jade

//GET the individual trip by Mongo ID
router.get('/:id/edit', function(req, res) {
    //search for the trip within Mongo
    mongoose.model('Trip').findById(req.id, function (err, trip) {
        if (err) {
            console.log('Oh no! Do not panic - there was a GET Error: There was a problem retrieving: ' + err);
        } else {
            //Return the trip
            console.log('Betty - GET Retrieving ID: ' + trip._id);
            //format the date properly for the value to show correctly in our edit form
          // var tripstart = trip.start.toISOString();
          var tripstart = tripstart.substring(0, tripstart.indexOf('T'));
            res.format({
                //HTML response will render the 'edit.jade' template
                html: function(){
                       res.render('trips/edit', {
                          title: 'Trip' + trip._id,
                        "tripstart" : tripstart,
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
});

//Put ie update

router.put('/:id/edit', function(req, res) {
    // Get our REST or form values. These rely on the "name" attributes
    var start = req.body.start;
    var to = req.body.to;
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
             travelTime: travelTime,
             booked: booked,
             bookedThrough: bookedThrough,
             cost: cost,
             currency: currency,
             completed: completed
            }, function (err, tripID) {
              if (err) {
                  res.send("Betty - there was a problem updating the information to the database: " + err);
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
            });
        });
});

//DELETE a Trip by ID
router.delete('/:id/edit', function (req, res){
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
                    console.log('Betty is doing a DELETE removing ID: ' + trip._id);
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

//export all routes

module.exports = router;
