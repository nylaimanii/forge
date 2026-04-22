import { writable } from 'svelte/store';

export type DemoField = {
	id:       string;
	name:     string;
	type:     string;
	nullable: boolean;
	position: number;
};

export type DemoTable = {
	id:         string;
	name:       string;
	position_x: number;
	position_y: number;
	fields:     DemoField[];
};

export type DemoProject = {
	id:    string;
	name:  string;
	color: string;
};

export type DemoRow = Record<string, unknown>;

export type DemoQueryHistory = {
	id:       string;
	question: string;
	sql:      string;
};

export type DemoData = {
	projects:     DemoProject[];
	tables:       DemoTable[];
	rows:         DemoRow[];
	queryHistory: DemoQueryHistory[];
	rowsByProject:          Record<string, DemoRow[]>;
	queryHistoryByProject:  Record<string, DemoQueryHistory[]>;
	schemaByProject:        Record<string, string>;
	defaultTableByProject:  Record<string, string>;
	columnsByProject:       Record<string, string[]>;
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
				id:         'table-pokemon',
				name:       'pokemon',
				position_x: 60,
				position_y: 80,
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
				id:         'table-trainers',
				name:       'trainers',
				position_x: 420,
				position_y: 100,
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
			{
				id:       'q1',
				question: 'Show all pokemon with HP over 100',
				sql:      'SELECT * FROM pokemon WHERE hp > 100 ORDER BY hp DESC;',
			},
			{
				id:       'q2',
				question: 'Count pokemon by type',
				sql:      'SELECT type, COUNT(*) AS count FROM pokemon GROUP BY type ORDER BY count DESC;',
			},
		],

		rowsByProject: {
			'demo-1': [
				{ id: 1,  name: 'Bulbasaur',  type: 'Grass/Poison',  hp: 45,  attack: 49,  defense: 49,  speed: 45  },
				{ id: 2,  name: 'Charmander', type: 'Fire',           hp: 39,  attack: 52,  defense: 43,  speed: 65  },
				{ id: 3,  name: 'Squirtle',   type: 'Water',          hp: 44,  attack: 48,  defense: 65,  speed: 43  },
				{ id: 4,  name: 'Pikachu',    type: 'Electric',       hp: 35,  attack: 55,  defense: 40,  speed: 90  },
				{ id: 5,  name: 'Eevee',      type: 'Normal',         hp: 55,  attack: 55,  defense: 50,  speed: 55  },
				{ id: 6,  name: 'Snorlax',    type: 'Normal',         hp: 160, attack: 110, defense: 65,  speed: 30  },
				{ id: 7,  name: 'Gengar',     type: 'Ghost/Poison',   hp: 60,  attack: 65,  defense: 60,  speed: 110 },
				{ id: 8,  name: 'Mewtwo',     type: 'Psychic',        hp: 106, attack: 110, defense: 90,  speed: 130 },
				{ id: 9,  name: 'Lucario',    type: 'Fighting/Steel', hp: 70,  attack: 110, defense: 70,  speed: 90  },
				{ id: 10, name: 'Garchomp',   type: 'Dragon/Ground',  hp: 108, attack: 130, defense: 95,  speed: 102 },
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
				{ id: 11, name: 'Webcam 1080p',            category: 'Electronics', price: 89.99,  stock: 95,  rating: 4.6 },
				{ id: 12, name: 'Desk Organizer',          category: 'Accessories', price: 24.99,  stock: 388, rating: 4.0 },
			],
			'demo-3': [
				{ id: 1,  title: 'Getting Started with SvelteKit',      author: 'Maya Patel',  category: 'Tutorial',   views: 12840, published: true,  created_at: '2026-01-15' },
				{ id: 2,  title: 'Why I Switched from React to Svelte',  author: 'Jordan Lee',  category: 'Opinion',    views: 8920,  published: true,  created_at: '2026-01-22' },
				{ id: 3,  title: 'Building a REST API with Supabase',    author: 'Maya Patel',  category: 'Tutorial',   views: 9410,  published: true,  created_at: '2026-02-03' },
				{ id: 4,  title: 'The State of CSS in 2026',             author: 'Sam Rivera', category: 'Opinion',    views: 15200, published: true,  created_at: '2026-02-14' },
				{ id: 5,  title: 'TypeScript Tips for Beginners',        author: 'Jordan Lee',  category: 'Tutorial',   views: 7300,  published: true,  created_at: '2026-02-28' },
				{ id: 6,  title: 'Deploying to Vercel vs Netlify',       author: 'Sam Rivera', category: 'Comparison', views: 22100, published: true,  created_at: '2026-03-10' },
				{ id: 7,  title: 'Understanding Postgres Indexes',       author: 'Maya Patel',  category: 'Deep Dive',  views: 6800,  published: true,  created_at: '2026-03-22' },
				{ id: 8,  title: 'Tailwind v4 — Everything Changed',     author: 'Sam Rivera', category: 'News',       views: 34500, published: true,  created_at: '2026-04-10' },
				{ id: 9,  title: 'Row Level Security in Supabase',       author: 'Maya Patel',  category: 'Deep Dive',  views: 5100,  published: true,  created_at: '2026-04-15' },
				{ id: 10, title: 'Draft: Web Performance in 2026',       author: 'Jordan Lee',  category: 'Tutorial',   views: 0,     published: false, created_at: '2026-04-01' },
			],
		},

		queryHistoryByProject: {
			'demo-1': [
				{ id: 'q1', question: 'Show all pokemon with HP over 100',    sql: 'SELECT * FROM pokemon WHERE hp > 100 ORDER BY hp DESC;' },
				{ id: 'q2', question: 'Count pokemon by type',                sql: 'SELECT type, COUNT(*) AS count FROM pokemon GROUP BY type ORDER BY count DESC;' },
				{ id: 'q3', question: 'Top 5 fastest pokemon',                sql: 'SELECT name, type, speed FROM pokemon ORDER BY speed DESC LIMIT 5;' },
				{ id: 'q4', question: 'Average attack by generation',         sql: 'SELECT generation, ROUND(AVG(attack), 1) AS avg_attack FROM pokemon GROUP BY generation ORDER BY generation;' },
			],
			'demo-2': [
				{ id: 'q5', question: 'Products low on stock',                sql: 'SELECT name, stock, category FROM products WHERE stock < 50 ORDER BY stock ASC;' },
				{ id: 'q6', question: 'Revenue by category',                  sql: "SELECT p.category, SUM(o.total_price) AS revenue FROM orders o JOIN products p ON o.product_id = p.id GROUP BY p.category ORDER BY revenue DESC;" },
				{ id: 'q7', question: 'Top customers by lifetime value',      sql: 'SELECT name, email, lifetime_value, total_orders FROM customers ORDER BY lifetime_value DESC LIMIT 5;' },
				{ id: 'q8', question: 'Orders placed this month',             sql: "SELECT COUNT(*) AS orders, SUM(total_price) AS revenue FROM orders WHERE ordered_at >= '2026-04-01';" },
			],
			'demo-3': [
				{ id: 'q9',  question: 'Most viewed published posts',         sql: 'SELECT title, author, views FROM posts WHERE published = true ORDER BY views DESC LIMIT 5;' },
				{ id: 'q10', question: 'Posts per author with total views',   sql: 'SELECT author, COUNT(*) AS posts, SUM(views) AS total_views FROM posts GROUP BY author ORDER BY total_views DESC;' },
				{ id: 'q11', question: 'Most liked comments',                sql: 'SELECT author_name, body, likes FROM comments ORDER BY likes DESC LIMIT 5;' },
				{ id: 'q12', question: 'Unpublished drafts',                 sql: "SELECT title, author, created_at FROM posts WHERE published = false ORDER BY created_at DESC;" },
			],
		},

		schemaByProject: {
			'demo-1': [
				'TABLE pokemon (id INTEGER, name TEXT, type TEXT, hp INTEGER, attack INTEGER, defense INTEGER)',
				'TABLE trainers (id INTEGER, name TEXT, region TEXT, badge_count INTEGER)',
			].join('\n'),
			'demo-2': [
				'TABLE products (id INTEGER, name TEXT, category TEXT, price FLOAT, stock INTEGER, rating FLOAT)',
				'TABLE customers (id INTEGER, name TEXT, email TEXT, city TEXT, total_orders INTEGER, lifetime_value FLOAT)',
				'TABLE orders (id INTEGER, customer_id INTEGER, product_id INTEGER, quantity INTEGER, total_price FLOAT, status TEXT, ordered_at TEXT)',
			].join('\n'),
			'demo-3': [
				'TABLE posts (id INTEGER, title TEXT, slug TEXT, author TEXT, category TEXT, views INTEGER, published BOOLEAN, created_at TEXT)',
				'TABLE authors (id INTEGER, name TEXT, bio TEXT, email TEXT, followers INTEGER, post_count INTEGER)',
				'TABLE comments (id INTEGER, post_id INTEGER, author_name TEXT, body TEXT, likes INTEGER, created_at TEXT)',
			].join('\n'),
		},

		defaultTableByProject: {
			'demo-1': 'pokemon',
			'demo-2': 'products',
			'demo-3': 'posts',
		},

		columnsByProject: {
			'demo-1': ['id', 'name', 'type', 'hp', 'attack', 'defense', 'speed'],
			'demo-2': ['id', 'name', 'category', 'price', 'stock', 'rating'],
			'demo-3': ['id', 'title', 'author', 'category', 'views', 'published', 'created_at'],
		},
	};
}

export const isDemoMode = writable(false);
export const demoData   = writable<DemoData>(makeInitial());
