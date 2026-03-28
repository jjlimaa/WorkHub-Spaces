const mongoose = require('mongoose')

const ReservaEspaco = mongoose.model('ReservaEspaco', {
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    espaco: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Espaco',
        required: true
    },
    data_hora: { type: Date, required: true },
    duracao: { type: Number, required: true },
    add_observacao: { type: String, required: true },
    estado: {
        type: String,
        enum: ['Pendente', 'Confirmada', 'Cancelada', 'Concluída'],
        default: 'Pendente'
    }
})

module.exports = ReservaEspaco
