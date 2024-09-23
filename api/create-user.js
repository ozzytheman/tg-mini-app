// File: /api/create-user.js
   import { MongoClient, ObjectId } from 'mongodb';

   export default async function handler(req, res) {
     // Enable CORS
     res.setHeader('Access-Control-Allow-Credentials', true);
     res.setHeader('Access-Control-Allow-Origin', '*');
     res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
     res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

     if (req.method === 'OPTIONS') {
       res.status(200).end();
       return;
     }

     if (req.method === 'POST') {
       try {
         const { telegramId, firstName, lastName, referredBy } = req.body;
         
         // Log received data
         console.log('Received data:', { telegramId, firstName, lastName, referredBy });

         const client = new MongoClient(process.env.MONGODB_URI);
         await client.connect();
         
         console.log('Connected to MongoDB');

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

         console.log('User created/updated:', user);

         if (referredBy) {
           await users.updateOne(
             { _id: new ObjectId(referredBy) },
             { $addToSet: { referrals: user._id } }
           );
           console.log('Referral updated for user:', referredBy);
         }

         await client.close();
         res.status(200).json({ success: true, message: 'User created/updated successfully', userId: user._id });
       } catch (error) {
         console.error('Error in create-user:', error);
         res.status(500).json({ success: false, message: 'Error creating/updating user', error: error.toString() });
       }
     } else {
       res.setHeader('Allow', ['POST']);
       res.status(405).end(`Method ${req.method} Not Allowed`);
     }
   }
