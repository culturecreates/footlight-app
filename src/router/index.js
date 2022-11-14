import { createBrowserRouter } from 'react-router-dom';
import { PathName } from '../constants/pathName';
import Login from '../pages/Login';

export const router = createBrowserRouter([
  {
    path: PathName.Login,
    element: <Login />,
  },
]);
