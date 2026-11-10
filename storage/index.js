// 環境変数 DATABASE_URL があれば PostgreSQL、なければ JSON ファイルに保存する
const { createFileStorage } = require('./fileStorage');
const { createPgStorage } = require('./pgStorage');

function createStorage() {
  if (process.env.DATABASE_URL) {
    return createPgStorage(process.env.DATABASE_URL);
  }
  return createFileStorage();
}

module.exports = { createStorage };
