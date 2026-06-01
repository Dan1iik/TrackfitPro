/**
 * classes.ts – Hierarchie tříd (logická vrstva)
 * ------------------------------------------------------------
 * Obsahuje jednu abstraktní bázovou třídu (Activity) a tři konkrétní
 * potomky (CardioActivity, StrengthActivity, IntervalActivity).
 * Každý potomek přepisuje (override) abstraktní výpočetní metody
 * vlastní implementací – základ pro polymorfismus v main.ts.
 *
 * Použité OOP principy:
 *  - Abstrakce    : Activity definuje kontrakt (abstract metody)
 *  - Zapouzdření  : vstupní hodnoty jsou private + validace v konstruktoru
 *  - Dědičnost    : potomci dědí společné atributy a gettery z Activity
 *  - Polymorfismus: stejné volání metody, různá implementace dle typu
 */

import { ActivityData } from './data';

/** Pomocná funkce – vygeneruje jednoduchý unikátní identifikátor (UUID). */
function generateId(): string {
  // crypto.randomUUID je dostupné v moderních prohlížečích i v Node.js;
  // fallback zajistí funkčnost i ve starších prostředích.
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
}

/**
 * Abstraktní bázová třída – ACTIVITY
 * ------------------------------------------------------------
 * Definuje společný kontrakt pro všechny typy aktivit. Konkrétní výpočty
 * (kalorie, skóre, souhrn) jsou abstraktní – potomek je MUSÍ implementovat.
 * Sdílenou logiku (gettery, formátování data) implementuje rovnou zde.
 */
export abstract class Activity {
  private readonly id: string;        // soukromé UUID – přístup jen přes getId()
  protected name: string;             // název aktivity (z číselníku)
  protected date: Date;               // datum a čas záznamu
  protected userWeightKg: number;     // hmotnost uživatele pro výpočet kalorií
  protected metCoefficient: number;   // MET koeficient aktivity (z číselníku)

  constructor(name: string, userWeightKg: number, metCoefficient: number) {
    // --- Validace dat: objekt nesmí vzniknout s chybnými hodnotami ---
    if (!name || name.trim().length === 0) {
      throw new Error('Activity: název aktivity nesmí být prázdný.');
    }
    if (userWeightKg <= 0) {
      throw new Error('Activity: hmotnost uživatele musí být kladné číslo.');
    }
    if (metCoefficient <= 0) {
      throw new Error('Activity: MET koeficient musí být kladné číslo.');
    }

    this.id = generateId();
    this.name = name.trim();
    this.date = new Date();
    this.userWeightKg = userWeightKg;
    this.metCoefficient = metCoefficient;
  }

  // --- Abstraktní metody (kontrakt) – každý potomek musí přepsat ---

  /** Výpočet spálených kalorií (kcal). Implementace závisí na typu aktivity. */
  public abstract calculateCalories(): number;

  /** Výpočet tréninkového skóre v rozsahu 0–100. */
  public abstract calculateScore(): number;

  /** Textový souhrn aktivity pro výpis. */
  public abstract getSummary(): string;

  // --- Sdílené veřejné metody (společné pro všechny potomky) ---

  /** Getter pro privátní id. */
  public getId(): string {
    return this.id;
  }

  /** Getter pro chráněný název. */
  public getName(): string {
    return this.name;
  }

  /** Getter pro datum záznamu. */
  public getDate(): Date {
    return this.date;
  }

  /** Formátování data do čitelné podoby (DD.MM.RRRR HH:MM). */
  public formatDate(): string {
    const d = this.date;
    const pad = (n: number): string => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ` +
           `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}

/**
 * CARDIOACTIVITY – kardio (vytrvalostní) trénink
 * ------------------------------------------------------------
 * Výdej energie počítá pomocí MET vzorce. Skóre zohledňuje
 * průměrnou rychlost a délku tréninku.
 */
export class CardioActivity extends Activity {
  private distanceKm: number;       // vzdálenost v km (min. 0.1)
  private durationMinutes: number;  // délka tréninku v minutách (min. 1)

  constructor(
    name: string,
    userWeightKg: number,
    metCoefficient: number,
    distanceKm: number,
    durationMinutes: number,
  ) {
    super(name, userWeightKg, metCoefficient);

    // --- Validace specifických vstupů ---
    if (distanceKm < 0.1) {
      throw new Error('CardioActivity: vzdálenost musí být alespoň 0.1 km.');
    }
    if (durationMinutes < 1) {
      throw new Error('CardioActivity: délka tréninku musí být alespoň 1 minuta.');
    }

    this.distanceKm = distanceKm;
    this.durationMinutes = durationMinutes;
  }

  /** Kalorie = MET × hmotnost × čas[h]. */
  public calculateCalories(): number {
    const hours = this.durationMinutes / 60;
    return this.metCoefficient * this.userWeightKg * hours;
  }

  /** Skóre = (rychlost × 2) + bonus za délku, max 100. */
  public calculateScore(): number {
    const speedBonus = this.getAverageSpeed() * 2;
    const durationBonus = this.durationMinutes / 3;
    return Math.min(speedBonus + durationBonus, 100);
  }

  /** Průměrná rychlost v km/h. */
  public getAverageSpeed(): number {
    return this.distanceKm / (this.durationMinutes / 60);
  }

  /** Např.: "Běh: 10 km za 60 min, průměr 10.0 km/h". */
  public getSummary(): string {
    return `${this.name}: ${this.distanceKm} km za ${this.durationMinutes} min, ` +
           `průměr ${this.getAverageSpeed().toFixed(1)} km/h`;
  }
}

/**
 * STRENGTHACTIVITY – silový (anaerobní) trénink
 * ------------------------------------------------------------
 * Klíčovým konceptem je tréninkový objem (Volume Load).
 * Setter pro závaží navíc ošetřuje nevalidní hodnoty.
 */
export class StrengthActivity extends Activity {
  private sets: number;        // počet sérií (min. 1)
  private repsPerSet: number;  // počet opakování na sérii (min. 1)
  private weightKg: number;    // závaží v kg (min. 0 – vlastní váha)

  constructor(
    name: string,
    userWeightKg: number,
    metCoefficient: number,
    sets: number,
    repsPerSet: number,
    weightKg: number,
  ) {
    super(name, userWeightKg, metCoefficient);

    // --- Validace specifických vstupů ---
    if (sets < 1) {
      throw new Error('StrengthActivity: počet sérií musí být alespoň 1.');
    }
    if (repsPerSet < 1) {
      throw new Error('StrengthActivity: počet opakování musí být alespoň 1.');
    }

    this.sets = sets;
    this.repsPerSet = repsPerSet;
    this.weightKg = 0;
    this.setWeightKg(weightKg); // validace přes setter
  }

  /** Setter se zapouzdřenou validací – závaží nesmí být záporné. */
  public setWeightKg(value: number): void {
    if (value < 0) {
      throw new Error('StrengthActivity: závaží nesmí být záporné.');
    }
    this.weightKg = value;
  }

  /** Kalorie = objem × MET × 0.05 (empirická konstanta). */
  public calculateCalories(): number {
    return this.getVolumeLoad() * this.metCoefficient * 0.05;
  }

  /** Skóre = (objem / 1000) × 10, max 100. */
  public calculateScore(): number {
    return Math.min((this.getVolumeLoad() / 1000) * 10, 100);
  }

  /** Tréninkový objem = série × opakování × závaží [kg]. */
  public getVolumeLoad(): number {
    return this.sets * this.repsPerSet * this.weightKg;
  }

  /** Např.: "Bench press: 4×10 × 80 kg, objem 3200 kg". */
  public getSummary(): string {
    return `${this.name}: ${this.sets}×${this.repsPerSet} × ${this.weightKg} kg, ` +
           `objem ${this.getVolumeLoad()} kg`;
  }
}

/**
 * INTERVALACTIVITY – intervalový (HIIT) trénink
 * ------------------------------------------------------------
 * Výpočet probíhá na základě počtu kol a délek intervalů.
 * Koeficient intenzity (intensityFactor) zohledňuje zvýšené
 * spalování oproti běžnému kardiu.
 */
export class IntervalActivity extends Activity {
  private rounds: number;           // počet kol (min. 1)
  private workIntervalSec: number;  // délka pracovního intervalu (s)
  private restIntervalSec: number;  // délka odpočinkového intervalu (s)
  private intensityFactor: number;  // koeficient intenzity (1.2–1.4)

  constructor(
    name: string,
    userWeightKg: number,
    metCoefficient: number,
    rounds: number,
    workIntervalSec: number,
    restIntervalSec: number,
    intensityFactor: number,
  ) {
    super(name, userWeightKg, metCoefficient);

    // --- Validace specifických vstupů ---
    if (rounds < 1) {
      throw new Error('IntervalActivity: počet kol musí být alespoň 1.');
    }
    if (workIntervalSec <= 0) {
      throw new Error('IntervalActivity: pracovní interval musí být kladný.');
    }
    if (restIntervalSec < 0) {
      throw new Error('IntervalActivity: odpočinkový interval nesmí být záporný.');
    }
    if (intensityFactor <= 0) {
      throw new Error('IntervalActivity: koeficient intenzity musí být kladný.');
    }

    this.rounds = rounds;
    this.workIntervalSec = workIntervalSec;
    this.restIntervalSec = restIntervalSec;
    this.intensityFactor = intensityFactor;
  }

  /** Kalorie = MET × hmotnost × aktivní čas[h] × intensityFactor. */
  public calculateCalories(): number {
    const activeHours = this.getActiveTimeMin() / 60;
    return this.metCoefficient * this.userWeightKg * activeHours * this.intensityFactor;
  }

  /** Skóre = kola × (práce / (práce + odpočinek)) × 20, max 100. */
  public calculateScore(): number {
    const totalInterval = this.workIntervalSec + this.restIntervalSec;
    const workRatio = this.workIntervalSec / totalInterval;
    return Math.min(this.rounds * workRatio * 20, 100);
  }

  /** Celkový aktivní (pracovní) čas v minutách. */
  public getActiveTimeMin(): number {
    return (this.rounds * this.workIntervalSec) / 60;
  }

  /** Např.: "Tabata: 8 kol, 20s práce / 10s pauza". */
  public getSummary(): string {
    return `${this.name}: ${this.rounds} kol, ` +
           `${this.workIntervalSec}s práce / ${this.restIntervalSec}s pauza`;
  }
}
