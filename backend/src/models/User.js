const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  passwordHash: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['citizen', 'engineer', 'admin'], 
    default: 'citizen' 
  },
  department: { type: String }, // For engineer/admin
  location: {
    latitude: { type: Number },
    longitude: { type: Number }
  },
  ward: { type: String },
  zone: { type: String },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Avoid returning passwordHash
userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

// Password comparison method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
