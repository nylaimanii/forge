import { writable } from 'svelte/store';

export type DemoField = { id: string; name: string; type: string; nullable: boolean; position: number; };
export type DemoTable = { id: string; name: string; position_x: number; position_y: number; fields: DemoField[]; };
export type DemoProject = { id: string; name: string; color: string; };
export type DemoRow = Record<string, unknown>;
export type DemoQueryHistory = { id: string; question: string; sql: string; };
export type DemoData = {
  projects: DemoProject[];
  tables: DemoTable[];
  rows: DemoRow[];
  queryHistory: DemoQueryHistory[];
};

function makeInitial(): DemoData {
  return {
    projects: [
      { id: 'demo-1', name: 'Pokédex DB',    color: '#4f8ef7' },
      { id: 'demo-2', name: 'E-Commerce',    color: '#22d3a5' },
      { id: 'demo-3', name: 'Blog Platform', color: '#f59e0b' },
    ],
    tables: [
      {
        id: 'table-pokemon', name: 'pokemon', position_x: 60, position_y: 80,
        fields: [
          { id: 'f1', name: 'id',      type: 'INTEGER', nullable: false, position: 0 },
          { id: 'f2', name: 'name',    type: 'TEXT',    nullable: false, position: 1 },
          { id: 'f3', name: 'type',    type: 'TEXT',    nullable: false, position: 2 },
          { id: 'f4', name: 'hp',      type: 'INTEGER', nullable: false, position: 3 },
          { id: 'f5', name: 'attack',  type: 'INTEGER', nullable: false, position: 4 },
          { id: 'f6', name: 'defense', type: 'INTEGER', nullable: false, position: 5 },
        ],
      },
      {
        id: 'table-trainers', name: 'trainers', position_x: 420, position_y: 100,
        fields: [
          { id: 'f7',  name: 'id',          type: 'INTEGER', nullable: false, position: 0 },
          { id: 'f8',  name: 'name',         type: 'TEXT',    nullable: false, position: 1 },
          { id: 'f9',  name: 'region',       type: 'TEXT',    nullable: true,  position: 2 },
          { id: 'f10', name: 'badge_count',  type: 'INTEGER', nullable: false, position: 3 },
        ],
      },
    ],
    rows: [
      { id: 1, name: 'Bulbasaur',  type: 'Grass/Poison', hp: 45,  attack: 49,  defense: 49 },
      { id: 2, name: 'Charmander', type: 'Fire',         hp: 39,  attack: 52,  defense: 43 },
      { id: 3, name: 'Squirtle',   type: 'Water',        hp: 44,  attack: 48,  defense: 65 },
      { id: 4, name: 'Pikachu',    type: 'Electric',     hp: 35,  attack: 55,  defense: 40 },
      { id: 5, name: 'Eevee',      type: 'Normal',       hp: 55,  attack: 55,  defense: 50 },
      { id: 6, name: 'Snorlax',    type: 'Normal',       hp: 160, attack: 110, defense: 65 },
      { id: 7, name: 'Gengar',     type: 'Ghost/Poison', hp: 60,  attack: 65,  defense: 60 },
      { id: 8, name: 'Mewtwo',     type: 'Psychic',      hp: 106, attack: 110, defense: 90 },
    ],
    queryHistory: [
      { id: 'q1', question: 'Show all pokemon with HP over 100', sql: 'SELECT * FROM pokemon WHERE hp > 100 ORDER BY hp DESC;' },
      { id: 'q2', question: 'Count pokemon by type',             sql: 'SELECT type, COUNT(*) AS count FROM pokemon GROUP BY type ORDER BY count DESC;' },
    ],
  };
}

export const isDemoMode = writable(false);
export const demoData = writable<DemoData>(makeInitial());
