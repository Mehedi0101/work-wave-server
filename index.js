const express = require("express");
const app = express();
const cors = require("cors");
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true
}));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.gxsfvvy.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const taskCollection = client.db("WorkWave").collection("tasks");

        app.get('/', (req, res) => {
            res.send("This is the server of WORKWAVE");
        })

        // getting tasks
        app.get('/tasks', async (req, res) => {
            let email = "";

            if (req?.query?.email) {
                email = req?.query?.email;
            }

            const query = {
                user: email
            }
            const result = await taskCollection.find(query).toArray();
            res.send(result);
        })

        // adding a new task
        app.post('/tasks', async (req, res) => {
            const task = req.body;
            const result = await taskCollection.insertOne(task);
            res.send(result);
        })

        // update a task status
        app.patch('/tasks/status/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body.status;
            console.log(id, status);
            const filter = { _id: new ObjectId(id) };
            const updatedTask = {
                $set: {
                    status: status
                }
            }
            const result = await taskCollection.updateOne(filter, updatedTask);
            res.send(result);
        })

        // delete a task
        app.delete('/tasks/delete/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await taskCollection.deleteOne(query);
            res.send(result);
        })

        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`WORKWAVE server is running on ${port}`);
})