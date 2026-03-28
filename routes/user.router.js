const express = require('express')
const router = express.Router()

const { checarToken } = require('../middleware/auth')
const User = require('../models/User')

router.get('/:id', checarToken, async (req, res) => {
    const id = req.params.id
    const isOwn = String(req.user.id) === String(id)
    const isAdmin = req.user.role === 'admin'

    if (!isOwn && !isAdmin) {
        return res.status(403).json({ msg: 'Acesso proibido!' })
    }

    const user = await User.findById(id, '-senha')

    if (!user) {
        return res.status(404).json({ msg: "Utilizador não encontrado!" })
    }

    return res.status(200).json({ user })
})

module.exports = router