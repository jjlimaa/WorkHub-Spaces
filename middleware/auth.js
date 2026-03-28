const jwt = require('jsonwebtoken')

function extrairToken(req) {
    const header = req.headers.authorization || req.headers.Authorization
    if (!header || typeof header !== 'string') return null
    const h = header.trim()
    if (h.toLowerCase().startsWith('bearer ')) {
        return h.slice(7).trim() || null
    }
    return h || null
}

function checarToken(req, res, next) {
    const token = extrairToken(req)

    if (!token) {
        return res.status(401).json({
            msg: 'Acesso negado.',
            detalhe: 'É necessário o header Authorization: Bearer <token> (faz login em POST /auth/login e copia o token).'
        })
    }

    try {
        const secret = process.env.SECRET
        const decoded = jwt.verify(token, secret)
        req.user = {
            id: decoded.id,
            role: decoded.role || 'cliente'
        }
        next()
    } catch (err) {
        return res.status(401).json({ msg: 'Token inválido!' })
    }
}

function requireRole(...roles) {
    return (req, res, next) => {
        const role = req.user && req.user.role
        if (!role || !roles.includes(role)) {
            return res.status(403).json({ msg: 'Não tem permissão para esta operação.' })
        }
        next()
    }
}

const requireAdmin = requireRole('admin')

module.exports = { checarToken, requireRole, requireAdmin }
