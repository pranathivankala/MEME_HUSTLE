import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { config } from './config.js';
import SocketHandler from './socketHandler.js';
import Meme from './models/Meme.js';
import Bid from './models/Bid.js';
import { generateCaptionAndVibe } from './geminiService.js'; 

const app = express();
const httpServer = createServer(app);
const socketHandler = new SocketHandler(httpServer);
const io = socketHandler.ioInstance;

app.use(cors({ origin: config.clientUrl }));
app.use(express.json());

mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const USERS = ['CyberPunk420', 'NeoSynth', 'GlitchQueen'];
const IMAGES = [
  'https://i.imgflip.com/1bij.jpg',
  'https://i.imgflip.com/26am.jpg'
];

const randomUser = () => USERS[Math.floor(Math.random() * USERS.length)];
const randomImage = () => IMAGES[Math.floor(Math.random() * IMAGES.length)];

const isNonEmptyString = (val) => typeof val === 'string' && val.trim() !== '';
const isValidTags = (tags) => Array.isArray(tags) && tags.every(t => typeof t === 'string');

app.post('/api/memes', async (req, res) => {
  try {
    const { title, imageUrl, tags } = req.body;

    
    if (!isNonEmptyString(title)) {
      return res.status(400).json({ error: 'Title is required and must be a non-empty string' });
    }
    if (tags && !isValidTags(tags)) {
      return res.status(400).json({ error: 'Tags must be an array of strings' });
    }

    const owner_id = randomUser();
    const image_url = isNonEmptyString(imageUrl) ? imageUrl : randomImage();
    const safeTags = tags || [];

    const { ai_caption, ai_vibe } = await generateCaptionAndVibe(title, safeTags);

    const meme = new Meme({ title, image_url, tags: safeTags, owner_id, ai_caption, ai_vibe });
    await meme.save();

    io.emit('newMeme', meme);
    res.status(201).json(meme);
  } catch (err) {
    console.error('Error creating meme:', err);
    res.status(500).json({ error: 'Failed to create meme' });
  }
});

app.get('/api/memes', async (req, res) => {
  try {
    const memes = await Meme.find().sort({ createdAt: -1 });
    res.json(memes);
  } catch (err) {
    console.error('Error fetching memes:', err);
    res.status(500).json({ error: 'Failed to fetch memes' });
  }
});

app.post('/api/memes/:id/bid', async (req, res) => {
  const { id } = req.params;
  const { userId, credits } = req.body;

  if (!isNonEmptyString(userId) || typeof credits !== 'number' || credits <= 0) {
    return res.status(400).json({ error: 'Invalid userId or credits' });
  }

  try {
    const meme = await Meme.findById(id);
    if (!meme) return res.status(404).json({ error: 'Meme not found' });
    if (credits <= meme.current_bid) return res.status(400).json({ error: 'Bid too low' });

    const bid = new Bid({ meme_id: id, user_id: userId, amount: credits });
    await bid.save();

    meme.current_bid = credits;
    await meme.save();

    io.emit('bid_update', { memeId: id, userId, credits });
    res.json(bid);
  } catch (err) {
    console.error('Error processing bid:', err);
    res.status(500).json({ error: 'Failed to process bid' });
  }
});

app.post('/api/memes/:id/vote', async (req, res) => {
  const { id } = req.params;
  const { voteType } = req.body;

  if (!['up', 'down'].includes(voteType)) {
    return res.status(400).json({ error: 'Invalid vote type' });
  }

  try {
    const meme = await Meme.findById(id);
    if (!meme) return res.status(404).json({ error: 'Meme not found' });

    meme.upvotes = Math.max(0, meme.upvotes + (voteType === 'up' ? 1 : -1));
    await meme.save();

    const voteData = { memeId: id, voteCount: meme.upvotes };
    io.emit('voteUpdate', voteData);
    res.json(voteData);
  } catch (err) {
    console.error('Error processing vote:', err);
    res.status(500).json({ error: 'Failed to vote' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const topMemes = await Meme.find().sort({ upvotes: -1 }).limit(10);
    res.json(topMemes);
  } catch (err) {
    console.error('Error fetching leaderboard:', err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

httpServer.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
