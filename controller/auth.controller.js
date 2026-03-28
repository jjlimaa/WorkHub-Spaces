const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/User')
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/


exports.register = async (req, res) => {
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
}

exports.login = async (req, res) => {
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
}
   