var express = require('express'),
	passport = require('passport'),
	User = require('../models/user');

var router = express.Router();

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}

router.get('/', (req, res) => {
	res.render('landing', { currentUser: req.user });
});

router.get('/register', (req, res) => {
	res.render('register', { currentUser: req.user });
});

router.post('/register', (req, res) => {
	var username = req.body.username;
	User.register(new User({ username: username }), req.body.password, (err, user) => {
		if (err) {
			console.log(err);
			res.redirect('/register');
		} else {
			passport.authenticate('local')(req, res, () => res.redirect('/campgrounds'));
		}
	});
});

router.get('/login', (req, res) => res.render('login', { currentUser: req.user }));

router.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/campgrounds',
		failureRedirect: '/login'
	}),
	(err) => {
		if (err) console.log(err);
	}
);

router.get('/logout', (req, res) => {
	req.logOut();
	res.redirect('/');
});

module.exports = router;
