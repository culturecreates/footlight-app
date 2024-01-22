import React from 'react';
import './App.css';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/index';

function App() {
  console.log('New test ');

  return (
    <React.Fragment>
      <RouterProvider router={router} />
    </React.Fragment>
  );
}

export default App;
