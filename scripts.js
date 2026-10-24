const ENDPOINTS = {
  primary: "https://api.dictionaryapi.dev/api/v2/entries/en/",
  secondary: "https://freedictionaryapi.com/api/v1/entries/en/"
};

async function lookup(term) {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return undefined;

  try {
    const res = await fetch(ENDPOINTS.primary + encodeURIComponent(normalized));
    if (res.ok) {
      const json = await res.json();
      return transformPrimary(json);
    }
    if (res.status === 404) {
      // try fallback
    } else {
      // try fallback anyway
    }
  } catch (e) {
    // fall through to secondary
  }

  try {
    const res2 = await fetch(ENDPOINTS.secondary + encodeURIComponent(normalized));
    if (res2.ok) {
      const json2 = await res2.json();
      return transformSecondary(json2);
    }
    if (res2.status === 404) return null;
  } catch (e) {
    // ignore
  }

  return null;
}

function extractSyns(items) {
  const bag = new Set();
  (items || []).forEach(item => {
    if (Array.isArray(item.synonyms)) {
      item.synonyms.forEach(s => s && bag.add(s));
    }
    if (Array.isArray(item.definitions)) {
      item.definitions.forEach(d => {
        if (Array.isArray(d.synonyms)) {
          d.synonyms.forEach(s => s && bag.add(s));
        }
      });
    }
  });
  return Array.from(bag);
}

function transformPrimary(payload) {
  const entry = Array.isArray(payload) ? payload[0] : payload;
  if (!entry) return null;

  const meaning = Array.isArray(entry.meanings) ? entry.meanings[0] : null;
  const def = meaning && Array.isArray(meaning.definitions) ? meaning.definitions[0] : null;

  let phon = entry.phonetic;
  if (!phon && Array.isArray(entry.phonetics)) {
    const withText = entry.phonetics.find(p => p && p.text);
    if (withText) phon = withText.text;
  }

  let audioSrc = "";
  if (Array.isArray(entry.phonetics)) {
    const withAudio = entry.phonetics.find(p => p && p.audio);
    if (withAudio) audioSrc = withAudio.audio;
  }

  return {
    term: entry.word || "",
    pos: meaning && meaning.partOfSpeech ? meaning.partOfSpeech : "",
    phon: phon || "—",
    desc: def && def.definition ? def.definition : "No definition found.",
    syns: extractSyns(entry.meanings),
    clip: audioSrc
  };
}

function transformSecondary(payload) {
  if (!payload) return null;
  const entry = Array.isArray(payload.entries) ? payload.entries[0] : payload.entry || payload;
  if (!entry) return null;

  const sense = Array.isArray(entry.senses) ? entry.senses[0] : null;
  let phon = "—";
  if (Array.isArray(entry.pronunciations)) {
    const ipa = entry.pronunciations.find(p => p && p.type === "ipa" && p.text);
    if (ipa) phon = ipa.text;
  }

  return {
    term: payload.word || entry.word || "",
    pos: entry.partOfSpeech || "",
    phon: phon,
    desc: sense && sense.definition ? sense.definition : "No definition found.",
    syns: extractSyns([entry]),
    clip: ""
  };
}

// UI
const form = document.getElementById("search-form");
const input = document.getElementById("search-input");
const notice = document.getElementById("status");
const headWord = document.getElementById("word");
const headPhon = document.getElementById("phonetic");
const headDef = document.getElementById("definition");
const headSyn = document.getElementById("synonyms");
const playBtn = document.getElementById("play-btn");
const player = document.getElementById("audio");
const panel = document.getElementById("results-container");

let audioUrl = "";

function showNotice(msg) {
  if (!notice) return;
  notice.textContent = msg || "";
}

function resetPanel() {
  if (headWord) headWord.textContent = "";
  if (headPhon) headPhon.textContent = "";
  if (headDef) headDef.textContent = "";
  if (headSyn) {
    headSyn.innerHTML = "";
  }
  if (player) {
    player.removeAttribute("src");
  }
  audioUrl = "";
  if (playBtn) playBtn.disabled = true;
  if (panel) panel.style.display = "none";
}

function paint(data) {
  if (!data) return;
  if (panel) panel.style.display = "block";

  if (headWord) headWord.textContent = data.term || "";
  if (headPhon) headPhon.textContent = data.phon || "—";

  const posPart = data.pos ? ` (${data.pos})` : "";
  if (headDef) headDef.textContent = (data.desc || "") + posPart;

  if (headSyn) {
    headSyn.innerHTML = "";
    if (!Array.isArray(data.syns) || data.syns.length === 0) {
      const li = document.createElement("li");
      li.textContent = "None";
      headSyn.appendChild(li);
    } else {
      const list = data.syns.slice(0, 12);
      list.forEach(s => {
        const li = document.createElement("li");
        li.textContent = s;
        headSyn.appendChild(li);
      });
    }
  }

  audioUrl = data.clip || "";
  if (audioUrl && player && playBtn) {
    player.src = audioUrl;
    playBtn.disabled = false;
  } else if (playBtn) {
    if (player) player.removeAttribute("src");
    playBtn.disabled = true;
  }
}

async function doLookup(q) {
  if (!q) return;
  showNotice("Looking up...");
  resetPanel();

  try {
    const result = await lookup(q);
    if (result === null) {
      showNotice(`No entry for "${q}".`);
      if (panel) panel.style.display = "none";
      return;
    }
    if (result === undefined) {
      showNotice("Enter a term to look up.");
      if (panel) panel.style.display = "none";
      return;
    }
    paint(result);
    showNotice("");
  } catch (err) {
    console.error(err);
    showNotice("Something went wrong. Try again.");
    if (panel) panel.style.display = "none";
  }
}

if (form) {
  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const val = input ? input.value : "";
    doLookup(val);
  });
}

if (input) {
  let timer;
  input.addEventListener("input", () => {
    const val = input.value;
    clearTimeout(timer);
    if (!val.trim()) {
      showNotice("");
      resetPanel();
      return;
    }
    timer = setTimeout(() => doLookup(val), 400);
  });
}

if (playBtn && player) {
  playBtn.addEventListener("click", () => {
    if (!audioUrl) return;
    try {
      player.currentTime = 0;
      player.play();
    } catch (e) {
      showNotice("Audio playback failed.");
    }
  });
}

resetPanel();
