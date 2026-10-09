// ジャンルごとの階を定義（1F or 2F）
const genreFloor = {
    "zassi.png": 1,
    "ryokou.png": 1,
    "kennkou.png": 1,
    "enngei.png": 1,
    "bunnka.png": 1,
    "genngo.png": 1,
    "ryouri.png": 1,
    "fassyonn.png": 1,
    "kosodate.png": 1,
    "zidou.png": 1,
    "YA.png": 2,
    "bizinesu.png": 2,
    "bunnko.png": 2,
    "sinnri.png": 2,
    "rekisi.png": 2,
    "hukusi.png": 2,
    "kagaku.png": 2,
    "gizyutu.png": 2,
    "geizyutu.png": 2,
    "supotu.png": 2,
    "bunngaku.png": 2,
    "yousyo.png": 2,
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
function highlight(fileName, label) {
    const highlight = document.getElementById("highlight");

    // まず階を自動で切り替える
    const floor = genreFloor[fileName];
    if (floor) {
        showFloor(floor);
    }

    // ハイライトを表示
    highlight.src = fileName;
    highlight.classList.remove("hidden");

    // ★ メッセージ表示 ★
    const messageBox = document.getElementById("message");
    messageBox.textContent = genreMessage[label] || "";

    // ★ ボタンの選択状態を更新する処理 ★
    const buttons = document.querySelectorAll("#buttons button");

    // 全ボタンの active を外す
    buttons.forEach(btn => btn.classList.remove("active"));

    // 押されたボタンだけ active を付ける
    const clickedButton = [...buttons].find(btn => btn.textContent === label);
    if (clickedButton) {
        clickedButton.classList.add("active");
    }
}

//メッセージ一覧
const genreMessage = {
    "雑誌": "雑誌は 1階・雑誌コーナーにあります。",
    "旅行": "旅行の本は 1階・生活情報コーナー（棚番号２）にあります。",
    "健康": "健康の本は 1階・生活情報コーナー（棚番号３）にあります。",
    "園芸": "園芸・ペット・コミックは 1階・生活情報コーナー（棚番号４）にあります。",
    "文化": "華道・茶道・茶道・囲碁・将棋などの本は 1階・生活情報コーナー（棚番号５）にあります。",
    "言語": "冠婚葬祭のスピーチ・手紙などの本は 1階・生活情報コーナー（棚番号５）にあります。",
    "料理": "料理の本は 1階・家族応援コーナーにあります。",
    "ファッション": "ファッションの本は 1階・家族応援コーナーにあります。",
    "家事・育児": "家事・育児の本は 1階・家族応援コーナー（児童室側）にあります。",
    "児童書": "児童書・絵本は 1階奥の児童室にあります。",
    "YA": "進路・ライトノベルは、 2階・YAコーナーにあります。",
    "パソコン": "政治経済・金融・パソコン関連書は 2階・ビジネスコーナーにあります。",
    "小説": "小説は、 2階・文庫コーナーにあります。",
    "哲学・心理学・占い": "哲学・心理学・占いは 2階・一般書（棚番号１・１５）にあります。",
    "歴史・伝記": "歴史・伝記の本は 2階・一般書（棚番号２・３）にあります。",
    "福祉": "年金・相続・社会問題の本は 2階・一般書（棚番号３）にあります。",
    "社会・科学": "社会・科学の本は 2階・一般書（棚番号４）にあります。",
    "技術・産業": "技術・産業の本は 2階・一般書（棚番号５）にあります。",
    "芸術": "芸術の本は 2階・一般書（棚番号５・６）にあります。",
    "スポーツ": "スポーツの本は 2階・一般書（棚番号７）にあります。",
    "文学": "文学の本は 2階・一般（棚番号８以降）にあります。",
    "洋書": "洋書・図書館関連の本は、洋書コーナーにあります。",
};
// URLパラメータ対応
const params = new URLSearchParams(window.location.search);
const area = params.get("area");
 
if(area){
 
const areaMap = {
magazine: ["zassi.png", "雑誌"],
travel: ["ryokou.png", "旅行"],
health: ["kennkou.png", "健康"],
gardening: ["enngei.png", "園芸"],
culture: ["bunnka.png", "文化"],
genngo: ["genngo.png", "言語"],
cooking: ["ryouri.png", "料理"],
fashion: ["fassyonn.png", "ファッション"],
family: ["kosodate.png", "家事・育児"],
children: ["zidou.png", "児童書"],
ya: ["YA.png", "YA"],
business: ["bizinesu.png", "パソコン"],
novel: ["bunnko.png", "小説"],
psychology: ["sinnri.png", "哲学・心理学・占い"],
history: ["rekisi.png", "歴史・伝記"],
welfare: ["hukusi.png", "福祉"],
science: ["kagaku.png", "社会・科学"],
technology: ["gizyutu.png", "技術・産業"],
art: ["geizyutu.png", "芸術"],
sports: ["supotu.png", "スポーツ"],
literature: ["bunngaku.png", "文学"],
yousyo: ["yousyo.png", "洋書"]
};
 
if(areaMap[area]){
 
const fileName = areaMap[area][0];
const label = areaMap[area][1];
 
highlight(fileName, label);
 
// プルダウンも合わせる
const select = document.getElementById("genreSelect");
 
if(select){
for(let option of select.options){
 
const data = option.value.split("|");
 
if(data.length > 1 && data[1] === label){
option.selected = true;
break;
}
}
}
}
}

// QR用ID対応表
const areaIdMap = {
"雑誌": "magazine",
"旅行": "travel",
"健康": "health",
"園芸": "gardening",
"文化": "culture",
"言語": "genngo",
"料理": "cooking",
"ファッション": "fashion",
"家事・育児": "family",
"児童書": "children",
"YA": "ya",
"パソコン": "business",
"小説": "novel",
"哲学・心理学・占い": "psychology",
"歴史・伝記": "history",
"福祉": "welfare",
"社会・科学": "science",
"技術・産業": "technology",
"芸術": "art",
"スポーツ": "sports",
"文学": "literature",
"洋書": "yousyo"
};
 
// QR更新
function updateQRCode(label){
 
const areaId = areaIdMap[label];
 
if(!areaId) return;
 
const qrArea =
document.getElementById("qrcode");
 
if(!qrArea) return;
 
qrArea.innerHTML = "";
 
new QRCode(qrArea, {
text:
"https://dotto27904.github.io/myApp/map-mobile.html?area="
+ areaId,
width: 120,
height: 120
});
}
 
 
// iPad版：初回表示時
window.addEventListener("load", function(){
 
const qrArea =
document.getElementById("qrcode");
 
if(qrArea){
window.addEventListener("load", function(){});
}
 
});

// ==========================
// map-ipad.html の時だけ
// 30秒無操作でipad-top.htmlへ戻る
// ==========================
 
if (window.location.pathname.includes("map-ipad.html")) {
 
let inactivityTimer;
 
function resetInactivityTimer() {
 
clearTimeout(inactivityTimer);
 
inactivityTimer = setTimeout(function () {
 
location.href = "ipad-top.html";
 
}, 30000);
 
}
 
// 最初に開始
resetInactivityTimer();
 
[
"click",
"touchstart",
"mousemove",
"keydown",
"scroll"
].forEach(function(eventName) {
 
document.addEventListener(
eventName,
resetInactivityTimer
);
 
});
 
}