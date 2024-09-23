import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  telegramId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  referrals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

export default mongoose.models.User || mongoose.model('User', UserSchema);