const mongoose = require('mongoose')

const User = mongoose.model('User', {
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    senha: { type: String, required: true },
    contacto: { type: Number, required: true, unique: true },
    morada: { type: String, required: true },
    nif: { type: Number, required: true, unique: true },
    atividade: { type: String },
    empresa: { type: String },
    role: {
        type: String,
        enum: ['admin', 'cliente'],
        default: 'cliente'
    },
    conta_ativa: { type: Boolean, default: true }
})

module.exports = User
