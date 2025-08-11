import { vibesort } from '../vibesort/index.js';
import 'dotenv/config';

const input = [6, 2, 9, 1, 4];

console.log('[test] starting ai-sort with input:', input);

try {
  const result = await vibesort(input);

  console.log('[test] result:', result);

  const isSorted = result.every((val, i, arr) => i === 0 || arr[i - 1] <= val);
  console.log(`[test] is sorted correctly? ${isSorted ? 'yes' : 'no'}`);
} catch (err) {
  console.error('[test] error:', err.message);
}
