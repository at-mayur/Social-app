const socketIo = require("socket.io");
const User = require("../models/user");
const Message = require("../models/message");
const Chat = require("../models/chat");
const OnlineUser = require("../models/onlineUsers");

// function to configure server side for socket io
module.exports.createChatServer = function (chatServer) {

    // chatServer is a http server listening at port 5000
    // declared in index.js
    let io = new socketIo.Server(chatServer, {
        // Option to handle cors error on socket connection
        cors: {
            origin: "http://localhost:8000",
            methods: ["POST", "GET"]
        }
    });

    // Handling connection event on socket connection to the server
    io.sockets.on("connection", async function (socket) {

        try {


            console.log("Socket connected..", socket.id);


            socket.on("disconnect", async function () {
                // handling event on disconnecting socket
                try {
                    console.log("Socket disconnected", socket.id);
                    // removing user from db which we stored on socket connection
                    await OnlineUser.deleteOne({ socketId: socket.id });
                } catch (error) {
                    console.log(error);
                }

            });

            // Handling "join_chat_room" event emited by socket
            socket.on("join_chat_room", async function (data) {

                try {


                    // joining chatroom provided in event data. Using this chat room as Global
                    // i.e. every user will join this chatroom
                    // and comparing with our friendList we can find current friend who are online.
                    socket.join(data.chatRoom);

                    // deleting any previous entry for the user if present to avoid duplicate entries
                    await OnlineUser.deleteMany({ userId: data.user._id });

                    // Adding entry to db for displaying current online users in our app
                    await OnlineUser.create({
                        userId: data.user._id,
                        socketId: socket.id
                    });

                    // Getting all friends id for current connected user
                    let friendIds = data.user.friends.map((friend) => friend._id);


                    // Fetching all friends who are online i.e. connected to this chatroom
                    let friendsOnline = await OnlineUser.find({ userId: { $in: friendIds } }).populate("userId", "username email profile");

                    // Emiting "user_joined" event in this chatroom with current user and online friends data
                    io.in(data.chatRoom).emit("user_joined", {
                        user: data.user,
                        friendsOnline: friendsOnline
                    });

                } catch (error) {
                    console.log(error);
                }


            });

            // To chat with specific user room must be unique
            // Hence every user will be joining unique chatroom
            // "join-< userId >"
            socket.on("join_self", async function (data) {
                try {

                    socket.join(data.roomName);

                } catch (error) {
                    console.log(error);
                }
            });


            // Socket client will emit this event for evry new msg sent
            // It will pass user to whom msg has sent and user who is sending as data
            // Also the message content
            socket.on("msg_user", async function (data) {
                try {

                    // message content
                    let msgTxt = data.msgTxt;
                    // user to whom msg needs to be sent
                    let anotherUser = data.anotherUser;


                    // finding if previous chat that exists between these 2 users
                    let chat1 = await Chat.findOne({ user1: anotherUser, user2: data.currUser._id })
                    .populate("user1 user2", "email username profile");
                    let chat2 = await Chat.findOne({ user1: data.currUser._id, user2: anotherUser })
                    .populate("user1 user2", "email username profile");

                    if (chat1) {
                        // creating message document and storing it to db
                        let message = await Message.create({
                            user: data.currUser._id,
                            content: msgTxt,
                            chat: chat1.id
                        });

                        // Also adding this msg to chat between these 2 sers
                        chat1.chatMessages.push(message.id);
                        chat1.save();

                        // for sending msg to that particular user we emit this event to uniq chatroom
                        // that every user is joining i.e. "join-< userId >"
                        // emiting this event for both users to update message at both ends.
                        io.in([`join_${anotherUser}`, `join_${data.currUser._id}`]).emit("new_msg", {
                            chat: chat1,
                            message: message,
                            currUser: data.currUser
                        });
                    }
                    else if (chat2) {
                        let message = await Message.create({
                            user: data.currUser._id,
                            content: msgTxt,
                            chat: chat2.id
                        });
                        chat2.chatMessages.push(message.id);
                        chat2.save();
                        io.in([`join_${anotherUser}`, `join_${data.currUser._id}`]).emit("new_msg", {
                            chat: chat2,
                            message: message,
                            currUser: data.currUser
                        });
                    }



                } catch (error) {
                    console.log(error);
                }
            });




        } catch (error) {
            console.log(error);
        }

    });


};