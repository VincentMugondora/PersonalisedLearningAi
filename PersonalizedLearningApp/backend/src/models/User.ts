import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  verificationCode: { type: String },
  isVerified: { type: Boolean, default: false },
}, {
  timestamps: true // This will add createdAt and updatedAt fields
});

const User = mongoose.model('User', UserSchema);
export default User;
