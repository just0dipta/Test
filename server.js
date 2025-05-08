const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;
app.use(cors());
app.use(bodyParser.json());

// Setup SQLite DB
const DBSOURCE = 'ratingsdb.sqlite';

const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error('Could not connect to SQLite database', err);
    process.exit(1);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create tables People and Ratings
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS people (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      photo TEXT
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS ratings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      person_id TEXT NOT NULL,
      stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
      review TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (person_id) REFERENCES people(id)
    )
  `);

  // Seed people data if empty
  db.get('SELECT COUNT(*) AS count FROM people', (err, row) => {
    if (err) {
      console.error('Error reading people count', err);
    } else if (row.count === 0) {
      const peopleSeed = [
        {id: '1', name: 'Alice Johnson', description: 'Creative graphic designer who loves nature and vintage cars.', photo: 'https://randomuser.me/api/portraits/women/44.jpg'},
        {id: '2', name: 'Mark Thompson', description: 'Enthusiastic software engineer and coffee enthusiast.', photo: 'https://randomuser.me/api/portraits/men/46.jpg'},
        {id: '3', name: 'Sofia Martinez', description: 'Passionate teacher who inspires children to love learning.', photo: 'https://randomuser.me/api/portraits/women/68.jpg'},
        {id: '4', name: 'James Lee', description: 'Musician, songwriter, and world traveler.', photo: 'https://randomuser.me/api/portraits/men/52.jpg'}
      ];
      const stmt = db.prepare('INSERT INTO people (id, name, description, photo) VALUES (?, ?, ?, ?)');
      peopleSeed.forEach(person => {
        stmt.run(person.id, person.name, person.description, person.photo);
      });
      stmt.finalize();
      console.log('Seeded people data');
    }
  });
});

// API endpoint to get people list
app.get('/people', (req, res) => {
  db.all('SELECT id, name, description, photo FROM people', [], (err, rows) => {
    if (err) {
      res.status(500).json({error: 'Failed to retrieve people'});
    } else {
      res.json(rows);
    }
  });
});

// API to get ratings for person by id
app.get('/people/:id/ratings', (req, res) => {
  const id = req.params.id;
  db.all('SELECT stars, review, created_at FROM ratings WHERE person_id = ? ORDER BY created_at DESC', [id], (err, rows) => {
    if (err) {
      res.status(500).json({error: 'Failed to retrieve ratings'});
    } else {
      res.json(rows);
    }
  });
});

// API to add rating for person by id
app.post('/people/:id/ratings', (req, res) => {
  const id = req.params.id;
  const { stars, review } = req.body;
  if (!stars || stars < 1 || stars > 5) {
    res.status(400).json({error: 'Stars must be between 1 and 5'});
    return;
  }
  if (!review || typeof review !== 'string' || review.trim().length === 0) {
    res.status(400).json({error: 'Review text is required'});
    return;
  }
  // Check person exists
  db.get('SELECT id FROM people WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({error: 'DB error'});
    if (!row) return res.status(404).json({error: 'Person not found'});
    // Insert rating
    db.run('INSERT INTO ratings (person_id, stars, review) VALUES (?, ?, ?)', [id, stars, review.trim()], function(err) {
      if (err) return res.status(500).json({error: 'Failed to save rating'});
      res.json({message: 'Rating saved', ratingId: this.lastID});
    });
  });
});

// Serve frontend static files (optional: if served from same server)
// Uncomment if you place the frontend HTML in 'public' folder
/*
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});
*/

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

/*
Instructions to run:

1. Make sure you have Node.js installed.

2. Install dependencies:
    npm install express cors sqlite3 body-parser

3. Run the server:
    node server.js

4. The API will be on http://localhost:3000

Endpoints:
- GET /people
- GET /people/:id/ratings
- POST /people/:id/ratings

You can update your frontend to call these endpoints to fetch and submit ratings, enabling shared data between users.

*/
</content>
</create_file>

<attempt_completion>
I have created a Node.js Express backend server using SQLite database to persist people data and ratings. This server exposes APIs to get people, get ratings per person, and post new ratings. This solves your requirement to have a shared database where ratings are stored centrally and can be seen by other people.

You can:
- Run the provided `server.js` after installing dependencies (`express`, `cors`, `sqlite3`, `body-parser`).
- Call the API endpoints from a frontend to fetch people and their ratings and submit new ratings.
- This will enable ratings to be shared and seen by all users accessing the server.

If you'd like, I can help you update the frontend HTML code to communicate with this backend API for dynamic loading and posting ratings.

Let me know if you need that or any other enhancements!
</attempt_completion>

