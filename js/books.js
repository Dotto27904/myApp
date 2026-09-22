// books.js（完全版）

const BooksManager = {

    /* -----------------------------------
       1. データ取得
    ----------------------------------- */
    getBooks() {
        return JSON.parse(localStorage.getItem("books") || "[]");
    },

    /* -----------------------------------
       2. 保存
    ----------------------------------- */
    saveBook(info) {
        const books = this.getBooks();
        books.push(info);
        localStorage.setItem("books", JSON.stringify(books));
    },

    /* -----------------------------------
       3. 編集
    ----------------------------------- */
    updateBook(index, info) {
        const books = this.getBooks();
        books[index] = info;
        localStorage.setItem("books", JSON.stringify(books));
    },

    /* -----------------------------------
       4. 削除
    ----------------------------------- */
    deleteBook(index) {
        const books = this.getBooks();
        books.splice(index, 1);
        localStorage.setItem("books", JSON.stringify(books));
    },

    /* -----------------------------------
       5. 削除確認（HTML 側で必要）
    ----------------------------------- */
    confirmDelete(index) {
        if (confirm("本当に削除しますか？")) {
            this.deleteBook(index);
            this.renderBookList(window.currentSort, window.currentGroup);
        }
    },

    /* -----------------------------------
       6. 重複チェック
    ----------------------------------- */
    isDuplicate(info) {
        if (!info.isbn) return false;
        return this.getBooks().some(book => book.isbn === info.isbn);
    },

    /* -----------------------------------
       7. カタカナ → ひらがな
    ----------------------------------- */
    kataToHira(str) {
        return str.replace(/[\u30A1-\u30F6]/g, m =>
            String.fromCharCode(m.charCodeAt(0) - 0x60)
        );
    },

    /* -----------------------------------
       8. よみ正規化
    ----------------------------------- */
    normalizeYomi(str) {
        if (!str) return "";
        let t = this.kataToHira(str);
        t = t.replace(/[・。、「」『』（）()\s]/g, "");
        return t;
    },

    fallbackYomi(title) {
        return this.normalizeYomi(title);
    },

    /* -----------------------------------
       9. 行判定
    ----------------------------------- */
    normalizeFirstKana(ch) {
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
    },

    getGroupFromYomi(yomi) {
        if (!yomi) return "その他";
        const first = this.normalizeFirstKana(yomi.charAt(0));

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
    },

    /* -----------------------------------
       10. 一覧表示（HTML 側で上書きするため空にする）
    ----------------------------------- */
    renderBookList() {
        // HTML 側の renderBookList が使われる
    },

    /* -----------------------------------
       11. バックアップ（Base64）
    ----------------------------------- */
    exportBackupString() {
        const json = JSON.stringify(this.getBooks());

        const utf8 = encodeURIComponent(json);
        const bin = utf8.replace(/%([0-9A-F]{2})/g, (match, p1) =>
            String.fromCharCode(parseInt(p1, 16))
        );
        return btoa(bin);
    },

    importBackupString(str) {
        try {
            const bin = atob(str);
            const utf8 = bin.split("").map(c =>
                "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)
            ).join("");
            const json = decodeURIComponent(utf8);
            const books = JSON.parse(json);
            localStorage.setItem("books", JSON.stringify(books));
            return true;
        } catch {
            return false;
        }
    }
};
