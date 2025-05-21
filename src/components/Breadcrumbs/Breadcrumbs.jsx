import React from 'react';
import './breadCrumbs.css';
import { useMatches, useNavigate } from 'react-router-dom';
import { Breadcrumb } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { truncateText } from '../../utils/stringManipulations';

function Breadcrumbs(props) {
  const { name } = props;
  let matches = useMatches();
  const navigate = useNavigate();

  let crumbs = matches.filter((match) => Boolean(match.handle?.crumb)).map((match) => match.handle.crumb(match.data));

  return (
    <Breadcrumb className="breadcrumbs" data-cy="antd-breadcrumbs">
      {crumbs.map((crumb, index) => (
        <Breadcrumb.Item
          key={index}
          className="breadcrumb-item cursor"
          onClick={() => navigate(-1)}
          data-cy="antd-breadcrumb-item">
          <LeftOutlined style={{ marginRight: '17px' }} />
          {crumb}
        </Breadcrumb.Item>
      ))}

      {name && (
        <Breadcrumb.Item className="breadcrumb-item" data-cy="antd-breadcrumb-item-name">
          {truncateText(name, 90)}
        </Breadcrumb.Item>
      )}
    </Breadcrumb>
  );
}

export default Breadcrumbs;
