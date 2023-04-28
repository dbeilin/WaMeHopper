const countryCodeSelect = document.getElementById('countryCode');
const delayInput = document.getElementById('delay');

// Save the selected country code and delay to storage
function saveOptions() {
  browser.storage.local.set({
    countryCode: countryCodeSelect.value,
    delay: delayInput.value,
  });
}

// Load the saved country code and delay from storage
function loadOptions() {
  browser.storage.local.get(['countryCode', 'delay']).then((data) => {
    console.log('Loaded data:', data);
    countryCodeSelect.value = data.countryCode || '972';
    delayInput.value = data.delay || '0';
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
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded event');
  populateCountryCodes();
  loadOptions();
});
