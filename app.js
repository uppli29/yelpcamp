var app = require('express')(),
	bodyParser = require('body-parser'),
	passport = require('passport'),
	methodOverride = require('method-override'),
	LocalStrategy = require('passport-local'),
	moongose = require('mongoose'),
	camp = require('./models/campground'),
	Comment = require('./models/comment'),
	User = require('./models/user'),
	seedDB = require('./seeds');

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

//ANCHOR =========PASSPORT setup==============//
app.use(
	require('express-session')({
		secret: '65th_square',
		saveUninitialized: false,
		resave: false
	})
);
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.deserializeUser(User.deserializeUser());
passport.serializeUser(User.serializeUser());

app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	next();
});

//ANCHOR ========Mongoose Setup================//

moongose.connect('mongodb://localhost/YelpCampV9', {
	useNewUrlParser: true,
	useUnifiedTopology: true
});
seedDB();

//NOTE =====Routes===========//

var indexRoute = require('./routes/index'),
	campgroundRoute = require('./routes/campground'),
	commentRoute = require('./routes/comment');

app.use(indexRoute);
app.use('/campgrounds', campgroundRoute);
app.use(commentRoute);

app.listen('5000', () => {
	console.log('Running on port 5000');
});
