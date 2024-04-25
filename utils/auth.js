//validate APIKEY
let apiKey = null;
validateApiKey = function() {
    apiKey = process.env.API_KEY;
        console.log(new Date().toLocaleString() + " process.env API Key     :" + apiKey);
    if (process.argv[2] != null)    {
        apiKey = process.argv[2];
        console.log(new Date().toLocaleString() + " process.argv[2] API Key :" + apiKey);
    }
    if (apiKey && apiKey.length >0)
    {
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
    } else {
        if (inputApiKey !== apiKey) {
            res.status(403).json({ message: "Invalid API key" })
            return;
        }
    }
    next();
};