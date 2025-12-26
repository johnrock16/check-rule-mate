  // src/js/dataValidate.js
  var DEFAUL_OPTIONS = { propertiesMustMatch: true, abortEarly: false, cache: true };
  function createValidator(data, { validationHelpers = {}, rules, schema, errorMessages = {}, hooks = {}, options = DEFAUL_OPTIONS }) {
    options = { ...DEFAUL_OPTIONS, ...options };
    data = data;
    let errors = {};
    let oldData = {};
    const validateByStrategies = {
      all: async (dataArr) => Promise.all([...dataArr].map(async (input) => await inputValidation(input, data))),
      first: async (dataArr) => {
        const results = [];
        for (const input of dataArr) {
          const result = await inputValidation(input, data);
          results.push(result);
          if (!result) {
            return results;
          }
        }
        return results;
      }
    };
    function getObjectValueByPath(obj, path) {
      if (!obj || typeof path !== "string") return void 0;
      const keys = path.split(".");
      let current = obj;
      for (const key of keys) {
        if (current[key] === void 0) return void 0;
        current = current[key];
      }
      return current;
    }
    async function inputValidation(dataAttribute, data2 = null) {
      var _a, _b;
      hookTrigger("onValidateFieldStart", { field: dataAttribute.key, value: dataAttribute.value, schemaField: schema[dataAttribute.key] || null });
      if (schema[dataAttribute.key]) {
        const { rule, required } = schema[dataAttribute.key];
        const cacheEnabled = ((_a = schema[dataAttribute.key]) == null ? void 0 : _a.cache) !== void 0 ? schema[dataAttribute.key].cache : options.cache;
        if (cacheEnabled && data2[dataAttribute.key] === ((_b = oldData[dataAttribute.key]) == null ? void 0 : _b.value)) {
          return oldData[dataAttribute.key].isValid;
        }
        if (rule && required || !required && dataAttribute.value != "") {
          if (rule) {
            const INPUT_RULE = rule.split("--")[0];
            const RULE_MODIFIER = rule.split("--").length > 1 ? rule.split("--")[1] : "";
            const dataAttributeValidation = dataAttributeValidator(dataAttribute.value, rules[INPUT_RULE], RULE_MODIFIER, validationHelpers, data2);
            const { isValid, errorMessage, errorType } = await dataAttributeValidation.validate();
            if (!isValid) {
              const error = {
                name: dataAttribute.key,
                field: dataAttribute.key,
                code: errorMessage,
                type: errorType,
                message: getObjectValueByPath(errorMessages, errorMessage) || ""
              };
              errors[dataAttribute.key] = error;
              hookTrigger("onValidateFieldError", { field: dataAttribute.key, value: dataAttribute.value, schemaField: schema[dataAttribute.key], error });
            } else {
              hookTrigger("onValidateFieldSuccess", { field: dataAttribute.key, value: dataAttribute.value, schemaField: schema[dataAttribute.key] });
            }
            oldData[dataAttribute.key] = { isValid, value: data2[dataAttribute.key] };
            return isValid;
          }
        }
      } else if (options.propertiesMustMatch) {
        const error = {
          name: dataAttribute.key,
          field: dataAttribute.key,
          message: "Invalid property",
          internal: true
        };
        errors[dataAttribute.key] = error;
        hookTrigger("onValidateFieldError", { field: dataAttribute.key, value: dataAttribute.value, error });
        return false;
      }
      hookTrigger("onValidateFieldSuccess", { field: dataAttribute.key, value: dataAttribute.value });
      return true;
    }
    async function validateField(key) {
      const result = await inputValidation({ key, value: data[key] }, data);
      if (!result) {
        return { error: true, errors: errors[key] };
      }
      return { ok: true };
    }
    async function validate() {
      hookTrigger("onValidateStart", { data });
      errors = {};
      let dataArr = Object.keys(data).map((key) => ({ key, value: data[key] }));
      if (dataArr && dataArr.length > 0) {
        if (!Object.keys(schema).every((key) => data.hasOwnProperty(key))) {
          hookTrigger("onValidateEnd", { data, errors: [{ name: "internal: schema - missing properties", message: "Missing properties", internal: true }] });
          return { error: true, errorMessage: "Missing properties" };
        }
        const dataValidators = (options == null ? void 0 : options.abortEarly) ? await validateByStrategies.first(dataArr) : await validateByStrategies.all(dataArr);
        if (dataValidators.some((element) => !element)) {
          hookTrigger("onValidateEnd", { data, errors });
          return { error: true, errors };
        }
        const dataRuleArr = Object.keys(schema).map((key) => ({ key, required: schema[key].required }));
        const dataAttributesKey = dataArr.map((attribute) => attribute.key);
        const dataAttributesRequired = dataRuleArr.filter((rule) => rule.required).map((rule) => rule.key);
        if (!dataAttributesRequired.every((fieldRequired) => dataAttributesKey.includes(fieldRequired))) {
          const error = { error: true };
          hookTrigger("onValidateEnd", { data, errors: [{ name: "internal: fields - required", message: "", internal: true }] });
          return error;
        }
      } else if (!dataArr || dataArr.length === 0) {
        const error = { error: true, errorMessage: "Missing fields for schema" };
        hookTrigger("onValidateEnd", { data, errors: [{ name: "internal: schema - missing fields", message: error.errorMessage, internal: true }] });
        return error;
      }
      hookTrigger("onValidateEnd", { data });
      return { ok: true };
    }
    function hookTrigger(hookName, parameters) {
      if ((hooks == null ? void 0 : hooks[hookName]) && typeof hooks[hookName] === "function") {
        hooks[hookName]({ ...parameters });
      }
    }
    function setData(newData) {
      data = newData;
    }
    return { validate, validateField, setData };
  }
  function dataAttributeValidator(value, rule, modifier = null, customValidation = null, data = null) {
    async function validateRules(rule2) {
      let errorMessage;
      let errorType;
      const validations = await Promise.all(rule2.validate.map(async (validation) => {
        let isValid2 = true;
        if (rule2.params && rule2.params[validation] && rule2.params[validation].length > 0) {
          const params = rule2.params[validation].map((param) => typeof param === "string" && param[0] === "$" ? param.substring(1, param.length) : param);
          const validateResponse = await this[validation](...params);
          isValid2 = validateResponse;
        } else {
          const validateResponse = await this[validation]();
          isValid2 = validateResponse;
        }
        if (!isValid2 && !errorMessage && (rule2 == null ? void 0 : rule2.error[validation])) {
          errorMessage = rule2.error[validation];
          errorType = validation;
        }
        return isValid2;
      }));
      const isValid = !validations.some((validation) => !validation);
      return { isValid, errorMessage, errorType };
    }
    async function validate() {
      if (customValidation && typeof customValidation === "function") {
        const validation = customValidation(value, rule, modifier, data);
        Object.keys(validation).forEach((key) => {
          this[key] = validation[key];
        });
      }
      const response = modifier ? await validateRules.call(this, rule.modifier[modifier]) : await validateRules.call(this, rule);
      return response;
    }
    return {
      validate
    };
  }
