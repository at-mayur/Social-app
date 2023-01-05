
function homeController(request, response){
    return response.render("home");
}

function profileController(request, response){
    return response.render("profile");
}

function signUpController(request, response){
    console.log(request.body);
    return response.render("signup");
}

function signInController(request, response){
    console.log(request.body);
    return response.render("signin");
}




module.exports = {
    homeController: homeController,
    profileController: profileController,
    signUpController: signUpController,
    signInController: signInController,
    createUser: createUser,
    createSession: createSession
};