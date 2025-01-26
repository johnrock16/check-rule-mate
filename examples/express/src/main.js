import express from 'express';
import validatorJS from '../../../dist/main.js';
import { expressValidator } from './dataValidator/validators.js';
import MY_RULES from './dataValidator/rules/validators/myValidatorRules.json' with { type: 'json' };
import MY_VALIDATION_ERROR_MESSAGES from './i18n/en_US/errors/myValidatorRules.json' with { type: 'json' };

const app = express();
const port = 3000;

const enumForm = {
    "CONTACT_US": async () => {
        const response = await import("./dataValidator/rules/data/contactUs.json", { with: { type: "json" } });
        return response.default;
    },
    "CUSTOMER_CREATION": async () => {
        const response = await import("./dataValidator/rules/data/customerCreation.json", { with: { type: "json" } });
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
    const dataValidate = validatorJS.dataValidate(req.body.form, {validationHelpers: expressValidator, rules: MY_RULES, dataRule: RULES, dataErrorMessages: MY_VALIDATION_ERROR_MESSAGES});
    if (dataValidate.error) {
        res.status(400).json(dataValidate);
        return;
    }
    next();
}

app.use(express.json());

app.post('/form', formValidatorMiddleware, (req, res) => {
    res.send('Form submitted!');
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
