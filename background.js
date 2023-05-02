function isValidPhoneNumber(phoneNumber) {
  const regex = /^\+?\d{10,15}$/;
  return regex.test(phoneNumber);
}

function openWhatsApp(info) {
  const phoneNumber = info.selectionText.replace(/[-()\s]/g, '');

  if (!isValidPhoneNumber(phoneNumber)) {
    console.log('Invalid phone number:', phoneNumber);
    return;
  }

  browser.storage.local.get(['countryCode', 'delay', 'openWith']).then((data) => {
    const countryCode = data.countryCode || '972';
    const delay = parseInt(data.delay || '0') * 1000;
    const openWith = data.openWith || 'whatsappWeb';
    const whatsappUrl = openWith === 'whatsappWeb' ? `https://web.whatsapp.com/send?phone=${countryCode}${phoneNumber}` : `https://wa.me/${countryCode}${phoneNumber}`;

    // Create a new tab for the WhatsApp URL
    return browser.tabs.create({ url: whatsappUrl, active: false }).then((tab) => {
      return { tab, delay };
    });
  }).then(({ tab, delay }) => {
    // Wait for the tab to finish loading
    return new Promise((resolve) => {
      browser.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          browser.tabs.onUpdated.removeListener(listener);
          resolve({ tab, delay });
        }
      });
    });
  }).then(({ tab, delay }) => {
    // Close the wa.me tab after the specified delay
    setTimeout(() => {
      browser.tabs.remove(tab.id);
    }, delay);
  });
}

browser.contextMenus.create({
  id: 'openWhatsApp',
  title: 'Open WhatsApp',
  contexts: ['selection'],
  documentUrlPatterns: ['*://*/*']
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'openWhatsApp') {
    openWhatsApp(info);
  }
});

function showWelcomePage(details) {
  if (details.reason === 'install') {
    browser.tabs.create({ url: 'welcome.html' });
  }
}

browser.runtime.onInstalled.addListener(showWelcomePage);