/*====================================================================================*/
/*  IMPORTACIONES
/*====================================================================================*/
const express = require('express');
const bcrypt = require('bcryptjs');
const auth = require('../middlewares/auth');
/*====================================================================================*/
/*  INICIALIZACIÓN DE VARIABLES
/*====================================================================================*/
const app = express();
/*====================================================================================*/
/*  IMPORTACIÓN DE MODELOS
/*====================================================================================*/
const User = require('../models/user');
/*====================================================================================*/
/*  DEFINICION DE RUTAS
/*====================================================================================*/
/*====================================================================================*/
/*  LISTAR USUARIOS
/*====================================================================================*/
app.get('/', (request, response) => {
  /*  NÚMERO DE REGISTROS MOSTRADOS    */
  /*----------------------------------------------------------------------------------*/
  /*  Se obtiene el número de registros a listar.
  /*----------------------------------------------------------------------------------*/
  let offset = request.query.offset || 0;
  offset = Number(offset);
  /*----------------------------------------------------------------------------------*/
  /*  Se reliza la consulta.
  /*----------------------------------------------------------------------------------*/
  User.find({})
    .skip(offset)
    .limit(5)
    .exec((error, users) => {
      /*------------------------------------------------------------------------------*/
      /*  Se maneja el error.
      /*------------------------------------------------------------------------------*/
      if (error) {
        return response.status(500).json({
          ok: false,
          message: 'Error al obtener los usuarios.',
          errors: error
        });
      }
      /*------------------------------------------------------------------------------*/
      /*  Se realiza un conteo de los registros.
      /*------------------------------------------------------------------------------*/
      User.count((error, total) => {
        response.status(200).json({
          ok: true,
          users: users,
          total: total
        });
      });
    });
});

/*====================================================================================*/
/*  AGREGAR UN USUARIO
/*====================================================================================*/
app.post('/', auth.verifyToken, (request, response) => {
  /*----------------------------------------------------------------------------------*/
  /*  Se verifica que haya datos en la petición.
  /*----------------------------------------------------------------------------------*/
  if (request.body.value == 0) {
    return response.status(500).json({
      ok: false,
      message: 'No hay datos que guardar.'
    });
  }
  /*----------------------------------------------------------------------------------*/
  /*  Se extrae el contenido de la petición.
  /*----------------------------------------------------------------------------------*/
  const body = request.body;
  /*----------------------------------------------------------------------------------*/
  /*  Se instancian los atributos del modelo.
  /*----------------------------------------------------------------------------------*/
  const user = new User({
    name: body.name,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    image: body.image,
    role: body.role
  });
  /*----------------------------------------------------------------------------------*/
  /*  Se guarda el usuario.
  /*----------------------------------------------------------------------------------*/
  user.save((error, saved) => {
    /*--------------------------------------------------------------------------------*/
    /*  Se maneja el error.
    /*--------------------------------------------------------------------------------*/
    if (error) {
      return response.status(400).json({
        ok: false,
        message: 'Error al crear el usuario.',
        errors: error
      });
    }
    /*--------------------------------------------------------------------------------*/
    /*  Se envía la respuesta de éxito.
    /*--------------------------------------------------------------------------------*/
    response.status(201).json({
      ok: true,
      user: saved,
      user_token: request.user
    });
  });
});
/*====================================================================================*/
/*  EDITAR UN USUARIO
/*====================================================================================*/
app.put('/:id', auth.verifyToken, (request, response) => {
  /*----------------------------------------------------------------------------------*/
  /*  Se extrae el contenido de la petición.
  /*----------------------------------------------------------------------------------*/
  const id = request.params.id;
  const body = request.body;
  /*----------------------------------------------------------------------------------*/
  /*  Se instancian los atributos del modelo.
  /*----------------------------------------------------------------------------------*/
  const user = new User({
    _id: id,
    name: body.name,
    email: body.email,
    role: body.role
  });
  /*----------------------------------------------------------------------------------*/
  /*  Se edita el usuario.
  /*----------------------------------------------------------------------------------*/
  User.findByIdAndUpdate(id, { $set: user }, (error, edited) => {
    /*------------------------------------------------------------------------------*/
    /*  Se maneja el error.
    /*------------------------------------------------------------------------------*/
    if (error) {
      return response.status(500).json({
        ok: false,
        message: 'Error al editar el usuario.',
        errors: error
      });
    }
    /*--------------------------------------------------------------------------------*/
    /*  Se envía la respuesta de éxito.
    /*--------------------------------------------------------------------------------*/
    response.status(201).json({
      ok: true,
      user: user,
      user_token: request.user
    });
  });
});
/*====================================================================================*/
/*  BORRAR UN USUARIO
/*====================================================================================*/
app.delete('/:id', auth.verifyToken, (request, response) => {
  /*----------------------------------------------------------------------------------*/
  /*  Se extrae el contenido de la petición.
  /*----------------------------------------------------------------------------------*/
  const id = request.params.id;
  /*----------------------------------------------------------------------------------*/
  /*  Se borra el usuario.
  /*----------------------------------------------------------------------------------*/
  User.findByIdAndDelete(id, (error, deleted) => {
    /*--------------------------------------------------------------------------------*/
    /*  Se maneja el error.
    /*--------------------------------------------------------------------------------*/
    if (error) {
      return response.status(500).json({
        ok: false,
        message: 'Error al borrar el usuario.',
        errors: error
      });
    }
    /*--------------------------------------------------------------------------------*/
    /*  Se envía la respuesta de éxito.
    /*--------------------------------------------------------------------------------*/
    response.status(200).json({
      ok: true,
      user: deleted,
      user_token: request.user
    });
  });
});
/*====================================================================================*/
/*  EXPORTACIÓN DEL MODULO
/*====================================================================================*/
module.exports = app;
