window.addEventListener('DOMContentLoaded', () => {

    if (typeof THREE === 'undefined') {
        console.error('Three.js library is missing!');
        return;
    }

    // ==========================================
    // 1. הגדרת THREE.JS ומצלמה אדפטיבית לנייד
    // ==========================================
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd97706);
    scene.fog = new THREE.FogExp2(0xd97706, 0.015);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    // פונקציה לכיול המצלמה והגבולות לפי גודל המסך
    let screenLimitX = 7.5;
    function updateCameraForDevice() {
        const aspect = window.innerWidth / window.innerHeight;
        camera.aspect = aspect;
        
        if (aspect < 1) { 
            // מסך אנכי (מובייל) - הרחקת המצלמה והגבהתה
            camera.position.set(0, 11, 24);
            camera.lookAt(0, 5, 0);
            screenLimitX = 4.5;
        } else { 
            // מסך רחב (מחשב)
            camera.position.set(0, 7, 16);
            camera.lookAt(0, 6, 0);
            screenLimitX = 7.5;
        }
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    updateCameraForDevice();

    // ==========================================
    // 2. תאורה
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0xffedd5, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 1.2);
    sunLight.position.set(10, 20, 15);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // ==========================================
    // 3. אלמנטים בסצנה
    // ==========================================
    const grassGeo = new THREE.BoxGeometry(30, 1, 10);
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.position.set(0, -0.5, 0);
    grass.receiveShadow = true;
    scene.add(grass);

    function createBackgroundPyramid(x, z, scale) {
        const geo = new THREE.ConeGeometry(8 * scale, 12 * scale, 4);
        const mat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9, flatShading: true });
        const pyr = new THREE.Mesh(geo, mat);
        pyr.position.set(x, 5 * scale, z);
        pyr.rotation.y = Math.PI / 4;
        scene.add(pyr);
    }
    createBackgroundPyramid(-15, -12, 1.5);
    createBackgroundPyramid(15, -14, 1.8);
    createBackgroundPyramid(0, -22, 2.5);

    // --- התותח ---
    const cannonGroup = new THREE.Group();

    const baseGeo = new THREE.BoxGeometry(2.0, 0.6, 1.6);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.3;
    base.castShadow = true;
    cannonGroup.add(base);

    const domeGeo = new THREE.SphereGeometry(0.9, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.2, roughness: 0.1, transparent: true, opacity: 0.85 });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 0.6;
    cannonGroup.add(dome);

    const wheelGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.25, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const wheelPositions = [[-1.0, 0.2, 0.7], [1.0, 0.2, 0.7], [-1.0, 0.2, -0.7], [1.0, 0.2, -0.7]];
    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(...pos);
        wheel.castShadow = true;
        cannonGroup.add(wheel);
    });

    const barrelGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.9, 16);
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 });
    const leftBarrel = new THREE.Mesh(barrelGeo, barrelMat);
    leftBarrel.position.set(-0.35, 1.1, 0);
    const rightBarrel = new THREE.Mesh(barrelGeo, barrelMat);
    rightBarrel.position.set(0.35, 1.1, 0);
    cannonGroup.add(leftBarrel);
    cannonGroup.add(rightBarrel);

    cannonGroup.position.set(0, 0, 0);
    scene.add(cannonGroup);

    // ==========================================
    // 4. משתני משחק
    // ==========================================
    let isGameStarted = false;
    let isPaused = false;
    let isGameOver = false;

    let score = 0;
    let coins = parseInt(localStorage.getItem('bb3d_coins')) || 0;
    let bestScore = parseInt(localStorage.getItem('bb3d_best')) || 0;
    let level = 1;
    let playerHp = 1000;
    let maxHp = 1000;

    let firePowerLvl = parseInt(localStorage.getItem('bb3d_upg_power')) || 1;
    let fireRateLvl = parseInt(localStorage.getItem('bb3d_upg_rate')) || 1;
    let magnetLvl = parseInt(localStorage.getItem('bb3d_upg_magnet')) || 0;

    let firePower = firePowerLvl;
    let fireRate = 1 + (fireRateLvl - 1) * 0.25;

    let bullets = [];
    let rocks = [];
    let droppedCoins = [];

    let lastShotTime = 0;
    let targetX = 0;

    // ==========================================
    // 5. ניהול UI
    // ==========================================
    const splashScreen = document.getElementById('splash-screen');
    const startOverlay = document.getElementById('start-overlay');
    const startBtn = document.getElementById('start-btn');
    const pauseMenu = document.getElementById('pause-menu');
    const pauseBtn = document.getElementById('pause-btn');
    const resumeBtn = document.getElementById('resume-btn');
    const gameOverModal = document.getElementById('game-over-modal');
    const restartBtn = document.getElementById('restart-btn');
    const homeBtn = document.getElementById('home-btn');

    const coinsValEl = document.getElementById('coins-val');
    const scoreValEl = document.getElementById('score-val');
    const hpTextEl = document.getElementById('hp-text');
    const hpBarEl = document.getElementById('hp-bar');
    const levelTextEl = document.getElementById('level-text');
    const startCoinsEl = document.getElementById('start-coins');
    const startBestScoreEl = document.getElementById('start-best-score');

    const buyPowerBtn = document.getElementById('buy-power-btn');
    const buyRateBtn = document.getElementById('buy-rate-btn');
    const buyMagnetBtn = document.getElementById('buy-magnet-btn');

    function updateUI() {
        if (coinsValEl) coinsValEl.innerText = coins;
        if (scoreValEl) scoreValEl.innerText = score;
        if (startCoinsEl) startCoinsEl.innerText = coins;
        if (startBestScoreEl) startBestScoreEl.innerText = bestScore;
        if (hpTextEl) hpTextEl.innerText = `${Math.max(0, playerHp)} / ${maxHp}`;
        if (hpBarEl) hpBarEl.style.width = `${Math.max(0, (playerHp / maxHp) * 100)}%`;
        if (levelTextEl) levelTextEl.innerText = `LEVEL ${level}`;

        const powerCost = firePowerLvl * 50;
        const rateCost = fireRateLvl * 60;
        const magnetCost = (magnetLvl + 1) * 100;

        if (buyPowerBtn) {
            buyPowerBtn.innerText = `${powerCost} C`;
            buyPowerBtn.disabled = coins < powerCost;
            document.getElementById('power-lvl-text').innerText = `Lvl ${firePowerLvl}`;
        }
        if (buyRateBtn) {
            buyRateBtn.innerText = `${rateCost} C`;
            buyRateBtn.disabled = coins < rateCost;
            document.getElementById('rate-lvl-text').innerText = `Lvl ${fireRateLvl}`;
        }
        if (buyMagnetBtn) {
            buyMagnetBtn.innerText = `${magnetCost} C`;
            buyMagnetBtn.disabled = coins < magnetCost;
            document.getElementById('magnet-lvl-text').innerText = `Lvl ${magnetLvl}`;
        }
    }

    if (buyPowerBtn) {
        buyPowerBtn.addEventListener('click', () => {
            const cost = firePowerLvl * 50;
            if (coins >= cost) {
                coins -= cost;
                firePowerLvl++;
                firePower = firePowerLvl;
                localStorage.setItem('bb3d_coins', coins);
                localStorage.setItem('bb3d_upg_power', firePowerLvl);
                updateUI();
            }
        });
    }

    if (buyRateBtn) {
        buyRateBtn.addEventListener('click', () => {
            const cost = fireRateLvl * 60;
            if (coins >= cost) {
                coins -= cost;
                fireRateLvl++;
                fireRate = 1 + (fireRateLvl - 1) * 0.25;
                localStorage.setItem('bb3d_coins', coins);
                localStorage.setItem('bb3d_upg_rate', fireRateLvl);
                updateUI();
            }
        });
    }

    if (buyMagnetBtn) {
        buyMagnetBtn.addEventListener('click', () => {
            const cost = (magnetLvl + 1) * 100;
            if (coins >= cost) {
                coins -= cost;
                magnetLvl++;
                localStorage.setItem('bb3d_coins', coins);
                localStorage.setItem('bb3d_upg_magnet', magnetLvl);
                updateUI();
            }
        });
    }

    updateUI();

    // ==========================================
    // 6. סאונד
    // ==========================================
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playSound(type) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'shoot') {
            osc.frequency.setValueAtTime(350, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
            osc.start(); osc.stop(audioCtx.currentTime + 0.08);
        } else if (type === 'hit') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(100, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.05);
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
            osc.start(); osc.stop(audioCtx.currentTime + 0.05);
        } else if (type === 'coin') {
            osc.frequency.setValueAtTime(800, audioCtx.currentTime);
            osc.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.05);
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
            osc.start(); osc.stop(audioCtx.currentTime + 0.12);
        }
    }

    // ==========================================
    // 7. לוגיקת סלעים, כדורים ומטבעות
    // ==========================================
    function spawnBullet(x, y, z) {
        const geo = new THREE.SphereGeometry(0.18, 12, 12);
        const mat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
        const bullet = new THREE.Mesh(geo, mat);
        bullet.position.set(x, y, z);
        scene.add(bullet);
        bullets.push(bullet);
    }

    function spawnRock(x, y, hp, size) {
        const geo = new THREE.ConeGeometry(size, size * 1.3, 4);
        const mat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8, flatShading: true });
        const rock = new THREE.Mesh(geo, mat);
        rock.castShadow = true;
        rock.position.set(x, y, 0);

        const canvas = document.createElement('canvas');
        canvas.width = 128; canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.font = 'Bold 65px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hp, 64, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: texture });
        const label = new THREE.Sprite(spriteMat);
        label.scale.set(size * 1.1, size * 1.1, 1);
        rock.add(label);

        rock.userData = {
            hp: hp,
            maxHp: hp,
            size: size,
            vx: (Math.random() - 0.5) * 0.06,
            vy: 0,
            ctx: ctx,
            texture: texture
        };

        scene.add(rock);
        rocks.push(rock);
    }

    function updateRockLabel(rock) {
        const ctx = rock.userData.ctx;
        ctx.clearRect(0, 0, 128, 128);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'Bold 65px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(rock.userData.hp, 64, 64);
        rock.userData.texture.needsUpdate = true;
    }

    function removeRock(rock, index) {
        if (rock.userData.texture) rock.userData.texture.dispose();
        scene.remove(rock);
        rocks.splice(index, 1);
    }

    function spawnCoin(x, y) {
        const geo = new THREE.CylinderGeometry(0.3, 0.3, 0.08, 12);
        const mat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9, roughness: 0.2 });
        const coin = new THREE.Mesh(geo, mat);
        coin.rotation.x = Math.PI / 2;
        coin.position.set(x, y, 0);
        coin.userData = { vy: -0.04 };
        scene.add(coin);
        droppedCoins.push(coin);
    }

    function startNextWave() {
        if (rocks.length === 0) {
            level++;
            const count = Math.min(2 + Math.floor(level / 2), 5);
            for (let i = 0; i < count; i++) {
                const size = 0.9 + Math.random() * 0.8;
                const hp = Math.floor((8 + level * 6) * (size / 1.2));
                const spawnX = (Math.random() - 0.5) * (screenLimitX * 1.5);
                spawnRock(spawnX, 12 + i * 3, hp, size);
            }
            updateUI();
        }
    }

    // ==========================================
    // 8. שליטת מגע מותאמת
    // ==========================================
    let isDragging = false;
    function handleMove(clientX) {
        const normalizedX = (clientX / window.innerWidth) * 2 - 1;
        targetX = Math.max(-screenLimitX, Math.min(screenLimitX, normalizedX * (screenLimitX * 1.2)));
    }

    window.addEventListener('pointerdown', (e) => { isDragging = true; handleMove(e.clientX); });
    window.addEventListener('pointermove', (e) => { if (isDragging) handleMove(e.clientX); });
    window.addEventListener('pointerup', () => { isDragging = false; });

    // ==========================================
    // 9. התחלה, השהייה וסיום
    // ==========================================
    function startGame() {
        if (isGameStarted) return;
        isGameStarted = true;
        isGameOver = false;

        if (splashScreen) splashScreen.classList.add('hidden');
        if (startOverlay) startOverlay.classList.add('hidden');

        score = 0;
        playerHp = maxHp;
        updateUI();

        startNextWave();
    }

    if (splashScreen) splashScreen.addEventListener('click', startGame);
    if (startBtn) startBtn.addEventListener('click', startGame);

    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            if (!isGameStarted || isGameOver) return;
            isPaused = true;
            if (pauseMenu) pauseMenu.classList.remove('hidden');
        });
    }

    if (resumeBtn) {
        resumeBtn.addEventListener('click', () => {
            isPaused = false;
            if (pauseMenu) pauseMenu.classList.add('hidden');
        });
    }

    function triggerGameOver() {
        isGameOver = true;
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('bb3d_best', bestScore);
        }
        localStorage.setItem('bb3d_coins', coins);

        const finalScoreEl = document.getElementById('final-score-val');
        const finalCoinsEl = document.getElementById('final-coins-val');
        const bestScoreEl = document.getElementById('best-score-val');

        if (finalScoreEl) finalScoreEl.innerText = score;
        if (finalCoinsEl) finalCoinsEl.innerText = coins;
        if (bestScoreEl) bestScoreEl.innerText = bestScore;

        if (gameOverModal) gameOverModal.classList.remove('hidden');
    }

    if (restartBtn) restartBtn.addEventListener('click', () => location.reload());
    if (homeBtn) homeBtn.addEventListener('click', () => location.reload());

    // ==========================================
    // 10. לולאת המשחק
    // ==========================================
    function animate(time) {
        requestAnimationFrame(animate);

        if (!isGameStarted || isPaused || isGameOver) {
            renderer.render(scene, camera);
            return;
        }

        cannonGroup.position.x += (targetX - cannonGroup.position.x) * 0.2;

        if (time - lastShotTime > 1000 / (fireRate * 4)) {
            spawnBullet(cannonGroup.position.x - 0.35, 1.6, 0);
            spawnBullet(cannonGroup.position.x + 0.35, 1.6, 0);
            playSound('shoot');
            lastShotTime = time;
        }

        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            b.position.y += 0.4;
            if (b.position.y > 18) {
                scene.remove(b);
                bullets.splice(i, 1);
            }
        }

        for (let rIdx = rocks.length - 1; rIdx >= 0; rIdx--) {
            const r = rocks[rIdx];

            r.userData.vy -= 0.0025;
            r.position.x += r.userData.vx;
            r.position.y += r.userData.vy;

            if (r.position.y - r.userData.size < 0.2) {
                r.position.y = 0.2 + r.userData.size;
                r.userData.vy = Math.abs(r.userData.vy) * 0.95;
                if (r.userData.vy < 0.12) r.userData.vy = 0.16;
            }

            if (Math.abs(r.position.x) > screenLimitX) {
                r.userData.vx *= -1;
                r.position.x = Math.sign(r.position.x) * screenLimitX;
            }

            for (let bIdx = bullets.length - 1; bIdx >= 0; bIdx--) {
                const b = bullets[bIdx];
                if (b.position.distanceTo(r.position) < r.userData.size * 0.9) {
                    scene.remove(b);
                    bullets.splice(bIdx, 1);

                    r.userData.hp -= firePower;
                    score += firePower;
                    playSound('hit');

                    if (r.userData.hp <= 0) {
                        if (Math.random() > 0.3) spawnCoin(r.position.x, r.position.y);

                        if (r.userData.size > 0.9) {
                            spawnRock(r.position.x - 0.4, r.position.y, Math.floor(r.userData.maxHp / 2), r.userData.size * 0.7);
                            spawnRock(r.position.x + 0.4, r.position.y, Math.floor(r.userData.maxHp / 2), r.userData.size * 0.7);
                        }

                        removeRock(r, rIdx);
                        updateUI();
                        break;
                    } else {
                        updateRockLabel(r);
                    }
                }
            }

            if (Math.hypot(r.position.x - cannonGroup.position.x, r.position.y - 0.5) < r.userData.size + 0.7) {
                playerHp -= 10;
                updateUI();
                if (playerHp <= 0) {
                    triggerGameOver();
                }
            }
        }

        for (let cIdx = droppedCoins.length - 1; cIdx >= 0; cIdx--) {
            const c = droppedCoins[cIdx];
            
            if (magnetLvl > 0) {
                const distToPlayer = Math.hypot(c.position.x - cannonGroup.position.x, c.position.y - 0.5);
                const magnetRadius = 2 + magnetLvl * 1.5;
                if (distToPlayer < magnetRadius) {
                    c.position.x += (cannonGroup.position.x - c.position.x) * 0.12;
                    c.position.y += (0.5 - c.position.y) * 0.12;
                } else {
                    c.position.y += c.userData.vy;
                }
            } else {
                c.position.y += c.userData.vy;
            }

            c.rotation.z += 0.05;

            if (Math.hypot(c.position.x - cannonGroup.position.x, c.position.y - 0.5) < 1.0) {
                coins += 5;
                playSound('coin');
                scene.remove(c);
                droppedCoins.splice(cIdx, 1);
                updateUI();
            } else if (c.position.y < 0.2) {
                c.userData.vy = 0;
            }
        }

        startNextWave();
        renderer.render(scene, camera);
    }

    window.addEventListener('resize', updateCameraForDevice);

    animate(0);
});