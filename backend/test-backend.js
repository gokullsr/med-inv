// test-backend.js
const testData = {
  name: "Paracetamol 500mg",
  category: "Tablet",
  manufacturer: "Cipla Ltd.",
  price: 33,
  quantity: 20,
  expiryDate: "2026-07-15"
};

fetch('http://localhost:5000/api/inventory', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(testData)
})
.then(response => response.json())
.then(data => console.log('Success:', data))
.catch(error => console.error('Error:', error));