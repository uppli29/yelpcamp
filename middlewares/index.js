const camp = require('../models/campground'),
	comment = require('../models/comment');

var middleWare = {};

middleWare.isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
};

middleWare.checkCampgroundOwnership = (req, res, next) => {
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
};

middleWare.checkCommentOwnership = (req, res, next) => {
	if (req.isAuthenticated()) {
		comment.findById(req.params.comment_id, (err, found) => {
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
};

module.exports = middleWare;
