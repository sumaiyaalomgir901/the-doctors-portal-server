const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
/////////////////////
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.zgqow.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

console.log(uri);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
////////////////////////////////
async function run() {
  try {
    await client.connect();
    const database = client.db("Doctors_Portal");
    const appointmentsCollection = database.collection("Appointments");
    const usersCollection = database.collection("Users");
    console.log("database connected successfully");
    /////////////////////FOR APPOINTMENTS
    ////////////////GET
    app.get("/appointments", async (req, res) => {
      const email = req.query.email;
      const date = new Date(req.query.date).toDateString();
      const query = { patientEmail: email, date: date };
      const cursor = appointmentsCollection.find(query);
      const appointmentss = await cursor.toArray();
      res.json(appointmentss);
    });
    ////////////////POST
    app.post("/appointments", async (req, res) => {
      const appointment = req.body;
      const result = await appointmentsCollection.insertOne(appointment);
      res.json(result);
    });
    /////////////////////FOR USERS
    //////GET
    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find({});
      const users = await cursor.toArray();
      res.send(users);
    });
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
    ////////POST
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });
    //////////PUT ==>> upsert
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );

      res.json(result);
    });
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    ////////////////////////
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);
/////////////////////////////////
app.get("/", (req, res) => {
  res.send("The Doctor's Portal");
});

app.listen(port, () => {
  console.log(`listening port : ${port}`);
});
