import express from "express";
import Patient from "../models/Patient.js";
import AuditLog from "../models/AuditLog.js";

const router = express.Router();

// Get all patients
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.find().sort({ name: 1 });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new patient
router.post("/", async (req, res) => {
  try {
    const patient = new Patient(req.body);
    const savedPatient = await patient.save();
    
    await AuditLog.create({
      action: 'PATIENT_ADDED',
      description: `Patient "${savedPatient.name}" registered`,
      user: "System",
      entityType: 'Patient',
      entityId: savedPatient._id,
      newData: savedPatient
    });
    
    res.status(201).json(savedPatient);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;