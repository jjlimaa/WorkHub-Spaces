const express = require('express')
const router = express.Router()
const { checarToken, requireAdmin } = require('../middleware/auth')
const espacoService = require('../service/espaco.service')
const adminController = require('../controller/admin.controller')
const servicoExtraController = require('../controller/servico_extra.controller')

router.use(checarToken, requireAdmin)

const listarEspacosAdmin = (req, res) => {
    espacoService.findAll()
        .then((espacos) => res.status(200).json({ espacos }))
        .catch(() => res.status(422).json({ msg: 'Erro ao listar espaços.' }))
}

router.get('/espacos', listarEspacosAdmin)
router.get('/espaco', listarEspacosAdmin)

router.post('/espacos', (req, res) => {
    espacoService.create(req.body)
        .then((msg) => res.status(201).json({ msg }))
        .catch((err) => {
            console.log(err)
            res.status(422).json({ msg: err.message || 'Erro ao criar espaço.' })
        })
})

router.put('/espacos/:id', (req, res) => {
    espacoService.update(req.params.id, req.body)
        .then((doc) => res.status(200).json({ msg: 'Espaço atualizado.', espaco: doc }))
        .catch((err) => {
            console.log(err)
            res.status(422).json({ msg: err.message || 'Erro ao atualizar espaço.' })
        })
})

router.patch('/espacos/:id/ativo', adminController.setEspacoAtivo)

router.delete('/espacos/:id', (req, res) => {
    espacoService.removeById(req.params.id)
        .then(() => res.status(200).json({ msg: 'Espaço eliminado.' }))
        .catch((err) => {
            console.log(err)
            res.status(422).json({ msg: err.message || 'Erro ao eliminar espaço.' })
        })
})

router.get('/utilizadores', adminController.listUsers)
router.get('/utilizadores/:id/reservas', adminController.listReservasCliente)
router.patch('/utilizadores/:id/conta', adminController.setContaAtiva)

router.get('/servicos-extras', servicoExtraController.list)
router.post('/servicos-extras', servicoExtraController.create)
router.get('/servicos-extras/:id', servicoExtraController.getById)
router.put('/servicos-extras/:id', servicoExtraController.update)
router.delete('/servicos-extras/:id', servicoExtraController.remove)

module.exports = router
