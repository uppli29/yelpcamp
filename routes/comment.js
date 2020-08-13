const express = require('express');

var camp = require('../models/campground'),
	Comment = require('../models/comment');
const comment = require('../models/comment');

var router = express.Router();

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}

function checkCommentOwnership(req, res, next) {
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
}

//ANCHOR creating new comment
router.get('/campgrounds/:id/comments/new', isLoggedIn, (req, res) => {
	camp.findById(req.params.id, (err, camps) => {
		if (err) {
			console.log(err);
		} else {
			res.render('comment/new', { campground: camps });
		}
	});
});

router.post('/campgrounds/:id/comments', isLoggedIn, (req, res) => {
	//lookup campground using id
	camp.findById(req.params.id, (err, campgrounds) => {
		if (err) {
			console.log(err);
			res.redirect('/camgrounds');
		} else {
			//create new comment
			Comment.create(req.body.comments, (err, comment) => {
				if (err) {
					console.log(err);
				} else {
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					console.log(comment);
					campgrounds.comments.push(comment);
					campgrounds.save();

					//redirect to campground show page
					res.redirect('/campgrounds/' + campgrounds._id);
				}
			});
		}
	});
});

//NOTE edit comment
router.get('/campgrounds/:id/comments/:comment_id/edit', checkCommentOwnership, (req, res) => {
	comment.findById(req.params.comment_id, (err, foundComment) => {
		if (err) {
			res.redirect('back');
		} else {
			res.render('comment/edit', { campground_id: req.params.id, comment: foundComment });
		}
	});
});

//NOTE update Comment
router.put('/campgrounds/:id/comments/:comment_id', checkCommentOwnership, (req, res) => {
	comment.findByIdAndUpdate(req.params.comment_id, req.body.comments, (err, updated) => {
		if (err) {
			res.redirect('back');
		} else {
			res.redirect('/campgrounds/' + req.params.id);
		}
	});
});

router.delete('/campgrounds/:id/comments/:comment_id', checkCommentOwnership, (req, res) => {
	comment.findByIdAndDelete(req.params.comment_id, (err, found) => {
		if (err) {
			res.redirect('back');
		} else {
			res.redirect('back');
		}
	});
});

module.exports = router;
