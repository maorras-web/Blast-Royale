window.addEventListener('DOMContentLoaded', () => {

    if (typeof THREE === 'undefined') {
        console.error('Three.js library is missing!');
        return;
    }

    // ==========================================
    // 1. הגדרת סצנה וגרפיקה נקייה
    // ==========================================
    const scene = new THREE.Scene();
    
    // סביבה צבעונית רכה ושקיעה פסטלית
    scene.background = new THREE.Color(0xdd8c55);
    scene.fog = new THREE.FogExp2(0xdd8c55, 0.012);

    const camera = new THREE.PerspectiveCamera(
        55,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    
    let screenLimitX = 7.5;

    function updateCameraForDevice() {
        const aspect = window.innerWidth / window.innerHeight;
        camera.aspect = aspect;
        
        if (aspect < 1) {
            // מובייל - קומפוזיציה אנכית
            camera.position.set(0, 12, 25);
            camera.lookAt(0, 5, 0);
            screenLimitX = 4.8;
        } else {
            // דפדפן שולחני
            camera.position.set(0, 9.5, 20);
            camera.lookAt(0, 4.6, 0);
            screenLimitX = 5.8;
        }

        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance"
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    document.body.appendChild(renderer.domElement);
    updateCameraForDevice();

    // ==========================================
    // 2. תאורה מתקדמת
    // ==========================================
    const hemiLight = new THREE.HemisphereLight(0xffedd5, 0x7c2d12, 0.75);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.3);
    sunLight.position.set(12, 22, 16);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 50;
    sunLight.shadow.bias = -0.0005;
    scene.add(sunLight);

    // ==========================================
    // 3. מערכת מפות (סעיף 3 - ניקוי נכסים בזמן אמת והחלפה עמידה)
    // ==========================================
    const mapGroup = new THREE.Group();
    scene.add(mapGroup);

    const MAPS = {
        desert: { name: 'DESERT', label: 'מדבר', price: 0 },
        forest: { name: 'FOREST', label: 'יער', price: 500 },
        ice: { name: 'ICE', label: 'קרח', price: 1500 },
        volcano: { name: 'VOLCANO', label: 'הר געש', price: 3000 }
    };

    const savedMap = localStorage.getItem('bb3d_map');
    let selectedMap = MAPS[savedMap] ? savedMap : 'desert';
    let purchasedMaps = ['desert'];

    try {
        const savedPurchased = JSON.parse(localStorage.getItem('bb3d_purchased_maps') || '["desert"]');
        if (Array.isArray(savedPurchased)) {
            purchasedMaps = Array.from(new Set(['desert', ...savedPurchased])).filter(id => MAPS[id]);
        }
    } catch (e) {
        purchasedMaps = ['desert'];
    }

    if (!purchasedMaps.includes(selectedMap)) {
        selectedMap = 'desert';
    }

    function clearMapGroup() {
        while (mapGroup.children.length > 0) {
            const obj = mapGroup.children.pop();
            obj.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(mat => mat.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            });
            scene.remove(obj);
        }
    }

    function addMesh(geo, mat, x = 0, y = 0, z = 0, cast = true, receive = true) {
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        mesh.castShadow = cast;
        mesh.receiveShadow = receive;
        mapGroup.add(mesh);
        return mesh;
    }

    function addLowPolyTree(x, z, scale = 1) {
        const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5b3a29, roughness: 1 });
        const leafMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.9, flatShading: true });

        addMesh(new THREE.CylinderGeometry(0.18 * scale, 0.24 * scale, 1.5 * scale, 6), trunkMat, x, 0.75 * scale, z);
        addMesh(new THREE.ConeGeometry(0.95 * scale, 1.8 * scale, 7), leafMat, x, 2.0 * scale, z);
        addMesh(new THREE.ConeGeometry(0.7 * scale, 1.5 * scale, 7), leafMat, x, 2.9 * scale, z);
    }

    function addRockDecoration(x, z, scale = 1, color = 0x64748b) {
        const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.9, flatShading: true });
        addMesh(new THREE.DodecahedronGeometry(0.65 * scale, 0), mat, x, 0.5 * scale, z, true, true);
    }

    function addCrystal(x, z, scale = 1) {
        const mat = new THREE.MeshStandardMaterial({ color: 0x67e8f9, roughness: 0.28, metalness: 0.15, flatShading: true });
        const crystal = addMesh(new THREE.ConeGeometry(0.45 * scale, 1.8 * scale, 6), mat, x, 0.9 * scale, z);
        crystal.rotation.z = (Math.random() - 0.5) * 0.22;
    }

    function addLavaRock(x, z, scale = 1) {
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.95, flatShading: true });
        addMesh(new THREE.DodecahedronGeometry(0.75 * scale, 0), darkMat, x, 0.55 * scale, z);
    }

    function addCactus(x, z, scale = 1) {
        const cactusMat = new THREE.MeshStandardMaterial({ color: 0x3f6212, roughness: 0.95, flatShading: true });
        const trunk = addMesh(new THREE.CylinderGeometry(0.14 * scale, 0.18 * scale, 1.45 * scale, 7), cactusMat, x, 0.72 * scale, z, true, true);
        trunk.rotation.z = (Math.random() - 0.5) * 0.06;

        const arm = addMesh(new THREE.CylinderGeometry(0.09 * scale, 0.12 * scale, 0.7 * scale, 7), cactusMat, x + 0.24 * scale, 0.75 * scale, z, true, true);
        arm.rotation.z = -0.9;

        addMesh(new THREE.SphereGeometry(0.13 * scale, 8, 6), cactusMat, x + 0.51 * scale, 0.97 * scale, z, true, true);
    }

    function buildMap(mapId) {
        clearMapGroup();

        const grassGeo = new THREE.BoxGeometry(40, 1, 30);
        let groundColor = 0x3f6212;
        let groundRoughness = 0.85;

        if (mapId === 'forest') groundColor = 0x365314;
        if (mapId === 'ice') { groundColor = 0xbfe7f5; groundRoughness = 0.55; }
        if (mapId === 'volcano') { groundColor = 0x292524; groundRoughness = 0.95; }

        const grassMat = new THREE.MeshStandardMaterial({ color: groundColor, roughness: groundRoughness, metalness: 0.03 });
        addMesh(grassGeo, grassMat, 0, -0.5, 0, false, true);

        if (mapId === 'desert') {
            scene.background.set(0xdd8c55);
            scene.fog.color.set(0xdd8c55);
            scene.fog.density = 0.012;

            const pyramidMatA = new THREE.MeshStandardMaterial({ color: 0x9a3412, roughness: 0.8, flatShading: true });
            const pyramidMatB = new THREE.MeshStandardMaterial({ color: 0x7c2d12, roughness: 0.82, flatShading: true });

            const p1 = addMesh(new THREE.ConeGeometry(11, 18, 4), pyramidMatA, -15, 7, -12);
            p1.rotation.y = Math.PI / 4;
            const p2 = addMesh(new THREE.ConeGeometry(13, 22, 4), pyramidMatA, 15, 9, -14);
            p2.rotation.y = Math.PI / 4;
            const p3 = addMesh(new THREE.ConeGeometry(18, 31, 4), pyramidMatB, 0, 15, -24);
            p3.rotation.y = Math.PI / 4;

            addRockDecoration(-6, -5, 1.2, 0x7c4a28);
            addRockDecoration(7, -7, 0.85, 0x8b5a32);
            addCactus(-9.0, -5.0, 0.9);
            addCactus(9.2, -6.5, 0.75);
            addCactus(-10.5, -11.0, 1.1);
            addCactus(11.0, -12.0, 1.0);

        } else if (mapId === 'forest') {
            scene.background.set(0x21452a);
            scene.fog.color.set(0x21452a);
            scene.fog.density = 0.018;

            [-9, -5, 5, 9].forEach((x, i) => addLowPolyTree(x, -7 - (i % 2) * 2, 1.15 + (i % 3) * 0.15));
            [-12, 12].forEach(x => addLowPolyTree(x, -15, 1.7));
            addRockDecoration(-7, -10, 0.9, 0x475569);
            addRockDecoration(7, -12, 1.0, 0x475569);

        } else if (mapId === 'ice') {
            scene.background.set(0x79b8d1);
            scene.fog.color.set(0x79b8d1);
            scene.fog.density = 0.015;

            const mountainMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.6, flatShading: true });
            [-15, 15].forEach((x, i) => {
                const m = addMesh(new THREE.ConeGeometry(7 + i * 2, 13 + i * 4, 5), mountainMat, x, 6.5 + i * 2, -15);
                m.rotation.y = 0.35;
            });

            for (let i = 0; i < 8; i++) {
                addCrystal((Math.random() - 0.5) * 24, -5 - Math.random() * 13, 0.7 + Math.random() * 0.8);
            }

        } else if (mapId === 'volcano') {
            scene.background.set(0x241114);
            scene.fog.color.set(0x241114);
            scene.fog.density = 0.02;

            const mountainMat = new THREE.MeshStandardMaterial({ color: 0x44403c, roughness: 1, flatShading: true });
            const volcano = addMesh(new THREE.ConeGeometry(11, 19, 7), mountainMat, 0, 7.5, -18);
            volcano.rotation.y = 0.2;

            const lavaMat = new THREE.MeshBasicMaterial({ color: 0xff6b35 });
            addMesh(new THREE.CylinderGeometry(1.9, 2.6, 0.15, 16), lavaMat, 0, 0.12, -18, false, false);
            [-10, -5, 5, 10].forEach((x, i) => addLavaRock(x, -7 - (i % 2) * 3, 0.9 + (i % 2) * 0.25));
        }
    }

    buildMap(selectedMap);

    // ==========================================
    // 4. עיצוב התותח
    // ==========================================
    const cannonGroup = new THREE.Group();
    const CANNON_SCALE = 1.14;

    const baseGeo = new THREE.BoxGeometry(2.25, 0.58, 1.7);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.38, metalness: 0.35 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.3;
    base.castShadow = true;
    base.receiveShadow = true;
    cannonGroup.add(base);

    const frontRing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.78, 0.78, 0.22, 24),
        new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.35, metalness: 0.45 })
    );
    frontRing.rotation.x = Math.PI / 2;
    frontRing.position.set(0, 0.63, -0.18);
    frontRing.castShadow = true;
    cannonGroup.add(frontRing);

    const domeGeo = new THREE.SphereGeometry(0.9, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.92 });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 0.57;
    dome.castShadow = true;
    cannonGroup.add(dome);

    const wheelGeo = new THREE.CylinderGeometry(0.39, 0.39, 0.24, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.72, metalness: 0.05 });
    const cannonWheels = [];
    const wheelPositions = [
        [-1.12, 0.2, 0.68],
        [ 1.12, 0.2, 0.68],
        [-1.12, 0.2, -0.68],
        [ 1.12, 0.2, -0.68]
    ];

    wheelPositions.forEach((pos) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(...pos);
        wheel.castShadow = true;
        wheel.userData.steerable = pos[2] > 0;
        cannonGroup.add(wheel);
        cannonWheels.push(wheel);
    });

    const barrelGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.95, 16);
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.72, roughness: 0.28 });
    const leftBarrel = new THREE.Mesh(barrelGeo, barrelMat);
    leftBarrel.position.set(-0.38, 1.02, 0);
    const rightBarrel = new THREE.Mesh(barrelGeo, barrelMat);
    rightBarrel.position.set(0.38, 1.02, 0);

    leftBarrel.castShadow = true;
    rightBarrel.castShadow = true;
    cannonGroup.add(leftBarrel, rightBarrel);

    cannonGroup.scale.setScalar(CANNON_SCALE);
    scene.add(cannonGroup);

    const cannonShadow = new THREE.Mesh(
        new THREE.CircleGeometry(1.35, 28),
        new THREE.MeshBasicMaterial({ color: 0x1f2937, transparent: true, opacity: 0.16, depthWrite: false })
    );
    cannonShadow.rotation.x = -Math.PI / 2;
    cannonShadow.position.y = 0.015;
    cannonShadow.scale.set(1.15, 0.72, 1);
    scene.add(cannonShadow);

    // ==========================================
    // 5. משתני משחק
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
    const effects = [];

    let lastShotTime = 0;
    let targetX = 0;
    let cannonRecoil = 0;
    const cannonBaseY = 0;

    // ==========================================
    // 6. UI & Update (סעיף 3 - סנכרון חנות עמיד)
    // ==========================================
    const coinsValEl = document.getElementById('coins-val');
    const scoreValEl = document.getElementById('score-val');
    const hpTextEl = document.getElementById('hp-text');
    const hpBarEl = document.getElementById('hp-bar');
    const levelTextEl = document.getElementById('level-text');
    const splashScreen = document.getElementById('splash-screen');
    const startBtn = document.getElementById('start-btn');
    const startCoinsEl = document.getElementById('start-coins');
    const startBestScoreEl = document.getElementById('start-best-score');

    const buyPowerBtn = document.getElementById('buy-power-btn');
    const buyRateBtn = document.getElementById('buy-rate-btn');
    const buyMagnetBtn = document.getElementById('buy-magnet-btn');
    const mapButtons = Array.from(document.querySelectorAll('[data-map-id]'));

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
            const el = document.getElementById('power-lvl-text');
            if (el) el.innerText = `Lvl ${firePowerLvl}`;
        }

        if (buyRateBtn) {
            buyRateBtn.innerText = `${rateCost} C`;
            buyRateBtn.disabled = coins < rateCost;
            const el = document.getElementById('rate-lvl-text');
            if (el) el.innerText = `Lvl ${fireRateLvl}`;
        }

        if (buyMagnetBtn) {
            buyMagnetBtn.innerText = `${magnetCost} C`;
            buyMagnetBtn.disabled = coins < magnetCost;
            const el = document.getElementById('magnet-lvl-text');
            if (el) el.innerText = `Lvl ${magnetLvl}`;
        }

        mapButtons.forEach(btn => {
            const mapId = btn.getAttribute('data-map-id');
            const map = MAPS[mapId];
            if (!map) return;

            const owned = purchasedMaps.includes(mapId);
            const selected = selectedMap === mapId;

            const action = btn.querySelector('.map-action');
            const state = btn.querySelector('.map-state');

            if (action) action.innerText = selected ? 'נבחרה' : owned ? 'בחר' : `${map.price} C`;
            if (state) state.innerText = selected ? 'ACTIVE' : owned ? 'OWNED' : 'LOCKED';

            btn.classList.toggle('selected', selected);
            btn.classList.toggle('owned', owned);
            btn.disabled = !owned && coins < map.price;
        });
    }

    // ==========================================
    // 7. חנות מפות ושדרוגים (סעיף 3)
    // ==========================================
    mapButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const mapId = btn.getAttribute('data-map-id');
            const map = MAPS[mapId];
            if (!map) return;

            const owned = purchasedMaps.includes(mapId);

            if (!owned) {
                if (coins < map.price) return;
                coins -= map.price;
                purchasedMaps.push(mapId);
                localStorage.setItem('bb3d_coins', coins);
                localStorage.setItem('bb3d_purchased_maps', JSON.stringify(purchasedMaps));
            }

            selectedMap = mapId;
            localStorage.setItem('bb3d_map', selectedMap);
            buildMap(selectedMap);
            updateUI();
        });
    });

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
    // 8. סאונד
    // ==========================================
    let audioCtx = null;

    function getAudioCtx() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) audioCtx = new AudioContextClass();
        }
        return audioCtx;
    }

    function playSound(type) {
        const ctx = getAudioCtx();
        if (!ctx) return;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'shoot') {
            osc.frequency.setValueAtTime(320, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(90, ctx.currentTime + 0.07);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.07);
            osc.start();
            osc.stop(ctx.currentTime + 0.07);
        } else if (type === 'hit') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(120, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.06);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.06);
            osc.start();
            osc.stop(ctx.currentTime + 0.06);
        } else if (type === 'coin') {
            osc.frequency.setValueAtTime(850, ctx.currentTime);
            osc.frequency.setValueAtTime(1250, ctx.currentTime + 0.05);
            gain.gain.setValueAtTime(0.07, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.12);
            osc.start();
            osc.stop(ctx.currentTime + 0.12);
        }
    }

    // ==========================================
    // 9. יצירת אלמנטים ואפקטים (סעיף 2)
    // ==========================================
    function spawnBullet(x, y, z) {
        const bullet = new THREE.Group();
        const core = new THREE.Mesh(
            new THREE.SphereGeometry(0.19, 10, 10),
            new THREE.MeshBasicMaterial({ color: 0xfff59d })
        );
        const trail = new THREE.Mesh(
            new THREE.SphereGeometry(0.10, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xfacc15, transparent: true, opacity: 0.55 })
        );
        trail.scale.set(0.75, 2.8, 0.75);
        trail.position.y = -0.2;

        bullet.add(core, trail);
        bullet.position.set(x, y, z);
        scene.add(bullet);
        bullets.push(bullet);
    }

    function createIrregularRockGeometry(size) {
        const geo = new THREE.DodecahedronGeometry(size, 0);
        const position = geo.attributes.position;
        for (let i = 0; i < position.count; i++) {
            const ox = position.getX(i);
            const oy = position.getY(i);
            const oz = position.getZ(i);
            position.setXYZ(
                i,
                ox * (0.82 + Math.random() * 0.30),
                oy * (0.78 + Math.random() * 0.36),
                oz * (0.84 + Math.random() * 0.28)
            );
        }
        geo.computeVertexNormals();
        return geo;
    }

    function getRockColor() {
        if (selectedMap === 'forest') return 0x58656b;
        if (selectedMap === 'ice') return 0x6f8792;
        if (selectedMap === 'volcano') return 0x46413e;
        return 0x756a5e;
    }

    function spawnRock(x, y, hp, size, launchVx = null, launchVy = null) {
        const geo = createIrregularRockGeometry(size);
        const mat = new THREE.MeshStandardMaterial({
            color: getRockColor(),
            roughness: 0.82,
            metalness: 0.02,
            flatShading: true
        });

        const rock = new THREE.Mesh(geo, mat);
        rock.castShadow = true;
        rock.receiveShadow = true;
        rock.position.set(x, y, 0);
        rock.rotation.set(Math.random() * 0.6, Math.random() * 0.8, Math.random() * 0.6);

        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.font = 'Bold 60px Rubik, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 5;
        ctx.fillText(hp, 64, 64);

        const texture = new THREE.CanvasTexture(canvas);
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;

        const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: true });
        const label = new THREE.Sprite(spriteMat);
        label.scale.set(size, size, 1);
        label.position.y = 0.08;
        rock.add(label);

        rock.userData = {
            hp,
            maxHp: hp,
            size,
            vx: launchVx !== null ? launchVx : (Math.random() - 0.5) * 0.055,
            vy: launchVy !== null ? launchVy : 0,
            rotX: (Math.random() - 0.5) * 0.045,
            rotY: (Math.random() - 0.5) * 0.055,
            rotZ: (Math.random() - 0.5) * 0.04,
            ctx,
            texture,
            hitCooldown: 0,
            baseScale: size,
            hitScaleTimer: 0 // שומר על אנימציית הפגיעה בסלע (סעיף 2)
        };

        scene.add(rock);
        rocks.push(rock);
    }

    function spawnMuzzleFlash(x, y, z) {
        const flash = new THREE.Mesh(
            new THREE.SphereGeometry(0.24, 8, 8),
            new THREE.MeshBasicMaterial({ color: 0xfff1a8, transparent: true, opacity: 0.95 })
        );
        flash.position.set(x, y, z);
        flash.scale.set(0.75, 1.8, 0.75);
        flash.userData = { type: 'flash', life: 5, maxLife: 5 };
        scene.add(flash);
        effects.push(flash);
    }

    function spawnImpactBurst(x, y, z, color = 0xfde68a) {
        const count = 6;
        for (let i = 0; i < count; i++) {
            const particle = new THREE.Mesh(
                new THREE.TetrahedronGeometry(0.08 + Math.random() * 0.06, 0),
                new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1 })
            );
            particle.position.set(
                x + (Math.random() - 0.5) * 0.16,
                y + (Math.random() - 0.5) * 0.16,
                z + (Math.random() - 0.5) * 0.12
            );
            particle.userData = {
                type: 'particle',
                life: 14 + Math.random() * 7,
                vx: (Math.random() - 0.5) * 0.16,
                vy: 0.04 + Math.random() * 0.12,
                vz: (Math.random() - 0.5) * 0.08,
                spin: (Math.random() - 0.5) * 0.2
            };
            scene.add(particle);
            effects.push(particle);
        }
    }

    function spawnDustBurst(x, y, z) {
        const count = 5;
        for (let i = 0; i < count; i++) {
            const dust = new THREE.Mesh(
                new THREE.SphereGeometry(0.10 + Math.random() * 0.08, 7, 7),
                new THREE.MeshBasicMaterial({ color: 0xd6b58a, transparent: true, opacity: 0.55 })
            );
            dust.position.set(
                x + (Math.random() - 0.5) * 0.5,
                Math.max(0.3, y - 0.2 + Math.random() * 0.25),
                z + (Math.random() - 0.5) * 0.22
            );
            dust.userData = {
                type: 'dust',
                life: 16 + Math.random() * 10,
                vx: (Math.random() - 0.5) * 0.06,
                vy: 0.015 + Math.random() * 0.035,
                vz: (Math.random() - 0.5) * 0.035
            };
            scene.add(dust);
            effects.push(dust);
        }
    }

    function updateEffects() {
        for (let i = effects.length - 1; i >= 0; i--) {
            const fx = effects[i];
            const data = fx.userData;
            data.life -= 1;

            if (data.type === 'flash') {
                const progress = 1 - data.life / data.maxLife;
                const scale = 1 + progress * 1.4;
                fx.scale.set(0.75 * scale, 1.8 * scale, 0.75 * scale);
                fx.material.opacity = Math.max(0, data.life / data.maxLife);
            } else {
                fx.position.x += data.vx;
                fx.position.y += data.vy;
                fx.position.z += data.vz;
                data.vy -= 0.0025;
                if (data.spin) {
                    fx.rotation.x += data.spin;
                    fx.rotation.y += data.spin * 0.7;
                }
                fx.material.opacity = Math.max(0, data.life / 24);
                if (data.type === 'dust') fx.scale.multiplyScalar(1.015);
            }

            if (data.life <= 0) {
                scene.remove(fx);
                if (fx.geometry) fx.geometry.dispose();
                if (fx.material) fx.material.dispose();
                effects.splice(i, 1);
            }
        }

        if (effects.length > 32) {
            const overflow = effects.length - 32;
            for (let i = 0; i < overflow; i++) {
                const fx = effects.shift();
                scene.remove(fx);
                if (fx.geometry) fx.geometry.dispose();
                if (fx.material) fx.material.dispose();
            }
        }
    }

    function updateRockLabel(rock) {
        const ctx = rock.userData.ctx;
        ctx.clearRect(0, 0, 128, 128);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'Bold 60px Rubik, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(rock.userData.hp, 64, 64);
        rock.userData.texture.needsUpdate = true;
    }

    function removeRock(rock, index) {
        spawnImpactBurst(rock.position.x, rock.position.y, rock.position.z);
        if (rock.position.y < 2.2) spawnDustBurst(rock.position.x, rock.position.y, rock.position.z);

        if (rock.userData.texture) rock.userData.texture.dispose();
        if (rock.geometry) rock.geometry.dispose();
        if (rock.material) rock.material.dispose();

        scene.remove(rock);
        rocks.splice(index, 1);
    }

    function spawnCoin(x, y) {
        const geo = new THREE.CylinderGeometry(0.28, 0.28, 0.08, 14);
        const mat = new THREE.MeshStandardMaterial({ color: 0xfacc15, metalness: 0.8, roughness: 0.2 });
        const coin = new THREE.Mesh(geo, mat);
        coin.rotation.x = Math.PI / 2;
        coin.position.set(x, y, 0);
        coin.castShadow = true;
        coin.userData = { vy: -0.04 };

        scene.add(coin);
        droppedCoins.push(coin);
    }

    // ==========================================
    // 10. גלים / LEVEL
    // ==========================================
    let hasStartedFirstWave = false;

    function startNextWave() {
        if (rocks.length === 0) {
            if (hasStartedFirstWave) level++;
            hasStartedFirstWave = true;

            const count = Math.min(2 + Math.floor(level / 2), 5);
            for (let i = 0; i < count; i++) {
                const size = 0.95 + Math.random() * 0.8;
                const hp = Math.floor((8 + level * 6) * (size / 1.2));
                const spawnX = (Math.random() - 0.5) * (screenLimitX * 1.4);
                spawnRock(spawnX, 12 + i * 3, hp, size);
            }
            updateUI();
        }
    }

    // ==========================================
    // 11. שליטה במגע (Pointer Events)
    // ==========================================
    let isDragging = false;
    let dragPointerId = null;
    let dragStartX = 0;
    let dragStartTargetX = 0;
    let lastPointerX = 0;

    const TOUCH_DEADZONE = 2.5;
    const TOUCH_SENSITIVITY = 0.016;
    const DESKTOP_SENSITIVITY = 0.020;

    function getPointerSensitivity() {
        return window.innerWidth <= 768 ? TOUCH_SENSITIVITY : DESKTOP_SENSITIVITY;
    }

    function moveCannonByPointer(clientX) {
        const deltaX = clientX - dragStartX;
        if (Math.abs(deltaX) < TOUCH_DEADZONE) return;

        const nextTarget = dragStartTargetX + deltaX * getPointerSensitivity();
        targetX = Math.max(-screenLimitX, Math.min(screenLimitX, nextTarget));
    }

    const controlSurface = renderer.domElement;

    controlSurface.addEventListener('pointerdown', (e) => {
        if (!isGameStarted || isPaused || isGameOver) return;
        if (dragPointerId !== null) return;

        isDragging = true;
        dragPointerId = e.pointerId;
        dragStartX = e.clientX;
        lastPointerX = e.clientX;
        dragStartTargetX = targetX;

        try { controlSurface.setPointerCapture(e.pointerId); } catch (_) {}
        e.preventDefault();
    }, { passive: false });

    controlSurface.addEventListener('pointermove', (e) => {
        if (!isDragging || e.pointerId !== dragPointerId) return;

        const movementSinceLastFrame = e.clientX - lastPointerX;
        if (Math.abs(movementSinceLastFrame) > 120) {
            dragStartX = e.clientX;
            dragStartTargetX = targetX;
            lastPointerX = e.clientX;
            return;
        }

        moveCannonByPointer(e.clientX);
        lastPointerX = e.clientX;
        e.preventDefault();
    }, { passive: false });

    function endPointerControl(e) {
        if (dragPointerId !== null && e.pointerId !== dragPointerId) return;
        isDragging = false;

        try {
            if (dragPointerId !== null) controlSurface.releasePointerCapture(dragPointerId);
        } catch (_) {}
        dragPointerId = null;
    }

    controlSurface.addEventListener('pointerup', endPointerControl);
    controlSurface.addEventListener('pointercancel', endPointerControl);
    controlSurface.addEventListener('lostpointercapture', () => {
        isDragging = false;
        dragPointerId = null;
    });
    controlSurface.addEventListener('contextmenu', (e) => e.preventDefault());

    // ==========================================
    // 12. התחלת משחק
    // ==========================================
    function startGame() {
        if (isGameStarted) return;

        isGameStarted = true;
        isGameOver = false;

        if (splashScreen) splashScreen.classList.add('hidden');

        score = 0;
        playerHp = maxHp;
        level = 1;
        hasStartedFirstWave = false;
        cannonRecoil = 0;

        cannonGroup.position.set(0, cannonBaseY, 0);
        buildMap(selectedMap);
        updateUI();
        startNextWave();
    }

    if (startBtn) startBtn.addEventListener('click', startGame);

    // ==========================================
    // 13. לולאת המשחק הראשית (סעיף 2 + 3)
    // ==========================================
    function animate(time) {
        requestAnimationFrame(animate);

        if (!isGameStarted || isPaused || isGameOver) {
            renderer.render(scene, camera);
            return;
        }

        // --- תנועת התותח ורתיעה ---
        cannonGroup.position.x += (targetX - cannonGroup.position.x) * 0.2;
        cannonShadow.position.x += (cannonGroup.position.x - cannonShadow.position.x) * 0.3;

        cannonRecoil *= 0.78;
        cannonGroup.position.y += ((cannonBaseY + cannonRecoil) - cannonGroup.position.y) * 0.35;

        // --- היגוי גלגלים ---
        const moveDelta = targetX - cannonGroup.position.x;
        const steerAngle = THREE.MathUtils.clamp(moveDelta * -0.26, -0.18, 0.18);
        cannonWheels.forEach(wheel => {
            const targetSteer = wheel.userData.steerable ? steerAngle : 0;
            wheel.rotation.y += (targetSteer - wheel.rotation.y) * 0.18;
        });

        // --- ירי (סעיף 2: תגובתיות חלקה, ירי קבוע) ---
        if (time - lastShotTime > 1000 / (fireRate * 4)) {
            const bulletY = cannonGroup.position.y + 1.5 * CANNON_SCALE;
            const leftX = cannonGroup.position.x - 0.35 * CANNON_SCALE;
            const rightX = cannonGroup.position.x + 0.35 * CANNON_SCALE;

            spawnBullet(leftX, bulletY, 0);
            spawnBullet(rightX, bulletY, 0);
            spawnMuzzleFlash(leftX, bulletY, 0);
            spawnMuzzleFlash(rightX, bulletY, 0);

            cannonRecoil = 0.14;
            playSound('shoot');
            lastShotTime = time;
        }

        // --- עדכון כדורים ---
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            b.position.y += 0.42;

            if (b.position.y > 18) {
                scene.remove(b);
                b.traverse(child => {
                    if (child.geometry) child.geometry.dispose();
                    if (child.material) child.material.dispose();
                });
                bullets.splice(i, 1);
            }
        }

        // --- עדכון סלעים ---
        for (let rIdx = rocks.length - 1; rIdx >= 0; rIdx--) {
            const r = rocks[rIdx];
            const data = r.userData;

            if (data.hitCooldown > 0) data.hitCooldown -= 1;

            // אפקט פעימה / התרחבות קלה בלחיצה ופגיעה (סעיף 2)
            if (data.hitScaleTimer > 0) {
                data.hitScaleTimer -= 0.1;
                const scaleBonus = Math.sin(data.hitScaleTimer * Math.PI) * 0.12;
                r.scale.setScalar(data.baseScale + scaleBonus);
            } else {
                r.scale.setScalar(data.baseScale);
            }

            data.vy -= 0.0025;
            r.position.x += data.vx;
            r.position.y += data.vy;
            r.rotation.x += data.rotX;
            r.rotation.y += data.rotY;
            r.rotation.z += data.rotZ;

            // קפיצות מהקרקע
            if (r.position.y - data.size < 0.2) {
                r.position.y = 0.2 + data.size;
                data.vy = Math.abs(data.vy) * 0.95;
                if (data.vy < 0.12) data.vy = 0.16;
                data.vx *= 0.985;
                spawnDustBurst(r.position.x, 0.25, r.position.z);
            }

            // גבולות מסך
            if (Math.abs(r.position.x) > screenLimitX) {
                data.vx *= -1;
                r.position.x = Math.sign(r.position.x) * screenLimitX;
            }

            // פגיעת כדור בסלע (סעיף 2: תגובה חזותית)
            for (let bIdx = bullets.length - 1; bIdx >= 0; bIdx--) {
                const b = bullets[bIdx];

                if (b.position.distanceTo(r.position) < data.size * 0.88) {
                    scene.remove(b);
                    b.traverse(child => {
                        if (child.geometry) child.geometry.dispose();
                        if (child.material) child.material.dispose();
                    });
                    bullets.splice(bIdx, 1);

                    data.hp -= firePower;
                    score += firePower;
                    data.hitScaleTimer = 1.0; // מפעיל פעימה חזותית

                    spawnImpactBurst(r.position.x, r.position.y, r.position.z);
                    playSound('hit');

                    if (data.hp <= 0) {
                        if (Math.random() > 0.3) spawnCoin(r.position.x, r.position.y);

                        if (data.size > 0.9) {
                            const childHp = Math.max(1, Math.floor(data.maxHp / 2));
                            spawnRock(r.position.x - 0.35, r.position.y, childHp, data.size * 0.7, -0.05 - Math.random() * 0.03, 0.05 + Math.random() * 0.08);
                            spawnRock(r.position.x + 0.35, r.position.y, childHp, data.size * 0.7, 0.05 + Math.random() * 0.03, 0.05 + Math.random() * 0.08);
                        }

                        removeRock(r, rIdx);
                        updateUI();
                        break;
                    } else {
                        updateRockLabel(r);
                    }
                }
            }

            if (!rocks[rIdx]) continue;

            // פגיעה בתותח
            if (data.hitCooldown <= 0 && Math.hypot(r.position.x - cannonGroup.position.x, r.position.y - 0.55) < data.size + 0.65) {
                playerHp -= 10;
                data.hitCooldown = 24;
                cannonRecoil = -0.08;

                spawnDustBurst(cannonGroup.position.x, 0.3, 0);
                updateUI();

                if (playerHp <= 0) {
                    isGameOver = true;
                    if (score > bestScore) {
                        bestScore = score;
                        localStorage.setItem('bb3d_best', bestScore);
                    }
                    localStorage.setItem('bb3d_coins', coins);
                    alert(`Game Over!\nScore: ${score}`);
                    location.reload();
                }
            }
        }

        // --- מטבעות ---
        for (let cIdx = droppedCoins.length - 1; cIdx >= 0; cIdx--) {
            const c = droppedCoins[cIdx];

            if (magnetLvl > 0) {
                const distToPlayer = Math.hypot(c.position.x - cannonGroup.position.x, c.position.y - 0.55);
                const magnetRadius = 2 + magnetLvl * 1.5;

                if (distToPlayer < magnetRadius) {
                    c.position.x += (cannonGroup.position.x - c.position.x) * 0.12;
                    c.position.y += (0.55 - c.position.y) * 0.12;
                } else {
                    c.position.y += c.userData.vy;
                }
            } else {
                c.position.y += c.userData.vy;
            }

            c.rotation.z += 0.05;

            if (Math.hypot(c.position.x - cannonGroup.position.x, c.position.y - 0.55) < 1.0) {
                coins += 5;
                playSound('coin');

                scene.remove(c);
                if (c.geometry) c.geometry.dispose();
                if (c.material) c.material.dispose();
                droppedCoins.splice(cIdx, 1);
                updateUI();
            } else if (c.position.y < 0.2) {
                c.position.y = 0.2;
                c.userData.vy = 0;
            }
        }

        updateEffects();
        startNextWave();

        renderer.render(scene, camera);
    }

    window.addEventListener('resize', updateCameraForDevice);
    animate(0);
});