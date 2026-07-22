// ジャンルごとの階を定義（1F or 2F）
const genreFloor = {
    "zassi.png": 1,
    "seikatu.png": 1,
    "kazoku.png": 1,
    "zidou.png": 1,
    "YA.png": 2,
    "bizinesu.png": 2,
    "bunnko.png": 2,
    "ippann.png": 2,
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

    // ★ ボタンの選択状態を更新する処理 ★
    const buttons = document.querySelectorAll("#buttons button");

    // 全ボタンの active を外す
    buttons.forEach(btn => btn.classList.remove("active"));

    // 押されたボタンだけ active を付ける
    const clickedButton = [...buttons].find(btn => btn.getAttribute("onclick").includes(fileName));
    if (clickedButton) {
        clickedButton.classList.add("active");
    }
}

