// JSON ファイルにデータを保存するストレージ（ローカルで手軽に動かす用）
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const WORKOUTS_FILE = path.join(DATA_DIR, 'workouts.json');
const WEIGHTS_FILE = path.join(DATA_DIR, 'weights.json');

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function createFileStorage() {
  return {
    name: 'JSONファイル (data/)',

    async init() {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      for (const file of [WORKOUTS_FILE, WEIGHTS_FILE]) {
        if (!fs.existsSync(file)) writeJson(file, []);
      }
    },

    async listWorkouts({ date, exercise } = {}) {
      let workouts = readJson(WORKOUTS_FILE);
      if (date) workouts = workouts.filter((w) => w.date === date);
      if (exercise) workouts = workouts.filter((w) => w.exercise === exercise);
      workouts.sort((a, b) => a.date.localeCompare(b.date) || a.id - b.id);
      return workouts;
    },

    async addWorkout(input) {
      const workouts = readJson(WORKOUTS_FILE);
      const id = workouts.reduce((max, w) => Math.max(max, w.id), 0) + 1;
      const workout = { id, ...input };
      workouts.push(workout);
      writeJson(WORKOUTS_FILE, workouts);
      return workout;
    },

    async updateWorkout(id, input) {
      const workouts = readJson(WORKOUTS_FILE);
      const index = workouts.findIndex((w) => w.id === id);
      if (index === -1) return null;
      workouts[index] = { id, ...input };
      writeJson(WORKOUTS_FILE, workouts);
      return workouts[index];
    },

    async deleteWorkout(id) {
      const workouts = readJson(WORKOUTS_FILE);
      const index = workouts.findIndex((w) => w.id === id);
      if (index === -1) return null;
      const [removed] = workouts.splice(index, 1);
      writeJson(WORKOUTS_FILE, workouts);
      return removed;
    },

    async listWeights() {
      const weights = readJson(WEIGHTS_FILE);
      weights.sort((a, b) => a.date.localeCompare(b.date));
      return weights;
    },

    async upsertWeight(date, weight) {
      const weights = readJson(WEIGHTS_FILE);
      const existing = weights.find((w) => w.date === date);
      if (existing) {
        existing.weight = weight;
      } else {
        weights.push({ date, weight });
      }
      writeJson(WEIGHTS_FILE, weights);
      return { date, weight };
    },

    async deleteWeight(date) {
      const weights = readJson(WEIGHTS_FILE);
      const index = weights.findIndex((w) => w.date === date);
      if (index === -1) return null;
      const [removed] = weights.splice(index, 1);
      writeJson(WEIGHTS_FILE, weights);
      return removed;
    },
  };
}

module.exports = { createFileStorage };
