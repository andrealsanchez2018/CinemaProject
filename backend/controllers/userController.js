/* Contiene las funciones o métodos para la manipulación de users */

const User = require('../models/User');

// Importar módulo File System 
const fs = require('fs');
// Importar modulo path
const path = require('path');

//Función de registrar usuario
function registerUser(req, res) {
    var user = new User();
    var parameters = req.body;

    user.names = parameters.names;
    user.lastNames = parameters.lastNames;
    user.cellphone = parameters.cellphone;
    user.birthdate = parameters.birthdate;
    user.email = parameters.email;
    user.pass = parameters.pass;
    user.rol = 'usuario'; //Dato rol quemado - usuario por defecto
    user.image = null;
    user.affiliateCard = "free";

    //Buscar el usuario apra encontrar is tiene imagen de perfil y borrarla
    User.findOne({ email: parameters.email }, (err, userFound) => {
        if (err) {
            res.status(500).send({ message: "Error en el servidor" });
        } if (!userFound) {
            //Función save() para interactuar con la DB
            user.save((err, userNew) => {
                if (!userNew) {
                    res.status(200).send({ message: "No fue posible realizar el registro" })
                } else {
                    res.status(200).send({
                        message: "Usuario creado",
                        user: userNew
                    });
                }
            });
        } else {
            res.status(200).send({
                message: "El correo ya existe en nuestra plataforma"
            });
        }

    });



}

//Función de mostrar todos los usuarios
function getAllUsers(req, res) {
    User.find((err, usersFound) => {
        if (err) {
            res.status(500).send({ message: "Error en el servidor" });
        } else {
            if (!usersFound) {
                res.status(200).send({ message: "No fue posible encontrar usuarios" });
            } else {
                res.status(200).send({
                    message: "Usuarios encontrados",
                    users: usersFound
                });
            }
        }
    });

}

//Función de mostrar usuario en especifico
function getUser(req, res) {
    var userId = req.params.id;
    User.findById(userId, (err, userFound) => {
        if (err) {
            res.status(500).send({ message: "Error en el servidor" });
        } else {
            if (!userFound) {
                res.status(200).send({ message: "No fue posible encontrar el usuario" });
            } else {
                res.status(200).send({
                    message: "Usuario encontrado",
                    user: userFound
                });
            }
        }
    });

}

//Función de actualizar usuario
function updateUser(req, res) {
    var userId = req.params.id;
    var newUserData = req.body;

    User.findByIdAndUpdate(userId, newUserData, (err, updatedUser) => {
        if (err) {
            res.status(200).send({ message: "Error en el servidor" });
        } else {
            if (!updatedUser) {
                res.status(200).send({ message: "No fue posible actualizar el usuario" });
            } else {
                res.status(200).send({
                    message: "Usuario actualizado",
                    user: updatedUser
                });
            }
        }
    });
}

//Función de eliminar usuario
function deleteUser(req, res) {
    var userId = req.params.id;
    var imagen = req.params;
    var ruta = './files/users/';

    console.log(req.params);
    //Buscar el usuario apra encontrar is tiene imagen de perfil y borrarla
    User.findOne({ _id: userId }, (err, userFound) => {
        if (err) {
            res.status(500).send({ message: "Error en el servidor" });
        } else if (!userFound) {
            res.status(200).send({ message: "Usuario inexistente" });
            // }else if(userFound.image = !null)
            // {
            //     //borrar archivo de imagen
            //     fs.unlink(ruta+userFound.image, err =>{
            //         if (err) {
            //             res.status(200).send({message:`Error ${err}` });
            //         } 
            //     });
            //fin de borrar archivo
        }
    });


    User.findByIdAndDelete(userId, (err, deletedUser) => {
        if (err) {
            res.status(500).send({ message: "Error en el servidor" });
        } else {
            if (!deletedUser) {
                res.status(200).send({ message: "No fue posible eliminar el usuario" });
            } else {
                res.status(200).send({
                    message: "Usuario eliminado",
                    user: deletedUser
                });
            }
        }
    });
}


function login(req, res) {
    var parametros = req.body;
    var emailUser = parametros.email;
    var passUser = parametros.pass;

    User.findOne({ email: emailUser }, (err, userLogin) => {
        if (err) {
            res.status(500).send({ message: "Error en el servidor" });
        } else {
            if (!userLogin) {
                res.status(200).send({ message: "Usuario inexistente" });
            } else {
                if (userLogin.pass != passUser) {
                    res.status(200).send({ message: "Contraseña incorrecta" });
                } else {
                    res.status(200).send({
                        message: "Usuario logueado de manera exitosa",
                        user: userLogin
                    });
                }
            }
        }
    });


}

function uploadUserImage(req, res) {

    var usuarioId = req.params.id;
    var nombreArchivo = "No has subido ninguna imagen...";
    var ruta = './files/users/';
    console.log("intentando subir imagen" + req.files.image.name);

    //Validar si efectivamente se esta enviando un archivo

    if (req.files) {
        // Vamos a ir analizando la ruta del archivo, el nombre y la extención
        // C:\\usuarios\descargas\imagen.png
        var rutaArchivo = req.files.image.path;
        console.log(`Ruta archivo: ${rutaArchivo}`);

        // Haremos un split para separar elementos
        // Esto nos generará un arreglo de datos
        var partirArchivo = rutaArchivo.split('\\');
        console.log(`partir archivo: ${partirArchivo}`);

        //Acceder a la posicion que contiene el nombre del archivo
        var nombreArchivo = partirArchivo[2];
        console.log(`Posición dato: ${nombreArchivo}`);

        //Haremos un split para separar el nombre del archivo de la extencion
        //['imagen','png']
        var extensionImg = nombreArchivo.split('\.');
        console.log(`partir imagen: ${extensionImg}`);

        //Accedemos a la pocision de la extencion de l archivo
        var extensionArchivo = extensionImg[1];
        console.log(`Extension archivo: ${extensionArchivo}`);

        // Validar si el formato del archivo es aceptable 
        if (extensionArchivo == 'png' || extensionArchivo == 'jpg' || extensionArchivo == 'jpeg') {

            //Buscar que hay en image si existe algún archivo lo elimina para dar paso al nuevo
            User.findOne({ _id: usuarioId }, (err, userFound) => {
                if (err) {

                    res.status(500).send({ message: "Error en el servidor" });
                }
                else if (userFound.image) {
                    console.log(ruta + userFound.image);
                    fs.open(ruta + userFound.image, (err, data) => {
                        if (err) {
                            console.log("no se encontro el archivo");
                            //res.status(200).send({message:`Error crash ${err}` });
                        } else if (!data) {
                            console.log("error de lectura");
                            //res.status(200).send({message:`Error lectura ${err}` });
                        } else {
                            //borrar archivo de imagen para actualizar
                            fs.unlink(ruta + userFound.image, (error) => {
                                if (error) {
                                    //res.status(200).send({message: });
                                    console.log(`Error ${error}`);

                                }
                            });
                        }
                    });

                }
            });

            //Actulizar del usuario el campo imagen
            User.findByIdAndUpdate(usuarioId, { image: nombreArchivo }, (err, usuarioConImg) => {
                if (err) {
                    res.status(500).send({ message: "Error en el servidor" });
                } else {
                    if (!usuarioConImg) {
                        res.status(200).send({ message: "No fue posible subir la imagen" });
                    } else {
                        res.status(200).send({
                            message: "Imagen anexada",
                            image: nombreArchivo,
                            user: usuarioConImg
                        })
                    }
                }
            });
        } else {
            res.status(200).send({ message: "Formato invalido! El archivo no es una imagen" })
        }
    } else {
        res.status(200).send({ message: "No has subido imagen" });
    }
}

function getUserImage(req, res) {
    //pedir el archivo que queros mostrar
    var archivo = req.params.imageFile;
    //ubicacion del archivo 
    var ruta = './files/users/' + archivo;

    //validar si existe o no 
    //fs.exists('la ruta del archivo a buscar, (existencia)=>{}')

    fs.exists(ruta, (exists) => {
        if (exists) {
            res.sendFile(path.resolve(ruta));
        } else {
            res.status(200).send({ message: "Imagen no encontrada" });
        }
    });
}


//Exportar paquete de funciones
module.exports = {
    registerUser,
    getAllUsers,
    getUser,
    updateUser,
    deleteUser,
    login,
    uploadUserImage,
    getUserImage

}