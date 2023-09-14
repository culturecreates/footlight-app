import { createBrowserRouter } from 'react-router-dom';
import { PathName } from '../constants/pathName';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import Dashboard from '../pages/Dashboard';
import ResetPassword from '../pages/ResetPassword';
import Events from '../pages/Dashboard/Events';
import AddEvent from '../pages/Dashboard/AddEvent';
// import { ReactComponent as NotFound } from '../../src/assets/images/illustatus.svg';
import EventReadOnly from '../pages/Dashboard/EventReadOnly';
import CreateAccount from '../pages/CreateAccount';
import Users from '../pages/Dashboard/Users';
import ErrorAlert from '../components/Error/Error';
import Organizations from '../pages/Dashboard/Organizations';
import Places from '../pages/Dashboard/Places';
import People from '../pages/Dashboard/People';
import OrganizationsReadOnly from '../pages/Dashboard/OrganizationsReadOnly';
import PersonReadOnly from '../pages/Dashboard/PersonReadOnly';
import PlaceReadOnly from '../pages/Dashboard/PlaceReadOnly';
import { Translation } from 'react-i18next';
import CreateNewOrganization from '../pages/Dashboard/CreateNewOrganization';
import SearchOrganizations from '../pages/Dashboard/SearchOrganizations';
import SearchPerson from '../pages/Dashboard/SearchPerson';
import SearchPlaces from '../pages/Dashboard/SearchPlaces';
import Settings from '../pages/Dashboard/Settings';
import CreateNewPerson from '../pages/Dashboard/CreateNewPerson';

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
    errorElement: <ErrorAlert />,
    children: [
      {
        path: `:calendarId${PathName.Events}`,
        element: <Events />,
      },
      {
        path: `:calendarId${PathName.Events}/:eventId`,
        element: <EventReadOnly />,
        handle: {
          crumb: () => <Translation>{(t) => t('dashboard.sidebar.events')}</Translation>,
        },
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
        path: `:calendarId${PathName.Places}${PathName.Search}`,
        element: <SearchPlaces />,
      },
      {
        path: `:calendarId${PathName.Places}/:placeId`,
        element: <PlaceReadOnly />,
        handle: {
          crumb: () => <Translation>{(t) => t('dashboard.places.place')}</Translation>,
        },
      },
      {
        path: `:calendarId${PathName.Organizations}`,
        element: <Organizations />,
      },
      {
        path: `:calendarId${PathName.Organizations}${PathName.Search}`,
        element: <SearchOrganizations />,
      },
      {
        path: `:calendarId${PathName.Organizations}/:organizationId`,
        element: <OrganizationsReadOnly />,
        handle: {
          crumb: () => <Translation>{(t) => t('dashboard.organization.organizations')}</Translation>,
        },
      },
      {
        path: `:calendarId${PathName.Organizations}${PathName.AddOrganization}`,
        element: <CreateNewOrganization />,
      },
      {
        path: `:calendarId${PathName.People}`,
        element: <People />,
      },
      {
        path: `:calendarId${PathName.People}${PathName.Search}`,
        element: <SearchPerson />,
      },
      {
        path: `:calendarId${PathName.People}/:personId`,
        element: <PersonReadOnly />,
        handle: {
          crumb: () => <Translation>{(t) => t('dashboard.people.people')}</Translation>,
        },
      },
      {
        path: `:calendarId${PathName.People}${PathName.AddPerson}`,
        element: <CreateNewPerson />,
      },
      {
        path: `:calendarId${PathName.Taxonomies}`,
        element: <div>Taxonomies</div>,
      },
      {
        path: `:calendarId${PathName.Settings}`,
        element: <Settings />,
      },
      {
        path: `:calendarId${PathName.Settings}${PathName.UserManagement}/:userId`,
        element: <Settings />,
      },
    ],
  },
  {
    path: PathName.NotFound,
    element: <ErrorAlert errorType="pageNotFound" />,
  },
]);
