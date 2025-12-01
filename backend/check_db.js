const sqlite3 = require('sqlite3').verbose();
const path = require('path');

console.log('Checking database contents...');

const dbPath = path.join(__dirname, 'dating_app.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        return;
    }
    console.log('Connected to the SQLite database.');
});

// Check tables
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, rows) => {
    if (err) {
        console.error('Error checking tables:', err.message);
        return;
    }

    console.log('\n=== Tables ===');
    rows.forEach(row => {
        console.log(`- ${row.name}`);
    });

    // Check user count
    db.get("SELECT COUNT(*) as count FROM users", [], (err, row) => {
        if (err) {
            console.error('Error counting users:', err.message);
            return;
        }

        console.log(`\nTotal users: ${row.count}`);

        // Show user details
        db.all("SELECT id, name, email, password_hash FROM users LIMIT 10", [], (err, userRows) => {
            if (err) {
                console.error('Error querying users:', err.message);
                return;
            }

            console.log('\n=== Users (first 10) ===');
            userRows.forEach(user => {
                console.log(`ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Has Password: ${!!user.password_hash}`);
            });

            // Check interactions
            db.get("SELECT COUNT(*) as count FROM interactions", [], (err, row) => {
                console.log(`\nTotal interactions: ${row.count}`);

                // Check matches
                db.get("SELECT COUNT(*) as count FROM matches", [], (err, row) => {
                    console.log(`Total matches: ${row.count}`);
                    console.log('\n=== Database check complete ===');
                    db.close();
                });
            });
        });
    });
});
