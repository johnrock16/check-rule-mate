/**
 * @module typedefs
 * This file contains all typedefs used in the project.
 */

/**
 * @typedef {Object} DataField
 * @property {string} name - The name and key of the field
 * @property {string} value - the value of the field
 */

/**
 * @typedef {Object} DataValidatorConfigs
 * @property {ValidationHelpers} validationHelpers - The validator functions to help your validations
 * @property {Object} rules - The rules you want to use through validation
 * @property {dataRule} dataRule - The rules you want to use per field
 * @property {Object} dataErrorMessages - The error messages you want to show during errors
 */

/**
 * @typedef {Function} ValidatorHelper
 * @param {any} value - The value to be validate
 * @param {string} rule - The rules to be followed during validation
 * @param {string} modifier - If rule has a modifier applied
 * @param {[DataField]} data - The data fields object
 * @returns {boolean} The validation result of the value
 */

/**
 * @typedef {Object.<string, ValidatorHelper>} ValidationHelpers
 */

/**
 * @typedef {Object} DataRule
 * @property {dataRuleFiVeld} field - The field which will use the rule
 */

/**
 * @typedef {Object} DataRuleField
 * @property {string} rule - The validation rule for the field (e.g., "name", "email", "phone", "hasText").
 * @property {boolean} required - Indicates whether the field is required.
 */

/**
 * @typedef {Object.<string, DataRule>} DataRule - A dynamic object where the keys are field names and the values define the field rules.
 */

/**
 * Represents a successful response.
 *
 * @typedef {Object} DataValidatorSuccessResponse
 * @property {boolean} ok - Indicates the operation was successful.
 */

/**
 * Represents an error response.
 *
 * @typedef {Object} DataValidatorErrorResponse
 * @property {boolean} error - Indicates an error occurred.
 * @property {string} [errorMessage] - A message describing the error (optional).
 * @property {Object} [dataErrors] - Additional error details (optional).
 */
