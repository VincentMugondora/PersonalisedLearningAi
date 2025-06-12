import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { 
    type: String, 
    required: true,
  },
  password: { type: String, required: true },
  verificationCode: { type: String },
  isVerified: { type: Boolean, default: false },
}, {
  timestamps: true // This will add createdAt and updatedAt fields
});

// Define email index explicitly
UserSchema.index({ email: 1 }, { unique: true });

// Prevent model recompilation error
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export default User;
