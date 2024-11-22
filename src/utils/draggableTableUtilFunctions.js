import { contentLanguageKeyMap } from '../constants/contentLanguage';

/**
 * Clones and updates fallbackStatus by removing the specified columnKey from the row's fallback info.
 *
 * @param {Object} fallbackStatus - The current fallback status object containing information about rows.
 * @param {Object} row - The row object that includes a key to identify its fallback info.
 * @param {string} columnKey - The key to be removed from the fallback info of the specified row.
 * @returns {Object} - A new fallback status object with the updated data.
 */
export const cloneFallbackStatus = (fallbackStatus, row, columnKey) => {
  const clonedStatus = { ...fallbackStatus };
  const rowFallbackInfo = clonedStatus[row.key];

  if (rowFallbackInfo) {
    // eslint-disable-next-line no-unused-vars
    const { [columnKey]: _, ...updatedFallbackInfo } = rowFallbackInfo;
    clonedStatus[row.key] = updatedFallbackInfo;
  }

  return clonedStatus;
};

/**
 * Recursively updates nodes in a tree structure based on the row data.
 *
 * @param {Array} nodes - The array of tree nodes to be updated.
 * @param {Object} row - The row object containing data to update in the tree nodes.
 * @returns {Array} - The updated tree structure.
 */
export const updateNodeData = (nodes, row) => {
  return nodes.map((node) => {
    if (node.key === row.key) {
      return { ...node, ...row };
    }
    if (node.children && node.children.length > 0) {
      return { ...node, children: updateNodeData(node.children, row) };
    }
    return node;
  });
};

/**
 * Removes properties from nodes based on the fallbackStatus conditions.
 *
 * @param {Array} data - The array of tree nodes to sanitize.
 * @param {Object} fallbackStatus - The fallback status object.
 * @returns {Array} - The sanitized tree structure.
 */
export const sanitizeData = (data, fallbackStatus) => {
  return data.map((item) => {
    // Create a shallow copy of the item to avoid mutating the original object
    const updatedItem = { ...item };
    const fallbackInfo = fallbackStatus[updatedItem.key];

    if (fallbackInfo) {
      Object.entries(fallbackInfo).forEach(([key, value]) => {
        if (value.tagDisplayStatus === true && key in updatedItem) {
          delete updatedItem[key];
        }
      });
    }

    if (updatedItem.children && updatedItem.children.length > 0) {
      // Recursively sanitize the children and update the children property
      updatedItem.children = sanitizeData(updatedItem.children, fallbackStatus);
    }

    return updatedItem;
  });
};

/**
 * Transforms nodes to consolidate language keys into a `name` object and removes them from the node.
 *
 * @param {Array} data - The array of tree nodes to transform.
 * @returns {Array} - The transformed tree structure with consolidated language keys for name field.
 */
export const transformLanguageKeys = (data) => {
  return data.map((item) => {
    const name = {};

    Object.values(contentLanguageKeyMap).forEach((langKey) => {
      if (langKey in item) {
        name[langKey] = item[langKey];
        delete item[langKey];
      }
    });

    if (Object.keys(name).length > 0) {
      item.name = name;
    }

    if (item.children && item.children.length > 0) {
      item.children = transformLanguageKeys(item.children);
    }

    return item;
  });
};

/**
 * Creates a deep clone of an object using JSON serialization.
 *
 * @param {Object} obj - The object to clone.
 * @returns {Object} - The deep-cloned object.
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Creates a deep copy of an object or array.
 *
 * @param {Object|Array} obj - The object or array to deep copy.
 * @returns {Object|Array} - The deep-copied object or array.
 */
export const deepCopy = (obj) => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(deepCopy);
  }
  const copiedObj = {};
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      copiedObj[key] = deepCopy(obj[key]);
    }
  }
  return copiedObj;
};

/**
 * Moves a concept (node) from one part of the tree/table to another.
 *
 * @param {string} dragKey - The key of the node being dragged.
 * @param {string} dropKey - The key of the node where the dragged node is dropped.
 * @param {Array} data - The array of tree nodes to modify.
 * @param {boolean} [dropToGap=false] - Whether to drop the node into a gap (as a sibling) or as a child.
 * @returns {Array} - The modified tree structure with the node moved.
 */
export function moveConcept(dragKey, dropKey, data, dropToGap = false) {
  let clonedData = deepClone(data);

  let dragParent = null;
  let dragItem = null;
  let dropParent = null;
  let dropIndex = -1;

  function findItemAndParent(key, items, parent = null) {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];

      if (item.key === key) {
        return { item, parent, index: i };
      }

      if (item.children) {
        const result = findItemAndParent(key, item.children, item);
        if (result) return result;
      }
    }
    return null;
  }

  const dragResult = findItemAndParent(dragKey, clonedData);
  if (dragResult) {
    dragItem = dragResult.item;
    dragParent = dragResult.parent;
  }

  const dropResult = findItemAndParent(dropKey, clonedData);
  if (dropResult) {
    dropParent = dropResult.parent;
    dropIndex = dropResult.index;
  }

  if (dragItem && dropResult) {
    // Remove drag item from its original position
    if (dragParent) {
      dragParent.children = dragParent.children.filter((item) => item.key !== dragKey);
    } else {
      clonedData = clonedData.filter((item) => item.key !== dragKey);
    }

    if (dropToGap) {
      // Add drag item as a child of the drop item
      if (!dropResult.item.children) {
        dropResult.item.children = [];
      }
      dropResult.item.children.push(dragItem);
    } else {
      // Add drag item as a sibling at the drop index
      if (dropParent) {
        dropParent.children.splice(dropIndex, 0, dragItem);
      } else {
        clonedData.splice(dropIndex, 0, dragItem);
      }
    }
  }

  return clonedData;
}
