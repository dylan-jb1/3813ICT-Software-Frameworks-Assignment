const { ObjectId } = require("mongodb");
const { Server } = require("socket.io");
const mongoUtil = require("../common/mongoUtil");

var _io;
const activeRooms = {}

module.exports = {

  connectToServer: function(server) {
    _io = new Server(server, {
        cors: {
          origin: "http://localhost:4200",
          methods: ["GET", "POST"]
        }
    });

    _io.on('connection', (socket) => {
        console.log("Client connected")

        socket.on('ChannelUpdate', ({newChannel, oldChannel, username}) => {
            socket.join(newChannel);
            socket.leave(oldChannel);

            _io.to(newChannel).emit("UserJoinedRoom", username);
            _io.to(oldChannel).emit("UserLeftRoom", username);
        })

        socket.on("UserMessage", ({newMessage, channelId}) => {
            socket.rooms.forEach((room) => {
                if (room == channelId)
                    mongoUtil.getDb().collection('channels').updateOne({_id:ObjectId(room)}, {$push: {messageHistory: {
                        author: ObjectId(newMessage.author),
                        content: newMessage.content,
                        time: newMessage.time
                    }}})
            })
            _io.to(channelId).emit("NewMessage", newMessage);
        })
    })
  },

  getSocketIO: function() {
    return _io;
  },

  closeDb: function() {
    _io.disconnect();
  }
};