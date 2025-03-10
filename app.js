if (process.env.NODE_ENV !== "PRODUCTION") {
  require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const app = express();
const ejsMate = require("ejs-mate");
const Joi = require("joi");
const ExpressError = require("./utilities/ExpressError");
const methodOverride = require("method-override");
const session = require("express-session");

const campgroundRoutes = require("./routes/campground.js");
const reviewRoutes = require("./routes/reviews.js");
const userRoutes = require("./routes/users.js");

const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

const MongoDBStore = require("connect-mongo");

/***********Mongoose Connection************/
mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("Mongoose Connection open!!");
  })
  .catch((err) => {
    console.log("Mongoose Connection Error!!");
    console.log(err);
  });

/***********Setting Up Routes************/
// setting ejs and absolute path for views directory
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// for parsing body data
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// To server public directory
app.use(express.static(path.join(__dirname, "public")));

app.use(mongoSanitize());

const store = MongoDBStore.create({
  mongoUrl: process.env.DB_URL,
  touchAfter: 24 * 3600,
  crypto: {
    secret: "thisshouldbeabettersecret!",
  },
});
store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

// Creating sessions
const sessionConfig = {
  store,
  name: "session",
  secret: "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());
app.use(helmet());
const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/du4e2pyew/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

// Setting up different routes
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/", userRoutes);
/***********Routes************/
// home
app.get("/", (req, res) => {
  res.render("home");
});
// All campgrounds

app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Oh No, Something Went Wrong!";
  res.status(statusCode).render("error", { err });
});

app.listen(3000, () => {
  console.log("Serving on port: 3000");
});
