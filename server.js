// 筋トレ記録アプリのサーバー
// Express で静的ファイル配信 + REST API を提供する
const express = require('express');
const path = require('path');
const { createStorage } = require('./storage');
const { createAuth } = require('./auth');

const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

// 公開環境でパスワードなしだと誰でも記録を見られてしまうので、起動を止める
if (isProduction && (!process.env.APP_PASSWORD || !process.env.SESSION_SECRET)) {
  console.error('本番環境では環境変数 APP_PASSWORD と SESSION_SECRET を設定してください');
  process.exit(1);
}

const storage = createStorage();
const auth = createAuth({
  password: process.env.APP_PASSWORD,
  secret: process.env.SESSION_SECRET,
  secureCookie: isProduction,
});

const app = express();

// Render などのホスティングでは前段のプロキシ経由で届くので、
// 本当の接続元IP（ログイン失敗の回数制限に使う）を取れるようにする
if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ---- ログイン ----

app.get('/api/session', auth.sessionHandler);
app.post('/api/login', auth.loginHandler);
app.post('/api/logout', auth.logoutHandler);

// ここから下の /api はログインが必要
app.use('/api', auth.requireLogin);

// ---- バリデーション ----

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_EXERCISE_LENGTH = 50;

// トレーニング記録の入力チェック。問題があればエラーメッセージ、なければ null を返す
function validateWorkout(body) {
  const { date, exercise, weight, reps, sets } = body ?? {};
  if (!date || !DATE_PATTERN.test(date)) {
    return '日付は YYYY-MM-DD 形式で指定してください';
  }
  if (!exercise || typeof exercise !== 'string' || exercise.trim() === '') {
    return '種目名を入力してください';
  }
  if (exercise.trim().length > MAX_EXERCISE_LENGTH) {
    return `種目名は ${MAX_EXERCISE_LENGTH} 文字以内で入力してください`;
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

function workoutFromBody(body) {
  return {
    date: body.date,
    exercise: body.exercise.trim(),
    weight: body.weight,
    reps: body.reps,
    sets: body.sets,
  };
}

// パスパラメータの :id を数値にする。数値でなければ null
function parseId(param) {
  const id = Number(param);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// ---- トレーニング記録 API ----

// 一覧取得。クエリ文字列 ?date=YYYY-MM-DD / ?exercise=種目名 で絞り込みできる
app.get('/api/workouts', async (req, res) => {
  const { date, exercise } = req.query;
  const workouts = await storage.listWorkouts({ date, exercise });
  res.status(200).json(workouts);
});

// 記録の追加
app.post('/api/workouts', async (req, res) => {
  const error = validateWorkout(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  const workout = await storage.addWorkout(workoutFromBody(req.body));
  res.status(201).json(workout);
});

// パスパラメータ :id で指定した記録の更新
app.put('/api/workouts/:id', async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) {
    return res.status(404).json({ error: '指定された記録が見つかりません' });
  }
  const error = validateWorkout(req.body);
  if (error) {
    return res.status(400).json({ error });
  }
  const workout = await storage.updateWorkout(id, workoutFromBody(req.body));
  if (!workout) {
    return res.status(404).json({ error: '指定された記録が見つかりません' });
  }
  res.status(200).json(workout);
});

// 記録の削除
app.delete('/api/workouts/:id', async (req, res) => {
  const id = parseId(req.params.id);
  const removed = id === null ? null : await storage.deleteWorkout(id);
  if (!removed) {
    return res.status(404).json({ error: '指定された記録が見つかりません' });
  }
  res.status(200).json(removed);
});

// ---- 体重記録 API ----

app.get('/api/weights', async (req, res) => {
  const weights = await storage.listWeights();
  res.status(200).json(weights);
});

// 体重の追加。同じ日付があれば上書きする
app.post('/api/weights', async (req, res) => {
  const { date, weight } = req.body ?? {};
  if (!date || !DATE_PATTERN.test(date)) {
    return res.status(400).json({ error: '日付は YYYY-MM-DD 形式で指定してください' });
  }
  if (typeof weight !== 'number' || !isFinite(weight) || weight <= 0) {
    return res.status(400).json({ error: '体重は 0 より大きい数値で入力してください' });
  }
  const saved = await storage.upsertWeight(date, weight);
  res.status(201).json(saved);
});

// パスパラメータ :date で指定した日の体重記録を削除
app.delete('/api/weights/:date', async (req, res) => {
  const removed = await storage.deleteWeight(req.params.date);
  if (!removed) {
    return res.status(404).json({ error: '指定された日付の記録が見つかりません' });
  }
  res.status(200).json(removed);
});

// ---- エラー処理 ----

// 予期しないエラー（データベースに繋がらない等）は 500 を返す
app.use((err, req, res, next) => {
  console.error(err);
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON の形式が正しくありません' });
  }
  res.status(500).json({ error: 'サーバーでエラーが発生しました' });
});

storage
  .init()
  .then(() => {
    // Express 5 では、ポートが使用中などで起動に失敗したときも err 付きでここが呼ばれる
    app.listen(PORT, (err) => {
      if (err) {
        console.error(`サーバーを起動できませんでした (ポート ${PORT}):`, err.message);
        process.exit(1);
      }
      console.log(`保存先: ${storage.name} / ログイン: ${auth.enabled ? 'あり' : 'なし'}`);
      console.log(`筋トレ記録アプリを起動しました: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('保存先の準備に失敗しました:', err.message);
    process.exit(1);
  });
