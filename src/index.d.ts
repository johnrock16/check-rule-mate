/**
 * This file contains all type definitions used in the project.
 */

/**
 * Represents a single data field.
 */
export interface DataField {
  /** The name and key of the field */
  name: string

  /** The value of the field */
  value: string
}

/**
 * Options to control validator behavior.
 */
export interface ValidatorOptions {
  /** If the form fields don't match the expected structure, triggers an error */
  propertiesMustMatch: boolean

  /** Stops validation when the first error is caught */
  abortEarly: boolean

  /** Defines if the schema will use cache by default */
  cache: boolean
}

/**
 * A single validation helper function.
 */
export type ValidatorHelper = (
  value: any,
  rule: string,
  modifier: string,
  data: DataField[]
) => boolean

/**
 * A map of validation helper functions.
 */
export type ValidationHelpers = Record<string, ValidatorHelper>

/**
 * Schema rule for a single field.
 */
export interface SchemaRuleField {
  /** The validation rule for the field (e.g., "name", "email", "phone", "hasText") */
  rule: string

  /** Indicates whether the field is required */
  required: boolean

  /** Indicates if the field requires cache or not */
  cache: boolean
}

/**
 * Schema rule object.
 */
export interface SchemaRule {
  field: SchemaRuleField
}

/**
 * Validation schema mapping field names to rules.
 */
export type SchemaRules = Record<string, SchemaRule>

/**
 * Validator configuration object.
 */
export interface DataValidatorConfigs {
  /** The validator functions to help your validations */
  validationHelpers: ValidationHelpers

  /** The rules you want to use through validation */
  rules: object

  /** The rules you want to use per field */
  schema: SchemaRules

  /** The error messages you want to show during errors */
  errorMessages: object

  /** Validator options */
  options: ValidatorOptions
}

/**
 * Represents a successful response.
 */
export interface DataValidatorSuccessResponse {
  /** Indicates the operation was successful */
  ok: boolean
}

/**
 * Error object.
 */
export interface CheckError {
  /** Field name */
  name: string

  /** Error path */
  code?: string

  /** Error type */
  type?: string

  /** Error message */
  message?: string
}

/**
 * Represents an error response.
 */
export interface DataValidatorErrorResponse {
  /** Indicates an error occurred */
  error: boolean

  /** A message describing the error */
  errorMessage?: string

  /** Additional error details */
  errors?: Record<string, CheckError>
}
