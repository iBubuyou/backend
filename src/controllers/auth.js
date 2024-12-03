import jwt from 'jsonwebtoken'; // ใช้ import สำหรับ ES Modules
const secretKey = process.env.JWT_KEY; // ใช้ secret key จาก environment variable

export const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1]; // แยก token จาก 'Bearer <token>'
    if (!token) {
        return res.status(403).send('No token provided.');
    }

    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            return res.status(500).send('Failed to authenticate token.');
        }
        req.userId = decoded.id; // เพิ่ม userId ลงใน request object ถ้า token ถูกต้อง
        next();
    });
};
