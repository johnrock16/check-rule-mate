# check-rule-mate

## Overview

A lightweight and reusable JavaScript "library" for data validation. This library was designed to simplify the process of validating form inputs using flexible rules and error handling. Validating your data by allowing you to define flexible rules, custom error messages, and reusable helper functions—all in a structured format.

The core goal is to provide a **reusable and easy-to-extend** for handling various form inputs, including fields like name, email, birthdate, phone number, and more.


**Github repository:** [check-rule-mate repository](https://github.com/johnrock16/check-rule-mate)

**Examples of how implement check-rule-mate:** [check-rule-mate examples](#Example-Usage)

**Test the core functionalities here:** [check-rule-mate demo](https://johnrock16.github.io/check-rule-mate/)
(Note: Creating or modifying custom validators is not supported in the demo, as it requires JavaScript implementation.)


## Features

- **Custom Validation Rules**: Easily define custom rules for form fields.
- **Modular Design**: Separation of rule definitions and error messages for easy management.
- **Easy Integration**: Can be used in any JavaScript environment.
- **Clear Error Handling**: Handles errors and displays messages.
- **Extendable**: Create your custom validators and rules and extend as you want.

## Advanced Features

- **Modifiers:** Extend rules for specific use cases (e.g., age validation in a date rule).
- **Dynamic Parameters:** Use $variable to access field data within rules.
- **Modular Rules and Validators:** Create multiple files for rules and helpers, organizing them by context or form.
- **Async Validations:** You could create async functions to validate some data. Do You need to use a fetch or wait a promise to be resolved? No problems.

## Table of Contents

- [Getting Started](#Getting-Started)
  - [Installation](#Installation)
  - [Running Tests](#Running-Tests)
- [How It Works](#How-It-Works)
  - [Basic Example](#Basic-Example)
- [Defining Validation Components](#Defining-Validation-Components)
  - [1. Data Rules](#Data-Rules)
  - [2. General Rules](#General-Rules)
  - [3. Validation Helpers](#Validation-Helpers)
  - [4. Error Messages](#Error-Messages)
  - [5. Example Usage](#Example-Usage)
    - [Vanilla](#vanilla)
    - [Express](#express)
    - [Frontend](#frontend)

## Getting Started
### Installation

To install and start the library, run:
```bash
npm install
npm start
```

### Running Tests

Execute the test suite with:
```bash
npm test
```

## How It Works
### Basic Example

Here’s an example of validating a set of fields:
```javascript
  const { myValidator } = require('./dataValidator/validators');
  const { dataValidate } = require('./dataValidator/dataValidate');
  const MY_RULES = require('./dataValidator/rules/validators/myValidatorRules.json');
  const CONTACT_US = require('./dataValidator/rules/data/contactUs.json');
  const MY_VALIDATION_ERROR_MESSAGES = require('./i18n/en_US/errors/myValidatorRules.json');

  async function runDataValidate() {
    const fields = {
      name: "John",
      lastName: "Doe",
      email: "email@email.com",
      emailConfirm: "email@email.com",
      phone: "",
      subject: "I need a coffee",
      message: "Give me coffee"
    };

    // This should return { ok: true }
    const result = await dataValidate(fields, {
      validationHelpers: myValidator,
      rules: MY_RULES,
      dataRule: CONTACT_US,
      dataErrorMessages: MY_VALIDATION_ERROR_MESSAGES,
    });

    console.log(result);
  }

  runDataValidate();
```

#### Parameters for dataValidate:

- **fields**: The object containing data to be validated.
- **validationHelpers**: Functions to validate field data (see /dataValidator/validators).
- **rules**: General validation rules for your application.
- **dataRule**: Specific rules linking fields to validation logic.
- **dataErrorMessages**: Custom error messages returned upon validation failure.

## Defining Validation Components

### Data Rules

Define rules for specific datasets, such as forms. Example for a "Contact Us" form:
```json
{
  "name": { "rule": "name", "required": true },
  "lastName": { "rule": "name", "required": true },
  "email": { "rule": "email", "required": true },
  "emailConfirm": { "rule": "email--confirm", "required": true },
  "phone": { "rule": "phone", "required": false },
  "subject": { "rule": "hasText", "required": true },
  "message": { "rule": "hasText", "required": true }
}
```

### General Rules

Define reusable validation logic. Example:

```json
{
  "name": {
    "validate": ["hasText"],
    "error": { "hasText": "common.hasText" }
  },
  "email": {
    "regex": "/^[a-z0-9.]+@[a-z0-9]+\\.[a-z]+(\\.[a-z]+)?$/i",
    "validate": ["regex"],
    "error": { "regex": "email.regex" },
    "modifier": {
      "confirm": {
        "validate": ["regex", "equals"],
        "params": { "equals": ["$email"] },
        "error": { "equals": "email.equals" }
      }
    }
  },
  "date": {
    "regex": "/^\\d{4}[\/\\-](0?[1-9]|1[012])[\/\\-](0?[1-9]|[12][0-9]|3[01])$/",
    "validate": ["regex", "validDate"],
    "error": {
      "regex": "common.dateFormat",
      "validDate": "date.validDate"
    },
    "modifier": {
      "age": {
        "validate": ["regex", "validateAge"],
        "params": {
          "validateAge": [18, 130]
        },
        "error": {
          "regex": "common.dateFormat",
          "validateAge": "date.modifier.age.validateAge"
        }
      }
    }
  }
}
```
#### Key Components:

- **validate**: Array of functions to execute for validation.
- **error**: Error messages for validation failures.
- **regex**: Regular expression for validation.
- **modifier**: Overrides specific rules with additional validations.
- **params**: Parameters for validation functions (e.g., $email accesses email field data).


### Validation Helpers
Helper functions perform actual validation. Example:

```javascript
const myValidator = function (value, rule, modifier = null, data = null) {
  function regex() {
    const regexTemplate = rule.modifier?.[modifier]?.regex || rule.regex;
    const regex = new RegExp(regexTemplate);
    return regex.test(value);
  }

  function hasText() {
    return value.trim().length > 0;
  }

  function equals(key) {
    return value === data[key];
  }

  async function isDataFetched() {
    try {
      let result = await new Promise((resolve, reject) => {
        setTimeout(() => {
          const success = !!value;
          if (success) {
            resolve('Data fetched successfully!');
          } else {
            reject('Error fetching data');
          }
        }, 2000);
      });
      return !!result;
    } catch (error) {
      return false;
    }
  }

  return { regex, hasText, equals, isDataFetched };
};
```

### Error Messages

Define custom error messages in a structured format:
``` json
{
  "common": { "hasText": "Please fill out this field." },
  "email": { "regex": "Enter a valid email address." }
}
```

## Example Usage

Explore examples in the examples folder folder. **Before execute any test change the type in package.json for module instead commonjs**

**Examples folder**: [Github repo examples folder.](https://github.com/johnrock16/check-rule-mate/tree/main/examples)

### Vanilla
Here you are free to test anything you want about form validation, also We have a lot of tests scenarios in __tests__ which could be a great start.

Command to run Vanilla example:
```bash
npm run example:vanilla
```

**Vanilla example**: [Github repo vanilla file.](https://github.com/johnrock16/check-rule-mate/blob/main/examples/vanilla/src/index.js)


#### __tests__

Command to run tests:
```bash
npm run test
```

**Unit tests examples:** [Github repo unit tests file.](https://github.com/johnrock16/check-rule-mate/blob/main/examples/vanilla/src/__tests__/dataValidator.test.js)

### Express:
See how the check-rule-mate works in back-end using a middleware.

Command to run Express example:
```bash
npm run example:express
```

**Express example:** [Github repo express file.](https://github.com/johnrock16/check-rule-mate/blob/main/examples/express/src/main.js)


### Frontend:
Here you can found the DEMO page and it's a type of "playground" to test how RULES works and validations works. (Here you can't create customized javascript so custom validatorHelpers are disabled by default)

**Frontend example:** [check-rule-mate demo.](https://johnrock16.github.io/check-rule-mate/)
