function isValidPhoneNumber(phoneNumber) {
  const regex = /^\+?\d{10,15}$/;
  return regex.test(phoneNumber);
}

function openWhatsApp(info, templateText) {
  const phoneNumber = info.selectionText.replace(/[-()\s]/g, '');

  if (!isValidPhoneNumber(phoneNumber)) {
    console.log('Invalid phone number:', phoneNumber);
    return;
  }

  browser.storage.local.get(['countryCode', 'delay', 'openWith']).then((data) => {
    const countryCode = data.countryCode || '972';
    const delay = parseInt(data.delay || '0') * 1000;
    const openWith = data.openWith || 'whatsappWeb';
    const whatsappUrl = openWith === 'whatsappWeb' ? `https://web.whatsapp.com/send?phone=${countryCode}${phoneNumber}${templateText ? '&text=' + encodeURIComponent(templateText) : ''}` : `https://wa.me/${countryCode}${phoneNumber}${templateText ? '?text=' + encodeURIComponent(templateText) : ''}`;

    // Check if a WhatsApp Web tab is already open
    return browser.tabs.query({ url: 'https://web.whatsapp.com/*' }).then((tabs) => {
      if (tabs.length > 0 && openWith === 'whatsappWeb') {
        // If a WhatsApp Web tab is open, update its URL
        browser.tabs.update(tabs[0].id, { url: whatsappUrl, active: true });
        return { tab: tabs[0], delay, openWith };
      } else {
        // If no WhatsApp Web tab is open, create a new one
        return browser.tabs.create({ url: whatsappUrl, active: false }).then((tab) => {
          return { tab, delay, openWith };
        });
      }
    });
  }).then(({ tab, delay, openWith }) => {
    // Wait for the tab to finish loading
    return new Promise((resolve) => {
      browser.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          browser.tabs.onUpdated.removeListener(listener);
          resolve({ tab, delay, openWith });
        }
      });
    });
  })
  .then(({ tab, delay, openWith }) => {
    // Send a message to the content script to fill the template text
    if (templateText) {
      browser.tabs.sendMessage(tab.id, { type: 'fillTemplate', text: templateText });
    }

    // Close the wa.me tab after the specified delay only if opening in the app
    if (openWith !== 'whatsappWeb') {
      setTimeout(() => {
        browser.tabs.remove(tab.id);
      }, delay);
    }
  });
}


browser.contextMenus.create({
  id: 'openWhatsApp',
  title: 'Open WhatsApp',
  contexts: ['selection'],
  documentUrlPatterns: ['*://*/*'],
});

browser.contextMenus.create({
  id: 'openWithTemplate',
  title: 'Open with Template',
  contexts: ['selection'],
  documentUrlPatterns: ['*://*/*'],
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'openWhatsApp') {
    openWhatsApp(info, null);
  }
});

// Load templates from storage
browser.storage.local.get('templates').then(({ templates }) => {
  if (!templates || templates.length === 0) {
    console.log('No templates found');
    return;
  }

  // Create a submenu with the list of templates
  templates.forEach((template, index) => {
    browser.contextMenus.create({
      id: `template-${index}`,
      parentId: 'openWithTemplate',
      title: template.name,
      contexts: ['selection'],
      documentUrlPatterns: ['*://*/*'],
    });
  });
});

// Listen for clicks on submenu items
browser.contextMenus.onClicked.addListener((info, tab) => {
  const isTemplateClick = info.menuItemId.startsWith('template-');
  if (isTemplateClick) {
    browser.storage.local.get('templates').then(({ templates }) => {
      const templateIndex = parseInt(info.menuItemId.split('-')[1]);
      const templateText = templates[templateIndex].text;
      openWhatsApp(info, templateText);
    });
  }
});

function showWelcomePage(details) {
  if (details.reason === 'install') {
    browser.tabs.create({ url: 'welcome.html' });
  }
}

browser.runtime.onInstalled.addListener(showWelcomePage);
