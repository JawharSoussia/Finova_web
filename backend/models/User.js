const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    profilePicture: { type: String },
     transactionCount: {
    type: Number,
    default: 0
  },
    phoneNumber: { type: String },
    dateOfBirth: { type: Date },
    status: { type: String, enum: ['active', 'inactive', 'blocked'], default: 'active' },
    lastActive: { type: Date, default: Date.now },
    joinDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
