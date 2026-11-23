import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { products } from '../lib/catalog';
import { createProductModel, MODEL_REFS } from '../lib/procedural-models';
import { Mesh } from 'three';
import { frequency, keys, majorIntervals, minorIntervals, noteMidi, noteNames, progressions } from '../lib/music-theory';

describe('modelos 3D procedurales del catálogo', () => {
  it('asocia cada una de las 15 fichas a una geometría registrada', () => {
    assert.equal(products.length, 15);
    assert.equal(new Set(products.map((product) => product.modelRef)).size, 15);
    for (const product of products) assert.ok(MODEL_REFS.includes(product.modelRef as typeof MODEL_REFS[number]), `${product.id}: modelo ausente`);
  });
  it('construye mallas 3D reales para cada familia sin WebGL', () => {
    for (const ref of MODEL_REFS) {
      const model = createProductModel(ref); const meshes: Mesh[] = [];
      model.traverse((child) => { if (child instanceof Mesh) meshes.push(child); });
      assert.ok(meshes.length > 0, `${ref}: sin malla`);
      assert.ok(meshes.every((mesh) => mesh.geometry.attributes.position && mesh.geometry.attributes.position.count > 0), `${ref}: geometría vacía`);
      for (const mesh of meshes) { mesh.geometry.dispose(); for (const material of Array.isArray(mesh.material) ? mesh.material : [mesh.material]) material.dispose(); }
    }
  });
});

describe('escalas y audio de demostración', () => {
  it('incluye notas naturales, alteradas y equivalencias escritas', () => {
    for (const note of ['C','D','E','F','G','A','B','C♯','D♯','E♯','F♯','G♯','A♯','B♯']) assert.ok(noteNames.includes(note));
    assert.equal(frequency(noteMidi['E♯']), frequency(noteMidi.F));
    assert.equal(frequency(noteMidi['B♯']), frequency(noteMidi.C) * 2);
  });
  it('presenta siete grados de escala mayor y menor en doce tonalidades', () => {
    assert.equal(keys.length, 12);
    for (const key of keys) { assert.equal(key.major.length, 7); assert.equal(key.minor.length, 7); }
    assert.deepEqual(majorIntervals, [0,2,4,5,7,9,11]); assert.deepEqual(minorIntervals, [0,2,3,5,7,8,10]);
  });
  it('incluye las dos progresiones solicitadas con cuatro triadas cada una', () => {
    assert.deepEqual(progressions.map((item) => item.label), ['C – G – Am – F', 'G – D – Em – C']);
    assert.ok(progressions.every((item) => item.chords.length === 4 && item.chords.every((chord) => chord.length === 3)));
  });
});
