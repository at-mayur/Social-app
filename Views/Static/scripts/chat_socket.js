
class ClientSocket{
    constructor(chatBoxId, userEmail){
        this.chatBoxId = chatBoxId;
        this.userEmail = userEmail;

        this.socket = io.connect("http://localhost:5000");

        if(userEmail){
            this.eventHandlers();
        }
        this.self = this;

    }

    eventHandlers(){

        let currUser = JSON.parse(user);


        self = this;

        this.socket.on("connect", function(){
            self.socket.emit("join_chat_room", {
                user: currUser,
                chatRoom: "Global"
            });
    
            self.socket.emit(`join_self`,{
                roomName: `join_${ currUser._id }`
            });
        });


        self.socket.on("new_msg", function(data){
            let chat = data.chat;
            let msg = data.message;

            let chatOpen = $("#current-chat").val();

            // console.log(chatOpen);

            if(chatOpen.length > 0 && chatOpen==chat._id){
                let chatList = $("#chat-messages-list");
                if(msg.user==currUser._id){
                    let newLi = `
                        <li class="left-align">
                            <p>${ msg.content }</p>
                        </li>
                    `;
                    chatList.append(newLi);
                }
                else{
                    let newLi = `
                        <li class="right-align">
                            <p>${ msg.content }</p>
                        </li>
                    `;
                    chatList.append(newLi);
                }
            }

            let pastChat = $(`#${chat._id}`);

            if(pastChat.length > 0){
                pastChat.find(".notification-dot").css("display", "block");
            }
            else{
                let pasChatList = $("#user-past-chats");

                let newLi = ``;
                let id = "";
                if(chat.user1._id==currUser._id){
                    let imgTag = `<img src="../upload/profile/defaultDP.svg" alt="${ chat.user2.username }" >`;
                    if(chat.user2.profile){
                        imgTag = `<img src="${ chat.user2.profile }" alt="${ chat.user2.username }" >`;
                    }
                    newLi = `
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
                    `;
                    
                    id = `chat-${ chat.user2._id }`;
                }
                else{
                    let imgTag = `<img src="../upload/profile/defaultDP.svg" alt="${ chat.user1.username }" >`;
                    if(chat.user2.profile){
                        imgTag = `<img src="${ chat.user1.profile }" alt="${ chat.user1.username }" >`;
                    }
                    newLi = `
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
                    `;

                    id = `chat-${ chat.user1._id }`;
                }

                pasChatList.append(newLi);

                self.clickHandler($(`#${ id }`));
            }
        });


        self.socket.on("user_joined", function(data){
            if(currUser._id==data.user._id){

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
    
                    $("#active-users-list").append(newLi);

                    self.clickHandler($(`#active-user-${friend.userId._id}`));
                    

                }

            }
            


        });


        $("#message-send-btn").click(function(event){
            let msgTxt = $("#currUser-message").val();
            let anotherUser = $("#msg-send-usr").val();

            self.socket.emit("msg_user",{
                anotherUser: anotherUser,
                currUser: currUser,
                msgTxt: msgTxt
            });
        });


    }


    clickHandler(elem) {


        elem["0"].addEventListener("click", function(event){
            event.preventDefault();
            $.ajax({
                method: "GET",
                url: elem[0].getAttribute("href"),
                success: function(data){
                    if(data.chat){
                        let chat = data.chat;
                        let chatList = $("#chat-messages-list");
                        let chatUser = $("#user-chat-username");

                        $("#current-chat").val(chat._id);

                        if(chat.user1._id==data.currUser._id){
                            chatUser.text(chat.user2.username);
                            $("#msg-send-usr").val(chat.user2._id);
                        }
                        else{
                            chatUser.text(chat.user1.username);
                            $("#msg-send-usr").val(chat.user1._id);
                        }

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

                    $("#user-chat-box").addClass("open-chat");

                    

                },
                error: function(error){
                    console.log(error);
                }
            });
        });

    }

    
}