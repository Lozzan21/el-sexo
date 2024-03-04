//invocamos express
const express = require('express');
const app = express();
const generadorPDF = require('./generadorPDF'); // Asumiendo que tienes un archivo generadorPDF.js

//capturar datos del formulario
app.use(express.urlencoded({extended:false}));
app.use(express.json());

//invocar dotenv
const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});

// app.use('/resources', express.static('public'));
app.use(express.static(__dirname + '/public'));

//motor de plantillas
app.set('view engine', 'ejs');

//invocar bycry
const bcryptjs = require('bcryptjs');

//var de sesión
const session = require('express-session');
app.use(session({
    secret:'secret',
    resave: true,
    saveUninitialized: true
}));


// conexion a la base de datos
const connection = require('./database/db');

// rutas
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/logo', (req, res) => {
    res.render('logo'); // Aquí renderizas la vista logo.ejs
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.get('/index', (req, res) => {
    res.render('index');
});

app.get('/oficio', (req, res) => {
    res.render('oficio');
});

app.get("/maestros", (req, res) => {
  res.render("maestros");
});


// Registro de usuario
app.post('/register', async(req, res) => {
    const name = req.body.name;
    const pass = req.body.pass;
    let passwordHash = await bcryptjs.hash(pass, 8);
    connection.query('INSERT INTO users SET ?', {name: name, pass: passwordHash}, async(error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.send('Alta exitosa');
        }
    });
});

// Inicio de sesión
app.post('/auth', async(req, res) => {
    const name = req.body.name;
    const pass = req.body.pass;
    if (name && pass) {
        connection.query('SELECT * FROM users WHERE name = ?', [name], async (error, results) => {
            if (results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))) {
                res.send('USUARIO Y PASSWORD INCORRECTAS');
            } else {
                res.redirect('/index');
            }
        });
    }
});

// Generar PDF
app.post('/generar-pdf', (req, res) => {
    const datosOficio = req.body;
    generadorPDF.generarPDF(datosOficio, (pdfData) => {
        res.contentType('application/pdf');
        res.send(pdfData);
    });
});

app.listen(3000, () => {
    console.log('SERVER RUNNING IN http://localhost:3000');
});
