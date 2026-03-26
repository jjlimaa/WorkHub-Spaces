// ============================================================
// DEPENDÊNCIAS — Bibliotecas externas necessárias para o projeto
// ============================================================
require('dotenv').config()                  // Carrega variáveis de ambiente do ficheiro .env
const express  = require('express')         // Framework para criar o servidor HTTP e gerir rotas
const mongoose = require('mongoose')        // ODM (Object Data Modeling) para comunicar com o MongoDB
const bcrypt   = require('bcrypt')          // Biblioteca para encriptar e comparar passwords
const jwt      = require('jsonwebtoken')    // Biblioteca para gerar e verificar tokens de autenticação (JWT)

const app        = express()
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Expressão regular para validar formato de email


// ============================================================
// MODELS — Estrutura dos documentos guardados na base de dados
// ============================================================
const User = require("./models/User")


// ============================================================
// MIDDLEWARES — Funções executadas antes de chegar às rotas
// ============================================================
app.use(express.json()) // Permite que o servidor leia o corpo (body) dos pedidos em formato JSON


// ============================================================
// ROTAS PÚBLICAS — Acessíveis sem autenticação
// ============================================================
app.get('/', (req, res) => {
    res.status(200).json({ msg: "Welcome to our API" })
})


// ============================================================
// ROTAS PRIVADAS — Apenas acessíveis com token JWT válido
// ============================================================
app.get("/user/:id", checarToken, async (req, res) => {
    const id = req.params.id

    // Busca o utilizador pelo ID, excluindo o campo senha da resposta
    const user = await User.findById(id, '-senha')

    if (!user) {
        return res.status(404).json({ msg: "Utilizador não encontrado!" })
    }

    return res.status(200).json({ user })
})


// ============================================================
// MIDDLEWARE DE AUTENTICAÇÃO — Verifica se o token JWT é válido
// Executado antes de qualquer rota privada
// ============================================================
function checarToken(req, res, next) {

    // O token é enviado no header Authorization no formato: "Bearer <token>"
    const header = req.headers['authorization']
    const token  = header && header.split(" ")[1]

    if (!token) {
        return res.status(401).json({ msg: "Acesso Negado!" })
    }

    try {
        const secret = process.env.SECRET

        // Verifica se o token é válido e não foi adulterado
        jwt.verify(token, secret)

        next() // Token válido — continua para a rota
    } catch (err) {
        res.status(400).json({ msg: "Token Inválido!" })
    }
}


// ============================================================
// REGISTO DE UTILIZADOR — Cria uma nova conta na base de dados
// ============================================================
app.post('/auth/register', async (req, res) => {

    const { nome, email, senha, confirmarsenha, contacto, morada, nif, atividade, empresa } = req.body


    // --- Validações de campos obrigatórios e formato ---

    if (!nome) {
        return res.status(422).json({ msg: 'O nome é um campo obrigatório!' })
    }

    if (!email) {
        return res.status(422).json({ msg: 'O email é obrigatório!' })
    } else if (!emailRegex.test(email)) {
        return res.status(422).json({ msg: 'Email inválido!' })
    }

    if (!senha) {
        return res.status(422).json({ msg: 'Preencha a Palavra-Passe' })
    }

    if (!confirmarsenha) {
        return res.status(422).json({ msg: 'Confirme a Palavra-Passe' })
    } else if (confirmarsenha !== senha) {
        return res.status(422).json({ msg: "As Palavras-Passe não coincidem!" })
    }

    if (!contacto) {
        return res.status(422).json({ msg: 'O contacto é um campo obrigatório!' })
    } else if (isNaN(contacto)) {
        return res.status(422).json({ msg: 'O Contacto deve ser um número!' })
    }

    if (!morada) {
        return res.status(422).json({ msg: 'A morada é um campo obrigatório!' })
    }

    if (!nif) {
        return res.status(422).json({ msg: 'Preencha o NIF!' })
    } else if (isNaN(nif)) {
        return res.status(422).json({ msg: 'O NIF deve ser um número!' })
    }

    // Campos opcionais — só valida o formato se forem preenchidos
    if (atividade && !/^[a-zA-ZÀ-ÿ\s]+$/.test(atividade)) {
        return res.status(422).json({ msg: 'A atividade só pode conter letras!' })
    }

    if (empresa && !/^[a-zA-ZÀ-ÿ\s]+$/.test(empresa)) {
        return res.status(422).json({ msg: 'A empresa só pode conter letras!' })
    }


    // --- Verificar se o utilizador já existe na base de dados ---
    const usuarioReg = await User.findOne({ email: email })

    if (usuarioReg) {
        return res.status(422).json({ msg: "Conta já cadastrada!" })
    }


    // --- Encriptação da password antes de guardar na DB ---
    // O salt define o custo computacional da encriptação (12 é o valor recomendado)
    const salt     = await bcrypt.genSalt(12)
    const senhaHash = await bcrypt.hash(senha, salt)


    // --- Criar o objeto User com os dados validados ---
    const user = new User({
        nome,
        email,
        senha: senhaHash, // Nunca guardar a password em texto simples
        contacto,
        morada,
        nif,
        atividade,
        empresa
    })

    try {
        await user.save() // Guarda o documento na base de dados
        res.status(201).json({ msg: "Utilizador criado com sucesso!" })
    } catch (err) {
        console.log(err)
        res.status(500).json({ msg: "Erro inesperado, tente novamente mais tarde!" })
    }
})


// ============================================================
// LOGIN DE UTILIZADOR — Autentica e devolve um token JWT
// ============================================================
app.post('/auth/login', async (req, res) => {

    const { email, senha } = req.body

    if (!email) {
        return res.status(422).json({ msg: 'O email é obrigatório!' })
    } else if (!emailRegex.test(email)) {
        return res.status(422).json({ msg: 'Email inválido!' })
    }

    if (!senha) {
        return res.status(422).json({ msg: 'Preencha a Palavra-Passe' })
    }


    // --- Verificar se o utilizador existe na base de dados ---
    const userLo = await User.findOne({ email: email })

    if (!userLo) {
        return res.status(422).json({ msg: "Utilizador não existe!" })
    }


    // --- Comparar a password introduzida com o hash guardado na DB ---
    const verSenha = await bcrypt.compare(senha, userLo.senha)

    if (!verSenha) {
        return res.status(404).json({ msg: "Senha inválida!" })
    }


    // --- Gerar o token JWT para autenticar o utilizador nas rotas privadas ---
    try {
        const secret = process.env.SECRET

        // O token contém o ID do utilizador e é assinado com o SECRET do .env
        const token = jwt.sign(
            { id: userLo._id },
            secret
        )

        res.status(200).json({ msg: "Login realizado com sucesso!", token })
    } catch (err) {
        console.log(err)
        res.status(500).json({ msg: "Erro inesperado, tente novamente mais tarde!" })
    }
})


// ============================================================
// BASE DE DADOS — Ligação ao MongoDB Atlas
// ============================================================
const dbUser     = process.env.DB_USER
const dbPassword = process.env.DB_PASSWORD
const db         = process.env.DB

mongoose.connect(`mongodb://${dbUser}:${dbPassword}@ac-vyumphm-shard-00-00.4b5unqz.mongodb.net:27017,ac-vyumphm-shard-00-01.4b5unqz.mongodb.net:27017,ac-vyumphm-shard-00-02.4b5unqz.mongodb.net:27017/?ssl=true&replicaSet=atlas-ufk0b7-shard-0&authSource=admin&appName=WorkHubSpaces`)
    .then(() => {
        console.log('Ligação à base de dados estabelecida com sucesso!')
    })
    .catch((err) => console.log(err))


// ============================================================
// SERVIDOR — Inicia o servidor na porta 3000
// ============================================================
app.listen(3000, () => console.log('Servidor a correr na porta 3000'))