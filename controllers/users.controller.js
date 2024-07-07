var UserService = require('../services/user.service');
const User = require('../models/User.model');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');

// Saving the context of this module inside the _the variable
_this = this;

// Async Controller function to get the To do List
exports.getUsers = async function (req, res, next) {

    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 10;
    try {
        var Users = await UserService.getUsers({}, page, limit)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, data: Users, message: "Succesfully Users Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(400).json({status: 400, message: e.message});
    }
}
exports.getUsersByMail = async function (req, res, next) {

    // Check the existence of the query parameters, If doesn't exists assign a default value
    var page = req.query.page ? req.query.page : 1
    var limit = req.query.limit ? req.query.limit : 10;
    let filtro= {email: req.body.email}
    console.log(filtro)
    try {
        var Users = await UserService.getUsers(filtro, page, limit)
        // Return the Users list with the appropriate HTTP password Code and Message.
        return res.status(200).json({status: 200, data: Users, message: "Succesfully Users Recieved"});
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(400).json({status: 400, message: e.message});
    }
}

exports.createUser = async function (req, res, next) {
    // Req.Body contains the form submit values.
    console.log("llegue al controller", req.body);
    var User = {
        name: req.body.name,
        email: req.body.email,
        password: req.body.password
    };

    try {
        // Calling the Service function with the new object from the Request Body
        var createdUser = await UserService.createUser(User);
        return res.status(201).json({ createdUser, message: "Usuario creado exitosamente" });
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        console.log(e);
        return res.status(400).json({ status: 400, message: e.message });
    }
};

exports.updateUser = async function (req, res, next) {
    // Id is necessary for the update
    if (!req.body.name) {
        return res.status(400).json({status: 400., message: "Name be present"})
    }
    
    var User = {
       
        name: req.body.name ? req.body.name : null,
        email: req.body.email ? req.body.email : null,
        password: req.body.password ? req.body.password : null
    }

    try {
        var updatedUser = await UserService.updateUser(User)
        return res.status(200).json({status: 200, data: updatedUser, message: "Succesfully Updated User"})
    } catch (e) {
        return res.status(400).json({status: 400., message: e.message})
    }
}

exports.removeUser = async function (req, res, next) {
    var id = req.body.id;
    try {
        var deleted = await UserService.deleteUser(id);
        res.status(200).send("Succesfully Deleted... ");
    } catch (e) {
        return res.status(400).json({status: 400, message: e.message})
    }
}


exports.loginUser = async function (req, res, next) {
    // Req.Body contains the form submit values.
    console.log("body",req.body)
    var User = {
        email: req.body.email,
        password: req.body.password
    }
    try {
        // Calling the Service function with the new object from the Request Body
        var loginUser = await UserService.loginUser(User);
        if (loginUser===0)
            return res.status(400).json({message: "Error en la contraseña"})
        else
            return res.status(201).json({loginUser, message: "Succesfully login"})
    } catch (e) {
        //Return an Error Response Message with Code and the Error Message.
        return res.status(400).json({status: 400, message: "Invalid username or password"})
    }
}

exports.addMovieToList = async function (req, res, next) {
    var userId = req.body.userId;
    var listId = req.body.listId;
    var movieId = req.body.movieId;
    try {
        var isDuplicate = await UserService.checkDuplicateMovie(userId, listId, movieId);
        if (!isDuplicate) {
            var list = await UserService.addMovieToList(userId, listId, movieId);
        }
        
        return res.status(200).json({ status: 200, data: list, message: "Successfully Added Movie to List" });
    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message });
    }
};

exports.removeMovieFromList = async function (req, res, next) {
    var userId = req.body.userId;
    var listId = req.body.listId;
    var movieId = req.body.movieId;
    try {
        var list = await UserService.removeMovieFromList(userId, listId, movieId);
        return res.status(200).json({ status: 200, data: list, message: "Successfully Removed Movie from List" });
    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message });
    }
};

exports.getListsForUser = async function (req, res, next) {
    var userId = req.body.userId;
    try {
        var lists = await UserService.getListsForUser(userId);
        return res.status(200).json({ status: 200, data: lists, message: "Successfully Retrieved Lists" });
    } catch (e) {
        return res.status(400).json({ status: 400, message: e.message });
    }
};

exports.forgotPassword = async function (req, res) {
    const { email } = req.body;
    try {
        if (!email) {
            return res.status(400).json({ message: 'El correo electrónico es requerido' });
        }
        
        console.log("Buscando usuario con email:", email);
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log("Usuario no encontrado");
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        
        console.log("Usuario encontrado, generando token");
        const resetToken = UserService.generateResetToken(user);
        
        console.log("Enviando correo de recuperación");
        await UserService.sendResetEmail(email, resetToken);
        
        res.status(200).json({ message: 'Correo de recuperación enviado' });
    } catch (error) {
        console.error("Error en forgotPassword:", error);
        res.status(500).json({ message: 'Error en la solicitud de recuperación de contraseña', error: error.message });
    }
};

exports.resetPassword = async function (req, res) {
    const { token, newPassword } = req.body;
    try {
        const userId = UserService.verifyResetToken(token);
        if (!userId) {
            return res.status(400).json({ message: 'Token inválido o expirado' });
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 8);

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { password: hashedPassword },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
        console.error('Error en resetPassword:', error);
        res.status(500).json({ message: 'Error en el restablecimiento de contraseña', error: error.message });
    }
};