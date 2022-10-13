const e = require('express');
const express = require('express');
const { ObjectId } = require('mongodb');
const router = express.Router();
const { userAuth, checkToken, requiredPerms, userFromToken } = require("../common/authFunc");

const { ApplicationError } = require("../common/error");
const mongoUtil = require('../common/mongoUtil');

router.use(express.json());

const adminRoutes = [
    "/users*",
    "/groups*",
    "/channels*"
]

const database = mongoUtil.getDb();

router.use((req, res, next) => {
    next();
})

// Get full information about a specific user
router.get('/users/:userId', async (req, res) => {
    const requester = await userFromToken(req.headers.authorization.split("Basic ")[1]);
    if (requester.role >= 1) {
        const user = await database.collection('users').findOne({_id:ObjectId(req.params.userId)});
        if (user) {
            res.status(200).send(user);
        } else {
            res.sendStatus(404);
        }
    } else {
        res.status(403).send(ApplicationError.InsufficientPriviliges);
        // const userAssisGroups = await database.collection('groups').find({groupAssis:ObjectId(requester["_id"])}).project({users: 1}).toArray();
        // const usersInGroups = [];
        // userAssisGroups.forEach((group) => {
        //     usersInGroups.push(...group.users);
        // })
        // // if user exists in group where requester is assistant
        // if (usersInGroups.includes(ObjectId(req.params.userId))) {
        //     const user = await database.collection('users').findOne({_id: req.params.userId});
        //     if (user) {
        //         res.status(200).send({
        //             user
        //         });
        //     } else {
        //         res.sendStatus(404);
        //     }
        // } else {
        //     res.status(403).send(ApplicationError.InsufficientPriviliges)
        // }
    }
})

// Create a new user
router.post('/users', async(req,res) => {
    const requester = (await userFromToken(req.headers.authorization.split("Basic ")[1]))["_id"];
    const userAuthorised = await requiredPerms("group_admin",requester);

    if (userAuthorised) {
        if (req.body && req.body.username && req.body.email && req.body.password) {
            await database.collection('users').insertOne({
                username: req.body.username,
                email: req.body.email,
                password: req.body.password,
                role: 0
            }, (error, result) => {
                if (error) {
                    res.status(400).send(ApplicationError.DuplicateResource);
                } else {
                    res.status(201).send({userId: result.insertedId})
                }
            })
        }
        else {
            res.status(400).send(ApplicationError.MalformedRequest);
        }
    } else {
        res.status(403).send(ApplicationError.InsufficientPriviliges);
    }
})

// Delete a user
router.delete('/users/:userId', async (req,res) => {
    const requester = (await userFromToken(req.headers.authorization.split("Basic ")[1]))["_id"];
    const userAuthorised = await requiredPerms("super_admin",requester);

    if (userAuthorised) {
        if (req.params && req.params.userId) {
            await database.collection('users').deleteOne({
                _id: ObjectId(req.params.userId)
            }, (error, response) => {
                if (response.deletedCount == 0) {
                    res.sendStatus(404);
                } else {
                    res.status(200).send("User was successfully deleted.");
                }
            })
        }
        else {
            res.status(400).send(ApplicationError.MalformedRequest);
        }
    } else {
        res.status(403).send(ApplicationError.InsufficientPriviliges);
    }
})

// Fetch user list
router.get("/users", async (req,res) => {
    const requester = await userFromToken(req.headers.authorization.split("Basic ")[1]);
    if (requester.role >= 1) {
        const dataList = await database.collection('users').find().toArray();
        if (dataList) {
            res.status(200).send(dataList);
        } else {
            res.sendStatus(404);
        }
    } else {
        const userAssisGroups = await database.collection('groups').find({groupAssis:ObjectId(requester["_id"])}).project({users: 1}).toArray();
        const usersInGroups = [];
        userAssisGroups.forEach((group) => {
            usersInGroups.push(...group.users);
        })
        // users where they are in a group that the requester is Assis in
        const dataList = await database.collection('users').find({_id: {$in:usersInGroups}}).project({username: 1, email: 1, _id: 1}).toArray();
        if (dataList) {
            res.status(200).send(dataList);
        } else {
            res.sendStatus(404);
        }
    }
})

router.patch("/users/:userId", async (req,res) => {
    const super_admin_perms = {
        add: [],
        update: ["username","email","password","role"],
        remove: []
    }
    const requester = await userFromToken(req.headers.authorization.split("Basic ")[1]);

    if (requester.role == 2) {
        if (req.body && req.body.add && req.body.update && req.body.remove) {
            const user = await database.collection('users').findOne({_id:ObjectId(req.params.userId)});
            if (user) {
                const data = req.body;
                Object.keys(data.update).forEach((key) => {
                    if (super_admin_perms.update.includes(key)) {
                        user[key] = key == "role" ? parseInt(data.update[key]) : data.update[key];
                    }
                })
                await database.collection('users').replaceOne({_id:user._id},user);
                res.sendStatus(200);
            } else {
                res.sendStatus(404);
            }
        } else {
            res.status(400).send(ApplicationError.MalformedRequest);
        }
    } else {
        res.status(403).send(ApplicationError.InsufficientPriviliges);
    }
})

// Create a new group
router.post('/groups', async(req,res) => {
    const requester = (await userFromToken(req.headers.authorization.split("Basic ")[1]))["_id"];
    const userAuthorised = await requiredPerms("group_admin",requester);

    if (userAuthorised) {
        if (req.body && req.body.name) {
            await database.collection('groups').insertOne({
                name: req.body.name,
                users: [],
                channels: [],
                groupAssis: []
            }, (error, result) => {
                if (error) {
                    res.status(400).send(ApplicationError.DuplicateResource);
                } else {
                    res.status(201).send({groupId: result.insertedId})
                }
            })
        }
        else {
            res.status(400).send(ApplicationError.MalformedRequest);
        }
    } else {
        res.status(403).send(ApplicationError.InsufficientPriviliges);
    }
})

// Get all groups where user has edit perms
router.get("/groups", async (req,res) => {
    const requester = await userFromToken(req.headers.authorization.split("Basic ")[1]);
    if (requester.role >= 1) {
        const dataList = await database.collection('groups').find().toArray();
        if (dataList) {
            res.status(200).send(dataList);
        } else {
            res.sendStatus(404);
        }
    } else {
        const dataList = await database.collection('groups').find({groupAssis: ObjectId(requester._id)}).toArray();
        if (dataList) {
            res.status(200).send(dataList);
        } else {
            res.sendStatus(404);
        }
    }
})

router.delete("/groups/:groupId", async (req,res) => {
    const requester = (await userFromToken(req.headers.authorization.split("Basic ")[1]))["_id"];
    const userAuthorised = await requiredPerms("group_admin",requester);

    if (userAuthorised) {
        if (req.params && req.params.groupId) {
            await database.collection('groups').deleteOne({
                _id: ObjectId(req.params.groupId)
            }, (error, response) => {
                if (response.deletedCount == 0) {
                    res.sendStatus(404);
                } else {
                    res.status(200).send("Channel was successfully deleted.");
                }
            })
        }
        else {
            res.status(400).send(ApplicationError.MalformedRequest);
        }
    } else {
        res.status(403).send(ApplicationError.InsufficientPriviliges);
    }
})

router.patch("/groups/:groupId", async (req,res) => {
    const perms = [
        {
            add: ["channels"],
            update: [],
            remove: []
        },{
            add: ["groupAssis","channels","users"],
            update: ["name"],
            remove: ["groupAssis", "channels", "users"]
        },{
            add: ["groupAssis","channels","users"],
            update: ["name"],
            remove: ["groupAssis", "channels", "users"]
        }
    ]
    const requester = await userFromToken(req.headers.authorization.split("Basic ")[1]);

    if (requester.role == 0) {
        const groupAssis = await database.collection('groups').findOne({_id:ObjectId(req.params.groupId)})
        if (!groupAssis.groupAssis.map((value) => value.toString()).includes(requester._id.toString())) {
            res.status(403).send(ApplicationError.InsufficientPriviliges);
            return;
        }
    }

    const group = await database.collection('groups').findOne({_id:ObjectId(req.params.groupId)});
    if (group) {
        if (req.body && req.body.add && req.body.update && req.body.remove) {
            const data = req.body;
            Object.keys(data.update).forEach((key) => {
                if (perms[requester.role].update.includes(key)) {
                    group[key] = data.update[key];
                }
            })
            Object.keys(data.add).forEach((key) => {
                if (perms[requester.role].add.includes(key)) {
                    if (!group[key].map((value) => value.toString()).includes(data.add[key])) {
                        group[key].push(ObjectId(data.add[key]));
                    }
                }
            })
            Object.keys(data.remove).forEach((key) => {
                if (perms[requester.role].remove.includes(key)) {
                    if (group[key].map((value) => value.toString()).includes(data.remove[key])) {
                        const index = group[key].map((value) => value.toString()).indexOf(data.remove[key])
                        group[key].splice(index,1);
                    }
                }
            })
            await database.collection('groups').replaceOne({_id:group._id},group);
            res.sendStatus(200);
        } else {
            res.status(400).send(ApplicationError.MalformedRequest);
        }
    } else {
        res.sendStatus(404);
    }
})

// get all channels where user has edit perms
router.get("/channels", async (req,res) => {
    const requester = await userFromToken(req.headers.authorization.split("Basic ")[1]);
    if (requester.role >= 1) {
        const dataList = await database.collection('channels').find().toArray();
        if (dataList) {
            res.status(200).send(dataList);
        } else {
            res.sendStatus(404);
        }
    } else {
        const groupList = await database.collection('groups').find({groupAssis:ObjectId(requester._id)}).project({channels:1}).toArray();
        const channelList = []
        groupList.forEach((group) => {
            channelList.push(...group.channels);
        })
        const dataList = await database.collection('channels').find({_id:{$in:channelList}}).toArray();
        if (dataList) {
            res.status(200).send(dataList);
        } else {
            res.sendStatus(404);
        }
    }
})

// Create a new channel
router.post('/channels', async(req,res) => {
    const requester = (await userFromToken(req.headers.authorization.split("Basic ")[1]));
    const anyGroup = await database.collection('groups').find({groupAssis:requester["_id"]}).toArray();

    if (requester.role >=1 || anyGroup.length > 0) {
        if (req.body && req.body.name) {
            await database.collection('channels').insertOne({
                name: req.body.name,
                userAccess: [],
                messageHistory: []
            }, (error, result) => {
                if (error) {
                    res.status(400).send(ApplicationError.DuplicateResource);
                } else {
                    res.status(201).send({channelId: result.insertedId})
                }
            })
        }
        else {
            res.status(400).send(ApplicationError.MalformedRequest);
        }
    } else {
        res.status(403).send(ApplicationError.InsufficientPriviliges);
    }
})

router.delete("/channels/:channelId", async (req,res) => {
    const requester = (await userFromToken(req.headers.authorization.split("Basic ")[1]))["_id"];
    const userAuthorised = await requiredPerms("group_admin",requester);

    if (userAuthorised) {
        if (req.params && req.params.channelId) {
            await database.collection('channels').deleteOne({
                _id: ObjectId(req.params.channelId)
            }, (error, response) => {
                if (response.deletedCount == 0) {
                    res.sendStatus(404);
                } else {
                    res.status(200).send("Channel was successfully deleted.");
                }
            })
        }
        else {
            res.status(400).send(ApplicationError.MalformedRequest);
        }
    } else {
        res.status(403).send(ApplicationError.InsufficientPriviliges);
    }
})

router.patch("/channels/:channelId", async (req,res) => {
    const perms = [{
        add: ["userAccess"],update: ["name"],remove: ["userAccess"]
    },{
        add: ["userAccess"],update: ["name"],remove: ["userAccess"]
    },{
        add: ["userAccess"],update: ["name"],remove: ["userAccess"]
    }]

    const requester = await userFromToken(req.headers.authorization.split("Basic ")[1]);

    if (requester.role == 0) {
        const channelGroup = await database.collection('groups').findOne({channels:ObjectId(req.params.channelId)});
        if (!channelGroup.groupAssis.map((value) => value.toString()).includes(requester._id.toString())) {
            res.status(403).send(ApplicationError.InsufficientPriviliges);
            return;
        }
    }

    const channel = await database.collection('channels').findOne({_id:ObjectId(req.params.channelId)});
    if (channel) {
        if (req.body && req.body.add && req.body.update && req.body.remove) {
            const data = req.body;
            Object.keys(data.update).forEach((key) => {
                if (perms[requester.role].update.includes(key)) {
                    channel[key] = data.update[key];
                }
            })
            Object.keys(data.add).forEach((key) => {
                if (perms[requester.role].add.includes(key)) {
                    if (!channel[key].map((value) => value.toString()).includes(data.add[key])) {
                        channel[key].push(ObjectId(data.add[key]));
                    }
                }
            })
            Object.keys(data.remove).forEach((key) => {
                if (perms[requester.role].remove.includes(key)) {
                    if (channel[key].map((value) => value.toString()).includes(data.remove[key])) {
                        const index = channel[key].indexOf(ObjectId(data.remove[key]))
                        channel[key].splice(index,1);
                    }
                }
            })
            await database.collection('channels').replaceOne({_id:channel._id},channel);
            res.sendStatus(200);
        } else {
            res.status(400).send(ApplicationError.MalformedRequest);
        }
    } else {
        res.sendStatus(404);
    }
})

module.exports = {
    router: router,
    routes: adminRoutes
};