import assert from 'node:assert/strict';
import { resolveStartRoute } from '../src/systems/StartRoute.js';

assert.deepEqual(resolveStartRoute(''), { scene: 'IntroScene', data: undefined });
assert.deepEqual(resolveStartRoute('?map=memory_school'), { scene: 'GameScene', data: { mapId: 'memory_school' } });
assert.deepEqual(resolveStartRoute('?map=room_study&x=320&y=160'), { scene: 'GameScene', data: { mapId: 'room_study', x: 320, y: 160 } });
assert.deepEqual(resolveStartRoute('?map=missing_map'), { scene: 'IntroScene', data: undefined });

console.log('Start route verification passed');
