const express = require("express"); //imports express
const path = require("path"); //imports path
const da = require("./data-access"); //imports data-access.js
const bodyParser = require("body-parser"); //import body-parser
require('dotenv').config() // load in the environment vars

const app = express(); //creates an express app object
const port = process.env.PORT || 4000; // use env var or default to 4000

app.use(bodyParser.json());

// Set the static directory to serve files from
const staticDir = path.join(__dirname, "public");
app.use(express.static(staticDir));

//start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log("staticDir: " + staticDir);
});

//Authorize using API_Key
function auth(req, res, next) {
    
    console.log(new Date().toLocaleString() + " Query Parameter APIkey:"+ req.query.qApiKey, "Header x-api-key:" + req.header("x-api-key"), "env API_Key:" + process.env.API_KEY);
    // Access the provided 'qApiKey' query parameters
    let apiKey = null;
    if (req.query.qApiKey) {
        apiKey = req.query.qApiKey;
    } else {
        // Access the provided 'x-api-key' from header
        apiKey = req.header("x-api-key");
    }
    // error if not x-api-key header & if not right key
    if (!apiKey) {
        res.status(401).json({ message: "Missing API key" })
        return;
    } else {
        if (apiKey !== process.env.API_KEY) {
            res.status(403).json({ message: "Invalid API key" })
            return;
        }
    }
    next()
}
  
//getCustomers
app.get("/customers",auth, async (req, res) => {
    const [cust, err] = await da.getCustomers();
    if (cust) {
        res.send(cust);
    } else {
        res.status(500).send(err);
    }
});

// reset Customers
app.get("/reset", async (req, res) => {
    const [result, err] = await da.resetCustomers();
    if (result) {
        res.send(result);
    } else {
        res.status(500).send(err);
    }
});

// adding a new customer
app.post("/customers", async (req, res) => {
    const newCustomer = req.body;
    // Check if the request body is missing
    if (Object.keys(req.body).length === 0) {
        res.status(400).send("Missing Request body");
    } else {
        // Check if the required properties are present
        if (!newCustomer.name || !newCustomer.email || !newCustomer.password) {
            res.status(400).send("Missing Required Feilds");
            return;
        }
        // Process the request
        const [status, id, errMessage] = await da.addCustomer(newCustomer);
        if (status === "success") {
            res.status(201).send({ ...newCustomer, _id: id });
        } else {
            res.status(400).send(errMessage);
        }
    }
});

//getCustomerByID
app.get("/customers/:id", async (req, res) => {
    const id = req.params.id;
    const [cust, err] = await da.getCustomerById(id);
    if (cust) {
        res.send(cust);
    } else {
        res.status(404).send(err);
    }
});

//updatedCustomer
app.put('/customers/:id', async (req, res) => {
    const id = req.params.id;
    const updatedCustomer = req.body;
    // Check if the request body is missing
    if (Object.keys(updatedCustomer).length === 0) {
        res.status(400).send("Missing request body");
    } else {
        delete updatedCustomer._id;
        const [message, err] = await da.updateCustomer(updatedCustomer);
        if (message) {
            res.send(message);
        } else {
            res.status(400).send(err);
        }
    }
});


//deleteCustomerById
app.delete("/customers/:id", async (req, res) => {
    const id = req.params.id;
    // return array [message, errMessage]
    const [msg, err] = await da.deleteCustomerById(id);
    if (msg) {
        res.send(msg);
    } else {
        res.status(404).send(err);
    }
});