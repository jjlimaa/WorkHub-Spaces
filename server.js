require('dotenv').config()
const express  = require('express')
const mongoose = require('mongoose')

const app = express()

// middleware
app.use(express.json())

// rotas
const authRoutes = require('./routes/auth.router')
const userRoutes = require('./routes/user.router')
const espacoRoutes = require('./routes/espaco.router')
const adminRoutes = require('./routes/admin.router')

app.use('/auth', authRoutes)
app.use('/user', userRoutes)
app.use('/espaco', espacoRoutes)
app.use('/admin', adminRoutes)

// rota pública
app.get('/', (req, res) => {
    res.status(200).json({ msg: "Welcome to our API" })
})

// db
const dbUser     = process.env.DB_USER
const dbPassword = process.env.DB_PASSWORD
//const db    = process.env.DB

mongoose.connect(`mongodb://${dbUser}:${dbPassword}@ac-vyumphm-shard-00-00.4b5unqz.mongodb.net:27017,ac-vyumphm-shard-00-01.4b5unqz.mongodb.net:27017,ac-vyumphm-shard-00-02.4b5unqz.mongodb.net:27017/?ssl=true&replicaSet=atlas-ufk0b7-shard-0&authSource=admin&appName=WorkHubSpaces`)
    .then(() => {
        console.log('Ligação à base de dados estabelecida com sucesso!')
    })
    .catch((err) => console.log(err))


// ============================================================
// SERVIDOR — Inicia o servidor na porta 3000
// ============================================================
app.listen(3000, () => console.log('Servidor a correr na porta 3000'))