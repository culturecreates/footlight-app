import { useEffect, useState } from 'react';

const useElementVisibility = (className) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);

          const targetRect = entry.target.getBoundingClientRect();
          const parentContainerRect = document.querySelector('.search-scrollable-content').getBoundingClientRect();

          const scrollAmount = targetRect.top - parentContainerRect.top;

          const parentContainer = document.querySelector('.search-scrollable-content');
          if (parentContainer) {
            parentContainer.scrollTo({
              top: parentContainer.scrollTop + scrollAmount,
              behavior: 'smooth',
            });
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection, {
      root: document.querySelector('.search-scrollable-content'),
      rootMargin: '0px',
      threshold: 0.5,
    });

    const target = document.querySelector(`.${className}`);

    if (target) {
      observer.observe(target);
    }

    return () => {
      if (target) {
        observer.unobserve(target);
      }
    };
  }, [className]);

  return isVisible;
};

export default useElementVisibility;
