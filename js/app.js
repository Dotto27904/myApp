// ジャンルごとの階を定義（1F or 2F）
const genreFloor = {
    "PC.png": 2,
    "YA.png": 2,
    "enngei.png": 1,
    "kazi.png": 1,
    "kennkou.png": 1,
    "zassi.png": 1,
    "sizenn.png": 2,
    "syakai.png": 2,
    "syuukyou.png": 2,
    "zinnsei.png": 1,
    "bunngaku.png": 2,
    "bunnko.png": 2,
    "ryokou.png": 1,
    "ryouri.png": 1,
    "rekisi.png": 2
};

// 1F / 2F の地図を切り替える
function showFloor(floor) {
    const map = document.getElementById("map");
    const highlight = document.getElementById("highlight");

    highlight.classList.add("hidden");

    if (floor === 1) {
        map.src = "map_1F.png";
    } else {
        map.src = "map_2F.png";
    }
}

// ハイライト画像を表示する（階も自動切替）
function highlight(fileName) {
    const highlight = document.getElementById("highlight");

    // まず階を自動で切り替える
    const floor = genreFloor[fileName];
    if (floor) {
        showFloor(floor);
    }

    // ハイライトを表示
    highlight.src = fileName;
    highlight.classList.remove("hidden");
}
