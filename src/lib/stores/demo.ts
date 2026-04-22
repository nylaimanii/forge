import { writable } from 'svelte/store';

export type DemoField = { id: string; name: string; type: string; nullable: boolean; position: number; };
export type DemoTable = { id: string; projectId: string; name: string; position_x: number; position_y: number; fields: DemoField[]; };
export type DemoProject = { id: string; name: string; color: string; };
export type DemoRow = Record<string, unknown>;
export type DemoQueryHistory = { id: string; projectId: string; question: string; sql: string; };

export type DemoData = {
  projects: DemoProject[];
  tables: DemoTable[];
  rowsByTable: Record<string, DemoRow[]>;
  queryHistoryByProject: Record<string, DemoQueryHistory[]>;
};

function makeInitial(): DemoData {
  return {
    projects: [
      { id: 'demo-1', name: 'Healthcare',    color: '#4f8ef7' },
      { id: 'demo-2', name: 'E-Commerce',    color: '#22d3a5' },
      { id: 'demo-3', name: 'Blog Platform', color: '#f59e0b' },
    ],

    tables: [
      // ── HEALTHCARE ──────────────────────────────────────────────────────
      {
        id: 'tbl-patients', projectId: 'demo-1', name: 'patients',
        position_x: 60, position_y: 80,
        fields: [
          { id: 'h1', name: 'id',            type: 'INTEGER', nullable: false, position: 0 },
          { id: 'h2', name: 'name',           type: 'TEXT',    nullable: false, position: 1 },
          { id: 'h3', name: 'date_of_birth',  type: 'TEXT',    nullable: false, position: 2 },
          { id: 'h4', name: 'gender',         type: 'TEXT',    nullable: true,  position: 3 },
          { id: 'h5', name: 'blood_type',     type: 'TEXT',    nullable: true,  position: 4 },
          { id: 'h6', name: 'status',         type: 'TEXT',    nullable: false, position: 5 },
        ],
      },
      {
        id: 'tbl-appointments', projectId: 'demo-1', name: 'appointments',
        position_x: 380, position_y: 60,
        fields: [
          { id: 'a1', name: 'id',           type: 'INTEGER', nullable: false, position: 0 },
          { id: 'a2', name: 'patient_id',    type: 'INTEGER', nullable: false, position: 1 },
          { id: 'a3', name: 'doctor',        type: 'TEXT',    nullable: false, position: 2 },
          { id: 'a4', name: 'department',    type: 'TEXT',    nullable: false, position: 3 },
          { id: 'a5', name: 'scheduled_at',  type: 'TEXT',    nullable: false, position: 4 },
          { id: 'a6', name: 'status',        type: 'TEXT',    nullable: false, position: 5 },
        ],
      },
      {
        id: 'tbl-diagnoses', projectId: 'demo-1', name: 'diagnoses',
        position_x: 700, position_y: 140,
        fields: [
          { id: 'd1', name: 'id',           type: 'INTEGER', nullable: false, position: 0 },
          { id: 'd2', name: 'patient_id',    type: 'INTEGER', nullable: false, position: 1 },
          { id: 'd3', name: 'icd_code',      type: 'TEXT',    nullable: false, position: 2 },
          { id: 'd4', name: 'description',   type: 'TEXT',    nullable: false, position: 3 },
          { id: 'd5', name: 'severity',      type: 'TEXT',    nullable: true,  position: 4 },
          { id: 'd6', name: 'diagnosed_at',  type: 'TEXT',    nullable: false, position: 5 },
        ],
      },

      // ── E-COMMERCE ──────────────────────────────────────────────────────
      {
        id: 'tbl-products', projectId: 'demo-2', name: 'products',
        position_x: 60, position_y: 80,
        fields: [
          { id: 'pr1', name: 'id',       type: 'INTEGER', nullable: false, position: 0 },
          { id: 'pr2', name: 'name',      type: 'TEXT',    nullable: false, position: 1 },
          { id: 'pr3', name: 'category',  type: 'TEXT',    nullable: false, position: 2 },
          { id: 'pr4', name: 'price',     type: 'FLOAT',   nullable: false, position: 3 },
          { id: 'pr5', name: 'stock',     type: 'INTEGER', nullable: false, position: 4 },
          { id: 'pr6', name: 'rating',    type: 'FLOAT',   nullable: true,  position: 5 },
        ],
      },
      {
        id: 'tbl-customers', projectId: 'demo-2', name: 'customers',
        position_x: 380, position_y: 60,
        fields: [
          { id: 'cu1', name: 'id',             type: 'INTEGER', nullable: false, position: 0 },
          { id: 'cu2', name: 'name',            type: 'TEXT',    nullable: false, position: 1 },
          { id: 'cu3', name: 'email',           type: 'TEXT',    nullable: false, position: 2 },
          { id: 'cu4', name: 'city',            type: 'TEXT',    nullable: true,  position: 3 },
          { id: 'cu5', name: 'total_orders',    type: 'INTEGER', nullable: false, position: 4 },
          { id: 'cu6', name: 'lifetime_value',  type: 'FLOAT',   nullable: true,  position: 5 },
        ],
      },
      {
        id: 'tbl-orders', projectId: 'demo-2', name: 'orders',
        position_x: 700, position_y: 140,
        fields: [
          { id: 'or1', name: 'id',           type: 'INTEGER', nullable: false, position: 0 },
          { id: 'or2', name: 'customer_id',   type: 'INTEGER', nullable: false, position: 1 },
          { id: 'or3', name: 'product_id',    type: 'INTEGER', nullable: false, position: 2 },
          { id: 'or4', name: 'quantity',      type: 'INTEGER', nullable: false, position: 3 },
          { id: 'or5', name: 'total_price',   type: 'FLOAT',   nullable: false, position: 4 },
          { id: 'or6', name: 'status',        type: 'TEXT',    nullable: false, position: 5 },
        ],
      },

      // ── BLOG PLATFORM ────────────────────────────────────────────────────
      {
        id: 'tbl-posts', projectId: 'demo-3', name: 'posts',
        position_x: 60, position_y: 80,
        fields: [
          { id: 'bp1', name: 'id',          type: 'INTEGER', nullable: false, position: 0 },
          { id: 'bp2', name: 'title',        type: 'TEXT',    nullable: false, position: 1 },
          { id: 'bp3', name: 'author',       type: 'TEXT',    nullable: false, position: 2 },
          { id: 'bp4', name: 'category',     type: 'TEXT',    nullable: true,  position: 3 },
          { id: 'bp5', name: 'views',        type: 'INTEGER', nullable: false, position: 4 },
          { id: 'bp6', name: 'published',    type: 'BOOLEAN', nullable: false, position: 5 },
          { id: 'bp7', name: 'created_at',   type: 'TEXT',    nullable: false, position: 6 },
        ],
      },
      {
        id: 'tbl-authors', projectId: 'demo-3', name: 'authors',
        position_x: 380, position_y: 60,
        fields: [
          { id: 'au1', name: 'id',          type: 'INTEGER', nullable: false, position: 0 },
          { id: 'au2', name: 'name',         type: 'TEXT',    nullable: false, position: 1 },
          { id: 'au3', name: 'email',        type: 'TEXT',    nullable: false, position: 2 },
          { id: 'au4', name: 'followers',    type: 'INTEGER', nullable: false, position: 3 },
          { id: 'au5', name: 'post_count',   type: 'INTEGER', nullable: false, position: 4 },
        ],
      },
      {
        id: 'tbl-comments', projectId: 'demo-3', name: 'comments',
        position_x: 700, position_y: 160,
        fields: [
          { id: 'co1', name: 'id',           type: 'INTEGER', nullable: false, position: 0 },
          { id: 'co2', name: 'post_id',       type: 'INTEGER', nullable: false, position: 1 },
          { id: 'co3', name: 'author_name',   type: 'TEXT',    nullable: false, position: 2 },
          { id: 'co4', name: 'body',          type: 'TEXT',    nullable: false, position: 3 },
          { id: 'co5', name: 'likes',         type: 'INTEGER', nullable: false, position: 4 },
        ],
      },
    ],

    rowsByTable: {
      // ── HEALTHCARE ──────────────────────────────────────────────────────
      'tbl-patients': [
        { id: 1,  name: 'Alice Nguyen',   date_of_birth: '1985-03-12', gender: 'F', blood_type: 'A+',  status: 'active'     },
        { id: 2,  name: 'James Patel',    date_of_birth: '1972-07-08', gender: 'M', blood_type: 'O-',  status: 'active'     },
        { id: 3,  name: 'Maria Chen',     date_of_birth: '1990-11-25', gender: 'F', blood_type: 'B+',  status: 'discharged' },
        { id: 4,  name: 'Omar Hassan',    date_of_birth: '1965-01-30', gender: 'M', blood_type: 'AB+', status: 'active'     },
        { id: 5,  name: 'Sara Kim',       date_of_birth: '2001-06-14', gender: 'F', blood_type: 'O+',  status: 'active'     },
        { id: 6,  name: 'Luis Torres',    date_of_birth: '1958-09-03', gender: 'M', blood_type: 'A-',  status: 'critical'   },
        { id: 7,  name: 'Priya Sharma',   date_of_birth: '1993-04-20', gender: 'F', blood_type: 'B-',  status: 'active'     },
        { id: 8,  name: 'David Okonkwo',  date_of_birth: '1979-12-01', gender: 'M', blood_type: 'O+',  status: 'discharged' },
        { id: 9,  name: 'Elena Vasquez',  date_of_birth: '1988-08-17', gender: 'F', blood_type: 'A+',  status: 'active'     },
        { id: 10, name: 'Kai Nakamura',   date_of_birth: '2005-02-28', gender: 'M', blood_type: 'AB-', status: 'active'     },
      ],
      'tbl-appointments': [
        { id: 1,  patient_id: 1,  doctor: 'Dr. Rivera',   department: 'Cardiology',    scheduled_at: '2026-04-22 09:00', status: 'confirmed'  },
        { id: 2,  patient_id: 2,  doctor: 'Dr. Osei',     department: 'Neurology',     scheduled_at: '2026-04-22 10:30', status: 'confirmed'  },
        { id: 3,  patient_id: 4,  doctor: 'Dr. Rivera',   department: 'Cardiology',    scheduled_at: '2026-04-23 08:00', status: 'confirmed'  },
        { id: 4,  patient_id: 6,  doctor: 'Dr. Pham',     department: 'ICU',           scheduled_at: '2026-04-22 07:00', status: 'urgent'     },
        { id: 5,  patient_id: 5,  doctor: 'Dr. Kapoor',   department: 'Dermatology',   scheduled_at: '2026-04-24 14:00', status: 'confirmed'  },
        { id: 6,  patient_id: 3,  doctor: 'Dr. Osei',     department: 'Neurology',     scheduled_at: '2026-04-25 11:00', status: 'pending'    },
        { id: 7,  patient_id: 7,  doctor: 'Dr. Kapoor',   department: 'Dermatology',   scheduled_at: '2026-04-26 13:00', status: 'confirmed'  },
        { id: 8,  patient_id: 9,  doctor: 'Dr. Rivera',   department: 'Cardiology',    scheduled_at: '2026-04-28 09:30', status: 'confirmed'  },
        { id: 9,  patient_id: 10, doctor: 'Dr. Pham',     department: 'Pediatrics',    scheduled_at: '2026-04-29 10:00', status: 'confirmed'  },
        { id: 10, patient_id: 8,  doctor: 'Dr. Kapoor',   department: 'Orthopedics',   scheduled_at: '2026-04-30 15:00', status: 'cancelled'  },
      ],
      'tbl-diagnoses': [
        { id: 1,  patient_id: 1,  icd_code: 'I10',   description: 'Essential hypertension',            severity: 'moderate', diagnosed_at: '2026-01-10' },
        { id: 2,  patient_id: 2,  icd_code: 'G43.9', description: 'Migraine, unspecified',              severity: 'mild',     diagnosed_at: '2026-02-05' },
        { id: 3,  patient_id: 4,  icd_code: 'E11.9', description: 'Type 2 diabetes mellitus',           severity: 'moderate', diagnosed_at: '2025-11-20' },
        { id: 4,  patient_id: 6,  icd_code: 'J18.9', description: 'Pneumonia, unspecified',             severity: 'severe',   diagnosed_at: '2026-04-20' },
        { id: 5,  patient_id: 5,  icd_code: 'L30.9', description: 'Dermatitis, unspecified',            severity: 'mild',     diagnosed_at: '2026-03-15' },
        { id: 6,  patient_id: 7,  icd_code: 'L20.9', description: 'Atopic dermatitis',                  severity: 'mild',     diagnosed_at: '2026-04-01' },
        { id: 7,  patient_id: 9,  icd_code: 'I25.1', description: 'Atherosclerotic heart disease',      severity: 'moderate', diagnosed_at: '2026-02-28' },
        { id: 8,  patient_id: 10, icd_code: 'J06.9', description: 'Acute upper respiratory infection',  severity: 'mild',     diagnosed_at: '2026-04-18' },
      ],

      // ── E-COMMERCE ──────────────────────────────────────────────────────
      'tbl-products': [
        { id: 1,  name: 'Wireless Headphones',     category: 'Electronics', price: 79.99,  stock: 143, rating: 4.7 },
        { id: 2,  name: 'Mechanical Keyboard',      category: 'Electronics', price: 129.00, stock: 89,  rating: 4.9 },
        { id: 3,  name: 'Ergonomic Mouse',          category: 'Electronics', price: 59.99,  stock: 212, rating: 4.5 },
        { id: 4,  name: 'Standing Desk',            category: 'Furniture',   price: 399.00, stock: 34,  rating: 4.6 },
        { id: 5,  name: 'Laptop Stand',             category: 'Accessories', price: 39.99,  stock: 301, rating: 4.3 },
        { id: 6,  name: 'USB-C Hub',                category: 'Electronics', price: 49.99,  stock: 178, rating: 4.4 },
        { id: 7,  name: '4K Monitor 27"',           category: 'Electronics', price: 649.00, stock: 22,  rating: 4.8 },
        { id: 8,  name: 'Cable Management Kit',     category: 'Accessories', price: 19.99,  stock: 445, rating: 4.1 },
        { id: 9,  name: 'LED Desk Lamp',            category: 'Furniture',   price: 34.99,  stock: 267, rating: 4.2 },
        { id: 10, name: 'Noise Cancelling Earbuds', category: 'Electronics', price: 149.99, stock: 67,  rating: 4.8 },
      ],
      'tbl-customers': [
        { id: 1,  name: 'Jordan Mills',   email: 'jordan@example.com',  city: 'Austin',      total_orders: 14, lifetime_value: 1820.50 },
        { id: 2,  name: 'Priya Anand',    email: 'priya@example.com',   city: 'Seattle',     total_orders: 8,  lifetime_value: 940.00  },
        { id: 3,  name: 'Marcus Webb',    email: 'marcus@example.com',  city: 'Chicago',     total_orders: 22, lifetime_value: 3410.75 },
        { id: 4,  name: 'Sofia Reyes',    email: 'sofia@example.com',   city: 'Miami',       total_orders: 5,  lifetime_value: 520.00  },
        { id: 5,  name: 'Chen Liu',       email: 'chen@example.com',    city: 'San Jose',    total_orders: 31, lifetime_value: 5890.20 },
        { id: 6,  name: 'Amara Diallo',   email: 'amara@example.com',   city: 'Atlanta',     total_orders: 3,  lifetime_value: 210.00  },
        { id: 7,  name: 'Tom Eriksson',   email: 'tom@example.com',     city: null,          total_orders: 17, lifetime_value: 2340.00 },
        { id: 8,  name: 'Nadia Kowalski', email: 'nadia@example.com',   city: 'Boston',      total_orders: 9,  lifetime_value: 1105.50 },
        { id: 9,  name: "Liam O'Brien",   email: 'liam@example.com',    city: 'Denver',      total_orders: 6,  lifetime_value: 730.00  },
        { id: 10, name: 'Yuki Tanaka',    email: 'yuki@example.com',    city: 'Los Angeles', total_orders: 25, lifetime_value: 4200.00 },
      ],
      'tbl-orders': [
        { id: 1,  customer_id: 5,  product_id: 7,  quantity: 1, total_price: 649.00, status: 'delivered'  },
        { id: 2,  customer_id: 3,  product_id: 2,  quantity: 2, total_price: 258.00, status: 'delivered'  },
        { id: 3,  customer_id: 1,  product_id: 1,  quantity: 1, total_price: 79.99,  status: 'delivered'  },
        { id: 4,  customer_id: 10, product_id: 4,  quantity: 1, total_price: 399.00, status: 'shipped'    },
        { id: 5,  customer_id: 7,  product_id: 3,  quantity: 1, total_price: 59.99,  status: 'delivered'  },
        { id: 6,  customer_id: 2,  product_id: 6,  quantity: 3, total_price: 149.97, status: 'processing' },
        { id: 7,  customer_id: 8,  product_id: 10, quantity: 1, total_price: 149.99, status: 'shipped'    },
        { id: 8,  customer_id: 4,  product_id: 5,  quantity: 2, total_price: 79.98,  status: 'delivered'  },
        { id: 9,  customer_id: 6,  product_id: 8,  quantity: 1, total_price: 19.99,  status: 'delivered'  },
        { id: 10, customer_id: 9,  product_id: 9,  quantity: 1, total_price: 34.99,  status: 'processing' },
      ],

      // ── BLOG PLATFORM ────────────────────────────────────────────────────
      'tbl-posts': [
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
      'tbl-authors': [
        { id: 1, name: 'Maya Patel',  email: 'maya@forge.dev',    followers: 8420,  post_count: 5 },
        { id: 2, name: 'Jordan Lee',  email: 'jordan@forge.dev',  followers: 5130,  post_count: 3 },
        { id: 3, name: 'Sam Rivera',  email: 'sam@forge.dev',     followers: 11200, post_count: 3 },
      ],
      'tbl-comments': [
        { id: 1,  post_id: 1, author_name: 'devuser_42',    body: 'This is exactly what I needed to get started!',              likes: 24 },
        { id: 2,  post_id: 1, author_name: 'svelte_fan',    body: 'Great walkthrough, the routing section was super clear.',     likes: 18 },
        { id: 3,  post_id: 2, author_name: 'reactdev99',    body: 'Interesting perspective, I still prefer hooks personally.',   likes: 7  },
        { id: 4,  post_id: 2, author_name: 'newbie_coder',  body: 'This convinced me to try Svelte for my next project.',        likes: 31 },
        { id: 5,  post_id: 4, author_name: 'css_wizard',    body: 'The cascade layers section blew my mind.',                    likes: 45 },
        { id: 6,  post_id: 4, author_name: 'ui_builder',    body: 'Finally a good summary of what changed in 2026.',             likes: 12 },
        { id: 7,  post_id: 6, author_name: 'deploy_pro',    body: 'Netlify edge functions tip saved me hours.',                  likes: 19 },
        { id: 8,  post_id: 7, author_name: 'tailwind_user', body: 'The new config-less setup is a game changer.',                likes: 38 },
        { id: 9,  post_id: 3, author_name: 'backend_dev',   body: 'RLS setup took me forever before reading this.',              likes: 22 },
        { id: 10, post_id: 8, author_name: 'db_nerd',       body: 'Good intro but missing partial indexes — worth a follow-up.', likes: 9  },
      ],
    },

    queryHistoryByProject: {
      'demo-1': [
        { id: 'q1', projectId: 'demo-1', question: 'Active patients',            sql: "SELECT * FROM patients WHERE status = 'active' ORDER BY name ASC;" },
        { id: 'q2', projectId: 'demo-1', question: 'Critical patients',          sql: "SELECT name, blood_type, date_of_birth FROM patients WHERE status = 'critical';" },
        { id: 'q3', projectId: 'demo-1', question: 'Patients by blood type',     sql: 'SELECT blood_type, COUNT(*) AS count FROM patients GROUP BY blood_type ORDER BY count DESC;' },
        { id: 'q4', projectId: 'demo-1', question: 'Appointments by department', sql: 'SELECT department, COUNT(*) AS total FROM appointments GROUP BY department ORDER BY total DESC;' },
      ],
      'demo-2': [
        { id: 'q5', projectId: 'demo-2', question: 'Products low on stock',      sql: 'SELECT name, stock, category FROM products WHERE stock < 50 ORDER BY stock ASC;' },
        { id: 'q6', projectId: 'demo-2', question: 'Top rated products',         sql: 'SELECT name, rating, category FROM products WHERE rating >= 4.7 ORDER BY rating DESC;' },
        { id: 'q7', projectId: 'demo-2', question: 'Revenue by category',        sql: 'SELECT category, SUM(price * stock) AS inventory_value FROM products GROUP BY category ORDER BY inventory_value DESC;' },
        { id: 'q8', projectId: 'demo-2', question: 'Top customers by value',     sql: 'SELECT name, total_orders, lifetime_value FROM customers ORDER BY lifetime_value DESC LIMIT 5;' },
      ],
      'demo-3': [
        { id: 'q9',  projectId: 'demo-3', question: 'Most viewed posts',         sql: 'SELECT title, author, views FROM posts WHERE published = true ORDER BY views DESC LIMIT 5;' },
        { id: 'q10', projectId: 'demo-3', question: 'Posts per author',          sql: 'SELECT author, COUNT(*) AS posts, SUM(views) AS total_views FROM posts GROUP BY author ORDER BY total_views DESC;' },
        { id: 'q11', projectId: 'demo-3', question: 'Unpublished drafts',        sql: "SELECT title, author, created_at FROM posts WHERE published = false ORDER BY created_at DESC;" },
        { id: 'q12', projectId: 'demo-3', question: 'Top comments by likes',     sql: 'SELECT author_name, body, likes FROM comments ORDER BY likes DESC LIMIT 5;' },
      ],
    },
  };
}

export const isDemoMode = writable(false);
export const demoData = writable<DemoData>(makeInitial());
