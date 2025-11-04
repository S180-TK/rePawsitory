// server/server.js
const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors()); // allow React frontend to access this API
app.use(express.json());

// Hardcoded data (this will simulate our "database")
const pets = [
    { id: 1, name: 'Oreos', species: 'Dog', breed: 'Shipoo', age: 3, photo: '🐕' },
    { id: 2, name: 'Wafa', species: 'Cat', breed: 'Siamese', age: 2, photo: '🐈' },
    { id: 3, name: 'Hansel', species: 'Dog', breed: 'Shih Tzu', age: 5, photo: '🐕' },
    { id: 4, name: 'Fita', species: 'Dog', breed: 'Ascal', age: 4, photo: '🐕' }
  ];

  
// Endpoint to send data to frontend
app.get("/pets", (req, res) => {
  res.json(pets);
});

// Endpoint to add a new pet
app.post("/pets", (req, res) => {
  const { name, species, breed, age, photo } = req.body || {};

  if (!name || !species) {
    return res.status(400).json({ error: "'name' and 'species' are required" });
  }

  const nextId = pets.length > 0 ? Math.max(...pets.map(p => p.id)) + 1 : 1;
  const newPet = {
    id: nextId,
    name,
    species,
    breed: breed || "",
    age: typeof age === "number" ? age : Number(age) || 0,
    photo: photo || ""
  };

  pets.push(newPet);
  return res.status(201).json(newPet);
});

// Start server
app.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));
