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
    res.render('logo'); 
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

app.get("/materias", (req, res) => {
    res.render("materias");
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

// Registro de maestros
app.post('/register-maestro', async(req, res) => {
    const name = req.body.name;
    connection.query('INSERT INTO maestro (name) VALUES (?)', [name], async(error, results) => {
        if (error) {
            console.log(error);
            res.send('Error al agregar el maestro');
        } else {
            res.render('maestros', { message: 'Alta exitosa del maestro' }); // Renderiza la página de maestros con un mensaje
        }
    });
});

// Eliminación de maestros
app.post('/delete-maestro', async(req, res) => {
    const maestroId = req.body.maestroId;
    connection.query('DELETE FROM maestro WHERE id = ?', [maestroId], async(error, results) => {
        if (error) {
            console.log(error);
            res.send('Error al borrar el maestro');
        } else {
            res.render('maestros', { message: 'Maestro eliminado exitosamente' });
        }
    });
});

// Registro de materias
app.post('/register-materia', async(req, res) => {
    const name = req.body.name;
    connection.query('INSERT INTO materias (name) VALUES (?)', [name], async(error, results) => {
        if (error) {
            console.log(error);
            res.send('Error al agregar la materia');
        } else {
            res.render('materias', { message: 'Alta exitosa de la materia' });
        }
    });
});

// Eliminación de materias
app.post('/delete-materia', async(req, res) => {
    const materiaId = req.body.materiaId;
    connection.query('DELETE FROM materias WHERE id = ?', [materiaId], async(error, results) => {
        if (error) {
            console.log(error);
            res.send('Error al borrar la materia');
        } else {
            res.render('materias', { message: 'Materia eliminada exitosamente' });
        }
    });
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

