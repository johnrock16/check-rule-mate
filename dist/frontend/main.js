// src/dataValidator/util.js
var regexStringToExpression = function(regexString) {
  let regexExpression = regexString;
  if (typeof regexString === "string") {
    const flags = regexString.replace(/.*\/([gimy]*)$/, "$1");
    const pattern = regexString.replace(new RegExp("^/(.*?)/" + flags + "$"), "$1");
    regexExpression = new RegExp(pattern, flags);
  }
  return regexExpression;
};
var validateCPF = function(cpf) {
  if (typeof cpf !== "string") return false;
  cpf = cpf.replace(/[\s.-]*/igm, "");
  if (!cpf || cpf.length != 11 || cpf == "00000000000" || cpf == "11111111111" || cpf == "22222222222" || cpf == "33333333333" || cpf == "44444444444" || cpf == "55555555555" || cpf == "66666666666" || cpf == "77777777777" || cpf == "88888888888" || cpf == "99999999999") {
    return false;
  }
  let sum = 0;
  let rest;
  for (let i = 1; i <= 9; i++)
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
  rest = sum * 10 % 11;
  if (rest == 10 || rest == 11) rest = 0;
  if (rest != parseInt(cpf.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++)
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
  rest = sum * 10 % 11;
  if (rest == 10 || rest == 11) rest = 0;
  if (rest != parseInt(cpf.substring(10, 11))) return false;
  return true;
};
var isValidDate = function(dateString) {
  const regex = /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/;
  if (!regex.test(dateString)) return false;
  const [year, month, day] = dateString.split("-");
  if (year < 1e3 || year > 3e3 || month == 0 || month > 12) return false;
  const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (year % 400 == 0 || year % 100 != 0 && year % 4 == 0) monthLength[1] = 29;
  return day > 0 && day <= monthLength[month - 1];
};
var calculateAge = function(birthday) {
  if (typeof birthday === "string") {
    birthday = new Date(birthday);
  }
  const ageDifference = Date.now() - birthday.getTime();
  const ageDate = new Date(ageDifference);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

// src/dataValidator/validators.js
var myValidator = function(value, rule, modifier = null, data = null) {
  function regex() {
    const regexTemplate = rule.modifier && rule.modifier[modifier]?.regex ? rule.modifier[modifier].regex : rule.regex;
    const regexExpression = typeof regexTemplate === "string" ? regexStringToExpression(regexTemplate) : regexTemplate;
    return regexExpression.test(value);
  }
  function hasText() {
    return value.replace(/\s/g, "").length > 0;
  }
  function maxLength(maxValue) {
    return maxValue >= value.length;
  }
  function validDate() {
    return isValidDate(value);
  }
  function validateAge(minAge, maxAge) {
    const age = calculateAge(value);
    return age >= minAge && age <= maxAge;
  }
  function cpf() {
    return validateCPF(value);
  }
  function equals(key) {
    return value === data[key];
  }
  return {
    regex,
    hasText,
    maxLength,
    validDate,
    validateAge,
    cpf,
    equals
  };
};
var nameValidator = function(value, rule, modifier = null, data = null) {
  function nameSpecialValidation(emailKey, cellphoneKey) {
    return !!(value && data[emailKey] && data[cellphoneKey]);
  }
  return {
    nameSpecialValidation
  };
};

// src/dataValidator/dataValidate.js
function dataValidate(data, { validationHelpers = {}, rules, dataRule, dataErrorMessages = {} }) {
  const dataErrors = {};
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
  function inputValidation(dataAttribute, data2 = null) {
    const { rule, required } = dataRule[dataAttribute.key];
    if (rule && required || !required && dataAttribute.value != "") {
      if (rule) {
        const INPUT_RULE = rule.split("--")[0];
        const RULE_MODIFIER = rule.split("--").length > 1 ? rule.split("--")[1] : "";
        const dataAttributeValidation = dataAttributeValidator(dataAttribute.value, rules[INPUT_RULE], RULE_MODIFIER, validationHelpers, data2);
        const { isValid, errorMessage, errorType } = dataAttributeValidation.validate();
        if (!isValid) {
          dataErrors[dataAttribute.key] = {
            name: dataAttribute.key,
            error: true,
            errorMessage: getObjectValueByPath(dataErrorMessages, errorMessage) || errorMessage,
            errorType
          };
        }
        return isValid;
      }
    }
    return true;
  }
  function validate() {
    let dataArr = Object.keys(data).map((key) => ({ key, value: data[key] }));
    if (dataArr && dataArr.length > 0) {
      if (!Object.keys(dataRule).every((key) => data.hasOwnProperty(key))) {
        return { error: true, errorMessage: "Missing properties" };
      }
      const dataValidators = [...dataArr].map((input) => inputValidation(input, data));
      if (dataValidators.some((element) => !element)) {
        return { error: true, dataErrors };
      }
      const dataRuleArr = Object.keys(dataRule).map((key) => ({ key, required: dataRule[key].required }));
      const dataAttributesKey = dataArr.map((attribute) => attribute.key);
      const dataAttributesRequired = dataRuleArr.filter((rule) => rule.required).map((rule) => rule.key);
      if (!dataAttributesRequired.every((fieldRequired) => dataAttributesKey.includes(fieldRequired))) {
        return { error: true };
      }
    } else if (!dataArr || dataArr.length === 0) {
      return { error: true, errorMessage: "Missing fields for dataRules" };
    }
    return { ok: true };
  }
  return validate();
}
function dataAttributeValidator(value, rule, modifier = null, customValidation = null, data = null) {
  function validateRules(rule2) {
    let errorMessage;
    let errorType;
    const isValid = !rule2.validate.some((validation) => {
      let isInvalid = true;
      if (rule2.params && rule2.params[validation] && rule2.params[validation].length > 0) {
        const params = rule2.params[validation].map((param) => typeof param === "string" && param[0] === "$" ? param.substring(1, param.length) : param);
        isInvalid = !this[validation](...params);
      } else {
        isInvalid = !this[validation]();
      }
      if (isInvalid && !errorMessage && rule2?.error[validation]) {
        errorMessage = rule2.error[validation];
        errorType = validation;
      }
      return isInvalid;
    });
    return { isValid, errorMessage, errorType };
  }
  function validate() {
    if (customValidation && typeof customValidation === "function") {
      const validation = customValidation(value, rule, modifier, data);
      Object.keys(validation).forEach((key) => {
        this[key] = validation[key];
      });
    }
    return modifier ? validateRules.call(this, rule.modifier[modifier]) : validateRules.call(this, rule);
  }
  return {
    validate
  };
}

// src/dataValidator/rules/validators/myValidatorRules.json
var myValidatorRules_default = {
  name: {
    validate: ["hasText"],
    error: {
      hasText: "common.hasText"
    }
  },
  hasText: {
    validate: ["hasText"],
    error: {
      hasText: "common.hasText"
    }
  },
  email: {
    regex: "/^[a-z0-9.]+@[a-z0-9]+\\.[a-z]+(\\.[a-z]+)?$/i",
    validate: ["regex"],
    error: {
      regex: "email.regex"
    },
    modifier: {
      confirm: {
        validate: ["regex", "equals"],
        params: {
          equals: ["$email"]
        },
        error: {
          regex: "email.regex",
          equals: "email.equals"
        }
      }
    }
  },
  phone: {
    regex: "/^[0-9]{4}-[0-9]?[0-9]{4}$/",
    validate: ["regex"],
    error: {
      regex: "phone.regex"
    }
  },
  date: {
    regex: "/^\\d{4}[/\\-](0?[1-9]|1[012])[/\\-](0?[1-9]|[12][0-9]|3[01])$/",
    validate: ["regex", "validDate"],
    error: {
      regex: "common.dateFormat",
      validDate: "date.validDate"
    },
    modifier: {
      age: {
        validate: ["regex", "validateAge"],
        params: {
          validateAge: [18, 130]
        },
        error: {
          regex: "common.dateFormat",
          validateAge: "date.modifier.age.validateAge"
        }
      }
    }
  },
  cpf: {
    validate: ["cpf"],
    error: {
      cpf: "cpf.cpf"
    }
  }
};

// src/dataValidator/rules/validators/name.rule.json
var name_rule_default = {
  name: {
    validate: ["nameSpecialValidation"],
    params: {
      nameSpecialValidation: ["$email", "$cellphone"]
    },
    error: {
      nameSpecialValidation: "name.nameSpecialValidation"
    }
  }
};

// src/dataValidator/rules/data/contactUs.json
var contactUs_default = {
  name: {
    rule: "name",
    required: true
  },
  lastName: {
    rule: "name",
    required: true
  },
  email: {
    rule: "email",
    required: true
  },
  emailConfirm: {
    rule: "email--confirm",
    required: true
  },
  phone: {
    rule: "phone",
    required: false
  },
  subject: {
    rule: "hasText",
    required: true
  },
  message: {
    rule: "hasText",
    required: true
  }
};

// src/dataValidator/rules/data/name.data.rule.json
var name_data_rule_default = {
  name: {
    rule: "name",
    required: true
  },
  cellphone: {
    rule: "phone",
    required: true
  },
  email: {
    rule: "email",
    required: true
  }
};

// src/i18n/en_US/errors/myValidatorRules.json
var myValidatorRules_default2 = {
  common: {
    hasText: "Please, fill the field"
  },
  email: {
    regex: "Please, fill the field with a valid e-mail",
    equals: "The email and email confirm are not equals"
  },
  phone: {
    regex: "Please, fill the field with a valid phone"
  },
  name: {
    nameSpecialValidation: "Please, fill the field following fields: name, email and cellphone"
  }
};

// src/main.js
var validatorJS = {
  myValidator,
  nameValidator,
  dataValidate,
  MY_RULES: myValidatorRules_default,
  NAME_RULE: name_rule_default,
  CONTACT_US: contactUs_default,
  NAME_DATA_RULE: name_data_rule_default,
  MY_VALIDATION_ERROR_MESSAGES: myValidatorRules_default2
};

window.validatorJS = validatorJS;
