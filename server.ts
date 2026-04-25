import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import pg from 'pg';
const { Pool } = pg;
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import cors from 'cors';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const PORT = process.env.PORT || 3000;

// Initialize Database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('render.com') ? { rejectUnauthorized: false } : false
});

// Helper to run queries
const query = (text: string, params?: any[]) => pool.query(text, params);

// Create Tables
async function initDb() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notes (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      course TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT,
      file_path TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      uploader_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      downloads INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Seed Admin if not exists
  const adminEmail = 'admin@noteshare.com';
  const existingAdmin = await query('SELECT * FROM users WHERE email = $1', [adminEmail]);
  if (existingAdmin.rowCount === 0) {
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    await query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)',
      ['System Admin', adminEmail, hashedPassword, 'admin']
    );
    console.log('Admin user created: admin@noteshare.com / admin123');
  }
}

initDb().catch(console.error);

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer Config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ 
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Middleware: Auth
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ message: 'Invalid token' });
      req.user = user;
      next();
    });
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  };

  // --- API ROUTES ---

  // Auth
  app.post('/api/auth/signup', async (req, res) => {
    const { name, email, password } = req.body;
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const result = await query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
        [name, email, hashedPassword]
      );
      const userId = result.rows[0].id;
      const token = jwt.sign({ id: userId, email, role: 'user' }, JWT_SECRET);
      res.json({ token, user: { id: userId, name, email, role: 'user' } });
    } catch (err: any) {
      if (err.code === '23505') { // Postgres unique constraint error code
        res.status(400).json({ message: 'Email already exists' });
      } else {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
      }
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email, role: user.role } });
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    const result = await query('SELECT id, name, email, role FROM users WHERE id = $1', [req.user.id]);
    res.json(result.rows[0]);
  });

  // Notes
  app.get('/api/notes', async (req, res) => {
    const { query: searchQuery, course, subject, sort } = req.query;
    let sql = `
      SELECT n.*, u.name as uploader_name 
      FROM notes n 
      JOIN users u ON n.uploader_id = u.id 
      WHERE 1=1
    `;
    const params: any[] = [];
    let paramIndex = 1;

    if (searchQuery) {
      sql += ` AND (n.title ILIKE $${paramIndex} OR n.description ILIKE $${paramIndex} OR n.subject ILIKE $${paramIndex})`;
      params.push(`%${searchQuery}%`);
      paramIndex++;
    }
    if (course) {
      sql += ` AND n.course = $${paramIndex}`;
      params.push(course);
      paramIndex++;
    }
    if (subject) {
      sql += ` AND n.subject = $${paramIndex}`;
      params.push(subject);
      paramIndex++;
    }

    if (sort === 'oldest') {
      sql += ` ORDER BY n.created_at ASC`;
    } else if (sort === 'popular') {
      sql += ` ORDER BY n.downloads DESC`;
    } else {
      sql += ` ORDER BY n.created_at DESC`;
    }

    const result = await query(sql, params);
    res.json(result.rows);
  });

  app.get('/api/notes/trending', async (req, res) => {
    const result = await query(`
      SELECT n.*, u.name as uploader_name 
      FROM notes n 
      JOIN users u ON n.uploader_id = u.id 
      ORDER BY n.downloads DESC LIMIT 5
    `);
    res.json(result.rows);
  });

  app.post('/api/notes/upload', authenticateToken, upload.single('file'), async (req: any, res) => {
    const { title, course, subject, description } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'File is required' });

    try {
      const result = await query(`
        INSERT INTO notes (title, course, subject, description, file_path, file_name, file_type, file_size, uploader_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
      `, [title, course, subject, description, file.path, file.originalname, file.mimetype, file.size, req.user.id]);
      
      res.json({ id: result.rows[0].id, message: 'Upload successful' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/notes/:id', async (req, res) => {
    const result = await query(`
      SELECT n.*, u.name as uploader_name 
      FROM notes n 
      JOIN users u ON n.uploader_id = u.id 
      WHERE n.id = $1
    `, [req.params.id]);
    
    const note = result.rows[0];
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  });

  app.get('/api/notes/:id/download', async (req, res) => {
    const result = await query('SELECT * FROM notes WHERE id = $1', [req.params.id]);
    const note = result.rows[0];
    if (!note) return res.status(404).json({ message: 'Note not found' });

    await query('UPDATE notes SET downloads = downloads + 1 WHERE id = $1', [note.id]);
    res.download(path.resolve(note.file_path), note.file_name);
  });

  app.delete('/api/notes/:id', authenticateToken, async (req: any, res) => {
    const result = await query('SELECT * FROM notes WHERE id = $1', [req.params.id]);
    const note = result.rows[0];
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (note.uploader_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    try {
      if (fs.existsSync(note.file_path)) {
        fs.unlinkSync(note.file_path);
      }
      await query('DELETE FROM notes WHERE id = $1', [note.id]);
      res.json({ message: 'Deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Admin
  app.get('/api/admin/stats', authenticateToken, isAdmin, async (req: any, res) => {
    const usersCount = await query('SELECT COUNT(*) as count FROM users');
    const notesCount = await query('SELECT COUNT(*) as count FROM notes');
    const downloadsSum = await query('SELECT SUM(downloads) as count FROM notes');
    
    res.json({
      totalUsers: parseInt(usersCount.rows[0].count),
      totalNotes: parseInt(notesCount.rows[0].count),
      totalDownloads: parseInt(downloadsSum.rows[0].count || '0')
    });
  });

  app.get('/api/admin/users', authenticateToken, isAdmin, async (req: any, res) => {
    const result = await query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  });

  app.delete('/api/admin/users/:id', authenticateToken, isAdmin, async (req: any, res) => {
    if (Number(req.params.id) === req.user.id) {
       return res.status(400).json({ message: 'Cannot delete yourself' });
    }
    await query('DELETE FROM users WHERE id = $1', [req.params.id]);
    res.json({ message: 'User deleted' });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
