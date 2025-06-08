require("dotenv").config(); // Ensure this is at the top of the file
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Ajout du middleware CORS
const passport = require("passport");
require("./config/passport"); // Import passport configuration
const User = require("./models/User");
const Transaction = require("./models/Transaction");
const dotenv = require("dotenv");
dotenv.config(); // Charger les variables d'environnement depuis le fichier .env
const authRoutes = require("./routes/auth"); // Import auth routes
const transactionRoutes = require("./routes/transactionRoutes"); // Import transaction routes
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes"); // Import admin routes
const chatbotRoutes = require("./routes/chatbotRoutes"); // Import chatbot routes
const recommendationRoutes = require("./routes/recommendationRoutes"); // Import recommendation routes
const savingsGoalRoutes = require("./routes/savingsGoalRoutes"); // Import savings goal routes
const documentRoutes = require("./routes/documentRoutes"); // Import document routes
const fs = require("fs");
const path = require("path");
const cron = require("./cron"); // Import cron
notificatinService = require("./utils/notificationService"); // Import notification service
// Import notification service

const app = express();
const PORT = process.env.PORT || 5000;


if (!process.env.GEMINI_API_KEY) {
  console.error("❌ API KEY MANQUANTE DANS .env !");
  process.exit(1);
}
// Activer CORS pour toutes les routes
app.use(cors());

// Logger middleware pour tracer toutes les requêtes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Middleware JSON
app.use(express.json());

// Ensure the uploads and documents directories exist
const uploadsDir = path.join(__dirname, "uploads");
const documentsDir = path.join(uploadsDir, "documents");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Uploads directory created:", uploadsDir);
}
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
  console.log("Documents directory created:", documentsDir);
}

// Initialize passport
app.use(passport.initialize());

// Connexion à MongoDB
mongoose
  .connect("mongodb://localhost:27017/smart_portefeuille", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connecté ✅"))
  .catch((err) => console.log("Erreur de connexion à MongoDB ❌", err));

// Route for root path
app.get("/", (req, res) => {
  res.send("Welcome to Smart Portefeuille API");
});

// Route de test simple
app.get("/test", (req, res) => {
  console.log("Route de test accédée");
  res.json({ message: "Route de test fonctionnelle" });
});

// Route GET /users pour récupérer tous les utilisateurs
app.get("/users", async (req, res) => {
  try {
    console.log("Tentative de récupération des utilisateurs");
    const users = await User.find().select("-password");
    console.log(`${users.length} utilisateurs trouvés`);
    res.json(users);
  } catch (error) {
    console.error("Erreur récupération utilisateurs:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// Route GET /transactions pour récupérer toutes les transactions - SANS AUTHENTIFICATION
app.get("/transactions", async (req, res) => {
  console.log("Requête reçue sur /transactions");
  try {
    console.log("Tentative d'accès aux transactions...");
    const transactions = await Transaction.find();
    console.log(`${transactions.length} transactions trouvées`);
    res.json(transactions);
  } catch (error) {
    console.error("Erreur récupération transactions:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});
// app.use(notificatinService.checkGoalProgressAndNotify); // Call the notification service function
// Route POST /transactions pour ajouter une transaction - SANS AUTHENTIFICATION
app.post("/transactions", async (req, res) => {
  console.log("Tentative d'ajout d'une transaction:", req.body);
  try {
    const transaction = await Transaction.create(req.body);
    console.log("Transaction créée avec succès:", transaction._id);
    res.status(201).json(transaction);
  } catch (error) {
    console.error("Erreur création transaction:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Register auth routes
app.use("/api/auth", authRoutes); // Ensure this is correctly registered
app.use("/api/send-verification", authRoutes); // Register new auth route

// Register transaction routes
app.use("/api/transactions", transactionRoutes); // Ensure this is correctly registered

// Register user routes
app.use("/api/users", userRoutes); // Ensure this matches the frontend API call

// Register admin routes
app.use("/api/admin", adminRoutes); // Register new admin route

// Register chatbot routes
app.use("/api/chatbot", chatbotRoutes);

// Register recommendation routes
app.use("/api/recommendations", recommendationRoutes);

// Register savings goal routes
app.use("/api/savings-goals", savingsGoalRoutes); // Register savings goal routes

// Register document routes
app.use("/api/documents", documentRoutes); // Add document routes

// Servir le dossier uploads en statique
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware pour gérer les routes non trouvées
app.use((req, res) => {
  console.log(`Route non trouvée: ${req.method} ${req.url}`);
  res.status(404).json({ message: "Route non trouvée" });
});

// Middleware pour gérer les erreurs
app.use((err, req, res, next) => {
  console.error("Erreur non gérée:", err);
  res.status(500).json({ message: "Erreur serveur interne", error: err.message });
});

// Démarrer le serveur
app.listen(PORT, () => console.log(`🚀 Serveur lancé sur le port ${PORT}`));