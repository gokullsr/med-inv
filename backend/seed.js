import mongoose from "mongoose";
import dotenv from "dotenv";
import Inventory from "./models/Inventory.js";
import Sale from "./models/Sale.js";
import Patient from "./models/Patient.js";
import AuditLog from "./models/AuditLog.js";

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB for heavy seeding...");

    // 1. Seed Medicines (Inventory)
    const medicines = [
      { name: "Paracetamol 500mg", category: "Analgesics", manufacturer: "GSK", price: 1.50, quantity: 450, expiryDate: new Date("2027-12-30") },
      { name: "Amoxicillin 250mg", category: "Antibiotics", manufacturer: "Pfizer", price: 3.20, quantity: 180, expiryDate: new Date("2026-11-25") },
      { name: "Insulin Glargine", category: "Antidiabetic", manufacturer: "Sanofi", price: 85.00, quantity: 0, expiryDate: new Date("2027-01-01") }, // Critical
      { name: "Ventolin Inhaler", category: "Bronchodilators", manufacturer: "GSK", price: 12.00, quantity: 2, expiryDate: new Date("2026-12-15") }, // Low Stock
      { name: "Epinephrine Auto-Injector", category: "Emergency", manufacturer: "Mylan", price: 250.00, quantity: 0, expiryDate: new Date("2026-06-30") }, // Critical
      { name: "Azithromycin 500mg", category: "Antibiotics", manufacturer: "Sandoz", price: 14.20, quantity: 4, expiryDate: new Date("2027-04-10") }, // Low Stock
      { name: "Metformin 500mg", category: "Antidiabetic", manufacturer: "Merck", price: 2.15, quantity: 320, expiryDate: new Date("2028-02-10") },
      { name: "Cetirizine 10mg", category: "Antihistamines", manufacturer: "Zyrtec", price: 0.85, quantity: 7, expiryDate: new Date("2026-06-20") },
      { name: "Aspirin 81mg", category: "Anticoagulants", manufacturer: "Bayer", price: 0.45, quantity: 500, expiryDate: new Date("2026-12-05") },
      { name: "Atorvastatin 20mg", category: "Statins", manufacturer: "Pfizer", price: 12.50, quantity: 150, expiryDate: new Date("2027-09-30") },
      { name: "Omeprazole 20mg", category: "Antacids", manufacturer: "AstraZeneca", price: 4.80, quantity: 210, expiryDate: new Date("2027-01-15") },
      { name: "Sertraline 50mg", category: "Antidepressants", manufacturer: "Zoloft", price: 15.00, quantity: 120, expiryDate: new Date("2027-05-20") },
      { name: "Ibuprofen 400mg", category: "NSAIDs", manufacturer: "Advil", price: 1.25, quantity: 600, expiryDate: new Date("2026-10-12") },
      { name: "Albuterol Inhaler", category: "Bronchodilators", manufacturer: "Ventolin", price: 35.00, quantity: 45, expiryDate: new Date("2026-12-31") },
      { name: "Vitamin C 500mg", category: "Supplements", manufacturer: "NatureMade", price: 0.15, quantity: 1200, expiryDate: new Date("2027-08-01") }
    ];

    await Inventory.deleteMany({});
    const savedMedicines = await Inventory.insertMany(medicines);
    console.log(`✅ Loaded ${savedMedicines.length} medicines!`);

    // 2. Seed Patients
    const patients = [
      { name: "Rajesh Kumar", age: 45, condition: "Hypertension", medicine: "Atorvastatin" },
      { name: "Priya Sharma", age: 32, condition: "Diabetes Type 2", medicine: "Metformin" },
      { name: "Arjun Singh", age: 68, condition: "Asthma", medicine: "Albuterol" },
      { name: "Anjali Gupta", age: 24, condition: "Seasonal Allergies", medicine: "Cetirizine" },
      { name: "Vikram Reddy", age: 55, condition: "Acid Reflux", medicine: "Omeprazole" },
      { name: "Sneha Patel", age: 41, condition: "Depression", medicine: "Sertraline" },
      { name: "Suresh Babu", age: 50, condition: "Bacterial Infection", medicine: "Amoxicillin" }
    ];

    await Patient.deleteMany({});
    await Patient.insertMany(patients);
    console.log(`✅ Loaded ${patients.length} Indian patient names!`);

    // 3. Seed Sales (25+ records spread over 7 days)
    const sales = [];
    const medicinesForSales = ["Paracetamol 500mg", "Amoxicillin 250mg", "Ibuprofen 400mg", "Atorvastatin 20mg", "Omeprazole 20mg", "Ventolin Inhaler"];
    const customers = [
        "Rajesh Kumar", "Priya Sharma", "Arjun Singh", "Anjali Gupta", "Vikram Reddy", 
        "Sneha Patel", "Suresh Babu", "Karthik Subramanian", "Meera Iyer", "Rahul Verma",
        "Deepika Padukone", "Amitabh Bachchan", "Sunita Williams", "Harish Rawat", "Preeti Zinta"
    ];
    
    for (let i = 0; i < 30; i++) {
        const medName = medicinesForSales[Math.floor(Math.random() * medicinesForSales.length)];
        const qty = Math.floor(Math.random() * 5) + 1; // Real individuals buy 1-5 units
        const price = 50 + Math.random() * 450; 
        const daysAgo = Math.floor(Math.random() * 7);
        
        sales.push({
            medicine: medName,
            quantity: qty,
            unitPrice: parseFloat(price.toFixed(2)),
            totalPrice: parseFloat((qty * price).toFixed(2)),
            customer: customers[Math.floor(Math.random() * customers.length)],
            condition: "Patient Prescription",
            date: new Date(Date.now() - daysAgo * 86400000 - Math.random() * 3600000)
        });
    }

    await Sale.deleteMany({});
    await Sale.insertMany(sales);
    console.log(`✅ Loaded ${sales.length} JYO Medical Centre patient sales!`);

    // 4. Seed Audit Logs (More active logs)
    const actions = ["MEDICINE_ADDED", "STOCK_ADJUSTED", "INVENTORY_VIEWED", "SALES_VIEWED", "PATIENT_ADDED"];
    const auditLogs = [];
    
    for (let i = 0; i < 20; i++) {
        const action = actions[Math.floor(Math.random() * actions.length)];
        const minsAgo = Math.floor(Math.random() * 120); // within last 2 hours
        
        auditLogs.push({
            action: action,
            description: `${action.replace("_", " ")} by system administrator`,
            user: "admin@gmail.com",
            entityType: action.includes("MEDICINE") ? "Inventory" : action.includes("SALE") ? "Sales" : "Audit",
            timestamp: new Date(Date.now() - minsAgo * 60000)
        });
    }

    await AuditLog.deleteMany({});
    await AuditLog.insertMany(auditLogs);
    console.log(`✅ Loaded ${auditLogs.length} active audit logs!`);

    console.log("✨ Heavy seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  }
};

seedData();
