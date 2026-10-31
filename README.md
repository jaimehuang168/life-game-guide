# 人生遊戲秘笈 2027–2048（個人 web app）

只給自己用的加密網頁。repo 裡只有加密後的 `index.html`；未加密的內容在 `private/app.html`，被 `.gitignore` 擋住，不會上傳。

## 第一次部署（Mac）

```bash
cd life-game-guide
chmod +x deploy.sh
./deploy.sh            # 會要你設定密碼兩次，然後建 repo、push、開 GitHub Pages
```

完成後網址是 `https://<你的帳號>.github.io/life-game-guide/`。

- 需要：`git`、Node 18 以上、`gh`（先 `gh auth login`）。
- 免費 GitHub 帳號的 Pages 只能從 public repo 發佈，所以預設建 public repo；公開的只有加密檔、圖示與程式碼。
- 有 GitHub Pro 想用 private repo：`VISIBILITY=private ./deploy.sh`（Pages 網址本身仍可被連到，但內容一樣要密碼）。

## 日常使用

- 手機用 Safari／Chrome 打開網址 →「加入主畫面」，就像一個 App，也能離線開。
- 勾「在這台裝置記住」就不用每次輸入密碼；按頁首的「鎖定」會清掉這台裝置的記憶。
- 「今天」按鈕直接跳到當月的流月秘笈；「已通關」勾選只存在該裝置。

## 換密碼或更新內容

把新的 `private/app.html` 放進來（或不動它），再跑一次 `./deploy.sh`，輸入新密碼即可。舊密碼會失效，各裝置下次開啟時重新輸入。

## 安全說明

AES-256-GCM 加密，金鑰由密碼經 PBKDF2-SHA256（60 萬次）推導。安全性取決於密碼強度：請用 12 個字元以上、不在別處用過的密碼。忘記密碼無法救回，只能用 `private/app.html` 重新加密。

以上內容僅供研究與娛樂參考，不構成醫療、財務或法律建議。
