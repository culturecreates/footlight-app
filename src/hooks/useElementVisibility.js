import { useEffect, useState } from 'react';

const useElementVisibility = (className, boundingElementClassName) => {
  const [isVisible, setIsVisible] = useState(false);
  console.log(className, boundingElementClassName);
  useEffect(() => {
    const handleIntersection = (entries, boundingElementClassName) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
          const targetRect = entry.target.getBoundingClientRect();
          const parentContainerRect = document.querySelector(boundingElementClassName).getBoundingClientRect();

          const scrollAmount = targetRect.top - parentContainerRect.top;

          const parentContainer = document.querySelector(boundingElementClassName);
          if (parentContainer) {
            parentContainer.scrollTo({
              top: parentContainer.scrollTop + scrollAmount,
              behavior: 'smooth',
            });
          }
        }
      });
    };

    const observer = new IntersectionObserver((entries) => handleIntersection(entries, boundingElementClassName), {
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
