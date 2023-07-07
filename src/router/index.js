import { createBrowserRouter } from 'react-router-dom';
import { PathName } from '../constants/pathName';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import Dashboard from '../pages/Dashboard';
import ResetPassword from '../pages/ResetPassword';
import Events from '../pages/Dashboard/Events';
import AddEvent from '../pages/Dashboard/AddEvent';
import { ReactComponent as NotFound } from '../../src/assets/images/illustatus.svg';
import EventReadOnly from '../pages/Dashboard/EventReadOnly';
import CreateAccount from '../pages/CreateAccount/CreateAccount';
import Users from '../pages/Dashboard/Users';
import Organizations from '../pages/Dashboard/Organizations';
import Places from '../pages/Dashboard/Places';
import People from '../pages/Dashboard/People/People';

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
    path: PathName.AcceptInvitation,
    element: <CreateAccount />,
  },
  {
    path: PathName.Join,
    element: <CreateAccount />,
  },
  {
    path: PathName.Dashboard,
    element: <Dashboard />,
    children: [
      {
        path: `:calendarId${PathName.Events}`,
        element: <Events />,
      },
      {
        path: `:calendarId${PathName.Events}/:eventId`,
        element: <EventReadOnly />,
      },
      {
        path: `:calendarId${PathName.Events}${PathName.AddEvent}`,
        element: <AddEvent />,
        children: [
          {
            path: ':eventId',
            element: <AddEvent />,
          },
        ],
      },
      {
        path: `:calendarId${PathName.Profile}/:userId`,
        element: <Users />,
      },

      {
        path: `:calendarId${PathName.Places}`,
        element: <Places />,
      },
      {
        path: `:calendarId${PathName.Organizations}`,
        element: <Organizations />,
      },
      {
        path: `:calendarId${PathName.People}`,
        element: <People />,
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
  {
    path: PathName.NotFound,
    element: (
      <div>
        <NotFound />
      </div>
    ),
  },
]);
