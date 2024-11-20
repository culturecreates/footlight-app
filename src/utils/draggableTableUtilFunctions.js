import { contentLanguageKeyMap } from '../constants/contentLanguage';

/**
 * Clones and updates fallbackStatus by removing the specified columnKey from the row's fallback info.
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

export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

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
