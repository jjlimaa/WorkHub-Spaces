const mongoose = require('mongoose')
const Schema = mongoose.Schema

const EspacoSchema = new Schema({
    descricao: { type: String, required: true },
    capacidade: { type: Number, required: true },
    equipamentos_disponiveis: { type: Number, required: true },
    preco_por_hora: { type: Number, required: true },
    imagem: { type: String },
    ativo: { type: Boolean, default: true }
})

module.exports = mongoose.model('Espaco', EspacoSchema)
