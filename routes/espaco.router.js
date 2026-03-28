const express = require('express')
const router = express.Router()
const espacoService = require('../service/espaco.service')

router.get('/', (req, res) => {
    espacoService.findAll()
        .then((espacos) => res.status(200).json({ msg: espacos }))
        .catch(() => res.status(422).json({ msg: 'Erro ao listar Espaços!' }))
})

router.post('/', (req, res) => {
    espacoService.create(req.body)
        .then((msg) => res.status(200).json({ msg }))
        .catch((err) => {
            console.log(err)
            res.status(422).json({ msg: 'Erro ao criar Espaço!', error: err.message })
        })
})

module.exports = router
