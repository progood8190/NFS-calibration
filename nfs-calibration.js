window.nfsCalibration = {
    running: false,

    move({ moveDir = 0, aimDir = 0, aimDist = 0, shooting = false } = {}) {
        var _ = new DataView(new ArrayBuffer(20));
        _.setUint8(0, 2);
        var c = (shooting ? 1 : 0) + 2;
        _.setUint8(1, c);
        _.setFloat32(2, Math.PI * moveDir);
        _.setFloat32(6, aimDir);
        _.setInt16(10, Math.PI || 0);
        _.setFloat32(12, aimDist);
        window._deflySocket.send(_.buffer);
    },

    shoot() {
        var _ = new DataView(new ArrayBuffer(20));
        _.setUint8(0, 2);
        _.setUint8(1, 1);
        _.setFloat32(2, 3.141592653589793 * 1.5);
        _.setFloat32(6, 0);
        _.setInt16(10, 3.141592653589793 || 0);
        _.setFloat32(12, 5);
        window._deflySocket.send(_.buffer);
    },

    setNFS(min, max = min) {
        document.querySelector('#controls-nfs-min').value = min;
        document.querySelector('#controls-nfs-max').value = max;
        defly.changeControls();
    },

    getPing() {
        const raw = document.querySelector('#fps')?.textContent?.match(/ping: (\d+)/)?.[1];
        return raw ? parseInt(raw) : null;
    },

    runTest(label, onProgress, onComplete) {
        const allPings = [];
        const allJitters = [];
        const allFPS = [];
        const resyncTimestamps = [];
        const resyncesPerScan = [];
        let lastPingValue = null;
        let lastFrameTime = performance.now();
        let frameCount = 0;
        let scanCount = 0;
        let resyncsSinceLastScan = 0;

        const resyncListener = () => {
            resyncTimestamps.push(performance.now());
            resyncsSinceLastScan++;
        };
        window.addEventListener('resync', resyncListener);

        const countFrames = () => { frameCount++; requestAnimationFrame(countFrames); };
        requestAnimationFrame(countFrames);

        const directions = [0, 0.5, 1, 1.5];
        let dirIndex = 0;
        let moveInt = setInterval(() => { this.move({ moveDir: directions[dirIndex++ % 4] }); }, 50);
        let shootInt = setInterval(() => this.shoot(), 2000);
        window._deflySocket.send(new Uint8Array([16]).buffer);

        let scanInt = setInterval(() => {
            const now = performance.now();
            scanCount++;

            // FPS from rAF counter
            const dt = now - lastFrameTime;
            const fps = (frameCount / dt) * 1000;
            frameCount = 0;
            lastFrameTime = now;
            allFPS.push(fps);

            // Ping directly from game's own display
            const ping = this.getPing();
            if (ping !== null) {
                allPings.push(ping);
                if (lastPingValue !== null) {
                    const jitter = Math.abs(ping - lastPingValue);
                    allJitters.push(jitter);
                }
                lastPingValue = ping;
            }

            resyncesPerScan.push(resyncsSinceLastScan);
            resyncsSinceLastScan = 0;

            const avgFPS = allFPS.reduce((a, b) => a + b, 0) / allFPS.length;
            const avgPing = allPings.length > 0 ? allPings.reduce((a, b) => a + b, 0) / allPings.length : 0;
            const avgJitter = allJitters.length > 0 ? allJitters.reduce((a, b) => a + b, 0) / allJitters.length : 0;

            console.log(`[${label}] Scan #${scanCount} | FPS: ${fps} | Avg FPS: ${avgFPS} | Ping: ${ping}ms | Avg Ping: ${avgPing}ms | Avg Jitter: ${avgJitter}ms | Resyncs: ${resyncTimestamps.length}`);

            if (onProgress) onProgress({ scanCount, fps, avgFPS, avgPing, avgJitter, totalResyncs: resyncTimestamps.length });

        }, 125);

        setTimeout(() => {
            clearInterval(scanInt);
            clearInterval(moveInt);
            clearInterval(shootInt);
            window.removeEventListener('resync', resyncListener);

            const avgPing     = allPings.length > 0 ? allPings.reduce((a, b) => a + b, 0) / allPings.length : 0;
            const minPing     = allPings.length > 0 ? Math.min(...allPings) : 0;
            const maxPing     = allPings.length > 0 ? Math.max(...allPings) : 0;
            const avgJitter   = allJitters.length > 0 ? allJitters.reduce((a, b) => a + b, 0) / allJitters.length : 0;
            const maxJitter   = allJitters.length > 0 ? Math.max(...allJitters) : 0;
            const avgFPS      = allFPS.reduce((a, b) => a + b, 0) / allFPS.length;
            const minFPS      = Math.min(...allFPS);
            const msPerFrame  = 1000 / avgFPS;
            const totalResyncs = resyncTimestamps.length;
            const resyncsPerSecond = totalResyncs / 30;
            const maxResyncsInOneScan = Math.max(...resyncesPerScan, 0);
            const scansWithResyncs = resyncesPerScan.filter(r => r > 0).length;

            const pingStdDev = allPings.length > 1
                ? Math.sqrt(allPings.reduce((a, b) => a + Math.pow(b - avgPing, 2), 0) / allPings.length)
                : 0;
            const sortedPings = [...allPings].sort((a, b) => a - b);
            const p95Ping = sortedPings.length > 0 ? sortedPings[Math.floor(sortedPings.length * 0.95)] : 0;
            const sortedJitters = [...allJitters].sort((a, b) => a - b);
            const p95Jitter = sortedJitters.length > 0 ? sortedJitters[Math.floor(sortedJitters.length * 0.95)] : 0;

            const msPerTick = 1000 / 30;
            const pingTicks = p95Ping / msPerTick;
            const jitterTicks = p95Jitter / msPerTick;
            const fpsPenalty = avgFPS < 30 ? 1 : 0;
            const resyncPenalty = Math.min(2, Math.round(resyncsPerSecond * 0.5));

            const rawMin = Math.round((avgPing / msPerTick) + fpsPenalty);
            const rawMax = Math.round(pingTicks + jitterTicks + fpsPenalty + resyncPenalty);
            const clampedMin = Math.max(-10, Math.min(10, rawMin));
            const clampedMax = Math.max(-10, Math.min(10, Math.max(clampedMin, rawMax)));

            const isHealthy = avgJitter < 20 && pingStdDev < 30 && avgFPS >= 30 && totalResyncs === 0;
            const hasSpikes = maxJitter > 100 || (maxPing - minPing) > 150;
            const highResyncs = resyncsPerSecond > 1;
            const lowFPS = avgFPS < 30;

            console.log(`\n=== [${label}] FINAL RESULTS ===`);
            console.log(`Ping: ${avgPing}ms avg | ${minPing}ms min | ${maxPing}ms max | ${p95Ping}ms p95`);
            console.log(`Jitter: ${avgJitter}ms avg | ${maxJitter}ms max | ${p95Jitter}ms p95`);
            console.log(`FPS: ${avgFPS} avg | ${minFPS} min`);
            console.log(`Resyncs: ${totalResyncs} total | ${resyncsPerSecond}/sec`);
            console.log(`Health: ${isHealthy ? 'GOOD' : 'POOR'}`);
            if (hasSpikes) console.log('WARNING: High ping/jitter spikes');
            if (highResyncs) console.log('WARNING: High resync rate');
            if (lowFPS) console.log('WARNING: Low FPS');
            console.log(`Recommended NFS: min ${clampedMin} max ${clampedMax}`);

            onComplete({ clampedMin, clampedMax, avgPing, avgJitter, avgFPS, totalResyncs, resyncsPerSecond, p95Ping, p95Jitter, pingStdDev, minPing, maxPing, maxJitter, minFPS, msPerFrame });

        }, 30000);
    },

    start(onProgress1, onProgress2, onDone) {
        this.running = true;
        this.runTest('TEST 1', onProgress1, (result1) => {
            this.setNFS(result1.clampedMin, result1.clampedMax);
            setTimeout(() => {
                this.runTest('TEST 2', onProgress2, (result2) => {
                    this.setNFS(result2.clampedMin, result2.clampedMax);
                    this.running = false;
                    if (onDone) onDone(result1, result2);
                });
            }, 2000);
        });
    }
};

console.log('NFS calibration engine loaded. Run openNFSUI() to start.');
