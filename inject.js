// inject.js
browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'fillTemplate') {
      const inputElement = document.querySelector('._3uMse > ._2UL8j > ._1awRl');
      if (inputElement) {
        inputElement.textContent = message.text;
        inputElement.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        console.error('Could not find the input element');
      }
    }
  });
  