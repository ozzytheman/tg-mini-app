import clientPromise from '../lib/mongodb';
import User from '../models/User';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const client = await clientPromise;
      const db = client.db();
      
      const { telegramId, username } = req.body;
      
      let user = await User.findOne({ telegramId });
      
      if (!user) {
        user = new User({ telegramId, username });
        await user.save();
      }
      
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Error creating user' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}