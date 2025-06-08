const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Utilisateur déjà existant" });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with the hashed password
    const user = new User({ name, email, password: hashedPassword });

    // Save the user to the database
    await user.save();

    // Generate JWT token
    const token = jwt.sign( {
      userId: user._id,
      email: user.email,
      role: user.role, // Make sure this is included
      name: user.name
    },
    process.env.JWT_SECRET,
    { expiresIn: "7D" });

    console.log("User created:", user); // Log the created user
    res.status(201).json({ message: "Utilisateur créé avec succès", token });
  } catch (error) {
    console.error("Error in register function:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    console.log("Login request payload:", req.body);

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      console.log("User not found:", email);
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    console.log("User found:", user);
    console.log("Plain text password received from frontend:", password);
    console.log("Hashed password from database:", user.password);

    // Compare the plain text password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password comparison result:", isMatch);

    if (!isMatch) {
      console.log("Login failed: Incorrect password for user:", email);
      return res.status(400).json({ message: "Mot de passe incorrect" });
    }

    // Generate JWT token with role
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );
    console.log("Login successful for user:", email);

    // Send user data without password
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth
    };

    res.status(200).json({ token, user: userData });
  } catch (error) {
    console.error("Error in login function:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, phoneNumber, dateOfBirth } = req.body;
    const userId = req.user?.userId;
    if (!userId) {
      console.error("User ID is missing in the request.");
      return res.status(401).json({ error: "Unauthorized: User not authenticated" });
    }

    const updateData = {
      firstName,
      lastName,
      email,
      phoneNumber,
      dateOfBirth,
    };

    if (req.file) {
      updateData.profilePicture = `/uploads/${req.file.filename}`; // Save the file path to the database
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).json({ error: "Failed to update user profile" });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized: User not authenticated" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user profile" });
  }
};


module.exports = { register, login, updateUserProfile, getUserProfile };
