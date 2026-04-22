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
			{ id: 'demo-1', name: 'HealthTrack',   color: '#10b981' },
			{ id: 'demo-2', name: 'E-Commerce',    color: '#22d3a5' },
			{ id: 'demo-3', name: 'Blog Platform', color: '#f59e0b' },
		],
		tables: [
			{
				id:         'table-patients',
				name:       'patients',
				position_x: 60,
				position_y: 80,
				fields: [
					{ id: 'h1',  name: 'id',              type: 'INTEGER', nullable: false, position: 0 },
					{ id: 'h2',  name: 'full_name',        type: 'TEXT',    nullable: false, position: 1 },
					{ id: 'h3',  name: 'date_of_birth',    type: 'TEXT',    nullable: false, position: 2 },
					{ id: 'h4',  name: 'gender',           type: 'TEXT',    nullable: true,  position: 3 },
					{ id: 'h5',  name: 'blood_type',       type: 'TEXT',    nullable: true,  position: 4 },
					{ id: 'h6',  name: 'diagnosis',        type: 'TEXT',    nullable: true,  position: 5 },
					{ id: 'h7',  name: 'status',           type: 'TEXT',    nullable: false, position: 6 },
				],
			},
			{
				id:         'table-doctors',
				name:       'doctors',
				position_x: 380,
				position_y: 60,
				fields: [
					{ id: 'h8',  name: 'id',               type: 'INTEGER', nullable: false, position: 0 },
					{ id: 'h9',  name: 'full_name',         type: 'TEXT',    nullable: false, position: 1 },
					{ id: 'h10', name: 'specialty',         type: 'TEXT',    nullable: false, position: 2 },
					{ id: 'h11', name: 'department',        type: 'TEXT',    nullable: false, position: 3 },
					{ id: 'h12', name: 'years_experience',  type: 'INTEGER', nullable: false, position: 4 },
					{ id: 'h13', name: 'patients_active',   type: 'INTEGER', nullable: false, position: 5 },
				],
			},
			{
				id:         'table-appointments',
				name:       'appointments',
				position_x: 680,
				position_y: 160,
				fields: [
					{ id: 'h14', name: 'id',               type: 'INTEGER', nullable: false, position: 0 },
					{ id: 'h15', name: 'patient_id',        type: 'INTEGER', nullable: false, position: 1 },
					{ id: 'h16', name: 'doctor_id',         type: 'INTEGER', nullable: false, position: 2 },
					{ id: 'h17', name: 'appointment_date',  type: 'TEXT',    nullable: false, position: 3 },
					{ id: 'h18', name: 'type',              type: 'TEXT',    nullable: false, position: 4 },
					{ id: 'h19', name: 'status',            type: 'TEXT',    nullable: false, position: 5 },
					{ id: 'h20', name: 'notes',             type: 'TEXT',    nullable: true,  position: 6 },
				],
			},
		],
		rows: [
			{ id: 1,  full_name: 'Margaret Chen',  date_of_birth: '1975-03-12', gender: 'F', blood_type: 'A+',  diagnosis: 'Hypertension',            status: 'Active'   },
			{ id: 2,  full_name: 'James Okafor',   date_of_birth: '1988-07-24', gender: 'M', blood_type: 'O+',  diagnosis: 'Type 2 Diabetes',         status: 'Active'   },
			{ id: 3,  full_name: 'Priya Sharma',   date_of_birth: '1962-11-05', gender: 'F', blood_type: 'B+',  diagnosis: 'Asthma',                  status: 'Active'   },
			{ id: 4,  full_name: 'Carlos Rivera',  date_of_birth: '1991-01-30', gender: 'M', blood_type: 'AB-', diagnosis: 'Anxiety Disorder',        status: 'Inactive' },
			{ id: 5,  full_name: 'Linda Tran',     date_of_birth: '1954-09-17', gender: 'F', blood_type: 'O-',  diagnosis: 'Osteoporosis',            status: 'Active'   },
			{ id: 6,  full_name: 'David Kowalski', date_of_birth: '1979-06-08', gender: 'M', blood_type: 'A-',  diagnosis: 'Coronary Artery Disease', status: 'Active'   },
			{ id: 7,  full_name: 'Amara Nwosu',    date_of_birth: '1995-04-22', gender: 'F', blood_type: 'B-',  diagnosis: 'Migraine',                status: 'Active'   },
			{ id: 8,  full_name: 'Robert Paulsen', date_of_birth: '1947-12-03', gender: 'M', blood_type: 'O+',  diagnosis: 'COPD',                    status: 'Critical' },
		],
		queryHistory: [
			{
				id:       'q1',
				question: 'Active patients with critical status',
				sql:      "SELECT full_name, diagnosis, blood_type FROM patients WHERE status = 'Critical' OR status = 'Active' ORDER BY status;",
			},
			{
				id:       'q2',
				question: 'Count patients by diagnosis',
				sql:      'SELECT diagnosis, COUNT(*) AS total FROM patients GROUP BY diagnosis ORDER BY total DESC;',
			},
		],

		rowsByProject: {
			'demo-1': [
				{ id: 1,  full_name: 'Margaret Chen',   date_of_birth: '1975-03-12', gender: 'F', blood_type: 'A+',  diagnosis: 'Hypertension',            status: 'Active'   },
				{ id: 2,  full_name: 'James Okafor',    date_of_birth: '1988-07-24', gender: 'M', blood_type: 'O+',  diagnosis: 'Type 2 Diabetes',         status: 'Active'   },
				{ id: 3,  full_name: 'Priya Sharma',    date_of_birth: '1962-11-05', gender: 'F', blood_type: 'B+',  diagnosis: 'Asthma',                  status: 'Active'   },
				{ id: 4,  full_name: 'Carlos Rivera',   date_of_birth: '1991-01-30', gender: 'M', blood_type: 'AB-', diagnosis: 'Anxiety Disorder',        status: 'Inactive' },
				{ id: 5,  full_name: 'Linda Tran',      date_of_birth: '1954-09-17', gender: 'F', blood_type: 'O-',  diagnosis: 'Osteoporosis',            status: 'Active'   },
				{ id: 6,  full_name: 'David Kowalski',  date_of_birth: '1979-06-08', gender: 'M', blood_type: 'A-',  diagnosis: 'Coronary Artery Disease', status: 'Active'   },
				{ id: 7,  full_name: 'Amara Nwosu',     date_of_birth: '1995-04-22', gender: 'F', blood_type: 'B-',  diagnosis: 'Migraine',                status: 'Active'   },
				{ id: 8,  full_name: 'Robert Paulsen',  date_of_birth: '1947-12-03', gender: 'M', blood_type: 'O+',  diagnosis: 'COPD',                    status: 'Critical' },
				{ id: 9,  full_name: 'Sofia Mendez',    date_of_birth: '1983-08-15', gender: 'F', blood_type: 'A+',  diagnosis: 'Rheumatoid Arthritis',    status: 'Active'   },
				{ id: 10, full_name: 'Thomas Nguyen',   date_of_birth: '1969-02-27', gender: 'M', blood_type: 'B+',  diagnosis: 'Type 2 Diabetes',         status: 'Active'   },
				{ id: 11, full_name: "Rachel O'Brien",  date_of_birth: '1957-10-14', gender: 'F', blood_type: 'O+',  diagnosis: 'Heart Failure',           status: 'Critical' },
				{ id: 12, full_name: 'Kevin Park',      date_of_birth: '2001-05-09', gender: 'M', blood_type: 'A-',  diagnosis: 'Asthma',                  status: 'Active'   },
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
				{ id: 4,  title: 'The State of CSS in 2026',             author: 'Sam Rivera',  category: 'Opinion',    views: 15200, published: true,  created_at: '2026-02-14' },
				{ id: 5,  title: 'TypeScript Tips for Beginners',        author: 'Jordan Lee',  category: 'Tutorial',   views: 7300,  published: true,  created_at: '2026-02-28' },
				{ id: 6,  title: 'Deploying to Vercel vs Netlify',       author: 'Sam Rivera',  category: 'Comparison', views: 22100, published: true,  created_at: '2026-03-10' },
				{ id: 7,  title: 'Understanding Postgres Indexes',       author: 'Maya Patel',  category: 'Deep Dive',  views: 6800,  published: true,  created_at: '2026-03-22' },
				{ id: 8,  title: 'Tailwind v4 — Everything Changed',     author: 'Sam Rivera',  category: 'News',       views: 34500, published: true,  created_at: '2026-04-10' },
				{ id: 9,  title: 'Row Level Security in Supabase',       author: 'Maya Patel',  category: 'Deep Dive',  views: 5100,  published: true,  created_at: '2026-04-15' },
				{ id: 10, title: 'Draft: Web Performance in 2026',       author: 'Jordan Lee',  category: 'Tutorial',   views: 0,     published: false, created_at: '2026-04-01' },
			],
		},

		queryHistoryByProject: {
			'demo-1': [
				{ id: 'q1', question: 'Active and critical patients',            sql: "SELECT full_name, diagnosis, status, blood_type FROM patients WHERE status IN ('Active', 'Critical') ORDER BY status DESC;" },
				{ id: 'q2', question: 'Count patients by diagnosis',             sql: 'SELECT diagnosis, COUNT(*) AS total FROM patients GROUP BY diagnosis ORDER BY total DESC;' },
				{ id: 'q3', question: 'Appointments this week',                  sql: "SELECT a.appointment_date, p.full_name, d.full_name AS doctor, a.type, a.status FROM appointments a JOIN patients p ON a.patient_id = p.id JOIN doctors d ON a.doctor_id = d.id WHERE a.appointment_date >= '2026-04-21' ORDER BY a.appointment_date;" },
				{ id: 'q4', question: 'Doctors by department with patient load', sql: 'SELECT department, full_name, specialty, patients_active FROM doctors ORDER BY patients_active DESC;' },
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
				'TABLE patients (id INTEGER, full_name TEXT, date_of_birth TEXT, gender TEXT, blood_type TEXT, diagnosis TEXT, status TEXT)',
				'TABLE doctors (id INTEGER, full_name TEXT, specialty TEXT, department TEXT, years_experience INTEGER, patients_active INTEGER)',
				'TABLE appointments (id INTEGER, patient_id INTEGER, doctor_id INTEGER, appointment_date TEXT, type TEXT, status TEXT, notes TEXT)',
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
			'demo-1': 'patients',
			'demo-2': 'products',
			'demo-3': 'posts',
		},

		columnsByProject: {
			'demo-1': ['id', 'full_name', 'date_of_birth', 'gender', 'blood_type', 'diagnosis', 'status'],
			'demo-2': ['id', 'name', 'category', 'price', 'stock', 'rating'],
			'demo-3': ['id', 'title', 'author', 'category', 'views', 'published', 'created_at'],
		},
	};
}

export const isDemoMode = writable(false);
export const demoData   = writable<DemoData>(makeInitial());
