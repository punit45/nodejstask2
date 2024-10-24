import express from "express";
import mongoose from "mongoose";

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/usersdb")
.then(() => console.log("MongoDB connected"))
.catch(err => console.error("MongoDB connection error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  hobby: { type: String, required: true }
});


// Check if MongoDB is running
mongoose.connection.on('connected', () => {
  console.log('MongoDB is running!');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// User Model
const User = mongoose.model("User", userSchema);

// Middleware to log request details
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Validation middleware for POST and PUT requests
const validateUser = (req, res, next) => {
  const { firstName, lastName, hobby } = req.body;
  if (!firstName || !lastName || !hobby) {
    return res.status(400).json({ error: "All fields (firstName, lastName, hobby) are required" });
  }
  next();
};

// GET /users – Fetch all users from MongoDB
app.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Error fetching users" });
  }
});

// GET /users/:id – Fetch details of a specific user by MongoDB ObjectId
app.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Error fetching user" });
  }
});

// POST /users – Add a new user and save it in MongoDB
app.post("/users", validateUser, async (req, res) => {
  const { firstName, lastName, hobby } = req.body;
  const newUser = new User({
    firstName,
    lastName,
    hobby
  });
  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ error: "Error saving user" });
  }
});

// PUT /users/:id – Update details of an existing user
app.put("/users/:id", validateUser, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: "Error updating user" });
  }
});

// DELETE /users/:id – Delete a user by MongoDB ObjectId
app.delete("/users/:id", async (req, res) => {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting user" });
  }
});

// Handle 404 for any other routes
app.use((req, res) => {
  res.status(404).json({ error: "Resource not found" });
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Server on port 5500
app.listen(5500, () => {
  console.log("Server is running on port 5500");
  console.log("MongoDB connected");
});
