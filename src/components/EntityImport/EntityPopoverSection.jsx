import React from 'react';
import NoContent from '../NoContent/NoContent';
import LoadingIndicator from '../LoadingIndicator';

function EntityPopoverSection({
  title,
  headerDataCy,
  isLoading,
  hasError,
  errorNode,
  items,
  itemDataCy,
  onSelect,
  renderItem,
  itemClassName = 'search-popover-options',
}) {
  return (
    <>
      <div className="popover-section-header" data-cy={headerDataCy}>
        {title}
      </div>
      <div className="search-scrollable-content">
        {isLoading && (
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LoadingIndicator />
          </div>
        )}
        {!isLoading &&
          (hasError ? (
            errorNode
          ) : items?.length > 0 ? (
            items.map((item, index) => (
              <div
                key={item?.id ?? item?._id ?? item?.uri ?? index}
                className={typeof itemClassName === 'function' ? itemClassName(item, index) : itemClassName}
                onClick={() => onSelect?.(item)}
                data-cy={itemDataCy(index)}>
                {renderItem(item, index)}
              </div>
            ))
          ) : (
            <NoContent />
          ))}
      </div>
    </>
  );
}

export default EntityPopoverSection;
