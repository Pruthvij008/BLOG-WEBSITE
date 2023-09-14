const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const Blog = require("./models/blogs");
const { result } = require("lodash");

// express app
const app = express();
//connect to mongodb
const dbURI =
  "mongodb+srv://pruthvij:pruthvij123@cluster0.pouj9gh.mongodb.net/note-tuts?retryWrites=true&w=majority";
mongoose
  .connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  // .then((result) => console.log("succesully connected to the database"))

  //this below line tells us that ok when the database is connected then only listen to the website/request
  .then((result) => app.listen(3000))

  .catch((err) => {
    console.log(err);
  });
// listen for requests

// register view engine
app.set("view engine", "ejs");

// middleware & static files
app.use(express.static("public"));

//new middleware for reading all the things that we receive from the forms
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log("new request made:");
  console.log("host: ", req.hostname);
  console.log("path: ", req.path);
  console.log("method: ", req.method);
  next();
});

app.use((req, res, next) => {
  console.log("in the next middleware");
  next();
});

app.use(morgan("dev"));

app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});

//mongoose and mongosandbox routes*************

app.get("/", (req, res) => {
  res.redirect("blogs");
});

app.get("/about", (req, res) => {
  res.render("about", { title: "About" });
});

app.get("/blogs", (req, res) => {
  Blog.find()
    .sort({ createdAt: -1 })
    .then((result) => {
      res.render("index", { title: "all blogs", blogs: result });
    })
    .catch((err) => {
      console.log(err);
    });
});

app.get("/blogs/create", (req, res) => {
  res.render("create", { title: "Create a new blog" });
});

app.get("/add", (req, res) => {
  const blog = new Blog({
    title: "new blog 2",
    snippet: "about my new 2 blog",
    body: "about new 22",
  });

  blog
    .save()
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/blogs", (req, res) => {
  const blog = new Blog(req.body);
  blog
    .save()
    .then((result) => {
      res.redirect("/blogs");
    })
    .catch((err) => {
      console.log(err);
    });
});
//post and get request
app.get("/blogs/:id", (req, res) => {
  const id = req.params.id;

  Blog.findById(id)
    .then((result) => {
      res.render("details", { blog: result, title: "Blog details" });
    })
    .catch((err) => {
      console.log(err);
    });
});

// 404 page
app.use((req, res) => {
  res.status(404).render("404", { title: "404" });
});
