const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Will be hashed
  role: { type: String, enum: ['user', 'admin'], default: 'user' } // RBAC Role
});

module.exports = mongoose.model('User', UserSchema);

