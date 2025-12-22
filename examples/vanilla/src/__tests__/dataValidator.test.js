import { myValidator, nameValidator } from '../check-rule-mate-rules/validators/validators.js';
import { createValidator }  from '../../../../src/main.js';
import MY_RULES from '../check-rule-mate-rules/rules/myValidatorRules.json' with { type: 'json' };
import CONTACT_US from '../check-rule-mate-rules/schemas/contactUs.json' with { type: 'json' };
import CUSTOMER_CREATION from '../check-rule-mate-rules/schemas/customerCreation.json' with { type: 'json' };
import MY_ACCOUNT from '../check-rule-mate-rules/schemas/myAccount.json' with { type: 'json' };
import NAME_RULE from '../check-rule-mate-rules/rules/name.rule.json' with { type: 'json' };
import NAME_DATA_RULE from '../check-rule-mate-rules/schemas/name.data.rule.json' with { type: 'json' };
import MY_VALIDATOR_ERROR_MESSAGES from '../i18n/en_US/errors/myValidatorRules.json' with { type: 'json' };

describe('dataValidator', () => {
    describe('contact us', () => {
        describe('happy ending', () => {
            test('filled all fields correctly', async () => {
                const fieldsFilledCorrectly = {
                    "name": "John",
                    "lastName": "Doe",
                    "email": "email@email.com",
                    "emailConfirm": "email@email.com",
                    "phone": "0000-0000",
                    "subject": "I need a coffe",
                    "message": "Give me coffe"
                }
                const validator = createValidator(fieldsFilledCorrectly, {validationHelpers: myValidator, rules: MY_RULES, schema: CONTACT_US, errorMessages: MY_VALIDATOR_ERROR_MESSAGES});
                const dataValidated = await validator.validate();
                expect(dataValidated.ok).toBeTruthy();
            });


            test('filled all fields correctly without error messages translated in parameters', async () => {
                const fieldsFilledCorrectly = {
                    "name": "John",
                    "lastName": "Doe",
                    "email": "email@email.com",
                    "emailConfirm": "email@email.com",
                    "phone": "0000-0000",
                    "subject": "I need a coffe",
                    "message": "Give me coffe"
                }
                const validator = createValidator(fieldsFilledCorrectly, {validationHelpers: myValidator, rules: MY_RULES, schema: CONTACT_US});
                const dataValidated = await validator.validate();
                expect(dataValidated.ok).toBeTruthy();
            });

            test('filled with required only', async () => {
                const fieldsFilledCorrectly = {
                    "name": "John",
                    "lastName": "Doe",
                    "email": "email@email.com",
                    "emailConfirm": "email@email.com",
                    "phone": "",
                    "subject": "I need a coffe",
                    "message": "Give me coffe"
                }
                const validator = createValidator(fieldsFilledCorrectly, {validationHelpers: myValidator, rules: MY_RULES, schema: CONTACT_US});
                const dataValidated = await validator.validate();
                expect(dataValidated.ok).toBeTruthy();
            });
        });

        describe('bad ending', () => {
            test('missing all properties', async () => {
                const fieldsMissing = {}
                const validator = createValidator(fieldsMissing, {validationHelpers: myValidator, rules: MY_RULES, schema: CONTACT_US});
                const dataValidated = await validator.validate();
                expect(dataValidated.errorMessage).toBe("Missing fields for schema");
            });

            test('missing one properties', async () => {
                const fieldsFilledWrong = {
                    "lastName": "",
                    "email": "emailcom",
                    "phone": "0-0000",
                    "subject": "",
                    "message": ""
                }
                const validator = createValidator(fieldsFilledWrong, {validationHelpers: myValidator, rules: MY_RULES, schema: CONTACT_US});
                const dataValidated = await validator.validate();
                expect(dataValidated.errorMessage).toBe("Missing properties");
            });

            test('missing some properties', async () => {
                const fieldsFilledWrong = {
                    "lastName": "",
                    "email": "emailcom",
                }
                const validator = createValidator(fieldsFilledWrong, {validationHelpers: myValidator, rules: MY_RULES, schema: CONTACT_US});
                const dataValidated = await validator.validate();
                expect(dataValidated.errorMessage).toBe("Missing properties");
            });

            test('filled wrong with error messages', async () => {
                const fieldsFilledWrong = {
                    "name": "",
                    "lastName": "Doe",
                    "email": "email@email.com",
                    "emailConfirm": "email@email.com",
                    "phone": "0000-0000",
                    "subject": "I need a coffe",
                    "message": "Give me coffe"
                }
                const validator = createValidator(fieldsFilledWrong, {validationHelpers: myValidator, rules: MY_RULES, schema: CONTACT_US, errorMessages: MY_VALIDATOR_ERROR_MESSAGES});
                const dataValidated = await validator.validate();
                expect(dataValidated.errors.name.message).toBe("Please, fill the field");
            });

            test('filled wrong without error messages', async () => {
                const fieldsFilledWrong = {
                    "name": "",
                    "lastName": "Doe",
                    "email": "email@email.com",
                    "emailConfirm": "email@email.com",
                    "phone": "0000-0000",
                    "subject": "I need a coffe",
                    "message": "Give me coffe"
                }
                const validator = createValidator(fieldsFilledWrong, {validationHelpers: myValidator, rules: MY_RULES, schema: CONTACT_US});
                const dataValidated = await validator.validate();
                expect(dataValidated.errors.name.code).toBe("common.hasText");
            });

            test('filled all fields wrong', async () => {
                const fieldsFilledWrong = {
                    "name": "",
                    "lastName": "",
                    "email": "emailcom",
                    "emailConfirm": "email",
                    "phone": "0-0000",
                    "subject": "",
                    "message": ""
                }
                const validator = createValidator(fieldsFilledWrong, {validationHelpers: myValidator, rules: MY_RULES, schema: CONTACT_US});
                const dataValidated = await validator.validate();
                expect(Object.keys(dataValidated.errors).length).toBe(7);
            });

            test('filled name wrong', async () => {
                const fieldsFilledNameWrong = {
                    "name": "",
                    "lastName": "Doe",
                    "email": "email@email.com",
                    "emailConfirm": "email@email.com",
                    "phone": "",
                    "subject": "I need a coffe",
                    "message": "Give me coffe"
                }
                const validator = createValidator(fieldsFilledNameWrong, {validationHelpers: myValidator, rules: MY_RULES, schema: CONTACT_US});
                const dataValidated = await validator.validate();
                expect(dataValidated.errors.name.name).toBe('name');
            });

            test('filled last name wrong', async () => {
                const fieldsFilledNameWrong = {
                    "name": "John",
                    "lastName": "",
                    "email": "email@email.com",
                    "emailConfirm": "email@email.com",
                    "phone": "",
                    "subject": "I need a coffe",
                    "message": "Give me coffe"
                }
                const validator = createValidator(fieldsFilledNameWrong, {validationHelpers: myValidator, rules: MY_RULES, schema: CONTACT_US});
                const dataValidated = await validator.validate();
                expect(dataValidated.errors.lastName.name).toBe('lastName');
            });

            test('filled email wrong', async () => {
                const fieldsFilledNameWrong = {
                    "name": "John",
                    "lastName": "Doe",
                    "email": "emailcom",
                    "emailConfirm": "email@email.com",
                    "phone": "",
                    "subject": "I need a coffe",
                    "message": "Give me coffe"
                }
                const validator = createValidator(fieldsFilledNameWrong, {validationHelpers: myValidator, rules: MY_RULES, schema: CONTACT_US});
                const dataValidated = await validator.validate();
                expect(dataValidated.errors.email.name).toBe('email');
            });

            test('filled phone wrong', async () => {
                const fieldsFilledCorrectly = {
                    "name": "John",
                    "lastName": "Doe",
                    "email": "email@email.com",
                    "emailConfirm": "email@email.com",
                    "phone": "000",
                    "subject": "I need a coffe",
                    "message": "Give me coffe"
                }
                const validator = createValidator(fieldsFilledCorrectly, {validationHelpers: myValidator, rules: MY_RULES, schema: CONTACT_US});
                const dataValidated = await validator.validate();
                expect(dataValidated.errors.phone.name).toBe('phone');
            });

            test('filled subject wrong', async () => {
                const fieldsFilledCorrectly = {
                    "name": "John",
                    "lastName": "Doe",
                    "email": "email@email.com",
                    "emailConfirm": "email@email.com",
                    "phone": "0000-0000",
                    "subject": "",
                    "message": "Give me coffe"
                }
                const validator = createValidator(fieldsFilledCorrectly, {validationHelpers: myValidator, rules: MY_RULES, schema: CONTACT_US});
                const dataValidated = await validator.validate();
                expect(dataValidated.errors.subject.name).toBe('subject');
            });

            test('filled message wrong', async () => {
                const fieldsFilledCorrectly = {
                    "name": "John",
                    "lastName": "Doe",
                    "email": "email@email.com",
                    "emailConfirm": "email@email.com",
                    "phone": "0000-0000",
                    "subject": "I need a coffe",
                    "message": ""
                }
                const validator = createValidator(fieldsFilledCorrectly, {validationHelpers: myValidator, rules: MY_RULES, schema: CONTACT_US});
                const dataValidated = await validator.validate();
                expect(dataValidated.errors.message.name).toBe('message');
            });
        });
    });

    describe('customer creation', () => {
        const myValidatorMocked = (value, rule, modifier = null) => ({
            ...myValidator(value, rule, modifier),
            cpf: () => value === '000.000.000-00' // I don't want to be sued by putting a random CPF in the code
        });

        describe('happy ending', () => {
            test('filled all fields correctly', async () => {
                const fieldsFilledCorrectly = {
                    "name": "John",
                    "lastName": "Doe",
                    "birthdate": "2000-12-22",
                    "cpf": "000.000.000-00",
                    "email": "email@email.com",
                    "phone": "0000-0000",
                }
                const validator = createValidator(fieldsFilledCorrectly, {validationHelpers: myValidatorMocked, rules: MY_RULES, schema: CUSTOMER_CREATION, errorMessages: MY_VALIDATOR_ERROR_MESSAGES});
                const dataValidated = await validator.validate();
                expect(dataValidated.ok).toBeTruthy();
            });

            test('filled all fields correctly without error messages translated in parameters', async () => {
                const fieldsFilledCorrectly = {
                    "name": "John",
                    "lastName": "Doe",
                    "birthdate": "2000-12-22",
                    "cpf": "000.000.000-00",
                    "email": "email@email.com",
                    "phone": "0000-0000",
                }
                const validator = createValidator(fieldsFilledCorrectly, {validationHelpers: myValidatorMocked, rules: MY_RULES, schema: CUSTOMER_CREATION});
                const dataValidated = await validator.validate();
                expect(dataValidated.ok).toBeTruthy();
            });

            test('filled all fields expect optionals', async () => {
                const fieldsFilledCorrectly = {
                    "name": "John",
                    "lastName": "",
                    "birthdate": "2000-12-22",
                    "cpf": "000.000.000-00",
                    "email": "email@email.com",
                    "phone": "0000-0000",
                }
                const validator = createValidator(fieldsFilledCorrectly, {validationHelpers: myValidatorMocked, rules: MY_RULES, schema: CUSTOMER_CREATION, errorMessages: MY_VALIDATOR_ERROR_MESSAGES});
                const dataValidated = await validator.validate();
                expect(dataValidated.ok).toBeTruthy();
            });

            test('filled all fields and using inheritance and variables', async () => {
                const fieldsFilledCorrectly = {
                    "name": "John",
                    "lastName": "Doe",
                    "birthdate": "2000-12-22",
                    "cpf": "000.000.000-00",
                    "email": "email@email.com",
                    "phone": "0000-0000",
                    "cellphone": "0000-0000"
                }
                const RULES = {...MY_RULES, ...NAME_RULE};
                const DATA_RULES = {...CUSTOMER_CREATION, ...NAME_DATA_RULE}
                const validatorHelpers = (value, rule, modifier = null, data = null) => ({
                    ...myValidatorMocked(value, rule, modifier, data),
                    ...nameValidator(value, rule, modifier, data)
                });
                const validator = createValidator(fieldsFilledCorrectly, {validationHelpers: validatorHelpers, rules: RULES, schema: DATA_RULES, errorMessages: MY_VALIDATOR_ERROR_MESSAGES});
                const dataValidated = await validator.validate();
                expect(dataValidated.ok).toBeTruthy();
            })
        });

        describe('bad ending', () => {
            test('filled cpf wrong', async () => {
                const fieldsFilledCorrectly = {
                    "name": "John",
                    "lastName": "Doe",
                    "birthdate": "2000-12-22",
                    "cpf": "000.000.000-01",
                    "email": "email@email.com",
                    "phone": "0000-0000",
                }
                const validator = createValidator(fieldsFilledCorrectly, {validationHelpers: myValidatorMocked, rules: MY_RULES, schema: CUSTOMER_CREATION});
                const dataValidated = await validator.validate();
                expect(dataValidated.errors.cpf.name).toBe('cpf');
            });

            test('filled birthdate invalid regex', async () => {
                const fieldsFilledCorrectly = {
                    "name": "John",
                    "lastName": "Doe",
                    "birthdate": "2000-12-42",
                    "cpf": "000.000.000-00",
                    "email": "email@email.com",
                    "phone": "0000-0000",
                }
                const validator = createValidator(fieldsFilledCorrectly, {validationHelpers: myValidatorMocked, rules: MY_RULES, schema: CUSTOMER_CREATION});
                const dataValidated = await validator.validate();
                expect(dataValidated.errors.birthdate.type).toBe('regex');
            });

            test('filled birthdate invalid age (under 18)', async () => {
                const fieldsFilledCorrectly = {
                    "name": "John",
                    "lastName": "Doe",
                    "birthdate": "2024-12-01",
                    "cpf": "000.000.000-00",
                    "email": "email@email.com",
                    "phone": "0000-0000",
                }
                const validator = createValidator(fieldsFilledCorrectly, {validationHelpers: myValidatorMocked, rules: MY_RULES, schema: CUSTOMER_CREATION});
                const dataValidated = await validator.validate();
                expect(dataValidated.errors.birthdate.type).toBe('validateAge');
            });
        });
    });

    describe('my account', () => {
        const myValidatorMocked = (value, rule, modifier = null, data = null) => ({
            ...myValidator(value, rule, modifier, data),
            cpf: () => value === '000.000.000-00' // I don't want to be sued by putting a random CPF in the code
        });

        describe('happy ending', () => {
            test('filled all fields correctly', async () => {
                const fieldsFilledCorrectly = {
                    "name": "John",
                    "lastName": "Doe",
                    "birthdate": "2000-12-22",
                    "cpf": "000.000.000-00",
                    "email": "email@email.com",
                    "emailConfirm": "email@email.com",
                    "phone": "0000-0000",
                }
                const validator = createValidator(fieldsFilledCorrectly, {validationHelpers: myValidatorMocked, rules: MY_RULES, schema: MY_ACCOUNT, errorMessages: MY_VALIDATOR_ERROR_MESSAGES});
                const dataValidated = await validator.validate();
                expect(dataValidated.ok).toBeTruthy();
            });
        });

        describe('bad ending', () => {
            test('filled email confirm are not equal', async () => {
                const fieldsFilledCorrectly = {
                    "name": "John",
                    "lastName": "Doe",
                    "birthdate": "2000-12-22",
                    "cpf": "000.000.000-00",
                    "email": "email@email.com",
                    "emailConfirm": "email@email.co",
                    "phone": "0000-0000",
                }
                const validator = createValidator(fieldsFilledCorrectly, {validationHelpers: myValidatorMocked, rules: MY_RULES, schema: MY_ACCOUNT, errorMessages: MY_VALIDATOR_ERROR_MESSAGES});
                const dataValidated = await validator.validate();
                expect(dataValidated.errors.emailConfirm.type).toBe('equals');
            });

            test('filled email confirm are not correct email format', async () => {
                const fieldsFilledCorrectly = {
                    "name": "John",
                    "lastName": "Doe",
                    "birthdate": "2000-12-22",
                    "cpf": "000.000.000-00",
                    "email": "email@email.com",
                    "emailConfirm": "email",
                    "phone": "0000-0000",
                }
                const validator = createValidator(fieldsFilledCorrectly, {validationHelpers: myValidatorMocked, rules: MY_RULES, schema: MY_ACCOUNT, errorMessages: MY_VALIDATOR_ERROR_MESSAGES});
                const dataValidated = await validator.validate();
                expect(dataValidated.errors.emailConfirm.type).toBe('regex');
            });
        });
    });
});
