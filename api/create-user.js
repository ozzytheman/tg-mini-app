// File: /api/create-user.js
import { MongoClient, ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { telegramId, firstName, lastName, referredBy } = req.body;
      const client = new MongoClient(process.env.MONGODB_URI);
      await client.connect();
      const database = client.db('your_database_name');
      const users = database.collection('users');

      const user = await users.findOneAndUpdate(
        { telegramId },
        { 
          $set: { firstName, lastName, updatedAt: new Date() },
          $setOnInsert: { createdAt: new Date(), referrals: [] }
        },
        { upsert: true, returnDocument: 'after' }
      );

      if (referredBy) {
        await users.updateOne(
          { _id: new ObjectId(referredBy) },
          { $addToSet: { referrals: user._id } }
        );
      }

      await client.close();
      res.status(200).json({ success: true, message: 'User created/updated successfully', userId: user._id });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error creating/updating user', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}