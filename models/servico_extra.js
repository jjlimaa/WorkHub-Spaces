const mongoose = require('mongoose')

const ServicoExtra = mongoose.model('ServicoExtra', {
    nome: { type: String, required: true },
    descricao: { type: String, default: '' },
    preco: { type: Number, required: true },
    disponibilidade: { type: Boolean, default: true }
})

module.exports = ServicoExtra
