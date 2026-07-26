/* -----------------------------------
   IndexedDB 初期化
----------------------------------- */
let booksDB = null;
let booksCache = [];
let currentSort = "title";
let currentGroup = "ア行";

function initBooksDB() {
  const req = indexedDB.open("BooksDB", 1);

  req.onupgradeneeded = function (e) {
    const db = e.target.result;

    // 書籍データ
    if (!db.objectStoreNames.contains("books")) {
      db.createObjectStore("books", { keyPath: "isbn" });
    }

    // ★ 新バックアップ方式：バックアップ専用ストア
    if (!db.objectStoreNames.contains("backup")) {
      db.createObjectStore("backup", { keyPath: "id" });
    }
  };

  req.onsuccess = function (e) {
    booksDB = e.target.result;
    loadBooksFromDB();
  };

  req.onerror = function () {
    alert("IndexedDB の初期化に失敗しました");
  };
}

/* -----------------------------------
   書籍データ読み込み
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
function saveBook(book) {
  const tx = booksDB.transaction("books", "readwrite");
  const store = tx.objectStore("books");
  store.put(book);

  store.onsuccess = function () {
    loadBooksFromDB();
  };
}

/* -----------------------------------
   バックアップ保存（新方式：IndexedDB に保存）
----------------------------------- */
function saveBackup() {
  const books = booksCache;
  const json = JSON.stringify(books);
  const encoded = btoa(json);

  const tx = booksDB.transaction("backup", "readwrite");
  const store = tx.objectStore("backup");
  store.put({ id: 1, data: encoded });

  alert("バックアップを保存しました（アプリ内）");
}

/* -----------------------------------
   バックアップ復元（新方式：IndexedDB から読み出し）
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
      loadBooksFromDB();
    };
  };
}

/* -----------------------------------
   機種変更用：バックアップ文字列を表示
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
}

/* -----------------------------------
   一覧表示（既存のまま）
----------------------------------- */
function renderBookList(sort, group) {
  currentSort = sort;
  currentGroup = group;

  let list = booksCache.slice();

  // 行分類
  if (group !== "その他") {
    list = list.filter(b => b.group === group);
  } else {
    list = list.filter(b => !b.group);
  }

  // ソート
  list.sort((a, b) => a.title.localeCompare(b.title));

  const area = document.getElementById("book-list");
  area.innerHTML = "";

  list.forEach(book => {
    const div = document.createElement("div");
    div.className = "book-item";
    div.innerHTML = `
      <b>${book.title}</b><br>
      ${book.author}<br>
      ISBN: ${book.isbn}<br>
      よみ: ${book.yomi}<br>
      <button onclick="deleteBook('${book.isbn}')">削除</button>
    `;
    area.appendChild(div);
  });
}

/* -----------------------------------
   削除
----------------------------------- */
function deleteBook(isbn) {
  const tx = booksDB.transaction("books", "readwrite");
  const store = tx.objectStore("books");
  store.delete(isbn);

  store.onsuccess = function () {
    loadBooksFromDB();
  };
}

/* -----------------------------------
   初期化
----------------------------------- */
window.onload = function () {
  initBooksDB();
};
