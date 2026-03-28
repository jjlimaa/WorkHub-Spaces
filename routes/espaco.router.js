const express = require('express')
const router = express.Router()
const espacoService = require('../service/espaco.service')

router.get('/', (req, res) => {
    espacoService.findAtivos()
        .then((espacos) => res.status(200).json({ msg: espacos }))
        .catch(() => res.status(422).json({ msg: 'Erro ao listar espaços.' }))
})

module.exports = router
