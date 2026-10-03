import test from 'node:test';
import assert from 'node:assert/strict';
import { progressAt, sceneAt, chooseMode, damp, seekTime, cameraAt, BOUNDS } from '../tour-model.mjs';

test('rubber-band scrolling and a zero scroll range never escape the tour', () => {
  assert.equal(progressAt(-40, 1000), 0);
  assert.equal(progressAt(2000, 1000), 1);
  assert.equal(progressAt(500, 1000), 0.5);
  assert.equal(progressAt(0, 0), 0);
});
test('phones and touch devices keep the full video tour by default', () => {
  assert.equal(chooseMode({width:390,coarse:false}), 'video');
  assert.equal(chooseMode({width:390,coarse:true}), 'video');
  assert.equal(chooseMode({width:1024,coarse:true}), 'video');
  assert.equal(chooseMode({width:1440}), 'video');
});
test('explicit data-saving and reduced-motion preferences retain their fallbacks', () => {
  assert.equal(chooseMode({width:1440,saveData:true}), 'world');
  assert.equal(chooseMode({width:390,coarse:true,saveData:true}), 'world');
  assert.equal(chooseMode({width:1440,reduced:true}), 'reading');
});
test('the tour starts at the empty shell and ends on the rooftop', () => {
  assert.deepEqual([sceneAt(0).from,sceneAt(0).to], [0,0]);
  assert.equal(sceneAt(1).index,19);
  assert.deepEqual([sceneAt(1).from,sceneAt(1).to], [7,7]);
});
test('leaving the tool room returns to the tower before the next floor', () => {
  const scene=sceneAt(0.38);
  assert.equal(scene.from,3);
  assert.equal(scene.to,2);
  assert.ok(scene.mix>0 && scene.mix<1);
});
test('smoothing has the same speed on 60 Hz and 120 Hz screens', () => {
  const once=damp(0,1,1/60);
  const twice=damp(damp(0,1,1/120),1,1/120);
  assert.ok(Math.abs(once-twice)<1e-10);
});
test('video seeking never requests past the final decodable frame', () => {
  assert.equal(seekTime(8,8),7.96);
  assert.equal(seekTime(-1,8),0);
  assert.equal(seekTime(2,NaN),null);
});
test('the visible camera does not jump across any scene boundary', () => {
  for(const {a} of BOUNDS.slice(1)) {
    const before=sceneAt(a-1e-9), after=sceneAt(a+1e-9);
    assert.equal(before.to,after.from);
    const end=cameraAt(before,before.to), start=cameraAt(after,after.from);
    assert.ok(Math.abs(end.scale-start.scale)<1e-5,`Scale jumps at scene ${after.index}`);
    assert.ok(Math.abs(end.y-start.y)<1e-5,`Position jumps at scene ${after.index}`);
  }
});
