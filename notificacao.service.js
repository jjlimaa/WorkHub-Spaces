const Notificacao = require('../models/Notificacao')

async function criarNotificacao({ userId, mensagem }) {
    if (!userId) return null
    if (!mensagem) return null
    return await Notificacao.create({ user: userId, mensagem })
}

async function listarNotificacoes({ userId, page = 1, limit = 10 }) {
    const p = Math.max(1, Number(page) || 1)
    const l = Math.min(50, Math.max(1, Number(limit) || 10))
    const skip = (p - 1) * l

    const [items, total] = await Promise.all([
        Notificacao.find({ user: userId }).sort({ createdAt: -1 }).skip(skip).limit(l),
        Notificacao.countDocuments({ user: userId })
    ])

    return { items, page: p, limit: l, total, totalPages: Math.ceil(total / l) || 1 }
}

async function marcarComoLida({ userId, notificacaoId }) {
    const doc = await Notificacao.findOneAndUpdate(
        { _id: notificacaoId, user: userId },
        { lida: true },
        { new: true }
    )
    return doc
}

module.exports = { criarNotificacao, listarNotificacoes, marcarComoLida }

