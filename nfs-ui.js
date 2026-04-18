window.openNFSUI = function() {

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

        <!-- box1 = biggest = jitter (top when hovered) -->
        <div class="nfs-box nfs-box1">
          <span id="nfs-jitter-val" style="color:#000;">Jitter: —</span>
        </div>

        <!-- box2 = middle = ping -->
        <div class="nfs-box nfs-box2">
          <span id="nfs-ping-val" style="color:#000;">Ping: —</span>
        </div>

        <!-- box3 = smallest = fps (bottom) -->
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

document.getElementById('nfs-close').onclick = () => {
    overlay.remove();
    document.getElementById('nfs-ui-style')?.remove();
};

document.getElementById('nfs-start-btn').onclick = () => {
    const btn = document.getElementById('nfs-start-btn');
    btn.disabled = true;

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
        }
    );
};

};

console.log('NFS UI loaded. Run openNFSUI() to open the calibration panel.');
