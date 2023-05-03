window.startWhatsAppAutomation = function(phoneNumber, templateText) {
    function waitForElement(selector, callback) {
      const element = document.querySelector(selector);
      if (element) {
        callback(element);
      } else {
        setTimeout(() => waitForElement(selector, callback), 100);
      }
    }
  
    function typeMessage(inputElement, message) {
      const event = new InputEvent('input', { bubbles: true });
      inputElement.value = message;
      inputElement.dispatchEvent(event);
    }    
  
    function openChatByNumber(phoneNumber) {
      const contactElement = [...document.querySelectorAll('.chat-title')].find(element => {
        return element.getAttribute('title') === phoneNumber;
      });
  
      if (contactElement) {
        contactElement.click();
        return true;
      } else {
        return false;
      }
    }
  
    function openNewChatAndTypeMessage(phoneNumber, message) {
      const newChatButton = document.querySelector('button[title="New chat"]');
  
      if (newChatButton) {
        newChatButton.click();
  
        waitForElement('input[type="text"]', (inputElement) => {
          typeMessage(inputElement, phoneNumber);
          waitForElement(`.chat-title[title="${phoneNumber}"]`, (contactElement) => {
            contactElement.click();
            waitForElement('div[contenteditable="true"]', (messageInputElement) => {
              typeMessage(messageInputElement, message);
            });
          });
        });
      }
    }
  
    if (!openChatByNumber(phoneNumber)) {
      openNewChatAndTypeMessage(phoneNumber, templateText);
    } else {
      waitForElement('div[contenteditable="true"]', (messageInputElement) => {
        typeMessage(messageInputElement, templateText);
      });
    }
  };
  