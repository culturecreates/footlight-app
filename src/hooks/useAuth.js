// listens and handles authentication broadcast of login logout events across tabs

import { useEffect } from 'react';
import { clearUser, getUserDetails, setUser } from '../redux/reducer/userSlice';
import { useDispatch, useSelector } from 'react-redux';

export function useAuth() {
  const { user } = useSelector(getUserDetails);
  const dispatch = useDispatch();

  useEffect(() => {
    // Listen for logout messages
    const broadcastChannel = new BroadcastChannel('auth');
    broadcastChannel.onmessage = (event) => {
      const { type, userId } = event.data;
      if (type === 'logout') {
        handleLogout({ user, clearData: () => dispatch(clearUser()) });
      } else if (type === 'login' && user && user.id != userId) {
        handleLogout({ user, clearData: () => dispatch(clearUser()) });
      }
    };

    return () => {
      broadcastChannel.close();
    };
  }, [user, dispatch]);
}

export const handleLogin = ({ userInfo, accessToken, refreshToken }) => {
  setUser({ userInfo, refreshToken: { token: refreshToken }, accessToken: accessToken });
  const broadcastChannel = new BroadcastChannel('auth');
  broadcastChannel.postMessage({ type: 'login', userId: userInfo.id });
};

export const handleLogout = ({ user, clearData }) => {
  clearData();
  setUser(null);
  const broadcastChannel = new BroadcastChannel('auth');
  broadcastChannel.postMessage({ type: 'logout', userId: user.id });
};
