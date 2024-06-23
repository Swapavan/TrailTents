const mongoose = require("mongoose");
const Campground = require("../models/campground");
const { places, descriptors } = require("./seedHelpers");
const cities = require("./cities");

/***********Mongoose Connection************/
mongoose
  .connect("mongodb://127.0.0.1:27017/yelp-camp")
  .then(() => {
    console.log("Mongoose Connection open!!");
  })
  .catch((err) => {
    console.log("Mongoose Connection Error!!");
    console.log(err);
  });

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 200; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "6669328b67ccc6426861450c",
      location: `${cities[random1000].city} ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      image: [
        {
          url: "https://res.cloudinary.com/du4e2pyew/image/upload/v1718542015/TrailTents/jk1ocsubgqw2q85ayo55.jpg",
          filename: "TrailTents/jk1ocsubgqw2q85ayo55",
        },
        // {
        //   url: "https://res.cloudinary.com/du4e2pyew/image/upload/v1718305019/YelpCamp/vbdabbtxinblcz0szt42.jpg",
        //   filename: "YelpCamp/vbdabbtxinblcz0szt42",
        // },
      ],
      description:
        "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Alias, nobis iste. Ea rem quam incidunt amet magni, beatae nulla voluptates accusantium similique quis itaque minus sit soluta, aperiam ",
      price: price,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
