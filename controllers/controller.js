

function homeController(request, response){
    return response.render("home");
}

function profileController(request, response){
    return response.render("profile");
}

function signUpController(request, response){
    return response.render("signup");
}

function signInController(request, response){
    return response.render("signin");
}

function createSession(request, response){
    return response.redirect("/profile");
}


module.exports = {
    homeController: homeController,
    profileController: profileController,
    signUpController: signUpController,
    signInController: signInController,
    createSession: createSession
};