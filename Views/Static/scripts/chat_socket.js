
// Creating a class handling all client side operation for socket io
class ClientSocket{
    // Constructor function for class
    constructor(chatBoxId, userEmail){
        this.chatBoxId = chatBoxId;
        this.userEmail = userEmail;

        // Creating a socket and connecting it to provided chat server
        this.socket = io.connect("http://52.72.47.148:5000");

        // If user email is present then call our event handler
        if(userEmail){
            this.eventHandlers();
        }

    }

    eventHandlers(){

        // Fetching current user passed using JSON Stringify from home page
        let currUser = JSON.parse(user);


        // Getting this class instance in self
        let self = this;

        // Handling event after connection to chat server
        self.socket.on("connect", function(){
            // Emitting event to join global chat room
            self.socket.emit("join_chat_room", {
                user: currUser,
                chatRoom: "Global"
            });
    
            // for sending msg to specific user chat room must be unique
            // Hence emitting event to join chat room with unique name as join_< currUser._id >
            self.socket.emit(`join_self`,{
                roomName: `join_${ currUser._id }`
            });
        });


        // After sending msg server emits this event in unique room to which every joins on connecting to server
        // i.e. join_< currUser._id >
        self.socket.on("new_msg", function(data){
            let chat = data.chat;
            let msg = data.message;

            // Getting id for current open chat in chat box
            let chatOpen = $("#current-chat").val();

            // console.log(chatOpen);

            // If any chat is open and this chat matches current chat id
            // Then add msg to that chatlist also
            if(chatOpen.length > 0 && chatOpen==chat._id){

                // Fetch msg list
                let chatList = $("#chat-messages-list");

                // if msg is from current logged user then align it to left
                if(msg.user==currUser._id){
                    let newLi = `
                        <li class="left-align">
                            <p>${ msg.content }</p>
                        </li>
                    `;
                    chatList.append(newLi);
                }
                // Otherwise align it to right
                else{
                    let newLi = `
                        <li class="right-align">
                            <p>${ msg.content }</p>
                        </li>
                    `;
                    chatList.append(newLi);
                }
            }

            // Fetch if previous chat already exists
            let pastChat = $(`#${chat._id}`);

            // if pastchat present then display notification dot
            if(pastChat.length > 0){
                pastChat.find(".notification-dot").css("display", "block");
            }

            // create chat otherwise and add notification dot
            else{
                // get chat list
                let pasChatList = $("#user-past-chats");

                let newLi = ``;
                let id = "";

                // Create new li element
                if(chat.user1._id==currUser._id){
                    let imgTag = `<img src="../upload/profile/defaultDP.svg" alt="${ chat.user2.username }" >`;
                    if(chat.user2.profile){
                        imgTag = `<img src="${ chat.user2.profile }" alt="${ chat.user2.username }" >`;
                    }
                    newLi = $(`
                        <li id="${ chat._id }">
                            <div class="user-img">
                                ${ imgTag }
                            </div>
                            <p>
                                ${ chat.user2.username }
                            </p>
                            
                            <a class="friend-action" id="chat-${ chat.user2._id }" href="/open-chat/${ chat.user2._id }"><i class="fa-solid fa-comments"></i></a>
                            <p class="notification-dot"><i class="fa-solid fa-circle"></i></p>
                        </li>
                    `);
                    
                    id = `chat-${ chat.user2._id }`;
                }
                else{
                    let imgTag = `<img src="../upload/profile/defaultDP.svg" alt="${ chat.user1.username }" >`;
                    if(chat.user2.profile){
                        imgTag = `<img src="${ chat.user1.profile }" alt="${ chat.user1.username }" >`;
                    }
                    newLi = $(`
                        <li id="${ chat._id }">
                            <div class="user-img">
                                ${ imgTag }
                            </div>
                            <p>
                                ${ chat.user1.username }
                            </p>
                            
                            <a class="friend-action" id="chat-${ chat.user1._id }" href="/open-chat/${ chat.user1._id }"><i class="fa-solid fa-comments"></i></a>
                            <p class="notification-dot"><i class="fa-solid fa-circle"></i></p>
                        </li>
                    `);

                    id = `chat-${ chat.user1._id }`;
                }

                // append new li element to list
                pasChatList.append(newLi);

                // Display notification dot
                $(`#${chat._id}`).find(".notification-dot").css("display", "block");

                self.clickHandler(id);
            }
        });


        // Server is emiting this event when user connects to global chat room
        // Using this to display active users
        self.socket.on("user_joined", function(data){
            if(currUser._id==data.user._id){

                // Traverse through active friends list
                for(let friend of data.friendsOnline){
                    // console.log("Inside create element");
                    let newLi = `
                    <li>
                        <a id="active-user-${friend.userId._id}" class="active-user" href="/open-chat/${friend.userId._id}">
                            <img src="${friend.userId.profile}" alt="">
                            <p>${friend.userId.username}</p>
                        </a>
                    </li>
                    `;
    
                    // Add this active user to active friends list
                    $("#active-users-list").append(newLi);

                    // calling function to set event handler for a element
                    self.clickHandler(`active-user-${friend.userId._id}`);
                    

                }

            }
            


        });


        // Event handler for msg send button
        $("#message-send-btn").click(function(event){
            // fetch values for msg and friend id
            let msgTxt = $("#currUser-message").val();
            let anotherUser = $("#msg-send-usr").val();

            // Emit event to server for sending msg to user
            self.socket.emit("msg_user",{
                // passing these users to send msg to unique rooms which use user ids join_< currUser._id >
                anotherUser: anotherUser,
                currUser: currUser,
                msgTxt: msgTxt
            });
        });


    }


    // Function to add click event listener to elements
    clickHandler(elemID) {

        let elem = $(`#${elemID}`);
        elem.click(function(event){
            // Prevent default action of 'a' elements
            event.preventDefault();

            // Creating new ajax request
            $.ajax({
                method: "GET",
                // Getting href property link
                url: elem.prop("href"),
                success: function(data){
                    if(data.chat){
                        let chat = data.chat;

                        // Fetch message list and chat username elements from chatBox
                        let chatList = $("#chat-messages-list");
                        let chatUser = $("#user-chat-username");

                        // Setting input field value with current chat id to identify current open chat in chatbox
                        $("#current-chat").val(chat._id);

                        // Set user's name in chat box
                        if(chat.user1._id==data.currUser._id){
                            chatUser.text(chat.user2.username);
                            $("#msg-send-usr").val(chat.user2._id);
                        }
                        else{
                            chatUser.text(chat.user1.username);
                            $("#msg-send-usr").val(chat.user1._id);
                        }

                        // Add messages present in chat to chatBox
                        for(let message of chat.chatMessages){
                            let newLi = "";
                            if(message.user==data.currUser._id){
                                newLi = `
                                    <li class="left-align">
                                        <p>${ message.content }</p>
                                    </li>
                                `;
                            }
                            else{
                                newLi = `
                                    <li class="right-align">
                                        <p>${ message.content }</p>
                                    </li>
                                `;
                            }

                            chatList.append(newLi);

                        }

                    }

                    // Add class to chat box to make it visible
                    $("#user-chat-box").addClass("open-chat");

                    

                },
                error: function(error){
                    console.log(error);
                }
            });
        });

    }

    
}