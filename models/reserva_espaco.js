const mongoose = require('mongoose')

const ReservaEspaco = mongoose.model('ReservaEspaco',{

    data_hora:      { type: Date, required: true},
    duracao:        { type: Number, required: true},
    add_observacao: { type: String, required: true},

     estado: {type: String,
        enum: [ 'Pendente','Confirmada','Cancelada','Concluída']
   
}
})

module.exports = ReservaEspaco