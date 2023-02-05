{

    $(document).ready(function(){
        let postList = $("#post-list > li");

        for(let postLi of postList){
            // console.log(postLi.id.split("-")[1]);
            let postId = postLi.id.split("-")[1];
            deletePost(`post-delete-${postId}`);
            createComment(`add-comment-form-${postId}`);
            likePost(postId);

            let commentList = $(`#${postId} > li`);

            for(let commentLi of commentList){
                // console.log(commentLi.id);
                let commentId = commentLi.id;

                deleteComment(`comment-delete-${commentId}`);
                likeComment(commentId);
            }

            
        }


        let requestAccept = $(".accept-request");

        for(let accReq of requestAccept){
            let id = accReq.id.split('-')[1];

            acceptRequest(id);
        }

        let friendAdd = $(".add-friend");

        for(let addFr of friendAdd){
            let id = addFr.id.split('-')[2];

            addFriend(id);
        }

        let pastChats = $("#user-past-chats li > a");

        for(let pastChat of pastChats){
            openChat(pastChat);
        }


    });



    function openChat(elem){
        elem.addEventListener("click", function(event){
            event.preventDefault();

            $.ajax({
                method: "GET",
                url: elem.getAttribute("href"),
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

    $("#user-chat-box-close").click(function(event){
        event.preventDefault();

        let chatList = $("#chat-messages-list");
        let chatUser = $("#user-chat-username");

        chatList.empty();
        chatUser.text("User Name");

        $("#msg-send-usr").val("");
        $("#current-chat").val("");

        $("#user-chat-box").removeClass("open-chat");

    });




    let likePost = function(pstLikeId){
        let likeBtn = $(`#post-like-${pstLikeId}`);

        likeBtn.click(function(event){
            event.preventDefault();

            $.ajax({
                method: "GET",
                url: likeBtn.prop("href"),
                success: function(data){
                    if(data.likeAdded){
                        likeBtn.html(`<i class="fa-solid fa-thumbs-up"></i>`);
                        let count = $(`#post-like-count-${pstLikeId}`).text();
                        $(`#post-like-count-${pstLikeId}`).text(++count);
                    }
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

    let likeComment = function(cmtLikeId){
        let likeBtn = $(`#comment-like-${cmtLikeId}`);

        likeBtn.click(function(event){
            event.preventDefault();

            $.ajax({
                method: "GET",
                url: likeBtn.prop("href"),
                success: function(data){
                    if(data.likeAdded){
                        likeBtn.removeClass("grey");
                        likeBtn.addClass("blue");
                        let count = $(`#comment-like-count-${cmtLikeId}`).text();
                        $(`#comment-like-count-${cmtLikeId}`).text(++count);
                    }
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



    let createPost = function(){
        let addPostForm = $("#add-post-form");

        addPostForm.on("submit", function(event){
            event.preventDefault();
        
            $.ajax({
                type: "post",
                url: "/post/create-post",
                data: addPostForm.serialize(),
                success: function(data){
                    let newPost = postItem(data.post);
                    $("#post-list").prepend(newPost);
                    deletePost(`post-delete-${data.post._id}`);
                    likePost(data.post._id);
                    createComment(`add-comment-form-${data.post._id}`);
                    // console.log(data);
                },
                error: function(err){
                    console.log(err);
                }
            });
        });
    };

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
                    let newComment = commentItem(data.comment);
                    $(`#${ data.comment.post._id }`).prepend(newComment);
                    deleteComment(`comment-delete-${data.comment._id}`);
                    likeComment(data.comment._id);
                    // console.log(data);
                },
                error: function(err){
                    console.log(err);
                }
            });

        });
    }

    function deletePost(postId){
        let postDel = $(`#${postId}`);
        // console.log(postDel);

        postDel.click(function(event){
            event.preventDefault();

            $.ajax({
                method: "GET",
                url: postDel.prop("href"),
                success: function(data){
                    $(`#post-${data.post}`).remove();
                },
                error: function(err){
                    console.log(err);
                }
            });
        });
    }

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
                    $(`#${data.comment}`).remove();
                },
                error: function(err){
                    console.log(err);
                }
            });
        });
    }

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




    function acceptRequest(id){
        let elem = $(`#request-accept-${id}`);

        elem.click(function(event){
            event.preventDefault();

            $.ajax({
                method: "GET",
                url: elem.prop("href"),
                success: function(data){
                    // console.log(data);
                    elem.remove();
                },
                error: function(err){
                    console.log(err);
                }
            });
        })
    }


    function addFriend(id){
        let elem = $(`#add-friend-${id}`);

        elem.click(function(event){
            event.preventDefault();

            $.ajax({
                method: "GET",
                url: elem.prop("href"),
                success: function(data){
                    // console.log(data);
                    elem.remove();
                    $(`#friend-add-${id}`).append(`<p class="request-sent">Request Sent</p>`);
                },
                error: function(err){
                    console.log(err);
                }
            });
        })
    }


    createPost();

}


