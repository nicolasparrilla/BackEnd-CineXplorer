const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const sgTransport = require('nodemailer-sendgrid-transport');


// Saving the context of this module inside the _the variable
_this = this

// Async function to get the User List
exports.getUsers = async function (query, page, limit) {

    // Options setup for the mongoose paginate
    var options = {
        page,
        limit
    }
    // Try Catch the awaited promise to handle the error 
    try {
        console.log("Query",query)
        var Users = await User.paginate(query, options)
        // Return the Userd list that was retured by the mongoose promise
        return Users;

    } catch (e) {
        // return a Error message describing the reason 
        console.log("error services",e)
        throw Error('Error while Paginating Users');
    }
}

exports.createUser = async function (user) {
    try {
        // Primero, verifica si el email ya está registrado
        let existingUser = await User.findOne({ email: user.email });
        if (existingUser) {
            throw new Error("El email ya está registrado");
        }

        // Si el email no está registrado, procede a crear el nuevo usuario
        var hashedPassword = bcrypt.hashSync(user.password, 8);

        var newUser = new User({
            name: user.name,
            email: user.email,
            date: new Date(),
            password: hashedPassword
        });

        // Guardar el nuevo usuario
        var savedUser = await newUser.save();
        var token = jwt.sign({ id: savedUser._id }, process.env.SECRET, {
            expiresIn: 86400 // expira en 24 horas
        });
        return token;
    } catch (e) {
        // Devolver un mensaje de error describiendo la razón
        if (e.message === "El email ya está registrado") {
            throw e; // Re-lanzar el error específico
        } else {
            console.log(e);
            throw new Error("Error al crear el usuario");
        }
    }
};

exports.updateUser = async function (user) {
    
    var id = {name :user.name}
    console.log(id)
    try {
        //Find the old User Object by the Id
        var oldUser = await User.findOne(id);
        console.log (oldUser)
    } catch (e) {
        throw Error("Error occured while Finding the User")
    }
    // If no old User Object exists return false
    if (!oldUser) {
        return false;
    }
    //Edit the User Object
    var hashedPassword = bcrypt.hashSync(user.password, 8);
    oldUser.name = user.name
    oldUser.email = user.email
    oldUser.password = hashedPassword
    try {
        var savedUser = await oldUser.save()
        return savedUser;
    } catch (e) {
        throw Error("And Error occured while updating the User");
    }
}

exports.deleteUser = async function (id) {
    console.log(id)
    // Delete the User
    try {
        var deleted = await User.remove({
            _id: id
        })
        if (deleted.n === 0 && deleted.ok === 1) {
            throw Error("User Could not be deleted")
        }
        return deleted;
    } catch (e) {
        throw Error("Error Occured while Deleting the User")
    }
}


exports.loginUser = async function (user) {

    // Creating a new Mongoose Object by using the new keyword
    try {
        // Find the User 
        console.log("login:",user)
        var _details = await User.findOne({
            email: user.email
        });
        var passwordIsValid = bcrypt.compareSync(user.password, _details.password);
        if (!passwordIsValid) return 0;

        var token = jwt.sign({
            id: _details._id
        }, process.env.SECRET, {
            expiresIn: 86400 // expires in 24 hours
        });
        return {token:token, user:_details};
    } catch (e) {
        // return a Error message describing the reason     
        throw Error("Error while Login User")
    }

}


// Function to add a movie to a list
exports.addMovieToList = async function (userId, listId, movieId) {
    try {
        var user = await User.findById(userId);
        var list = user.lists.find(list => list.id === listId);
        if (list) {
            list.idMovies.push(movieId);
            await user.save();
            return list;
        } else {
            throw Error("List not found");
        }
    } catch (e) {
        throw Error("Error while adding movie to list");
    }
};

// Function to remove a movie from a list
exports.removeMovieFromList = async function (userId, listId, movieId) {
    try {
        var user = await User.findById(userId);
        var list = user.lists.find(list => list.id === listId);
        if (list) {
            list.idMovies = list.idMovies.filter(id => id !== movieId);
            await user.save();
            return list;
        } else {
            throw Error("List not found");
        }
    } catch (e) {
        throw Error("Error while removing movie from list");
    }
};

// Function to get lists for a user
exports.getListsForUser = async function (userId) {
    try {
        var user = await User.findById(userId);
        return user.lists;
    } catch (e) {
        throw Error("Error while fetching lists");
    }
};

// Function to check if a movie already exists in a list
exports.checkDuplicateMovie = async function (userId, listId, movieId) {
    try {
        var user = await User.findById(userId);
        var list = user.lists.find(list => list.id === listId);
        if (list) {
            // Check if movieId already exists in idMovies array
            return list.idMovies.includes(movieId);
        } else {
            throw Error("List not found");
        }
    } catch (e) {
        throw Error("Error while checking duplicate movie");
    }
};


// Configura nodemailer para usar SendGrid
const transporter = nodemailer.createTransport(sgTransport({
    auth: {
        api_key: process.env.SENDGRID_API_KEY
    }
}));

// Generar token de recuperación
exports.generateResetToken = (user) => {
    const payload = { id: user._id };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

/*
// Enviar correo electrónico con el enlace de recuperación
exports.sendResetEmail = async (email, token) => {
    const resetLink = `http://localhost:3000/reset-password?token=${token}`;
    const mailOptions = {
        from: 'cinexplorer@outlook.com',
        to: email,
        subject: 'Recuperación de contraseña',
        text: `Hacé clic en el siguiente enlace para recuperar tu contraseña: ${resetLink}`,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log("Correo enviado exitosamente");
    } catch (error) {
        console.error("Error al enviar el correo:", error);
        throw error;
    }
};
*/

exports.sendResetEmail = async (email, token) => {
    const resetLink = `http://localhost:3000/recupero?token=${token}`;
    const mailOptions = {
        from: 'cinexplorer@outlook.com',
        to: email,
        subject: 'Recuperación de contraseña',
        text: `Hacé clic en el siguiente enlace para recuperar tu contraseña: ${resetLink}`,
        html: `<p>Hacé clic en el siguiente enlace para recuperar tu contraseña:</p><a href="${resetLink}">${resetLink}</a>`
    };

    try {
        console.log("Intentando enviar correo a:", email);
        const info = await transporter.sendMail(mailOptions);
        console.log("Correo enviado exitosamente. ID del mensaje:", info.messageId);
        return info;
    } catch (error) {
        console.error("Error al enviar el correo:", error);
        throw error;
    }
};

// Verificar token de recuperación
exports.verifyResetToken = (token) => {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.id;
    } catch (error) {
        console.error('Error al verificar el token:', error);
        return null;
    }
};