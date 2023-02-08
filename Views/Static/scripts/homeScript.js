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

            let commentList = $(`#${postId} > li`);

            for(let commentLi of commentList){
                // console.log(commentLi.id);
                let commentId = commentLi.id;

                // For delete comment
                deleteComment(`comment-delete-${commentId}`);

                // for liking a comment
                likeComment(commentId);
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



    // Post Like action
    let likePost = function(pstLikeId){
        // fetch post's like button
        let likeBtn = $(`#post-like-${pstLikeId}`);

        likeBtn.click(function(event){
            // prevent default action
            event.preventDefault();

            // Send new ajax request
            $.ajax({
                method: "GET",
                url: likeBtn.prop("href"),
                success: function(data){
                    // if like added then increase likes count and change like icon
                    if(data.likeAdded){
                        likeBtn.html(`<i class="fa-solid fa-thumbs-up"></i>`);
                        let count = $(`#post-like-count-${pstLikeId}`).text();
                        $(`#post-like-count-${pstLikeId}`).text(++count);
                    }
                    // if like removed then decrement likes count and change like icon
                    else{
                        likeBtn.html(`<i class="fa-regular fa-thumbs-up"></i>`);
                        let count = $(`#post-like-count-${pstLikeId}`).text();
                        if(count>0){
                            $(`#post-like-count-${pstLikeId}`).text(--count);
                        }
                        
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
        let likeBtn = $(`#comment-like-${cmtLikeId}`);

        likeBtn.click(function(event){
            // prevent default action
            event.preventDefault();

            // Send new ajax request
            $.ajax({
                method: "GET",
                url: likeBtn.prop("href"),
                success: function(data){
                    // if like added then increase likes count and change like icon
                    if(data.likeAdded){
                        likeBtn.removeClass("grey");
                        likeBtn.addClass("blue");
                        let count = $(`#comment-like-count-${cmtLikeId}`).text();
                        $(`#comment-like-count-${cmtLikeId}`).text(++count);
                    }
                    // // if like removed then decrement likes count and change like icon
                    else{
                        likeBtn.removeClass("blue");
                        likeBtn.addClass("grey");
                        let count = $(`#comment-like-count-${cmtLikeId}`).text();
                        if(count>0){
                            $(`#comment-like-count-${cmtLikeId}`).text(--count);
                        }
                    }
                },
                error: function(error){
                    console.log(error);
                }
            });
        })
    }


    // Action on post creation
    let createPost = function(){
        // fetch add post form
        let addPostForm = $("#add-post-form");

        addPostForm.on("submit", function(event){
            // Prevent default action
            event.preventDefault();
        
            // Send new ajax request
            $.ajax({
                type: "post",
                url: "/post/create-post",
                // serialize() fetch all field values like request.body
                data: addPostForm.serialize(),
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
                <span class="like-span"><a id="comment-like-${ comment._id }" class="grey" href="/post/comment-like/${ comment._id }">Like</a></span>
                <span id="comment-like-count-${ comment._id }">0</span>
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

        return $(`

        <li id="post-${ post._id }">
            <div class="post">
            <h5>${ post.user.username }</h5>
            <div class="post-body">
                <div class="post-content">
                    <p>${ post.postContent }</p>
                    <div class="like-div">
                        <a id="post-like-${ post._id }" href="/post/post-like/${ post._id }"><i class="fa-regular fa-thumbs-up"></i></a>
                        <span id="post-like-count-${ post._id }">0</span>
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


