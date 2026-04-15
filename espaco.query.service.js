const Espaco = require('../models/Espaco')
const ReservaEspaco = require('../models/Reserva_Espaco')

function s(v) {
    return String(v || '').trim()
}

function numOrNull(v) {
    if (v === undefined || v === null || v === '') return null
    const n = Number(v)
    return Number.isFinite(n) ? n : null
}

function parseDateOrNull(v) {
    if (!v) return null
    const d = new Date(v)
    if (Number.isNaN(d.getTime())) return null
    return d
}

function parseIntOr(v, fallback) {
    const n = Number.parseInt(String(v), 10)
    return Number.isFinite(n) ? n : fallback
}

function buildSort(sortBy, sortOrder) {
    const by = s(sortBy) || 'preco_por_hora'
    const order = String(sortOrder || 'asc').toLowerCase() === 'desc' ? -1 : 1
    const allowed = new Set(['preco_por_hora', 'capacidade', 'descricao', 'tipo', 'equipamentos_disponiveis'])
    const key = allowed.has(by) ? by : 'preco_por_hora'
    return { [key]: order }
}

async function listarEspacosPublicos(query) {
    const page = Math.max(1, parseIntOr(query.page, 1))
    const limit = Math.min(50, Math.max(1, parseIntOr(query.limit, 12)))
    const skip = (page - 1) * limit

    const q = s(query.q)
    const tipo = s(query.tipo)
    const capacidadeMin = numOrNull(query.capacidade)
    const precoMin = numOrNull(query.precoMin)
    const precoMax = numOrNull(query.precoMax)

    const inicio = parseDateOrNull(query.inicio)
    const fim = parseDateOrNull(query.fim)

    const filter = { ativo: { $ne: false } }
    if (tipo) filter.tipo = tipo
    if (capacidadeMin !== null) filter.capacidade = { ...(filter.capacidade || {}), $gte: capacidadeMin }
    if (precoMin !== null) filter.preco_por_hora = { ...(filter.preco_por_hora || {}), $gte: precoMin }
    if (precoMax !== null) filter.preco_por_hora = { ...(filter.preco_por_hora || {}), $lte: precoMax }
    if (q) filter.descricao = { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }

    let idsDisponiveis = null
    const temDatas = Boolean(inicio && fim)
    if (temDatas) {
        if (fim <= inicio) {
            const err = new Error('Intervalo de datas inválido.')
            err.status = 422
            throw err
        }

        // espaços ocupados no intervalo por reservas pendentes/confirmadas
        const ocupadas = await ReservaEspaco.distinct('espaco', {
            estado: { $in: ['pendente', 'confirmada'] },
            data_inicio: { $lt: fim },
            data_fim: { $gt: inicio }
        })

        idsDisponiveis = ocupadas && ocupadas.length ? { $nin: ocupadas } : { $exists: true }
        filter._id = idsDisponiveis
    }

    const sort = buildSort(query.sortBy, query.sortOrder)

    const [items, total] = await Promise.all([
        Espaco.find(filter).sort(sort).skip(skip).limit(limit),
        Espaco.countDocuments(filter)
    ])

    return { items, page, limit, total, totalPages: Math.ceil(total / limit) || 1 }
}

module.exports = { listarEspacosPublicos }

