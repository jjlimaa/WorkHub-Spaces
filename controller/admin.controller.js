const User = require('../models/User')
const ReservaEspaco = require('../models/reserva_espaco')
const espacoService = require('../service/espaco.service')

exports.listUsers = async (req, res) => {
    try {
        const users = await User.find().select('-senha').sort({ nome: 1 })
        res.status(200).json({ users })
    } catch (err) {
        console.log(err)
        res.status(500).json({ msg: 'Erro ao listar utilizadores.' })
    }
}

exports.listReservasCliente = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('_id')
        if (!user) {
            return res.status(404).json({ msg: 'Utilizador não encontrado.' })
        }
        const reservas = await ReservaEspaco.find({ cliente: req.params.id })
            .populate('espaco', 'descricao preco_por_hora capacidade ativo')
            .sort({ data_hora: -1 })
        res.status(200).json({ reservas })
    } catch (err) {
        console.log(err)
        res.status(500).json({ msg: 'Erro ao obter reservas.' })
    }
}

exports.setContaAtiva = async (req, res) => {
    try {
        const { conta_ativa } = req.body
        if (typeof conta_ativa !== 'boolean') {
            return res.status(422).json({ msg: 'Envie conta_ativa: true ou false.' })
        }
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { conta_ativa },
            { new: true }
        ).select('-senha')
        if (!user) {
            return res.status(404).json({ msg: 'Utilizador não encontrado.' })
        }
        res.status(200).json({ user })
    } catch (err) {
        console.log(err)
        res.status(500).json({ msg: 'Erro ao atualizar conta.' })
    }
}

exports.setEspacoAtivo = async (req, res) => {
    try {
        const { ativo } = req.body
        if (typeof ativo !== 'boolean') {
            return res.status(422).json({ msg: 'Envie ativo: true ou false.' })
        }
        const doc = await espacoService.update(req.params.id, { ativo })
        res.status(200).json({ msg: 'Estado do espaço atualizado.', espaco: doc })
    } catch (err) {
        console.log(err)
        const status = err.message && err.message.includes('não encontrado') ? 404 : 422
        res.status(status).json({ msg: err.message || 'Erro ao atualizar espaço.' })
    }
}
