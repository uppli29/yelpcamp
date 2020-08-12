const express = require('express');
var router = express.Router();
var camp = require('../models/campground');
var comment = require('../models/comment');

//NOTE middleware
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}

function checkCampgroundOwnership(req, res, next) {
	if (req.isAuthenticated()) {
		camp.findById(req.params.id, (err, found) => {
			if (err) {
				res.redirect('/campgrounds');
			} else {
				if (found.author.id.equals(req.user._id)) {
					next();
				} else {
					res.redirect('back');
				}
			}
		});
	} else {
		res.redirect('back');
	}
}

router.get('/', (req, res) => {
	console.log(req.user);
	camp.find({}, (err, allcamp) => {
		if (err) {
			console.log(err);
		} else {
			res.render('campground/index', { camp: allcamp, currentUser: req.user });
		}
	});
});

//NOTE  NEW route- displays the form page
router.get('/new', isLoggedIn, (req, res) => {
	res.render('campground/new');
});

//NOTE SHOW route- tell the information

router.get('/:id', (req, res) => {
	camp.findById(req.params.id).populate('comments').exec((err, foundCamp) => {
		if (err) {
		} else {
			res.render('campground/show', { ground: foundCamp, currentUser: req.user });
		}
	});
});

//NOTE CREATE route - add new campground to db
router.post('/', isLoggedIn, (req, res) => {
	var name = req.body.name;
	var image = req.body.image;
	var desc = req.body.desc;
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	var newCampground = { name: name, image: image, description: desc, author: author };
	camp.create(newCampground, (err, newcamp) => {
		if (err) {
			console.log(err);
		} else {
			console.log('New camp added');
		}
	});
	res.redirect('/campgrounds');
});

//NOTE edit route
router.get('/:id/edit', checkCampgroundOwnership, (req, res) => {
	camp.findById(req.params.id, (err, found) => {
		res.render('campground/edit', { ground: found });
	});
});

router.put('/:id',checkCampgroundOwnership, (req, res) => {
	camp.findByIdAndUpdate(req.params.id, req.body.ground, (err, updated) => {
		if (err) {
			res.redirect('/campgrounds');
		} else {
			res.redirect('/campgrounds/' + req.params.id);
		}
	});
});

//NOTE Destroy campground
router.delete('/:id',checkCampgroundOwnership, (req, res) => {
	camp.findByIdAndDelete(req.params.id, (err, removedCamp) => {
		if (err) {
			res.redirect('/campgrounds');
		}
		comment.deleteMany({ _id: { $in: removedCamp.comments } }, (err) => {
			if (err) {
				console.log(err);
			}
			res.redirect('/campgrounds');
		});
	});
});

module.exports = router;
