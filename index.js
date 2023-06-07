const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//middleware
app.use(cors());
app.use(express.json());

const varifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization;

  // console.log("jwt function autho : ",authorization);
  if (!authorization) {
    return res.status(401).send({ error: true, message: "unauthorize user" });
  }
  const token = authorization.split(" ")[1];
  // console.log("token from jwt function :", token);
  // verify a token symmetric
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res
        .status(401)
        .send({ error: true, message: "unauthorized user" });
    }
    req.decoded = decoded;
    next();
  });
};

//mongoDb connections
const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_USER_PASSWORD}@cluster0.uoombu0.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    //db database collection
    const database = client.db("TasteTreasury");
    const menuCollection = database.collection("menu");
    const reviewsCollection = database.collection("reviews");
    const cartCollection = database.collection("cart");
    const userCollection = database.collection("user");
    //jwt token
    app.post("/jwt", (req, res) => {
      const body = req.body;
      const token = jwt.sign(body, process.env.ACCESS_TOKEN, {
        expiresIn: '1h',
      });
      res.send({ token });
    });
    //server connections
    app.get("/menu", async (req, res) => {
      const result = await menuCollection.find().toArray();
      res.send(result);
    });
    app.get("/review", async (req, res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    });
    app.get("/cart/:email", varifyJWT, async (req, res) => {
      const email = req.params.email;
      const decodedEmail = req.decoded.email;
      if (!email) {
        res.send([]);
      }
      if (email !== decodedEmail) {
        return res
          .status(403)
          .send({ error: true, message: "Not your directory" });
      }
      const query = { email: email };
      

      const result = await cartCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });
    // make admin api / update admin role
    app.patch("/users/admin/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          role: "admin",
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);

      res.send(result);
    });
    // send data to db
    app.post("/cart", async (req, res) => {
      const item = req.body;
      const result = await cartCollection.insertOne(item);

      res.send(result);
    });
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };

      const exitingUser = await userCollection.findOne(query);
      // console.log(exitingUser);
      if (exitingUser) {
        return res.send("user all ready exists");
      }

      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    //delete data from DB
    app.delete("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);

      res.send(result);
    });
    app.delete("/user/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);

      res.send(result);
    });
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//connection

app.get("/", (req, res) => {
  res.send("Welcome to TasteTreasury Server");
});

app.listen(port, () => {
  console.log("running on port", port);
});
