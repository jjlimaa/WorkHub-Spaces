const ServicoExtra = require('../models/servico_extra')

exports.list = async (req, res) => {
    try {
        const servicos = await ServicoExtra.find().sort({ nome: 1 })
        res.status(200).json({ servicos })
    } catch (err) {
        console.log(err)
        res.status(500).json({ msg: 'Erro ao listar serviços.' })
    }
}

exports.getById = async (req, res) => {
    try {
        const servico = await ServicoExtra.findById(req.params.id)
        if (!servico) {
            return res.status(404).json({ msg: 'Serviço não encontrado.' })
        }
        res.status(200).json({ servico })
    } catch (err) {
        console.log(err)
        res.status(500).json({ msg: 'Erro ao obter serviço.' })
    }
}

exports.create = async (req, res) => {
    try {
        const { nome, descricao, preco, disponibilidade } = req.body
        if (!nome) {
            return res.status(422).json({ msg: 'O nome é obrigatório.' })
        }
        if (preco === undefined || preco === null || Number.isNaN(Number(preco))) {
            return res.status(422).json({ msg: 'O preço é obrigatório e deve ser numérico.' })
        }
        const servico = await ServicoExtra.create({
            nome,
            descricao: descricao || '',
            preco: Number(preco),
            disponibilidade: disponibilidade !== false
        })
        res.status(201).json({ msg: 'Serviço criado.', servico })
    } catch (err) {
        console.log(err)
        res.status(500).json({ msg: 'Erro ao criar serviço.' })
    }
}

exports.update = async (req, res) => {
    try {
        const { nome, descricao, preco, disponibilidade } = req.body
        const dados = {}
        if (nome !== undefined) dados.nome = nome
        if (descricao !== undefined) dados.descricao = descricao
        if (preco !== undefined) {
            if (Number.isNaN(Number(preco))) {
                return res.status(422).json({ msg: 'Preço inválido.' })
            }
            dados.preco = Number(preco)
        }
        if (disponibilidade !== undefined) {
            if (typeof disponibilidade !== 'boolean') {
                return res.status(422).json({ msg: 'disponibilidade deve ser true ou false.' })
            }
            dados.disponibilidade = disponibilidade
        }
        const servico = await ServicoExtra.findByIdAndUpdate(req.params.id, dados, {
            new: true,
            runValidators: true
        })
        if (!servico) {
            return res.status(404).json({ msg: 'Serviço não encontrado.' })
        }
        res.status(200).json({ msg: 'Serviço atualizado.', servico })
    } catch (err) {
        console.log(err)
        res.status(500).json({ msg: 'Erro ao atualizar serviço.' })
    }
}

exports.remove = async (req, res) => {
    try {
        const servico = await ServicoExtra.findByIdAndDelete(req.params.id)
        if (!servico) {
            return res.status(404).json({ msg: 'Serviço não encontrado.' })
        }
        res.status(200).json({ msg: 'Serviço eliminado.' })
    } catch (err) {
        console.log(err)
        res.status(500).json({ msg: 'Erro ao eliminar serviço.' })
    }
}
