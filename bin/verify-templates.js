#!/usr/bin/env node

// import fs from 'fs';
// import path from 'path';
// import process from 'process';

const fs = require('fs');
const path = require('path');
const process = require('process');

/**
 * ---------------------------
 * Utils
 * ---------------------------
 */

function readJSONFilesFromDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    throw new Error(`Directory not found: ${dirPath}`);
  }

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json'));

  const data = {};
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const content = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
    data[file] = content;
  }

  return data;
}

function parseRuleName(ruleName) {
  const [base, modifier] = ruleName.split('--');
  return { base, modifier };
}

function error(msg) {
  return { type: 'error', message: msg };
}

function warning(msg) {
  return { type: 'warning', message: msg };
}

/**
 * ---------------------------
 * Core Validators
 * ---------------------------
 */

function validateSchemas({ schemas, rules }) {
  const issues = [];

  for (const [schemaFile, schema] of Object.entries(schemas)) {
    for (const [field, config] of Object.entries(schema)) {
      if (!config.rule) continue;

      const { base, modifier } = parseRuleName(config.rule);

      if (!rules[base]) {
        issues.push(
          error(
            `Schema "${schemaFile}" → field "${field}" references rule "${base}" which does not exist`
          )
        );
        continue;
      }

      if (modifier) {
        if (!rules[base].modifier || !rules[base].modifier[modifier]) {
          issues.push(
            error(
              `Schema "${schemaFile}" → field "${field}" references modifier "${modifier}" on rule "${base}" which does not exist`
            )
          );
        }
      }
    }
  }

  return issues;
}

function validateRuleErrors({ rules, errors }) {
  const issues = [];

  for (const [ruleName, rule] of Object.entries(rules)) {
    const checkErrorMap = (errorMap, context) => {
      if (!errorMap) return;

      for (const errorKey of Object.values(errorMap)) {
        const [namespace, key] = errorKey.split('.');
        if (!errors[namespace] || !errors[namespace][key]) {
          issues.push(
            error(
              `Rule "${ruleName}"${context} references error key "${errorKey}" which does not exist`
            )
          );
        }
      }
    };

    checkErrorMap(rule.error, '');

    if (rule.modifier) {
      for (const [modifierName, modifier] of Object.entries(rule.modifier)) {
        checkErrorMap(modifier.error, ` (modifier "${modifierName}")`);
      }
    }
  }

  return issues;
}

function findUnusedErrors({ rules, errors }) {
  const issues = [];
  const usedErrors = new Set();

  const collectErrors = errorMap => {
    if (!errorMap) return;
    Object.values(errorMap).forEach(e => usedErrors.add(e));
  };

  for (const rule of Object.values(rules)) {
    collectErrors(rule.error);
    if (rule.modifier) {
      Object.values(rule.modifier).forEach(m => collectErrors(m.error));
    }
  }

  for (const [namespace, keys] of Object.entries(errors)) {
    for (const key of Object.keys(keys)) {
      const fullKey = `${namespace}.${key}`;
      if (!usedErrors.has(fullKey)) {
        issues.push(
          warning(`Unused error message detected: "${fullKey}"`)
        );
      }
    }
  }

  return issues;
}

/**
 * ---------------------------
 * CLI Argument Parsing
 * ---------------------------
 */

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].replace('--', '');
      options[key] = args[i + 1];
      i++;
    }
  }

  return options;
}

/**
 * ---------------------------
 * Runner
 * ---------------------------
 */

async function runVerify() {
  try {
    const args = parseArgs();

    if (!args.schemas || !args.rules || !args.errors) {
      console.error(
        'Usage: check-rule-mate-verify-templates --schemas <path> --rules <path> --errors <path>'
      );
      process.exit(1);
    }

    const schemas = readJSONFilesFromDir(args.schemas);
    const rulesRaw = readJSONFilesFromDir(args.rules);
    const errorsRaw = readJSONFilesFromDir(args.errors);

    // Merge all rule files into one object
    const rules = Object.assign({}, ...Object.values(rulesRaw));
    const errors = Object.assign({}, ...Object.values(errorsRaw));

    let issues = [];

    issues.push(...validateSchemas({ schemas, rules }));
    issues.push(...validateRuleErrors({ rules, errors }));
    issues.push(...findUnusedErrors({ rules, errors }));

    const hasErrors = issues.some(i => i.type === 'error');

    console.log('✔ Schemas loaded:', Object.keys(schemas).length);
    console.log('✔ Rules loaded:', Object.keys(rules).length);
    console.log('✔ Errors loaded:', Object.keys(errors).length);
    console.log('');

    if (issues.length === 0) {
      console.log('✔ No issues found');
      process.exit(0);
    }

    console.log(hasErrors ? '❌ Validation failed' : '⚠️ Validation warnings');
    console.log('');

    for (const issue of issues) {
      const prefix = issue.type === 'error' ? '❌' : '⚠️';
      console.log(`${prefix} ${issue.message}`);
    }

    process.exit(hasErrors ? 1 : 0);
  } catch (err) {
    console.error('Fatal error:', err.message);
    process.exit(1);
  }
}

runVerify();
