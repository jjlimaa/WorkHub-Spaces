const jwt = require('jsonwebtoken')

function checarToken(req, res, next) {
    const header = req.headers['authorization']
    const token  = header && header.split(" ")[1]

    if (!token) {
        return res.status(401).json({ msg: "Acesso Negado!" })
    }

    try {
        const secret = process.env.SECRET

        const decoded = jwt.verify(token, secret)
        req.user = decoded // 🔥 aqui está o upgrade

        next()
    } catch (err) {
        return res.status(401).json({ msg: "Token Inválido!" })
    }
}

module.exports = checarToken