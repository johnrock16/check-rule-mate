/**
 * @module typedefs
 * This file contains all typedefs used in the project.
 */

/**
 * @typedef {Object} DataField
 * @property {string} name - The name and key of the field
 * @property {any} value - the value of the field
 */

/**
 * @typedef {Object} DataValidatorConfigs
 * @property {ValidationHelpers} validationHelpers - The validator functions to help your validations
 * @property {Object} rules - The rules you want to use through validation
 * @property {SchemaRule} schema - The rules you want to use per field
 * @property {Object} errorMessages - The error messages you want to show during errors
 * @property {ValidatorOptions} options - Options
 */

/**
 * @typedef {Object} ValidatorOptions
 * @property {boolean} propertiesMustMatch - If the form fields doesn't match with the expected structure will triggers an error
 * @property {boolean} abortEarly - Stops when caughts the first error
 * @property {boolean} cache - Defines if the schema will uses cache as default or not
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
 * @typedef {Object} SchemaRule
 * @property {SchemaRuleField} field - The field which will use the rule
 */

/**
 * @typedef {Object} SchemaRuleField
 * @property {string} rule - The validation rule for the field (e.g., "name", "email", "phone", "hasText").
 * @property {boolean} required - Indicates whether the field is required.
 * @property {boolean} cache - Indicates if the field requires cache or not
 */

/**
 * @typedef {Object.<string, SchemaRule>} SchemaRule - A dynamic object where the keys are field names and the values define the field rules.
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
 * @property {Object.<string, CheckError>} [errors] - Additional error details (optional).
 */

/**
 *  Error Object
 *
 * @typedef {Object} CheckError
 * @property {string} name - Field name
 * @property {string} code - Error path (optional)
 * @property {string} type - Error type (optional)
 * @property {string} message - Error message (optional)
 */
