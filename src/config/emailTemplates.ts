// src/config/emailTemplates.ts
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';

const compileTemplate = (templateName: string, data: object): string => {
  const filePath = path.join(__dirname, '../templates', `${templateName}.hbs`);
  const source = fs.readFileSync(filePath, 'utf8').toString();
  const template = handlebars.compile(source);
  return template(data);
};

export { compileTemplate };
