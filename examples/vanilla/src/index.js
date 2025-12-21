import { createValidator } from "../../../src/main.js";
import { myValidator, nameValidator } from './check-rule-mate-rules/validators.js';
import MY_RULES from './check-rule-mate-rules/rules/myValidatorRules.json' with { type: 'json' };
import NAME_RULE from './check-rule-mate-rules/rules/name.rule.json' with { type: 'json' };
import CONTACT_US from './check-rule-mate-rules/schemas/contactUs.json' with { type: 'json' };
import NAME_DATA_RULE from './check-rule-mate-rules/schemas/name.data.rule.json' with { type: 'json' };
import MY_VALIDATION_ERROR_MESSAGES from './i18n/en_US/errors/myValidatorRules.json' with { type: 'json' };

const fieldsWorking = {
    "name": "John",
    "lastName": "Doe",
    "email": "email@email.com",
    "emailConfirm": "email@email.com",
    "phone": "",
    "subject": "I need a coffe",
    "message": "Give me coffe"
}

const fieldsNotWorking = {
    "name": "",
    "lastName": "",
    "email": "",
    "emailConfirm": "emailemail.com",
    "phone": "0000-0000",
    "subject": "",
    "message": ""
}

async function test() {
    const validatorWithWrongData = createValidator(fieldsNotWorking, {validationHelpers: myValidator, rules: MY_RULES, schema: CONTACT_US, errorMessages: MY_VALIDATION_ERROR_MESSAGES});
    const validatorWrongDataWIthoutErrorMessageAndAbortEarly = createValidator(fieldsNotWorking, {validationHelpers: myValidator, rules: MY_RULES, schema: CONTACT_US, options: { propertiesMustMatch: true, abortEarly: true}});
    const validatorDataCorrectly = createValidator(fieldsWorking, {validationHelpers: myValidator, rules: MY_RULES, schema: CONTACT_US, errorMessages: MY_VALIDATION_ERROR_MESSAGES, options: { propertiesMustMatch: true}});


    console.log('validatorWithWrongData', await validatorWithWrongData.validate());
    console.log('validatorWrongDataWIthoutErrorMessageAndAbortEarly', await validatorWrongDataWIthoutErrorMessageAndAbortEarly.validate());


    validatorDataCorrectly.setData(fieldsWorking);
    console.log('validatorDataCorrectly', await validatorDataCorrectly.validate());

    // example using different validators, rules and data rules and also using variables in this validation (see variable usages in data-rules, rules and validators)
    const RULES = {...MY_RULES, ...NAME_RULE};
    const CUSTOM_SCHEMA_RULES = {...CONTACT_US, ...NAME_DATA_RULE}
    const validatorHelpers = (value, rule, modifier = null, data = null) => ({
        ...myValidator(value, rule, modifier, data),
        ...nameValidator(value, rule, modifier, data)
    });

    const fieldsWorking2 = {
        "name": "John",
        "lastName": "Doe",
        "email": "email@email.com",
        "emailConfirm": "email@email.com",
        "phone": "",
        "subject": "I need a coffe",
        "message": "Give me coffe",
        "cellphone": "0000-0000"
    }

    const dataValidatedCorrectlyWithInheritanceAndVariables = createValidator(fieldsWorking2, {validationHelpers: validatorHelpers, rules: RULES, schema: CUSTOM_SCHEMA_RULES, errorMessages: MY_VALIDATION_ERROR_MESSAGES});

    console.log('dataValidatedCorrectlyWithInheritanceAndVariables',  await dataValidatedCorrectlyWithInheritanceAndVariables.validate())
}

test();

