const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion } = require('mongodb');

//middleware
app.use(cors());
app.use(express.json());






const uri = "mongodb+srv://zahidhasan:uKVoNBzc3ZcCmQj0@cluster0.uoombu0.mongodb.net/?retryWrites=true&w=majority";

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
    const cartCollection = database.collection('cart')

    //server connections
    app.get('/menu', async(req,res) => {
      const result = await menuCollection.find().toArray();
      res.send(result);
    })
    app.get('/review', async(req,res) => {
      const result = await reviewsCollection.find().toArray();
      res.send(result);
    })
    app.get('/cart', async (req,res) => {
      const result = await cartCollection.find().toArray();
      res.send(result);
    })
    // send data to db
    app.post('/cart', async (req,res) => {
      const item = req.body;
      const result = await cartCollection.insertOne(item);

      res.send(result);

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


