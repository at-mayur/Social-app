

function homeController(request, response){
    return response.render("home");
}

function profileController(request, response){
    return response.render("profile");
}

function signUpController(request, response){
    if(request.isAuthenticated()){
        return response.redirect("/profile");
    }
    return response.render("signup");
}

function signInController(request, response){
    if(request.isAuthenticated()){
        return response.redirect("/profile");
    }
    return response.render("signin");
}

function createSession(request, response){
    return response.redirect("/profile");
}

function removeSession(request, response){
    request.logout(function(error){
        if(error){
            console.log("Error signing off\n", error);
            return;
        }
    });

    return response.redirect("/");
}

module.exports = {
    homeController: homeController,
    profileController: profileController,
    signUpController: signUpController,
    signInController: signInController,
    createSession: createSession,
    removeSession: removeSession
};