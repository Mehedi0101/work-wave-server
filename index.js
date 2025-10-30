const express = require("express");
const app = express();
const cors = require("cors");
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;

app.use(cors({
    origin: ['https://work-wave-01.web.app', 'https://console.firebase.google.com/u/0/project/work-wave-01/overview', 'http://localhost:5173'],
    credentials: true
}));
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@mycluster.blpor7q.mongodb.net/?appName=MyCluster`;



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

        // get a task by id
        app.get('/tasks/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await taskCollection.findOne(query);
            res.send(result);
        })

        // adding a new task
        app.post('/tasks', async (req, res) => {
            const task = req.body;
            const result = await taskCollection.insertOne(task);
            res.send(result);
        })

        // update a task
        app.patch('/tasks/update/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedTask = {
                $set: {
                    title: req.body.title,
                    deadline: req.body.deadline,
                    priority: req.body.priority,
                    details: req.body.details
                }
            }
            const result = await taskCollection.updateOne(filter, updatedTask);
            res.send(result);
        })

        // update a task status
        app.patch('/tasks/status/:id', async (req, res) => {
            const id = req.params.id;
            const status = req.body.status;
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
    } finally {

    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`WORKWAVE server is running on ${port}`);
})