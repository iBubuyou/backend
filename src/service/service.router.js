import { Router } from 'express';

const router = Router();

// Array จำลองฐานข้อมูลสำหรับ services
const services = [];

// Insert one service
const createService = (req, res) => {
    const { ServiceName } = req.body; // รับข้อมูล service

    const newService = {
        ServiceID: services.length + 1, // สร้าง ServiceID อัตโนมัติ
        ServiceName
    };

    services.push(newService);
    res.status(201).json(newService); // ใช้ status 201 สำหรับการสร้างข้อมูลใหม่
};

// Update one service
const updateService = (req, res) => {
    const { id } = req.params; // รับ ID จาก URL
    const { ServiceName } = req.body;

    const serviceIndex = services.findIndex(service => service.ServiceID === parseInt(id));

    if (serviceIndex === -1) {
        return res.status(404).json({ message: 'Service not found' });
    }

    // อัพเดทข้อมูลของ service
    services[serviceIndex] = {
        ...services[serviceIndex],
        ServiceName: ServiceName || services[serviceIndex].ServiceName,
    };

    res.status(200).json(services[serviceIndex]);
};

// Delete service by id
const deleteService = (req, res) => {
    const { id } = req.params;
    const serviceIndex = services.findIndex(service => service.ServiceID === parseInt(id));

    if (serviceIndex === -1) {
        return res.status(404).json({ message: 'Service not found' });
    }

    const deletedService = services.splice(serviceIndex, 1);
    res.status(200).json(deletedService[0]);
};

// Get all services
const getServices = (req, res) => {
    res.status(200).json(services);
};

// Get a service by id
const getService = (req, res) => {
    const { id } = req.params;
    const service = services.find(service => service.ServiceID === parseInt(id));

    if (!service) {
        return res.status(404).json({ message: 'Service not found' });
    }

    res.status(200).json(service);
};

// Search services by ServiceName
const searchServicesByTerm = (req, res) => {
    const searchTerm = req.params.term.toLowerCase();

    const filteredServices = services.filter(service => {
        return service.ServiceName.toLowerCase().includes(searchTerm);
    });

    if (filteredServices.length === 0) {
        return res.status(404).json({ message: 'No services found with the provided term!' });
    }

    res.status(200).json(filteredServices);
};

// กำหนดเส้นทาง (Routes) สำหรับการจัดการ services
router.post('/service', createService); // สร้างบริการใหม่
router.put('/service/:id', updateService); // อัพเดทข้อมูลบริการ
router.delete('/service/:id', deleteService); // ลบบริการ
router.get('/service/:id', getService); // รับข้อมูลบริการโดย ID
router.get('/service', getServices); // รับข้อมูลบริการทั้งหมด
router.get('/service/q/:term', searchServicesByTerm); // ค้นหาบริการตามเงื่อนไข

export default router; // เปลี่ยนเป็น export default
