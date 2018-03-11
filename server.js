var express = require('express');
var app = express();
var port = 8888;
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
var path = require('path')



app.use(express.static(path.join(__dirname, 'Style')));

/*Body parser*/
app.use(bodyParser.urlencoded({
  	extended: true
}));
app.use('/js', express.static(__dirname + '/js'));

/*Initialize sessions*/
app.use(cookieParser());
app.use(bodyParser());
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

/*Initialize Passport*/
app.use(passport.initialize());
app.use(passport.session());

/*Database connection - MongoDB*/

//Created from the command earlier. Ensure this is done on the first_db instance
var username = 'admin';
var password = '123456';

var dbHost = 'localhost';
var dbPort = '27017';
var database = 'first_db';

var url = 'mongodb://' + username + ':' + password + '@' + dbHost + ':' + dbPort + '/' + database;
console.log('mongodb connection = ' + url);

mongoose.connect(url, function(err) {
    if(err) {
        console.log('connection error: ', err);
    } else {
        console.log('connection successful');
    }
});

/***********
Declare all models here
***********/

//User model
var UserSchema = new mongoose.Schema({
	  username: String,
	  password: String
});

var User = mongoose.model('user', UserSchema);

//Item model
var ItemSchema = new mongoose.Schema({
	  owner: String,
	  details: String,
	  post_time: String,
	  edit_time: String,
	  isPublic: Boolean
});

var Item = mongoose.model('item', ItemSchema);




/***********
All routes go below
***********/

var bcrypt = require('bcrypt-nodejs'); //Should be placed on top

app.get('/', function (req, res, next) {
    res.sendFile( __dirname + '/index.html');
});

app.get('/register', function (req, res, next) {
    res.sendFile( __dirname + '/register.html');
});

app.get('/home', loggedIn, function (req, res, next) {
    res.sendFile( __dirname + '/home.html');
});

app.get('/user', loggedIn, function (req, res, next) {
    User.findById({ _id: req.user._id }, function(err, user) {
    	return res.json(user);
  	});
});

app.get('/logout', function (req, res, next) {
    req.logout();
  	res.redirect('/');
});

app.post('/login', passport.authenticate('local'),
    function(req, res) {
        res.redirect('/home');
});

/**********
The login logic where it passes here if it reaches passport.authenticate
**********/

passport.use(new LocalStrategy(
	function(username, password, done) {
		User.findOne({ username: username }, function (err, user) {
	        if(user !== null) {
	            var isPasswordCorrect = bcrypt.compareSync(password, user.password);
	            if(isPasswordCorrect) {
	            	console.log("Username and password correct!");
	            	return done(null, user);
	            } else {
	            	console.log("Password incorrect!");
	            	return done(null, false);
	            }
	        } else {
	        	console.log("Username does not exist!");
	            return done(null, false);
	        }
    	});
	}
));

/**********
Serialize and Deserialize here for passport.authenticate
**********/

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    User.findById({_id: user._id}, function(err, user) {
    	done(err, user);
  	});
});


app.post('/register', function (req, res, next) {
	var password = bcrypt.hashSync(req.body.password);
	req.body.password = password;

    User.create(req.body, function(err, saved) {
        if(err) {
            console.log(err);
            res.json({ message : err });
        } else {
            res.json({ message : "User successfully registered!"});
        }
    });
});


app.post('/add', function (req, res, next) {
	var item = new Item();
	item.details = req.body.details;
	item.isPublic = req.body.isPublic;
	item.post_time = getDateTime();
	item.owner = req.user.username;

    Item.create(item, function(err, saved) {
        if(err) {
            console.log(err);
            return res.json({ message : err });
        } else {
            return res.json({ message : "item successfully registered!", item: saved});
        }
    });
});

app.post('/edit', loggedIn, function (req, res, next) {
    Item.findById({ _id: req.body._id }, function(err, item) {
    	if(err) {
    		console.log(err);
            return res.json({ message : err });
    	} else {
    		//Modify new values here
		    item.details = req.body.details;
		    item.isPublic = req.body.isPublic;
		    item.edit_time = getDateTime();

		    //Save the new values
    		item.save(function(err){
    			if(err) {
		    		console.log(err);
		            return res.json({ message : err });
		    	} else {
		    		return res.json({ message : "Item successfully edited!" });
		    	}
    		});
    	}
  	});
});

app.post('/delete', loggedIn, function (req, res, next) {
    Item.findOneAndRemove({ _id: req.body._id }, function(err, item) {
    	if(err) {
    		console.log(err);
            return res.json({ message : err });
    	} else {
    		return res.json({ message : "Item successfully deleted!"});
    	}
  	});
});

app.get('/items', loggedIn, function (req, res, next) {
    Item.find({ owner: req.user.username }, function(err, item) {
    	return res.json(item);
  	});
});

app.get('/items/public', function (req, res, next) {
    Item.find({ isPublic: "true" }, function(err, item) {
    	return res.json(item);
  	});
});


function loggedIn(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/');
    }
}

function getDateTime() {

    var date = new Date();

    var hour = date.getHours();
    hour = (hour < 10 ? "0" : "") + hour;

    var min  = date.getMinutes();
    min = (min < 10 ? "0" : "") + min;

    var sec  = date.getSeconds();
    sec = (sec < 10 ? "0" : "") + sec;

    var year = date.getFullYear();

    var month = date.getMonth() + 1;
    month = (month < 10 ? "0" : "") + month;

    var day  = date.getDate();
    day = (day < 10 ? "0" : "") + day;

    return year + ":" + month + ":" + day + " - " + hour + ":" + min + ":" + sec;

}

app.listen(port, '0.0.0.0', function() {
    console.log('Server running at port ' + port);
});


//This is not part of this exercise, it is mailchimp integration 
var request = require('superagent');
var mailchimpInstance   = 'us15',
    listUniqueId        = '1917b1894f',
    mailchimpApiKey     = 'de178ecaf4c367d43789cf3fc4ec3e11-us15';

app.post('/sig', function (req, res) {
    request
        .post('https://' + mailchimpInstance + '.api.mailchimp.com/3.0/lists/' + listUniqueId + '/members/')
        .set('Content-Type', 'application/json;charset=utf-8')
        .set('Authorization', 'Basic ' + new Buffer('any:' + mailchimpApiKey ).toString('base64'))
        .send({
          'email_address': 'si@gmail.com',
          'status': 'subscribed',
          'merge_fields': {
            'FNAME': 'ss',
            'LNAME': 'sdsd'
          }
        })
            .end(function(err, response) {
              if (response.status < 300 || (response.status === 400 && response.body.title === "Member Exists")) {
				res.send('Signed Up!');
				console.log('dfdf')
              } else {
               console.log('Sign Up Failed :(');
              }
          });
});