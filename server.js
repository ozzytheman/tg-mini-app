const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

let database;

app.post('/api/create-user', async (req, res) => {
  console.log('Received create-user request:', req.body);
  try {
    const { telegramId, firstName, lastName, referredBy } = req.body;
    const users = database.collection('users');

    const user = await users.findOneAndUpdate(
      { telegramId },
      { 
        $set: { firstName, lastName, updatedAt: new Date() },
        $setOnInsert: { createdAt: new Date(), referrals: [] }
      },
      { upsert: true, returnDocument: 'after' }
    );

    console.log('User created/updated:', user);

    if (referredBy) {
      await users.updateOne(
        { _id: new ObjectId(referredBy) },
        { $addToSet: { referrals: user._id } }
      );
      console.log('Referral updated for user:', referredBy);
    }

    res.json({ success: true, message: 'User created/updated successfully', userId: user._id });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    res.status(500).json({ success: false, message: 'Error creating/updating user', error: error.message });
  }
});

app.get('/api/referral-link/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const referralLink = `${process.env.APP_URL}?ref=${userId}`;
    res.json({ success: true, referralLink });
  } catch (error) {
    console.error('Error generating referral link:', error);
    res.status(500).json({ success: false, message: 'Error generating referral link' });
  }
});

app.get('/api/user-stats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const users = database.collection('users');

    const user = await users.findOne({ _id: new ObjectId(userId) });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const referralCount = user.referrals ? user.referrals.length : 0;
    res.json({ success: true, referralCount });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching user stats' });
  }
});

connectToDatabase()
  .then((db) => {
    database = db;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to the database', error);
    process.exit(1);
  });