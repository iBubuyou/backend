import { Router } from 'express';
import { pool } from '../database.js'; // นำเข้า database.js สำหรับการเชื่อมต่อกับ MySQL

const router = Router();

// สร้าง Appointment
const createAppointment = (req, res) => {
    const { AppointDate, AppointTime, CustomerID, ServiceID } = req.body;
    const query = `
        INSERT INTO appointment (AppointDate, AppointTime, CustomerID, ServiceID) 
        VALUES (?, ?, ?, ?)
    `;
    
    pool.query(query, [AppointDate, AppointTime, CustomerID, ServiceID], (err, result) => {
        if (err) {
            console.error('Error creating appointment:', err);
            return res.status(500).json({ error: 'An error occurred while creating the appointment.' });
        }
        res.status(201).json({ message: 'Appointment created successfully!', appointmentId: result.insertId });
    });
};

// อัปเดต Appointment
const updateAppointment = (req, res) => {
    const { id } = req.params;
    const { AppointDate, AppointTime, CustomerID, ServiceID } = req.body;
    const query = `
        UPDATE appointment 
        SET AppointDate = ?, AppointTime = ?, CustomerID = ?, ServiceID = ?
        WHERE AppointID = ?
    `;
    
    pool.query(query, [AppointDate, AppointTime, CustomerID, ServiceID, id], (err, result) => {
        if (err) {
            console.error('Error updating appointment:', err);
            return res.status(500).json({ error: 'An error occurred while updating the appointment.' });
        }
        res.status(200).json({ message: 'Appointment updated successfully!' });
    });
};

// ลบ Appointment
const deleteAppointment = (req, res) => {
    const { id } = req.params;
    const query = 'DELETE FROM appointment WHERE AppointID = ?';

    pool.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error deleting appointment:', err);
            return res.status(500).json({ error: 'An error occurred while deleting the appointment.' });
        }
        res.status(200).json({ message: 'Appointment deleted successfully!' });
    });
};

// ดึงข้อมูล Appointment ทั้งหมด
const getAppointments = async (req, res) => {
    console.log("Fetching appointments...");
    const query = `
        SELECT a.*, c.CustomerName, s.ServiceName 
        FROM appointment a
        JOIN customer c ON a.CustomerID = c.CustomerID
        JOIN service s ON a.ServiceID = s.ServiceID
    `;

    try {
        const [results] = await pool.query(query);
        console.log("Fetched appointments successfully");
        res.status(200).json(results);
    } catch (err) {
        console.error('Error fetching appointments:', err);
        res.status(500).json({ error: 'An error occurred while fetching appointments.' });
    }
};


// ดึงข้อมูล Appointment ตาม ID
const getAppointment = (req, res) => {
    const { id } = req.params;
    const query = `
        SELECT a.*, c.CustomerName, s.ServiceName 
        FROM appointment a
        JOIN customer c ON a.CustomerID = c.CustomerID
        JOIN service s ON a.ServiceID = s.ServiceID
        WHERE a.AppointID = ?
    `;

    pool.query(query, [id], (err, result) => {
        if (err) {
            console.error('Error fetching appointment:', err);
            return res.status(500).json({ error: 'An error occurred while fetching the appointment.' });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Appointment not found!' });
        }
        res.status(200).json(result[0]);
    });
};

// กำหนดเส้นทาง (routes)
router.post('/', createAppointment); // POST /appointment
router.put('/:id', updateAppointment); // PUT /appointment/:id
router.delete('/:id', deleteAppointment); // DELETE /appointment/:id
router.get('/', getAppointments); // GET /appointment
router.get('/:id', getAppointment); // GET /appointment/:id

export default router;
