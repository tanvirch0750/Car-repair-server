const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

//middleware
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.apqen.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

const run = async () => {
  try {
    await client.connect();
    const serviceCollection = client.db("CarRepair").collection("service");
    const orderCollection = client.db("CarRepair").collection("order");

    app.get("/", async (req, res) => {
      res.send("server is running");
    });

    // get service from db
    app.get("/service", async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = await cursor.toArray();
      res.send(services);
    });

    // get single service from db
    app.get("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const service = await serviceCollection.findOne(query);
      res.send(service);
    });

    // receive single service from client/admin and add to db
    app.post("/service", async (req, res) => {
      const newService = req.body;
      const result = await serviceCollection.insertOne(newService);
      res.send(result);
    });

    // delete service
    app.delete("/service/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await serviceCollection.deleteOne(query);
      res.send(result);
    });

    // PUT upadte a user
    app.put("/service/:id", async (req, res) => {
      const id = req.params.id;
      const updatedService = req.body;
      const query = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updatedDoc = {
        $set: {
          name: updatedService.name,
          description: updatedService.description,
          price: updatedService.price,
          img: updatedService.img,
        },
      };
      const result = await serviceCollection.updateOne(
        query,
        updatedDoc,
        options
      );
      res.send(result);
    });

    // order route
    app.post("/order", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.send(result);
    });

    app.get("/order", async (req, res) => {
      const authHeader = req.headers.authorization;
      console.log(authHeader);
      const email = req.query.email;
      const query = { email };
      const cursor = orderCollection.find(query);
      const orders = await cursor.toArray();
      res.send(orders);
    });

    // AUTH ROUTE
    app.post("/login", async (req, res) => {
      const user = req.body;
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ accessToken });
    });
  } finally {
  }
};
run().catch(console.dir);

app.listen(port, () => {
  console.log("Listening to car repair port", port);
});
