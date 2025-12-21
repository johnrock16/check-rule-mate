import express from 'express';
import { createValidator } from '../../../src/main.js';
import { expressValidator } from './check-rule-mate-rules/validators.js';
import MY_RULES from './check-rule-mate-rules/rules/myValidatorRules.json' with { type: 'json' };
import MY_VALIDATION_ERROR_MESSAGES from './i18n/en_US/errors/myValidatorRules.json' with { type: 'json' };

const app = express();
const port = 3000;

const enumForm = {
    "CONTACT_US": async () => {
        const response = await import("./check-rule-mate-rules/schemas/contactUs.json", { with: { type: "json" } });
        return response.default;
    },
    "CUSTOMER_CREATION": async () => {
        const response = await import("./check-rule-mate-rules/schemas/customerCreation.json", { with: { type: "json" } });
        return response.default;
    },
}

function getFormRules(formName) {
    return enumForm[formName] ? enumForm[formName]() : '';
}

async function formValidatorMiddleware(req, res, next) {
    const RULES = await getFormRules(req.body.type);
    if (!RULES) {
        res.status(400).json('invalid type');
        return;
    }
    const validator = createValidator(req.body.form, {validationHelpers: expressValidator, rules: MY_RULES, schema: RULES, errorMessages: MY_VALIDATION_ERROR_MESSAGES});
    const dataValidated = await validator.validate();
    if (dataValidated.error) {
        res.status(400).json(dataValidated);
        return;
    }
    next();
}

app.use(express.json());

app.post('/form', formValidatorMiddleware, (req, res) => {
    res.status(200).json({ok: true});
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

/*
example request:

url: http://localhost:3000/form
body:
{
	"type": "CONTACT_US",
	"form" : {
    "name": "John",
    "lastName": "Doe",
    "email": "email@email.com",
    "emailConfirm": "email@email.com",
    "phone": "",
    "subject": "I need a coffe",
    "message": "Give me coffe"
	}
}
*/
