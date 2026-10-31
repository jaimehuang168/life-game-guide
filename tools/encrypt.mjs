// 把 private/app.html 用密碼加密，輸出可公開部署的 index.html。
// 用法：node tools/encrypt.mjs          （互動輸入密碼兩次）
//      LG_PASSWORD=... node tools/encrypt.mjs   （非互動）
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { randomBytes, pbkdf2Sync, createCipheriv } from 'node:crypto';
import { createInterface } from 'node:readline';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'private', 'app.html');
if (!existsSync(src)) { console.error('找不到 private/app.html'); process.exit(1); }

function ask(q) {
  return new Promise(res => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    rl._writeToOutput = s => { if (s.includes(q)) process.stdout.write(q); };
    rl.question(q, a => { rl.close(); process.stdout.write('\n'); res(a); });
  });
}

let pw = process.env.LG_PASSWORD;
if (!pw) {
  pw = await ask('設定密碼（至少 10 個字元）：');
  const again = await ask('再輸入一次：');
  if (pw !== again) { console.error('兩次密碼不一致'); process.exit(1); }
}
if (!pw || pw.length < 10) { console.error('密碼太短，請至少 10 個字元'); process.exit(1); }

const ITER = 600000;
const salt = randomBytes(16), iv = randomBytes(12);
const key = pbkdf2Sync(pw, salt, ITER, 32, 'sha256');
const c = createCipheriv('aes-256-gcm', key, iv);
const ct = Buffer.concat([c.update(readFileSync(src)), c.final(), c.getAuthTag()]);
const payload = { v: 1, iter: ITER, salt: salt.toString('base64'), iv: iv.toString('base64'), ct: ct.toString('base64') };

const shell = readFileSync(join(root, 'tools', 'shell.html'), 'utf8');
if (!shell.includes('/*PAYLOAD*/null')) { console.error('shell.html 缺少 PAYLOAD 位置'); process.exit(1); }
writeFileSync(join(root, 'index.html'), shell.replace('/*PAYLOAD*/null', JSON.stringify(payload)));
console.log('已產生加密的 index.html（' + Math.round(ct.length / 1024) + ' KB）');
