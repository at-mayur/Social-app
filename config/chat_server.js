const socketIo = require("socket.io");
const User = require("../models/user");
const Message = require("../models/message");
const Chat = require("../models/chat");
const OnlineUser = require("../models/onlineUsers");

module.exports.createChatServer = function(chatServer){

    let io = new socketIo.Server(chatServer, {
        cors: {
            origin: "http://localhost:8000",
            methods: ["POST", "GET"]
        }
    });

    io.sockets.on("connection", async function(socket){

        try {


            console.log("Socket connected..", socket.id);

        socket.on("disconnect", async function(){

            try {
                console.log("Socket disconnected", socket.id);
                await OnlineUser.deleteOne({ socketId: socket.id });
            } catch (error) {
                console.log(error);
            }
            
        });

        socket.on("join_chat_room", async function(data){

            try {

                
                socket.join(data.chatRoom);

                await OnlineUser.deleteMany({ userId: data.user._id });

                OnlineUser.create({
                    userId: data.user._id,
                    socketId: socket.id
                });

                let friendIds = data.user.friends.map((friend) => friend._id);


                let friendsOnline = await OnlineUser.find({ userId: { $in: friendIds } }).populate("userId", "username email profile");

                io.in(data.chatRoom).emit("user_joined", {
                    user: data.user,
                    friendsOnline: friendsOnline
                });
                
            } catch (error) {
                console.log(error);
            }
            

        });

        socket.on("join_self", async function(data){
            try {
                
                socket.join(data.roomName);

            } catch (error) {
                console.log(error);
            }
        });


        socket.on("msg_user", async function(data){
            try {
                
                let msgTxt = data.msgTxt;
                let anotherUser = data.anotherUser;


                let chat1 = await Chat.findOne({ user1: anotherUser, user2: data.currUser._id });
                let chat2 = await Chat.findOne({ user1: data.currUser._id, user2: anotherUser });

                if(chat1){
                    let message = await Message.create({
                        user: data.currUser._id,
                        content: msgTxt
                    });
                    chat1.chatMessages.push(message.id);
                    chat1.save();
                    io.in([`join_${ anotherUser }`, `join_${ data.currUser._id }`]).emit("new_msg", {
                        chat: chat1,
                        message: message,
                        currUser: data.currUser
                    });
                }
                else if(chat2){
                    let message = await Message.create({
                        user: data.currUser._id,
                        content: msgTxt
                    });
                    chat2.chatMessages.push(message.id);
                    chat2.save();
                    io.in([`join_${ anotherUser }`, `join_${ data.currUser._id }`]).emit("new_msg", {
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