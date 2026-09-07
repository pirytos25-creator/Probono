const $ = document.getElementById("app");
const STORE = "akta2027";
function load() {
  try { return JSON.parse(localStorage.getItem(STORE)) || {}; }
  catch { return {}; }
}
function save(s) { localStorage.setItem(STORE, JSON.stringify(s)); }
const state = Object.assign({ screen: "start", seen: {}, ach: { team: false } }, load());
function unlock(id) {
  state.seen[id] = true;
  if (id === "akta") state.ach.akta = true;
  if (id === "hub" || id === "park" || id === "dybow") state.ach[id] = true;
  if (state.seen.hub && state.seen.park && state.seen.dybow) state.ach.trzy = true;
  save(state);
}
function xp() {
  const keys = ["akta", "hub", "park", "dybow", "trzy", "team"];
  return Math.round((keys.filter((k) => state.ach[k]).length / keys.length) * 100);
}
function go(screen) { state.screen = screen; save(state); render(); }
function topbar(extra = "") {
  return `<div class="topbar"><div class="stamp">Akta 1904</div><div class="row">${extra}<button class="btn small ghost" data-go="map">Mapa</button><button class="btn small ghost" data-go="profile">Profil</button><button class="btn small ghost" data-go="project">O projekcie</button></div></div>`;
}
function startView() {
  return `<section class="screen center hero"><div><div class="stamp">Toruń · demo</div><h1>${CONTENT.title}</h1><p class="muted">${CONTENT.subtitle}<br>Krótka sekwencja, potem trzy wyprawy.</p><button class="btn" data-go="intro">Start</button></div></section>`;
}
function videoView(src, next, label) {
  return `<section class="screen">${topbar(`<button class="btn small ghost" data-go="${next}">Pomiń</button>`)}<div class="center"><div class="video-wrap"><video id="seq" autoplay playsinline controls src="${src}"></video><div class="video-actions"><span class="stamp">Słuchawki mile widziane</span><button class="btn small" data-go="${next}">${label}</button></div></div></div></section>`;
}
function letterView() {
  return `<section class="screen">${topbar()}<div class="center"><article class="letter"><div class="secret">TAJNE</div><h1 style="font-size:28px;margin:10px 0 6px">Akta sprawy 1904</h1><p>Sprawa: innowacyjne gry miejskie.<br>Hub Kulturalny 2027.</p><p style="margin-top:14px">List zostawia trzy tropy na mapie miasta. Opisy wypraw dopiszemy przed pokazem.</p><button class="btn" data-open-map>Otwórz mapę</button></article></div></section>`;
}
function mapView() {
  const pins = CONTENT.locations.map((loc) => `<button class="pin" style="left:${loc.pin.x}%;top:${loc.pin.y}%" data-loc="${loc.id}"><div class="dot"></div><strong>${loc.name}</strong><span>${loc.tag}</span></button>`).join("");
  return `<section class="screen">${topbar()}<div class="map-stage"><div class="river"></div><div class="label-n">Bydgoskie Przedmieście</div><div class="label-s">Lewobrzeże · Dybów</div>${pins}</div></section>`;
}
function locView(id) {
  const loc = CONTENT.locations.find((l) => l.id === id);
  if (!loc) return mapView();
  const media = loc.hasVideo ? `<div class="media"><video controls autoplay playsinline src="${CONTENT.videos.hub}"></video></div>` : `<div class="media">${loc.imageHint} · zdjęcie podmienimy</div>`;
  return `<section class="screen">${topbar()}<div class="center"><article class="card"><div class="stamp">${loc.tag}</div><h2>${loc.name}</h2><p class="muted">${loc.place}</p>${media}<p>${loc.blurb}</p><div class="row" style="margin-top:16px"><button class="btn small" data-go="map">Wróć na mapę</button></div></article></div></section>`;
}
function profileView() {
  const items = CONTENT.achievements.map((a) => { const on = state.ach[a.id]; return `<li class="${on ? "on" : ""}"><div><strong>${a.name}</strong><br><span class="muted">${a.hint}</span></div><span>${on ? "zdobyte" : "—"}</span></li>`; }).join("");
  return `<section class="screen">${topbar()}<div class="center"><article class="card"><div class="stamp">Profil gracza · makieta</div><h2>Archiwista</h2><p class="muted">EXP ${xp()} / 100 · localStorage, bez logowania</p><div class="xp"><i style="width:${xp()}%"></i></div><ul class="ach">${items}</ul><div class="row" style="margin-top:16px"><button class="btn small ghost" data-team>Zaznacz teamplay</button><button class="btn small ghost" data-reset>Reset demo</button></div></article></div></section>`;
}
function projectView() {
  const lis = CONTENT.project.benefits.map((b) => `<li>${b}</li>`).join("");
  return `<section class="screen">${topbar()}<div class="center"><article class="card"><div class="stamp">Dla instytucji</div><h2>${CONTENT.project.heading}</h2><p>${CONTENT.project.lead}</p><ul class="ach" style="margin-top:16px">${lis}</ul><div class="row" style="margin-top:16px"><button class="btn small" data-go="map">Do mapy</button></div></article></div></section>`;
}
function render() {
  const s = state.screen;
  if (s === "start") $.innerHTML = startView();
  else if (s === "intro") $.innerHTML = videoView(CONTENT.videos.intro, "lettervid", "Dalej");
  else if (s === "lettervid") $.innerHTML = videoView(CONTENT.videos.letter, "letter", "Do listu");
  else if (s === "letter") $.innerHTML = letterView();
  else if (s === "map") $.innerHTML = mapView();
  else if (s === "profile") $.innerHTML = profileView();
  else if (s === "project") $.innerHTML = projectView();
  else if (s.startsWith("loc:")) $.innerHTML = locView(s.slice(4));
  else $.innerHTML = startView();
  const vid = document.getElementById("seq");
  if (vid) {
    vid.addEventListener("ended", () => {
      if (state.screen === "intro") go("lettervid");
      else if (state.screen === "lettervid") go("letter");
    });
  }
}
$.addEventListener("click", (e) => {
  const t = e.target.closest("[data-go],[data-loc],[data-open-map],[data-reset],[data-team]");
  if (!t) return;
  if (t.dataset.go) go(t.dataset.go);
  if (t.dataset.loc) { unlock(t.dataset.loc); go("loc:" + t.dataset.loc); }
  if (t.hasAttribute("data-open-map")) { unlock("akta"); go("map"); }
  if (t.hasAttribute("data-team")) { state.ach.team = true; save(state); render(); }
  if (t.hasAttribute("data-reset")) {
    localStorage.removeItem(STORE);
    Object.assign(state, { screen: "start", seen: {}, ach: { team: false } });
    render();
  }
});
render();
