const Espaco = require('../models/Espaco');
const EspacoController = require('../controller/espaco.controller');

const espacoService = EspacoController(Espaco);

module.exports = espacoService;