function EspacoController(EspacoModel) {

    const controller = {
        create,
        findAll,
        findAtivos,
        update,
        removeById,
        findById
    }

    function create(values) {
        const newEspaco = new EspacoModel(values)
        return save(newEspaco)
    }

    function save(newEspaco) {
        return new Promise(function (resolve, reject) {
            newEspaco.save()
                .then(() => resolve('Espaço criado com sucesso!'))
                .catch((err) => reject(err))
        })
    }

    function findAll() {
        return new Promise(function (resolve, reject) {
            EspacoModel.find({})
                .then((espacos) => resolve(espacos))
                .catch((err) => reject(err))
        })
    }

    function findAtivos() {
        return new Promise(function (resolve, reject) {
            EspacoModel.find({ ativo: { $ne: false } })
                .then((espacos) => resolve(espacos))
                .catch((err) => reject(err))
        })
    }

    function findById(id) {
        return new Promise(function (resolve, reject) {
            EspacoModel.findById(id)
                .then((espaco) => resolve(espaco))
                .catch((err) => reject(err))
        })
    }

    function update(id, dados) {
        return new Promise(function (resolve, reject) {
            EspacoModel.findByIdAndUpdate(id, dados, { new: true, runValidators: true })
                .then((doc) => {
                    if (!doc) {
                        return reject(new Error('Espaço não encontrado.'))
                    }
                    resolve(doc)
                })
                .catch((err) => reject(err))
        })
    }

    function removeById(id) {
        return new Promise(function (resolve, reject) {
            EspacoModel.findByIdAndDelete(id)
                .then((doc) => {
                    if (!doc) {
                        return reject(new Error('Espaço não encontrado.'))
                    }
                    resolve(doc)
                })
                .catch((err) => reject(err))
        })
    }

    return controller
}

module.exports = EspacoController
