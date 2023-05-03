const countryCodeSelect = document.getElementById('countryCode');
const delayInput = document.getElementById('delay');
const openWithSelect = document.getElementById('openWith');
const addTemplateButton = document.getElementById('add-template');
const templatesContainer = document.getElementById('templates');

async function init() {
  await populateCountryCodes();
  loadOptions();
  loadTemplates();
}

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

// Save templates
function saveTemplates(templates) {
  browser.storage.local.set({ templates });
}

// Validate templates
function validateTemplateInput(input) {
  input.setCustomValidity('');
  if (input.value.trim() === '') {
    input.setCustomValidity('This field cannot be empty.');
  }
}

// Load templates
function loadTemplates() {
  browser.storage.local.get('templates').then(({ templates }) => {
    templatesContainer.innerHTML = '';

    (templates || []).forEach((template, index) => {
      const templateElement = document.createElement('div');
      templateElement.classList.add('template');

      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.value = template.name;

      nameInput.addEventListener('change', () => {
        templates[index].name = nameInput.value;
        saveTemplates(templates);
      });

      nameInput.addEventListener('input', () => {
        validateTemplateInput(nameInput);
      });
      validateTemplateInput(nameInput);

      const textInput = document.createElement('input');
      textInput.type = 'text';
      textInput.value = template.text;

      textInput.addEventListener('change', () => {
        templates[index].text = textInput.value;
        saveTemplates(templates);
      });

      textInput.addEventListener('input', () => {
        validateTemplateInput(textInput);
      });
      validateTemplateInput(textInput);

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';

      deleteButton.addEventListener('click', () => {
        templates.splice(index, 1);
        saveTemplates(templates);
        loadTemplates();
      });

      templateElement.appendChild(nameInput);
      templateElement.appendChild(textInput);
      templateElement.appendChild(deleteButton);
      templatesContainer.appendChild(templateElement);
    });
  });
}

// Add a new template
addTemplateButton.addEventListener('click', () => {
  browser.storage.local.get('templates').then(({ templates }) => {
    templates = templates || [];
    templates.push({ name: 'New Template', text: '' });
    saveTemplates(templates);
    loadTemplates();
  });
});

// Add event listeners
countryCodeSelect.addEventListener('change', saveOptions);
delayInput.addEventListener('change', saveOptions);
openWithSelect.addEventListener('change', saveOptions);

// Call the init function when the DOM content is loaded
document.addEventListener('DOMContentLoaded', init);

