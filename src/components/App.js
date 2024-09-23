import React, { useEffect, useState } from 'react';
import axios from 'axios';
import WebApp from '@twa-dev/sdk';

const App = () => {
  const [user, setUser] = useState(null);
  const [referralCode, setReferralCode] = useState('');

  useEffect(() => {
    const initUser = async () => {
      try {
        // Ensure WebApp is initialized
        WebApp.ready();
        
        const response = await axios.post('/api/createUser', {
          telegramId: WebApp.initDataUnsafe?.user?.id,
          username: WebApp.initDataUnsafe?.user?.username,
        });
        setUser(response.data);
      } catch (error) {
        console.error('Error creating user:', error);
      }
    };

    initUser();
  }, []);

  const handleRefer = async () => {
    if (!referralCode) return;

    try {
      await axios.post('/api/referUser', {
        referrerId: user._id,
        referralCode,
      });
      alert('Referral successful!');
      setReferralCode('');
    } catch (error) {
      console.error('Error referring user:', error);
      alert('Referral failed. Please try again.');
    }
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="App">
      <h1>Welcome, {user.username}!</h1>
      <p>Your referral code: <strong>{user._id}</strong></p>
      <div>
        <input
          type="text"
          value={referralCode}
          onChange={(e) => setReferralCode(e.target.value)}
          placeholder="Enter referral code"
        />
        <button onClick={handleRefer}>Refer</button>
      </div>
    </div>
  );
};

export default App;