/**
 * data.ts – Datový číselník aktivit
 * ------------------------------------------------------------
 * Tento soubor obsahuje POUZE data (žádnou logiku). Jde o katalog
 * dostupných sportovních aktivit s jejich metabolickými koeficienty.
 * Datová vrstva je tak zcela oddělena od logiky tříd (classes.ts).
 * Aplikace tento číselník čte při inicializaci a na jeho základě
 * "oživuje" objekty – vytváří instance konkrétních tříd.
 */

/** Typ aktivity – určuje, jaká třída se má pro daný záznam vytvořit. */
export type ActivityType = 'cardio' | 'strength' | 'interval';

/** Předpis jednoho "surového" záznamu v číselníku. */
export interface ActivityData {
  id: string;                 // jednoznačný klíč aktivity (např. 'run')
  name: string;               // zobrazovaný název (např. 'Běh')
  type: ActivityType;         // typ -> rozhoduje o vytvořené třídě
  metCoefficient: number;     // metabolický ekvivalent (MET)
  intensityFactor?: number;   // koeficient intenzity – pouze pro typ 'interval'
  description: string;        // krátký popis aktivity
}

/** Katalog všech dostupných aktivit. */
export const ACTIVITIES: ActivityData[] = [
  // --- Kardio aktivity (výdej dle MET × hmotnost × čas) ---
  { id: 'run',   name: 'Běh',         type: 'cardio',   metCoefficient: 9.8, description: 'Vytrvalostní běh v mírném až svižném tempu.' },
  { id: 'swim',  name: 'Plavání',     type: 'cardio',   metCoefficient: 8.3, description: 'Plavání jako celotělová vytrvalostní aktivita.' },
  { id: 'bike',  name: 'Cyklistika',  type: 'cardio',   metCoefficient: 7.5, description: 'Jízda na kole v rovinatém terénu.' },

  // --- Silové aktivity (výdej dle objemu tréninku) ---
  { id: 'bench', name: 'Bench press', type: 'strength', metCoefficient: 5.0, description: 'Tlak na lavici – prsa, triceps, ramena.' },
  { id: 'squat', name: 'Dřepy',       type: 'strength', metCoefficient: 5.5, description: 'Dřepy s činkou – komplexní cvik na dolní končetiny.' },

  // --- Intervalové (HIIT) aktivity (výdej dle aktivního času a intenzity) ---
  { id: 'tabata', name: 'Tabata',     type: 'interval', metCoefficient: 8.0, intensityFactor: 1.35, description: 'Klasický protokol 20s práce / 10s pauza.' },
  { id: 'hiit',   name: 'HIIT okruhy', type: 'interval', metCoefficient: 7.5, intensityFactor: 1.25, description: 'Vysoce intenzivní intervalové okruhy.' },
];
