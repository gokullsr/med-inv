const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const nodemailer = require('nodemailer');
const twilio = require('twilio');


const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});


const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Admin contact details
const ADMIN_EMAIL = 'medicaladmin@hospital.com';
const ADMIN_PHONE = '+919876543210'; // Replace with actual admin number

// Check low stock and send alerts
router.get('/check-low-stock', async (req, res) => {
  try {
    const lowStockItems = await Inventory.find({ 
      quantity: { $lte: 10 }, // Alert threshold: 10 or less
      quantity: { $gt: 0 } // Exclude out-of-stock
    });

    const criticalStockItems = await Inventory.find({ 
      quantity: 0 // Out of stock
    });

    if (lowStockItems.length > 0 || criticalStockItems.length > 0) {
      await sendAlerts(lowStockItems, criticalStockItems);
    }

    res.json({
      lowStock: lowStockItems,
      criticalStock: criticalStockItems,
      message: 'Stock check completed'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send alerts via email and SMS
async function sendAlerts(lowStockItems, criticalStockItems) {
  const alertMessage = generateAlertMessage(lowStockItems, criticalStockItems);
  
  // Send Email
  await sendEmailAlert(alertMessage);
  
  // Send SMS (if critical items)
  if (criticalStockItems.length > 0) {
    await sendSMSAlert(alertMessage);
  }
}

function generateAlertMessage(lowStockItems, criticalStockItems) {
  let message = "🚨 MEDICAL INVENTORY ALERT 🚨\n\n";
  
  if (criticalStockItems.length > 0) {
    message += "❌ CRITICAL STOCK - OUT OF STOCK:\n";
    criticalStockItems.forEach(item => {
      message += `• ${item.name} - ${item.quantity} units\n`;
    });
    message += "\n";
  }
  
  if (lowStockItems.length > 0) {
    message += "⚠️ LOW STOCK ALERT:\n";
    lowStockItems.forEach(item => {
      message += `• ${item.name} - ${item.quantity} units remaining\n`;
    });
  }
  
  message += `\nPlease restock immediately.\nGenerated on: ${new Date().toLocaleString()}`;
  return message;
}

async function sendEmailAlert(message) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: ADMIN_EMAIL,
      subject: '🚨 Medical Inventory Low Stock Alert',
      text: message,
      html: `<pre style="font-family: Arial, sans-serif;">${message}</pre>`
    });
    console.log('Low stock alert email sent');
  } catch (error) {
    console.error('Email alert failed:', error);
  }
}

async function sendSMSAlert(message) {
  try {
    // Truncate message for SMS (160 character limit)
    const smsMessage = message.length > 160 ? message.substring(0, 157) + '...' : message;
    
    await twilioClient.messages.create({
      body: smsMessage,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: ADMIN_PHONE
    });
    console.log('Low stock alert SMS sent');
  } catch (error) {
    console.error('SMS alert failed:', error);
  }
}

// Manual alert trigger
router.post('/send-manual-alert', async (req, res) => {
  try {
    const { medicineId, message } = req.body;
    await sendSMSAlert(`Manual Alert: ${message}`);
    await sendEmailAlert(`Manual Alert: ${message}`);
    res.json({ message: 'Manual alert sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;