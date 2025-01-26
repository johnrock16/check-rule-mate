import validatorJS from "../../../dist/main.js";
import { myValidator, nameValidator } from './dataValidator/validators.js';
import MY_RULES from './dataValidator/rules/validators/myValidatorRules.json' with { type: 'json' };
import NAME_RULE from './dataValidator/rules/validators/name.rule.json' with { type: 'json' };
import CONTACT_US from './dataValidator/rules/data/contactUs.json' with { type: 'json' };
import NAME_DATA_RULE from './dataValidator/rules/data/name.data.rule.json' with { type: 'json' };
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


const dataValidatedWrong = validatorJS.dataValidate(fieldsNotWorking, {validationHelpers: myValidator, rules: MY_RULES, dataRule: CONTACT_US, dataErrorMessages: MY_VALIDATION_ERROR_MESSAGES});
const dataValidatedWrongWIthoutErrorMessage = validatorJS.dataValidate(fieldsNotWorking, {validationHelpers: myValidator, rules: MY_RULES, dataRule: CONTACT_US});
const dataValidatedCorrectly = validatorJS.dataValidate(fieldsWorking, {validationHelpers: myValidator, rules: MY_RULES, dataRule: CONTACT_US, dataErrorMessages: MY_VALIDATION_ERROR_MESSAGES});

console.log(dataValidatedWrong);
console.log(dataValidatedWrongWIthoutErrorMessage);
console.log(dataValidatedCorrectly);


// // example using different validators, rules and data rules and also using variables in this validation (see variable usages in data-rules, rules and validators)

const RULES = {...MY_RULES, ...NAME_RULE};
const DATA_RULES = {...CONTACT_US, ...NAME_DATA_RULE}
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

const dataValidatedCorrectlyWithInheritanceAndVariables = validatorJS.dataValidate(fieldsWorking2, {validationHelpers: validatorHelpers, rules: RULES, dataRule: DATA_RULES, dataErrorMessages: MY_VALIDATION_ERROR_MESSAGES});

console.log(dataValidatedCorrectlyWithInheritanceAndVariables)
