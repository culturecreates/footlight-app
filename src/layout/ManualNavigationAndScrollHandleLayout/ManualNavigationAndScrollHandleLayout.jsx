import React, { useEffect } from 'react';
import useElementVisibility from '../../hooks/useElementVisibility';
import { handleKeyPress } from '../../utils/handleKeyPress';

const ManualNavigationAndScrollHandleLayout = (props) => {
  const { children, popoverState, data, setItem, form, popOverHandler, selectedItemIndex, setSelectedItemIndex } =
    props;

  useElementVisibility(`event-popover-options-${selectedItemIndex}`);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (popoverState) {
        handleKeyPress({
          e,
          selectedItemIndex,
          data: data,
          setSelectedItemIndex,
          setItem,
          form,
          popOverHandler,
        });
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  }, [popoverState, selectedItemIndex]);

  return <div>{children}</div>;
};

export default ManualNavigationAndScrollHandleLayout;
