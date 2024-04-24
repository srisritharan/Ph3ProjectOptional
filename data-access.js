// imports the mongodb client
const MongoClient = require("mongodb").MongoClient;
// connection string
const baseUrl = "mongodb://127.0.0.1:27017";
const dbName = "custdb";
const collectionName = "customers";
const connectString = baseUrl + "/" + dbName;
let collection;

//Connect to mongodb

async function dbConnect() {
  try {
    const client = new MongoClient(connectString);
    await client.connect();
    collection = client.db(dbName).collection(collectionName);
    console.log(
      new Date().toLocaleString() +
        ` DB Connected ${connectString} Collection ${collectionName}`
    );
  } catch (err) {
    console.log(err.message);
    console.log("DB CONNECTION FAILED. Is database running?");
  }
}

// get Customers
module.exports.getCustomers = async function () {
  try {
    const customers = await collection.find().toArray();
    console.log(new Date().toLocaleString() + " getCustomers");
    // throw {"message":"an error occured"};
    return [customers, null];
  } catch (err) {
    console.log(err.message);
    return [null, err.message];
  }
};

// reset Customers
module.exports.resetCustomers = async function () {
  let cusData = [
    { id: 0, name: "Mary Jackson", email: "maryj@abc.com", password: "maryj" },
    {
      id: 1,
      name: "Karen Addams",
      email: "karena@abc.com",
      password: "karena",
    },
    {
      id: 2,
      name: "Scott Ramsey",
      email: "scottr@abc.com",
      password: "scottr",
    },
  ];
  try {
    await collection.deleteMany({});
    await collection.insertMany(cusData);
    const customers = await collection.find().toArray();
    const msg =
      "New data loaded at " +
      new Date().toLocaleString() +
      " <br/> There are now " +
      customers.length +
      " customer records!";
    console.log(new Date().toLocaleString() + " resetCustomers");
    return [msg, null];
  } catch (err) {
    console.log(err.message);
    return [null, err.message];
  }
};

// add Customer
module.exports.addCustomer = async function (newCustomer) {
  try {
    const insertResult = await collection.insertOne(newCustomer);
    // return array [status, id, errMessage]
    return ["success", insertResult.insertedId, null];
  } catch (err) {
    console.log(err.message);
    return ["fail", null, err.message];
  }
};

dbConnect();
