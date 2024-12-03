import { Router } from "express";
import userrouter from "./user/user.router.js";
import appointmentRouter from "./appointment/appointment.router.js";
import customerRouter from './customer/customer.router.js';
import petRouter from './pet/pet.router.js'; // default export
import { verifyToken } from './controllers/auth.js';
import serviceRouter from './service/service.router.js';
import statusRouter from './status/status.router.js';
import usersRouter from './users/users.router.js';

const router = Router();

router.use("/user", userrouter); // เส้นทางสำหรับ user (ไม่ต้องใช้ verifyToken ถ้าเป็น public)
router.use('/users', verifyToken, usersRouter); // ใช้ verifyToken
router.use('/appointment', verifyToken, appointmentRouter);
router.use('/customer', verifyToken, customerRouter);
router.use('/pet', petRouter);
router.use('/service', verifyToken, serviceRouter);
router.use('/status', verifyToken, statusRouter);

const getReservations = async (req, res) => {
    const { month } = req.query;
    const monthIndex = new Date(Date.parse(month + " 1, 2023")).getMonth() + 1;
    const query = 'SELECT AppointDate, AppointTime FROM appointment WHERE MONTH(AppointDate) = ?';
  
    try {
      const [results] = await pool.query(query, [monthIndex]);
      res.status(200).json({ reservations: results });
    } catch (err) {
      return res.status(500).json({ message: 'Failed to fetch reservations', error: err.message });
    }
  };
  
  router.get('/api/reservations', getReservations);
  
  export default router;