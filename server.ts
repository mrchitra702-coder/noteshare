import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import cors from 'cors';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const PORT = process.env.PORT || 3000;

// Initialize Database
const db = new Database('notes.db');
db.pragma('journal_mode = WAL');

// Create Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    course TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    uploader_id INTEGER NOT NULL,
    downloads INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploader_id) REFERENCES users (id)
  );
`);

// Seed Admin if not exists
const adminEmail = 'admin@noteshare.com';
const existingAdmin = db.prepare('SELECT * FROM users WHERE email = ?').get(adminEmail);
if (!existingAdmin) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)').run(
    'System Admin',
    adminEmail,
    hashedPassword,
    'admin'
  );
  console.log('Admin user created: admin@noteshare.com / admin123');
}

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
  app.post('/api/auth/signup', (req, res) => {
    const { name, email, password } = req.body;
    try {
      const hashedPassword = bcrypt.hashSync(password, 10);
      const result = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)').run(name, email, hashedPassword);
      const token = jwt.sign({ id: result.lastInsertRowid, email, role: 'user' }, JWT_SECRET);
      res.json({ token, user: { id: result.lastInsertRowid, name, email, role: 'user' } });
    } catch (err: any) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        res.status(400).json({ message: 'Email already exists' });
      } else {
        res.status(500).json({ message: 'Server error' });
      }
    }
  });

  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email, role: user.role }, JWT_SECRET);
    res.json({ token, user: { id: user.id, name: user.name, email, role: user.role } });
  });

  app.get('/api/auth/me', authenticateToken, (req: any, res) => {
    const user: any = db.prepare('SELECT id, name, email, role FROM users WHERE id = ?').get(req.user.id);
    res.json(user);
  });

  // Notes
  app.get('/api/notes', (req, res) => {
    const { query, course, subject, sort } = req.query;
    let sql = `
      SELECT n.*, u.name as uploader_name 
      FROM notes n 
      JOIN users u ON n.uploader_id = u.id 
      WHERE 1=1
    `;
    const params: any[] = [];

    if (query) {
      sql += ` AND (n.title LIKE ? OR n.description LIKE ? OR n.subject LIKE ?)`;
      const q = `%${query}%`;
      params.push(q, q, q);
    }
    if (course) {
      sql += ` AND n.course = ?`;
      params.push(course);
    }
    if (subject) {
      sql += ` AND n.subject = ?`;
      params.push(subject);
    }

    if (sort === 'oldest') {
      sql += ` ORDER BY n.created_at ASC`;
    } else if (sort === 'popular') {
      sql += ` ORDER BY n.downloads DESC`;
    } else {
      sql += ` ORDER BY n.created_at DESC`;
    }

    const notes = db.prepare(sql).all(...params);
    res.json(notes);
  });

  app.get('/api/notes/trending', (req, res) => {
    const notes = db.prepare(`
      SELECT n.*, u.name as uploader_name 
      FROM notes n 
      JOIN users u ON n.uploader_id = u.id 
      ORDER BY n.downloads DESC LIMIT 5
    `).all();
    res.json(notes);
  });

  app.post('/api/notes/upload', authenticateToken, upload.single('file'), (req: any, res) => {
    const { title, course, subject, description } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ message: 'File is required' });

    try {
      const result = db.prepare(`
        INSERT INTO notes (title, course, subject, description, file_path, file_name, file_type, file_size, uploader_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(title, course, subject, description, file.path, file.originalname, file.mimetype, file.size, req.user.id);
      
      res.json({ id: result.lastInsertRowid, message: 'Upload successful' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  });

  app.get('/api/notes/:id', (req, res) => {
    const note = db.prepare(`
      SELECT n.*, u.name as uploader_name 
      FROM notes n 
      JOIN users u ON n.uploader_id = u.id 
      WHERE n.id = ?
    `).get(req.params.id);
    
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  });

  app.get('/api/notes/:id/download', (req, res) => {
    const note: any = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    db.prepare('UPDATE notes SET downloads = downloads + 1 WHERE id = ?').run(note.id);
    res.download(path.resolve(note.file_path), note.file_name);
  });

  app.delete('/api/notes/:id', authenticateToken, (req: any, res) => {
    const note: any = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    if (note.uploader_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    try {
      if (fs.existsSync(note.file_path)) {
        fs.unlinkSync(note.file_path);
      }
      db.prepare('DELETE FROM notes WHERE id = ?').run(note.id);
      res.json({ message: 'Deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

  // Admin
  app.get('/api/admin/stats', authenticateToken, isAdmin, (req: any, res) => {
    const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
    const totalNotes = db.prepare('SELECT COUNT(*) as count FROM notes').get() as any;
    const totalDownloads = db.prepare('SELECT SUM(downloads) as count FROM notes').get() as any;
    
    res.json({
      totalUsers: totalUsers.count,
      totalNotes: totalNotes.count,
      totalDownloads: totalDownloads.count || 0
    });
  });

  app.get('/api/admin/users', authenticateToken, isAdmin, (req: any, res) => {
    const users = db.prepare('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC').all();
    res.json(users);
  });

  app.delete('/api/admin/users/:id', authenticateToken, isAdmin, (req: any, res) => {
    if (Number(req.params.id) === req.user.id) {
       return res.status(400).json({ message: 'Cannot delete yourself' });
    }
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
