var crypto = require('crypto');

let apiKey = null;
let apiKeys = new Map();

module.exports.getEmailApiKey = function (email) {
    let randomApiKey = crypto.randomBytes(16).toString('hex');
    apiKeys.set(email, randomApiKey);
    displayMapApiKeys();
    return [email,randomApiKey];
};

//Referance for map and loop https://www.w3schools.com/js/js_object_maps.asp
displayMapApiKeys = function () {
    console.log(new Date().toLocaleString() + " Map ApiKeys:")
    for (const x of apiKeys.entries()) {
        console.log(x);
    }
}

//validate APIKEY is present
validateApiKey = function() {
    apiKey = process.env.API_KEY;
        console.log(new Date().toLocaleString() + " process.env API Key     :" + apiKey);
    if (process.argv[2] != null)    {
        apiKey = process.argv[2];
        console.log(new Date().toLocaleString() + " process.argv[2] API Key :" + apiKey);
    }
    if (apiKey && apiKey.length >0)
    {
        apiKeys.set("default", apiKey);
        displayMapApiKeys();
        console.log(new Date().toLocaleString() + " API Key for this App    :" + apiKey);
    }else{
        console.log(new Date().toLocaleString() + " Error!!! No APIKey in .Env file or form command line");
        return process.exit(0);
    }
};

//Call the APIkey validation function.
validateApiKey();

//Authorize using API_Key

module.exports.auth = function (req, res, next) {

    // Access the provided 'qApiKey' query parameters
    let inputApiKey = null;
    if (req.query.qApiKey) {
        inputApiKey = req.query.qApiKey;
    } else {
        // Access the provided 'x-api-key' from header
        inputApiKey = req.header("x-api-key");
    }
    console.log(new Date().toLocaleString());
    console.log("   Query Parameter APIkey :" + req.query.qApiKey);
    console.log("   Header x-api-key       :" + req.header("x-api-key"));
    console.log("   env API_Key            :" + apiKey);
    // error if not x-api-key header & if not right key
    if (!apiKey) {
        res.status(401).json({ message: "Missing API key" })
        return;
    }
    //loop through the apikeys map and see if it's a valid key

    let validated = false;
    for( let key of apiKeys.values()){
        if (inputApiKey === key){
            validated = true;
        }
      }
    //if we dont have a key throw an error
    if (!validated) {
        res.status(403).json({ message: "Invalid API key, include qApiKey like  http://localhost:4001/customers?qApiKey=e070b6c7-da57-465d-845e-e3dc103e86ac or in  Header x-api-key "})
        return;
    }
    next();
};