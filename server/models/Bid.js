import mongoose from 'mongoose';

const BidSchema = new mongoose.Schema({
  meme_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Meme' },
  user_id: String,
  amount: Number
}, { timestamps: true });

export default mongoose.model('Bid', BidSchema);
