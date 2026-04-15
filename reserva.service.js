const ReservaEspaco = require('../models/Reserva_Espaco')

function normalizarString(v) {
    return String(v || '').trim()
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
    const by = normalizarString(sortBy) || 'createdAt'
    const order = String(sortOrder || 'desc').toLowerCase() === 'asc' ? 1 : -1
    const allowed = new Set(['createdAt', 'data_inicio', 'data_fim', 'preco_total', 'estado'])
    const key = allowed.has(by) ? by : 'createdAt'
    return { [key]: order }
}

async function criarReserva({ userId, body }) {
    const espaco = normalizarString(body.espaco)
    const data_inicio = parseDateOrNull(body.data_inicio)
    const data_fim = parseDateOrNull(body.data_fim)

    if (!espaco) throw new Error('Espaço é obrigatório.')
    if (!data_inicio || !data_fim) throw new Error('data_inicio e data_fim são obrigatórios.')

    const servicos_extras = Array.isArray(body.servicos_extras) ? body.servicos_extras : []
    const observacoes_cliente = normalizarString(body.observacoes_cliente)

    const reserva = new ReservaEspaco({
        cliente: userId,
        espaco,
        servicos_extras,
        data_inicio,
        data_fim,
        observacoes_cliente,
        estado: 'pendente'
    })

    await reserva.save()
    return reserva
}

async function obterReservaPorId({ id, user }) {
    const q = { _id: id }
    if (user.role !== 'admin') q.cliente = user.id

    const reserva = await ReservaEspaco.findOne(q)
        .populate('espaco', 'descricao preco_por_hora capacidade ativo')
        .populate('servicos_extras', 'nome preco disponibilidade')
        .populate('cliente', 'nome email')

    return reserva
}

async function atualizarReserva({ id, user, body }) {
    const reserva = await ReservaEspaco.findById(id)
    if (!reserva) throw new Error('Reserva não encontrada.')
    if (user.role !== 'admin' && String(reserva.cliente) !== String(user.id)) {
        const err = new Error('Acesso proibido.')
        err.status = 403
        throw err
    }

    if (reserva.estado === 'cancelada') {
        throw new Error('Não é possível alterar uma reserva cancelada.')
    }

    const data_inicio = body.data_inicio !== undefined ? parseDateOrNull(body.data_inicio) : null
    const data_fim = body.data_fim !== undefined ? parseDateOrNull(body.data_fim) : null

    if (body.data_inicio !== undefined && !data_inicio) throw new Error('data_inicio inválida.')
    if (body.data_fim !== undefined && !data_fim) throw new Error('data_fim inválida.')

    if (data_inicio) reserva.data_inicio = data_inicio
    if (data_fim) reserva.data_fim = data_fim

    if (body.servicos_extras !== undefined) {
        if (!Array.isArray(body.servicos_extras)) throw new Error('servicos_extras deve ser array.')
        reserva.servicos_extras = body.servicos_extras
    }

    if (body.observacoes_cliente !== undefined) {
        reserva.observacoes_cliente = normalizarString(body.observacoes_cliente)
    }

    // observações internas só admin
    if (body.observacoes_internas !== undefined) {
        if (user.role !== 'admin') {
            const err = new Error('Apenas admin pode alterar observações internas.')
            err.status = 403
            throw err
        }
        reserva.observacoes_internas = normalizarString(body.observacoes_internas)
    }

    await reserva.save()
    return reserva
}

async function confirmarReserva({ id, user }) {
    const reserva = await ReservaEspaco.findById(id)
    if (!reserva) throw new Error('Reserva não encontrada.')

    if (user.role !== 'admin') {
        const err = new Error('Apenas admin pode confirmar reservas.')
        err.status = 403
        throw err
    }

    if (reserva.estado === 'cancelada') throw new Error('Reserva já está cancelada.')
    reserva.estado = 'confirmada'
    await reserva.save()
    return reserva
}

async function concluirReserva({ id, user }) {
    const reserva = await ReservaEspaco.findById(id)
    if (!reserva) throw new Error('Reserva não encontrada.')

    if (user.role !== 'admin') {
        const err = new Error('Apenas admin pode concluir reservas.')
        err.status = 403
        throw err
    }

    if (reserva.estado === 'cancelada') throw new Error('Reserva está cancelada.')
    reserva.estado = 'concluida'
    await reserva.save()
    return reserva
}

async function cancelarReserva({ id, user }) {
    const reserva = await ReservaEspaco.findById(id)
    if (!reserva) throw new Error('Reserva não encontrada.')

    const isOwn = String(reserva.cliente) === String(user.id)
    if (user.role !== 'admin' && !isOwn) {
        const err = new Error('Acesso proibido.')
        err.status = 403
        throw err
    }

    reserva.estado = 'cancelada'
    await reserva.save()
    return reserva
}

async function listarReservas({ user, query }) {
    const page = Math.max(1, parseIntOr(query.page, 1))
    const limit = Math.min(50, Math.max(1, parseIntOr(query.limit, 10)))
    const skip = (page - 1) * limit

    const estado = normalizarString(query.estado).toLowerCase()
    const tipo = normalizarString(query.tipo).toLowerCase() // passadas | futuras | todas
    const search = normalizarString(query.q)

    const baseMatch = {}
    if (user.role !== 'admin') baseMatch.cliente = user.id
    if (estado && ['pendente', 'confirmada', 'cancelada'].includes(estado)) baseMatch.estado = estado

    const now = new Date()
    if (tipo === 'passadas') baseMatch.data_fim = { $lt: now }
    if (tipo === 'futuras') baseMatch.data_inicio = { $gte: now }

    const sort = buildSort(query.sortBy, query.sortOrder)

    // Pesquisa por nome do cliente ou descrição do espaço (simples via $lookup)
    const pipeline = [
        { $match: baseMatch },
        {
            $lookup: {
                from: 'users',
                localField: 'cliente',
                foreignField: '_id',
                as: 'clienteDoc'
            }
        },
        { $unwind: { path: '$clienteDoc', preserveNullAndEmptyArrays: true } },
        {
            $lookup: {
                from: 'espacos',
                localField: 'espaco',
                foreignField: '_id',
                as: 'espacoDoc'
            }
        },
        { $unwind: { path: '$espacoDoc', preserveNullAndEmptyArrays: true } }
    ]

    if (search) {
        const rx = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
        pipeline.push({
            $match: {
                $or: [
                    { 'clienteDoc.nome': rx },
                    { 'espacoDoc.descricao': rx }
                ]
            }
        })
    }

    pipeline.push(
        { $sort: sort },
        {
            $facet: {
                items: [
                    { $skip: skip },
                    { $limit: limit }
                ],
                total: [{ $count: 'count' }]
            }
        }
    )

    const [result] = await ReservaEspaco.aggregate(pipeline)
    const items = (result && result.items) || []
    const total = (result && result.total && result.total[0] && result.total[0].count) || 0

    return {
        items,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1
    }
}

module.exports = {
    criarReserva,
    obterReservaPorId,
    atualizarReserva,
    confirmarReserva,
    concluirReserva,
    cancelarReserva,
    listarReservas
}

