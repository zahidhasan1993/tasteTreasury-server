const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
//middleware
app.use(cors());
app.use(express.json());






const uri = `mongodb+srv://${process.env.DB_USER_NAME}:${process.env.DB_USER_PASSWORD}@cluster0.uoombu0.mongodb.net/?retryWrites=true&w=majority`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    //db database collection
    const database = client.db('TasteTreasury');
    const menuCollection = database.collection('menu');
    const reviewsCollection = database.collection('reviews');
    const cartCollection = database.collection('cart');
    const userCollection = database.collection('user');

    //server connections
    app.get('/menu', async(req,res) => {
      const result = await menuCollection.find().toArray();
      res.send(result);
    })
    app.get('/review', async(req,res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    })
    app.get('/cart/:email', async (req,res) => {
      const data =  req.params.email;
      const query = { email : data };
      
      // console.log(data);

      const result = await cartCollection.find(query).toArray();
      res.send(result);
    })
    app.get('/users', async (req,res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    })
    // send data to db
    app.post('/cart', async (req,res) => {
      const item = req.body;
      const result = await cartCollection.insertOne(item);

      res.send(result);

    })
    app.post('/users', async (req,res) => {
      const user = req.body;
      const query = {email: user.email};
      
      const exitingUser = await userCollection.findOne(query);
      // console.log(exitingUser);
      if (exitingUser) {
        return res.send('user all ready exists')
      }
      
      const result = await userCollection.insertOne(user);
      res.send(result)
    })
    //delete data from DB
    app.delete('/cart/:id', async (req,res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await cartCollection.deleteOne(query);

      res.send(result)

    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



//connection

app.get('/', (req,res) => {
    res.send('Welcome to TasteTreasury Server');
})

app.listen(port, () => {
    console.log('running on port', port);
})


