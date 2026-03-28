function EspacoController(EspacoModel) {

    let controller = {
            create,
            findAll,
            update,
            removeById,
            findById
        }


    function create(values){
        let newEspaco = EspacoModel(values)
        return save (newEspaco)
    }

    function save(newEspaco){
        return new Promise(function(resolve, reject){
            newEspaco.save()
            .then(() => resolve('Espaço Criado com Sucesso!'))
            .catch((err) => reject(err))
        })
    }

    function findAll(){
        return new Promise(function(resolve,reject){
            EspacoModel.find({})
            .then((espaco) => resolve (espaco))
            .catch((err) => reject (err))
        })
    }

    function findById(id){
        return new Promise(function(resolve,reject){
            EspacoModel.findById(id)
            .then((espaco) => resolve(espaco))
            .catch((err) => reject(err))
        })
    }

    function update(id,espaco){
        return new Promise(function(resolve,reject){
            EspacoModel.findByIdAndUpdate(id,espaco)
            .then(() => resolve(espaco))
            .catch((err) => reject(err))
        })
    }

    function removeById(id){
        return new Promise(function(resolve,reject){
            EspacoModel.findByIdAndDelete(id)
            .then((espaco) => resolve(espaco))
            .catch((err) => reject(err))
        })   
    }
    return controller;
}
module.exports = EspacoController;
   