// imports the mongodb client
const MongoClient = require('mongodb').MongoClient;
// connection string
const baseUrl = "mongodb://127.0.0.1:27017";
const dbName = 'custdb';
const collectionName = "customers"
const connectString = baseUrl + "/" + dbName; 
let collection;

//Connect to mongodb

async function dbConnect() {
    try{
        const client = new MongoClient(connectString);
        await client.connect();
        collection = client.db(dbName).collection(collectionName);
        console.log(new Date().toLocaleString() +` DB Connected ${connectString} Collection ${collectionName}`);
    }catch(err){
        console.log(err.message);
        console.log("DB CONNECTION FAILED. Is database running?");
    }
}

module.exports.getCustomers = async function() {
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

dbConnect();