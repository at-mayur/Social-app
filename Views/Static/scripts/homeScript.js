{

    // Add some event listeners to our actions to prevent page refresh for every action
    $(document).ready(function(){
        let postList = $("#post-list > li");

        // Adding event listeners to posts action i.e.
        // Adding comment, delete post, like post
        for(let postLi of postList){
            // console.log(postLi.id.split("-")[1]);
            let postId = postLi.id.split("-")[1];
            // for delete post
            deletePost(`post-delete-${postId}`);
            // for create comment
            createComment(`add-comment-form-${postId}`);
            // for liking post
            likePost(postId);
            

            // Display reaction list i.e. different reactions by different user
            // Display users for all reactions on post/comment on mouse over to count
            reactionListDisplay(postId, "post");

            let commentList = $(`#${postId} > li`);

            for(let commentLi of commentList){
                // console.log(commentLi.id);
                let commentId = commentLi.id;

                // For delete comment
                deleteComment(`comment-delete-${commentId}`);

                // for liking a comment
                likeComment(commentId);
                

                // Display reaction list i.e. different reactions by different user
                // Display users for all reactions on post/comment on mouse over to count
                reactionListDisplay(commentId, "comment");
            }

            
        }

        // For message action for friends
        let myFriends = $(".my-friends > .friend-action");

        for(let frnd of myFriends){
            // let id = frnd.id.split('-')[1];

            // Add event listener to open chat on clicking msg icon
            openChat(frnd);
        }

        let requestAccept = $(".accept-request");

        // For accepting frnd request
        for(let accReq of requestAccept){
            let id = accReq.id.split('-')[1];

            acceptRequest(id);
        }

        // For sending frnd request
        let friendAdd = $(".add-friend");

        for(let addFr of friendAdd){
            let id = addFr.id.split('-')[2];

            addFriend(id);
        }

        // Open  chat for previous chats
        let pastChats = $("#user-past-chats li > a");

        for(let pastChat of pastChats){
            openChat(pastChat);
        }


    });



    // Function adding event listener to open chats
    function openChat(elem){
        elem.addEventListener("click", function(event){
            // Prevent default action
            event.preventDefault();

            // Send ajax request
            $.ajax({
                method: "GET",
                url: elem.getAttribute("href"),
                success: function(data){
                    if(data.chat){
                        let chat = data.chat;

                        // Fetch msg list and user name showing elements
                        let chatList = $("#chat-messages-list");
                        let chatUser = $("#user-chat-username");

                        // Set there values
                        $("#current-chat").val(chat._id);

                        if(chat.user1._id==data.currUser._id){
                            chatUser.text(chat.user2.username);
                            $("#msg-send-usr").val(chat.user2._id);
                        }
                        else{
                            chatUser.text(chat.user1.username);
                            $("#msg-send-usr").val(chat.user1._id);
                        }

                        // Fetch messages from chat and add them to chatbox
                        for(let message of chat.chatMessages){
                            let newLi = "";
                            // left align for self msgs
                            if(message.user==data.currUser._id){
                                newLi = `
                                    <li class="left-align">
                                        <p>${ message.content }</p>
                                    </li>
                                `;
                            }
                            // right align for friend msgs
                            else{
                                newLi = `
                                    <li class="right-align">
                                        <p>${ message.content }</p>
                                    </li>
                                `;
                            }

                            chatList.append(newLi);
                            

                        }

                        $(`#${ chat._id } > .notification-dot`).css("display", "none");

                    }


                    $("#user-chat-box").addClass("open-chat");
                    


                },
                error: function(error){
                    console.log(error);
                }
            });
        });
    }

    // click event listener for close button on chat box
    $("#user-chat-box-close").click(function(event){
        // prevent default actions
        event.preventDefault();


        let chatList = $("#chat-messages-list");
        let chatUser = $("#user-chat-username");

        // Clear msg list and username
        chatList.empty();
        chatUser.text("User Name");

        // Clear values for chat id
        $("#msg-send-usr").val("");
        $("#current-chat").val("");

        // remove class which makes chat box visible
        $("#user-chat-box").removeClass("open-chat");

    });


    // React on post
    let reactPost = function(pstId, post){

        // get reaction button
        let reactBtn = $(`#${pstId}`);
        // get like button which display below post
        let likeBtn = $(`#post-react-${post}`);

        reactBtn.click(function(event){
            // prevent default action
            event.preventDefault();

            // Send new ajax request
            $.ajax({
                method: "GET",
                url: reactBtn.prop("href"),
                success: function(data){
                    // if like added then increase likes count and change like icon
                    if(data.reactAdded == "like"){

                        modifyReactElement(likeBtn, data.likeAdded, "post", "like", data.reactionRemoved, `<i class="fa-solid fa-thumbs-up"></i>`, post, `post-like-count-${post}`, data.count, data.user, data.target);

                    }
                    else if(data.reactAdded == "love"){

                        modifyReactElement(likeBtn, data.loveAdded, "post", "love", data.reactionRemoved, `<img src="/images/Love.gif" alt="">`, post, `post-like-count-${post}`, data.count, data.user, data.target);

                    }
                    else if(data.reactAdded == "haha"){

                        modifyReactElement(likeBtn, data.hahaAdded, "post", "haha", data.reactionRemoved, `<img src="/images/Haha.gif" alt="">`, post, `post-like-count-${post}`, data.count, data.user, data.target);

                    }
                    else if(data.reactAdded == "wow"){

                        modifyReactElement(likeBtn, data.wowAdded, "post", "wow", data.reactionRemoved, `<img src="/images/Wow.gif" alt="">`, post, `post-like-count-${post}`, data.count, data.user, data.target);

                    }
                    else if(data.reactAdded == "sad"){

                        modifyReactElement(likeBtn, data.sadAdded, "post", "sad", data.reactionRemoved, `<img src="/images/Sad.gif" alt="">`, post, `post-like-count-${post}`, data.count, data.user, data.target);

                    }
                    else{

                        modifyReactElement(likeBtn, data.angryAdded, "post", "angry", data.reactionRemoved, `<img src="/images/Angry.gif" alt="">`, post, `post-like-count-${post}`, data.count, data.user, data.target);

                    }

                    
                },
                error: function(error){
                    console.log(error);
                }
            });
        })

    };





    // React on comment
    let reactComment = function(cmtId, comment){

        let reactBtn = $(`#${cmtId}`);
        
        let likeBtn = $(`#comment-react-${comment}`);

        reactBtn.click(function(event){
            // prevent default action
            event.preventDefault();

            // Send new ajax request
            $.ajax({
                method: "GET",
                url: reactBtn.prop("href"),
                success: function(data){
                    // if like added then increase likes count and change like icon
                    if(data.reactAdded == "like"){

                        modifyReactElement(likeBtn, data.likeAdded, "comment", "like", data.reactionRemoved, `<i class="fa-solid fa-thumbs-up"></i>`, comment, `comment-like-count-${comment}`, data.count, data.user, data.target);

                    }
                    else if(data.reactAdded == "love"){

                        modifyReactElement(likeBtn, data.loveAdded, "comment", "love", data.reactionRemoved, `<img src="/images/Love.gif" alt="">`, comment, `comment-like-count-${comment}`, data.count, data.user, data.target);

                    }
                    else if(data.reactAdded == "haha"){

                        modifyReactElement(likeBtn, data.hahaAdded, "comment", "haha", data.reactionRemoved, `<img src="/images/Haha.gif" alt="">`, comment, `comment-like-count-${comment}`, data.count, data.user, data.target);

                    }
                    else if(data.reactAdded == "wow"){

                        modifyReactElement(likeBtn, data.wowAdded, "comment", "wow", data.reactionRemoved, `<img src="/images/Wow.gif" alt="">`, comment, `comment-like-count-${comment}`, data.count, data.user, data.target);

                    }
                    else if(data.reactAdded == "sad"){

                        modifyReactElement(likeBtn, data.sadAdded, "comment", "sad", data.reactionRemoved, `<img src="/images/Sad.gif" alt="">`, comment, `comment-like-count-${comment}`, data.count, data.user, data.target);

                    }
                    else{

                        modifyReactElement(likeBtn, data.angryAdded, "comment", "angry", data.reactionRemoved, `<img src="/images/Angry.gif" alt="">`, comment, `comment-like-count-${comment}`, data.count, data.user, data.target);

                    }

                    
                },
                error: function(error){
                    console.log(error);
                }
            });
        })

    };





    // Function modifying elements after reaction
    let modifyReactElement = function(reactBtn, reactAdded, targetName, reactName, reactRemoved, img, targetId, counterId, count, user, target){
        if(reactAdded){
            // change reaction button below to given reaction and also href property
            reactBtn.prop("href", `/post/${targetName}-${reactName}/${targetId}`);
            reactBtn.html(img);

            // Update count of post/comment accordingly
            $(`#${counterId}`).text(count);


            // if previous reaction count is becoming zero then make necessary action
            actionOnRemovingReact(targetName, reactRemoved, targetId, target, user);

            let reactionAdded = $(`#${targetName}-react-added-${reactName}-${targetId}`);
            // If this reaction is not given by someone before then add new icon
            if(reactionAdded.length == 0){
                let newReact = "";
                // Create new reaction icon
                if(reactName=="like"){
                    newReact = $(`<i id="${targetName}-react-added-${reactName}-${targetId}" class="fa-solid fa-thumbs-up"></i>`);
                }
                else if(reactName=="love"){
                    newReact = $(`<img id="${targetName}-react-added-${reactName}-${targetId}" src="/images/Love.gif" alt="">`);
                }
                else if(reactName=="haha"){
                    newReact = $(`<img id="${targetName}-react-added-${reactName}-${targetId}" src="/images/Haha.gif" alt="">`);
                }
                else if(reactName=="wow"){
                    newReact = $(`<img id="${targetName}-react-added-${reactName}-${targetId}" src="/images/Wow.gif" alt="">`);
                }
                else if(reactName=="sad"){
                    newReact = $(`<img id="${targetName}-react-added-${reactName}-${targetId}" src="/images/Sad.gif" alt="">`);
                }
                else if(reactName=="angry"){
                    newReact = $(`<img id="${targetName}-react-added-${reactName}-${targetId}" src="/images/Angry.gif" alt="">`);
                }

                // Add this icon to counter display
                $(`#${targetName}-react-added-icon-${targetId}`).append(newReact);

                // As this is the first reaction of this type given also add button and list to reaction list display
                // to display user giving that reaction
                let reactListBtn = $(`#${targetName}-${reactName}-list-btn-${targetId}`);

                if(reactListBtn.length == 0){
                    // Create and append new btn with that reaction icon
                    let newBtn = createNewListBtn(targetName, reactName, targetId);
                    $(`#${targetName}-react-added-${targetId}`).append(newBtn);

                    // Get profile picture of user adding reactions. If not present then use default one.
                    let usrProfile = "";
                    if(user.profile){
                        usrProfile = `<img src="${user.profile}" alt="${user.username}" srcset="">`;
                    }
                    else{
                        userProfile = `<img src="/upload/profile/defaultDP.svg" alt="${user.username}" srcset="">`;
                    }

                    // Create new list with current user details
                    let newLst = $(`
                            <div id="${targetName}-react-list-${reactName}-${targetId}" class="react-list">
                                <h5>${reactName}</h5>
                                <ul>
                                    
                                    <li id="${targetName}-${reactName}-user-${user._id}">
                                        ${usrProfile}
                                        <p>${user.username}</p>
                                    </li>
                                    
                                </ul>
                            </div>
                    `);

                    // append this list to list container
                    $(`#${targetName}-react-list-${targetId}`).append(newLst);


                    // Call functions adding event listener to button and list
                    getReactions(newBtn[0], newLst[0]);
                    removeReactions(newBtn[0], newLst[0]);
                }


            }
            // If this reaction is already present on this post/comment
            else{

                // Create only user and append it to respective list
                let usrProfile = "";
                if(user.profile){
                    usrProfile = `<img src="${user.profile}" alt="${user.username}" srcset="">`;
                }
                else{
                    usrProfile = `<img src="/upload/profile/defaultDP.svg" alt="${user.username}" srcset="">`;
                }

                let newUsrToLst = $(`
                    <li id="${targetName}-${reactName}-user-${user._id}">
                        ${usrProfile}
                        <p>${user.username}</p>
                    </li>
                `);

                $(`#${targetName}-${reactName}-list-${targetId}`).append(newUsrToLst);

            }




        }
        // if like removed then decrement likes count and change like icon
        else{
            // If reaction removed update like icon
            reactBtn.prop("href", `/post/${targetName}-like/${targetId}`);
            reactBtn.html(`<i class="fa-regular fa-thumbs-up"></i>`);

            // update count
            $(`#${counterId}`).text(count);
            
            // Remove that user and also list and react button if count is getting 0
            actionOnRemovingReact(targetName, reactName, targetId, target, user);
        }
    };


    // Function to update elements on removing a reaction
    function actionOnRemovingReact(targetName, reactName, targetId, target, user){
        if(reactName=="like"){

            // If count of that perticular reaction is getting 0
            // Then remove that reactions's list and respective button and also the icon from count display
            if(target.likes.length==0){
                $(`#${targetName}-react-added-${reactName}-${targetId}`).remove();
                $(`#${targetName}-${reactName}-list-btn-${targetId}`).remove();
                $(`#${targetName}-react-list-${reactName}-${targetId}`).remove();
            }
            // Otherwise remove only that user from that reaction's list
            else{
                $(`#${targetName}-${reactName}-user-${user._id}`).remove();
            }

        }
        else if(reactName=="love"){

            if(target.loves.length==0){
                $(`#${targetName}-react-added-${reactName}-${targetId}`).remove();
                $(`#${targetName}-${reactName}-list-btn-${targetId}`).remove();
                $(`#${targetName}-react-list-${reactName}-${targetId}`).remove();
            }
            else{
                $(`#${targetName}-${reactName}-user-${user._id}`).remove();
            }

        }
        else if(reactName=="haha"){

            if(target.hahas.length==0){
                $(`#${targetName}-react-added-${reactName}-${targetId}`).remove();
                $(`#${targetName}-${reactName}-list-btn-${targetId}`).remove();
                $(`#${targetName}-react-list-${reactName}-${targetId}`).remove();
            }
            else{
                $(`#${targetName}-${reactName}-user-${user._id}`).remove();
            }

        }
        else if(reactName=="wow"){

            if(target.wows.length==0){
                $(`#${targetName}-react-added-${reactName}-${targetId}`).remove();
                $(`#${targetName}-${reactName}-list-btn-${targetId}`).remove();
                $(`#${targetName}-react-list-${reactName}-${targetId}`).remove();
            }
            else{
                $(`#${targetName}-${reactName}-user-${user._id}`).remove();
            }

        }
        else if(reactName=="sad"){

            if(target.sads.length==0){
                $(`#${targetName}-react-added-${reactName}-${targetId}`).remove();
                $(`#${targetName}-${reactName}-list-btn-${targetId}`).remove();
                $(`#${targetName}-react-list-${reactName}-${targetId}`).remove();
            }
            else{
                $(`#${targetName}-${reactName}-user-${user._id}`).remove();
            }

        }
        else if(reactName=="angry"){

            if(target.angrys.length==0){
                $(`#${targetName}-react-added-${reactName}-${targetId}`).remove();
                $(`#${targetName}-${reactName}-list-btn-${targetId}`).remove();
                $(`#${targetName}-react-list-${reactName}-${targetId}`).remove();
            }
            else{
                $(`#${targetName}-${reactName}-user-${user._id}`).remove();
            }

        }
    }


    // Function creating new button for displaying reaction list
    function createNewListBtn(targetName, reactName, targetId){
        if(reactName=="like"){
            return $(`
                <button type="button" id="${targetName}-${reactName}-list-btn-${targetId}">
                    <i class="fa-solid fa-thumbs-up"></i>
                </button>
            `);
        }
        else if(reactName=="love"){
            return $(`
                <button type="button" id="${targetName}-${reactName}-list-btn-${targetId}">
                    <img src="/images/Love.gif" alt="">
                </button>
            `);
        }
        else if(reactName=="haha"){
            return $(`
                <button type="button" id="${targetName}-${reactName}-list-btn-${targetId}">
                    <img src="/images/Haha.gif" alt="">
                </button>
            `);
        }
        else if(reactName=="wow"){
            return $(`
                <button type="button" id="${targetName}-${reactName}-list-btn-${targetId}">
                    <img src="/images/Wow.gif" alt="">
                </button>
            `);
        }
        else if(reactName=="sad"){
            return $(`
                <button type="button" id="${targetName}-${reactName}-list-btn-${targetId}">
                    <img src="/images/Sad.gif" alt="">
                </button>
            `);
        }
        else if(reactName=="angry"){
            return $(`
                <button type="button" id="${targetName}-${reactName}-list-btn-${targetId}">
                    <img src="/images/Angry.gif" alt="">
                </button>
            `);
        }
    }


    // Post Like action
    let likePost = function(pstLikeId){
        // fetch post's like button
        let reactBtn = $(`#post-react-${pstLikeId}`);
        
        // Listener to display emojis
        emojiDisplay(pstLikeId, "post");

        // Listener to display reaction's list of users
        reactionListDisplay(pstLikeId, "post");

        // for reacting post
        reactPost(`post-like-${pstLikeId}`, pstLikeId);
        reactPost(`post-love-${pstLikeId}`, pstLikeId);
        reactPost(`post-haha-${pstLikeId}`, pstLikeId);
        reactPost(`post-wow-${pstLikeId}`, pstLikeId);
        reactPost(`post-sad-${pstLikeId}`, pstLikeId);
        reactPost(`post-angry-${pstLikeId}`, pstLikeId);

        reactBtn.click(function(event){
            // prevent default action
            event.preventDefault();

            // Send new ajax request
            $.ajax({
                method: "GET",
                url: reactBtn.prop("href"),
                success: function(data){
                    // if like added then increase likes count and change like icon
                    if(data.reactAdded == "like"){

                        modifyReactElement(reactBtn, data.likeAdded, "post", "like", data.reactionRemoved, `<i class="fa-solid fa-thumbs-up"></i>`, pstLikeId, `post-like-count-${pstLikeId}`, data.count, data.user, data.target);
                        

                    }
                    else if(data.reactAdded == "love"){

                        modifyReactElement(reactBtn, data.loveAdded, "post", "love", data.reactionRemoved, `<img src="/images/Love.gif" alt="">`, pstLikeId, `post-like-count-${pstLikeId}`, data.count, data.user, data.target);

                    }
                    else if(data.reactAdded == "haha"){

                        modifyReactElement(reactBtn, data.hahaAdded, "post", "haha", data.reactionRemoved, `<img src="/images/Haha.gif" alt="">`, pstLikeId, `post-like-count-${pstLikeId}`, data.count, data.user, data.target);

                    }
                    else if(data.reactAdded == "wow"){

                        modifyReactElement(reactBtn, data.wowAdded, "post", "wow", data.reactionRemoved, `<img src="/images/Wow.gif" alt="">`, pstLikeId, `post-like-count-${pstLikeId}`, data.count, data.user, data.target);

                    }
                    else if(data.reactAdded == "sad"){

                        modifyReactElement(reactBtn, data.sadAdded, "post", "sad", data.reactionRemoved, `<img src="/images/Sad.gif" alt="">`, pstLikeId, `post-like-count-${pstLikeId}`, data.count, data.user, data.target);

                    }
                    else{

                        modifyReactElement(reactBtn, data.angryAdded, "post", "angry", data.reactionRemoved, `<img src="/images/Angry.gif" alt="">`, pstLikeId, `post-like-count-${pstLikeId}`, data.count, data.user, data.target);

                    }

                    
                },
                error: function(error){
                    console.log(error);
                }
            });
        })
    }

    // Comment Like action
    let likeComment = function(cmtLikeId){
        // fetch comment's like button
        let reactBtn = $(`#comment-react-${cmtLikeId}`);
        
        // Listener to display emojis
        emojiDisplay(cmtLikeId, "comment");

        // Listener to display reaction's list of users
        reactionListDisplay(cmtLikeId, "comment");

        // for reacting comment
        reactComment(`comment-like-${cmtLikeId}`, cmtLikeId);
        reactComment(`comment-love-${cmtLikeId}`, cmtLikeId);
        reactComment(`comment-haha-${cmtLikeId}`, cmtLikeId);
        reactComment(`comment-wow-${cmtLikeId}`, cmtLikeId);
        reactComment(`comment-sad-${cmtLikeId}`, cmtLikeId);
        reactComment(`comment-angry-${cmtLikeId}`, cmtLikeId);

        reactBtn.click(function(event){
            // prevent default action
            event.preventDefault();

            // Send new ajax request
            $.ajax({
                method: "GET",
                url: reactBtn.prop("href"),
                success: function(data){
                    // if like added then increase likes count and change like icon
                    if(data.reactAdded == "like"){

                        modifyReactElement(reactBtn, data.likeAdded, "comment", "like", data.reactionRemoved, `<i class="fa-solid fa-thumbs-up"></i>`, cmtLikeId, `comment-like-count-${cmtLikeId}`, data.count, data.user, data.target);
                        

                    }
                    else if(data.reactAdded == "love"){

                        modifyReactElement(reactBtn, data.loveAdded, "comment", "love", data.reactionRemoved, `<img src="/images/Love.gif" alt="">`, cmtLikeId, `comment-like-count-${cmtLikeId}`, data.count, data.user, data.target);

                    }
                    else if(data.reactAdded == "haha"){

                        modifyReactElement(reactBtn, data.hahaAdded, "comment", "haha", data.reactionRemoved, `<img src="/images/Haha.gif" alt="">`, cmtLikeId, `comment-like-count-${cmtLikeId}`, data.count, data.user, data.target);

                    }
                    else if(data.reactAdded == "wow"){

                        modifyReactElement(reactBtn, data.wowAdded, "comment", "wow", data.reactionRemoved, `<img src="/images/Wow.gif" alt="">`, cmtLikeId, `comment-like-count-${cmtLikeId}`, data.count, data.user, data.target);

                    }
                    else if(data.reactAdded == "sad"){

                        modifyReactElement(reactBtn, data.sadAdded, "comment", "sad", data.reactionRemoved, `<img src="/images/Sad.gif" alt="">`, cmtLikeId, `comment-like-count-${cmtLikeId}`, data.count, data.user, data.target);

                    }
                    else{

                        modifyReactElement(reactBtn, data.angryAdded, "comment", "angry", data.reactionRemoved, `<img src="/images/Angry.gif" alt="">`, cmtLikeId, `comment-like-count-${cmtLikeId}`, data.count, data.user, data.target);

                    }

                    
                },
                error: function(error){
                    console.log(error);
                }
            });
        })
    }


    // Function adding event listener to display reaction's list of users on mouse over to count
    let reactionListDisplay = function(targetId, target){

        let comment = $(`#${target}-react-count-${targetId}`);
        let reactions = $(`#reactions-container-${target}-${targetId}`);


        comment.on("mouseover", function(){
            reactions.css({
                display: "block",
                "z-index": 1
            });
            
        });

        reactions.on("mouseover", function(){
            reactions.css({
                display: "block",
                "z-index": 1
            });
        });

        comment.on("mouseout", function(){
            reactions.css({
                display: "none",
                "z-index": -1
            });
        });

        reactions.on("mouseout", function(){
            reactions.css({
                display: "none",
                "z-index": -1
            });
        });

        // Get all buttons and their respective lists
        let reactBtns = $(`#${target}-react-added-${targetId} > button`);

        let reactLsts = $(`#${target}-react-list-${targetId} > .react-list`);

        // Add event listener to them for displaying respective list on respective buttons click
        for(let i=0 ; i<reactBtns.length ; i++){
            getReactions(reactBtns[i], reactLsts[i]);
            removeReactions(reactBtns[i], reactLsts[i]);
        }

    };

    // Function adding event listener to btn and list.
    // i.e. display list only when button is in focus
    function getReactions(btn, lst){
        btn.addEventListener("focusin", function(){
            lst.style.display = "block";
        });
    }
    
    // Function adding event listener to btn and list.
    // i.e. hide list when button is not in focus
    function removeReactions(btn, lst){
        btn.addEventListener("focusout", function(){
            lst.style.display = "none";
        });
    }

    // Function adding event listener to display various reactions on mouse over like icon
    let emojiDisplay = function(targetId, target){

        // fetch post's like button
        let likeBtn = $(`#${target}-react-${targetId}`);
        // Fetch emoji container
        let emoji = $(`#emoji-container-${target}-${targetId}`);

        // Dislay emoji container only on mouseOver on like and emoji container
        likeBtn.on("mouseover", function(){
            emoji.css({
                display: "flex",
                "justify-content": "space-around",
                "align-items": "center",
                "z-index": 1
            });
        });

        likeBtn.on("mouseout", function(){
            emoji.css({
                display: "none",
                "z-index": -1
            });
        });

        emoji.on("mouseover", function(){
            emoji.css({
                display: "flex",
                "justify-content": "space-around",
                "align-items": "center",
                "z-index": 1
            });
        });

        emoji.on("mouseout", function(){
            emoji.css({
                display: "none",
                "z-index": -1
            });
        });

    };


    // Action on post creation
    let createPost = function(){
        // fetch add post form
        let addPostForm = $("#add-post-form");

        addPostForm.on("submit", function(event){
            // Prevent default action
            event.preventDefault();
        
            // Fetching form data. serialize() method does not return image uploaded with form.
            // Hence fetching form data using new FormData()
            let data = new FormData(addPostForm[0]);
            // Send new ajax request
            $.ajax({
                type: "post",
                url: "/post/create-post",
                processData: false,
                contentType: false,
                // serialize() fetch all field values like request.body
                data: data,
                success: function(data){
                    // create new li element for new post
                    let newPost = postItem(data.post);

                    // Prepend it to posts list
                    $("#post-list").prepend(newPost);

                    // Add action for delete button
                    deletePost(`post-delete-${data.post._id}`);

                    // Action for like button
                    likePost(data.post._id);

                    // Action for adding comment
                    createComment(`add-comment-form-${data.post._id}`);
                    // console.log(data);
                },
                error: function(err){
                    console.log(err);
                }
            });
        });
    };

    // Action on comment creation
    function createComment(commentFormLink){
        let addCommentForm = $(`#${commentFormLink}`);

        addCommentForm.submit(function(event){
            event.preventDefault();

            $.ajax({
                type: "post",
                url: "/post/create-comment",
                data: addCommentForm.serialize(),
                success: function(data){
                    // console.log(data.comment.post);
                    // create new li element for comment
                    let newComment = commentItem(data.comment);

                    // Prepend new li to comments list
                    $(`#${ data.comment.post._id }`).prepend(newComment);

                    // Action for delete comment button
                    deleteComment(`comment-delete-${data.comment._id}`);

                    // Action for like coment button
                    likeComment(data.comment._id);
                    // console.log(data);
                },
                error: function(err){
                    console.log(err);
                }
            });

        });
    }

    // Delete post action
    function deletePost(postId){
        let postDel = $(`#${postId}`);
        // console.log(postDel);

        postDel.click(function(event){
            event.preventDefault();

            $.ajax({
                method: "GET",
                url: postDel.prop("href"),
                success: function(data){
                    // remove post
                    $(`#post-${data.post}`).remove();
                },
                error: function(err){
                    console.log(err);
                }
            });
        });
    }

    // Delete action for comment
    function deleteComment(commentId){
        let commentDel = $(`#${commentId}`);

        // console.log(commentDel);
        commentDel.click(function(event){
            event.preventDefault();

            $.ajax({
                method: "GET",
                url: commentDel.prop("href"),
                success: function(data){
                    // console.log(data);
                    // Remove comment
                    $(`#${data.comment}`).remove();
                },
                error: function(err){
                    console.log(err);
                }
            });
        });
    }

    // Creates new comment li element and return
    function commentItem(comment){
        // console.log(comment);
        return `

        <li id="${ comment._id }">
        <div class="comment">
            <h5>${ comment.user.username }</h5>
            <p>${ comment.commentContent }</p>



            <div class="like-div">

                <div class="container">
                    <div class="content">
                        <div id="emoji-container-comment-${ comment._id }" class="emoji-container">
                            <div class="emoji">
                                <a id="comment-like-${ comment._id }" href="/post/comment-like/${ comment._id }">
                                    <i class="fa-solid fa-thumbs-up"></i>
                                </a>
                                <p>Like</p>
                            </div>
                            <div class="emoji">
                                <a id="comment-love-${ comment._id }" href="/post/comment-love/${ comment._id }">
                                    <img src="/images/Love.gif" alt="">
                                </a>
                                <p>Love</p>
                            </div>
                            <div class="emoji">
                                <a id="comment-haha-${ comment._id }" href="/post/comment-haha/${ comment._id }">
                                    <img src="/images/Haha.gif" alt="">
                                </a>
                                <p>Haha</p>
                            </div>
                            <div class="emoji extra">
                                <a id="comment-wow-${ comment._id }" href="/post/comment-wow/${ comment._id }">
                                    <img src="/images/Wow.gif" alt="">
                                </a>
                                <p>Wow</p>
                            </div>
                            <div class="emoji extra">
                                <a id="comment-sad-${ comment._id }" href="/post/comment-sad/${ comment._id }">
                                    <img src="/images/Sad.gif" alt="">
                                </a>
                                <p>Sad</p>
                            </div>
                            <div class="emoji">
                                <a id="comment-angry-${ comment._id }" href="/post/comment-angry/${ comment._id }">
                                    <img src="/images/Angry.gif" alt="">
                                </a>
                                <p>Angry</p>
                            </div>
                        </div>
                    </div>
            
                    <a class="post-like-btn" id="comment-react-${ comment._id }" href="/post/comment-like/${ comment._id }"><i class="fa-regular fa-thumbs-up"></i></a>
            
                </div>

                <div class="reaction-count-display">

                    <div id="reactions-container-comment-${ comment._id }" class="reactions-container">
                        <div class="react-content">
                            <div class="react-added" id="comment-react-added-${ comment._id }">
                                
                            </div>
                            <div class="react-lists-container" id="comment-react-list-${ comment._id }">
            
                            </div>
                            
                        </div>
                        
                            
                            
                    </div>
            
                    <p id="comment-react-count-${ comment._id }" class="likes-count">
                        <span id="comment-react-added-icon-${ comment._id }">
                            
                        </span>
                
                        <span id="comment-like-count-${ comment._id }">0</span>
                        
                    </p>
            
                </div>

                
            </div>



        </div>

        <div class="comment-delete">
            <a id="comment-delete-${ comment._id }" href="/post/delete-comment/${ comment._id }"><i class="fa-solid fa-trash-can"></i></a>
        </div>
        
    </li>

        `;
    }

    // Creates new Post li element and return
    function postItem(post){
        // console.log(post);

        let postImg = "";

        if(post.postImage){
            postImg = `<img class="post-img" src="${ post.postImage }" alt="Image not available">`;
        }

        return $(`

        <li id="post-${ post._id }">
            <div class="post">
            <h5>${ post.user.username }</h5>
            <div class="post-body">
                <div class="post-content">
                    
                    <div>
                        <p>${ post.postContent }</p>

                        ${ postImg }

                    </div>


                    <div class="like-div">

                        <div class="container">
                            <div class="content">
                                <div id="emoji-container-post-${ post._id }" class="emoji-container">
                                    <div class="emoji">
                                        <a id="post-like-${ post._id }" href="/post/post-like/${ post._id }">
                                            <i class="fa-solid fa-thumbs-up"></i>
                                        </a>
                                        <p>Like</p>
                                    </div>
                                    <div class="emoji">
                                        <a id="post-love-${ post._id }" href="/post/post-love/${ post._id }">
                                            <img src="/images/Love.gif" alt="">
                                        </a>
                                        <p>Love</p>
                                    </div>
                                    <div class="emoji">
                                        <a id="post-haha-${ post._id }" href="/post/post-haha/${ post._id }">
                                            <img src="/images/Haha.gif" alt="">
                                        </a>
                                        <p>Haha</p>
                                    </div>
                                    <div class="emoji extra">
                                        <a id="post-wow-${ post._id }" href="/post/post-wow/${ post._id }">
                                            <img src="/images/Wow.gif" alt="">
                                        </a>
                                        <p>Wow</p>
                                    </div>
                                    <div class="emoji extra">
                                        <a id="post-sad-${ post._id }" href="/post/post-sad/${ post._id }">
                                            <img src="/images/Sad.gif" alt="">
                                        </a>
                                        <p>Sad</p>
                                    </div>
                                    <div class="emoji">
                                        <a id="post-angry-${ post._id }" href="/post/post-angry/${ post._id }">
                                            <img src="/images/Angry.gif" alt="">
                                        </a>
                                        <p>Angry</p>
                                    </div>
                                </div>
                            </div>
                    
                            <a class="post-like-btn" id="post-react-${ post._id }" href="/post/post-like/${ post._id }"><i class="fa-regular fa-thumbs-up"></i></a>
                    
                        </div>

                        <div class="reaction-count-display">

                            <div id="reactions-container-post-${ post._id }" class="reactions-container">
                                <div class="react-content">
                                    <div class="react-added" id="post-react-added-${ post._id }">
                                        
                                    </div>
                                    <div class="react-lists-container" id="post-react-list-${ post._id }">
                    
                                    </div>
                                    
                                </div>     
                                    
                            </div>
                    
                            <p id="post-react-count-${ post._id }" class="likes-count">
                                <span id="post-react-added-icon-${ post._id }">
                                    
                                </span>
                        
                                <span id="post-like-count-${ post._id }">0</span>
                                
                            </p>
                    
                        </div>
                        
                        
                    </div>



                </div>
                <div class="post-comment">
                    <div class="comment-form">
                        <form action="/post/create-comment" id="add-comment-form-${ post._id }" method="post">
                            <input type="text" name="commentContent" placeholder="Add your comment here..">
                            <input type="hidden" name="post" value="${ post._id }">
                            <button type="submit">Post</button>
                        </form>
                    </div>
                    
                </div>
            
            </div>
            
            <div class="post-delete">
                <a id="post-delete-${ post._id }" href="/post/post-delete/${ post._id }"><i class="fa-regular fa-trash-can"></i></a>
            </div>
            
            </div>

            
            <div id="comment-section">
            <h3 class="head">
                Comments
            </h3>
            <ul id="${ post._id }" class="comment-list">
                
            </ul>
            </div>


        </li>

        `);
    }



    // Action for accepting request
    function acceptRequest(id){
        let elem = $(`#request-accept-${id}`);

        elem.click(function(event){
            event.preventDefault();

            $.ajax({
                method: "GET",
                url: elem.prop("href"),
                success: function(data){
                    // console.log(data);
                    // Remove accept button after accepting request
                    elem.remove();

                    // Create and append new start chat button
                    let startChat = `<a class="friend-action" id="chat-${id}" href="/open-chat/${id}"><i class="fa-solid fa-comments"></i></a>`;
                    $(`#accept-${id}`).append(startChat);

                    // Modify that start chat buttons default actions
                    openChat(document.getElementById(`chat-${id}`));
                },
                error: function(err){
                    console.log(err);
                }
            });
        })
    }


    // Sending frnd request action
    function addFriend(id){
        let elem = $(`#add-friend-${id}`);

        elem.click(function(event){
            event.preventDefault();

            $.ajax({
                method: "GET",
                url: elem.prop("href"),
                success: function(data){
                    // console.log(data);
                    // Remove Add friend button
                    elem.remove();

                    // Add request sent
                    $(`#friend-add-${id}`).append(`<p class="request-sent">Request Sent</p>`);
                },
                error: function(err){
                    console.log(err);
                }
            });
        })
    }


    // Calling create post action on page load
    createPost();

}


