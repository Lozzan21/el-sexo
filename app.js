//invocamos express
const express = require('express');
const app = express();
const generadorPDF = require('./generadorPDF'); // Asumiendo que tienes un archivo generadorPDF.js

//capturar datos del formulario
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set('view engine', 'ejs');


//invocar dotenv
const dotenv = require('dotenv');
dotenv.config({ path: './env/.env' });

// app.use('/resources', express.static('public'));
app.use(express.static(__dirname + '/public'));

//motor de plantillas
app.set('view engine', 'ejs');

//invocar bycry
const bcryptjs = require('bcryptjs');
//var de sesión
const session = require('express-session');
app.use(session({
    secret: 'secret',
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
app.post('/register', async (req, res) => {
    const name = req.body.name;
    const pass = req.body.pass;
    let passwordHash = await bcryptjs.hash(pass, 8);
    connection.query('INSERT INTO users SET ?', { name: name, pass: passwordHash }, async (error, results) => {
        if (error) {
            console.log(error);
        } else {
            res.send('Alta exitosa');
        }
    });
});

// Inicio de sesión
app.post('/auth', async (req, res) => {
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
app.post('/register-maestro', async (req, res) => {
    const name = req.body.name;
    connection.query('INSERT INTO maestro (name) VALUES (?)', [name], async (error, results) => {
        if (error) {
            console.log(error);
            res.send('Error al agregar el maestro');
        } else {
            res.render('maestros', { message: 'Alta exitosa del maestro' }); // Renderiza la página de maestros con un mensaje
        }
    });
});

// Eliminación de maestros
app.post('/delete-maestro', async (req, res) => {
    const maestroId = req.body.maestroId;
    connection.query('DELETE FROM maestro WHERE id = ?', [maestroId], async (error, results) => {
        if (error) {
            console.log(error);
            res.send('Error al borrar el maestro');
        } else {
            res.render('maestros', { message: 'Maestro eliminado exitosamente' });
        }
    });
});

// Registro de materias
app.post('/register-materia', async (req, res) => {
    const name = req.body.name;
    connection.query('INSERT INTO materias (name) VALUES (?)', [name], async (error, results) => {
        if (error) {
            console.log(error);
            res.send('Error al agregar la materia');
        } else {
            res.render('materias', { message: 'Alta exitosa de la materia' });
        }
    });
});

// Eliminación de materias
app.post('/delete-materia', async (req, res) => {
    const materiaId = req.body.materiaId;
    connection.query('DELETE FROM materias WHERE id = ?', [materiaId], async (error, results) => {
        if (error) {
            console.log(error);
            res.send('Error al borrar la materia');
        } else {
            res.render('materias', { message: 'Materia eliminada exitosamente' });
        }
    });
});

// Registro de especialidades
app.post('/register-especialidad', async (req, res) => {
    const name = req.body.name;
    connection.query('INSERT INTO especialidades (especialidad) VALUES (?)', [especialidad], async (error, results) => {
        if (error) {
            console.log(error);
            res.send('Error al agregar la especialidad');
        } else {
            res.render('especialidad', { message: 'Alta exitosa de especialidad' }); // Renderiza la página de maestros con un mensaje
        }
    });
});

// Generar PDF
app.post('/generar-pdf', (req, res) => {
    const datosOficio = req.body;
    generadorPDF.generarPDF(datosOficio, (pdfData) => {
        // Convertir el PDF a un objeto Buffer
        const buffer = Buffer.from(pdfData);

        // Guardar el PDF en la base de datos
        connection.query('INSERT INTO oficios (pdf_blob) VALUES (?)', [buffer], (error, results) => {
            if (error) {
                console.error('Error al guardar el PDF en la base de datos:', error);
                res.status(500).send('Error al guardar el PDF en la base de datos');
            } else {
                console.log('PDF guardado en la base de datos con éxito');
                res.contentType('application/pdf');
                res.send(pdfData);
            }
        });
    });
});

// Ruta para mostrar y descargar el PDF
app.get('/descargar-pdf', (req, res) => {
    connection.query('SELECT pdf_blob FROM oficios ORDER BY id DESC LIMIT 1', (error, results) => {
        if (error) {
            console.error('Error al obtener el PDF de la base de datos:', error);
            res.status(500).send('Error al obtener el PDF de la base de datos');
        } else {
            if (results.length === 0) {
                res.status(404).send('No se encontró el PDF');
            } else {
                const pdfBuffer = results[0].pdf_blob;
                res.contentType('application/pdf');
                res.send(pdfBuffer);
            }
        }
    });
});

// Ruta para obtener los nombres de los maestros desde la base de datos
app.get('/obtener-maestros', (req, res) => {
    connection.query('SELECT name FROM maestro', (error, results) => {
        if (error) {
            console.error('Error al obtener los maestros de la base de datos:', error);
            res.status(500).send('Error al obtener los maestros de la base de datos');
        } else {
            const maestros = results.map(result => result.name);
            res.json(maestros); // Enviar los nombres de los maestros como respuesta JSON
        }
    });
});

// Ruta para obtener los nombres de las especialidades desde la base de datos
app.get('/obtener-especialidad', (req, res) => {
    connection.query('SELECT name FROM especialidades', (error, results) => {
        if (error) {
            console.error('Error al obtener la especialidad de la base de datos:', error);
            res.status(500).send('Error al obtener la especialidad de la base de datos');
        } else {
            const especialidad = results.map(result => result.name);
            res.json(especialidad); // Enviar los nombres de las especialidades como respuesta JSON
        }
    });
});

// Ruta para obtener los nombres de los grupos desde la base de datos
app.get('/obtener-grupos', (req, res) => {
    connection.query('SELECT grupo FROM grupo', (error, results) => {
        if (error) {
            console.error('Error al obtener el grupo de la base de datos:', error);
            res.status(500).send('Error al obtener el grupo de la base de datos');
        } else {
            const grupos = results.map(result => result.name);
            res.json(grupos); // Enviar los nombres de las especialidades como respuesta JSON
        }
    });
});




app.listen(3000, () => {
    console.log('SERVER RUNNING IN http://localhost:3000');
});

