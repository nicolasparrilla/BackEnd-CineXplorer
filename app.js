var express = require('express');
var cookieParser = require('cookie-parser');
var bluebird = require('bluebird');
var cors = require('cors');
var mongoose = require('mongoose');

var indexRouter = require('./routes/index');
var apiRouter = require('./routes/api');

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Middleware de CORS
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token'], // Encabezados permitidos
}));

// Rutas de los endpoints
app.use('/api', apiRouter);
app.use('/', indexRouter);

// Conexión a la base de datos
mongoose.Promise = bluebird;
let url = `${process.env.DATABASE1}${process.env.DATABASE2}=${process.env.DATABASE3}=${process.env.DATABASE4}`;
console.log("BD", url);
let opts = {
  useNewUrlParser: true,
  connectTimeoutMS: 20000,
  useUnifiedTopology: true,
};

mongoose.connect(url, opts)
  .then(() => {
    console.log(`Successfully Connected to the Mongodb Database..`);
  })
  .catch((e) => {
    console.log(`Error Connecting to the Mongodb Database...`);
    console.log(e);
  });

// Configuración del puerto del servidor
var port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`Servidor de ABM Users iniciado en el puerto ${port}`);
});

module.exports = app;
