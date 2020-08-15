const express = require('express');
var router = express.Router();
var camp = require('../models/campground');
var comment = require('../models/comment');

var middleWare = require('../middlewares/index');

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
router.get('/new', middleWare.isLoggedIn, (req, res) => {
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
router.post('/', middleWare.isLoggedIn, (req, res) => {
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
router.get('/:id/edit', middleWare.checkCampgroundOwnership, (req, res) => {
	camp.findById(req.params.id, (err, found) => {
		res.render('campground/edit', { ground: found });
	});
});

router.put('/:id', middleWare.checkCampgroundOwnership, (req, res) => {
	camp.findByIdAndUpdate(req.params.id, req.body.ground, (err, updated) => {
		if (err) {
			res.redirect('/campgrounds');
		} else {
			res.redirect('/campgrounds/' + req.params.id);
		}
	});
});

//NOTE Destroy campground
router.delete('/:id', middleWare.checkCampgroundOwnership, (req, res) => {
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
