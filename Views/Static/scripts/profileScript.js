// fetch elements
var pen = document.getElementById("write-pen");
var cancelEdit = document.getElementById("cancel-edit");
var userEditForm = document.getElementById("edit-user-form");

// If user edit form is present i.e.
// User is accessing self profile page
if(userEditForm){

    // fetch all input elements for form
    var inputElements = userEditForm.children;

    // Add click event listener for pen icon
    // Enables all input elements and makes self as disabled and enables cancel button
    pen.addEventListener("click", function(){
        cancelEdit.disabled = false;
        for(let elem of inputElements){
            elem.disabled = false;
        }
        pen.disabled = true;
    });

    // Add click event listener for cancel Edit icon
    // disables all input elements and makes self as disabled and enables pen icon
    cancelEdit.addEventListener("click", function(){
        cancelEdit.disabled = true;
        for(let elem of inputElements){
            elem.disabled = true;
        }
        pen.disabled = false;
    });

}
