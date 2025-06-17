import mongoose from 'mongoose';

const MemeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  image_url: { type: String, required: true },
  tags: [{ type: String }],
  ai_caption: String,
  ai_vibe: String,
  upvotes: { type: Number, default: 0 },
  current_bid: { type: Number, default: 100 },
  owner_id: String
}, { timestamps: true });

// Indexes for performance
MemeSchema.index({ tags: 1 });
MemeSchema.index({ upvotes: -1 });

export default mongoose.model('Meme', MemeSchema);
