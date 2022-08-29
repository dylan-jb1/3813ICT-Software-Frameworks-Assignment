const api = require("./api/api")
const express = require('express')

const app = express();

app.use(express.static('public'));
app.use("/api", api)

app.listen(4000, (req,res) => {
    console.log("Server started and listening on port 4000")
})