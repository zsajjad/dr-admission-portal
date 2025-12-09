const path = require('path');

const fg = require('fast-glob');
const fs = require('fs-extra');
const { Project, SyntaxKind } = require('ts-morph');

const LOCALE_PATH = path.resolve(__dirname, './src/translations/ur.json');

(async function syncTranslations() {
  const project = new Project();
  const files = await fg(['./src/**/messages.ts']);

  let urTranslations = {};
  if (fs.existsSync(LOCALE_PATH)) {
    urTranslations = await fs.readJSON(LOCALE_PATH);
  }

  for (const file of files) {
    const source = project.addSourceFileAtPath(file);

    // Get scope variable
    const scopeDecl = source.getVariableDeclaration('scope');
    const scopeInit = scopeDecl?.getInitializer();
    const scope = scopeInit?.getText()?.replace(/['"`]/g, '');

    if (!scope) continue;

    // Find defineMessages call
    const defaultExport = source.getExportAssignment(
      (exp) => exp.getExpression().getExpression?.().getText() === 'defineMessages',
    );

    if (!defaultExport) continue;

    const obj = defaultExport.getExpression().getArguments?.()[0];
    if (!obj || obj.getKind() !== SyntaxKind.ObjectLiteralExpression) continue;

    const props = obj.getProperties();
    for (const prop of props) {
      if (prop.getKind() !== SyntaxKind.PropertyAssignment) continue;

      const key = prop.getName();
      const fullKey = `${scope}.${key}`;
      if (!urTranslations[fullKey]) {
        const msgObj = prop.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression);
        const defaultMessageProp = msgObj?.getProperty('defaultMessage');

        if (defaultMessageProp && defaultMessageProp.getKind() === SyntaxKind.PropertyAssignment) {
          const defaultMessage = defaultMessageProp.getInitializer()?.getText()?.replace(/['"`]/g, '');
          urTranslations[fullKey] = defaultMessage || '';
        } else {
          urTranslations[fullKey] = '';
        }
      }
    }
  }

  await fs.ensureFile(LOCALE_PATH);
  await fs.writeJSON(LOCALE_PATH, urTranslations, { spaces: 2 });
  console.log('✅ ur.json synced.');
})();
