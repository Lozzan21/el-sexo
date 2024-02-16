const express = require('express');
const app = express();

app.use(express.urlencoded({extended:false}));
app.use(express.json());

const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});

// app.use('/resources', express.static('public'));
app.use(express.static(__dirname + '/public'));

app.set('view engine', 'ejs');

const bcryptjs = require('bcryptjs');

const session = require('express-session');
app.use(session({
        secret:'secret',
        resave: true,
        SaveUninitialized:true
}));

const connection = require('.//database/db')
// rutas
    app.get('/', (req, res)=>{
        res.render('index');
    });

    app.get('/login', (req, res)=>{
        res.render('login');
    })    

    //registro
    app.get('/register', async(req, res)=>{
        const user = req.body.user;
        const password = req.body.password;
        let passwordHaash = await bcryptjs.hash(pass, 8);
        connection.query('INSERT INTO users SET ?', {user:user, passsword:password})
            if(error){
                console.log(error);
            }else{
                res.send('Alta exitosa');
            }
    })

// Login de registro
app.post('/auth', async(req, res) => {
    const user = req.body.user;
    const pass = req.body.password;
    if (user && pass) {
        connection.query('SELECT * FROM users WHERE user = ?', [user], (error, results) => {
            if (results.length == 0 || password !== results[0].pass) {
                res.send('USUARIO Y PASSWORD INCORRECTAS');
            } else {
                res.send('Login correcto');
            }
        });
    }
});

app.listen(3000, (req, res) =>{
    console.log('SERVER RUNNING IN http://localhost:3000');
})