/**
 * Validate your data fields using your rules, data rules and validators.
 * @param {[DataField]} dataParameter - All the data fields to be validate
 * @param {DataValidatorConfigs} config - The configs which will be followed during validation
 */
export function createValidator(dataParameter, {validationHelpers = {}, rules, schema, errorMessages = {}, options = { propertiesMustMatch: true, abortEarly: false}}) {
    let errors = {};
    let data = dataParameter;

    const validateByStrategies = {
        all: async (dataArr) => Promise.all([...dataArr].map(async (input) => await inputValidation(input, data))),
        first: async (dataArr) => {
            const results = []
            for (const input of dataArr) {
                const result = await inputValidation(input, data);
                results.push(result);
                if (!result) {
                    return results
                }
            }
            return results;
        }
    };

    function getObjectValueByPath(obj, path) {
        if (!obj || typeof path !== 'string') return undefined;

        const keys = path.split('.');
        let current = obj;

        for (const key of keys) {
            if (current[key] === undefined) return undefined;
            current = current[key];
        }

        return current;
    }

    async function inputValidation(dataAttribute, data = null) {
        if (schema[dataAttribute.key]) {
            const { rule, required } = schema[dataAttribute.key];
            if ((rule && required) || (!required && dataAttribute.value != '')) {
                if (rule) {
                    const INPUT_RULE = rule.split('--')[0];
                    const RULE_MODIFIER = rule.split('--').length > 1 ? rule.split('--')[1] : '';
                    const dataAttributeValidation = dataAttributeValidator(dataAttribute.value, rules[INPUT_RULE], RULE_MODIFIER, validationHelpers, data);
                    const { isValid, errorMessage, errorType } = await dataAttributeValidation.validate();
                    if (!isValid) {
                        errors[dataAttribute.key] = {
                            name: dataAttribute.key,
                            error: true,
                            errorMessage: getObjectValueByPath(errorMessages, errorMessage) || errorMessage,
                            errorType: errorType
                        }
                    }
                    return isValid;
                }
            }
        } else if (options.propertiesMustMatch) {
            errors[dataAttribute.key] = {
                name: dataAttribute.key,
                error: true,
                errorMessage: "Invalid property"
            }
            return false;
        }
        return true;
    }

    /**
     * Validate only a field using the attribute key
     * @param {string} key - The field key name you want to validate
     * @returns {DataValidatorSuccessResponse | DataValidatorErrorResponse} - The response of your validation
     */
    async function validateField(key) {
        const result = await inputValidation({key: key, value: data[key]}, data);
        if (!result) {
            return { error: true, errors: errors[key]}
        }
        return { ok: true}
    }

    /**
     * Validate the entire fields using the schema
     * @returns {DataValidatorSuccessResponse | DataValidatorErrorResponse} - The response of your validation
     */
    async function validate() {
        errors = {};
        let dataArr = Object.keys(data).map((key) => ({ key, value: data[key] }));
        if (dataArr && dataArr.length > 0) {
            if(!Object.keys(schema).every((key) => data.hasOwnProperty(key))) {
                return { error: true, errorMessage: "Missing properties"}
            }
            const dataValidators = options?.abortEarly ? await validateByStrategies.first(dataArr) : await validateByStrategies.all(dataArr);

            if (dataValidators.some((element) => !element)) {
                return { error: true, errors: errors };
            }

            const dataRuleArr = Object.keys(schema).map((key) => ({ key, required: schema[key].required}));
            const dataAttributesKey = dataArr.map((attribute) => attribute.key);
            const dataAttributesRequired = dataRuleArr.filter((rule) => rule.required).map((rule) => rule.key);

            if (!dataAttributesRequired.every((fieldRequired) => dataAttributesKey.includes(fieldRequired))) {
                return { error: true };
            }
        } else if (!dataArr || dataArr.length === 0) {
            return { error: true, errorMessage: "Missing fields for schema"}
        }
        return { ok: true };
    }

    function setData(newData) {
        data = newData;
    }

    return {validate, validateField, setData};
}

/**
 * A function to validate each attribute from a object [dataField]
 * @param {string} value - The value to be validated
 * @param {string} rule - The rule to be used during validation
 * @param {string} modifier - The modifier of the rule if have
 * @param {Function} customValidation - The function which will validate the value
 * @param {[DataField]} data - The entire data fields
 * @returns {{validate: Function}} the built function to validate all this parameters
 */
function dataAttributeValidator (value, rule, modifier = null, customValidation = null, data = null) {
    async function validateRules(rule) {
        let errorMessage;
        let errorType;
        const validations = await Promise.all(rule.validate.map(async (validation) => {
            let isValid = true;
            if ((rule.params && rule.params[validation] && rule.params[validation].length > 0)) {
                const params = rule.params[validation].map((param) => (typeof param === 'string' && param[0] === '$') ? param.substring(1, param.length) : param);
                const validateResponse = await this[validation](...params);
                isValid = validateResponse;
            } else {
                const validateResponse = await this[validation]();
                isValid = validateResponse;
            }
            if (!isValid && !errorMessage && rule?.error[validation]) {
                errorMessage = rule.error[validation];
                errorType = validation;
            }
            return isValid;
        }));
        const isValid = !validations.some((validation) => !validation);
        return {isValid, errorMessage, errorType}
    }

    async function validate() {
        if (customValidation && typeof customValidation === 'function') {
            const validation = customValidation(value, rule, modifier, data);
            Object.keys(validation).forEach((key) => {
                this[key] = validation[key];
            })
        }
        const response = modifier ? await validateRules.call(this, rule.modifier[modifier]) : await validateRules.call(this, rule);
        return response;
    }

    return({
        validate
    });
}
