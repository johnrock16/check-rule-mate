#!/usr/bin/env node

const docs = require('./commands/generate-docs');
const docsPlayground = require('./commands/generate-docs-playground-experimental');
const verify = require('./commands/verify-templates');

run(process.argv.slice(2));


function run(args) {
  const [command, ...rest] = args;

  switch (command) {
    case 'docs':
      return docs(rest);

    case 'docs:playground':
      return docsPlayground(rest);

    case 'verify':
      return verify(rest);

    case '--help':
    case undefined:
      return showHelp();

    default:
      console.error(`Unknown command: ${command}`);
      process.exit(1);
  }
}

function showHelp() {
  console.log(`
check-rule-mate CLI

Usage:
  check-rule-mate <command> [options]

Commands:
  docs               Generate HTML documentation
  docs:playground    Generate docs with interactive playground (experimental)
  verify             Verify schemas, rules and error templates

Examples:
  check-rule-mate docs --rules ./rules --schemas ./schemas --errors ./errors --out ./output.html
  check-rule-mate docs:pĺayground --rules ./rules --schemas ./schemas --errors ./errors --options ./options.json --out ./output.html
  check-rule-mate verify --rules ./rules --schemas ./schemas --errors ./errors
`);
}
