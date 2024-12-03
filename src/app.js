import express from 'express';
import cors from 'cors';
import indexRouter from './index.route.js';
import { createPool } from 'mysql2/promise'; // นำเข้า createPool จาก mysql2/promise
import config from './config.js';

const app = express();
const PORT = process.env.PORT || 8000;

// ใช้ createPool เพื่อเชื่อมต่อกับ MySQL
const pool = createPool({
  host: config.db.main.host,
  user: config.db.main.user,
  password: config.db.main.password,
  database: config.db.main.database,
});

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // อนุญาตเฉพาะจากพอร์ต 3000
  credentials: true,
}));
app.use(express.json()); // เพื่อให้เราสามารถอ่าน JSON payload ได้
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', indexRouter);

// ฟังก์ชันตรวจสอบข้อมูลลงทะเบียนผู้ใช้
const validateUserRegistration = (req, res, next) => {
  const { Email, Password } = req.body;
  if (!Email || !Password) {
    return res.status(400).json({ message: 'Email and Password are required.' });
  }
  next();
};

// Route สำหรับการลงทะเบียนผู้ใช้
app.post('/user/register', validateUserRegistration, async (req, res) => {
  const { Email, Password } = req.body;
  const query = 'INSERT INTO customer (email, password) VALUES (?, ?)';

  try {
    const [result] = await pool.query(query, [Email, Password]);
    res.status(201).json({ message: 'Customer registered successfully!', userId: result.insertId });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to register customer', error: err.message });
  }
});

// Route สำหรับการดึงข้อมูลผู้ใช้
app.get('/user/register', async (req, res) => {
  const query = 'SELECT * FROM customer';
  try {
    const [results] = await pool.query(query);
    res.status(200).json({ status: 'success', code: 1, message: '', result: results });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch customer', error: err.message });
  }
});

// Route สำหรับการจอง
app.post('/reserve', async (req, res) => {
  const { CustomerID, PetID, ServiceID, AppointDate, AppointTime } = req.body;
  console.log(req.body)

  // Validate incoming data
  if (!CustomerID || !PetID || !ServiceID || !AppointDate || !AppointTime) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  const connection = await pool.getConnection(); // ขอการเชื่อมต่อจาก pool
  try {
    await connection.beginTransaction(); // เริ่มต้น transaction

    // Insert appointment data
    const appointmentSql = 'INSERT INTO appointment (ServiceID, AppointDate, AppointTime, CustomerID, PetID) VALUES (?, ?, ?, ?, ?)';
    await connection.query(appointmentSql, [ServiceID, AppointDate, AppointTime, CustomerID, PetID]);

    await connection.commit(); // คอมมิต transaction
    res.json({ message: 'Reservation received successfully!', PetID, ServiceID, AppointDate, AppointTime });
  } catch (error) {
    await connection.rollback(); // ยกเลิก transaction ถ้ามีข้อผิดพลาด
    console.error('Error during reservation process:', error);
    res.status(500).json({ message: 'Error during reservation process', error: error.message });
  } finally {
    connection.release(); // ปล่อยการเชื่อมต่อกลับไปยัง pool
  }
});

// GET /reserve: ดึงข้อมูลการจองทั้งหมด หรือกรองตามเดือน
app.get('/reserve', async (req, res) => {
  // ดึงข้อมูลการจอง
  const query = 'SELECT * FROM appointment'
  try {
    const [result] = await pool.query(query)

    if (result.length === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.status(200).json(result); 
  } catch (err) {
    console.error('Error fetching reservation:', err);
    return res.status(500).json({ message: 'Failed to fetch reservation', error: err.message });
  }
});

// GET /reserve: Fetch all reservations or filter by month if needed
app.get('/reservation', async (req, res) => {
  try {
    const query = 'SELECT AppointDate, AppointTime FROM appointment';
    const [result] = await pool.query(query);

    res.status(200).json({ reservations: result });
  } catch (err) {
    console.error('Error fetching reservations:', err);
    res.status(500).json({ message: 'Failed to fetch reservations', error: err.message });
  }
});


// GET /reserve/:id: Retrieve a reservation by ID
app.get('/reserve/:id', async (req, res) => {
  const { id } = req.params;

  // Use the actual primary key name
  const query = `
  SELECT a.*, s.*
  FROM appointment a
  JOIN service s ON a.ServiceID = s.ServiceID
  WHERE a.CustomerID = ?`; 

  try {
    const [results] = await pool.query(query, [id]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.status(200).json(results); // Return the first result
  } catch (err) {
    console.error('Error fetching reservation:', err);
    return res.status(500).json({ message: 'Failed to fetch reservation', error: err.message });
  }
});



app.delete('/reserve/:id', async (req, res) => {
  const { id } = req.params;

  // Use the actual primary key name of your appointment table
  const query = `DELETE FROM appointment WHERE AppointID = ?`;

  try {
    const [result] = await pool.query(query, [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.status(200).json({ message: 'Reservation deleted successfully' });
  } catch (err) {
    console.error('Error deleting reservation:', err);
    return res.status(500).json({ message: 'Failed to delete reservation', error: err.message });
  }
});

app.post('/petadd', async (req, res) => {
  const {PetName, PetType, PetAge, PetBreed, PetSex } = req.body;
  const query = 'INSERT INTO pet (PetName, PetType, PetAge, PetBreed, PetSex) VALUES (?, ?, ?, ?, ?)';

  try {
    const [result] = await pool.query(query, [ PetName, PetType, PetAge, PetBreed, PetSex]);
    res.status(201).json({ message: 'Pet registered successfully!', petId: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Failed to register pet', error: err.message });
  }
});



app.get('/customer/:id', async (req, res) => {
  // Get CustomerID from route parameters
  const { id: CustomerID } = req.params; // Destructure to get CustomerID
  const query = 'SELECT * FROM customer WHERE CustomerID = ?';

  try {
    const [results] = await pool.query(query, [CustomerID]);

    if (results.length === 0) {
      return res.status(404).json({ message: 'Customer not found' }); // Updated message for clarity
    }

    res.status(200).json(results[0]); // Return the first result
  } catch (err) {
    console.error('Error fetching customer:', err); // Updated message
    return res.status(500).json({ message: 'Failed to fetch customer', error: err.message });
  }
});

app.put('/customer/:id', async (req, res) => {
  const { id: CustomerID } = req.params;
  const { CustomerName, CustomerLastname, CustomerPhone, CustomerMail } = req.body;

  try {
    // Update the customer details in the database
    const result = await pool.query(
      'UPDATE customer SET CustomerName = ?, CustomerLastname = ?, CustomerPhone = ?, CustomerMail = ? WHERE CustomerID = ?',
      [CustomerName, CustomerLastname, CustomerPhone, CustomerMail, CustomerID]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json({ message: 'Customer updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
