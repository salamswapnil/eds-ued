/* eslint-disable max-len */
/**
 * Creates a DOM element with the specified tag name, classes, inner text, and attributes.
 *
 * @param {string} tagName - The type of element to create (e.g., 'div', 'span').
 * @param {string[]} [classList] - An array of class names to add to the element.
 * @param {string} [innerText] - The text content to set for the element.
 * @param {Object} [attributesJson] - An object containing attribute key-value pairs to set on the element.
 * @returns {HTMLElement} The newly created DOM element.
 */
function createDomElement(tagName, classList, innerText, attributesJson) {
  const element = document.createElement(tagName);
  if (classList) {
    element.classList.add(...classList);
  }
  if (innerText) {
    element.innerText = innerText;
  }
  if (attributesJson) {
    Object.keys(attributesJson).forEach((key) => {
      element.setAttribute(key, attributesJson[key]);
    });
  }
  return element;
}

/**
 * Trims the text content of an element (and its children)
 * to a maximum number of characters, preserving valid HTML.
 *
 * @param {HTMLElement} root - The element whose contents to trim.
 * @param {number} limit - The maximum number of characters to keep.
 */
function trimElementTextToCharLimit(root, limit) {
  let count = 0;

  function trimNode(node) {
    // If limit already reached, remove the rest of the node
    if (count >= limit) {
      node.remove();
      return;
    }

    if (node.nodeType === Node.TEXT_NODE) {
      const text = /\S/.test(node.textContent) ? node.textContent : '';
      if (count + text.length > limit) {
        // Trim the text content and remove excess
        node.textContent = text.slice(0, limit - count);
      }
      count += text.length;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      // Traverse children in order
      const children = Array.from(node.childNodes);
      children.some((child, index) => {
        if (count >= limit) {
          return true;
        }
        trimNode(child);
        if (count >= limit) {
          // remove remaining siblings
          children.slice(index + 1).forEach((sibling) => sibling.remove());
          return true;
        }
        return false;
      });
    }
  }

  trimNode(root);
}

/**
 * Updates URLs in a string by applying transformations or replacements.
 *
 * @param {string} path - The string containing URLs to update. Path should start with "/"
 * @returns {string} The string with updated URLs.
 */
function getAssetPath(path) {
  return `${hlx.codeBasePath}${path}`;
}

/**
 * Set url path for assets to use in CSS code
 *
 * @param {string} path - The string containing URLs to update. Path should start with "/"
 * @returns {string} The string with updated URLs.
 */
function getCSSAssetPath(path) {
  return `url(${hlx.codeBasePath}${path})`;
}

/**
 * Creates a DOM element with specified tag name, attributes, event listeners, and child elements.
 * Supports nested elements, HTML strings as children, and event listeners via the 'listeners' attribute.
 *
 * @param {string|Element} tagElm - The type of element to create (e.g., 'div', 'span', 'input') or use
 * @param {Object} [attributes={}] - An object containing attribute key-value pairs.
 *   - Use 'listeners' key to attach event handlers: { listeners: { click: handler, input: handler } }
 *   - All other keys are set as element attributes
 * @param {...(HTMLElement|string)} items - Child elements or HTML strings to append to the created element.
 *   - HTMLElement: Appended directly as child
 *   - string: Parsed as HTML and all resulting nodes appended
 * @returns {HTMLElement} The newly created DOM element with all attributes, listeners, and children.
 *
 * @example
 * // Simple element with attributes
 * let input = createElement("input", {
 *   type: "search",
 *   placeholder: "Enter what pleases you"
 * });
 *
 * @example
 * // Element with HTML content
 * let label = createElement("label", {},
 *   "<span>Hit <kbd>Esc</kbd> to close</span>"
 * );
 *
 * @example
 * // Element with click handler
 * let div = createElement("div", {
 *   listeners: {
 *     click: e => console.log("clicked", e)
 *   }
 * }, "Click me!");
 *
 * @example
 * // remove width attribute from existing element
 * let div = createElement(existingElm, {
 *  {
 *    width: null
 *  }
 * }, "Click me!");
 * @example
 * // Nested elements
 * createElement("div", {
 *     "class": "tab-item",
 *   },
 *   createElement("label", {},
 *     createElement("input", {type: "radio", name: "type"}),
 *     "A"
 *   ),
 *   createElement("label", {},
 *     createElement("input", {type: "radio", name: "type", "disabled": true}),
 *     "B"
 *   )
 * )
 *
 * @example
 * // want to update existing element with children, new attributes and listeners
 * createElement(exitsingElmRef, { class: "card" }, child1, child2);
 */
function createElement(tagElem, attributes = {}, ...items) {
  const element = tagElem instanceof Element ? tagElem : document.createElement(tagElem);

  Object.entries(attributes).forEach(([attributeKey, attributeValue]) => {
    if (attributeKey === 'listeners') {
      Object.entries(attributeValue).forEach(([eventName, handler]) => {
        element.addEventListener(eventName, handler);
      });
    } else if (attributeValue) {
      element.setAttribute(attributeKey, attributeValue);
    } else if (attributeValue === null) {
      element.removeAttribute(attributeKey);
    }
  });

  if (items.length > 0) {
    const docFrag = document.createDocumentFragment();
    items.forEach((childEl) => {
      if (typeof childEl === 'string') {
        const div = document.createElement('div');
        div.innerHTML = childEl;
        while (div.childNodes.length > 0) {
          docFrag.appendChild(div.childNodes[0]);
        }
      } else if (childEl) {
        docFrag.appendChild(childEl);
      }
    });

    element.appendChild(docFrag);
  }

  return element;
}

/**
 * Processes multiple DOM elements and extracts their target child elements based on structure.
 * Collects non-empty elements (containing text or pictures) and passes them to a callback function.
 *
 * @param {...HTMLElement} args - Variable number of DOM elements to process, followed by a callback function.
 *   The last argument must be the callback function.
 * @param {Function} callback - Function to execute with collected field elements and block element.
 *   Receives two parameters:
 *   - {HTMLElement[]} fieldElements - Array of target div elements that contain content
 *   - {HTMLElement} blockDivElm - The parent block/item element
 * @returns {*} Returns the result of the callback function, or undefined if no elements are processed.
 *
 * @example
 * // Process block elements
 * getNewElem(div1, div2, div3, (fieldElements, blockDiv) => {
 *   console.log('Found fields:', fieldElements.length);
 *   return fieldElements;
 * });
 */
function getNewElem(...args) {
  const callback = args.pop();
  const blockDivElm = args[0]?.parentElement;
  // when new block container added items might be without children
  if (!blockDivElm) {
    return null;
  }
  const isItem = blockDivElm.dataset.blockName === undefined;
  const fieldElements = [];
  let allNulls = true;
  args.forEach((divElm) => {
    // Check if the element has non-empty text or contains a picture
    // needed if the block added is newly without any values
    if (divElm.textContent.trim() !== '' || divElm.querySelector('picture')) {
      allNulls = false;
      // item component has different structure than block component
      const targetDiv = isItem
        ? divElm.children[0]
        : divElm.children[0].children[0];
      fieldElements.push(targetDiv);
    } else {
      fieldElements.push(null);
    }
  });
  // add block itself as last param to callback
  fieldElements.push(blockDivElm);
  // eslint-disable-next-line prefer-spread
  return allNulls ? null : callback.apply(null, fieldElements);
}

export {
  trimElementTextToCharLimit,
  createDomElement,
  getAssetPath,
  getCSSAssetPath,
  createElement as $tag,
  getNewElem,
};
