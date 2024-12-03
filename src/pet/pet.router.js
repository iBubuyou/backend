import { Router } from 'express';

const petRouter = Router();
const pets = []; // จำลองฐานข้อมูล

// Insert one pet
petRouter.post('/', async (req, res) => {
    const {PetName, PetType, PetAge, PetBreed, PetSex } = req.body;
    const query = 'INSERT INTO pet (PetName, PetType, PetAge, PetBreed, PetSex) VALUES (?, ?, ?, ?, ?)';
  
    try {
      const [result] = await pool.query(query, [ PetName, PetType, PetAge, PetBreed, PetSex]);
      res.status(201).json({ message: 'Pet registered successfully!', petId: result.insertId });
    } catch (err) {
      res.status(500).json({ message: 'Failed to register pet', error: err.message });
    }
  });
  

// Update one pet
petRouter.put('/:id', (req, res) => {
    const { id } = req.params;
    const { PetName, PetType, PetBreed, PetAge, PetSex } = req.body;

    const petIndex = pets.findIndex(pet => pet.PetID === parseInt(id));

    if (petIndex === -1) {
        return res.status(404).json({ message: 'Pet not found' });
    }

    pets[petIndex] = {
        ...pets[petIndex],
        PetName: PetName || pets[petIndex].PetName,
        PetType: PetType || pets[petIndex].PetType,
        PetBreed: PetBreed || pets[petIndex].PetBreed,
        PetAge: PetAge !== undefined ? PetAge : pets[petIndex].PetAge,
        PetSex: PetSex || pets[petIndex].PetSex
    };

    res.status(200).json(pets[petIndex]);
});

// Delete pet by id
petRouter.delete('/:id', (req, res) => {
    const { id } = req.params;
    const petIndex = pets.findIndex(pet => pet.PetID === parseInt(id));

    if (petIndex === -1) {
        return res.status(404).json({ message: 'Pet not found' });
    }

    const deletedPet = pets.splice(petIndex, 1);
    res.status(200).json(deletedPet[0]);
});

// Get all pets
petRouter.get('/', (req, res) => {
    res.status(200).json(pets);
});

// Get a pet by id
petRouter.get('/:id', (req, res) => {
    const { id } = req.params;
    const pet = pets.find(pet => pet.PetID === parseInt(id));

    if (!pet) {
        return res.status(404).json({ message: 'Pet not found' });
    }

    res.status(200).json(pet);
});

// Search pets by PetName, PetType, or PetBreed
petRouter.get('/q/:term', (req, res) => {
    const searchTerm = req.params.term.toLowerCase();

    const filteredPets = pets.filter(pet => {
        return pet.PetName.toLowerCase().includes(searchTerm) ||
               pet.PetType.toLowerCase().includes(searchTerm) ||
               pet.PetBreed.toLowerCase().includes(searchTerm);
    });

    if (filteredPets.length === 0) {
        return res.status(404).json({ message: 'No pets found with the provided term!' });
    }

    res.status(200).json(filteredPets);
});

export default petRouter;
