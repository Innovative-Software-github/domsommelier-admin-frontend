const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const compiled = ts.transpileModule(fs.readFileSync(path.resolve(__dirname, '../src/features/wineStores/stockDrafts.ts'), 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const loaded = { exports: {} };
new Function('module', 'exports', compiled)(loaded, loaded.exports);
const { saveStockChanges, isStockQuantity } = loaded.exports;

test('bulk save includes hidden drafts, accepts zero, retains only failed items for retry', async () => {
  const drafts = { wine: { name: 'Вино', quantity: 0 }, spirit: { name: 'Виски', quantity: 5 }, snack: { name: 'Сыр', quantity: 3 } };
  const calls = [];
  const result = await saveStockChanges(Object.entries(drafts), async (id, quantity) => {
    calls.push([id, quantity]);
    if (id === 'spirit') throw new Error('Нет связи');
    return quantity;
  }, (id) => { delete drafts[id]; });
  assert.deepEqual(calls, [['wine', 0], ['spirit', 5], ['snack', 3]]);
  assert.equal(result.saved, 2);
  assert.deepEqual(result.failed, [{ productId: 'spirit', name: 'Виски', error: 'Нет связи' }]);
  assert.deepEqual(Object.keys(drafts), ['spirit']);
  const retry = await saveStockChanges(Object.entries(drafts), async (id, quantity) => {
    assert.equal(id, 'spirit'); return quantity;
  }, (id) => { delete drafts[id]; });
  assert.equal(retry.saved, 1);
  assert.deepEqual(drafts, {});
});

test('invalid quantities never reach the API', async () => {
  const invalid = [null, -1, 1.5, NaN, Infinity, 2147483648];
  invalid.forEach(value => assert.equal(isStockQuantity(value), false));
  const result = await saveStockChanges(invalid.map((quantity, index) => [String(index), { name: 'Товар', quantity }]),
    async () => assert.fail('must not send invalid quantity'), () => assert.fail('must not remove invalid draft'));
  assert.equal(result.saved, 0);
  assert.equal(result.failed.length, invalid.length);
});
