const countryCodeSelect = document.getElementById('countryCode');
const delayInput = document.getElementById('delay');
const openWithSelect = document.getElementById('openWith');

// Save the selected country code, delay, and open with option to storage
function saveOptions() {
  browser.storage.local.set({
    countryCode: countryCodeSelect.value,
    delay: delayInput.value,
    openWith: openWithSelect.value,
  });
}

// Load the saved country code, delay, and open with option from storage
function loadOptions() {
  browser.storage.local.get(['countryCode', 'delay', 'openWith']).then((data) => {
    console.log('Loaded data:', data);
    countryCodeSelect.value = data.countryCode || '972';
    delayInput.value = data.delay || '0';
    openWithSelect.value = data.openWith || 'whatsappWeb';
  });
}

// Populate the select element with country code options
async function populateCountryCodes() {
  const response = await fetch('https://restcountries.com/v3.1/all');
  const countries = await response.json();

  countries.forEach((country) => {
    if (country.idd.root && country.idd.suffixes[0]) {
      const countryCode = `${country.idd.root}${country.idd.suffixes[0]}`;
      const option = document.createElement('option');
      option.value = countryCode;
      option.textContent = `${country.name.common} (${countryCode})`;
      countryCodeSelect.appendChild(option);
    }
  });
}

// Add event listeners
countryCodeSelect.addEventListener('change', saveOptions);
delayInput.addEventListener('change', saveOptions);
openWithSelect.addEventListener('change', saveOptions);
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded event');
  populateCountryCodes();
  loadOptions();
});
