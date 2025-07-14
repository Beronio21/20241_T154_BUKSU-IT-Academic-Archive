const axios = require('axios');
const jwt = require('jsonwebtoken');
const { oauth2Client } = require('../utils/googleClient');
const User = require('../models/userModel');

/* GET Google Authentication API. */
exports.googleAuth = async (req, res, next) => {
    const code = req.query.code;
    try {
        const googleRes = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(googleRes.tokens);
        const userRes = await axios.get(
            `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.access_token}`
        );
        const { email, name, picture } = userRes.data;
        // console.log(userRes);
        let user = await User.findOne({ email });

        // Block all roles except teacher and admin from Google login
        if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
            return res.status(403).json({
                status: 'error',
                message: 'Students are not allowed to log in'
            });
        }

        if (!user) {
            user = await User.create({
                name,
                email,
                image: picture,
            });
        }
        const { _id } = user;
        const token = jwt.sign({ _id, email },
            process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_TIMEOUT,
        });
        console.log('Google auth response:', {
            message: 'success',
            token,
            user: {
                _id,
                name,
                email,
                image: picture,
            },
        });
        res.status(200).json({
            message: 'success',
            token,
            user: {
                _id,
                name,
                email,
                image: picture,
            },
        });
        const storedInfo = JSON.parse(localStorage.getItem('user-info'));
        console.log('Stored user info:', storedInfo);
    } catch (err) {
        res.status(500).json({
            message: "Internal Server Error"
        })
    }
};

// Add this somewhere in your component
const debugUserInfo = () => {
    const userInfo = JSON.parse(localStorage.getItem('user-info'));
    console.log('Current user info:', userInfo);
};

// Add this button for testing (you can remove it later)
<button 
    type="button" 
    onClick={debugUserInfo}
    className="btn btn-secondary mb-2"
>
    Debug: Show User Info
</button>