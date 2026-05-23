// src/globals.js
if (typeof global === 'undefined') {
  window.global = window;
}

export default window.global;