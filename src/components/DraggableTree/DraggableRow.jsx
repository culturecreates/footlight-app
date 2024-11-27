import { useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';

/**
 * @param {Object} props - Props for the DraggableBodyRow component.
 * @param {string|number} props['data-row-key'] - Unique key for the row.
 * @param {function} props.moveRow - Function to handle row movement.
 * @param {string} [props.className] - Additional class names for styling.
 * @param {number} props.numberOfParents - Number of parent elements to determine nesting level.
 * @param {Object} [props.style] - Inline styles for the row.
 * @param {Object} [props.restProps] - Additional props passed to the row.
 */

const type = 'DraggableBodyRow';

const DraggableBodyRow = ({ 'data-row-key': dataRowKey, moveRow, className, numberOfParents, style, ...restProps }) => {
  const ref = useRef(null);
  const [isDroppingToGap, setIsDroppingToGap] = useState(false);
  const [{ isOver, dropClassName }, drop] = useDrop({
    accept: type,
    hover: (_, monitor) => {
      setIsDroppingToGap(monitor.getDifferenceFromInitialOffset()?.x > 40);
    },
    collect: (monitor) => {
      const { dataRowKey: dragIndex } = monitor.getItem() || {};

      if (dragIndex === dataRowKey) {
        return {};
      }
      return {
        isOver: monitor.isOver(),
        dropClassName: `${isDroppingToGap ? ' drop-over-upward-in-gap' : ' drop-over-upward'}`,
      };
    },
    drop: (item, monitor) => {
      const dropToGap = monitor.getDifferenceFromInitialOffset()?.x > 40;
      moveRow(item.dataRowKey, dataRowKey, dropToGap);
    },
  });

  const [, drag] = useDrag({
    type,
    item: {
      dataRowKey,
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  drop(drag(ref));

  return (
    <tr
      ref={ref}
      className={`${className} ${isOver ? dropClassName : ''} table-row`}
      style={{
        cursor: 'move',
        marginLeft: `${numberOfParents * 4}px`,
        ...style,
      }}
      {...restProps}
    />
  );
};

export default DraggableBodyRow;
