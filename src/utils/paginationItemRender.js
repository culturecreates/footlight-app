import React from 'react';

export const paginationItemRender = (page, type, originalElement) => {
  if (type === 'page') {
    return React.cloneElement(originalElement, {
      'data-cy': 'pagination-page',
      'data-page': page,
    });
  }

  if (type === 'next') {
    return React.cloneElement(originalElement, {
      'data-cy': 'pagination-next',
    });
  }

  return originalElement;
};
