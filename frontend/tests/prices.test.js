import test from 'node:test';
import assert from 'node:assert/strict';
import { parsePrice } from '../src/utils/prices.js';

test('conversion exacte des prix et limites', () => {
  for (const [input, expected] of [['0', 0], ['0,29', 29], ['15.5', 1550], ['10000000', 1000000000]]) {
    assert.equal(parsePrice(input), expected);
  }
  for (const input of ['', '-1', '1.001', 'NaN', '1e3', '10000000.01']) {
    assert.throws(() => parsePrice(input));
  }
});
