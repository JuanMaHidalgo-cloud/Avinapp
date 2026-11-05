import { useEffect } from 'react';
import { pocketbaseClient } from '../lib/pocketbaseClient';

const IdleTimer = () => {
  useEffect(() => {
    let timeout;

    const logoutUser = () => {
      pocketbaseClient.authStore.clear();
      window.location.reload();
    };

    const resetTimer = () => {
      clearTimeout(timeout);
      timeout = setTimeout(logoutUser, 900000); 
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('mousedown', resetTimer);

    resetTimer();

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('mousedown', resetTimer);
      clearTimeout(timeout);
    };
  }, []);

  return null;
};

export default IdleTimer;