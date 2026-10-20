/* =========================================================
   lab-notebook.js
   Digital Lab Notebook for "The DNA of Career Exploration"
   - Injects its own CSS + markup (no edits to index.html / style.css)
   - Opens/closes when the "LAB NOTEBOOK" footer button is clicked
   - Fully typeable; entries autosave in localStorage
   Usage: add  <script src="lab-notebook.js"></script>  just before </body>
   ========================================================= */
function labNotebookInit() {
  'use strict';

  var STORAGE_KEY = 'dnaLabNotebook.v1';

  /* ---------- 1. STYLES ---------- */
  var css = `
  .lab-notebook {
    position: fixed;
    top: 4vh;
    bottom: 104px;               /* leaves the EXP bar + footer buttons visible */
    left: 50%;
    width: min(640px, calc(100vw - 24px));
    transform: translateX(-50%) translateY(14px) scale(0.97);
    opacity: 0;
    visibility: hidden;
    z-index: 20;                 /* above DNA + content, below CRT scanlines */
    display: flex;
    flex-direction: column;
    background: #fff;
    border: 5px solid #000;
    border-left-width: 14px;
    border-radius: 18px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.65), 0 0 24px rgba(77, 238, 234, 0.25);
    padding: 12px 10px 10px;
    color: #1e3a6e;
    font-family: Arial, Helvetica, sans-serif;
    transition: opacity 0.25s ease, transform 0.25s ease, visibility 0.25s;
  }
  .lab-notebook.open {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0) scale(1);
  }

  .lab-notebook .ln-close {
    position: absolute;
    top: 6px;
    right: 8px;
    width: 22px;
    height: 22px;
    border: 1.5px solid #41b8cd;
    border-radius: 50%;
    background: #fff;
    color: #1e3a6e;
    font: bold 12px/1 Arial, sans-serif;
    cursor: pointer;
    padding: 0;
  }
  .lab-notebook .ln-close:hover { background: #41b8cd; color: #fff; }

  .ln-title {
    align-self: center;
    font-family: 'Press Start 2P', monospace;
    font-size: 0.6rem;
    letter-spacing: 1px;
    color: #000;
    border: 1.5px solid #41b8cd;
    border-radius: 30px;
    padding: 8px 34px;
    margin-bottom: 8px;
    white-space: nowrap;
  }

  .ln-objective {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 6px;
    flex-wrap: wrap;
    font-family: 'Press Start 2P', monospace;
    font-size: 0.46rem;
    letter-spacing: 1px;
    color: #0f5566;
    margin-bottom: 8px;
  }
  .ln-objective input {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: #000;
    border: none;
    border-bottom: 1.5px solid #41b8cd;
    outline: none;
    background: transparent;
    width: 150px;
    text-align: center;
  }

  /* black speech-tag with little yellow pointer */
  .ln-tag {
    position: relative;
    align-self: flex-start;
    background: #000;
    color: #fff;
    border: 1.5px solid #41b8cd;
    border-radius: 14px;
    font-family: 'Press Start 2P', monospace;
    font-size: 0.4rem;
    line-height: 1.7;
    letter-spacing: 0.5px;
    padding: 5px 12px;
    margin: 9px 0 4px 6px;
    transition: opacity 0.3s ease;
  }
  .ln-tag::before {
    content: '';
    position: absolute;
    width: 2px;
    height: 8px;
    background: #f5d442;
  }
  .ln-tag.tag-top::before    { top: -9px;    left: 76px; }
  .ln-tag.tag-bottom::before { bottom: -9px; left: 106px; }
  .ln-tag.faded { opacity: 0.25; }

  /* the writing surface */
  .ln-page {
    flex: 1;
    min-height: 0;
    width: 100%;
    resize: none;
    border: none;
    outline: none;
    background-color: transparent;
    background-image: repeating-linear-gradient(
      to bottom,
      transparent 0,
      transparent 23px,
      #41b8cd 23px,
      #41b8cd 24px
    );
    background-attachment: local;   /* ruled lines scroll with the text */
    font-family: Arial, Helvetica, sans-serif;
    font-size: 15px;
    font-weight: 700;
    line-height: 24px;
    color: #000;
    padding: 0 6px;
    margin-top: 4px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: #41b8cd transparent;
  }
  .ln-page::placeholder { color: #2f6573; font-weight: 600; }

  .ln-sign {
    display: flex;
    gap: 6px;
    margin-top: 6px;
  }
  .ln-pill {
    display: flex;
    align-items: baseline;
    gap: 3px;
    min-width: 0;
    border: 1.5px solid #41b8cd;
    border-radius: 20px;
    padding: 6px 10px;
    font-size: 13px;
    font-weight: 700;
    color: #000;
    background: #fff;
  }
  .ln-pill.p-sig  { flex: 1.25; }
  .ln-pill.p-date { flex: 0.75; }
  .ln-pill input {
    flex: 1;
    min-width: 0;
    border: none;
    border-bottom: 1.5px solid #000;
    outline: none;
    background: transparent;
    font: inherit;
    color: #000;
    padding: 0;
  }
  .ln-pill:focus-within { box-shadow: 0 0 8px rgba(65, 184, 205, 0.7); }

  .ln-quick {
    align-self: flex-start;
    margin: 8px 0 0 6px;
    width: 140px;
    background: #000;
    color: #fff;
    border: 1.5px solid #41b8cd;
    border-radius: 14px;
    font-family: 'Press Start 2P', monospace;
    font-size: 0.4rem;
    padding: 6px 10px;
    outline: none;
  }
  .ln-quick::placeholder { color: #fff; opacity: 1; }
  .ln-quick:focus { box-shadow: 0 0 8px #41b8cd; }

  @media (max-width: 880px) {
    .lab-notebook { bottom: 150px; }   /* footer stacks on small screens */
  }
  `;
  var styleEl = document.createElement('style');
  styleEl.id = 'lab-notebook-styles';
  styleEl.textContent = css;
  document.head.appendChild(styleEl);

  /* ---------- 2. MARKUP ---------- */
  var nb = document.createElement('section');
  nb.className = 'lab-notebook';
  nb.id = 'lab-notebook';
  nb.setAttribute('role', 'dialog');
  nb.setAttribute('aria-label', 'Digital Lab Notebook');
  nb.innerHTML = `
    <button class="ln-close" type="button" aria-label="Close notebook">&times;</button>

    <div class="ln-title">DIGITAL LAB NOTEBOOK</div>

    <div class="ln-objective">
      <span>DAILY OBJECTIVE:</span>
      <input type="text" id="ln-objective" maxlength="60" autocomplete="off" aria-label="Daily objective" />
      <span>(+15 EXP)</span>
    </div>

    <div class="ln-tag tag-top" id="ln-date-tag">DON'T FORGET THE DATE! :)</div>

    <textarea class="ln-page" id="ln-page" spellcheck="true"
      placeholder="Start typing your lab notes here..."></textarea>

    <div class="ln-tag tag-bottom">TIP: IN A PROFESSIONAL LAB NOTEBOOK, EACH PAGE IS DATED AND SIGNED BY YOU AND SOMEONE ELSE.</div>

    <div class="ln-sign">
      <label class="ln-pill p-sig">Signature: <input type="text" id="ln-sig1" autocomplete="off" /></label>
      <label class="ln-pill p-date">Date: <input type="text" id="ln-date" placeholder="MM/DD" maxlength="10" autocomplete="off" /></label>
      <label class="ln-pill p-sig">Signature: <input type="text" id="ln-sig2" autocomplete="off" /></label>
    </div>

    <input class="ln-quick" type="text" id="ln-quick" placeholder="Enter Text Here" autocomplete="off"
      aria-label="Quick add a line to the notebook (press Enter)" />
  `;
  document.body.appendChild(nb);

  /* ---------- 3. ELEMENT REFERENCES ---------- */
  var page      = nb.querySelector('#ln-page');
  var objective = nb.querySelector('#ln-objective');
  var dateInput = nb.querySelector('#ln-date');
  var sig1      = nb.querySelector('#ln-sig1');
  var sig2      = nb.querySelector('#ln-sig2');
  var quick     = nb.querySelector('#ln-quick');
  var dateTag   = nb.querySelector('#ln-date-tag');
  var closeBtn  = nb.querySelector('.ln-close');

  var fields = { page: page, objective: objective, date: dateInput, sig1: sig1, sig2: sig2 };

  /* ---------- 4. SAVE / LOAD ---------- */
  function save() {
    try {
      var data = {};
      Object.keys(fields).forEach(function (k) { data[k] = fields[k].value; });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) { /* storage unavailable – notebook still works */ }
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var data = JSON.parse(raw);
      Object.keys(fields).forEach(function (k) {
        if (typeof data[k] === 'string') fields[k].value = data[k];
      });
    } catch (e) { /* ignore corrupt/blocked storage */ }
  }

  function refreshDateTag() {
    dateTag.classList.toggle('faded', dateInput.value.trim().length > 0);
  }

  Object.keys(fields).forEach(function (k) {
    fields[k].addEventListener('input', function () {
      save();
      if (k === 'date') refreshDateTag();
    });
  });

  /* "+15 EXP" – fires once, the first time a daily objective is written.
     Listen elsewhere with: document.addEventListener('labnotebook:exp', e => e.detail.amount) */
  var expAwarded = false;
  objective.addEventListener('change', function () {
    if (!expAwarded && objective.value.trim()) {
      expAwarded = true;
      document.dispatchEvent(new CustomEvent('labnotebook:exp', { detail: { amount: 15 } }));
    }
  });

  /* Quick-add box: press Enter to append a line to the notebook */
  quick.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter') return;
    var text = quick.value.trim();
    if (!text) return;
    page.value += (page.value && !page.value.endsWith('\n') ? '\n' : '') + text + '\n';
    quick.value = '';
    page.scrollTop = page.scrollHeight;
    save();
  });

  load();
  refreshDateTag();

  /* ---------- 5. OPEN / CLOSE ---------- */
  var toggleBtn = Array.prototype.find.call(
    document.querySelectorAll('.action-btn'),
    function (b) { return /LAB NOTEBOOK/i.test(b.textContent); }
  );

  function openNotebook() {
    nb.classList.add('open');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
    setTimeout(function () { page.focus(); }, 260);
  }
  function closeNotebook() {
    nb.classList.remove('open');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
  }

  if (toggleBtn) {
    toggleBtn.setAttribute('aria-controls', 'lab-notebook');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.addEventListener('click', function () {
      nb.classList.contains('open') ? closeNotebook() : openNotebook();
    });
  } else {
    console.warn('lab-notebook.js: could not find the LAB NOTEBOOK button (.action-btn).');
  }

  closeBtn.addEventListener('click', closeNotebook);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nb.classList.contains('open')) closeNotebook();
  });
}

/* Wait for the page to exist, so this works in <head> or at the end of <body> */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', labNotebookInit);
} else {
  labNotebookInit();
}