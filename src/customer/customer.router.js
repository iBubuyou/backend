import express from 'express';
const router = express.Router();

let customers = []; // Array เพื่อจำลองฐานข้อมูลสำหรับ customers

// Create a new customer
const createCustomer = (req, res) => {
    const { CustomerName, CustomerLastname, CustomerPhone, CustomerMail, CustomerPW, PetID, ServiceID, UserID } = req.body;

    const newCustomer = {
        CustomerID: customers.length + 1,
        CustomerName,
        CustomerLastname,
        CustomerPhone,
        CustomerMail,
        CustomerPW,
        PetID: PetID || null,
        ServiceID: ServiceID || null,
        UserID: UserID || null
    };

    customers.push(newCustomer);
    res.status(201).json(newCustomer);
};

// Update an existing customer by ID
const updateCustomer = (req, res) => {
    const { id } = req.params;
    const { CustomerName, CustomerLastname, CustomerPhone, CustomerMail, CustomerPW, PetID, ServiceID, UserID } = req.body;

    const customerIndex = customers.findIndex(cust => cust.CustomerID === parseInt(id));

    if (customerIndex === -1) {
        return res.status(404).json({ message: 'Customer not found' });
    }

    const updatedCustomer = {
        ...customers[customerIndex],
        CustomerName: CustomerName || customers[customerIndex].CustomerName,
        CustomerLastname: CustomerLastname || customers[customerIndex].CustomerLastname,
        CustomerPhone: CustomerPhone || customers[customerIndex].CustomerPhone,
        CustomerMail: CustomerMail || customers[customerIndex].CustomerMail,
        CustomerPW: CustomerPW || customers[customerIndex].CustomerPW,
        PetID: PetID !== undefined ? PetID : customers[customerIndex].PetID,
        ServiceID: ServiceID !== undefined ? ServiceID : customers[customerIndex].ServiceID,
        UserID: UserID !== undefined ? UserID : customers[customerIndex].UserID
    };

    customers[customerIndex] = updatedCustomer;
    res.status(200).json(updatedCustomer);
};

// Delete a customer by ID
const deleteCustomer = (req, res) => {
    const { id } = req.params;

    const customerIndex = customers.findIndex(cust => cust.CustomerID === parseInt(id));

    if (customerIndex === -1) {
        return res.status(404).json({ message: 'Customer not found' });
    }

    const deletedCustomer = customers.splice(customerIndex, 1);
    res.status(200).json(deletedCustomer[0]);
};

// Get all customers
const getCustomers = (req, res) => {
    res.status(200).json(customers);
};

// Get a customer by ID
const getCustomer = (req, res) => {
    const { id } = req.params;
    const customer = customers.find(cust => cust.CustomerID === parseInt(id));

    if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
    }

    res.status(200).json(customer);
};

// Search for customers by name, phone, or email
const getCustomersByTerm = (req, res) => {
    const searchString = req.params.term.toLowerCase();

    const filteredCustomers = customers.filter(customer => {
        return customer.CustomerName.toLowerCase().includes(searchString) ||
               customer.CustomerPhone.toLowerCase().includes(searchString) ||
               customer.CustomerMail.toLowerCase().includes(searchString);
    });

    if (filteredCustomers.length === 0) {
        return res.status(404).json({ message: 'No customers found with the provided search term!' });
    }

    res.status(200).json(filteredCustomers);
};

// Auth middleware (เพื่อจำลอง authController.verifyToken)
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) {
        return res.status(403).send('No token provided.');
    }
    // สมมติว่าผ่านการยืนยันเสมอ
    next();
};

// Routes
router.post('/customer', createCustomer); // สร้าง customer ใหม่
router.put('/customer/:id', updateCustomer); // อัพเดทข้อมูล customer
router.delete('/customer/:id', deleteCustomer); // ลบ customer
router.get('/customer/:id', getCustomer); // รับข้อมูล customer โดย ID
router.get('/customer', verifyToken, getCustomers); // รับข้อมูล customer ทั้งหมด (ตรวจสอบ token ก่อน)
router.get('/customer/q/:term', verifyToken, getCustomersByTerm); // ค้นหา customer (ตรวจสอบ token ก่อน)

export default router;

