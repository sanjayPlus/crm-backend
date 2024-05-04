
const Code = require('../models/Code');
const QRCode = require('qrcode');

exports.generateCode = function generateRandomCode(length = 10) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomCode = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomCode += characters.charAt(randomIndex);
    }
    return randomCode;
}

exports.saveCode = async function(code) {
    const date = new Date();
    const time = date.toTimeString().split(' ')[0]; // Get the current time

    const newCode = new Code({
        date,
        time,
        code
    });

    try {
        await newCode.save();
        console.log(`Saved new code: ${code} at time: ${time}`);
    } catch (err) {
        console.error(err);
    }
}

exports.getQRCode = async function(req, res) {
    const { date, time } = req.query;

    try {
        const code = await Code.findOne({ date, time });
        if (!code) {
            return res.status(404).json({ error: 'Code not found' });
        }

        const qrCode = await QRCode.toDataURL(code.code);
        res.json({ qrCode });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}
