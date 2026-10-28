/* =========================================================
   biobot.js — BIO-BOT 9000 Interactive Lab Guide
   Reads from GitHub Secret deployment or session storage
   ========================================================= */

// Reads API key injected by GitHub Actions, window config, or session storage
const getActiveAPIKey = () => 
  (typeof window !== "undefined" && window.GEMINI_API_KEY) ||
  sessionStorage.getItem('gemini_user_key') || 
  "";

const GEMINI_MODEL = "gemini-3.5-flash-lite";

const BIOBOT_SYSTEM_PROMPT = `
You are BIO-BOT 9000, an enthusiastic, knowledgeable, and retro-futuristic AI biotechnology career guide and virtual lab mentor for high school students in North Jersey (Morris County School of Technology).

YOUR MISSION & IDENTITY:
- You guide students up the "DNA Career Ladder":
  1) Step 1: Amino Acid Quiz (Diagnostic interest matching)
  2) Step 2: Day-in-the-Life Lab Simulations (Centrifuge balancing, CRISPR Cas9 DNA repair targeting codon AUG)
  3) Step 3: Industry Soft Skills & Workplace Scenario Training
  4) Step 4: Digital Career Certification & Local New Jersey BioPharma Pathways
- You know that New Jersey is a global top-three biotechnology and pharmaceutical hub with over 400 life-science organizations.
- You have expert knowledge on key industry roles:
  * Forensic DNA Analyst ($67k–$81k)
  * Bioprocess Engineer ($112k)
  * Clinical Technician ($45k)
  * Plant Geneticist ($106k)
  * Discovery Research Scientist ($115k)
  * Quality Systems Specialist ($93k)
  * QC Microbiologist ($66k)

RESPONSE STYLE:
- Speak as a friendly, sharp, encouraging AI robot companion.
- Keep responses concise (2 to 4 sentences maximum) so they fit nicely inside the retro chat console.
`;

const ROLE_DETAILS = {
  "DNA Analyst": "Profiles and extracts DNA evidence, comparing trace samples against known databases to solve forensic inquiries. Salary: $67,440 - $81,367 (Bachelors Degree).",
  "Bioprocess Engineer": "Designs bioreactor equipment and fermentation pipelines to scale microbial proteins, biofuels, and bioplastics. Salary: $112,139 (Bachelors Degree).",
  "Clinical Technician": "Prepares patient specimens, operates robotic analyzers, and performs clinical tests in diagnostic hospital environments. Salary: $45,162 (Associates or Bachelors).",
  "Quality Systems Specialist": "Audits laboratory SOPs and manufacturing protocols to ensure treatments comply with strict government standards. Salary: $93,599 (Bachelors Degree).",
  "Plant Geneticist": "Applies gene editing to manipulate crop DNA, improving harvest yields, disease immunity, and climate tolerance. Salary: $106,000 (Bachelors or Masters).",
  "Discovery Research Scientist": "Conducts wet-lab screening experiments to invent therapeutic molecules and target novel cancer therapies. Salary: $115,000 (Bachelors or Ph.D.)."
};

function initBioBot() {
  if (document.getElementById('chat-window')) return;

  const pagePath = window.location.pathname.toLowerCase();
  const savedRole = localStorage.getItem('biotech_matched_role');

  // --- AUDIO SYNTHESIZER ---
  let soundCtx = null;
  function getAudio() {
    try {
      if (!soundCtx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) soundCtx = new AC();
      }
      if (soundCtx && soundCtx.state === 'suspended') {
        soundCtx.resume().catch(() => {});
      }
      return soundCtx;
    } catch(e) { return null; }
  }

  ['mousemove', 'pointermove', 'scroll', 'touchstart', 'focus'].forEach(evt => {
    window.addEventListener(evt, () => getAudio(), { passive: true, once: true });
  });

  const SoundFX = {
    hover() {
      const c = getAudio();
      if (!c) return;
      try {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(540, c.currentTime);
        gain.gain.setValueAtTime(0.035, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start();
        osc.stop(c.currentTime + 0.05);
      } catch(e) {}
    },
    click() {
      const c = getAudio();
      if (!c) return;
      try {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(320, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(160, c.currentTime + 0.07);
        gain.gain.setValueAtTime(0.055, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.07);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start();
        osc.stop(c.currentTime + 0.07);
      } catch(e) {}
    },
    quizComplete() {
      const c = getAudio();
      if (!c) return;
      try {
        const notes = [392, 523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
          const osc = c.createOscillator();
          const gain = c.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, c.currentTime + idx * 0.09);
          gain.gain.setValueAtTime(0.08, c.currentTime + idx * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + idx * 0.09 + 0.28);
          osc.connect(gain);
          gain.connect(c.destination);
          osc.start(c.currentTime + idx * 0.09);
          osc.stop(c.currentTime + idx * 0.09 + 0.28);
        });
      } catch(e) {}
    },
    typeChirp() {
      const c = getAudio();
      if (!c) return;
      try {
        const osc = c.createOscillator();
        const gain = c.createGain();
        osc.type = 'sine';
        const notes = [440, 493.88, 554.37, 659.25, 739.99];
        const freq = notes[Math.floor(Math.random() * notes.length)];
        osc.frequency.setValueAtTime(freq, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.85, c.currentTime + 0.04);
        gain.gain.setValueAtTime(0.016, c.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 0.045);
        osc.connect(gain);
        gain.connect(c.destination);
        osc.start();
        osc.stop(c.currentTime + 0.045);
      } catch(e) {}
    }
  };

  let lastHover = null;
  document.addEventListener('mouseover', e => {
    const btn = e.target.closest('button, .pixel-pill-btn, .tab-btn, .action-btn, .cr-btn, .quiz-option-btn, .tr-btn');
    if (btn && btn !== lastHover) {
      lastHover = btn;
      if (!/NOTEBOOK/i.test(btn.textContent)) SoundFX.hover();
    }
  });
  document.addEventListener('mouseout', e => {
    const btn = e.target.closest('button, .pixel-pill-btn, .tab-btn, .action-btn, .cr-btn, .quiz-option-btn, .tr-btn');
    if (btn && !btn.contains(e.relatedTarget)) lastHover = null;
  });
  document.addEventListener('mousedown', e => {
    const btn = e.target.closest('button, .pixel-pill-btn, .tab-btn, .action-btn, .cr-btn, .quiz-option-btn, .tr-btn');
    if (btn && !/NOTEBOOK/i.test(btn.textContent)) SoundFX.click();
  });

  const botCSS = `
    .bio-guide-hud {
      position: relative;
      margin: 0 auto 0.8rem auto;
      z-index: 50;
      display: flex;
      align-items: center;
      gap: 14px;
      background: rgba(10, 16, 42, 0.96);
      border: 2px solid var(--cyan-primary);
      border-radius: 24px;
      padding: 10px 18px;
      box-shadow: 0 0 22px rgba(77, 238, 234, 0.55);
      cursor: pointer;
      max-width: 560px;
      width: 100%;
      animation: floatGuideNatural 3s infinite ease-in-out;
      transition: all 0.25s ease;
    }
    .bio-guide-hud:hover { box-shadow: 0 0 32px var(--cyan-primary); transform: scale(1.015); }
    .bio-guide-hud::after {
      content: '';
      position: absolute;
      bottom: -9px;
      left: 50px;
      width: 0;
      height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 9px solid var(--cyan-primary);
    }
    @keyframes floatGuideNatural { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }

    .bio-guide-avatar {
      width: 44px;
      height: 44px;
      min-width: 44px;
      min-height: 44px;
      aspect-ratio: 1 / 1;
      background: #1e3a6e;
      border: 2px solid #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 1.35rem;
      line-height: 1;
    }
    .bio-guide-content { display: flex; flex-direction: column; gap: 3px; flex: 1; }
    .bio-guide-tag { font-family: var(--font-retro); font-size: 0.52rem; color: var(--cyan-primary); letter-spacing: 1.2px; }
    .bio-guide-speech { font-family: var(--font-body); font-size: 0.95rem; font-weight: 700; color: #ffffff; line-height: 1.35; }
    .type-cursor { display: inline-block; width: 6px; height: 13px; background: var(--cyan-primary); margin-left: 3px; vertical-align: middle; animation: blinkCursor 0.7s infinite alternate; }
    @keyframes blinkCursor { from { opacity: 0; } to { opacity: 1; } }

    body.crispr-page .bio-guide-hud,
    body:has(.tr-viewport) .bio-guide-hud {
      position: fixed;
      top: 14px;
      left: 28px;
      margin: 0;
      max-width: 360px;
      padding: 8px 14px;
      border-radius: 18px;
    }
    body.crispr-page .bio-guide-hud .bio-guide-avatar { width: 36px; height: 36px; min-width: 36px; font-size: 1.15rem; }
    body.crispr-page .bio-guide-hud .bio-guide-speech { font-size: 0.82rem; }

    /* Themed Chat Window */
    .chat-window {
      display: none;
      position: fixed; 
      bottom: 80px; 
      right: 25px; 
      width: 340px;
      height: 430px;
      background: rgba(10, 16, 42, 0.98);
      border: 2.5px solid var(--cyan-primary);
      border-radius: 20px;
      z-index: 10002;
      flex-direction: column;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.95);
      overflow: hidden;
    }
    .chat-window.open { display: flex !important; animation: popRight 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    @keyframes popRight { from { opacity: 0; transform: scale(0.85) translateY(15px); } to { opacity: 1; transform: scale(1) translateY(0); } }

    .chat-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      background: rgba(16, 26, 68, 0.95);
      border-bottom: 1.5px solid var(--card-border);
    }
    .chat-top-title { font-family: var(--font-retro); font-size: 0.52rem; letter-spacing: 1px; color: var(--cyan-primary); display: flex; align-items: center; gap: 6px; }
    .chat-status-dot { width: 8px; height: 8px; border-radius: 50%; background: #4deeea; box-shadow: 0 0 8px #4deeea; }
    
    .chat-top-actions { display: flex; align-items: center; gap: 8px; }
    .chat-key-btn, .chat-close-btn {
      background: transparent;
      border: none;
      color: #92bbf5;
      font-size: 0.95rem;
      cursor: pointer;
      line-height: 1;
      padding: 2px 4px;
      border-radius: 4px;
    }
    .chat-key-btn:hover, .chat-close-btn:hover { color: var(--cyan-primary); background: rgba(77, 238, 234, 0.15); }

    .chat-history { flex: 1; padding: 1rem; overflow-y: auto; display: flex; flex-direction: column; gap: 0.75rem; }
    .chat-message { display: flex; align-items: flex-start; gap: 8px; }
    .chat-icon { width: 34px; height: 34px; min-width: 34px; min-height: 34px; aspect-ratio: 1 / 1; background: #1e3a6e; border-radius: 50%; border: 1.5px solid #fff; display: flex; align-items: center; justify-content: center; font-size: 1.05rem; flex-shrink: 0; }
    .bot-text { font-family: 'Nunito', sans-serif; font-weight: 600; font-size: 0.92rem; line-height: 1.4; color: #ffffff; background: rgba(18, 30, 72, 0.7); border: 1px solid rgba(77, 238, 234, 0.3); padding: 8px 12px; border-radius: 12px; }
    .user-message { align-self: flex-end; background: var(--cyan-primary); color: #0b0f27; font-family: 'Nunito', sans-serif; font-weight: 800; font-size: 0.92rem; padding: 7px 12px; border-radius: 14px; max-width: 85%; }
    
    .chat-input-area { padding: 8px 10px; background: rgba(8, 12, 34, 0.98); border-top: 1.5px solid rgba(77, 238, 234, 0.25); }
    .chat-input-pill { width: 100%; background: #060b20; border: 1.5px solid #4a6fa5; border-radius: 18px; padding: 9px 12px; color: #fff; font-family: 'Nunito', sans-serif; font-weight: 600; font-size: 0.9rem; outline: none; }
    .chat-input-pill:focus { border-color: var(--cyan-primary); box-shadow: 0 0 10px rgba(77, 238, 234, 0.4); }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = botCSS;
  document.head.appendChild(styleEl);

  const guideMarkup = `
    <aside class="bio-guide-hud" id="bio-guide-hud" title="Click to open Bio-Bot Console">
      <div class="bio-guide-avatar">🤖</div>
      <div class="bio-guide-content">
        <span class="bio-guide-tag">BIO-BOT 9000 &bull; LAB COMPANION</span>
        <span class="bio-guide-speech" id="bio-guide-speech"><span id="type-target"></span><span class="type-cursor" id="type-cursor"></span></span>
      </div>
    </aside>

    <div id="chat-window" class="chat-window">
      <div class="chat-top-bar">
        <div class="chat-top-title"><span class="chat-status-dot"></span> BIO-BOT 9000 &bull; AI</div>
        <div class="chat-top-actions">
          <button class="chat-key-btn" id="chat-key-btn" type="button" title="Set Gemini API Key for session">🔑</button>
          <button class="chat-close-btn" id="chat-close-btn" type="button" aria-label="Close Chat">✕</button>
        </div>
      </div>
      <div class="chat-history" id="chat-history">
        <div class="chat-message bot-message">
          <span class="chat-icon">🤖</span>
          <div class="bot-text" id="chat-initial-text">
            GREETINGS! I AM BIO-BOT 9000. ASK ME ANYTHING ABOUT BIOTECH PATHWAYS!
          </div>
        </div>
      </div>
      <div class="chat-input-area">
        <input type="text" id="chat-input" class="chat-input-pill" placeholder="Ask Bio-Bot anything..." autocomplete="off" />
      </div>
    </div>
  `;

  const navCluster = document.querySelector('.nav-cluster');
  if (navCluster && (!pagePath.includes('quiz') && !pagePath.includes('crispr') && !pagePath.includes('training'))) {
    navCluster.insertAdjacentHTML('beforebegin', guideMarkup);
  } else {
    document.body.insertAdjacentHTML('beforeend', guideMarkup);
  }

  const chatWin = document.getElementById('chat-window');
  const chatInput = document.getElementById('chat-input');
  const chatHistory = document.getElementById('chat-history');
  const guideHud = document.getElementById('bio-guide-hud');
  const closeBtn = document.getElementById('chat-close-btn');
  const keyBtn = document.getElementById('chat-key-btn');
  const typeTarget = document.getElementById('type-target');
  const typeCursor = document.getElementById('type-cursor');

  let activeTypeTimer = null;

  window.setBioGuideSpeech = function(text, speed = 20) {
    if (activeTypeTimer) clearInterval(activeTypeTimer);
    typeTarget.textContent = '';
    typeCursor.style.display = 'inline-block';

    let i = 0;
    activeTypeTimer = setInterval(() => {
      if (i < text.length) {
        typeTarget.textContent += text.charAt(i);
        if (text.charAt(i) !== ' ') SoundFX.typeChirp();
        i++;
      } else {
        clearInterval(activeTypeTimer);
        activeTypeTimer = null;
        setTimeout(() => { typeCursor.style.display = 'none'; }, 1200);
      }
    }, speed);
  };

  if (closeBtn) closeBtn.addEventListener('click', (e) => { e.stopPropagation(); chatWin.classList.remove('open'); });
  if (keyBtn) keyBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const userKey = prompt("Paste your Google Gemini API key to activate live AI for this session (never saved to GitHub):", getActiveAPIKey());
    if (userKey !== null) {
      sessionStorage.setItem('gemini_user_key', userKey.trim());
      alert(userKey.trim() ? "Gemini Key activated for this tab session!" : "Cleared. Bio-Bot will run in offline mode.");
    }
  });

  // Page Specific Greetings
  if (pagePath.includes('quiz')) {
    if (savedRole) {
      setTimeout(() => {
        const quizCard = document.getElementById('quiz-card');
        const baseDiagram = document.getElementById('base-diagram');
        const outcomeCard = document.getElementById('outcome-card');
        const heading = document.getElementById('stage-heading');
        const subheading = document.getElementById('stage-subheading');
        const roleTitle = document.getElementById('matched-role-title');
        const roleDesc = document.getElementById('matched-role-desc');
        const currentRole = document.getElementById('current-role');
        const expFill = document.getElementById('exp-fill');

        if (quizCard) quizCard.style.display = 'none';
        if (baseDiagram) baseDiagram.style.display = 'none';
        if (heading) heading.textContent = "MATCH RESULT";
        if (subheading) subheading.textContent = "(CODON DECODED)";
        if (outcomeCard) outcomeCard.style.display = 'flex';
        if (roleTitle) roleTitle.textContent = savedRole.toUpperCase();
        if (roleDesc) roleDesc.textContent = ROLE_DETAILS[savedRole] || "Ready for field simulation.";
        if (currentRole) currentRole.textContent = savedRole.toUpperCase();
        if (expFill) expFill.style.width = '100%';

        setBioGuideSpeech(`Welcome back! You are matched as: ${savedRole}. Ready for your simulation?`);
      }, 100);
    } else {
      setTimeout(() => { setBioGuideSpeech("Welcome to the Amino Acid Quiz! Answer honestly to determine your role."); }, 150);
    }

    const observer = new MutationObserver(() => {
      const outcome = document.getElementById('outcome-card');
      if (outcome && outcome.style.display === 'flex' && !window._fanfarePlayed) {
        window._fanfarePlayed = true;
        SoundFX.quizComplete();
      }
    });
    observer.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['style'] });

  } else if (pagePath.includes('crispr')) {
    setTimeout(() => { setBioGuideSpeech("Target sequence A-U-G-A-G-A in order! Repair the cell to earn experience!"); }, 150);
  } else if (pagePath.includes('training')) {
    setTimeout(() => { setBioGuideSpeech("Welcome to Industry Training! Practice your soft skills in these workplace scenarios to earn your certificate."); }, 150);
  } else {
    if (!savedRole) {
      setTimeout(() => { setBioGuideSpeech("Hello! I'm Bio-Bot 9000! I will be your virtual guide while you explore your career in Bio-Tech! To start, click on the Amino Acid Quiz to determine your role."); }, 300);
    } else {
      setTimeout(() => { setBioGuideSpeech(`Welcome back! Your matched codon role is: ${savedRole}. Step 2 is unlocked: enter the simulation!`); }, 300);
    }
  }

  guideHud.addEventListener('click', () => {
    chatWin.classList.toggle('open');
    if (chatWin.classList.contains('open')) chatInput.focus();
  });

  window.toggleChat = function() {
    chatWin.classList.toggle('open');
    if (chatWin.classList.contains('open')) chatInput.focus();
  };

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button, a');
    if (btn && /BIO-BOT/i.test(btn.textContent)) {
      e.preventDefault();
      e.stopPropagation();
      window.toggleChat();
    }
  });

  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') sendBioBotMessage();
  });

  function getOfflineBioBotReply(prompt) {
    const q = prompt.toLowerCase();
    if (q.includes("quiz") || q.includes("start") || q.includes("first")) {
      return "BEEP BOOP! Take the Amino Acid Quiz! It maps your problem-solving style to real careers like Forensic DNA Analyst or Bioprocess Engineer!";
    } else if (q.includes("salary") || q.includes("pay") || q.includes("earn") || q.includes("money")) {
      return "BEEP BOOP! Entry Lab Assistants earn ~$44,000, DNA Analysts earn ~$74,000, and Senior Bioinformaticians earn up to $160,000 in NJ!";
    } else if (q.includes("crispr") || q.includes("sim") || q.includes("cas9")) {
      return "BEEP BOOP! In the CRISPR sim, hit A-U-G-A-G-A. AUG is the universal start codon that kicks off protein translation!";
    } else if (q.includes("training") || q.includes("soft skill") || q.includes("cert")) {
      return "BEEP BOOP! In Industry Training, answer the workplace scenarios thoroughly. Once completed, your customized Certificate is unlocked!";
    }
    return "BEEP BOOP! I am BIO-BOT 9000, your guide. Explore the steps above to advance up the DNA Career Ladder!";
  }

  async function callGeminiAPI(userPrompt) {
    const activeKey = getActiveAPIKey();
    if (!activeKey) return null;

    const modelsToTry = [GEMINI_MODEL, "gemini-1.5-flash", "gemini-1.5-flash-8b"];

    for (const model of modelsToTry) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeKey}`;
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: { parts: [{ text: BIOBOT_SYSTEM_PROMPT.trim() }] },
            contents: [{ parts: [{ text: userPrompt }] }]
          })
        });

        const data = await res.json();
        if (data.candidates && data.candidates[0]?.content?.parts[0]?.text) {
          return data.candidates[0].content.parts[0].text.replace(/\*\*/g, '');
        }
      } catch (err) {
        console.warn(`Gemini model ${model} request failed, trying next...`, err);
      }
    }
    return null;
  }

  async function sendBioBotMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    const userDiv = document.createElement('div');
    userDiv.className = 'user-message';
    userDiv.innerText = text;
    chatHistory.appendChild(userDiv);
    chatInput.value = '';
    chatHistory.scrollTop = chatHistory.scrollHeight;

    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'chat-message bot-message';
    thinkingDiv.id = 'thinking-indicator';
    thinkingDiv.innerHTML = `
      <span class="chat-icon">🤖</span>
      <p class="bot-text" style="color: #4deeea; font-style: italic;">Bio-Bot 9000 is calculating...</p>
    `;
    chatHistory.appendChild(thinkingDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;

    let botReply = await callGeminiAPI(text);

    const ind = document.getElementById('thinking-indicator');
    if (ind) ind.remove();

    if (!botReply) botReply = getOfflineBioBotReply(text);

    const botDiv = document.createElement('div');
    botDiv.className = 'chat-message bot-message';
    botDiv.innerHTML = `<span class="chat-icon">🤖</span><p class="bot-text"></p>`;
    botDiv.querySelector('.bot-text').innerText = botReply;
    chatHistory.appendChild(botDiv);
    chatHistory.scrollTop = chatHistory.scrollHeight;
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') chatWin.classList.remove('open');
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initBioBot);
} else {
  initBioBot();
}
