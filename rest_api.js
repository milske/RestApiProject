// import necessary modules, using express
var express = require("express");
var app = express();
var bodyParser = require("body-parser"); // to get parameters
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // to parse JSON-data

// use mongoDB
var { MongoClient, ObjectId } = require("mongodb");

// import variables from dotenv
require("dotenv").config();

var user = process.env.MONGO_USERID;
var pw = process.env.MONGO_PW;

// create connection to mongo db
var uri =
  "mongodb+srv://" +
  user +
  ":" +
  pw +
  // "@cluster0.dldSm.mongodb.net/?retryWrites=true&w=majority";
  "@cluster0.85d90.mongodb.net/sample_mflix?retryWrites=true&w=majority";

// the routes

app.get("/", function (req, res) {
  res.send(
    "Welcome to the Movie API! Use /api routes to get more information."
  );
});

// Route 1: return all documents from the movies db, though limited to 10 movies
app.get("/api/getall", function (req, res) {
  // create connection object
  var client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  async function connectAndFetch() {
    try {
      // connection to "sample_mflix" and connection "movies"
      await client.connect();
      var collection = client.db("sample_mflix").collection("movies");

      //make query with collection-object
      var result = await collection.find().limit(10).toArray(); //use empty find to show all contents
      res.send(result);
    } catch (e) {
      console.error(e);
    } finally {
      await client.close(); // close the DB connection
      console.log("Connection closed to Mongo");
    }
  }
  connectAndFetch();
});

// Route 2: return one item with the given id
app.get("/api/:id", function (req, res) {
  var { id } = req.params;
  // Validate the ID format
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return res.status(400).json({
      error: "Invalid ID format. Must be a 24-character hex string.",
    });
  }
  var client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  async function connectAndFetch() {
    try {
      await client.connect();
      var collection = client.db("sample_mflix").collection("movies");
      var movie = await collection.findOne({ _id: new ObjectId(id) }); // find movie by its ID
      // error handling:
      if (!movie) {
        res.status(404).json({ error: "Movie not found" });
      } else {
        res.status(200).json(movie);
      }
    } catch (e) {
      console.error(e);
    } finally {
      await client.close();
      console.log("Connection closed to Mongo");
    }
  }
  connectAndFetch();
});

// route 3: create a new movie in the collection
app.post("/api/add", function (req, res) {
  // connect to mongo DB
  var client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  async function connectAndFetch() {
    try {
      await client.connect();
      var collection = client.db("sample_mflix").collection("movies");
      var newMovie = req.body;
      console.log("Movie title:", newMovie);
      await collection.insertOne(newMovie); // insert new movie to the collection
      res.status(201).json({ message: "Movie added:", newMovie });
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Movie could not be added" });
    } finally {
      await client.close(); // close the db connection
      console.log("Connection closed to Mongo");
    }
  }
  connectAndFetch();
});

// Route 4: Update a movie with given id
app.put("/api/update/:id", function (req, res) {
  // connect to mongo DB
  var client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  var { id } = req.params;
  var updateData = req.body;

  async function connectAndFetch() {
    try {
      await client.connect();
      var collection = client.db("sample_mflix").collection("movies");

      var result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      );

      if (result.matchedCount === 0) {
        res.status(404).json({ error: "Update not succesfull" });
      } else {
        res.status(200).json({ message: "Movie updated successfully" });
      }
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Movie could not be updated" });
    } finally {
      await client.close(); // close the db connection
      console.log("Connection closed to Mongo");
    }
  }
  connectAndFetch();
});

// route 5 delete a movie with the given id
app.delete("/api/delete/:id", function (req, res) {
  // connect to mongo DB
  var client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  var { id } = req.params;

  async function connectAndFetch() {
    try {
      await client.connect();
      var collection = client.db("sample_mflix").collection("movies");

      var result = await collection.deleteOne({ _id: new ObjectId(id) });

      if (result.deletedCount === 0) {
        res.status(404).json({ error: "Item could not be deleted" });
      } else {
        res.status(200).json({ message: "Item deleted successfully" });
      }
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Movie could not be deleted" });
    } finally {
      await client.close(); // close the db connection
      console.log("Connection closed to Mongo");
    }
  }
  connectAndFetch();
});

// error path
app.get("*", function (req, res) {
  res.send("Error, no such path!");
});

// start web server by express
var PORT = process.env.PORT || 8080;
app.listen(PORT, function () {
  console.log("Example app is listening to port http://localhost:8080", PORT);
});
