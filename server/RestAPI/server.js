const mongoUtil = require('./common/mongoUtil');
const socketUtil = require('./sockets/socketUtil')
const fs = require('fs');
const { UUID } = require('bson');

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
        const bodyParser = require("body-parser");

        const app = express();
        const http = require('http');
        const server = http.createServer(app);
        
        socketUtil.connectToServer(server);
    
        app.use(cors())
    
        app.all(auth.routes, auth.router)
        app.all(admin.routes, userAuth, admin.router)

        app.use(express.static(__dirname + '/ImgDir'));

        app.post('/upload', userAuth, async (req,res) => {
            const imageFileName = UUID()
                .toString('hex')
                .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5'); // random unique string;
            req.pipe(
                fs.createWriteStream(__dirname + "/ImgDir/" + imageFileName + ".png")
            );
            res.status(200).send({imgPath: "http://localhost:4000/"+imageFileName+".png"})
        })
        
        // start server once connected to DB
        server.listen(4000, (req,res) => {
            console.log("Server started and listening on port 4000")
        })
    }
});