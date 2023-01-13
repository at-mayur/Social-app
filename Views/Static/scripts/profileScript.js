var pen = document.getElementById("write-pen");
var cancelEdit = document.getElementById("cancel-edit");
var userEditForm = document.getElementById("edit-user-form");
var inputElements = userEditForm.children;
pen.addEventListener("click", function(){
    cancelEdit.disabled = false;
    for(let elem of inputElements){
        elem.disabled = false;
    }
    pen.disabled = true;
});
cancelEdit.addEventListener("click", function(){
    cancelEdit.disabled = true;
    for(let elem of inputElements){
        elem.disabled = true;
    }
    pen.disabled = false;
});