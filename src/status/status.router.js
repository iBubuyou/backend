import { Router } from 'express';

const router = Router();

// Mock data storage for statuses (You should replace this with a real database connection)
let statuses = [];

// Insert one status
const createStatus = (req, res) => {
    const { StatusName, StatusDate, StatusTime, AppointID } = req.body;
    const newStatus = {
        StatusID: statuses.length + 1,
        StatusName,
        StatusDate: new Date(StatusDate),
        StatusTime: new Date(StatusTime),
        AppointID: Number(AppointID),
    };

    statuses.push(newStatus);
    res.status(201).json(newStatus);
};

// Update one status
const updateStatus = (req, res) => {
    const { id } = req.params;
    const { StatusName, StatusDate, StatusTime } = req.body;

    const statusIndex = statuses.findIndex(status => status.StatusID === Number(id));

    if (statusIndex === -1) {
        return res.status(404).json({ message: 'Status not found!' });
    }

    statuses[statusIndex] = {
        ...statuses[statusIndex],
        StatusName: StatusName ?? statuses[statusIndex].StatusName,
        StatusDate: StatusDate ? new Date(StatusDate) : statuses[statusIndex].StatusDate,
        StatusTime: StatusTime ? new Date(StatusTime) : statuses[statusIndex].StatusTime
    };

    res.status(200).json(statuses[statusIndex]);
};

// Delete status by id
const deleteStatus = (req, res) => {
    const { id } = req.params;
    const statusIndex = statuses.findIndex(status => status.StatusID === Number(id));

    if (statusIndex === -1) {
        return res.status(404).json({ message: 'Status not found!' });
    }

    const deletedStatus = statuses.splice(statusIndex, 1);
    res.status(200).json(deletedStatus[0]);
};

// Get all statuses
const getStatuses = (req, res) => {
    res.status(200).json(statuses);
};

// Get a status by id
const getStatus = (req, res) => {
    const { id } = req.params;
    const status = statuses.find(status => status.StatusID === Number(id));

    if (!status) {
        return res.status(404).json({ message: 'Status not found!' });
    }

    res.status(200).json(status);
};

// Search statuses by StatusName
const searchStatusesByTerm = (req, res) => {
    const searchTerm = req.params.term.trim().toLowerCase();

    if (!searchTerm) {
        return res.status(400).json({ message: 'Search term is required.' });
    }

    const filteredStatuses = statuses.filter(status => status.StatusName.toLowerCase().includes(searchTerm));

    if (filteredStatuses.length === 0) {
        return res.status(404).json({ message: 'No statuses found with the provided term!' });
    }

    res.status(200).json(filteredStatuses);
};

// Define routes
router.post('/status', createStatus);
router.put('/status/:id', updateStatus);
router.delete('/status/:id', deleteStatus);
router.get('/status/:id', getStatus);
router.get('/status', getStatuses);
router.get('/status/q/:term', searchStatusesByTerm);

// ใช้ export default แทน module.exports
export default router;
