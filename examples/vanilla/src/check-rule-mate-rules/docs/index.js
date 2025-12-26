(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // examples/vanilla/src/check-rule-mate-rules/util.js
  var regexStringToExpression, validateCPF, isValidDate, calculateAge;
  var init_util = __esm({
    "examples/vanilla/src/check-rule-mate-rules/util.js"() {
      regexStringToExpression = function(regexString) {
        let regexExpression = regexString;
        if (typeof regexString === "string") {
          const flags = regexString.replace(/.*\/([gimy]*)$/, "$1");
          const pattern = regexString.replace(new RegExp("^/(.*?)/" + flags + "$"), "$1");
          regexExpression = new RegExp(pattern, flags);
        }
        return regexExpression;
      };
      validateCPF = function(cpf) {
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
      isValidDate = function(dateString) {
        const regex = /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/;
        if (!regex.test(dateString)) return false;
        const [year, month, day] = dateString.split("-");
        if (year < 1e3 || year > 3e3 || month == 0 || month > 12) return false;
        const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        if (year % 400 == 0 || year % 100 != 0 && year % 4 == 0) monthLength[1] = 29;
        return day > 0 && day <= monthLength[month - 1];
      };
      calculateAge = function(birthday) {
        if (typeof birthday === "string") {
          birthday = new Date(birthday);
        }
        const ageDifference = Date.now() - birthday.getTime();
        const ageDate = new Date(ageDifference);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
      };
    }
  });

  // examples/vanilla/src/check-rule-mate-rules/validators/validators.js
  var validators_exports = {};
  __export(validators_exports, {
    myValidator: () => myValidator,
    nameValidator: () => nameValidator
  });
  var myValidator, nameValidator;
  var init_validators = __esm({
    "examples/vanilla/src/check-rule-mate-rules/validators/validators.js"() {
      init_util();
      myValidator = function(value, rule, modifier = null, data = null) {
        function regex() {
          var _a;
          const regexTemplate = rule.modifier && ((_a = rule.modifier[modifier]) == null ? void 0 : _a.regex) ? rule.modifier[modifier].regex : rule.regex;
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
        async function isDataFetched() {
          try {
            let result = await new Promise((resolve, reject) => {
              setTimeout(() => {
                const success = true;
                if (success) {
                  resolve("Data fetched successfully!");
                } else {
                  reject("Error fetching data");
                }
              }, 2e3);
            });
            return !!result;
          } catch (error) {
            return false;
          }
        }
        return {
          regex,
          hasText,
          maxLength,
          validDate,
          validateAge,
          isDataFetched,
          cpf,
          equals
        };
      };
      nameValidator = function(value, rule, modifier = null, data = null) {
        function nameSpecialValidation(emailKey, cellphoneKey) {
          return !!(value && data[emailKey] && data[cellphoneKey]);
        }
        return {
          nameSpecialValidation
        };
      };
    }
  });

  // check-rule-mate.validators.docs.js
  var require_check_rule_mate_validators_docs = __commonJS({
    "check-rule-mate.validators.docs.js"() {
      var myValidator2 = (init_validators(), __toCommonJS(validators_exports));
      var nameValidator2 = (init_validators(), __toCommonJS(validators_exports));
      window.validatorHelpers = { myValidator: myValidator2, nameValidator: nameValidator2 };
    }
  });
  require_check_rule_mate_validators_docs();
})();
