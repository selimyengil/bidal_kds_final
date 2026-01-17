const jwt = require('jsonwebtoken');
const sequelize = require('../config/db');

const SECRET_KEY = process.env.JWT_SECRET;

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const [users] = await sequelize.query(`
            SELECT * FROM kullanicilar 
            WHERE username = '${username}' AND password = '${password}'
        `);

        if (users.length > 0) {
            const user = users[0];
            const token = jwt.sign(
                { id: user.kullanici_id, role: user.rol, name: user.ad_soyad },
                SECRET_KEY,
                { expiresIn: '8h' } 
            );

            res.json({ 
                success: true, 
                token: token, 
                user: { ad_soyad: user.ad_soyad, rol: user.rol } 
            });
        } else {
            res.status(401).json({ success: false, message: 'Hatalı kullanıcı adı veya şifre!' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};