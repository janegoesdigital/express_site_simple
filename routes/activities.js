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

//build the REST operations at the base for activities
//this will be accessible from http://127.0.0.1:3000/activities if the default route for / is left unchanged
router.route('/')
    //GET all activities
    .get(function(req, res, next) {
        //retrieve all activities from Monogo
        mongoose.model('Activity').find({}, function (err, activities) {
              if (err) {
                  return console.error(err);
              } else {
                  //respond to both HTML and JSON. JSON responses require 'Accept: application/json;' in the Request Header
                  res.format({
                      //HTML response will render the index.jade file in the views/activities folder. We are also setting "activities" to be an accessible variable in our jade view
                    html: function(){
                        res.render('activities/index', {
                              title: 'Betty - really here are all my Activities',
                              "activities" : activity
                          });
                    },
                    //JSON response will show all activities in JSON format
                    json: function(){
                        res.json(activities);
                    }
                });
              }
        });
    })
    //POST a new activity
    .post(function(req, res) {
        // Get values from POST request. These can be done through forms or REST calls. These rely on the "name" attributes for forms

        var city = req.body.city;
        var name = req.body.name;
        var description = req.body.description;
        var cost = req.body.cost;
        var doIt = req.body.doIt;
        var booked = req.body.booked;
        var date = req.body.date;
        var comments = req.body.comments;
        var completed = req.body.completed;

        //call the create function for our database
        mongoose.model('Activity').create({
         city: city,
         name: name,
         description: description,
         cost: cost,
         doIt: doIt,
         booked: booked,
         date: date,
         comments: comments,
         completed: completed

        }, function (err, activity) {
              if (err) {
                  res.send("There was a problem adding the information to the database.");
              } else {
                  //Activity has been created
                  console.log('POST creating new activity: ' + activity);
                  res.format({
                      //HTML response will set the location and redirect back to the home page. You could also create a 'success' page if that's your thing
                    html: function(){
                        // If it worked, set the header so the address bar doesn't still say /adduser
                        res.location("activities");
                        // And forward to success page
                        res.redirect("/activities");
                    },
                    //JSON response will show the newly created activity
                    json: function(){
                        res.json(activity);
                    }
                });
              }
        });
    });

/* GET New Activity page. */
router.get('/new', function(req, res) {
    res.render('activities/new', { title: 'Woo hoo.  Let us add New Activity' });
});

// route middleware to validate :id
router.param('id', function(req, res, next, id) {
    console.log('validating ' + id + ' exists');
    //find the ID in the Database
    mongoose.model('Activity').findById(id, function (err, activity) {
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
            console.log(activity);
            // once validation is done save the new item in the req
            req.id = id;
            // go to the next thing
            next();
        }
    });
});

router.route('/:id')
  .get(function(req, res) {
    mongoose.model('Activity').findById(req.id, function (err, activity) {
      if (err) {
        console.log('GET Error: There was a problem retrieving: ' + err);
      } else {
        console.log('GET Retrieving ID: ' + activity._id);
        // var tripTravelDate = trip.travelDate.toISOString();
        // tripTravelDate = tripTravelDate.substring(0, tripTravelDate.indexOf('T'))
        res.format({
          html: function(){
              res.render('activities/show', {
                // "tripTravel" : tripTravelDate,
                "activity" : activity
              });
          },
          json: function(){
              res.json(activity);
          }
        });
      }
    });
  });


router.route('/:id/edit')
	//GET the individual activity by Mongo ID
	.get(function(req, res) {
	    //search for the activity within Mongo
	    mongoose.model('Activity').findById(req.id, function (err, activity) {
	        if (err) {
	            console.log('GET Error: There was a problem retrieving: ' + err);
	        } else {
	            //Return the activity
	            console.log('GET Retrieving ID: ' + activity._id);
	            res.format({
	                //HTML response will render the 'edit.jade' template
	                html: function(){
	                       res.render('activities/edit', {
	                          title: 'Activity ' + activity._id,
	                          "activity" : activity
	                      });
	                 },
	                 //JSON response will return the JSON output
	                json: function(){
	                       res.json(activity);
	                 }
	            });
	        }
	    });
	})
	//PUT to update a activity by ID
	.put(function(req, res) {
	    // Get our REST or form values. These rely on the "name" attributes
     var city = req.body.city;
     var name = req.body.name;
     var description = req.body.description;
     var cost = req.body.cost;
     var doIt = req.body.doIt;
     var booked = req.body.booked;
     var date = req.body.date;
     var comments = req.body.comments;
     var completed = req.body.completed;

	    //find the document by ID
	    mongoose.model('Activity').findById(req.id, function (err, activity) {
	        //update it
	        activity.update({
          city: city,
          name: name,
          description: description,
          cost: cost,
          doIt: doIt,
          booked: booked,
          date: date,
          comments: comments,
          completed: completed

	        }, function (err, activityID) {
	          if (err) {
	              res.send("There was a problem updating the information to the database: " + err);
	          }
	          else {
	                  //HTML responds by going back to the page or you can be fancy and create a new view that shows a success page.
	                  res.format({
	                      html: function(){
	                           res.redirect("/activities/" + activity._id);
	                     },
	                     //JSON responds showing the updated values
	                    json: function(){
	                           res.json(activity);
	                     }
	                  });
	           }
	        });
	    });
	})
	//DELETE a Activity by ID
	.delete(function (req, res){
	    //find activity by ID
	    mongoose.model('Activity').findById(req.id, function (err, activity) {
	        if (err) {
	            return console.error(err);
	        } else {
	            //remove it from Mongo
	            activity.remove(function (err, activity) {
	                if (err) {
	                    return console.error(err);
	                } else {
	                    //Returning success messages saying it was deleted
	                    console.log('DELETE removing ID: ' + activity._id);
	                    res.format({
	                        //HTML returns us back to the main page, or you can create a success page
	                          html: function(){
	                               res.redirect("/activities");
	                         },
	                         //JSON returns the item with the message that is has been deleted
	                        json: function(){
	                               res.json({message : 'deleted',
	                                   item : activity
	                               });
	                         }
	                      });
	                }
	            });
	        }
	    });
	});

module.exports = router;
