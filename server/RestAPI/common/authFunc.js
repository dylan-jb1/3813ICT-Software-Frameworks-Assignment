const { ObjectId } = require("mongodb");
const mongoUtil = require("./mongoUtil");
const {ApplicationError} = require("./error");

const database = mongoUtil.getDb();

const userAuth = async (req,res,next) => {
    if (req.headers && req.headers.authorization) {
        const tokenValid = await checkToken(req.headers.authorization.split("Basic ")[1]);
        if (tokenValid) {
            next();
        } else {
            res.status(403).send(ApplicationError.InsufficientPriviliges);
            return;
        }
    } else {
        res.status(401).send(ApplicationError.MissingAuthentication);
        return;
    }
}

const checkToken = async (token) => {
    tokenData = await database.collection("tokens").findOne({token:token});
    if (tokenData == null) {
        // token does not exist
        return false;
    } else {
        if (tokenData.valid == false) {
            // token is no longer valid
            return false;
        } else {
            const curEpoch = Math.round(Date.now() / 1000);
            if (tokenData["exp"] >= curEpoch) {
                //  token has not yet expired
                return true;
            } else {
                // mark token as invalid and fail check
                await database.collection("tokens").updateOne({token: token},{$set: { 'valid': false }});
                return false;
            }
        };
    }
}

const requiredPerms = async (authLevel, user, group = null) => {
    const userFound = await database.collection("users").findOne({"_id": ObjectId(user)});
    console.log(userFound)
    if (userFound && user) {
        if (authLevel == "super_admin") {
            return userFound.role == 2;
        } else if (authLevel == "group_admin") {
            return userFound.role >= 1;
        } else if (authLevel == "group_assis") {
            if (userFound.role >= 1)
                return true;
            if (group) {
                const userGroup = await database.collection("groups").findOne({"_id": ObjectId(group)});
                if (userGroup == null) {
                    return false;
                } else {
                    if (userGroup.groupAssis.some((thisGroup) => thisGroup.equals(userFound["_id"]))) {
                        // if user is group assis of this group
                        return true;
                    } else {
                        return false;
                    }
                }
            }
            else {
                return false;
            }
        }
    } else {
        //should be impossible
        return false;
    }

    return false;
}

const userFromToken = async (token) => {
    const tokenFound = await database.collection('tokens').findOne({token: token}, {exp: -1});
    if (tokenFound) {
        return await database.collection('users').findOne({"_id": ObjectId(tokenFound.user)});
    } else {
        return null;
    }
}

module.exports = {userAuth,checkToken,requiredPerms,userFromToken};