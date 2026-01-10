/**
 * check-rule-mate — Auto Documentation Generator With Playground
 */

const fs = require('fs');
const path = require('path');
const process = require('process');
const { parseArgs } = require('../utils/args.js');
let esbuild;

try {
  esbuild = require('esbuild');
} catch {
  console.warn(
    '[check-rule-mate] esbuild not found. ' +
    'Install it to enable playground generation.'
  );
  process.exit(1);
}

const generateDocs = function ({ rulesArg, schemasArg, errorsArg, optionsArg, outArg, commandArg }) {
  const RULES_DIR = rulesArg;
  const SCHEMAS_DIR = schemasArg;
  const ERRORS_DIR = errorsArg;
  const OPTIONS_DIR = optionsArg;
  const OUTPUT = outArg || "check-rule-mate-docs.html";
  const OUTPUT_DIR = path.dirname(OUTPUT);
  const isPlayground = commandArg === 'docs:playground';

  const OPTIONS = OPTIONS_DIR ? JSON.parse(fs.readFileSync(OPTIONS_DIR, "utf-8")) : null;

  if (isPlayground && OPTIONS) {
    let entryPointFile = Object.keys(OPTIONS.validators).map((key) => `var ${key} = require('${OPTIONS.validators[key]}')`).join('\n');
    entryPointFile += `\n window.validatorHelpers = {${Object.keys(OPTIONS.validators).map((key) => `${key}: ${key}`)}}`

    fs.writeFileSync(`./check-rule-mate.validators.docs.js`, entryPointFile);

    esbuild.build({
      entryPoints: ['./node_modules/check-rule-mate/src/main.js'],
      bundle: true,
      outfile: `${OUTPUT_DIR}/check-rule-mate.js`,
      platform: 'browser',
      target: 'node16',
      format: 'iife',
      minify: false
    }).then(() => {
        console.log('Build completed successfully: check-rule-mate.js');

        const checkRuleMateFIle = fs.readFileSync(`${OUTPUT_DIR}/check-rule-mate.js`, 'utf-8');
        const lines = checkRuleMateFIle.split('\n')
        lines.shift();
        lines.splice(lines.length - 2, 1)
        fs.writeFileSync(`${OUTPUT_DIR}/check-rule-mate.js`, lines.join('\n'))
    }).catch(() => process.exit(1));

    esbuild.build({
      entryPoints: [`./check-rule-mate.validators.docs.js`],
      bundle: true,
      outfile: `${OUTPUT_DIR}/index.js`,
      platform: 'browser',
      target: 'node16',
      format: 'iife',
      minify: false
    }).then(() => {
        console.log('Build completed successfully: index.js');
        fs.rmSync('./check-rule-mate.validators.docs.js')
    }).catch(() => process.exit(1));
  }


  if (!RULES_DIR || !SCHEMAS_DIR) {
    console.error(`
  Usage:
  npx check-rule-mate docs:playground --rules ./rules --schemas ./schemas --errors ./errors --out docs.html
  `);
    process.exit(1);
  }

  /* ---------------------------------------
  * HELPERS
  * -------------------------------------*/
  const readJSONFiles = (dir) => {
    return fs.readdirSync(dir)
      .filter(f => f.endsWith(".json"))
      .map(file => ({
        name: file.replace(".json", ""),
        content: JSON.parse(fs.readFileSync(path.join(dir, file), "utf-8"))
      }));
  };

  const rulesFiles = readJSONFiles(RULES_DIR);
  const schemasFiles = readJSONFiles(SCHEMAS_DIR);
  const errorsFiles = readJSONFiles(ERRORS_DIR);


  /* ---------------------------------------
  * INDEX RELATIONSHIPS
  * -------------------------------------*/
  const ruleUsageMap = {};
  const errorUsageMap = {}

  schemasFiles.forEach(schemaFile => {
    Object.entries(schemaFile.content).forEach(([field, config]) => {
      const ruleName = config.rule.split("--")[0];
      if (!ruleUsageMap[ruleName]) ruleUsageMap[ruleName] = [];
      ruleUsageMap[ruleName].push({
        schema: schemaFile.name,
        field,
        rule: config.rule
      });
    });
  });

  rulesFiles.forEach(rulesFile => {
    Object.entries(rulesFile.content).forEach(([field, config]) => {
      Object.entries(config.error).forEach(([key, value]) => {
        const errorName = value;
        if (!errorUsageMap[errorName]) errorUsageMap[errorName] = [];
        errorUsageMap[errorName].push({
          file: rulesFile.name,
          field,
          error: value
        });
      });
      if (config?.modifier) {
        Object.entries(config.modifier).forEach(([modifierKey, modifier]) => {
          if (modifier?.error) {
            Object.entries(modifier.error).forEach(([key, value]) => {
              const errorName = value;
              if (!errorUsageMap[errorName]) errorUsageMap[errorName] = [];
              errorUsageMap[errorName].push({
                file: rulesFile.name,
                field,
                error: value
              });
            });
          }
        });
      }
    });
  });


  /* ---------------------------------------
  * HTML GENERATION
  * -------------------------------------*/
  const html = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
  <meta charset="UTF-8" />
  <title>check-rule-mate — Documentation</title>
  <style>
  ${generateCSS()}
  </style>
  ${isPlayground && OPTIONS ? `
    <script src="./check-rule-mate.js" defer></script>
    <script src="./index.js" defer></script>`
  : ''}
  </head>
  <body>

  <aside class="sidebar">
    <input id="search" placeholder="Search..." />

    <h3>Schemas</h3>
    ${schemasFiles.map(s => `
      <a href="#schema-${s.name}">${s.name}</a>
    `).join("")}

    <h3>Rules</h3>
    ${rulesFiles.map(rf =>
      Object.keys(rf.content).map(rule => `
        <a href="#rule-${rule}">${rf.name} - ${rule}</a>
      `).join("")
    ).join("")}

    <h3>Errors</h3>
    ${errorsFiles.map(errorFile =>
      Object.keys(errorFile.content).map(error => `
        <a href="#error-${error}">${errorFile.name} - ${error}</a>
      `).join("")
    ).join("")}
  </aside>

  <main>
    <section>
      <h1>check-rule-mate</h1>
      <p class="muted">
        Visual documentation of validation rules and schemas.
      </p>
    </section>

    ${renderSchemas(schemasFiles)}
    ${renderRules(rulesFiles, ruleUsageMap)}
    ${renderErrors(errorsFiles, errorUsageMap)}
  </main>

  <script>
  ${generateClientJS()}
  </script>

  </body>
  </html>
  `;

  fs.writeFileSync(OUTPUT, html);
  console.log(`✔ Documentation generated at ${OUTPUT}`);

  /* ---------------------------------------
  * RENDERERS
  * -------------------------------------*/
  function renderSchemas(schemas) {
    return schemas.map(schema => `
    <section id="schema-${schema.name}" class="card">
      <h2>Schema: ${schema.name}</h2>

      <table>
        <thead>
          <tr>
            <th>Field</th>
            <th>Rule</th>
            <th class="text-center">Required</th>
            <th class="text-center">Cache</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(schema.content).map(([field, cfg]) => `
            <tr>
              <td>${field}</td>
              <td>
                <a href="#rule-${cfg.rule.split("--")[0]}">
                  ${cfg.rule}
                </a>
              </td>
              <td class="text-center">${cfg.required ? "✔" : "optional"}</td>
              <td class="text-center">${cfg.cache === false ? "off" : "✔"}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
      ${isPlayground && OPTIONS ? `
        <details class="schema-test">
          <summary>Schema Test (Experimental)</summary>
          <div class="schema-test-container">
            <form id="schema:${schema.name}" data-form="schema--${schema.name}">
              ${Object.entries(schema.content).map(([field, cfg]) => {
                const attributesHTML = cfg.attributesHTML ? Object.keys(cfg.attributesHTML).map((key) => `${key}="${cfg?.attributesHTML[key]}"`).join(' ') : null
                return `
                <div style="display: flex; flex-direction: column;">
                  <label for="${field}">${field} (${cfg.rule})</label>
                  <input name="${field}" ${cfg.required ? 'required': ''} ${attributesHTML}/>
                </div>
              `}).join("")}
              <div style="display: flex; flex-direction: column;">
                <label for="check-rule-mate-validators">VALIDATORS</label>
                <select name="check-rule-mate-validators" required>
                  ${
                    OPTIONS?.validators ? Object.keys(OPTIONS.validators).map((key) => `
                      <option value=${key}>${key}</option>
                    `)
                    : ''
                  }
                </select>
              </div>
              <div style="display: flex; flex-direction: column;">
                <label for="check-rule-mate-rules">RULES</label>
                <select name="check-rule-mate-rules" required>
                  ${
                    rulesFiles ? rulesFiles.map((rulesFile) => `
                      <option value=${rulesFile.name}>${rulesFile.name}</option>
                    `)
                    : ''
                  }
                </select>
              </div>
              <button type="submit">Validate Schema</button>
            </form>
            <div class="schema-test-result">
              <span>Result:</span>
              <textarea id="textarea-schema-${schema.name}" readonly></textarea>
            </div>
          </div>
        </details>
      ` : ''}
      </section>
    `).join("");
  }

  function renderRules(rulesFiles, usageMap) {
    return rulesFiles.map(file =>
      Object.entries(file.content).map(([ruleName, rule]) => `
      <section id="rule-${ruleName}" class="card">
        <h2>Rule: ${ruleName} (${file.name})</h2>
        ${rule?.docs?.description ?
          `<p>${rule.docs.description}</p>`
        : ''}

        <h3>Validation Flow</h3>
        <div class="flow">
          ${rule.validate.map(v => `
            <div class="flow-step">${v}</div>
            <div class="flow-arrow">→</div>
          `).join("")}
          <div class="flow-step success">valid</div>
        </div>

        <h3>Error Codes</h3>
        ${renderRulesErrors(rule.error)}

        ${rule.modifier ? `
          <h3>Modifiers</h3>
          ${Object.entries(rule.modifier).map(([mod, modRule]) => `
            <div class="modifier">
              <span class="tag modifier">${mod}</span>
              ${modRule?.docs?.description ? `<p>${modRule.docs.description}</p>` : ''}

              <div class="flow">
                ${modRule.validate.map(v => `
                  <div class="flow-step">${v}</div>
                  <div class="flow-arrow">→</div>
                `).join("")}
                <div class="flow-step success">valid</div>
              </div>

              <h4>Error Codes</h4>
              ${renderRulesErrors(modRule.error)}
            </div>
          `).join("")}
        ` : ""}

        <h3>Used by Schemas</h3>
        <ul>
          ${(usageMap[ruleName] || []).map(u =>
            `<li>${u.schema} → <strong>${u.field}</strong> (${u.rule})</li>`
          ).join("") || "<li>Not used</li>"}
        </ul>

        ${rule?.docs?.notes ?
        `
          <h3>Notes</h3>
          <div class="rule-notes">${rule?.docs?.notes}</div>
        `
        : ''}
      </section>
      `).join("")
    ).join("");
  }

  function renderRulesErrors(errors = {}) {
    return `
      <ul>
        ${Object.entries(errors).map(([k, v]) =>
          `<li><a href="#error-${v.split('.')[0]}" class="tag error">${k}</a> ${v}</li>`
        ).join("")}
      </ul>
    `;
  }

  function renderErrors(errorFiles, usageMap) {
    return errorFiles.map(file =>
      Object.entries(file.content).map(([errorName, errors]) => `
      <section id="error-${errorName}" class="card">
        <h2>Error: ${errorName} (${file.name})</h2>
        <ul>
        ${Object.entries(errors).map(([key, value]) => `
          <li><span class="tag error">${key}</span> ${value} </li>
        `).join('')}
        </ul>

        <h3>Used by Rules</h3>
        <ul>
          ${Object.entries(errors).map(([key, value]) => `
            ${(usageMap[`${errorName}.${key}`] || []).map(u =>
              `<li>${u.file} → <strong>${u.field}</strong> (${u.error})</li>`
            ).join("") || "<li>Not used</li>"}
          `).join('')}
        </ul>
      </section>
    `).join('')).join('');
  }

  /* ---------------------------------------
  * CSS
  * -------------------------------------*/
  function generateCSS() {
    return `
    body {
      margin: 0;
      font-family: Inter, system-ui, sans-serif;
      display: grid;
      grid-template-columns: 280px 1fr;
      background: #0f172a;
      color: #e5e7eb;
    }

    .sidebar {
      padding: 16px;
      background: #020617;
      overflow-y: auto;
    }

    .sidebar input {
      width: 100%;
      padding: 8px;
      border-radius: 6px;
      border: none;
      margin-bottom: 16px;
    }

    .sidebar a {
      display: block;
      padding: 6px 10px;
      color: #e5e7eb;
      text-decoration: none;
      border-radius: 6px;
    }

    .sidebar a:hover {
      background: rgba(56,189,248,0.2);
    }

    a {
      color: #e5e7eb;
    }

    main {
      padding: 32px;
      overflow-y: auto;
    }

    .card {
      background: #020617;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 32px;
      border: 1px solid rgba(255,255,255,0.05);
    }

    .flow {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }

    .flow-step {
      padding: 10px 14px;
      border-radius: 8px;
      background: rgba(56,189,248,0.15);
    }

    .flow-arrow {
      opacity: 0.5;
    }

    .success {
      background: rgba(34,197,94,0.2);
    }

    .tag {
      padding: 4px 8px;
      border-radius: 999px;
      font-size: 14px;
    }

    .tag.error {
      display: inline-block;
      margin-bottom: 8px;
      background: rgba(239,68,68,0.2);
      text-decoration: none;
    }

    .tag.modifier {
      display: inline-block;
      font-size: 16px;
      margin-bottom: 8px;
      font-weight: 600;
      background: rgba(167,139,250,0.2);
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    td, th {
      padding: 8px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
    }

    th {
      text-align: left;
      border-bottom: 1px solid #f4f4f4;
    }

    .rule-notes {
      padding: 16px;
      color: black;
      background: #f4f4f4;
      border-radius: 12px;
    }

    .text-center {
      text-align: center;
    }

    .schema-test {
      margin-top: 32px;
    }

    .schema-test-container {
      display: flex;
      width: 100%;
      margin: 32px 0 24px 0;
      gap: 40px;
    }

    .schema-test-container > * {
      width: 100%;
    }

    .schema-test-result span {
      display: block;
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 16px;
    }

    .schema-test-result textarea {
      width: 100%;
      height: 80%;
      color: #f4f4f4;
      background-color: #111111;
      border: none;
    }

    button {
      cursor: pointer;
    }

    form button[type="submit"] {
      width: 100%;
      padding: 16px 24px;
      min-width: 120px;
      min-height: 48px;
      margin-top: 16px;
      font-size: 16px;
      font-weight: 600;
      color: #444444;
      background-color: #eede91;
    }

    label {
      margin-bottom: 4px;
      font-size: 16px;
      color: #e5e7eb;
    }

    .schema-test input,
    .schema-test select {
      min-height: 28px;
      padding: 4px 8px 4px 8px;
      margin-bottom: 16px;
      font-size: 16px;
      color: #e5e7eb;
      background-color: transparent;
      border: none;
      border-bottom: 1px solid white;
    }

    .schema-test select option {
      background-color: #020617;
      color: #e5e7eb;
    }
    `;
  }

  /* ---------------------------------------
  * CLIENT JS
  * -------------------------------------*/
  function generateClientJS() {
    return `
    const search = document.getElementById("search");
    search.addEventListener("input", e => {
      const value = e.target.value.toLowerCase();
      document.querySelectorAll("section.card").forEach(card => {
        card.style.display = card.innerText.toLowerCase().includes(value)
          ? ""
          : "none";
      });
    });

    ${isPlayground && OPTIONS ? `
      setTimeout(() => {
        const rulesFiles = ${JSON.stringify(rulesFiles)}
        const schemasFiles = ${JSON.stringify(schemasFiles)}

        const formElements = document.querySelectorAll('form[data-form]');
        formElements.forEach((formElement) => {
          formElement.addEventListener('submit', async (e) => {
            e.preventDefault();
            const inputElements = formElement.querySelectorAll('input, select');
            const formName = formElement.dataset.form.split('--')[1];
            const formData = {};
            inputElements.forEach((inputElement) => {
              formData[inputElement.name] = inputElement.value;
            })

            const validatorHelper = window.validatorHelpers[formData["check-rule-mate-validators"]][formData["check-rule-mate-validators"]];

            const rules = rulesFiles.filter((rulesFile) => rulesFile.name === formData["check-rule-mate-rules"])[0].content;
            const schema = schemasFiles.filter((schemaFile) => schemaFile.name === formName)[0].content;

            const validator = createValidator(formData, {validationHelpers: validatorHelper, rules: rules, schema: schema, options: { propertiesMustMatch: false, abortEarly: false, cache: true}});
            const result = await validator.validate();
            console.log(formName, result);

            const textAreaElement = document.querySelector('#textarea-schema-'+formName);
            textAreaElement.value = JSON.stringify(result);
          });
        });
      }, 1000);
    `: ''}
    `;
  }
}

module.exports = function docs(argv) {
  const args = parseArgs(argv);

  return generateDocs({
    rulesArg: args.rules,
    schemasArg: args.schemas,
    errorsArg: args.errors,
    optionsArg: args.options,
    outArg: args.out,
    commandArg: args.command
  });
}
