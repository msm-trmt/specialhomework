// パスワード1つでログインするシンプルな認証
// - 環境変数 APP_PASSWORD がログインパスワード（未設定ならログインなしで使える）
// - ログイン状態は「有効期限 + 署名」を入れた Cookie で覚える。
//   署名は SESSION_SECRET を鍵にした HMAC なので、Cookie を書き換えても偽造できない
const crypto = require('crypto');

const COOKIE_NAME = 'session';
const SESSION_DAYS = 90; // スマホで毎回ログインしなくていいよう長めにする
const MAX_FAILED_LOGINS = 10;
const FAILED_LOGIN_WINDOW_MS = 15 * 60 * 1000;

function createAuth({ password, secret, secureCookie }) {
  const enabled = Boolean(password);
  // SESSION_SECRET が無いとき（ローカル）は起動ごとにランダムな鍵を使う
  const key = secret || crypto.randomBytes(32).toString('hex');
  const failedLogins = new Map(); // IPアドレス → { count, resetAt }

  function sign(value) {
    return crypto.createHmac('sha256', key).update(value).digest('base64url');
  }

  // 長さの違う文字列も比較できるよう、ハッシュにしてから一定時間で比較する
  function safeEqual(a, b) {
    const hashA = crypto.createHash('sha256').update(a).digest();
    const hashB = crypto.createHash('sha256').update(b).digest();
    return crypto.timingSafeEqual(hashA, hashB);
  }

  function readCookie(req) {
    const header = req.headers.cookie || '';
    for (const part of header.split(';')) {
      const [name, ...rest] = part.trim().split('=');
      if (name === COOKIE_NAME) return rest.join('=');
    }
    return null;
  }

  function isLoggedIn(req) {
    if (!enabled) return true;
    const cookie = readCookie(req);
    if (!cookie) return false;
    const [expiresAt, signature] = cookie.split('.');
    if (!expiresAt || !signature) return false;
    if (!safeEqual(signature, sign(expiresAt))) return false;
    return Number(expiresAt) > Date.now();
  }

  function cookieOptions() {
    return {
      httpOnly: true, // JavaScript から読めないようにする
      sameSite: 'lax', // 他サイトからのリクエストには Cookie を付けない
      secure: secureCookie, // 本番(HTTPS)では暗号化された通信でだけ送る
      path: '/',
    };
  }

  // 同じIPからのログイン失敗が続いたら一時的に受け付けない（総当たり対策）
  function isLockedOut(ip) {
    const entry = failedLogins.get(ip);
    if (!entry) return false;
    if (entry.resetAt < Date.now()) {
      failedLogins.delete(ip);
      return false;
    }
    return entry.count >= MAX_FAILED_LOGINS;
  }

  function recordFailure(ip) {
    const now = Date.now();
    const entry = failedLogins.get(ip);
    if (!entry || entry.resetAt < now) {
      failedLogins.set(ip, { count: 1, resetAt: now + FAILED_LOGIN_WINDOW_MS });
    } else {
      entry.count += 1;
    }
  }

  return {
    enabled,

    // GET /api/session — 今ログインしているかを返す
    sessionHandler(req, res) {
      res.status(200).json({ authRequired: enabled, loggedIn: isLoggedIn(req) });
    },

    // POST /api/login — パスワードが合っていれば Cookie を発行する
    loginHandler(req, res) {
      if (!enabled) {
        return res.status(200).json({ loggedIn: true });
      }
      if (isLockedOut(req.ip)) {
        return res.status(429).json({
          error: 'ログインの失敗が続いたため、しばらく時間をおいてから試してください',
        });
      }
      const input = typeof req.body?.password === 'string' ? req.body.password : '';
      if (!safeEqual(input, password)) {
        recordFailure(req.ip);
        return res.status(401).json({ error: 'パスワードが違います' });
      }
      failedLogins.delete(req.ip);
      const maxAge = SESSION_DAYS * 24 * 60 * 60 * 1000;
      const expiresAt = String(Date.now() + maxAge);
      res.cookie(COOKIE_NAME, `${expiresAt}.${sign(expiresAt)}`, { ...cookieOptions(), maxAge });
      res.status(200).json({ loggedIn: true });
    },

    // POST /api/logout — Cookie を消す
    logoutHandler(req, res) {
      res.clearCookie(COOKIE_NAME, cookieOptions());
      res.status(200).json({ loggedIn: false });
    },

    // ログインしていないリクエストは 401 で止めるミドルウェア
    requireLogin(req, res, next) {
      if (isLoggedIn(req)) return next();
      res.status(401).json({ error: 'ログインしてください' });
    },
  };
}

module.exports = { createAuth };
