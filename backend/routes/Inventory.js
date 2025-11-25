const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');


router.get('/', async (req, res) => {
  try {
    const medicines = await Medicine.find();
    const today = new Date();
    const alerts = medicines.filter(med => 
      med.quantity < 10 || 
      (med.expiryDate - today) / (1000 * 60 * 60 * 24) < 30 
    );
    res.json({ medicines, alerts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post('/', async (req, res) => {
  const { name, description, quantity, price, expiryDate, category } = req.body;
  try {
    const newMedicine = new Medicine({ name, description, quantity, price, expiryDate, category });
    await newMedicine.save();
    res.status(201).json(newMedicine);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json(medicine);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});


router.delete('/:id', async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) return res.status(404).json({ message: 'Medicine not found' });
    res.json({ message: 'Medicine deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;