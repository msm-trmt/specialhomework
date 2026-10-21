// PostgreSQL にデータを保存するストレージ（インターネットに公開する用）
const { Pool } = require('pg');

// 日付は時差でずれないよう 'YYYY-MM-DD' の文字列(TEXT)で保存する。
// weight は double precision にすると JavaScript の数値として返ってくる。
const SCHEMA = `
  CREATE TABLE IF NOT EXISTS workouts (
    id       SERIAL PRIMARY KEY,
    date     TEXT NOT NULL,
    exercise TEXT NOT NULL,
    weight   DOUBLE PRECISION NOT NULL,
    reps     INTEGER NOT NULL,
    sets     INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS workouts_date_idx ON workouts (date);
  CREATE TABLE IF NOT EXISTS weights (
    date   TEXT PRIMARY KEY,
    weight DOUBLE PRECISION NOT NULL
  );
`;

const WORKOUT_COLUMNS = 'id, date, exercise, weight, reps, sets';

function createPgStorage(connectionString) {
  const pool = new Pool({ connectionString });

  return {
    name: 'PostgreSQL',

    async init() {
      await pool.query(SCHEMA);
    },

    async listWorkouts({ date, exercise } = {}) {
      // 値は必ず $1, $2 … のプレースホルダで渡す（SQLインジェクション対策）
      const conditions = [];
      const values = [];
      if (date) {
        values.push(date);
        conditions.push(`date = $${values.length}`);
      }
      if (exercise) {
        values.push(exercise);
        conditions.push(`exercise = $${values.length}`);
      }
      const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
      const { rows } = await pool.query(
        `SELECT ${WORKOUT_COLUMNS} FROM workouts ${where} ORDER BY date, id`,
        values
      );
      return rows;
    },

    async addWorkout({ date, exercise, weight, reps, sets }) {
      const { rows } = await pool.query(
        `INSERT INTO workouts (date, exercise, weight, reps, sets)
         VALUES ($1, $2, $3, $4, $5) RETURNING ${WORKOUT_COLUMNS}`,
        [date, exercise, weight, reps, sets]
      );
      return rows[0];
    },

    async updateWorkout(id, { date, exercise, weight, reps, sets }) {
      const { rows } = await pool.query(
        `UPDATE workouts SET date = $2, exercise = $3, weight = $4, reps = $5, sets = $6
         WHERE id = $1 RETURNING ${WORKOUT_COLUMNS}`,
        [id, date, exercise, weight, reps, sets]
      );
      return rows[0] || null;
    },

    async deleteWorkout(id) {
      const { rows } = await pool.query(
        `DELETE FROM workouts WHERE id = $1 RETURNING ${WORKOUT_COLUMNS}`,
        [id]
      );
      return rows[0] || null;
    },

    async listWeights() {
      const { rows } = await pool.query('SELECT date, weight FROM weights ORDER BY date');
      return rows;
    },

    async upsertWeight(date, weight) {
      const { rows } = await pool.query(
        `INSERT INTO weights (date, weight) VALUES ($1, $2)
         ON CONFLICT (date) DO UPDATE SET weight = EXCLUDED.weight
         RETURNING date, weight`,
        [date, weight]
      );
      return rows[0];
    },

    async deleteWeight(date) {
      const { rows } = await pool.query(
        'DELETE FROM weights WHERE date = $1 RETURNING date, weight',
        [date]
      );
      return rows[0] || null;
    },
  };
}

module.exports = { createPgStorage };
