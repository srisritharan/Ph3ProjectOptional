const express = require("express"); //imports express
const path = require("path"); //imports path
const da = require("./data-access"); //imports data-access.js
const bodyParser = require("body-parser"); //import body-parser

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
app.get("/customers", async (req, res) => {
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