const mongoUtil = require('./common/mongoUtil');

console.log("Connecting to mongo server...")
mongoUtil.connectToServer( (err, client) => {const auth = require("./services/auth")
    if (err) {
        console.log("Connection to MongoDB could not be established")
    } else {
        console.log("Mongo connection established")
        const admin = require("./services/admin")
        const auth = require("./services/auth")
        const { userAuth } = require("./common/authFunc")
        const express = require('express')
        const cors = require('cors')
        const app = express();
    
        app.use(cors())
    
        app.all(auth.routes, auth.router)
        app.all(admin.routes, userAuth, admin.router)
        
        // start server once connected to DB
        app.listen(4000, (req,res) => {
            console.log("Server started and listening on port 4000")
        })
    }
});