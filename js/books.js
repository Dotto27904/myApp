/* -----------------------------------
   初期設定
----------------------------------- */
let currentSort = "yomi";
let currentGroup = "ア行";
let duplicateAlertShown = false;
let cameraStopped = false;
let lastCode = "";
let isProcessing = false;

let booksDB = null;
let booksCache = [];

/* -----------------------------------
   IndexedDB 初期化
----------------------------------- */
function initBooksDB() {
  const req = indexedDB.open("BooksDB", 1);

  req.onupgradeneeded = function (e) {
    const db = e.target.result;

    if (!db.objectStoreNames.contains("books")) {
      db.createObjectStore("books", { keyPath: "isbn" });
    }

    if (!db.objectStoreNames.contains("backup")) {
      db.createObjectStore("backup", { keyPath: "id" });
    }
  };

  req.onsuccess = function (e) {
    booksDB = e.target.result;
    loadBooksFromDB();
  };
}

/* -----------------------------------
   書籍読み込み（booksCache に反映）
----------------------------------- */
function loadBooksFromDB() {
  const tx = booksDB.transaction("books", "readonly");
  const store = tx.objectStore("books");
  const req = store.getAll();

  req.onsuccess = function () {
    booksCache = req.result || [];
    renderBookList(currentSort, currentGroup);
  };
}

/* -----------------------------------
   書籍保存
----------------------------------- */
function saveBook(info) {
  const tx = booksDB.transaction("books", "readwrite");
  const store = tx.objectStore("books");
  store.put(info);

  tx.oncomplete = function () {
    loadBooksFromDB();
  };
}

/* -----------------------------------
   書籍削除
----------------------------------- */
function deleteBook(isbn) {
  const tx = booksDB.transaction("books", "readwrite");
  const store = tx.objectStore("books");
  store.delete(isbn);

  tx.oncomplete = function () {
    loadBooksFromDB();
  };
}

/* -----------------------------------
   重複チェック（IndexedDB版）
----------------------------------- */
function isDuplicate(info) {
  return booksCache.some(book => book.isbn === info.isbn);
}

/* -----------------------------------
   カタカナ → ひらがな
----------------------------------- */
function kataToHira(str) {
  return str.replace(/[\u30A1-\u30F6]/g, m => String.fromCharCode(m.charCodeAt(0) - 0x60));
}

/* -----------------------------------
   よみ生成
----------------------------------- */
function normalizeYomi(str) {
  if (!str) return "";
  let t = kataToHira(str);
  t = t.replace(/[・。、「」『』（）()\s]/g, "");
  return t;
}

function fallbackYomi(title) {
  return normalizeYomi(title);
}

/* -----------------------------------
   OpenBD API
----------------------------------- */
async function fetchBookInfo(isbn) {
  const url = `https://api.openbd.jp/v1/get?isbn=${isbn}`;
  const response = await fetch(url);
  const data = await response.json();

  if (!data[0]) return null;

  const summary = data[0].summary;
  const title = summary.title || "タイトル不明";
  const author = summary.author || "著者不明";

  let yomi = "";
  try {
    yomi = data[0].onix.DescriptiveDetail.TitleDetail.TitleElement.TitleText.collationkey || "";
  } catch {
    yomi = "";
  }

  if (!yomi) yomi = fallbackYomi(title);
  else yomi = normalizeYomi(yomi);

  return { isbn, title, author, yomi };
}

/* -----------------------------------
   行判定
----------------------------------- */
function normalizeFirstKana(ch) {
  const map = {
    "が":"か","ぎ":"き","ぐ":"く","げ":"け","ご":"こ",
    "ざ":"さ","じ":"し","ず":"す","ぜ":"せ","ぞ":"そ",
    "だ":"た","ぢ":"ち","づ":"つ","で":"て","ど":"と",
    "ば":"は","び":"ひ","ぶ":"ふ","べ":"へ","ぼ":"ほ",
    "ぱ":"は","ぴ":"ひ","ぷ":"ふ","ぺ":"へ","ぽ":"ほ",
    "ぁ":"あ","ぃ":"い","ぅ":"う","ぇ":"え","ぉ":"お",
    "ゃ":"や","ゅ":"ゆ","ょ":"よ",
    "っ":"つ"
  };
  return map[ch] || ch;
}

function getGroupFromYomi(yomi) {
  if (!yomi) return "その他";
  const first = normalizeFirstKana(yomi.charAt(0));

  if ("あいうえお".includes(first)) return "ア行";
  if ("かきくけこ".includes(first)) return "カ行";
  if ("さしすせそ".includes(first)) return "サ行";
  if ("たちつてと".includes(first)) return "タ行";
  if ("なにぬねの".includes(first)) return "ナ行";
  if ("はひふへほ".includes(first)) return "ハ行";
  if ("まみむめも".includes(first)) return "マ行";
  if ("やゆよ".includes(first)) return "ヤ行";
  if ("らりるれろ".includes(first)) return "ラ行";
  if ("わをん".includes(first)) return "ワ行";

  return "その他";
}

/* -----------------------------------
   一覧表示（IndexedDB版）
----------------------------------- */
function renderBookList(sortType = "yomi", group = null, topIsbn = null) {
  currentSort = sortType;
  if (group !== null) currentGroup = group;

  let books = booksCache.filter(book => getGroupFromYomi(book.yomi) === currentGroup);
  books.sort((a, b) => (a.yomi || "").localeCompare(b.yomi || ""));

  if (topIsbn) {
    const idx = books.findIndex(b => b.isbn === topIsbn);
    if (idx > -1) {
      const [target] = books.splice(idx, 1);
      books.unshift(target);
    }
  }

  const list = document.getElementById("book-list");
  list.innerHTML = "";

  books.forEach(book => {
    const div = document.createElement("div");
    div.style.margin = "8px 0";
    div.style.padding = "8px";
    div.style.border = "1px solid #ccc";

    div.innerHTML = `
      <strong>${book.title}</strong><br>
      著者：${book.author}<br>
      よみ：${book.yomi}<br>
      ISBN：${book.isbn}<br>
      <button onclick="deleteBook('${book.isbn}')">削除</button>
    `;

    list.appendChild(div);
  });
}
/* -----------------------------------
   手動登録フォーム
----------------------------------- */
function showManualEntryForm() {
  const top = document.getElementById("top-area");
  top.innerHTML = "";

  const wrap = document.createElement("div");
  wrap.style = "padding:20px;";

  wrap.innerHTML = `
    <h3>手動登録</h3>

    ISBN：<br>
    <input id="m-isbn" type="text" value=""><br><br>

    タイトル：<br>
    <input id="m-title" type="text"><br><br>

    著者：<br>
    <input id="m-author" type="text"><br><br>

    よみ：<br>
    <input id="m-yomi" type="text"
           oninput="this.value = this.value.replace(/[^ぁ-んa-zA-Z0-9ー]/g, '');"><br><br>

    <button onclick="manualSave()">登録する</button>
    <button onclick="drawTopButtons()">キャンセル</button>
  `;

  top.appendChild(wrap);
}

/* -----------------------------------
   手動登録
----------------------------------- */
function manualSave() {
  const info = {
    isbn: document.getElementById("m-isbn").value,
    title: document.getElementById("m-title").value,
    author: document.getElementById("m-author").value,
    yomi: document.getElementById("m-yomi").value
  };

  if (!info.title || !info.yomi) {
    alert("タイトル・よみは必須です");
    return;
  }

  if (!info.isbn) {
    info.isbn = "temp_" + Date.now();
  }

  if (isDuplicate(info)) {
    alert("この本はすでに登録されています");
    drawTopButtons();
    return;
  }

  saveBook(info);

  const group = getGroupFromYomi(info.yomi);

  renderBookList("yomi", group, info.isbn);

  alert("登録しました");

  setTimeout(drawTopButtons, 10);
  document.getElementById("middle-area").innerHTML = "";
}

/* -----------------------------------
   カメラ読み取り（競合対策版）
----------------------------------- */
function showCamera() {
  duplicateAlertShown = false;
  cameraStopped = false;
  isProcessing = false;
  lastCode = "";

  const top = document.getElementById("top-area");
  top.innerHTML = "";
  const camDiv = document.createElement("div");
  camDiv.id = "camera";
  camDiv.style = "width:100%; max-width:400px; margin:auto;";
  top.appendChild(camDiv);

  const mid = document.getElementById("middle-area");
  mid.innerHTML = "";
  const stopBtn = document.createElement("button");
  stopBtn.textContent = "読み取りを終わる";
  stopBtn.style = "padding:10px 20px; font-size:18px;";
  stopBtn.onclick = stopCamera;
  mid.appendChild(stopBtn);

  let lastScanTime = 0;

  Quagga.init({
    inputStream: {
      name: "Live",
      type: "LiveStream",
      target: document.querySelector('#camera'),
      constraints: { facingMode: "environment" }
    },
    decoder: { readers: ["ean_reader"] }
  }, function(err) {
    if (err) { console.log(err); return; }
    Quagga.start();
  });

  Quagga.onDetected(async function(data) {

    // ★ 最初に処理中チェック（複数発火防止）
    if (isProcessing) return;
    isProcessing = true;

    const now = Date.now();
    const code = data.codeResult.code;

    // ISBN でない場合は何もしない（カメラ継続）
    if (!code.startsWith("978") && !code.startsWith("979")) {
      isProcessing = false;
      return;
    }

    // 同じコードを短時間に連続検出した場合もスルー（カメラ継続）
    if (code === lastCode && now - lastScanTime < 3000) {
      isProcessing = false;
      return;
    }

    lastCode = code;
    lastScanTime = now;

    const isbn = code;
    const info = await fetchBookInfo(isbn);

    // ★ OpenBD にデータがない場合
    if (!info) {
      alert("書誌データがありません（OpenBDに情報なし）\n手動登録できます。");

      cameraStopped = true;
      Quagga.stop();

      showManualEntryForm();
      isProcessing = false;
      return;
    }

    // ★ 重複チェック
    if (isDuplicate(info)) {
      alert("この本はすでに登録されています");

      cameraStopped = true;
      Quagga.stop();

      drawTopButtons();
      isProcessing = false;
      return;
    }

    // ★ 取り込み確認
    const ok = confirm(
      `タイトル：${info.title}\n著者：${info.author}\n\n取り込みますか？`
    );

    if (ok) {
      saveBook(info);

      const group = getGroupFromYomi(info.yomi);

      // ★ IndexedDB 書き込み完了を待つ（競合防止）
      setTimeout(() => {
        renderBookList("yomi", group, info.isbn);
        alert("登録しました");

        cameraStopped = true;
        Quagga.stop();

        drawTopButtons();
        document.getElementById("middle-area").innerHTML = "";
        isProcessing = false;
      }, 200);

      return;
    }

    // ★ ユーザーがキャンセルした場合
    cameraStopped = true;
    Quagga.stop();

    drawTopButtons();
    isProcessing = false;
  });
}

/* -----------------------------------
   カメラ停止
----------------------------------- */
function stopCamera() {
  cameraStopped = true;
  Quagga.stop();
  const cam = document.querySelector('#camera');
  if (cam) cam.innerHTML = "";
  drawTopButtons();
}

/* -----------------------------------
   上段ボタン描画
----------------------------------- */
function drawTopButtons() {
  const top = document.getElementById("top-area");
  top.innerHTML = "";

  const btn1 = document.createElement("button");
  btn1.textContent = "バーコード読み込み";
  btn1.style = "padding:10px 20px; font-size:18px;";
  btn1.onclick = showCamera;

  const btn2 = document.createElement("button");
  btn2.textContent = "手動登録";
  btn2.style = "padding:10px 20px; font-size:18px; margin-left:10px;";
  btn2.onclick = () => showManualEntryForm();

  top.appendChild(btn1);
  top.appendChild(btn2);
}

/* -----------------------------------
   バックアップ保存（競合完全対策版）
----------------------------------- */
function saveBackup(retry = 0) {
  try {
    const tx = booksDB.transaction("books", "readonly");
    const store = tx.objectStore("books");
    const req = store.getAll();

    req.onsuccess = function () {
      const books = req.result || [];
      const json = JSON.stringify(books);
      const encoded = btoa(json);

      const tx2 = booksDB.transaction("backup", "readwrite");
      const store2 = tx2.objectStore("backup");
      store2.put({ id: 1, data: encoded });

      tx2.oncomplete = function () {
        alert("バックアップを保存しました（アプリ内）");
      };
    };

    req.onerror = function () {
      if (retry < 3) {
        setTimeout(() => saveBackup(retry + 1), 100);
      } else {
        alert("バックアップの作成に失敗しました");
      }
    };

  } catch (e) {
    if (retry < 3) {
      setTimeout(() => saveBackup(retry + 1), 100);
    } else {
      alert("バックアップの作成に失敗しました");
    }
  }
}

/* -----------------------------------
   バックアップ復元（競合対策版）
----------------------------------- */
function restoreBackupString() {
  const tx = booksDB.transaction("backup", "readonly");
  const store = tx.objectStore("backup");
  const req = store.get(1);

  req.onsuccess = function () {
    if (!req.result) {
      alert("バックアップが保存されていません");
      return;
    }

    const encoded = req.result.data;
    const json = atob(encoded);
    const books = JSON.parse(json);

    const tx2 = booksDB.transaction("books", "readwrite");
    const store2 = tx2.objectStore("books");

    store2.clear().onsuccess = function () {
      books.forEach(book => store2.put(book));
      alert("バックアップを復元しました");

      // ★ 復元後の表示を確実に更新
      loadBooksFromDB();
    };
  };

  req.onerror = function () {
    alert("バックアップの読み込みに失敗しました");
  };
}

/* -----------------------------------
   バックアップ文字列を表示（機種変更用）
----------------------------------- */
function exportBackupString() {
  const tx = booksDB.transaction("backup", "readonly");
  const store = tx.objectStore("backup");
  const req = store.get(1);

  req.onsuccess = function () {
    if (!req.result) {
      alert("バックアップが保存されていません");
      return;
    }

    const encoded = req.result.data;
    prompt("この文字列をコピーして新しい端末に移してください", encoded);
  };

  req.onerror = function () {
    alert("バックアップの読み込みに失敗しました");
  };
}

/* -----------------------------------
   初期表示
----------------------------------- */
window.onload = function () {
  initBooksDB();
  drawTopButtons();
};
