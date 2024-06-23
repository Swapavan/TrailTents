const express = require("express");
const router = express.Router();

// Controllers
const campgrounds = require("../controllers/campgrounds.js");

const catchAsync = require("../utilities/catchAsync");
const Campground = require("../models/campground");
const {
  isLoggedIn,
  isAuthor,
  validateCampground,
} = require("../middleware.js");

//Cloudinary
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

router
  .route("/")
  .get(catchAsync(campgrounds.index)) // Index (Show all campgrounds)
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.createCampground)
  );

// Add and create new campground
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(campgrounds.showCampground)) // show individual campground
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.updateCampground)
  )
  .delete(
    isLoggedIn, // delete campground
    isAuthor,
    catchAsync(campgrounds.deleteCampground)
  );

// Edit campground
router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
