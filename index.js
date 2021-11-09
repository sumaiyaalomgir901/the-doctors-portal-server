const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

/////////////////////
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.trzwo.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

console.log(uri);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();
    const database = client.db("DoctorsPortal");
    const appointmentsCollection = database.collection("appointments");
    console.log("database connected successfully");

    ////////////////GET
    // app.get("/appointments", async (req, res) => {
    //   const cursor = appointmentsCollection.find({});
    //   const appointments = await cursor.toArray();
    //   res.send(appointments);
    // });
    //////================================
    app.get("/appointments", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      console.log(query);
      const cursor = appointmentsCollection.find(query);
      const appointments = await cursor.toArray();
      res.json(appointments);
    });
    ////////////////POST
    app.post("/appointments", async (req, res) => {
      const appointment = req.body;
      const result = await appointmentsCollection.insertOne(appointment);
      res.json(result);
      console.log(result);
    });
  } finally {
    await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("The Doctor's Portal");
});

app.listen(port, () => {
  console.log(`listening port : ${port}`);
});
