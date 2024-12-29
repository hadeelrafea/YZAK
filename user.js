require('dotenv').config(); 
const bcrypt = require('bcrypt');
const { MongoClient } = require('mongodb');

async function hashPassword(plainPassword) {
  const saltRounds = 10; 
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
  return hashedPassword;
}

async function createUser(fullName, email, plainPassword, role) {
  const hashedPassword = await hashPassword(plainPassword);

  const user = {
    fullName, 
    email,
    passwordHash: hashedPassword,
    role,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const client = new MongoClient(process.env.MONGO_URI); 
  try {
    await client.connect();
    const db = client.db("YZAK"); 
    const usersCollection = db.collection("users");
    await usersCollection.insertOne(user);
    console.log("User created:", user);
  } catch (err) {
    console.error("Error creating user:", err);
  } finally {
    await client.close();
  }
}

// Example usage:
createUser("Hadeel Mohamed", "a00576@aubh.edu.bh", "Hadeel", "leader");
