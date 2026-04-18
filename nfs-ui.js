window.openNFSUI = function() {

if (document.getElementById('nfs-overlay')) return;

const style = document.createElement('style');
style.id = 'nfs-ui-style';
style.textContent = `
#nfs-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  z-index: 99999; display: flex; align-items: center; justify-content: center;
  backdrop-filter: blur(4px);
}
#nfs-modal {
  position: relative; background: #1a1a2e; border-radius: 20px;
  padding: 30px 30px 24px; width: 360px; max-width: 95vw;
  box-shadow: 0 0 60px rgba(0,0,0,0.6); color: white; font-family: sans-serif;
}
#nfs-close {
  position: absolute; top: 12px; right: 16px; background: none; border: none;
  color: white; font-size: 22px; cursor: pointer; opacity: 0.6; transition: opacity 0.2s;
  line-height: 1;
}
#nfs-close:hover { opacity: 1; }
#nfs-title {
  font-size: 18px; font-weight: bold; margin-bottom: 6px; text-align: center;
  background: linear-gradient(45deg, #0ce39a, #fc0987); -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
#nfs-subtitle {
  font-size: 12px; text-align: center; opacity: 0.5; margin-bottom: 20px;
}
#nfs-btn-wrap { display: flex; justify-content: center; margin-bottom: 20px; }
.nfs-button {
  position: relative; text-decoration: none; color: #fff;
  background: linear-gradient(45deg, #0ce39a, #69007f, #fc0987);
  padding: 10px 22px; border-radius: 10px; font-size: 1em;
  cursor: pointer; border: none;
}
.nfs-button span { position: relative; z-index: 1; }
.nfs-button::before {
  content: ""; position: absolute; inset: 1px; background: #272727;
  border-radius: 9px; transition: 0.5s;
}
.nfs-button:hover::before { opacity: 0.7; }
.nfs-button::after {
  content: ""; position: absolute; inset: 0px;
  background: linear-gradient(45deg, #0ce39a, #69007f, #fc0987);
  border-radius: 9px; transition: 0.5s; opacity: 0; filter: blur(20px);
}
.nfs-button:hover::after { opacity: 1; }
.nfs-button:disabled { cursor: not-allowed; opacity: 0.5; }
.nfs-button:disabled::before { opacity: 1; }
#nfs-progress {
  font-size: 11px; opacity: 0.6; text-align: center; margin-bottom: 16px;
  min-height: 16px;
}
#nfs-result-wrap { display: flex; justify-content: center; }
.nfs-card {
  position: relative; width: 200px; height: 200px; background: lightgrey;
  border-radius: 30px; overflow: hidden;
  box-shadow: rgba(100,100,111,0.2) 0px 7px 29px 0px; transition: all 1s ease-in-out;
}
.nfs-card .background {
  position: absolute; inset: 0;
  background: radial-gradient(circle at 100% 107%, #ff89cc 0%, #9cb8ec 30%, #00ffee 60%, #62c2fe 100%);
}
.nfs-card .logo {
  position: absolute; right: 50%; bottom: 50%;
  transform: translate(50%,50%); transition: all 0.6s ease-in-out;
  font-size: 22px; font-weight: bold; color: white; text-align: center;
  white-space: nowrap; text-shadow: 0 2px 8px rgba(0,0,0,0.4);
  z-index: 10;
}
.nfs-box {
  position: absolute; padding: 10px; text-align: right;
  border-top: 2px solid rgb(255,255,255);
  border-right: 1px solid white; border-radius: 10% 13% 42% 0%/10% 12% 75% 0%;
  box-shadow: rgba(100,100,111,0.364) -7px 7px 29px 0px;
  transform-origin: bottom left; transition: all 1s ease-in-out;
  font-size: 12px; font-weight: bold; color: #000;
  background: rgba(255,255,255,0.389);
}
.nfs-box::before {
  content: ""; position: absolute; inset: 0; border-radius: inherit;
  opacity: 0; transition: all 0.5s ease-in-out;
}
.nfs-box:hover::before { opacity: 1; }
.nfs-box:hover span { color: white !important; position: relative; z-index: 1; }
.nfs-box1 { width: 70%; height: 70%; bottom: -70%; left: -70%; }
.nfs-box1::before { background: radial-gradient(circle at 30% 107%, #1a1a2e 0%, #2d0a3e 60%, #0a1628 100%); }
.nfs-box2 { width: 50%; height: 50%; bottom: -50%; left: -50%; transition-delay: 0.2s; }
.nfs-box2::before { background: radial-gradient(circle at 30% 107%, #0a1628 0%, #1a2a1a 90%); }
.nfs-box3 { width: 30%; height: 30%; bottom: -30%; left: -30%; transition-delay: 0.4s; }
.nfs-box3::before { background: radial-gradient(circle at 30% 107%, #1a0a2e 0%, #0a1a2e 90%); }
.nfs-box4 { width: 10%; height: 10%; bottom: -10%; left: -10%; transition-delay: 0.6s; }
.nfs-card:hover { transform: scale(0.95); }
.nfs-card:hover .nfs-box { bottom: -1px; left: -1px; }
.nfs-card:hover .logo { transform: translate(0,0) scale(0.75); bottom: 14px; right: 14px; }
#nfs-phase { font-size: 11px; text-align: center; margin-top: 14px; opacity: 0.5; min-height: 14px; }
`;
document.head.appendChild(style);

const overlay = document.createElement('div');
overlay.id = 'nfs-overlay';
overlay.innerHTML = `
  <div id="nfs-modal">
    <button id="nfs-close">✕</button>
    <div id="nfs-title">NFS Calibration</div>
    <div id="nfs-subtitle">Auto-tunes Network Frame Shift for your connection</div>
    <div id="nfs-btn-wrap">
      <button class="nfs-button" id="nfs-start-btn"><span>Start Calibration</span></button>
    </div>
    <div id="nfs-progress"></div>
    <div id="nfs-result-wrap">
      <div class="nfs-card" id="nfs-card" style="display:none;">
        <div class="background"></div>
        <div class="logo" id="nfs-card-logo">? | ?</div>
        <div class="nfs-box nfs-box1">
          <span id="nfs-jitter-val" style="color:#000;">Jitter: —</span>
        </div>
        <div class="nfs-box nfs-box2">
          <span id="nfs-ping-val" style="color:#000;">Ping: —</span>
        </div>
        <div class="nfs-box nfs-box3">
          <span id="nfs-fps-val" style="color:#000;">FPS: —</span>
        </div>
        <div class="nfs-box nfs-box4"></div>
      </div>
    </div>
    <div id="nfs-phase"></div>
  </div>
`;
document.body.appendChild(overlay);

const closeBtn = document.getElementById('nfs-close');
closeBtn.onclick = () => {
    overlay.remove();
    document.getElementById('nfs-ui-style')?.remove();
};

document.getElementById('nfs-start-btn').onclick = () => {
    const btn = document.getElementById('nfs-start-btn');
    btn.style.display = 'none';
    closeBtn.style.display = 'none';

    function onProgress(phase, data) {
        const p = document.getElementById('nfs-progress');
        const ph = document.getElementById('nfs-phase');
        if (p) p.textContent = `Scan #${data.scanCount} | FPS: ${data.avgFPS.toFixed(1)} | Ping: ${data.avgPing.toFixed(1)}ms | Jitter: ${data.avgJitter.toFixed(1)}ms | Resyncs: ${data.totalResyncs}`;
        if (ph) ph.textContent = phase === 1 ? '⏳ Test 1 of 2 — baseline measurement...' : '⏳ Test 2 of 2 — verifying with recommended NFS...';
    }

    window.nfsCalibration.start(
        (data) => onProgress(1, data),
        (data) => onProgress(2, data),
        (result1, result2) => {
            const card = document.getElementById('nfs-card');
            card.style.display = 'block';
            document.getElementById('nfs-card-logo').textContent = `${result2.clampedMin} | ${result2.clampedMax}`;
            document.getElementById('nfs-fps-val').textContent = `FPS: ${result2.avgFPS.toFixed(1)}`;
            document.getElementById('nfs-ping-val').textContent = `Ping: ${result2.avgPing.toFixed(1)}ms`;
            document.getElementById('nfs-jitter-val').textContent = `Jitter: ${result2.avgJitter.toFixed(1)}ms`;
            document.getElementById('nfs-progress').textContent = `✅ Done! NFS set to min: ${result2.clampedMin} max: ${result2.clampedMax}`;
            document.getElementById('nfs-phase').textContent = `Test 1: ${result1.clampedMin}|${result1.clampedMax} → Final: ${result2.clampedMin}|${result2.clampedMax}`;

            const btnWrap = document.getElementById('nfs-btn-wrap');
            btnWrap.innerHTML = `<button class="nfs-button" id="nfs-refresh-btn"><span>🔄 Refresh Tab</span></button>`;
            document.getElementById('nfs-refresh-btn').onclick = () => location.reload();

            closeBtn.style.display = 'block';
        }
    );
};

};

// ── Inject calibrate button into controls div ────────────────────────────────
(function injectControlsUI() {
    const controlsDiv = document.querySelector('.controls');
    if (!controlsDiv) { console.warn('Controls div not found'); return; }

    if (!document.getElementById('nfs-controls-style')) {
        const s = document.createElement('style');
        s.id = 'nfs-controls-style';
        s.textContent = `
        .cssbuttons-io-button {
          background: #a370f0; color: white; font-family: inherit;
          padding: 0.2em; padding-left: 1em; font-size: 13px; font-weight: 500;
          border-radius: 0.7em; border: none; letter-spacing: 0.05em;
          display: inline-flex; align-items: center;
          box-shadow: inset 0 0 1.2em -0.6em #714da6;
          overflow: hidden; position: relative; height: 2em;
          padding-right: 2.6em; cursor: pointer; margin-top: 6px;
        }
        .cssbuttons-io-button .icon {
          background: white; margin-left: 0.8em; position: absolute;
          display: flex; align-items: center; justify-content: center;
          height: 1.6em; width: 1.6em; border-radius: 0.5em;
          box-shadow: 0.1em 0.1em 0.6em 0.2em #7b52b9;
          right: 0.2em; transition: all 0.3s;
        }
        .cssbuttons-io-button:hover .icon { width: calc(100% - 0.4em); }
        .cssbuttons-io-button .icon svg { width: 0.9em; transition: transform 0.3s; color: #7b52b9; }
        .cssbuttons-io-button:hover .icon svg { transform: translateX(0.1em); }
        .cssbuttons-io-button:active .icon { transform: scale(0.95); }
        `;
        document.head.appendChild(s);
    }

    const btnContainer = document.createElement('div');
    btnContainer.innerHTML = `
        <button class="cssbuttons-io-button" id="nfs-open-ui-btn">
          Calibrate
          <div class="icon">
            <svg height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0h24v24H0z" fill="none"></path>
              <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" fill="currentColor"></path>
            </svg>
          </div>
        </button>
    `;

    // Insert as first child of controls div
    controlsDiv.insertBefore(btnContainer, controlsDiv.firstChild);
    document.getElementById('nfs-open-ui-btn').onclick = () => openNFSUI();
})();

console.log('NFS UI loaded. Run openNFSUI() to open the calibration panel.');
