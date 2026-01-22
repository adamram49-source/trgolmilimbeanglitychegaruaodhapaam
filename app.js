let currentGame = null;

function getGames() {
  return JSON.parse(localStorage.getItem("games") || "[]");
}

function saveGames(games) {
  localStorage.setItem("games", JSON.stringify(games));
}

// שמירת משחק
function saveGame() {
  const name = gameName.value;
  const en = english.value.split("\n");
  const he = hebrew.value.split("\n");

  const pairs = en.map((e,i)=>({en:e.trim(), he:he[i]?.trim()}))
                  .filter(p=>p.en && p.he);

  const games = getGames();
  games.push({id:Date.now(), name, pairs});
  saveGames(games);

  location.href = "games.html";
}

// רשימת משחקים
function loadGamesList() {
  const list = document.getElementById("list");
  getGames().forEach(g=>{
    const b = document.createElement("button");
    b.innerText = g.name;
    b.onclick = ()=>location.href=`game.html?id=${g.id}`;
    list.appendChild(b);
  });
}

// טעינת משחק
function loadGame() {
  const id = new URLSearchParams(location.search).get("id");
  currentGame = getGames().find(g=>g.id==id);
  title.innerText = currentGame.name;
  startGame("en");
}

// התחלת משחק
function startGame(mode) {
  board.innerHTML = "";
  message.innerText = "";

  const left = [];
  const right = [];

  currentGame.pairs.forEach(p=>{
    if (mode==="en") {
      left.push({text:p.he, match:p.en});
      right.push(p.en);
    } else {
      left.push({text:p.en, match:p.he});
      right.push(p.he);
    }
  });

  right.sort(()=>Math.random()-0.5);

  left.forEach(w=>{
    const d=document.createElement("div");
    d.className="word";
    d.innerText=w.text;
    d.draggable=true;
    d.ondragstart=e=>e.dataTransfer.setData("match",w.match);
    board.appendChild(d);
  });

  board.appendChild(document.createElement("hr"));

  right.forEach(w=>{
    const t=document.createElement("div");
    t.className="word target";
    t.innerText=w;
    t.ondragover=e=>e.preventDefault();
    t.ondrop=e=>{
      const m=e.dataTransfer.getData("match");
      if(m===w){
        showMsg("🎉 כל הכבוד!",true,t);
      } else {
        showMsg("❌ טעית",false,t);
      }
    };
    board.appendChild(t);
  });
}

// הודעות + אפקט
function showMsg(text,ok,el){
  message.innerText=text;
  el.classList.add(ok?"correct":"wrong");
  if(ok){
    el.style.opacity=0;
    el.style.transform="scale(0.5)";
  } else {
    el.style.transform="translateX(20px)";
    setTimeout(()=>el.style.transform="",400);
  }
}

// שיתוף
function shareGame(){
  const data=btoa(JSON.stringify(currentGame));
  const link=location.origin+location.pathname.replace("game.html","game.html?shared=")+data;
  prompt("קישור שיתוף:",link);
}

// טעינה משיתוף
(function(){
  const p=new URLSearchParams(location.search);
  if(p.get("shared")){
    const g=JSON.parse(atob(p.get("shared")));
    const games=getGames();
    if(!games.find(x=>x.id===g.id)){
      games.push(g); saveGames(games);
    }
    location.href=`game.html?id=${g.id}`;
  }
})();
