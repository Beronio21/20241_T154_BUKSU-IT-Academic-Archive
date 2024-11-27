const express = require('express');
const router = express.Router();
const axios = require('axios');

router.post('/verify-recaptcha', async (req, res) => {
    const { recaptchaToken } = req.body;

    try {
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify`,
            null,
            {
                params: {
                    secret: process.env.RECAPTCHA_SECRET_KEY,
                    response: recaptchaToken,
                },
            }
        );

        if (response.data.success) {
            res.json({ success: true });
        } else {
            res.status(400).json({ success: false, message: 'reCAPTCHA verification failed' });
        }
    } catch (error) {
        console.error('reCAPTCHA verification error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});

module.exports = router;