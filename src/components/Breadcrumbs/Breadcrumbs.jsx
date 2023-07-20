import React from 'react';
import './breadCrumbs.css';
import { useMatches, useNavigate } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import { LeftOutlined } from '@ant-design/icons';

function Breadcrumbs(props) {
  const { name } = props;
  let matches = useMatches();
  const navigate = useNavigate();
  console.log(matches);
  let crumbs = matches
    // first get rid of any matches that don't have handle and crumb
    .filter((match) => Boolean(match.handle?.crumb))
    // now map them into an array of elements, passing the loader
    // data to each one
    .map((match) => match.handle.crumb(match.data));
  console.log(crumbs);
  return (
    <Breadcrumb className="breadcrumbs">
      {crumbs.map((crumb, index) => (
        <Breadcrumb.Item key={index} className="breadcrumb-item cursor" onClick={() => navigate(-1)}>
          <LeftOutlined style={{ marginRight: '17px' }} />
          {crumb}
        </Breadcrumb.Item>
      ))}

      {name && <Breadcrumb.Item className="breadcrumb-item">{name}</Breadcrumb.Item>}
    </Breadcrumb>
  );
}

export default Breadcrumbs;
