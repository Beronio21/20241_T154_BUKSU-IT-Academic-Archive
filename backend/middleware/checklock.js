const User = require('../models/userModel');

const checkLock = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.userId);
        if (user.lock) {
            return res.status(423).json({ message: 'User is currently being edited by another admin.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = checkLock;