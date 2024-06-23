const express = require("express");
const router = express.Router({ mergeParams: true });

const catchAsync = require("../utilities/catchAsync");
const ExpressError = require("../utilities/ExpressError");
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const Campground = require("../models/campground");
const Review = require("../models/review");

//adding controllers
const reviews = require("../controllers/reviews");

// add review to campground
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

// delete review
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  catchAsync(reviews.deleteReview)
);

module.exports = router;
