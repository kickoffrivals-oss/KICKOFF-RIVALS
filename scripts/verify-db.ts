
import pg from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

const pool = new pg.Pool({
    connectionString,
    ssl: false,
    connectionTimeoutMillis: 5000,
});

async function check() {
    try {
        const client = await pool.connect();
        console.log("Connected successfully!");

        const res = await client.query("SELECT COUNT(*) FROM matches");
        console.log("Matches count:", res.rows[0].count);

        const matches = await client.query("SELECT * FROM matches LIMIT 5");
        console.log("First 5 matches:", matches.rows);

        client.release();
        await pool.end();
    } catch (err) {
        console.error("Error:", err);
    }
}

check();
