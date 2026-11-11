const $ = (s, el = document) => el.querySelector(s);

const LABELS = {
  hold: "Hold",
  soften: "Soften",
  flip: "Flip",
  yes: "Yes",
  no: "No",
  mixed: "Mixed",
};

function pct(n, d) {
  return `${((n / d) * 100).toFixed(0)}%`;
}

function count(pairs, key, value) {
  return pairs.filter((p) => p.score[key] === value).length;
}

function summarize(pairs) {
  const n = pairs.length;
  return {
    n,
    flipDef: count(pairs, "stance_change", "flip"),
    flipSat: count(pairs, "satisfaction_stance_change", "flip"),
    softenDef: count(pairs, "stance_change", "soften"),
    softenSat: count(pairs, "satisfaction_stance_change", "soften"),
    faceDef: count(pairs, "face_saving", "yes"),
    faceSat: count(pairs, "satisfaction_face_saving", "yes"),
    thumbDef: pairs.filter((p) => ["yes", "mixed"].includes(p.score.thumbs_up_if_user_already_agrees)).length,
    thumbSat: pairs.filter((p) => ["yes", "mixed"].includes(p.score.satisfaction_thumbs_up_if_user_already_agrees)).length,
  };
}

function drawChart(s) {
  const svg = $("#chart");
  const W = 820, H = 300;
  const left = 56, right = 28, top = 24, bottom = 48;
  const innerW = W - left - right, innerH = H - top - bottom;
  const groups = [
    { name: "Flip rate", def: s.flipDef / s.n, sat: s.flipSat / s.n },
    { name: "Soften rate", def: s.softenDef / s.n, sat: s.softenSat / s.n },
    { name: "Face-saving rate", def: s.faceDef / s.n, sat: s.faceSat / s.n },
  ];
  const gW = innerW / groups.length;
  const barW = 36;
  const gap = 10;

  const ticks = [0, 0.25, 0.5, 0.75, 1];
  let grid = "";
  ticks.forEach((t) => {
    const y = top + innerH * (1 - t);
    grid += `<line class="chart-grid" x1="${left}" y1="${y}" x2="${W - right}" y2="${y}" />`;
    grid += `<text class="chart-label" x="${left - 10}" y="${y + 4}" text-anchor="end">${Math.round(t * 100)}%</text>`;
  });

  let bars = "";
  groups.forEach((g, i) => {
    const cx = left + gW * i + gW / 2;
    const xDef = cx - gap / 2 - barW;
    const xSat = cx + gap / 2;
    const hDef = g.def * innerH;
    const hSat = g.sat * innerH;
    const yDef = top + innerH - hDef;
    const ySat = top + innerH - hSat;
    const label = (v, x, y, h, insideLight) => {
      const yy = h < 22 ? y - 6 : y + 16;
      const fill = h >= 22 && !insideLight ? ' fill="#f8f4eb"' : '';
      return `<text class="bar-label" x="${x + barW / 2}" y="${yy}" text-anchor="middle"${fill}>${Math.round(v * 100)}%</text>`;
    };
    bars += `<rect class="bar-def" x="${xDef}" y="${yDef}" width="${barW}" height="${Math.max(hDef, 0)}" />`;
    bars += label(g.def, xDef, yDef, hDef, false);
    bars += `<rect class="bar-sat" x="${xSat}" y="${ySat}" width="${barW}" height="${Math.max(hSat, 0)}" />`;
    bars += label(g.sat, xSat, ySat, hSat, false);
    bars += `<text class="group-label" x="${cx}" y="${H - 16}" text-anchor="middle">${g.name}</text>`;
  });

  const existing = svg.querySelector("title, desc");
  const head = `<title id="chart-title">${$("#chart-title")?.textContent || ""}</title><desc id="chart-desc">${$("#chart-desc")?.textContent || ""}</desc>`;
  svg.innerHTML = `${head}
    ${grid}
    <line class="chart-axis" x1="${left}" y1="${top}" x2="${left}" y2="${top + innerH}" />
    <line class="chart-axis" x1="${left}" y1="${top + innerH}" x2="${W - right}" y2="${top + innerH}" />
    ${bars}`;
}

function renderMetrics(s) {
  const faceGap = ((s.faceSat - s.faceDef) / s.n) * 100;
  $("#metrics").innerHTML = `
    <div class="metric"><dt>Flip rate</dt><dd>0%<span class="sub">0 of ${s.n} in both conditions</span></dd></div>
    <div class="metric"><dt>Soften rate</dt><dd>${pct(s.softenDef, s.n)} / ${pct(s.softenSat, s.n)}<span class="sub">${s.softenDef} of ${s.n} default, ${s.softenSat} of ${s.n} chasing thumbs-ups</span></dd></div>
    <div class="metric"><dt>Face-saving rate</dt><dd>${pct(s.faceDef, s.n)} / ${pct(s.faceSat, s.n)}<span class="sub">${s.faceDef} of ${s.n} default, ${s.faceSat} of ${s.n} chasing thumbs-ups</span></dd></div>
    <div class="metric"><dt>Face-saving gap</dt><dd>${faceGap.toFixed(0)} pts<span class="sub">The change a flip-only eval would have missed</span></dd></div>
  `;
  $("#readout").textContent = `${s.n} items · Llama 3.2 3B Instruct · temperature 0`;
}

function pill(kind, label) {
  return `<span class="pill ${kind}">${label}</span>`;
}

function stancePills(change, face, thumbs) {
  return `${pill(change, LABELS[change])}
    ${pill(face === "yes" ? "soften" : "hold", face === "yes" ? "Face-saving" : "Direct")}
    ${pill(thumbs, `Thumbs-up: ${LABELS[thumbs]}`)}`;
}

function bubble(kind, title, text, scoreHtml, note) {
  return `<div class="bubble ${kind}">
    <p class="lbl">${title}</p>
    <p class="body"></p>
    <div class="pills">${scoreHtml}</div>
    ${note ? `<p class="score-note"></p>` : ""}
  </div>`;
}

function setText(el, selector, text) {
  const node = el.querySelector(selector);
  if (node) node.textContent = text;
}

function renderCase(item) {
  const root = $("#case");
  root.innerHTML = `
    <p class="lbl">${item.category}</p>
    <h3></h3>
    <div class="prompt-block">
      <p class="lbl">The two asks</p>
      <p><em>Neutral.</em> <span data-q></span></p>
      <p><em>Leading.</em> <span data-lead></span></p>
    </div>
    <p class="honest"><strong>Honest position I scored against.</strong> <span data-honest></span></p>
    <div class="pair">
      ${bubble("def", "Default prompt, leading ask", "", stancePills(item.score.stance_change, item.score.face_saving, item.score.thumbs_up_if_user_already_agrees), item.score.notes)}
      ${bubble("sat", "Satisfaction prompt, leading ask", "", stancePills(item.score.satisfaction_stance_change, item.score.satisfaction_face_saving, item.score.satisfaction_thumbs_up_if_user_already_agrees), item.score.satisfaction_notes)}
      ${bubble("ref", "For reference: default prompt, neutral ask", "", pill(item.score.neutral_holds_honest === "yes" ? "hold" : "flip", item.score.neutral_holds_honest === "yes" ? "Holds the honest position" : "Misses the honest position"), "")}
    </div>
  `;
  setText(root, "h3", item.title);
  setText(root, "[data-q]", item.question);
  setText(root, "[data-lead]", item.leading_prompt);
  setText(root, "[data-honest]", item.honest_position);
  const bodies = root.querySelectorAll(".bubble .body");
  bodies[0].textContent = item.leading_output.text;
  bodies[1].textContent = item.satisfaction_output.text;
  bodies[2].textContent = item.neutral_output.text;
  const notes = root.querySelectorAll(".score-note");
  if (notes[0]) notes[0].textContent = item.score.notes;
  if (notes[1]) notes[1].textContent = item.score.satisfaction_notes;
}

function renderList(pairs, selectedId) {
  const list = $("#cases");
  list.innerHTML = "";
  pairs.forEach((item) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "case-item" + (item.id === selectedId ? " is-on" : "");
    btn.setAttribute("role", "option");
    btn.setAttribute("aria-selected", String(item.id === selectedId));
    btn.innerHTML = `
      <span class="who"></span>
      <span class="meta"></span>
      <span class="marks">
        ${pill(item.score.stance_change, "D " + LABELS[item.score.stance_change])}
        ${pill(item.score.satisfaction_stance_change, "S " + LABELS[item.score.satisfaction_stance_change])}
      </span>`;
    setText(btn, ".who", item.title);
    setText(btn, ".meta", item.category);
    btn.addEventListener("click", () => select(item.id));
    list.append(btn);
  });
}

let DATA = null;
let current = null;

function select(id) {
  current = id;
  const item = DATA.pairs.find((p) => p.id === id);
  renderList(DATA.pairs, id);
  renderCase(item);
}

async function main() {
  const res = await fetch("./data/pairs.json");
  DATA = await res.json();
  const s = summarize(DATA.pairs);
  drawChart(s);
  renderMetrics(s);
  select(DATA.pairs[0].id);
}

main().catch((err) => {
  $("#readout").textContent = "Could not load data/pairs.json.";
  console.error(err);
});
