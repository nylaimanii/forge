import { writable } from 'svelte/store';

export type DemoField = { id: string; name: string; type: string; nullable: boolean; position: number; };
export type DemoTable = { id: string; projectId: string; name: string; position_x: number; position_y: number; fields: DemoField[]; };
export type DemoProject = { id: string; name: string; color: string; };
export type DemoRow = Record<string, unknown>;
export type DemoQueryHistory = { id: string; projectId: string; question: string; sql: string; };

export type DemoData = {
  projects: DemoProject[];
  tables: DemoTable[];
  rowsByProject: Record<string, DemoRow[]>;
  queryHistoryByProject: Record<string, DemoQueryHistory[]>;
};

function makeInitial(): DemoData {
  return {
    projects: [
      { id: 'demo-1', name: 'Pokédex DB',    color: '#4f8ef7' },
      { id: 'demo-2', name: 'E-Commerce',    color: '#22d3a5' },
      { id: 'demo-3', name: 'Blog Platform', color: '#f59e0b' },
    ],

    tables: [
      // ── POKÉDEX DB ──────────────────────────────────────────────────────
      {
        id: 'tbl-pokemon', projectId: 'demo-1', name: 'pokemon',
        position_x: 60, position_y: 80,
        fields: [
          { id: 'p1', name: 'id',      type: 'INTEGER', nullable: false, position: 0 },
          { id: 'p2', name: 'name',    type: 'TEXT',    nullable: false, position: 1 },
          { id: 'p3', name: 'type',    type: 'TEXT',    nullable: false, position: 2 },
          { id: 'p4', name: 'hp',      type: 'INTEGER', nullable: false, position: 3 },
          { id: 'p5', name: 'attack',  type: 'INTEGER', nullable: false, position: 4 },
          { id: 'p6', name: 'defense', type: 'INTEGER', nullable: false, position: 5 },
          { id: 'p7', name: 'speed',   type: 'INTEGER', nullable: false, position: 6 },
        ],
      },
      {
        id: 'tbl-trainers', projectId: 'demo-1', name: 'trainers',
        position_x: 420, position_y: 80,
        fields: [
          { id: 't1', name: 'id',         type: 'INTEGER', nullable: false, position: 0 },
          { id: 't2', name: 'name',        type: 'TEXT',    nullable: false, position: 1 },
          { id: 't3', name: 'region',      type: 'TEXT',    nullable: true,  position: 2 },
          { id: 't4', name: 'badge_count', type: 'INTEGER', nullable: false, position: 3 },
          { id: 't5', name: 'rival',       type: 'TEXT',    nullable: true,  position: 4 },
        ],
      },

      // ── E-COMMERCE ──────────────────────────────────────────────────────
      {
        id: 'tbl-products', projectId: 'demo-2', name: 'products',
        position_x: 60, position_y: 80,
        fields: [
          { id: 'pr1', name: 'id',       type: 'INTEGER', nullable: false, position: 0 },
          { id: 'pr2', name: 'name',     type: 'TEXT',    nullable: false, position: 1 },
          { id: 'pr3', name: 'category', type: 'TEXT',    nullable: false, position: 2 },
          { id: 'pr4', name: 'price',    type: 'FLOAT',   nullable: false, position: 3 },
          { id: 'pr5', name: 'stock',    type: 'INTEGER', nullable: false, position: 4 },
          { id: 'pr6', name: 'rating',   type: 'FLOAT',   nullable: true,  position: 5 },
        ],
      },
      {
        id: 'tbl-customers', projectId: 'demo-2', name: 'customers',
        position_x: 380, position_y: 60,
        fields: [
          { id: 'cu1', name: 'id',            type: 'INTEGER', nullable: false, position: 0 },
          { id: 'cu2', name: 'name',           type: 'TEXT',    nullable: false, position: 1 },
          { id: 'cu3', name: 'email',          type: 'TEXT',    nullable: false, position: 2 },
          { id: 'cu4', name: 'city',           type: 'TEXT',    nullable: true,  position: 3 },
          { id: 'cu5', name: 'total_orders',   type: 'INTEGER', nullable: false, position: 4 },
          { id: 'cu6', name: 'lifetime_value', type: 'FLOAT',   nullable: true,  position: 5 },
        ],
      },
      {
        id: 'tbl-orders', projectId: 'demo-2', name: 'orders',
        position_x: 700, position_y: 140,
        fields: [
          { id: 'or1', name: 'id',          type: 'INTEGER', nullable: false, position: 0 },
          { id: 'or2', name: 'customer_id', type: 'INTEGER', nullable: false, position: 1 },
          { id: 'or3', name: 'product_id',  type: 'INTEGER', nullable: false, position: 2 },
          { id: 'or4', name: 'quantity',    type: 'INTEGER', nullable: false, position: 3 },
          { id: 'or5', name: 'total_price', type: 'FLOAT',   nullable: false, position: 4 },
          { id: 'or6', name: 'status',      type: 'TEXT',    nullable: false, position: 5 },
        ],
      },

      // ── BLOG PLATFORM ────────────────────────────────────────────────────
      {
        id: 'tbl-posts', projectId: 'demo-3', name: 'posts',
        position_x: 60, position_y: 80,
        fields: [
          { id: 'bp1', name: 'id',         type: 'INTEGER', nullable: false, position: 0 },
          { id: 'bp2', name: 'title',      type: 'TEXT',    nullable: false, position: 1 },
          { id: 'bp3', name: 'author',     type: 'TEXT',    nullable: false, position: 2 },
          { id: 'bp4', name: 'category',   type: 'TEXT',    nullable: true,  position: 3 },
          { id: 'bp5', name: 'views',      type: 'INTEGER', nullable: false, position: 4 },
          { id: 'bp6', name: 'published',  type: 'BOOLEAN', nullable: false, position: 5 },
          { id: 'bp7', name: 'created_at', type: 'TEXT',    nullable: false, position: 6 },
        ],
      },
      {
        id: 'tbl-authors', projectId: 'demo-3', name: 'authors',
        position_x: 380, position_y: 60,
        fields: [
          { id: 'au1', name: 'id',         type: 'INTEGER', nullable: false, position: 0 },
          { id: 'au2', name: 'name',       type: 'TEXT',    nullable: false, position: 1 },
          { id: 'au3', name: 'email',      type: 'TEXT',    nullable: false, position: 2 },
          { id: 'au4', name: 'followers',  type: 'INTEGER', nullable: false, position: 3 },
          { id: 'au5', name: 'post_count', type: 'INTEGER', nullable: false, position: 4 },
        ],
      },
      {
        id: 'tbl-comments', projectId: 'demo-3', name: 'comments',
        position_x: 700, position_y: 160,
        fields: [
          { id: 'co1', name: 'id',          type: 'INTEGER', nullable: false, position: 0 },
          { id: 'co2', name: 'post_id',     type: 'INTEGER', nullable: false, position: 1 },
          { id: 'co3', name: 'author_name', type: 'TEXT',    nullable: false, position: 2 },
          { id: 'co4', name: 'body',        type: 'TEXT',    nullable: false, position: 3 },
          { id: 'co5', name: 'likes',       type: 'INTEGER', nullable: false, position: 4 },
        ],
      },
    ],

    rowsByProject: {
      'demo-1': [
        { id: 1,  name: 'Bulbasaur',  type: 'Grass/Poison',  hp: 45,  attack: 49,  defense: 49,  speed: 45  },
        { id: 2,  name: 'Charmander', type: 'Fire',          hp: 39,  attack: 52,  defense: 43,  speed: 65  },
        { id: 3,  name: 'Squirtle',   type: 'Water',         hp: 44,  attack: 48,  defense: 65,  speed: 43  },
        { id: 4,  name: 'Pikachu',    type: 'Electric',      hp: 35,  attack: 55,  defense: 40,  speed: 90  },
        { id: 5,  name: 'Eevee',      type: 'Normal',        hp: 55,  attack: 55,  defense: 50,  speed: 55  },
        { id: 6,  name: 'Snorlax',    type: 'Normal',        hp: 160, attack: 110, defense: 65,  speed: 30  },
        { id: 7,  name: 'Gengar',     type: 'Ghost/Poison',  hp: 60,  attack: 65,  defense: 60,  speed: 110 },
        { id: 8,  name: 'Mewtwo',     type: 'Psychic',       hp: 106, attack: 110, defense: 90,  speed: 130 },
        { id: 9,  name: 'Lucario',    type: 'Fight/Steel',   hp: 70,  attack: 110, defense: 70,  speed: 90  },
        { id: 10, name: 'Garchomp',   type: 'Dragon/Ground', hp: 108, attack: 130, defense: 95,  speed: 102 },
      ],
      'demo-2': [
        { id: 1,  name: 'Wireless Headphones',     category: 'Electronics', price: 79.99,  stock: 143, rating: 4.7 },
        { id: 2,  name: 'Mechanical Keyboard',     category: 'Electronics', price: 129.00, stock: 89,  rating: 4.9 },
        { id: 3,  name: 'Ergonomic Mouse',         category: 'Electronics', price: 59.99,  stock: 212, rating: 4.5 },
        { id: 4,  name: 'Standing Desk',           category: 'Furniture',   price: 399.00, stock: 34,  rating: 4.6 },
        { id: 5,  name: 'Laptop Stand',            category: 'Accessories', price: 39.99,  stock: 301, rating: 4.3 },
        { id: 6,  name: 'USB-C Hub',               category: 'Electronics', price: 49.99,  stock: 178, rating: 4.4 },
        { id: 7,  name: '4K Monitor 27"',          category: 'Electronics', price: 649.00, stock: 22,  rating: 4.8 },
        { id: 8,  name: 'Cable Management Kit',    category: 'Accessories', price: 19.99,  stock: 445, rating: 4.1 },
        { id: 9,  name: 'LED Desk Lamp',           category: 'Furniture',   price: 34.99,  stock: 267, rating: 4.2 },
        { id: 10, name: 'Noise Cancelling Earbuds',category: 'Electronics', price: 149.99, stock: 67,  rating: 4.8 },
      ],
      'demo-3': [
        { id: 1,  title: 'Getting Started with SvelteKit',      author: 'Maya Patel',  category: 'Tutorial',   views: 12840, published: true,  created_at: '2026-01-15' },
        { id: 2,  title: 'Why I Switched from React to Svelte', author: 'Jordan Lee',  category: 'Opinion',    views: 8920,  published: true,  created_at: '2026-01-22' },
        { id: 3,  title: 'Building a REST API with Supabase',   author: 'Maya Patel',  category: 'Tutorial',   views: 9410,  published: true,  created_at: '2026-02-03' },
        { id: 4,  title: 'The State of CSS in 2026',            author: 'Sam Rivera',  category: 'Opinion',    views: 15200, published: true,  created_at: '2026-02-14' },
        { id: 5,  title: 'TypeScript Tips for Beginners',       author: 'Jordan Lee',  category: 'Tutorial',   views: 7300,  published: true,  created_at: '2026-02-28' },
        { id: 6,  title: 'Deploying to Vercel vs Netlify',      author: 'Sam Rivera',  category: 'Comparison', views: 22100, published: true,  created_at: '2026-03-10' },
        { id: 7,  title: 'Tailwind v4 — Everything Changed',    author: 'Sam Rivera',  category: 'News',       views: 34500, published: true,  created_at: '2026-04-10' },
        { id: 8,  title: 'Understanding Postgres Indexes',      author: 'Maya Patel',  category: 'Deep Dive',  views: 6800,  published: true,  created_at: '2026-03-22' },
        { id: 9,  title: 'Row Level Security in Supabase',      author: 'Maya Patel',  category: 'Deep Dive',  views: 5100,  published: true,  created_at: '2026-04-15' },
        { id: 10, title: 'Draft: Web Performance in 2026',      author: 'Jordan Lee',  category: 'Tutorial',   views: 0,     published: false, created_at: '2026-04-01' },
      ],
    },

    queryHistoryByProject: {
      'demo-1': [
        { id: 'q1', projectId: 'demo-1', question: 'Pokemon with HP over 100',     sql: 'SELECT * FROM pokemon WHERE hp > 100 ORDER BY hp DESC;' },
        { id: 'q2', projectId: 'demo-1', question: 'Count by type',                sql: 'SELECT type, COUNT(*) AS count FROM pokemon GROUP BY type ORDER BY count DESC;' },
        { id: 'q3', projectId: 'demo-1', question: 'Top 5 fastest pokemon',        sql: 'SELECT name, speed FROM pokemon ORDER BY speed DESC LIMIT 5;' },
        { id: 'q4', projectId: 'demo-1', question: 'Average attack by generation', sql: 'SELECT AVG(attack) AS avg_attack FROM pokemon;' },
      ],
      'demo-2': [
        { id: 'q5', projectId: 'demo-2', question: 'Products low on stock',       sql: 'SELECT name, stock, category FROM products WHERE stock < 50 ORDER BY stock ASC;' },
        { id: 'q6', projectId: 'demo-2', question: 'Revenue by category',         sql: 'SELECT category, SUM(price * 10) AS est_revenue FROM products GROUP BY category ORDER BY est_revenue DESC;' },
        { id: 'q7', projectId: 'demo-2', question: 'Top rated products',          sql: 'SELECT name, rating, category FROM products WHERE rating >= 4.7 ORDER BY rating DESC;' },
        { id: 'q8', projectId: 'demo-2', question: 'Electronics inventory value', sql: "SELECT name, price, stock, ROUND(price * stock, 2) AS inventory_value FROM products WHERE category = 'Electronics' ORDER BY inventory_value DESC;" },
      ],
      'demo-3': [
        { id: 'q9',  projectId: 'demo-3', question: 'Most viewed posts',  sql: 'SELECT title, author, views FROM posts WHERE published = true ORDER BY views DESC LIMIT 5;' },
        { id: 'q10', projectId: 'demo-3', question: 'Posts per author',   sql: 'SELECT author, COUNT(*) AS posts, SUM(views) AS total_views FROM posts GROUP BY author ORDER BY total_views DESC;' },
        { id: 'q11', projectId: 'demo-3', question: 'Unpublished drafts', sql: "SELECT title, author, created_at FROM posts WHERE published = false ORDER BY created_at DESC;" },
        { id: 'q12', projectId: 'demo-3', question: 'Posts by category',  sql: 'SELECT category, COUNT(*) AS count, SUM(views) AS total_views FROM posts GROUP BY category ORDER BY count DESC;' },
      ],
    },
  };
}

export const isDemoMode = writable(false);
export const demoData = writable<DemoData>(makeInitial());
