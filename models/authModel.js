const db = require('../db')

exports.findByWalletAddress = async (userWalletAddress) => {
    const [rows] = await db.query('SELECT * FROM users WHERE userWalletAddress = ?', [userWalletAddress])

    if (rows.length === 0) {
        return null;
    }
    return rows[0];
};


exports.createUser = async (userWalletAddress, userNonce) => {
    await db.query(
        'INSERT INTO users(userWalletAddress, userName, userNonce) VALUES (?, ?, ?)',
        [userWalletAddress, userWalletAddress.substring(3,10), userNonce]
    );
};


exports.updateNonce = async (userNum, newNonce) => {
    await db.query(
        'UPDATE users SET userNonce = ? where userNum = ?',
        [newNonce, userNum]
    );
};