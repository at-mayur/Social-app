
function homeController(request, response){
    return response.render("home");
}

function profileController(request, response){
    return response.render("profile");
}


module.exports = {
    homeController: homeController,
    profileController: profileController
};