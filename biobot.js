/* =========================================================
   biobot.js — BIO-BOT 9000 with Top Companion HUD
   ========================================================= */

function initBioBot() {
  if (document.getElementById('chat-window')) return;

  const ONBOARD_KEY = 'biobot_welcomed_v2';

  const botCSS = `
    /* Floating Top Companion Bubble */
    .bio-guide-hud {
      position: fixed;
      top: 18px;
      right: 28px;
      z-index: 10000;
      display: flex;
      align-items: center;
      gap: 12px;
      background: rgba(11, 15, 39, 0.94);
      border: 2px solid var(--cyan-primary);
      border-radius: 40px;
      padding: 8px 18px 8px 12px;
      box-shadow: 0 0 20px rgba(77, 238, 234, 0.45);
      animation: floatGuide 3s infinite ease-in-out;
      cursor: pointer;
      max-width: 440px;
      transition: transform 0.2s ease;
    }
    .bio-guide-hud:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 0 0 26px var(--cyan-primary);
    }
    @keyframes floatGuide {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    .bio-guide-avatar {
      font-size: 1.4rem;
      background: #1e3a6e;
      border: 2px solid #fff;
      border-radius: 50%;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .bio-guide-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .bio-guide-tag {
      font-family: var(--font-retro);
      font-size: 0.5rem;
      color: var(--cyan-primary);
      letter-spacing: 1px;
    }
    .bio-guide-speech {
      font-family: var(--font-body);
      font-size: 0.88rem;
      font-weight: 700;
      color: #ffffff;
      line-height: 1.25;
    }

    /* Bottom Chat Modal */
    .chat-window {
      display: none;
      position: fixed; 
      bottom: 85px; 
      right: 25px; 
      width: 330px;
      height: 425px;
      background-color: #050816;
      border: 2px solid #ffffff;
      border-radius: 16px;
      z-index: 10002;
      flex-direction: column;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.95);
      overflow: hidden;
    }
    .chat-window.open {
      display: flex !important;
      animation: popRight 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    @keyframes popRight {
      from { opacity: 0; transform: scale(0.85) translateY(15px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }
    .chat-history {
      flex: 1;
      padding: 0.9rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }
    .chat-message { display: flex; align-items: flex-start; gap: 8px; }
    .chat-icon {
      font-size: 1.15rem;
      background: #1e3a6e;
      border-radius: 50%;
      padding: 4px;
      border: 1px solid #fff;
    }
    .bot-text {
      font-family: 'Nunito', sans-serif;
      font-weight: 600;
      font-size: 0.92rem;
      line-height: 1.38;
      color: #ffffff;
      margin-top: 2px;
    }
    .user-message {
      align-self: flex-end;
      background: #4deeea;
      color: #000;
      font-family: 'Nunito', sans-serif;
      font-weight: 800;
      font-size: 0.92rem;
      padding: 6px 10px;
      border-radius: 10px;
      line-height: 1.35;
      max-width: 85%;
    }
    .chat-input-area {
      padding: 6px 8px;
      background: #000;
      border-top: 1px solid #233453;
    }
    .chat-input-pill {
      width: 100%;
      background: #090e24;
      border: 1.5px solid #5b7da8;
      border-radius: 14px;
      padding: 8px 12px;
      color: #fff;
      font-family: 'Nunito', sans-serif;
      font-weight: 600;
      font-size: 0.9rem;
      outline: none;
    }
    .chat-input-pill:focus {
      border-color: #4deeea;
      box-shadow: 0 0 8px rgba(77, 238, 234, 0.4);
    }
  `;
  const styleEl = document.createElement('style');
  styleEl.textContent = botCSS;
  document.head.appendChild(styleEl);

  // Top Guide Bubble Markup
  const guideMarkup = `
    <aside class="bio-guide-hud" id="bio-guide-hud" title="Click to talk to Bio-Bot">
      <div class="bio-guide-avatar">🤖</div>
      <div class="bio-guide-content">
        <span class="bio-guide-tag">BIO-BOT 9000 &bull; LAB COMPANION</span>
        <span class="bio-guide-speech" id="bio-guide-speech">Welcome! Click AMINO ACID QUIZ to find your biotech role!</span>
      </div>
    </aside>

    <div id="chat-window" class="chat-window">
      <div class="chat-history" id="chat-history">
        <div class="chat-message bot-message">
          <span class="chat-icon">🤖</span>
          <div class="bot-text">
            HI! I AM BIO-BOT 9000. I AM HERE TO GUIDE YOU THROUGH YOUR CAREER LADDER!
          </div>
        </div>
      </div>
      <div class="chat-input-area">
        <input type="text" id="chat-input" class="chat-input-pill" placeholder="Ask Bio-Bot anything..." autocomplete="off" />
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', guideMarkup);

  const chatWin = document.getElementById('chat-window');
  const chatInput = document.getElementById('chat-input');
  const chatHistory = document.getElementById('chat-history');
  const guideHud = document.getElementById('bio-guide-hud');
  const guideSpeech = document.getElementById('bio-guide-speech');

  // Contextual Speech Engine for Top Guide Bubble
  window.setBioGuideSpeech = function(msg) {
    if (guideSpeech) guideSpeech.textContent = msg;
  };

  const pagePath = window.location.pathname.toLowerCase();
  if (pagePath.includes('quiz')) {
    setBioGuideSpeech('Answer the questions honestly to isolate your unique codon role!');
  } else if (pagePath.includes('crispr')) {
    setBioGuideSpeech('Target sequence A-U-G-A-G-A in order! Watch out for bad cuts!');
  } else {
    setBioGuideSpeech('Welcome! Step 1: Click AMINO ACID QUIZ to climb the ladder.');
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
    }
    return "BEEP BOOP! I am BIO-BOT 9000, your guide. Let's explore biotechnology! Head into the quiz to find your matched field.";
  }

  function sendBioBotMessage() {
    const text = chatInput.value.trim();
    if (!text) return;

    const userDiv = document.createElement('div');
    userDiv.className = 'user-message';
    userDiv.innerText = text;
    chatHistory.appendChild(userDiv);
    chatInput.value = '';
    chatHistory.scrollTop = chatHistory.scrollHeight;

    setTimeout(() => {
      const botDiv = document.createElement('div');
      botDiv.className = 'chat-message bot-message';
      botDiv.innerHTML = `<span class="chat-icon">🤖</span><p class="bot-text"></p>`;
      botDiv.querySelector('.bot-text').innerText = getOfflineBioBotReply(text);
      chatHistory.appendChild(botDiv);
      chatHistory.scrollTop = chatHistory.scrollHeight;
    }, 280);
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