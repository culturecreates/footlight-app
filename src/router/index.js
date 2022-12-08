import { createBrowserRouter } from 'react-router-dom';
import { PathName } from '../constants/pathName';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import Dashboard from '../pages/Dashboard';
import ResetPassword from '../pages/ResetPassword';
import Events from '../pages/Dashboard/Events';

export const router = createBrowserRouter([
  {
    path: PathName.Login,
    element: <Login />,
  },
  {
    path: PathName.ForgotPassword,
    element: <ForgotPassword />,
  },

  {
    path: PathName.ResetPassword,
    element: <ResetPassword />,
  },
  {
    path: PathName.Dashboard,
    element: <Dashboard />,
    children: [
      {
        path: `:calendarId${PathName.Events}`,
        element: <Events />,
      },
      { path: `:calendarId${PathName.Events}${PathName.AddEvent}`, element: <>hai</> },

      {
        path: `:calendarId${PathName.Places}`,
        element: <div>Places</div>,
      },
      {
        path: `:calendarId${PathName.Organizations}`,
        element: <div>Organisations</div>,
      },
      {
        path: `:calendarId${PathName.Taxonomies}`,
        element: <div>Taxonomies</div>,
      },
      {
        path: `:calendarId${PathName.Settings}`,
        element: <div>Settings</div>,
      },
    ],
  },
]);
