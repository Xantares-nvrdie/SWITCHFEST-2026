const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres.ucwhhlcqdobmgdjojmgi:Iqbalgaykadangkadang@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres'
});
client.connect()
  .then(() => client.query('ALTER TABLE tenders ALTER COLUMN reveal_window_hours TYPE REAL;'))
  .then(() => console.log('Successfully altered column'))
  .catch(e => console.error(e))
  .finally(() => client.end());
