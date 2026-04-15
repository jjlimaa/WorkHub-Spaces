const transporter = require('../config/mail')

async function enviarEmail(destinatario, assunto, texto, html) {
    const from = process.env.EMAIL_USER ? String(process.env.EMAIL_USER).trim() : undefined
    if (!from) {
        throw new Error('Serviço de email não configurado (EMAIL_USER).')
    }

    try {
        const mailOptions = {
            from,
            to: destinatario,
            subject: assunto,
            text: texto,
            html
        }

        const info = await transporter.sendMail(mailOptions)
        return info
    } catch (error) {
        console.error('Erro ao enviar email:', error)
        throw error
    }
}

module.exports = { enviarEmail }