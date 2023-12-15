import { useEffect } from 'react';

const useScroll = ({ data, setItem, setFieldValue, popOverHandler }) => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const itemContainersArray = document?.querySelectorAll('.search-scrollable-content');
  let focusedProjectIndex = -1;

  let items = [];

  const findData = (focusedProjectIndex) => {
    if (focusedProjectIndex > data[0].length - 1) {
      return data[1][focusedProjectIndex - data[0].length];
    } else {
      return data[0][focusedProjectIndex];
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'ArrowDown') {
      if (focusedProjectIndex === items.length - 1) {
        items[focusedProjectIndex]?.setAttribute('tabIndex', -1);
        focusedProjectIndex = 0;
        items[focusedProjectIndex]?.setAttribute('tabIndex', 0);
      } else {
        items[focusedProjectIndex]?.setAttribute('tabIndex', -1);
        focusedProjectIndex++;
        items[focusedProjectIndex]?.setAttribute('tabIndex', 0);
      }
    }

    if (e.key === 'ArrowUp') {
      if (focusedProjectIndex === 0 || focusedProjectIndex === -1) {
        focusedProjectIndex = items.length - 1;
      } else {
        focusedProjectIndex--;
      }
    }

    if (e.key === 'Escape') {
      popOverHandler();
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const selectedItem = findData(focusedProjectIndex);
      setItem(selectedItem);
      setFieldValue(selectedItem?.value);
      popOverHandler();
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const selected = items[focusedProjectIndex];
      e.preventDefault();
      selected.scrollIntoView({
        block: 'nearest',
        inline: 'start',
        behavior: reducedMotion.matches ? 'auto' : 'smooth',
      });
      selected.focus({ preventScroll: true });
    }
  };

  useEffect(() => {
    if (itemContainersArray) {
      const itemContainer1 = itemContainersArray[0]?.querySelectorAll('.event-popover-options');
      const itemContainer2 = itemContainersArray[1]?.querySelectorAll('.event-popover-options');

      items = [
        ...(itemContainer1?.length > 0 ? itemContainer1 : []),
        ...(itemContainer2?.length > 0 ? itemContainer2 : []),
      ];
      if (items.length > 0) {
        items?.forEach((child) => child.setAttribute('tabIndex', -1));
        itemContainersArray[0]?.setAttribute('tabIndex', 0);
        items[0]?.setAttribute('tabIndex', 0);
        document.addEventListener('keydown', handleKeyPress);
      }
    }
    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [itemContainersArray]);
};

export default useScroll;
