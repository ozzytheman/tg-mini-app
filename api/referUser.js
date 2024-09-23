import clientPromise from '../lib/mongodb';
import User from '../models/User';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const client = await clientPromise;
      const db = client.db();
      
      const { referrerId, referralCode } = req.body;
      
      const referrer = await User.findById(referrerId);
      const referred = await User.findById(referralCode);
      
      if (!referrer || !referred) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      if (referrer._id.toString() === referred._id.toString()) {
        return res.status(400).json({ error: 'Cannot refer yourself' });
      }
      
      if (!referrer.referrals.includes(referred._id)) {
        referrer.referrals.push(referred._id);
        await referrer.save();
      }
      
      res.status(200).json({ message: 'Referral successful' });
    } catch (error) {
      res.status(500).json({ error: 'Error processing referral' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}