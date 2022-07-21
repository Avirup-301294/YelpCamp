const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");
const catchAsync = require("./utils/CatchAsync");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");

const Campground = require("./models/campground");
const PORT = 3000;

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

const app = express();

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

// Route  Base
app.get("/", (req, res) => {
  res.render("home");
});

// Route - Index
app.get("/campgrounds", async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds });
});

// Route - New
app.get("/campgrounds/new", async (req, res) => {
  res.render("campgrounds/new");
});

// Route - Post - try/catch
// app.post("/campgrounds", async (req, res, next) => {
//   try{
//     const campground = new Campground(req.body.campground);
//     await campground.save();
//     res.redirect(`/campgrounds/${campground._id}`);

//   } catch(e) {
//     next(e)
//   }
// });

// Route - Post - Custom Error
app.post("/campgrounds", catchAsync(async (req, res, next) => {
  if(!req.body.campground) throw new ExpressError('Invalid Campground Data', 400)
  const campground = new Campground(req.body.campground);
  await campground.save();
  res.redirect(`/campgrounds/${campground._id}`);
}));

// Route - Show
app.get("/campgrounds/:id", catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render("campgrounds/show", { campground });
}));

// Route - Edit
app.get("/campgrounds/:id/edit", catchAsync(async (req, res) => {
  const campground = await Campground.findById(req.params.id);
  res.render("campgrounds/edit", { campground });
}));

// Route - Update

app.put("/campgrounds/:id", catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  res.redirect(`/campgrounds/${campground._id}`);
}));

// Route Delete

app.delete("/campgrounds/:id", catchAsync(async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect("/campgrounds");
}));


app.all("*", (req, res, next) => {
  next(new ExpressError('Page Not Found!', 404))
})

// Error Handling
app.use((err, req, res, next) => {
  const { message = 'Something went wrong!', statusCode = 500} = err;
  res.status(statusCode).send(message);
});

app.listen(PORT, () => {
  console.log(`Serving on port ${PORT}`);
});
