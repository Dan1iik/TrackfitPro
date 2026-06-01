/**
 * main.ts – Vstupní bod aplikace (Fáze 2: testování v konzoli)
 * ------------------------------------------------------------
 * V této fázi ještě nevytváříme HTML prvky. Funkčnost ověřujeme
 * výhradně výpisem do konzole. Demonstrujeme zde polymorfismus:
 * pole obsahuje MIX různých potomků třídy Activity a cyklus volá
 * stejné metody bez ohledu na konkrétní typ objektu.
 */

import { Activity } from './classes';
import { createActivity } from './factory';

// ------------------------------------------------------------
// 1) Sestavení deníku – pole smíšených typů aktivit.
//    Objekty "oživujeme" z číselníku přes factory (data -> instance).
// ------------------------------------------------------------
const userWeightKg = 78; // hmotnost uživatele pro výpočty

const diary: Activity[] = [
  createActivity('run',    userWeightKg, { distanceKm: 10, durationMinutes: 60 }),
  createActivity('bench',  userWeightKg, { sets: 4, repsPerSet: 10, weightKg: 80 }),
  createActivity('tabata', userWeightKg, { rounds: 8, workIntervalSec: 20, restIntervalSec: 10 }),
  createActivity('bike',   userWeightKg, { distanceKm: 25, durationMinutes: 50 }),
  createActivity('squat',  userWeightKg, { sets: 5, repsPerSet: 8, weightKg: 100 }),
];

// ------------------------------------------------------------
// 2) Polymorfní průchod – stejné volání, různá implementace.
//    Žádné if/switch podle typu: každý objekt zná svůj výpočet sám.
// ------------------------------------------------------------
console.log('=== TrackFit Pro – tréninkový deník ===\n');

let totalCalories = 0;
let totalScore = 0;

diary.forEach((activity: Activity, index: number) => {
  const calories = activity.calculateCalories(); // různý výpočet dle typu
  const score = activity.calculateScore();        // různý výpočet dle typu
  const summary = activity.getSummary();          // různý text dle typu

  totalCalories += calories;
  totalScore += score;

  console.log(`#${index + 1}  ${summary}`);
  console.log(`     Datum:   ${activity.formatDate()}`);
  console.log(`     Kalorie: ${calories.toFixed(1)} kcal`);
  console.log(`     Skóre:   ${score.toFixed(1)} / 100`);
  console.log('');
});

// ------------------------------------------------------------
// 3) Celkový denní přehled.
// ------------------------------------------------------------
const averageScore = diary.length > 0 ? totalScore / diary.length : 0;

console.log('--- Celkový denní přehled ---');
console.log(`Počet aktivit:      ${diary.length}`);
console.log(`Spálené kalorie:    ${totalCalories.toFixed(1)} kcal`);
console.log(`Průměrné skóre:     ${averageScore.toFixed(1)} / 100`);
console.log(`Hodnocení:          ${getMotivation(averageScore)}`);

/**
 * Motivační hodnocení na základě průměrného skóre.
 */
function getMotivation(score: number): string {
  if (score >= 70) return 'Výborně!';
  if (score >= 40) return 'Dobrá práce';
  return 'Pokračuj!';
}

// ------------------------------------------------------------
// 4) Ukázka validace – vytvoření objektu s chybnými daty selže.
// ------------------------------------------------------------
console.log('\n--- Test validace dat ---');
try {
  createActivity('run', userWeightKg, { distanceKm: -5, durationMinutes: 30 });
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.log(`Zachycena chyba (dle očekávání): ${message}`);
}
