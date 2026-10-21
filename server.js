// 筋トレ記録アプリのサーバー
// Express で静的ファイル配信 + REST API を提供する
const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, 'data');
const WORKOUTS_FILE = path.join(DATA_DIR, 'workouts.json');
const WEIGHTS_FILE = path.join(DATA_DIR, 'weights.json');

// データ保存用ディレクトリ・ファイルがなければ作る
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
for (const file of [WORKOUTS_FILE, WEIGHTS_FILE]) {
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, '[]');
  }
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---- バリデーション ----

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

// トレーニング記録の入力チェック。問題があればエラーメッセージ、なければ null を返す
function validateWorkout(body) {
  const { date, exercise, weight, reps, sets } = body;
  if (!date || !DATE_PATTERN.test(date)) {
    return '日付は YYYY-MM-DD 形式で指定してください';
  }
  if (!exercise || typeof exercise !== 'string' || exercise.trim() === '') {
    return '種目名を入力してください';
  }
  for (const [name, value] of [['重量', weight], ['回数', reps], ['セット数', sets]]) {
    if (typeof value !== 'number' || !isFinite(value) || value < 0) {
      return `${name}は 0 以上の数値で入力してください`;
    }
  }
  if (!Number.isInteger(reps) || !Number.isInteger(sets) || reps < 1 || sets < 1) {
    return '回数・セット数は 1 以上の整数で入力してください';
  }
  return null;
}

// ---- トレーニング記録 API ----

// 一覧取得。クエリ文字列 ?date=YYYY-MM-DD / ?exercise=種目名 で絞り込みできる
app.get('/api/workouts', (req, res) => {
  let workouts = readJson(WORKOUTS_FILE);
  const { date, exercise } = req.query;
  if (date) {
    workouts = workouts.filter((w) => w.date === date);
  }
  if (exercise) {
    workouts = workouts.filter((w) => w.exercise === exercise);
  }
  res.status(200).json(workouts);
});

// 記録の追加
app.post('/api/workouts', (req, res) => {
  const error = validateWorkout(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  const workouts = readJson(WORKOUTS_FILE);
  const workout = {
    id: Date.now(),
    date: req.body.date,
    exercise: req.body.exercise.trim(),
    weight: req.body.weight,
    reps: req.body.reps,
    sets: req.body.sets,
  };
  workouts.push(workout);
  writeJson(WORKOUTS_FILE, workouts);
  res.status(201).json(workout);
});

// パスパラメータ :id で指定した記録の更新
app.put('/api/workouts/:id', (req, res) => {
  const id = Number(req.params.id);
  const workouts = readJson(WORKOUTS_FILE);
  const index = workouts.findIndex((w) => w.id === id);
  if (index === -1) {
    return res.status(404).json({ error: '指定された記録が見つかりません' });
  }
  const error = validateWorkout(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  workouts[index] = {
    id,
    date: req.body.date,
    exercise: req.body.exercise.trim(),
    weight: req.body.weight,
    reps: req.body.reps,
    sets: req.body.sets,
  };
  writeJson(WORKOUTS_FILE, workouts);
  res.status(200).json(workouts[index]);
});

// 記録の削除
app.delete('/api/workouts/:id', (req, res) => {
  const id = Number(req.params.id);
  const workouts = readJson(WORKOUTS_FILE);
  const index = workouts.findIndex((w) => w.id === id);
  if (index === -1) {
    return res.status(404).json({ error: '指定された記録が見つかりません' });
  }
  const [removed] = workouts.splice(index, 1);
  writeJson(WORKOUTS_FILE, workouts);
  res.status(200).json(removed);
});

// ---- 体重記録 API ----

app.get('/api/weights', (req, res) => {
  const weights = readJson(WEIGHTS_FILE);
  weights.sort((a, b) => a.date.localeCompare(b.date));
  res.status(200).json(weights);
});

// 体重の追加。同じ日付があれば上書きする
app.post('/api/weights', (req, res) => {
  const { date, weight } = req.body;
  if (!date || !DATE_PATTERN.test(date)) {
    return res.status(400).json({ error: '日付は YYYY-MM-DD 形式で指定してください' });
  }
  if (typeof weight !== 'number' || !isFinite(weight) || weight <= 0) {
    return res.status(400).json({ error: '体重は 0 より大きい数値で入力してください' });
  }
  const weights = readJson(WEIGHTS_FILE);
  const existing = weights.find((w) => w.date === date);
  if (existing) {
    existing.weight = weight;
  } else {
    weights.push({ date, weight });
  }
  writeJson(WEIGHTS_FILE, weights);
  res.status(201).json({ date, weight });
});

// パスパラメータ :date で指定した日の体重記録を削除
app.delete('/api/weights/:date', (req, res) => {
  const weights = readJson(WEIGHTS_FILE);
  const index = weights.findIndex((w) => w.date === req.params.date);
  if (index === -1) {
    return res.status(404).json({ error: '指定された日付の記録が見つかりません' });
  }
  const [removed] = weights.splice(index, 1);
  writeJson(WEIGHTS_FILE, weights);
  res.status(200).json(removed);
});

app.listen(PORT, () => {
  console.log(`筋トレ記録アプリを起動しました: http://localhost:${PORT}`);
});
