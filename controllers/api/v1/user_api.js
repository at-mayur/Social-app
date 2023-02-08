const jwt = require("jsonwebtoken");
const User = require("../../../models/user");

require("dotenv").config();

module.exports.createSession = async function(request, response){

    try {
        // finding user using email
        const user = await User.findOne({email: request.body.email});

        if(!user || user.password!=request.body.password){
            // console.log(user);
            return response.status(400).json({
                msg: "User or password Invalid",
                token: ""
            });
        }

        return response.status(200).json({
            msg: "User found..!!",
            // creating a JWT token
            token: jwt.sign({
                id: user.id,
                name: user.username,
                email: user.email,
            }, process.env.JWT_SECRET, { expiresIn: 60*5 })
        });

    } catch (error) {
        console.log(error);
        return response.status(500).json({
            msg: "Internal Server Error",
            token: ""
        });
    }
};