const { UUID } = require('bson');
const express = require('express');
const { ObjectId } = require('mongodb');
const { ApplicationError } = require('../common/error');
const router = express.Router();
const mongoUtil = require('../common/mongoUtil');
const { userAuth, checkToken, requiredPerms, userFromToken } = require("../common/authFunc");

router.use(express.json());

const authRoutes = [
    "/login",
    "/me",
    "/display/:field",
    "/id",
]

const database = mongoUtil.getDb();

router.use((req, res, next) => {
    next();
})

router.post('/login', async (req, res) => {
    if (req.body && req.body.username && req.body.password) {
        const userFound = await database.collection("users").findOne({username:req.body.username});
        if (userFound && userFound.password == req.body.password) {
            const curEpoch = Math.round(Date.now() / 1000);
            // if credentials are OK

            // fetch newest token
            const userToken = await database.collection("tokens").find({user: ObjectId(userFound['_id'])},{exp:-1}).toArray();

            // if token is found and hasnt expired
            if (userToken.length > 0 && await checkToken(userToken[0].token) ) {
                res.send({token: userToken[0].token})
            } else {
                const newToken =  UUID()
                    .toString('hex')
                    .replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5'); // random unique string

                await database.collection("tokens").insertOne({
                    user: ObjectId(userFound['_id']),
                    valid: true,
                    exp: curEpoch + 3600, // login session expires in one hour
                    token: newToken
                })
                res.send({token: newToken});
            }
        } else {
            res.status(401).send(ApplicationError.InvalidCredentials);
            return;
        }
    } else {
        // if credentials missing
        res.status(400).send(ApplicationError.MalformedRequest);
        return;
    }
})

router.get('/me', userAuth, async (req,res) => {
    const user = await userFromToken(req.headers.authorization.split("Basic ")[1]);
    if (user == null) {
        res.status(401).send(ApplicationError.InvalidCredentials);
    } else {
        res.send({
            "_id": user["_id"],
            username: user.username,
            email: user.email,
            role: user.role
        });
    }
})

router.get("/display/:field", userAuth, async (req,res) => {
    const requester = await userFromToken(req.headers.authorization.split("Basic ")[1]);
    switch (req.params.field) {
        case "groups":
            const groupList = await database.collection('groups').find({users:ObjectId(requester._id)}).project({_id: 1, name: 1, channels: 1, groupAssis: 1}).toArray();
            res.send(groupList)
            break;
        case "channels":
            const channelList = await database.collection('channels').find({userAccess:ObjectId(requester._id)}).project({_id: 1, name: 1, messageHistory: 1}).toArray();
            res.send(channelList)
            break;
    }
})

router.get("/id", userAuth, async (req,res) => {
    if (req.query.user) {
        const userData = await database.collection('users').findOne({_id: ObjectId(req.query.user)})
        if (userData) {
            res.send({
                _id:userData._id,
                username:userData.username,
                pfp:userData.pfp
            })
        } else {
            res.status(400).send(ApplicationError.ResourceNonExistant);
        }
    }
    else {
        res.status(400).send(ApplicationError.MalformedRequest);
    }
}) 



module.exports = {
    router: router,
    routes: authRoutes
};