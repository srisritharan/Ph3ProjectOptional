const express = require("express"); //imports express
const path = require("path"); //imports path
const da = require("./data-access"); //imports data-access.js
const bodyParser = require("body-parser"); //import body-parser
// load in the environment vars
const dotenv = require('dotenv');
dotenv.config();

const a = require("./utils/auth"); // import the auth

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


//getCustomers
app.get("/customers",a.auth, async (req, res) => {
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

//api-keys to be assigned to individual users
app.get("/apikey", async (req, res) => {
    let email = req.query.email;
    console.log(new Date().toLocaleString() + " Entered email:" + email);
    if(email){
        const emailApiKey = a.getEmailApiKey(email);
        res.send(emailApiKey);
    }else{
        res.status(400).send("<h1>An email query param is required </h1> </br> URL with query parameter would look like this: http://localhost:4000/apikey?email=jack@abc.com");
    }   
});

//Search Endpoint
app.get("/customer/find", async (req, res) => {
    let id = +req.query.id;
    let email = req.query.email;
    let password = req.query.password;
    let srchFor = null;
    if (id > -1) {
        srchFor = { "id": id };
    } else if (email) {
        srchFor = { "email": email };
    } else if (password) {
        srchFor = { "password": password }
    }
    if (srchFor) {
        const [customers, err] = await da.findCustomer(srchFor);
        if (customers) {
            res.send(customers);
        } else {
            res.status(404);
            res.send(err);
        }
    } else {
        res.status(400).send("<h1>Bad request</h1> </br> Name/value pair must match one of the customer document's properties (id, email, password)");
    }
});
