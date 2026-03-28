const mongoose = require('mongoose')

const Espaco = mongoose.model('Espaco',{

    descricao:                   { type: String, required: true},
    capacidade:                  { type: Number, required: true},
    equipamentos_disponiveis:    { type: Number, required: true},
    preco_por_hora:              { type: Number, required: true},
    imagem:                      { type: String}
   
})

module.exports = Espaco