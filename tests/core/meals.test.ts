import assert from 'node:assert/strict';
import test from 'node:test';
import { mealCatalog, previewMeal } from '../../src/core/meals';

test('cooked chicken, turkey breast and salmon bowls include rice, vegetables and measured oil', () => {
  const chicken = previewMeal({ id: 'chicken-bowl' }), turkey = previewMeal({ id: 'turkey-bowl' }), salmon = previewMeal({ id: 'salmon-bowl' });
  assert.ok(chicken.nutrients.calories > 580 && chicken.nutrients.calories < 605);
  assert.ok(chicken.nutrients.protein > 61 && chicken.nutrients.protein < 64);
  assert.ok(turkey.nutrients.calories < chicken.nutrients.calories);
  assert.ok(salmon.nutrients.fat > chicken.nutrients.fat);
  assert.ok(salmon.nutrients.protein < chicken.nutrients.protein);
  assert.deepEqual(chicken.ingredients.map(i => i.grams), [170, 150, 200, 5, 15]);
  assert.match(chicken.ingredients[0].name, /cooked/);
  assert.match(turkey.ingredients[0].name, /breast/);
});
test('individual cooked portions scale from reference weight without changing other ingredients', () => {
  const a = previewMeal({ id: 'chicken-bowl' }), b = previewMeal({ id: 'chicken-bowl', amounts: { chicken: 85, oil: 0 } });
  assert.equal(b.ingredients[1].grams, 150);
  assert.ok(Math.abs(a.nutrients.protein - b.nutrients.protein - 26.367) < 0.11);
  assert.ok(Math.abs(a.nutrients.calories - b.nutrients.calories - (140.25 + 42.5)) < 1);
});
test('chia water counts calories and fiber, keeps water separate and has no detox claim', () => {
  const drink = previewMeal({ id: 'lemon-chia' });
  assert.equal(drink.waterMl, 350);
  assert.ok(drink.nutrients.calories >= 27 && drink.nutrients.calories <= 30);
  assert.ok(drink.nutrients.fiber > 1.7);
  assert.match(drink.food.notes, /water.*separately/i);
  assert.match(mealCatalog.guidance.join(' '), /not a full day/i);
  assert.match(mealCatalog.recipes.find(r => r.id === 'lemon-chia')!.guidance, /soak|gel/i);
});
test('food drafts retain weighed portions and clickable source provenance without assigning a date or XP', () => {
  for (const recipe of mealCatalog.recipes) {
    const p = previewMeal({ id: recipe.id });
    assert.equal(p.food.source, 'estimate');
    assert.ok(p.food.notes.length <= 2000);
    assert.match(p.food.notes, /2026-10-04/);
    assert.ok(p.ingredients.every(i => i.source.url.startsWith('https://') && i.referenceGrams > 0));
    assert.equal(Object.hasOwn(p.food, 'date'), false);
    assert.equal(Object.hasOwn(p.food, 'xp'), false);
  }
});
test('invalid recipes and quantity overrides cannot silently fall back or alter unrelated foods', () => {
  for (const input of [null, [], {id:'unknown'}, {id:'toString'}, {id:'chicken-bowl', amounts:{salmon:170}}, {id:'chicken-bowl',amounts:{chicken:0}}, {id:'chicken-bowl', amounts:{oil:-1}}, {id:'chicken-bowl',amounts:{rice:Infinity}}, {id:'chicken-bowl',amounts:{rice:'150'}}, {id:'lemon-chia',amounts:{chia:1000}}, {id:'chicken-bowl',calories:100}, {id:'lemon-water',waterMl:1}]) {
    assert.throws(() => previewMeal(input));
  }
});
