// 筋トレ記録アプリのフロントエンド
// fetch で REST API を呼び出して画面を更新する

// ---- 共通 ----

const $ = (selector) => document.querySelector(selector);

function todayString() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// APIを呼んで、エラーレスポンス(400/404など)は例外にする
async function api(path, options) {
  const res = await fetch(path, options);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body.error || `エラーが発生しました (${res.status})`);
  }
  return body;
}

// ---- タブ切り替え ----

document.querySelectorAll('.tab-button').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab-button').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
    button.classList.add('active');
    $(`#tab-${button.dataset.tab}`).classList.add('active');
    // タブを開いたタイミングで表示を最新化する
    if (button.dataset.tab === 'history') renderHistory();
    if (button.dataset.tab === 'graph') renderGraphTab();
    if (button.dataset.tab === 'weight') renderWeightTab();
  });
});

// ---- 記録タブ ----

let editingId = null; // 編集中の記録ID（新規登録のときは null）

const workoutForm = $('#workout-form');
const workoutError = $('#workout-form-error');

$('#workout-date').value = todayString();
$('#workout-date').addEventListener('change', renderTodayList);

workoutForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  workoutError.hidden = true;

  const payload = {
    date: $('#workout-date').value,
    exercise: $('#workout-exercise').value,
    weight: Number($('#workout-weight').value),
    reps: Number($('#workout-reps').value),
    sets: Number($('#workout-sets').value),
  };

  try {
    if (editingId === null) {
      await api('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } else {
      await api(`/api/workouts/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }
    stopEditing();
    $('#workout-exercise').value = '';
    $('#workout-weight').value = '';
    $('#workout-reps').value = '';
    $('#workout-sets').value = '';
    await Promise.all([renderTodayList(), refreshExerciseList()]);
  } catch (err) {
    workoutError.textContent = err.message;
    workoutError.hidden = false;
  }
});

function startEditing(workout) {
  editingId = workout.id;
  $('#workout-form-title').textContent = '記録を編集';
  $('#workout-submit').textContent = '更新する';
  $('#workout-cancel-edit').hidden = false;
  $('#workout-date').value = workout.date;
  $('#workout-exercise').value = workout.exercise;
  $('#workout-weight').value = workout.weight;
  $('#workout-reps').value = workout.reps;
  $('#workout-sets').value = workout.sets;
  // 記録タブへ切り替えてフォームを見せる
  document.querySelector('.tab-button[data-tab="record"]').click();
  workoutForm.scrollIntoView({ behavior: 'smooth' });
}

function stopEditing() {
  editingId = null;
  $('#workout-form-title').textContent = '今日のトレーニングを記録';
  $('#workout-submit').textContent = '記録する';
  $('#workout-cancel-edit').hidden = true;
}

$('#workout-cancel-edit').addEventListener('click', stopEditing);

async function deleteWorkout(id) {
  if (!confirm('この記録を削除しますか？')) return;
  await api(`/api/workouts/${id}`, { method: 'DELETE' });
  await Promise.all([renderTodayList(), renderHistory()]);
}

// 記録1件分の表示行を作る
function workoutItemElement(workout) {
  const item = document.createElement('div');
  item.className = 'workout-item';

  const exercise = document.createElement('span');
  exercise.className = 'exercise';
  exercise.textContent = workout.exercise;

  const detail = document.createElement('span');
  detail.className = 'detail';
  detail.textContent = `${workout.weight}kg × ${workout.reps}回 × ${workout.sets}セット`;

  const buttons = document.createElement('div');
  buttons.className = 'item-buttons';

  const editButton = document.createElement('button');
  editButton.textContent = '編集';
  editButton.addEventListener('click', () => startEditing(workout));

  const deleteButton = document.createElement('button');
  deleteButton.className = 'delete';
  deleteButton.textContent = '削除';
  deleteButton.addEventListener('click', () => deleteWorkout(workout.id));

  buttons.append(editButton, deleteButton);
  item.append(exercise, detail, buttons);
  return item;
}

// フォームで選択中の日付の記録一覧
async function renderTodayList() {
  const date = $('#workout-date').value;
  const workouts = await api(`/api/workouts?date=${encodeURIComponent(date)}`);
  const list = $('#today-list');
  list.replaceChildren();
  if (workouts.length === 0) {
    const note = document.createElement('p');
    note.className = 'empty-note';
    note.textContent = 'この日の記録はまだありません。';
    list.append(note);
    return;
  }
  workouts.forEach((w) => list.append(workoutItemElement(w)));
}

// 種目入力のサジェスト（過去に入力した種目名）を更新
async function refreshExerciseList() {
  const workouts = await api('/api/workouts');
  const names = [...new Set(workouts.map((w) => w.exercise))].sort();
  const datalist = $('#exercise-list');
  datalist.replaceChildren();
  names.forEach((name) => {
    const option = document.createElement('option');
    option.value = name;
    datalist.append(option);
  });
  // グラフタブの種目セレクトも同じ一覧で更新
  const select = $('#graph-exercise');
  const selected = select.value;
  select.replaceChildren();
  names.forEach((name) => {
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    select.append(option);
  });
  if (names.includes(selected)) {
    select.value = selected;
  }
}

// ---- 履歴タブ ----

async function renderHistory() {
  const workouts = await api('/api/workouts');
  const container = $('#history-list');
  container.replaceChildren();

  if (workouts.length === 0) {
    const note = document.createElement('p');
    note.className = 'empty-note';
    note.textContent = 'まだ記録がありません。「記録する」タブから追加してみましょう。';
    container.append(note);
    return;
  }

  // 日付ごとにグループ化して新しい順に表示
  const byDate = new Map();
  workouts.forEach((w) => {
    if (!byDate.has(w.date)) byDate.set(w.date, []);
    byDate.get(w.date).push(w);
  });
  const dates = [...byDate.keys()].sort().reverse();

  dates.forEach((date) => {
    const heading = document.createElement('h3');
    heading.className = 'history-date';
    heading.textContent = date;
    container.append(heading);
    const list = document.createElement('div');
    list.className = 'workout-list';
    byDate.get(date).forEach((w) => list.append(workoutItemElement(w)));
    container.append(list);
  });
}

// ---- グラフ描画（Canvas 手描きの折れ線グラフ）----

const chartStates = new Map(); // canvas ごとのホバー用データ

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// points: [{ date, value }] を折れ線で描く
function drawLineChart(canvas, points, unit) {
  const wrap = canvas.parentElement;
  const cssWidth = wrap.clientWidth;
  const cssHeight = 220;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = cssWidth * dpr;
  canvas.height = cssHeight * dpr;

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, cssWidth, cssHeight);

  const padding = { top: 16, right: 16, bottom: 28, left: 48 };
  const plotWidth = cssWidth - padding.left - padding.right;
  const plotHeight = cssHeight - padding.top - padding.bottom;

  if (points.length === 0) {
    chartStates.delete(canvas);
    return;
  }

  const values = points.map((p) => p.value);
  let min = Math.min(...values);
  let max = Math.max(...values);
  if (min === max) {
    // 値が1種類だけのときは上下に幅を持たせる
    min -= 1;
    max += 1;
  }
  const range = max - min;
  min -= range * 0.1;
  max += range * 0.1;

  const xAt = (i) =>
    padding.left + (points.length === 1 ? plotWidth / 2 : (plotWidth * i) / (points.length - 1));
  const yAt = (v) => padding.top + plotHeight * (1 - (v - min) / (max - min));

  // 横のグリッド線と目盛りラベル
  ctx.strokeStyle = cssVar('--gridline');
  ctx.fillStyle = cssVar('--text-muted');
  ctx.font = '11px system-ui, sans-serif';
  ctx.lineWidth = 1;
  const gridCount = 4;
  // 値の幅が狭いときは整数に丸めるとラベルが重複するので小数1桁にする
  const decimals = max - min < gridCount ? 1 : 0;
  for (let g = 0; g <= gridCount; g++) {
    const value = min + ((max - min) * g) / gridCount;
    const y = yAt(value);
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(cssWidth - padding.right, y);
    ctx.stroke();
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
      padding.left - 6,
      y
    );
  }

  // X軸の日付ラベル（先頭・中央・末尾だけ表示して重なりを避ける）
  ctx.textBaseline = 'top';
  const labelIndexes = new Set([0, Math.floor((points.length - 1) / 2), points.length - 1]);
  labelIndexes.forEach((i) => {
    const label = points[i].date.slice(5).replace('-', '/'); // MM/DD
    ctx.textAlign = i === 0 ? 'left' : i === points.length - 1 ? 'right' : 'center';
    ctx.fillText(label, xAt(i), cssHeight - padding.bottom + 8);
  });

  // 折れ線
  const lineColor = cssVar('--series-1');
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  points.forEach((p, i) => {
    if (i === 0) ctx.moveTo(xAt(i), yAt(p.value));
    else ctx.lineTo(xAt(i), yAt(p.value));
  });
  ctx.stroke();

  // データ点（surface色の縁取りで線と区別する）
  points.forEach((p, i) => {
    ctx.beginPath();
    ctx.arc(xAt(i), yAt(p.value), 4, 0, Math.PI * 2);
    ctx.fillStyle = lineColor;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = cssVar('--surface');
    ctx.stroke();
  });

  // ホバー用に描画情報を覚えておく
  chartStates.set(canvas, {
    points,
    unit,
    xs: points.map((_, i) => xAt(i)),
    ys: points.map((p) => yAt(p.value)),
  });
}

// ツールチップ（マウスに一番近い点の日付と値を出す）
const tooltip = $('#chart-tooltip');

function attachChartHover(canvas) {
  canvas.addEventListener('mousemove', (event) => {
    const state = chartStates.get(canvas);
    if (!state) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    let nearest = 0;
    state.xs.forEach((x, i) => {
      if (Math.abs(x - mouseX) < Math.abs(state.xs[nearest] - mouseX)) nearest = i;
    });
    const point = state.points[nearest];
    tooltip.innerHTML = '';
    const dateSpan = document.createElement('span');
    dateSpan.className = 'tip-date';
    dateSpan.textContent = `${point.date} `;
    const valueSpan = document.createElement('span');
    valueSpan.className = 'tip-value';
    valueSpan.textContent = `${point.value.toLocaleString()}${state.unit}`;
    tooltip.append(dateSpan, valueSpan);
    tooltip.hidden = false;
    tooltip.style.left = `${rect.left + state.xs[nearest] + 12}px`;
    tooltip.style.top = `${rect.top + state.ys[nearest] - 36}px`;
  });
  canvas.addEventListener('mouseleave', () => {
    tooltip.hidden = true;
  });
}

['#chart-max-weight', '#chart-volume', '#chart-body-weight'].forEach((id) =>
  attachChartHover($(id))
);

// ---- グラフタブ ----

$('#graph-exercise').addEventListener('change', renderGraphCharts);

async function renderGraphTab() {
  await refreshExerciseList();
  await renderGraphCharts();
}

async function renderGraphCharts() {
  const exercise = $('#graph-exercise').value;
  const emptyNote = $('#graph-empty');
  if (!exercise) {
    emptyNote.hidden = false;
    drawLineChart($('#chart-max-weight'), [], 'kg');
    drawLineChart($('#chart-volume'), [], 'kg');
    return;
  }
  emptyNote.hidden = true;

  // クエリ文字列で種目を絞り込んで取得
  const workouts = await api(`/api/workouts?exercise=${encodeURIComponent(exercise)}`);

  // 日付ごとに「最大重量」と「総ボリューム」を集計
  const byDate = new Map();
  workouts.forEach((w) => {
    if (!byDate.has(w.date)) byDate.set(w.date, { maxWeight: 0, volume: 0 });
    const entry = byDate.get(w.date);
    entry.maxWeight = Math.max(entry.maxWeight, w.weight);
    entry.volume += w.weight * w.reps * w.sets;
  });
  const dates = [...byDate.keys()].sort();

  drawLineChart(
    $('#chart-max-weight'),
    dates.map((date) => ({ date, value: byDate.get(date).maxWeight })),
    'kg'
  );
  drawLineChart(
    $('#chart-volume'),
    dates.map((date) => ({ date, value: byDate.get(date).volume })),
    'kg'
  );
}

// ---- 体重タブ ----

const weightForm = $('#weight-form');
const weightError = $('#weight-form-error');

$('#weight-date').value = todayString();

weightForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  weightError.hidden = true;
  try {
    await api('/api/weights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: $('#weight-date').value,
        weight: Number($('#weight-value').value),
      }),
    });
    $('#weight-value').value = '';
    await renderWeightTab();
  } catch (err) {
    weightError.textContent = err.message;
    weightError.hidden = false;
  }
});

async function deleteWeight(date) {
  if (!confirm(`${date} の体重記録を削除しますか？`)) return;
  await api(`/api/weights/${date}`, { method: 'DELETE' });
  await renderWeightTab();
}

async function renderWeightTab() {
  const weights = await api('/api/weights');
  $('#weight-empty').hidden = weights.length > 0;

  drawLineChart(
    $('#chart-body-weight'),
    weights.map((w) => ({ date: w.date, value: w.weight })),
    'kg'
  );

  // 新しい順の一覧（削除ボタン付き）
  const list = $('#weight-list');
  list.replaceChildren();
  [...weights].reverse().forEach((w) => {
    const item = document.createElement('div');
    item.className = 'weight-item';

    const date = document.createElement('span');
    date.className = 'date';
    date.textContent = w.date;

    const detail = document.createElement('span');
    detail.className = 'detail';
    detail.textContent = `${w.weight}kg`;

    const buttons = document.createElement('div');
    buttons.className = 'item-buttons';
    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete';
    deleteButton.textContent = '削除';
    deleteButton.addEventListener('click', () => deleteWeight(w.date));
    buttons.append(deleteButton);

    item.append(date, detail, buttons);
    list.append(item);
  });
}

// 画面サイズが変わったら表示中のグラフを描き直す
window.addEventListener('resize', () => {
  if ($('#tab-graph').classList.contains('active')) renderGraphCharts();
  if ($('#tab-weight').classList.contains('active')) renderWeightTab();
});

// ---- 初期表示 ----

renderTodayList();
refreshExerciseList();
