import { Client } from 'pg';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Connect to PostgreSQL
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();

    // Create waitlist table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS waitlist (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert email
    const result = await client.query(
      'INSERT INTO waitlist (email) VALUES ($1) RETURNING id, email, created_at',
      [email]
    );

    await client.end();

    return res.status(200).json({
      id: result.rows[0].id,
      email: result.rows[0].email,
      created_at: result.rows[0].created_at
    });

  } catch (error) {
    console.error('Error:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Email already exists in waitlist' });
    }
    
    return res.status(500).json({ error: 'Failed to add email to waitlist' });
  }
} 