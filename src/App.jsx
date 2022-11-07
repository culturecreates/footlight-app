import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/index';

function App() {
  return (
    <React.Fragment>
      <RouterProvider router={router} />
      hai
    </React.Fragment>
  );
}

export default App;
