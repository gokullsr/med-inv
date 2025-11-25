import React, { useEffect, useState } from "react";
import axios from "axios";

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ name: "", age: "", condition: "" });

 
  const fetchPatients = async () => {
    try {
      const res = await axios.get("http://localhost:5000/patients");
      setPatients(res.data);
    } catch (err) {
      console.error("Error fetching patients:", err);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/patients", form);
      setForm({ name: "", age: "", condition: "" });
      fetchPatients();
      alert("✅ Patient added successfully!");
    } catch (err) {
      console.error("Error adding patient:", err);
      alert("❌ Failed to add patient");
    }
  };

  return (
    <div className="page">
      <h1>🧑‍⚕️ Patients</h1>

      {/* Add Patient Form */}
      <form className="patient-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          type="number"
          placeholder="Age"
          value={form.age}
          onChange={(e) => setForm({ ...form, age: e.target.value })}
          required
        />
        <input
          type="text"
          placeholder="Condition"
          value={form.condition}
          onChange={(e) => setForm({ ...form, condition: e.target.value })}
          required
        />
        <button type="submit">Add Patient</button>
      </form>

      {/* Patient List */}
      <table className="patient-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Condition</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((p) => (
            <tr key={p._id}>
              <td>{p.name}</td>
              <td>{p.age}</td>
              <td>{p.condition}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Patients;
