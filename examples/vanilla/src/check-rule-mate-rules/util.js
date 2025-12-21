export const regexStringToExpression = function(regexString) {
    let regexExpression = regexString;
    if (typeof regexString === 'string') {
        const flags = regexString.replace(/.*\/([gimy]*)$/, '$1');
        const pattern = regexString.replace(new RegExp('^/(.*?)/'+flags+'$'), '$1');
        regexExpression = new RegExp(pattern, flags);
    }
    return regexExpression;
}

export const validateCPF = function(cpf) {
    if (typeof cpf !== "string") return false;
    cpf = cpf.replace(/[\s.-]*/igm, '');
    if (
        !cpf ||
        cpf.length != 11 ||
        cpf == "00000000000" ||
        cpf == "11111111111" ||
        cpf == "22222222222" ||
        cpf == "33333333333" ||
        cpf == "44444444444" ||
        cpf == "55555555555" ||
        cpf == "66666666666" ||
        cpf == "77777777777" ||
        cpf == "88888888888" ||
        cpf == "99999999999"
    ) {
        return false;
    }
    let sum = 0;
    let rest;
    for (let i = 1; i <= 9; i++)
        sum = sum + parseInt(cpf.substring(i-1, i)) * (11 - i);
    rest = (sum * 10) % 11;
    if ((rest == 10) || (rest == 11))  rest = 0;
    if (rest != parseInt(cpf.substring(9, 10)) ) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++)
        sum = sum + parseInt(cpf.substring(i-1, i)) * (12 - i);
    rest = (sum * 10) % 11;
    if ((rest == 10) || (rest == 11))  rest = 0;
    if (rest != parseInt(cpf.substring(10, 11) ) ) return false;
    return true;
}

export const isValidDate = function(dateString){
    const regex = /^\d{4}[\/\-](0?[1-9]|1[012])[\/\-](0?[1-9]|[12][0-9]|3[01])$/;
    if(!regex.test(dateString)) return false;

    const [year, month, day] = dateString.split("-");
    if(year < 1000 || year > 3000 || month == 0 || month > 12)return false;

    const monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    if(year % 400 == 0 || (year % 100 != 0 && year % 4 == 0))monthLength[1] = 29;
    return day > 0 && day <= monthLength[month - 1];
};

export const calculateAge = function(birthday) {
    if(typeof birthday === 'string') {
        birthday = new Date(birthday);
    }
    const ageDifference = Date.now() - birthday.getTime();
    const ageDate = new Date(ageDifference);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
}
