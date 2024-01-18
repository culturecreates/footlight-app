import { useEffect, useRef } from 'react';

const useKeyboardAccessiblePopOver = ({ data, setItem, setFieldValue, popOverHandler, isPopoverOpen }) => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let focusedItemIndex = -1;
  let itemsRef = useRef([]);

  const findData = (focusedItemIndex) => {
    let currentIndex = 0;

    for (let i = 0; i < data.length; i++) {
      const currentArray = data[i];
      const nextIndex = currentIndex + currentArray.length;

      if (focusedItemIndex < nextIndex) {
        return currentArray[focusedItemIndex - currentIndex];
      }

      currentIndex = nextIndex;
    }
  };

  const handleSingleResult = (flag) => {
    if (flag) {
      const onlyChild = itemsRef.current[0];
      focusedItemIndex = 0;
      onlyChild.setAttribute('tabIndex', 0);
      onlyChild.focus({ preventScroll: true });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (itemsRef.current.length > 0) {
        if (e.key === 'ArrowDown') {
          focusedItemIndex = (focusedItemIndex + 1) % itemsRef.current.length; // reset to 0 if length equals focus-index
        } else if (e.key === 'ArrowUp') {
          focusedItemIndex = (focusedItemIndex - 1 + itemsRef.current.length) % itemsRef.current.length;
        }

        itemsRef.current.forEach((child, index) => {
          const shouldFocus = index === focusedItemIndex;
          child.setAttribute('tabIndex', shouldFocus ? 0 : -1);

          if (shouldFocus) {
            e.preventDefault();
            child.scrollIntoView({
              block: 'nearest',
              inline: 'start',
              behavior: reducedMotion.matches ? 'auto' : 'smooth',
            });
            child.focus({ preventScroll: true });
          }
        });
      }
    }

    if (e.key === 'Escape') {
      popOverHandler();
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const selectedItem = findData(focusedItemIndex);
      setItem(selectedItem);
      setFieldValue(selectedItem?.value);
      popOverHandler();
    }
  };

  useEffect(() => {
    if (isPopoverOpen) {
      const updateItemsArray = () => {
        const itemContainersArray = document?.querySelectorAll('.search-scrollable-content');

        if (itemContainersArray) {
          const itemsRefArray = [];

          for (let i = 0; i < itemContainersArray.length; i++) {
            const currentContainer = itemContainersArray[i];
            const currentItems = currentContainer?.querySelectorAll('.event-popover-options');

            itemsRefArray.push(currentItems?.length > 0 ? currentItems : []);
          }

          itemsRef.current = itemsRefArray.reduce((accumulator, currentItems) => [...accumulator, ...currentItems], []);

          if (itemsRef.current.length > 0) {
            itemsRef.current?.forEach((child) => child.setAttribute('tabIndex', -1));
            itemContainersArray[0]?.setAttribute('tabIndex', 0);
            itemsRef.current[0]?.setAttribute('tabIndex', 0);
            handleSingleResult(itemsRef.current.length === 1);
          }
        }
      };

      updateItemsArray();

      const observer = new MutationObserver(updateItemsArray);
      observer.observe(document.body, { subtree: true, childList: true });

      document.addEventListener('keydown', handleKeyPress);

      return () => {
        document.removeEventListener('keydown', handleKeyPress);
        observer.disconnect();
      };
    }
  }, [isPopoverOpen, data]);
};

export default useKeyboardAccessiblePopOver;
