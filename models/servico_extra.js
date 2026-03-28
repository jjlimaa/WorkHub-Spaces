const mongoose = require('mongoose')

const ServicoExtra = mongoose.model('ServicoExtra',{

    servico:     { type: String, 
        enum: ['Impressões','Coffee Break',
        'Equipamento audiovisual','Cacifo Temporário'
    ]},
 
})

module.exports = ServicoExtra