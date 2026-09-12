const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
function load(relative) {
  const filename = path.resolve(__dirname, '../src/features/catalog', relative + '.ts');
  const source = fs.readFileSync(filename, 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const module = { exports: {} };
  new Function('require', 'module', 'exports', compiled)((name) => load(name), module, module.exports);
  return module.exports;
}
const { attributesFromDetail, extraWriteValues, enumValuesForForm } = load('attributeValues');
const { validateAttributeValues } = load('attributeValidation');
test('read/edit/write preserves attributes and false flags and normalizes ratings to 1–5', () => {
  const details = { strength: 12.5, region: { code: 'marlborough', label: 'Мальборо' }, grapeComposition: [{ grape: { code: 'sauvignon_blanc', label: 'Совиньон блан' }, percent: 100 }], grapeCompositionComplete: true, sensoryProfile: { acidity: { value: 3, scaleMin: null, scaleMax: null, sourceId: 'SW-160429' } }, aging: { status: 'aged', durationMonths: { min: 36, max: null, minInclusive: false, maxInclusive: true }, vessels: null, description: null } };
  const result = extraWriteValues('wine', undefined, { extendedDetails: attributesFromDetail('wine', details), packaging: enumValuesForForm({ giftBox: false, type: null }) });
  assert.equal(result.extendedDetails.aging.durationMonths.minInclusive, false);
  assert.equal(result.packaging.giftBox, false);
  assert.equal(result.extendedDetails.sensoryProfile.acidity.scaleMin, 1);
  assert.equal(result.extendedDetails.sensoryProfile.acidity.scaleMax, 5);
  assert.equal(result.extendedDetails.grapeComposition[0].percent, 100);
  assert.deepEqual(validateAttributeValues(result), []);
});
test('empty optional blocks become null and explicit empty lists remain empty', () => {
  const result = extraWriteValues('wine', undefined, { extendedDetails: { region: undefined, aging: { description: ' ' }, aromaTags: [] } });
  assert.equal(result.extendedDetails.aging, null);
  assert.deepEqual(result.extendedDetails.aromaTags, []);
  assert.equal(extraWriteValues('wine', undefined, {}).extendedDetails, null);
});
test('changing spirit subtype excludes the previous subtype', () => {
  const result = extraWriteValues('spirit', 'Коньяк', { extendedDetails: { whiskyDetails: { ageStatementStatus: 'nas' }, cognacDetails: { ageStatementYears: 3 } } });
  assert.equal(result.extendedDetails.whiskyDetails, undefined);
  assert.equal(result.extendedDetails.cognacDetails.ageStatementYears, 3);
});
test('rejects partial ranges, inconsistent vintages and incomplete rating sources', () => {
  const invalid = { extendedDetails: { vintageStatus: 'non_vintage', productionYear: 2025, servingTemperature: { min: 20, max: 10 }, sensoryProfile: { acidity: { value: 6, scaleMin: 1, scaleMax: 5, sourceId: null } } } };
  const issues = validateAttributeValues(invalid);
  assert.ok(issues.some(item => item.name.join('.') === 'extendedDetails.vintageStatus'));
  assert.ok(issues.some(item => item.name.join('.').endsWith('acidity.sourceId')));
  assert.ok(issues.some(item => item.name.join('.').endsWith('acidity.value')));
  assert.ok(issues.some(item => item.name.join('.').endsWith('servingTemperature.max')));
});
test('rejects missing composition for complete flag and duplicate rows', () => {
  assert.ok(validateAttributeValues({ extendedDetails: { grapeComposition: null, grapeCompositionComplete: true } }).length);
  assert.ok(validateAttributeValues({ extendedDetails: { grapeComposition: [{ grape: { code: 'a' }, percent: 50 }, { grape: { code: 'a' }, percent: 50 }] } }).length);
});
