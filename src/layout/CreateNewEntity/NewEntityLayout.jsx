import { Button } from 'antd';
import React from 'react';
import './createNew.css';

const NewEntityLayout = ({ children, heading, text }) => {
  return (
    <section className="create-new-entity-page">
      <header>
        <div className="button-container">
          <Button>back to previous screen</Button>
        </div>
        <h1 className="heading">{`New ${heading}`}</h1>
      </header>

      <div className="content">
        <h2 className="sub-heading">Search for another instance</h2>
        <p>{text}</p>
        <div className="search">
          <p>{heading}</p>
          {children}
        </div>
      </div>
    </section>
  );
};

export default NewEntityLayout;
