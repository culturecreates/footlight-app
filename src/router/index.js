import { createBrowserRouter } from 'react-router-dom';
import { PathName } from '../constants/pathName';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';

export const router = createBrowserRouter([
  {
    path: PathName.Login,
    element: <Login />,
  },
  {
    path: PathName.ForgotPassword,
    element: <ForgotPassword />,
  },
]);
