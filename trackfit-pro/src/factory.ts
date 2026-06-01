/**
 * factory.ts – Most mezi datovou a logickou vrstvou
 * ------------------------------------------------------------
 * Obsahuje mechanismus "oživení objektů": z prostého záznamu
 * v číselníku (ActivityData) a uživatelských parametrů vytvoří
 * správnou instanci konkrétní třídy. Klientský kód tak nemusí
 * sám rozhodovat, kterou třídu instancovat.
 */

import { ACTIVITIES, ActivityData } from './data';
import {
  Activity,
  CardioActivity,
  StrengthActivity,
  IntervalActivity,
} from './classes';

/** Parametry zadané uživatelem pro jednotlivé typy aktivit. */
export interface CardioParams {
  distanceKm: number;
  durationMinutes: number;
}
export interface StrengthParams {
  sets: number;
  repsPerSet: number;
  weightKg: number;
}
export interface IntervalParams {
  rounds: number;
  workIntervalSec: number;
  restIntervalSec: number;
}
export type ActivityParams = CardioParams | StrengthParams | IntervalParams;

/**
 * Vyhledá záznam v číselníku podle id a vytvoří odpovídající instanci.
 * @param activityId   id aktivity z číselníku (např. 'run')
 * @param userWeightKg hmotnost uživatele v kg
 * @param params       parametry specifické pro daný typ aktivity
 */
export function createActivity(
  activityId: string,
  userWeightKg: number,
  params: ActivityParams,
): Activity {
  const data: ActivityData | undefined = ACTIVITIES.find((a) => a.id === activityId);
  if (!data) {
    throw new Error(`createActivity: aktivita s id "${activityId}" nebyla v číselníku nalezena.`);
  }

  // Podle typu z číselníku vytvoříme správného potomka třídy Activity.
  switch (data.type) {
    case 'cardio': {
      const p = params as CardioParams;
      return new CardioActivity(
        data.name,
        userWeightKg,
        data.metCoefficient,
        p.distanceKm,
        p.durationMinutes,
      );
    }
    case 'strength': {
      const p = params as StrengthParams;
      return new StrengthActivity(
        data.name,
        userWeightKg,
        data.metCoefficient,
        p.sets,
        p.repsPerSet,
        p.weightKg,
      );
    }
    case 'interval': {
      const p = params as IntervalParams;
      // intensityFactor je u typu 'interval' v číselníku vždy přítomen
      const intensity = data.intensityFactor ?? 1.2;
      return new IntervalActivity(
        data.name,
        userWeightKg,
        data.metCoefficient,
        p.rounds,
        p.workIntervalSec,
        p.restIntervalSec,
        intensity,
      );
    }
    default:
      // Pojistka pro případ rozšíření číselníku o neznámý typ.
      throw new Error(`createActivity: neznámý typ aktivity.`);
  }
}
