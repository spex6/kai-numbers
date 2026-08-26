const SCALE = 20;

const state = { hundreds: 0, tens: 0, units: 0 };
let animating = false;

// ================= SCREEN SWITCHING =================
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(function (s) {
    s.classList.remove("active");
  });
  document.getElementById(id).classList.add("active");
}

// ================= BLOCK BUILDERS =================
function makeUnit() {
  const b = document.createElement("div");
  b.className = "block-1";
  b.style.width = SCALE + "px";
  b.style.height = SCALE + "px";
  return b;
}

function makeTen() {
  const b = document.createElement("div");
  b.className = "block-10";
  for (let i = 0; i < 10; i++) {
    const c = document.createElement("div");
    c.className = "ten-cell";
    c.style.width = SCALE + "px";
    c.style.height = SCALE + "px";
    b.appendChild(c);
  }
  return b;
}

function makeHundred() {
  const b = document.createElement("div");
  b.className = "block-100";
  b.style.gridTemplateColumns = "repeat(10, " + SCALE + "px)";
  b.style.gridTemplateRows = "repeat(10, " + SCALE + "px)";
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const cell = document.createElement("div");
      let cls = "hcell " + ((r + c) % 2 === 0 ? "dark" : "light");
      if (c === 9) cls += " last-col";
      if (r === 9) cls += " last-row";
      cell.className = cls;
      b.appendChild(cell);
    }
  }
  return b;
}

function makeBlockByValue(value) {
  if (value === 1) return makeUnit();
  if (value === 10) return makeTen();
  return makeHundred();
}

// ================= MINI BLOCKS (for mirrors) =================
function makeMiniBlock(value) {
  let block;
  if (value === 100) {
    const MINI = 3.8;
    block = document.createElement("div");
    block.className = "block-100";
    block.style.gridTemplateColumns = "repeat(10, " + MINI + "px)";
    block.style.gridTemplateRows = "repeat(10, " + MINI + "px)";
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        const cell = document.createElement("div");
        let cls = "hcell " + ((r + c) % 2 === 0 ? "dark" : "light");
        if (c === 9) cls += " last-col";
        if (r === 9) cls += " last-row";
        cell.className = cls;
        block.appendChild(cell);
      }
    }
  } else if (value === 10) {
    const MINI = 4.4;
    block = document.createElement("div");
    block.className = "block-10";
    for (let i = 0; i < 10; i++) {
      const cCell = document.createElement("div");
      cCell.className = "ten-cell";
      cCell.style.width = MINI + "px";
      cCell.style.height = MINI + "px";
      block.appendChild(cCell);
    }
  } else {
    const MINI = 8;
    block = document.createElement("div");
    block.className = "block-1";
    block.style.width = MINI + "px";
    block.style.height = MINI + "px";
  }
  return block;
}

function fillMirrors() {
  const cols = [
    { look: "look-hundreds", reflect: "reflect-hundreds", value: 100 },
    { look: "look-tens", reflect: "reflect-tens", value: 10 },
    { look: "look-units", reflect: "reflect-units", value: 1 }
  ];
  cols.forEach(function (c) {
    const look = document.getElementById(c.look);
    look.innerHTML = "";
    look.appendChild(makeMiniBlock(c.value));
    const reflect = document.getElementById(c.reflect);
    reflect.innerHTML = "";
    reflect.appendChild(makeMiniBlock(c.value));
  });
}

// ================= FUSE HELPERS =================
function normalise() {
  if (state.hundreds > 9) {
    state.hundreds = 9;
  }
}

function showTooBig() {
  const msg = document.getElementById("too-big-message");
  msg.classList.add("show");
  setTimeout(function () {
    msg.classList.remove("show");
  }, 2000);
}

function stateKeyFromClass(cls) {
  if (cls === "column-units") return "units";
  if (cls === "column-tens") return "tens";
  return "hundreds";
}

// ================= RENDER =================
function render(dropIn, isTenth) {
  const unitsStage = document.querySelector(".column-units .column-stage");
  unitsStage.innerHTML = "";
  const stack = document.createElement("div");
  stack.className = "unit-stack";
  for (let i = 0; i < state.units; i++) {
    const u = makeUnit();
    if (dropIn === "units" && i === state.units - 1) u.classList.add(isTenth ? "drop-in-tenth" : "drop-in");
    stack.appendChild(u);
  }
  unitsStage.appendChild(stack);
  document.querySelector(".column-units .column-count").textContent = state.units;

  const tensStage = document.querySelector(".column-tens .column-stage");
  tensStage.innerHTML = "";
  const tensRow = document.createElement("div");
  tensRow.className = "ten-row";
  for (let i = 0; i < state.tens; i++) {
    const t = makeTen();
    if (dropIn === "tens" && i === state.tens - 1) t.classList.add(isTenth ? "drop-in-tenth" : "drop-in");
    tensRow.appendChild(t);
  }
  tensStage.appendChild(tensRow);
  document.querySelector(".column-tens .column-count").textContent = state.tens;

  const hundredsStage = document.querySelector(".column-hundreds .column-stage");
  hundredsStage.innerHTML = "";
  const stair = document.createElement("div");
  stair.className = "hundred-stair";
  const step = 1 * SCALE;
  for (let i = 0; i < state.hundreds; i++) {
    const h = makeHundred();
    h.style.position = "absolute";
    h.style.left = (i * step) + "px";
    h.style.bottom = (i * step) + "px";
    h.style.zIndex = (state.hundreds - i);
    if (dropIn === "hundreds" && i === state.hundreds - 1) h.classList.add(isTenth ? "drop-in-tenth" : "drop-in");
    stair.appendChild(h);
  }
  const spanW = 10 * SCALE + (state.hundreds > 0 ? (state.hundreds - 1) * step : 0);
  const spanH = 10 * SCALE + (state.hundreds > 0 ? (state.hundreds - 1) * step : 0);
  stair.style.width = spanW + "px";
  stair.style.height = spanH + "px";
  hundredsStage.appendChild(stair);
  document.querySelector(".column-hundreds .column-count").textContent = state.hundreds;

  const total = state.hundreds * 100 + state.tens * 10 + state.units;
  document.querySelector(".number-readout").textContent = total;
}

// ================= FUSE ANIMATION =================
function runFuse(fromKey, toKey, fromValue) {
  animating = true;
  const sourceStage = document.querySelector("." + fromKey + " .column-stage");
  const toValue = fromValue * 10;

  setTimeout(function () {
    if (sourceStage) {
      const blocks = sourceStage.querySelectorAll(".block-1, .block-10, .block-100");
      blocks.forEach(function (b) { b.classList.add("fusing"); });
    }

    setTimeout(function () {
      if (sourceStage) {
        sourceStage.innerHTML = "";
        const newBlock = makeBlockByValue(toValue);
        newBlock.classList.add("transform-pop");
        const holder = document.createElement("div");
        holder.style.display = "flex";
        holder.style.alignItems = "flex-end";
        holder.appendChild(newBlock);
        sourceStage.appendChild(holder);
      }

      setTimeout(function () {
        const fromStateKey = stateKeyFromClass(fromKey);
        const toStateKey = stateKeyFromClass(toKey);
        state[fromStateKey] -= 10;
        state[toStateKey] += 1;

        if (toStateKey === "tens" && state.tens >= 10) {
          render("tens", true);
          runFuse("column-tens", "column-hundreds", 10);
        } else {
          animating = false;
          render();
        }
      }, 900);

    }, 1200);

  }, 1150);
}

// ================= BUTTONS =================
function currentTotal() {
  return state.hundreds * 100 + state.tens * 10 + state.units;
}

document.querySelector(".column-units .btn-plus").addEventListener("click", function () {
  if (animating) return;
  if (currentTotal() + 1 > 999) { showTooBig(); return; }
  state.units++;
  const tenth = state.units >= 10;
  render("units", tenth);
  if (tenth) { runFuse("column-units", "column-tens", 1); }
});
document.querySelector(".column-units .btn-minus").addEventListener("click", function () {
  if (animating) return;
  if (state.units > 0) { state.units--; render(); }
});

document.querySelector(".column-tens .btn-plus").addEventListener("click", function () {
  if (animating) return;
  if (currentTotal() + 10 > 999) { showTooBig(); return; }
  state.tens++;
  const tenth = state.tens >= 10;
  render("tens", tenth);
  if (tenth) { runFuse("column-tens", "column-hundreds", 10); }
});
document.querySelector(".column-tens .btn-minus").addEventListener("click", function () {
  if (animating) return;
  if (state.tens > 0) { state.tens--; render(); }
});

document.querySelector(".column-hundreds .btn-plus").addEventListener("click", function () {
  if (animating) return;
  if (currentTotal() + 100 > 999) { showTooBig(); return; }
  state.hundreds++;
  render("hundreds");
});
document.querySelector(".column-hundreds .btn-minus").addEventListener("click", function () {
  if (animating) return;
  if (state.hundreds > 0) { state.hundreds--; render(); }
});

// ================= NAVIGATION =================
document.getElementById("tile-build").addEventListener("click", function () {
  showScreen("screen-mode1");
});
document.getElementById("back-mode1").addEventListener("click", function () {
  if (animating) return;
  showScreen("screen-menu");
});
document.getElementById("tile-write").addEventListener("click", function () {
  showScreen("screen-write");
});
document.getElementById("back-write").addEventListener("click", function () {
  showScreen("screen-menu");
});

// ================= HOLD-TO-RESET =================
(function setupReset() {
  const btn = document.getElementById("reset-mode1");
  let holdTimer = null;

  function startHold() {
    if (animating) return;
    btn.classList.add("holding");
    holdTimer = setTimeout(function () {
      // 1 second held — reset everything
      state.hundreds = 0;
      state.tens = 0;
      state.units = 0;
      render();
      btn.classList.remove("holding");
    }, 750);
  }

  function cancelHold() {
    btn.classList.remove("holding");
    if (holdTimer) {
      clearTimeout(holdTimer);
      holdTimer = null;
    }
  }

  // mouse (laptop testing)
  btn.addEventListener("mousedown", startHold);
  btn.addEventListener("mouseup", cancelHold);
  btn.addEventListener("mouseleave", cancelHold);

  // touch (tablet)
  btn.addEventListener("touchstart", function (e) {
    e.preventDefault();
    startHold();
  });
  btn.addEventListener("touchend", cancelHold);
  btn.addEventListener("touchcancel", cancelHold);
})();

// ================= TITLE COLOURING =================
(function colourTitle() {
  const title = document.getElementById("menu-title");
  const text = title.textContent;
  const colours = ["#E4002B", "#FF8200", "#FFD100", "#2E7D32", "#0072CE", "#5B2E91"];
  title.innerHTML = "";
  let ci = 0;
  for (const ch of text) {
    const span = document.createElement("span");
    span.className = "l";
    if (ch === " ") {
      span.classList.add("space");
      span.innerHTML = "&nbsp;";
    } else {
      span.textContent = ch;
      if (ch !== "'") {
        span.style.color = colours[ci % colours.length];
        ci++;
      }
    }
    title.appendChild(span);
  }
})();

// ================= START =================
render();
fillMirrors();

// ================= WRITE MODE: DIGIT GUIDES =================
const digitPaths = {
  "0": [[
    {x:0.50,y:0.05},{x:0.34,y:0.07},{x:0.21,y:0.18},{x:0.14,y:0.34},{x:0.12,y:0.50},{x:0.14,y:0.66},{x:0.21,y:0.82},
    {x:0.34,y:0.93},{x:0.50,y:0.95},{x:0.66,y:0.93},{x:0.79,y:0.82},{x:0.86,y:0.66},{x:0.88,y:0.50},{x:0.86,y:0.34},
    {x:0.79,y:0.18},{x:0.66,y:0.07},{x:0.50,y:0.05}
  ]],
  "1": [[
    {x:0.50,y:0.08},{x:0.50,y:0.92}
  ]],
  "2": [[
    {x:0.14,y:0.32},{x:0.16,y:0.20},{x:0.26,y:0.11},{x:0.42,y:0.07},{x:0.60,y:0.09},{x:0.74,y:0.18},{x:0.80,y:0.34},
    {x:0.72,y:0.50},{x:0.52,y:0.63},{x:0.30,y:0.77},{x:0.15,y:0.88},{x:0.48,y:0.88},{x:0.83,y:0.88}
  ]],
  "3": [[
    {x:0.18,y:0.16},{x:0.34,y:0.08},{x:0.54,y:0.07},{x:0.72,y:0.15},{x:0.76,y:0.30},{x:0.64,y:0.42},{x:0.38,y:0.47},
    {x:0.64,y:0.51},{x:0.80,y:0.66},{x:0.75,y:0.84},{x:0.54,y:0.93},{x:0.32,y:0.92},{x:0.16,y:0.82}
  ]],
  "4": [[
    {x:0.20,y:0.08},{x:0.20,y:0.55},{x:0.88,y:0.55}
  ],[
    {x:0.72,y:0.08},{x:0.72,y:0.92}
  ]],
  "5": [[
    {x:0.68,y:0.09},{x:0.26,y:0.09},{x:0.24,y:0.28},{x:0.24,y:0.42},{x:0.42,y:0.35},{x:0.62,y:0.37},{x:0.78,y:0.52},{x:0.80,y:0.70},
    {x:0.68,y:0.87},{x:0.46,y:0.93},{x:0.24,y:0.88},{x:0.15,y:0.76}
  ]],
  "6": [[
    {x:0.68,y:0.10},{x:0.54,y:0.09},{x:0.40,y:0.15},{x:0.29,y:0.28},{x:0.22,y:0.45},{x:0.19,y:0.62},{x:0.20,y:0.76},
    {x:0.28,y:0.88},{x:0.44,y:0.93},{x:0.60,y:0.91},{x:0.74,y:0.82},{x:0.80,y:0.68},{x:0.78,y:0.55},{x:0.66,y:0.47},
    {x:0.50,y:0.45},{x:0.34,y:0.50},{x:0.24,y:0.60}
  ]],
  "7": [[
    {x:0.16,y:0.10},{x:0.84,y:0.10},{x:0.40,y:0.92}
  ]],
  "8": [[
    {x:0.500,y:0.500},{x:0.436,y:0.495},{x:0.374,y:0.481},{x:0.318,y:0.457},{x:0.271,y:0.426},{x:0.235,y:0.388},{x:0.211,y:0.346},{x:0.200,y:0.301},{x:0.204,y:0.256},{x:0.221,y:0.212},{x:0.252,y:0.172},{x:0.294,y:0.138},{x:0.345,y:0.110},{x:0.404,y:0.091},{x:0.468,y:0.081},{x:0.532,y:0.081},{x:0.596,y:0.091},{x:0.655,y:0.110},{x:0.706,y:0.138},{x:0.748,y:0.172},{x:0.779,y:0.212},{x:0.796,y:0.256},{x:0.800,y:0.301},{x:0.789,y:0.346},{x:0.765,y:0.388},{x:0.729,y:0.426},{x:0.682,y:0.457},{x:0.626,y:0.481},{x:0.564,y:0.495},{x:0.500,y:0.500}
  ],[
    {x:0.500,y:0.500},{x:0.436,y:0.505},{x:0.374,y:0.519},{x:0.318,y:0.543},{x:0.271,y:0.574},{x:0.235,y:0.612},{x:0.211,y:0.654},{x:0.200,y:0.699},{x:0.204,y:0.744},{x:0.221,y:0.788},{x:0.252,y:0.828},{x:0.294,y:0.862},{x:0.345,y:0.890},{x:0.404,y:0.909},{x:0.468,y:0.919},{x:0.532,y:0.919},{x:0.596,y:0.909},{x:0.655,y:0.890},{x:0.706,y:0.862},{x:0.748,y:0.828},{x:0.779,y:0.788},{x:0.796,y:0.744},{x:0.800,y:0.699},{x:0.789,y:0.654},{x:0.765,y:0.612},{x:0.729,y:0.574},{x:0.682,y:0.543},{x:0.626,y:0.519},{x:0.564,y:0.505},{x:0.500,y:0.500}
  ]],
  "9": [[
    {x:0.763,y:0.218},{x:0.778,y:0.272},{x:0.778,y:0.328},{x:0.763,y:0.382},{x:0.734,y:0.432},{x:0.692,y:0.475},{x:0.640,y:0.508},{x:0.580,y:0.530},{x:0.516,y:0.540},{x:0.451,y:0.536},{x:0.389,y:0.520},{x:0.333,y:0.493},{x:0.286,y:0.454},{x:0.250,y:0.408},{x:0.228,y:0.355},{x:0.220,y:0.300},{x:0.228,y:0.245},{x:0.250,y:0.192},{x:0.286,y:0.146},{x:0.333,y:0.107},{x:0.389,y:0.080},{x:0.451,y:0.064},{x:0.516,y:0.060},{x:0.580,y:0.070},{x:0.640,y:0.092},{x:0.692,y:0.125},{x:0.734,y:0.168},{x:0.763,y:0.218}
  ],[
    {x:0.775,y:0.400},{x:0.750,y:0.600},{x:0.680,y:0.800},{x:0.560,y:0.930}
  ]]
};

// current selected number for write mode
const writeState = { hundreds: null, tens: null, units: 1 };
let writeMode = "guided"; // "guided" or "free"
let mnistModel = null;

(async function loadMnist() {
  if (typeof tf === "undefined") return;
  try {
    mnistModel = await tf.loadLayersModel("mnist_model/model.json");
  } catch (e) {
    console.error("MNIST model failed to load:", e);
  }
})();

const writeCanvas = document.getElementById("write-canvas");
const wctx = writeCanvas.getContext("2d");

function sizeWriteCanvas() {
  const rect = writeCanvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  writeCanvas.width = rect.width * dpr;
  writeCanvas.height = rect.height * dpr;
  wctx.setTransform(dpr, 0, 0, dpr, 0, 0); // so we can draw in CSS pixels
  drawWriteGuides();
}

let writeStrokes = [];   // user's ink strokes
let writeCurrent = null;

function drawWriteGuides() {
  const rect = writeCanvas.getBoundingClientRect();
  const W = rect.width, H = rect.height;
  wctx.clearRect(0, 0, W, H);

  // --- guides ---
  const places = ["hundreds", "tens", "units"];
  const zoneW = W / 3;
  const digitH = H * 0.92;
  const digitW = digitH * 0.69;
  const topMargin = (H - digitH) / 2;

  if (writeMode === "guided") {
  wctx.save();
  wctx.strokeStyle = "#bbb";
  wctx.lineWidth = 8;
  wctx.lineCap = "round";
  wctx.lineJoin = "round";
  wctx.setLineDash([2, 20]);
  places.forEach(function (place, i) {
    const digit = writeState[place];
    if (digit === null) return;
    const strokes = digitPaths[String(digit)];
    const centreShift = (1 - i) * (zoneW * 0.12);
    const boxX = i * zoneW + (zoneW - digitW) / 2 + centreShift;
    const boxY = topMargin;
    strokes.forEach(function (stroke) {
      wctx.beginPath();
      stroke.forEach(function (p, j) {
        const px = boxX + p.x * digitW;
        const py = boxY + p.y * digitH;
        if (j === 0) wctx.moveTo(px, py); else wctx.lineTo(px, py);
      });
      wctx.stroke();
    });
  });
  wctx.restore();
  }

  // --- user ink on top ---
  wctx.save();
  wctx.strokeStyle = "#333";
  wctx.lineWidth = 7;
  wctx.lineCap = "round";
  wctx.lineJoin = "round";
  wctx.setLineDash([]);
  writeStrokes.forEach(function (s) {
    wctx.beginPath();
    s.forEach(function (p, j) { if (j === 0) wctx.moveTo(p.x, p.y); else wctx.lineTo(p.x, p.y); });
    wctx.stroke();
  });
  wctx.restore();
}

function clearInk() {
  writeStrokes = [];
  drawWriteGuides();
  clearWriteBlocks();
}

// --- drawing on the write canvas ---
function writePos(e) {
  const rect = writeCanvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}
let writeDrawing = false;
writeCanvas.addEventListener("pointerdown", function (e) {
  writeDrawing = true;
  writeCurrent = [writePos(e)];
  writeStrokes.push(writeCurrent);
});
writeCanvas.addEventListener("pointermove", function (e) {
  if (!writeDrawing) return;
  writeCurrent.push(writePos(e));
  drawWriteGuides();
});
writeCanvas.addEventListener("pointerup", function () { writeDrawing = false; writeCurrent = null; });
writeCanvas.addEventListener("pointerleave", function () { writeDrawing = false; writeCurrent = null; });

// draw when write screen is shown; size on load and resize
window.addEventListener("resize", function () {
  if (document.getElementById("screen-write").classList.contains("active")) {
    sizeWriteCanvas();
  }
});

// re-size the canvas when entering write mode (canvas has no size until visible)
const origTileWrite = document.getElementById("tile-write");
origTileWrite.addEventListener("click", function () {
  // slight delay so the screen is visible and canvas has dimensions
  setTimeout(sizeWriteCanvas, 30);
});

// ================= WRITE MODE: ARROW LOGIC =================
// Returns the ordered list of valid options for a place, given current state.
// null represents "blank".
function optionsFor(place) {
  if (place === "units") {
    return [0,1,2,3,4,5,6,7,8,9];
  }
  if (place === "hundreds") {
    return [null,1,2,3,4,5,6,7,8,9];
  }
  // tens
  if (writeState.hundreds === null) {
    return [null,1,2,3,4,5,6,7,8,9];   // no 0 (would be leading zero)
  } else {
    return [0,1,2,3,4,5,6,7,8,9];       // hundreds set: 0 allowed, no blank
  }
}

function cycle(place, dir) {
  const opts = optionsFor(place);
  const cur = writeState[place];
  let idx = opts.indexOf(cur);
  if (idx === -1) idx = 0; // current value not valid in this list; snap to first
  idx = (idx + dir + opts.length) % opts.length;
  writeState[place] = opts[idx];

  // ---- interactions to keep the number well-formed ----
  // Setting hundreds to a digit: a blank tens must become 0 (no gap).
  if (place === "hundreds") {
    if (writeState.hundreds !== null && writeState.tens === null) {
      writeState.tens = 0;
    }
    // Blanking hundreds: a tens of 0 would be a leading zero -> blank it.
    if (writeState.hundreds === null && writeState.tens === 0) {
      writeState.tens = null;
    }
  }

  clearInk();
}

// wire up the six arrows
document.querySelectorAll("#screen-write .digit-arrow").forEach(function (btn) {
  btn.addEventListener("click", function () {
    const place = btn.getAttribute("data-place");
    const dir = btn.classList.contains("up") ? 1 : -1;
    cycle(place, dir);
  });
});

// ================= WRITE MODE: HOLD-TO-CLEAR =================
(function setupWriteClear() {
  const btn = document.getElementById("clear-write");
  let holdTimer = null;
  function startHold() {
    btn.classList.add("holding");
    holdTimer = setTimeout(function () {
      clearInk();
      btn.classList.remove("holding");
    }, 750);
  }
  function cancelHold() {
    btn.classList.remove("holding");
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
  }
  btn.addEventListener("mousedown", startHold);
  btn.addEventListener("mouseup", cancelHold);
  btn.addEventListener("mouseleave", cancelHold);
  btn.addEventListener("touchstart", function (e) { e.preventDefault(); startHold(); });
  btn.addEventListener("touchend", cancelHold);
  btn.addEventListener("touchcancel", cancelHold);
})();

// ================= WRITE MODE: COVERAGE CHECK =================
const COVERAGE_TOLERANCE = 32;   // px: how close ink must pass to a guide point to "cover" it
const COVERAGE_THRESHOLD = 0.88; // fraction of guide points that must be covered

// densify a stroke's guide points so coverage sampling is even
function densifyGuide(strokes, boxX, boxY, digitW, digitH) {
  const pts = [];
  strokes.forEach(function (stroke) {
    for (let i = 0; i < stroke.length - 1; i++) {
      const a = stroke[i], b = stroke[i + 1];
      const ax = boxX + a.x * digitW, ay = boxY + a.y * digitH;
      const bx = boxX + b.x * digitW, by = boxY + b.y * digitH;
      const dist = Math.hypot(bx - ax, by - ay);
      const steps = Math.max(2, Math.round(dist / 8));
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        pts.push({ x: ax + (bx - ax) * t, y: ay + (by - ay) * t });
      }
    }
  });
  return pts;
}

// all of the user's ink points, flattened
function allInkPoints() {
  const pts = [];
  writeStrokes.forEach(function (s) { s.forEach(function (p) { pts.push(p); }); });
  return pts;
}

// check one digit's coverage
function digitCovered(place) {
  const rect = writeCanvas.getBoundingClientRect();
  const W = rect.width, H = rect.height;
  const zoneW = W / 3;
  const digitH = H * 0.92;
  const digitW = digitH * 0.69;
  const topMargin = (H - digitH) / 2;
  const i = ["hundreds","tens","units"].indexOf(place);
  const centreShift = (1 - i) * (zoneW * 0.12);
  const boxX = i * zoneW + (zoneW - digitW) / 2 + centreShift;
  const boxY = topMargin;

  const digit = writeState[place];
  const guide = densifyGuide(digitPaths[String(digit)], boxX, boxY, digitW, digitH);

  // gather ink points that fall within THIS digit's zone (so multi-digit works)
  const zoneLeft = i * zoneW, zoneRight = (i + 1) * zoneW;
  const ink = [];
  writeStrokes.forEach(function (s) {
    s.forEach(function (p) {
      if (p.x >= zoneLeft && p.x < zoneRight) ink.push(p);
    });
  });
  if (ink.length === 0) return false;

  // COVERAGE: fraction of guide points near some ink
  let covered = 0;
  guide.forEach(function (g) {
    for (let k = 0; k < ink.length; k++) {
      if (Math.hypot(ink[k].x - g.x, ink[k].y - g.y) <= COVERAGE_TOLERANCE) { covered++; break; }
    }
  });
  const coverage = covered / guide.length;

  // SPILLAGE: fraction of ink points that are FAR from every guide point
  let offPath = 0;
  ink.forEach(function (p) {
    let near = false;
    for (let k = 0; k < guide.length; k++) {
      if (Math.hypot(p.x - guide[k].x, p.y - guide[k].y) <= COVERAGE_TOLERANCE) { near = true; break; }
    }
    if (!near) offPath++;
  });
  const spillage = offPath / ink.length;

  return coverage >= COVERAGE_THRESHOLD && spillage <= 0.14;
}

const SPILLAGE_MAX = 0.14; // (reference; used inline above)

// check the whole number: every non-blank digit must be covered
function checkAllDigits() {
  const places = ["hundreds","tens","units"];
  let allPass = true;
  places.forEach(function (place) {
    if (writeState[place] === null) return; // blank digit: skip
    if (!digitCovered(place)) allPass = false;
  });
  return allPass;
}

document.getElementById("done-write").addEventListener("click", function () {
  if (writeMode === "guided") {
    const pass = checkAllDigits();
    if (pass) {
      if (writeState.hundreds === null && writeState.tens === null && writeState.units === 0) {
        summonZero();
      } else {
        summonWriteBlocks();
      }
    } else {
      writeCanvas.classList.add("try-again");
      setTimeout(function () { writeCanvas.classList.remove("try-again"); }, 1300);
    }
  } else {
    // FREE MODE
    const digits = recogniseFree();
    if (!digits) {
      writeCanvas.classList.add("try-again");
      setTimeout(function () { writeCanvas.classList.remove("try-again"); }, 1300);
      return;
    }
    // map recognised digits into writeState (right-aligned: units, tens, hundreds)
    writeState.hundreds = null; writeState.tens = null; writeState.units = 0;
    if (digits.length === 1) { writeState.units = digits[0]; }
    else if (digits.length === 2) { writeState.tens = digits[0]; writeState.units = digits[1]; }
    else if (digits.length === 3) { writeState.hundreds = digits[0]; writeState.tens = digits[1]; writeState.units = digits[2]; }
    if (writeState.hundreds === null && writeState.tens === null && writeState.units === 0) {
      summonZero();
    } else {
      summonWriteBlocks();
    }
  }
});

// ================= WRITE MODE: SUMMON BLOCKS =================
const WRITE_SCALE = 16; // 80% of build's 20

function makeUnitW() {
  const b = document.createElement("div");
  b.className = "block-1";
  b.style.width = WRITE_SCALE + "px";
  b.style.height = WRITE_SCALE + "px";
  return b;
}
function makeTenW() {
  const b = document.createElement("div");
  b.className = "block-10";
  for (let i = 0; i < 10; i++) {
    const c = document.createElement("div");
    c.className = "ten-cell";
    c.style.width = WRITE_SCALE + "px";
    c.style.height = WRITE_SCALE + "px";
    b.appendChild(c);
  }
  return b;
}
function makeHundredW() {
  const b = document.createElement("div");
  b.className = "block-100";
  b.style.gridTemplateColumns = "repeat(10, " + WRITE_SCALE + "px)";
  b.style.gridTemplateRows = "repeat(10, " + WRITE_SCALE + "px)";
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      const cell = document.createElement("div");
      let cls = "hcell " + ((r + c) % 2 === 0 ? "dark" : "light");
      if (c === 9) cls += " last-col";
      if (r === 9) cls += " last-row";
      cell.className = cls;
      b.appendChild(cell);
    }
  }
  return b;
}

function summonWriteBlocks() {
  clearWriteBlocks();

  const h = writeState.hundreds || 0;
  const t = writeState.tens || 0;
  const u = writeState.units || 0;

  // determine which places are present, in order H -> T -> U
  const sequence = [];
  if (writeState.hundreds !== null && h > 0) sequence.push("hundreds");
  if (writeState.tens !== null) sequence.push("tens");   // tens can be 0 (still "present" if shown)
  sequence.push("units"); // units always present

  // but only include a place if it actually has blocks to show
  const present = [];
  if (h > 0) present.push("hundreds");
  if (t > 0) present.push("tens");
  if (u > 0) present.push("units");
  // (if the digit is 0, there are simply no blocks in that column)

  // order present places H->T->U
  const ordered = ["hundreds","tens","units"].filter(function (p) { return present.indexOf(p) !== -1; });

  ordered.forEach(function (place, turn) {
    setTimeout(function () {
      renderWritePlace(place);
    }, turn * 750);
  });
}

function renderWritePlace(place) {
  if (place === "units") {
    const u = writeState.units || 0;
    const uStage = document.querySelector("#screen-write .column-units .column-stage");
    uStage.innerHTML = "";
    const uStack = document.createElement("div");
    uStack.className = "unit-stack";
    for (let i = 0; i < u; i++) {
      const blk = makeUnitW();
            if (u === 9) colourNineUnit(blk, i); else if (u === 7) colourSevenUnit(blk, i); else colourUnit(blk, u);
      blk.classList.add("summon-pop");
      blk.style.animationDelay = (i * 0.05) + "s";
      uStack.appendChild(blk);
    }
    uStage.appendChild(uStack);
    document.querySelector("#screen-write .column-units .column-count").textContent = u;
  } else if (place === "tens") {
    const t = writeState.tens || 0;
    const tStage = document.querySelector("#screen-write .column-tens .column-stage");
    tStage.innerHTML = "";
    const tRow = document.createElement("div");
    tRow.className = "ten-row";
    for (let i = 0; i < t; i++) {
      const blk = makeTenW();
            if (t === 9) colourNineTen(blk, i); else if (t === 7) colourSevenTen(blk, i); else colourTen(blk, t, t);
      blk.classList.add("summon-pop");
      blk.style.animationDelay = (i * 0.05) + "s";
      tRow.appendChild(blk);
    }
    tStage.appendChild(tRow);
    document.querySelector("#screen-write .column-tens .column-count").textContent = t;
  } else {
    const h = writeState.hundreds || 0;
    const hStage = document.querySelector("#screen-write .column-hundreds .column-stage");
    hStage.innerHTML = "";
    const stair = document.createElement("div");
    stair.className = "hundred-stair";
    const step = 1 * WRITE_SCALE;
    for (let i = 0; i < h; i++) {
      const blk = makeHundredW();
            if (h === 9) colourNineHundred(blk, i); else if (h === 7) colourSevenHundred(blk, i); else colourHundred(blk, h);
      blk.style.position = "absolute";
      blk.style.left = (i * step) + "px";
      blk.style.bottom = (i * step) + "px";
      blk.style.zIndex = (h - i);
      blk.classList.add("summon-pop");
      blk.style.animationDelay = (i * 0.05) + "s";
      stair.appendChild(blk);
    }
    const span = 10 * WRITE_SCALE + (h > 0 ? (h - 1) * step : 0);
    stair.style.width = span + "px";
    stair.style.height = span + "px";
    hStage.appendChild(stair);
    document.querySelector("#screen-write .column-hundreds .column-count").textContent = h;
  }
}

function clearWriteBlocks() {
  ["hundreds","tens","units"].forEach(function (place) {
    document.querySelector("#screen-write .column-" + place + " .column-stage").innerHTML = "";
    document.querySelector("#screen-write .column-" + place + " .column-count").textContent = "0";
  });
}

// ================= WRITE MODE: COLOURS =================
// bright = units colour; pale = tens (2+); hLight/hDark = hundreds checker; border = dark edge
const DIGIT_COLORS = {
  1: { bright:"#DE151D", pale:"#F09699", hLight:"#E96065", hDark:"#E23138", border:"#64090D" },
  2: { bright:"#F59120", pale:"#FACE9B", hLight:"#F8B467", hDark:"#F69E3B", border:"#6E410E" },
  3: { bright:"#FFD500", pale:"#FFEC8C", hLight:"#FFE252", hDark:"#FFDA1F", border:"#736000" },
  4: { bright:"#3DA43A", pale:"#A8D6A6", hLight:"#7BC179", hDark:"#54AF52", border:"#1B4A1A" },
  5: { bright:"#23B0DB", pale:"#9CDBEF", hLight:"#69C9E7", hDark:"#3DB9DF", border:"#104F63" },
  6: { bright:"#5B2E91", pale:"#B5A1CE", hLight:"#8F71B4", hDark:"#6F479E", border:"#291541" },
  8: { bright:"#EE2BA4", pale:"#F7A0D6", hLight:"#F36FC1", hDark:"#F044AF", border:"#6B134A" }
};

// colour one unit block for a given units-digit
function colourUnit(blk, digit) {
  const c = DIGIT_COLORS[digit];
  if (!c) return; // 7,9,0 handled later
  blk.style.backgroundColor = c.bright;
  blk.style.border = "1px solid " + c.border;
}

// colour one ten-strip for a given tens-digit, given how many tens there are
function colourTen(blk, digit, count) {
  const cells = blk.querySelectorAll(".ten-cell");
  if (count === 1) {
    // special case: a single ten is white with red border
    blk.style.border = "";
    cells.forEach(function (cell) {
      cell.style.background = "#fff";
      cell.style.border = "1.5px solid #DE151D";
      cell.style.borderBottom = "1px solid #c62828";
    });
    if (cells.length) cells[cells.length-1].style.borderBottom = "1.5px solid #DE151D";
    return;
  }
  const c = DIGIT_COLORS[digit];
  if (!c) return;
  cells.forEach(function (cell) {
    cell.style.background = c.pale;
    cell.style.border = "1.5px solid " + c.border;
    cell.style.borderBottom = "1px solid " + c.border;
  });
  if (cells.length) cells[cells.length-1].style.borderBottom = "1.5px solid " + c.border;
}

// colour one hundred-square for a given hundreds-digit
function colourHundred(blk, digit) {
  const c = DIGIT_COLORS[digit];
  if (!c) return;
  blk.style.border = "2px solid " + c.border;
  const cells = blk.querySelectorAll(".hcell");
  cells.forEach(function (cell) {
    if (cell.classList.contains("dark")) cell.style.backgroundColor = c.hDark;
    else cell.style.backgroundColor = c.hLight;
    cell.style.borderRight = "1px solid " + c.border;
    cell.style.borderBottom = "1px solid " + c.border;
    if (cell.classList.contains("last-col")) cell.style.borderRight = "none";
    if (cell.classList.contains("last-row")) cell.style.borderBottom = "none";
  });
}

// ================= NUMBERBLOCK 9 (three greys, banded) =================
// three greys, each with a lighter/darker checker pair for hundreds
const NINE_GREYS = [
  { solid:"#C8CDCE", hLight:"#CDD2D3", hDark:"#B8C0C2", border:"#6E7476" }, // light
  { solid:"#ACB0B2", hLight:"#B4B8BA", hDark:"#9EA3A5", border:"#5C6062" }, // mid
  { solid:"#8A9090", hLight:"#949A9A", hDark:"#7C8282", border:"#474C4C" }  // dark
];

// which grey band a block belongs to, given its index (0-based) out of total 9
function nineBand(index) {
  if (index < 3) return 0;      // first three
  if (index < 6) return 1;      // middle three
  return 2;                     // last three
}

function colourNineUnit(blk, index) {
  const g = NINE_GREYS[nineBand(index)];
  blk.style.backgroundColor = g.solid;
  blk.style.border = "1px solid " + g.border;
}
function colourNineTen(blk, index) {
  const g = NINE_GREYS[nineBand(index)];
  const cells = blk.querySelectorAll(".ten-cell");
  cells.forEach(function (cell) {
    cell.style.background = g.solid;
    cell.style.border = "1.5px solid " + g.border;
    cell.style.borderBottom = "1px solid " + g.border;
  });
  if (cells.length) cells[cells.length-1].style.borderBottom = "1.5px solid " + g.border;
}
function colourNineHundred(blk, index) {
  const g = NINE_GREYS[nineBand(index)];
  blk.style.border = "2px solid " + g.border;
  const cells = blk.querySelectorAll(".hcell");
  cells.forEach(function (cell) {
    if (cell.classList.contains("dark")) cell.style.backgroundColor = g.hDark;
    else cell.style.backgroundColor = g.hLight;
    cell.style.borderRight = "1px solid " + g.border;
    cell.style.borderBottom = "1px solid " + g.border;
    if (cell.classList.contains("last-col")) cell.style.borderRight = "none";
    if (cell.classList.contains("last-row")) cell.style.borderBottom = "none";
  });
}

// ================= NUMBERBLOCK 7 (rainbow, 7 colours) =================
const SEVEN_RAINBOW = [
  { bright:"#DE151D", pale:"#F09699", hLight:"#E96065", hDark:"#E23138", border:"#64090D" }, // red
  { bright:"#F59120", pale:"#FACE9B", hLight:"#F8B467", hDark:"#F69E3B", border:"#6E410E" }, // orange
  { bright:"#FFD500", pale:"#FFEC8C", hLight:"#FFE252", hDark:"#FFDA1F", border:"#736000" }, // yellow
  { bright:"#3DA43A", pale:"#A8D6A6", hLight:"#7BC179", hDark:"#54AF52", border:"#1B4A1A" }, // green
  { bright:"#23B0DB", pale:"#9CDBEF", hLight:"#69C9E7", hDark:"#3DB9DF", border:"#104F63" }, // blue
  { bright:"#5B2E91", pale:"#B5A1CE", hLight:"#8F71B4", hDark:"#6F479E", border:"#291541" }, // indigo
  { bright:"#8B3A9E", pale:"#CFA8D8", hLight:"#AD6DBB", hDark:"#9A4FAB", border:"#3E1A47" }  // violet
];

function colourSevenUnit(blk, index) {
  const c = SEVEN_RAINBOW[index];
  blk.style.backgroundColor = c.bright;
  blk.style.border = "1px solid " + c.border;
}
function colourSevenTen(blk, index) {
  const c = SEVEN_RAINBOW[index];
  const cells = blk.querySelectorAll(".ten-cell");
  cells.forEach(function (cell) {
    cell.style.background = c.pale;
    cell.style.border = "1.5px solid " + c.border;
    cell.style.borderBottom = "1px solid " + c.border;
  });
  if (cells.length) cells[cells.length-1].style.borderBottom = "1.5px solid " + c.border;
}
function colourSevenHundred(blk, index) {
  const c = SEVEN_RAINBOW[index];
  blk.style.border = "2px solid " + c.border;
  const cells = blk.querySelectorAll(".hcell");
  cells.forEach(function (cell) {
    if (cell.classList.contains("dark")) cell.style.backgroundColor = c.hDark;
    else cell.style.backgroundColor = c.hLight;
    cell.style.borderRight = "1px solid " + c.border;
    cell.style.borderBottom = "1px solid " + c.border;
    if (cell.classList.contains("last-col")) cell.style.borderRight = "none";
    if (cell.classList.contains("last-row")) cell.style.borderBottom = "none";
  });
}

// ================= NUMBERBLOCK ZERO (easter egg) =================
function summonZero() {
  clearWriteBlocks();
  const uStage = document.querySelector("#screen-write .column-units .column-stage");
  uStage.innerHTML = "";
  const zero = document.createElement("img");
  zero.src = "images/zero.png";
  zero.className = "zero-character summon-pop";
  uStage.appendChild(zero);
  document.querySelector("#screen-write .column-units .column-count").textContent = "0";
}

// ================= FREE MODE: SEGMENT + RECOGNISE =================
function strokeBoxF(s){
  let minX=1e9,maxX=-1e9,minY=1e9,maxY=-1e9;
  s.forEach(p=>{ if(p.x<minX)minX=p.x; if(p.x>maxX)maxX=p.x; if(p.y<minY)minY=p.y; if(p.y>maxY)maxY=p.y; });
  return {minX,maxX,minY,maxY};
}
function groupStrokesF(){
  if(writeStrokes.length===0) return [];
  const items = writeStrokes.map(s=>({s, box:strokeBoxF(s)})).sort((a,b)=>a.box.minX-b.box.minX);
  const groups=[]; let cur=[items[0]]; let curMaxX=items[0].box.maxX;
  const GAP=30;
  for(let i=1;i<items.length;i++){
    const it=items[i];
    if(it.box.minX-curMaxX > GAP){ groups.push(cur); cur=[it]; }
    else cur.push(it);
    curMaxX=Math.max(curMaxX,it.box.maxX);
  }
  groups.push(cur);
  return groups;
}
function groupBoxF(group){
  let minX=1e9,maxX=-1e9,minY=1e9,maxY=-1e9;
  group.forEach(it=>{ minX=Math.min(minX,it.box.minX); maxX=Math.max(maxX,it.box.maxX); minY=Math.min(minY,it.box.minY); maxY=Math.max(maxY,it.box.maxY); });
  return {minX,maxX,minY,maxY};
}
function preprocessRegionF(box){
  const rect=writeCanvas.getBoundingClientRect();
  const W=rect.width, H=rect.height;
  const pad2=8;
  const bx=Math.max(0,box.minX-pad2), by=Math.max(0,box.minY-pad2);
  const bw=Math.min(W,box.maxX+pad2)-bx, bh=Math.min(H,box.maxY+pad2)-by;
  const scale=20/Math.max(bw,bh);
  const sw=Math.round(bw*scale), sh=Math.round(bh*scale);
  // draw the ink region onto a black 28x28 (white strokes)
  const tmp=document.createElement("canvas"); tmp.width=28; tmp.height=28;
  const t=tmp.getContext("2d"); t.fillStyle="#000"; t.fillRect(0,0,28,28);
  t.strokeStyle="#fff"; t.lineWidth=18*scale; t.lineCap="round"; t.lineJoin="round";
  const offX=Math.round((28-sw)/2)-bx*scale, offY=Math.round((28-sh)/2)-by*scale;
  // redraw only this group's strokes, transformed
  currentGroupStrokes.forEach(s=>{
    t.beginPath();
    s.forEach((p,i)=>{
      const x=p.x*scale+offX, y=p.y*scale+offY;
      i===0 ? t.moveTo(x,y) : t.lineTo(x,y);
    });
    t.stroke();
  });
  // center by mass
  const d=t.getImageData(0,0,28,28).data;
  let sx=0,sy=0,sum=0;
  for(let y=0;y<28;y++)for(let x=0;x<28;x++){const v=d[(y*28+x)*4]; sx+=x*v; sy+=y*v; sum+=v;}
  if(sum>0){
    const cx=sx/sum, cy=sy/sum;
    const shX=Math.round(14-cx), shY=Math.round(14-cy);
    const c2=document.createElement("canvas"); c2.width=28; c2.height=28;
    const cc=c2.getContext("2d"); cc.fillStyle="#000"; cc.fillRect(0,0,28,28);
    cc.drawImage(tmp,shX,shY);
    return c2;
  }
  return tmp;
}

let currentGroupStrokes = [];

function recogniseFree(){
  if(!mnistModel) return null;
  const groups = groupStrokesF();
  if(groups.length===0 || groups.length>3) return null; // 1-3 digits only
  let digits=[];
  for(const g of groups){
    currentGroupStrokes = g.map(it=>it.s);
    const box=groupBoxF(g);
    const region=preprocessRegionF(box);
    const digit = tf.tidy(()=>{
      const inp=tf.browser.fromPixels(region,1).toFloat().div(255.0).reshape([1,28,28,1]);
      return mnistModel.predict(inp).argMax(1).dataSync()[0];
    });
    digits.push(digit);
  }
  return digits; // e.g. [4,2,6]
}

document.getElementById("toggle-write").addEventListener("click", function () {
  writeMode = (writeMode === "guided") ? "free" : "guided";
  document.getElementById("toggle-write").textContent = (writeMode === "guided") ? "Guided" : "Free";
  // show/hide arrows
  document.querySelectorAll("#screen-write .digit-arrow").forEach(function (b) {
    b.style.visibility = (writeMode === "guided") ? "visible" : "hidden";
  });
  // clear everything
  clearInk();
});