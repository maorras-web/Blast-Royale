window.addEventListener('DOMContentLoaded', () => {

    if (typeof THREE === 'undefined') {
        console.error('Three.js library is missing!');
        return;
    }

    // ==========================================
    // 1. הגדרת סצנה וגרפיקה
    // ==========================================
    const scene = new THREE.Scene();

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
            camera.position.set(0, 12, 25);
            camera.lookAt(0, 5, 0);
            screenLimitX = 4.8;
        } else {
            camera.position.set(0, 8, 17);
            camera.lookAt(0, 6, 0);
            screenLimitX = 7.5;
        }

        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(
            Math.min(window.devicePixelRatio || 1, 1.5)
        );
    }

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance"
    });

    renderer.setSize(window.innerWidth, window.innerHeight);

    renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, 1.5)
    );

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    renderer.outputEncoding = THREE.sRGBEncoding;

    document.body.appendChild(renderer.domElement);

    updateCameraForDevice();

    // ==========================================
    // 2. תאורה מתקדמת
    // ==========================================
    const hemiLight = new THREE.HemisphereLight(
        0xffedd5,
        0x7c2d12,
        0.75
    );

    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(
        0xfff7ed,
        1.3
    );

    sunLight.position.set(12, 22, 16);
    sunLight.castShadow = true;

    const shadowResolution =
        window.innerWidth < 700 ? 512 : 1024;

    sunLight.shadow.mapSize.width = shadowResolution;
    sunLight.shadow.mapSize.height = shadowResolution;

    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 50;
    sunLight.shadow.bias = -0.0005;

    scene.add(sunLight);

    // תאורת מילוי רכה
    const fillLight = new THREE.DirectionalLight(
        0x7dd3fc,
        0.35
    );

    fillLight.position.set(-10, 8, 6);
    scene.add(fillLight);

    // אור צבעוני מהתותח
    const cannonLight = new THREE.PointLight(
        0x38bdf8,
        1.6,
        8,
        2
    );

    cannonLight.position.set(0, 1.1, 1.2);
    scene.add(cannonLight);

    // ==========================================
    // 3. אלמנטים בסצנה
    // ==========================================
    const grassGeo = new THREE.BoxGeometry(
        40,
        1,
        14
    );

    const grassMat = new THREE.MeshStandardMaterial({
        color: 0x3f6212,
        roughness: 0.85,
        metalness: 0.05
    });

    const grass = new THREE.Mesh(
        grassGeo,
        grassMat
    );

    grass.position.set(0, -0.5, 0);
    grass.receiveShadow = true;

    scene.add(grass);

    function createBackgroundPyramid(
        x,
        z,
        scale,
        colorHex
    ) {
        const geo = new THREE.ConeGeometry(
            8 * scale,
            13 * scale,
            4
        );

        const mat = new THREE.MeshStandardMaterial({
            color: colorHex,
            roughness: 0.8,
            flatShading: true
        });

        const pyr = new THREE.Mesh(
            geo,
            mat
        );

        pyr.position.set(
            x,
            5.5 * scale,
            z
        );

        pyr.rotation.y = Math.PI / 4;

        pyr.castShadow = true;
        pyr.receiveShadow = true;

        scene.add(pyr);
    }

    createBackgroundPyramid(
        -16,
        -12,
        1.4,
        0x9a3412
    );

    createBackgroundPyramid(
        16,
        -14,
        1.7,
        0x9a3412
    );

    createBackgroundPyramid(
        0,
        -22,
        2.4,
        0x7c2d12
    );

    // שכבת קרקע ליצירת עומק
    const platformGeo =
        new THREE.CylinderGeometry(
            5.4,
            6.1,
            0.35,
            48
        );

    const platformMat =
        new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            roughness: 0.62,
            metalness: 0.18
        });

    const platform =
        new THREE.Mesh(
            platformGeo,
            platformMat
        );

    platform.position.set(
        0,
        0.05,
        0
    );

    platform.scale.set(
        1.45,
        1,
        0.62
    );

    platform.receiveShadow = true;
    platform.castShadow = true;

    scene.add(platform);

    // טבעת זירה
    const ringGeo =
        new THREE.TorusGeometry(
            3.8,
            0.08,
            8,
            48
        );

    const ringMat =
        new THREE.MeshBasicMaterial({
            color: 0x38bdf8
        });

    const arenaRing =
        new THREE.Mesh(
            ringGeo,
            ringMat
        );

    arenaRing.rotation.x =
        Math.PI / 2;

    arenaRing.position.y = 0.27;

    arenaRing.scale.set(
        1.45,
        0.62,
        1
    );

    scene.add(arenaRing);

    // ==========================================
    // 4. עיצוב התותח
    // ==========================================
    const cannonGroup =
        new THREE.Group();

    const baseGeo =
        new THREE.BoxGeometry(
            2.1,
            0.55,
            1.6
        );

    const baseMat =
        new THREE.MeshStandardMaterial({
            color: 0x1e293b,
            roughness: 0.4,
            metalness: 0.3
        });

    const base =
        new THREE.Mesh(
            baseGeo,
            baseMat
        );

    base.position.y = 0.3;
    base.castShadow = true;

    cannonGroup.add(base);

    const domeGeo =
        new THREE.SphereGeometry(
            0.85,
            24,
            16,
            0,
            Math.PI * 2,
            0,
            Math.PI / 2
        );

    const domeMat =
        new THREE.MeshStandardMaterial({
            color: 0x0284c7,
            roughness: 0.2,
            metalness: 0.1,
            transparent: true,
            opacity: 0.9
        });

    const dome =
        new THREE.Mesh(
            domeGeo,
            domeMat
        );

    dome.position.y = 0.55;

    cannonGroup.add(dome);

    const wheelGeo =
        new THREE.CylinderGeometry(
            0.35,
            0.35,
            0.22,
            16
        );

    const wheelMat =
        new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            roughness: 0.7
        });

    const wheelPositions = [
        [-1.05, 0.2, 0.65],
        [1.05, 0.2, 0.65],
        [-1.05, 0.2, -0.65],
        [1.05, 0.2, -0.65]
    ];

    wheelPositions.forEach(pos => {

        const wheel =
            new THREE.Mesh(
                wheelGeo,
                wheelMat
            );

        wheel.rotation.z =
            Math.PI / 2;

        wheel.position.set(...pos);

        wheel.castShadow = true;

        cannonGroup.add(wheel);
    });

    const barrelGeo =
        new THREE.CylinderGeometry(
            0.11,
            0.11,
            0.85,
            16
        );

    const barrelMat =
        new THREE.MeshStandardMaterial({
            color: 0x334155,
            metalness: 0.7,
            roughness: 0.3
        });

    const leftBarrel =
        new THREE.Mesh(
            barrelGeo,
            barrelMat
        );

    leftBarrel.position.set(
        -0.35,
        1.0,
        0
    );

    const rightBarrel =
        new THREE.Mesh(
            barrelGeo,
            barrelMat
        );

    rightBarrel.position.set(
        0.35,
        1.0,
        0
    );

    cannonGroup.add(leftBarrel);
    cannonGroup.add(rightBarrel);

    scene.add(cannonGroup);

    // ליבה זוהרת
    const coreGeo =
        new THREE.SphereGeometry(
            0.12,
            12,
            12
        );

    const coreMat =
        new THREE.MeshBasicMaterial({
            color: 0x67e8f9
        });

    const cannonCore =
        new THREE.Mesh(
            coreGeo,
            coreMat
        );

    cannonCore.position.set(
        0,
        0.83,
        0.58
    );

    cannonGroup.add(cannonCore);

    // ==========================================
    // 5. משתני משחק
    // ==========================================
    let isGameStarted = false;
    let isPaused = false;
    let isGameOver = false;

    let score = 0;

    let coins =
        parseInt(
            localStorage.getItem('bb3d_coins')
        ) || 0;

    let bestScore =
        parseInt(
            localStorage.getItem('bb3d_best')
        ) || 0;

    let level = 1;

    let playerHp = 1000;
    let maxHp = 1000;

    let firePowerLvl =
        parseInt(
            localStorage.getItem(
                'bb3d_upg_power'
            )
        ) || 1;

    let fireRateLvl =
        parseInt(
            localStorage.getItem(
                'bb3d_upg_rate'
            )
        ) || 1;

    let magnetLvl =
        parseInt(
            localStorage.getItem(
                'bb3d_upg_magnet'
            )
        ) || 0;

    let firePower =
        firePowerLvl;

    let fireRate =
        1 + (fireRateLvl - 1) * 0.25;

    let bullets = [];
    let rocks = [];
    let droppedCoins = [];

    let lastShotTime = 0;
    let targetX = 0;

    // ==========================================
    // 6. UI
    // ==========================================
    const coinsValEl =
        document.getElementById(
            'coins-val'
        );

    const scoreValEl =
        document.getElementById(
            'score-val'
        );

    const hpTextEl =
        document.getElementById(
            'hp-text'
        );

    const hpBarEl =
        document.getElementById(
            'hp-bar'
        );

    const levelTextEl =
        document.getElementById(
            'level-text'
        );

    const splashScreen =
        document.getElementById(
            'splash-screen'
        );

    const startBtn =
        document.getElementById(
            'start-btn'
        );

    const startCoinsEl =
        document.getElementById(
            'start-coins'
        );

    const startBestScoreEl =
        document.getElementById(
            'start-best-score'
        );

    const buyPowerBtn =
        document.getElementById(
            'buy-power-btn'
        );

    const buyRateBtn =
        document.getElementById(
            'buy-rate-btn'
        );

    const buyMagnetBtn =
        document.getElementById(
            'buy-magnet-btn'
        );

    function updateUI() {

        if (coinsValEl) {
            coinsValEl.innerText =
                coins;
        }

        if (scoreValEl) {
            scoreValEl.innerText =
                score;
        }

        if (startCoinsEl) {
            startCoinsEl.innerText =
                coins;
        }

        if (startBestScoreEl) {
            startBestScoreEl.innerText =
                bestScore;
        }

        if (hpTextEl) {
            hpTextEl.innerText =
                `${Math.max(0, playerHp)} / ${maxHp}`;
        }

        if (hpBarEl) {
            hpBarEl.style.width =
                `${Math.max(
                    0,
                    (playerHp / maxHp) * 100
                )}%`;
        }

        if (levelTextEl) {
            levelTextEl.innerText =
                `LEVEL ${level}`;
        }

        // מחירי שדרוגים
        const powerCost =
            firePowerLvl * 50;

        const rateCost =
            fireRateLvl * 60;

        const magnetCost =
            (magnetLvl + 1) * 100;

        if (buyPowerBtn) {

            buyPowerBtn.innerText =
                `${powerCost} C`;

            buyPowerBtn.disabled =
                coins < powerCost;

            const el =
                document.getElementById(
                    'power-lvl-text'
                );

            if (el) {
                el.innerText =
                    `Lvl ${firePowerLvl}`;
            }
        }

        if (buyRateBtn) {

            buyRateBtn.innerText =
                `${rateCost} C`;

            buyRateBtn.disabled =
                coins < rateCost;

            const el =
                document.getElementById(
                    'rate-lvl-text'
                );

            if (el) {
                el.innerText =
                    `Lvl ${fireRateLvl}`;
            }
        }

        if (buyMagnetBtn) {

            buyMagnetBtn.innerText =
                `${magnetCost} C`;

            buyMagnetBtn.disabled =
                coins < magnetCost;

            const el =
                document.getElementById(
                    'magnet-lvl-text'
                );

            if (el) {
                el.innerText =
                    `Lvl ${magnetLvl}`;
            }
        }
    }

    // ==========================================
    // שדרוג כוח
    // ==========================================
    if (buyPowerBtn) {

        buyPowerBtn.addEventListener(
            'click',
            () => {

                const cost =
                    firePowerLvl * 50;

                if (coins >= cost) {

                    coins -= cost;

                    firePowerLvl++;

                    firePower =
                        firePowerLvl;

                    localStorage.setItem(
                        'bb3d_coins',
                        coins
                    );

                    localStorage.setItem(
                        'bb3d_upg_power',
                        firePowerLvl
                    );

                    updateUI();
                }
            }
        );
    }

    // ==========================================
    // שדרוג קצב אש
    // ==========================================
    if (buyRateBtn) {

        buyRateBtn.addEventListener(
            'click',
            () => {

                const cost =
                    fireRateLvl * 60;

                if (coins >= cost) {

                    coins -= cost;

                    fireRateLvl++;

                    fireRate =
                        1 +
                        (fireRateLvl - 1) *
                        0.25;

                    localStorage.setItem(
                        'bb3d_coins',
                        coins
                    );

                    localStorage.setItem(
                        'bb3d_upg_rate',
                        fireRateLvl
                    );

                    updateUI();
                }
            }
        );
    }

    // ==========================================
    // שדרוג מגנט
    // ==========================================
    if (buyMagnetBtn) {

        buyMagnetBtn.addEventListener(
            'click',
            () => {

                const cost =
                    (magnetLvl + 1) * 100;

                if (coins >= cost) {

                    coins -= cost;

                    magnetLvl++;

                    localStorage.setItem(
                        'bb3d_coins',
                        coins
                    );

                    localStorage.setItem(
                        'bb3d_upg_magnet',
                        magnetLvl
                    );

                    updateUI();
                }
            }
        );
    }

    updateUI();

    // ==========================================
    // 7. סאונד
    // ==========================================
    const audioCtx =
        new (
            window.AudioContext ||
            window.webkitAudioContext
        )();

    function playSound(type) {

        if (
            audioCtx.state ===
            'suspended'
        ) {
            audioCtx.resume();
        }

        const osc =
            audioCtx.createOscillator();

        const gain =
            audioCtx.createGain();

        osc.connect(gain);
        gain.connect(
            audioCtx.destination
        );

        if (type === 'shoot') {

            osc.frequency.setValueAtTime(
                320,
                audioCtx.currentTime
            );

            osc.frequency.exponentialRampToValueAtTime(
                90,
                audioCtx.currentTime + 0.07
            );

            gain.gain.setValueAtTime(
                0.05,
                audioCtx.currentTime
            );

            gain.gain.linearRampToValueAtTime(
                0.01,
                audioCtx.currentTime + 0.07
            );

            osc.start();

            osc.stop(
                audioCtx.currentTime + 0.07
            );

        } else if (type === 'hit') {

            osc.type = 'triangle';

            osc.frequency.setValueAtTime(
                120,
                audioCtx.currentTime
            );

            osc.frequency.exponentialRampToValueAtTime(
                40,
                audioCtx.currentTime + 0.06
            );

            gain.gain.setValueAtTime(
                0.08,
                audioCtx.currentTime
            );

            gain.gain.linearRampToValueAtTime(
                0.01,
                audioCtx.currentTime + 0.06
            );

            osc.start();

            osc.stop(
                audioCtx.currentTime + 0.06
            );

        } else if (type === 'coin') {

            osc.frequency.setValueAtTime(
                850,
                audioCtx.currentTime
            );

            osc.frequency.setValueAtTime(
                1250,
                audioCtx.currentTime + 0.05
            );

            gain.gain.setValueAtTime(
                0.07,
                audioCtx.currentTime
            );

            gain.gain.linearRampToValueAtTime(
                0.01,
                audioCtx.currentTime + 0.12
            );

            osc.start();

            osc.stop(
                audioCtx.currentTime + 0.12
            );
        }
    }

    // ==========================================
    // 8. יצירת אובייקטים עם שימוש חוזר
    // ==========================================

    // שימוש חוזר ב-Geometry/Material
    // מפחית הקצאות וזעזועים של GC
    const bulletGeo =
        new THREE.SphereGeometry(
            0.18,
            10,
            10
        );

    const bulletMat =
        new THREE.MeshBasicMaterial({
            color: 0xfef08a
        });

    const rockMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x64748b,
            roughness: 0.8,
            metalness: 0.05,
            flatShading: true
        });

    const coinGeo =
        new THREE.CylinderGeometry(
            0.28,
            0.28,
            0.08,
            12
        );

    const coinMat =
        new THREE.MeshStandardMaterial({
            color: 0xfacc15,
            metalness: 0.75,
            roughness: 0.22
        });

    const rockGeometryCache =
        new Map();

    function getRockGeometry(size) {

        const key =
            Math.round(size * 1000) /
            1000;

        if (
            !rockGeometryCache.has(key)
        ) {

            rockGeometryCache.set(
                key,
                new THREE.ConeGeometry(
                    size,
                    size * 1.35,
                    4
                )
            );
        }

        return rockGeometryCache.get(key);
    }

    // Cache לטקסט HP
    const labelTextureCache =
        new Map();

    function getHpTexture(hp) {

        const key =
            String(hp);

        if (
            labelTextureCache.has(key)
        ) {
            return labelTextureCache.get(
                key
            );
        }

        const canvas =
            document.createElement(
                'canvas'
            );

        canvas.width = 96;
        canvas.height = 96;

        const ctx =
            canvas.getContext('2d');

        ctx.clearRect(
            0,
            0,
            96,
            96
        );

        ctx.fillStyle =
            '#ffffff';

        ctx.font =
            '800 46px Rubik, Arial';

        ctx.textAlign =
            'center';

        ctx.textBaseline =
            'middle';

        ctx.shadowColor =
            'rgba(0,0,0,0.65)';

        ctx.shadowBlur = 6;

        ctx.fillText(
            key,
            48,
            48
        );

        const texture =
            new THREE.CanvasTexture(
                canvas
            );

        texture.minFilter =
            THREE.LinearFilter;

        texture.magFilter =
            THREE.LinearFilter;

        labelTextureCache.set(
            key,
            texture
        );

        return texture;
    }

    function spawnBullet(
        x,
        y,
        z
    ) {

        const bullet =
            new THREE.Mesh(
                bulletGeo,
                bulletMat
            );

        bullet.position.set(
            x,
            y,
            z
        );

        bullet.userData.vy =
            24;

        scene.add(bullet);

        bullets.push(bullet);
    }

    function spawnRock(
        x,
        y,
        hp,
        size
    ) {

        const rock =
            new THREE.Mesh(
                getRockGeometry(size),
                rockMaterial
            );

        rock.castShadow = true;
        rock.receiveShadow = true;

        rock.position.set(
            x,
            y,
            0
        );

        const spriteMat =
            new THREE.SpriteMaterial({
                map: getHpTexture(hp),
                transparent: true,
                depthWrite: false
            });

        const label =
            new THREE.Sprite(
                spriteMat
            );

        label.scale.set(
            size * 1.1,
            size * 1.1,
            1
        );

        label.position.z =
            0.35;

        rock.add(label);

        rock.userData = {
            hp: hp,
            maxHp: hp,
            size: size,
            vx:
                (Math.random() - 0.5) *
                1.8,
            vy: -1.5,
            label: label
        };

        scene.add(rock);

        rocks.push(rock);
    }

    function updateRockLabel(rock) {

        const label =
            rock.userData.label;

        if (!label) return;

        label.material.map =
            getHpTexture(
                rock.userData.hp
            );

        label.material.needsUpdate =
            true;
    }

    function removeRock(
        rock,
        index
    ) {

        scene.remove(rock);

        if (rock.userData.label) {
            rock.userData.label.material.dispose();
        }

        rocks.splice(
            index,
            1
        );
    }

    function spawnCoin(
        x,
        y
    ) {

        const coin =
            new THREE.Mesh(
                coinGeo,
                coinMat
            );

        coin.rotation.x =
            Math.PI / 2;

        coin.position.set(
            x,
            y,
            0
        );

        coin.castShadow =
            true;

        coin.userData = {
            vy: -2.4
        };

        scene.add(coin);

        droppedCoins.push(
            coin
        );
    }

    function startNextWave() {

        if (rocks.length > 0)
            return;

        const count =
            Math.min(
                2 +
                Math.floor(
                    (level - 1) / 2
                ),
                5
            );

        for (
            let i = 0;
            i < count;
            i++
        ) {

            const size =
                0.95 +
                Math.random() *
                0.8;

            const hp =
                Math.floor(
                    (8 + level * 6) *
                    (size / 1.2)
                );

            const spawnX =
                (Math.random() - 0.5) *
                (screenLimitX * 1.35);

            spawnRock(
                spawnX,
                12 + i * 2.6,
                hp,
                size
            );
        }

        updateUI();
    }

    // ==========================================
    // 9. שליטה וגרירה
    // ==========================================
    let isDragging = false;

    function handleMove(
        clientX
    ) {

        const normalizedX =
            (clientX /
                window.innerWidth) *
            2 -
            1;

        targetX =
            Math.max(
                -screenLimitX,
                Math.min(
                    screenLimitX,
                    normalizedX *
                    (screenLimitX * 1.25)
                )
            );
    }

    window.addEventListener(
        'pointerdown',
        (e) => {

            if (
                !isGameStarted ||
                isPaused ||
                isGameOver
            ) {
                return;
            }

            isDragging = true;

            handleMove(
                e.clientX
            );
        }
    );

    window.addEventListener(
        'pointermove',
        (e) => {

            if (isDragging) {
                handleMove(
                    e.clientX
                );
            }
        }
    );

    window.addEventListener(
        'pointerup',
        () => {
            isDragging = false;
        }
    );

    // ==========================================
    // 10. התחלת משחק
    // ==========================================
    function startGame() {

        if (isGameStarted)
            return;

        isGameStarted = true;
        isGameOver = false;

        if (splashScreen) {
            splashScreen.classList.add(
                'hidden'
            );
        }

        score = 0;
        level = 1;
        playerHp = maxHp;

        cannonGroup.position.x =
            0;

        targetX = 0;

        updateUI();

        startNextWave();
    }

    if (startBtn) {
        startBtn.addEventListener(
            'click',
            startGame
        );
    }

    // ==========================================
    // 11. לולאת המשחק
    // ==========================================
    let lastFrameTime = 0;
    let waveCooldown = 0;

    function animate(time) {

        requestAnimationFrame(
            animate
        );

        // Delta Time:
        // גורם למשחק להתנהג בצורה
        // עקבית גם ב-FPS שונה.
        const dt =
            Math.min(
                (time - lastFrameTime) /
                    1000 ||
                    0,
                0.033
            );

        lastFrameTime = time;

        if (
            !isGameStarted ||
            isPaused ||
            isGameOver
        ) {

            renderer.render(
                scene,
                camera
            );

            return;
        }

        // תנועת התותח
        cannonGroup.position.x +=
            (
                targetX -
                cannonGroup.position.x
            ) *
            Math.min(
                1,
                dt * 14
            );

        // תנועת מצלמה עדינה
        camera.position.x +=
            (
                cannonGroup.position.x *
                    0.035 -
                camera.position.x
            ) *
            Math.min(
                1,
                dt * 4
            );

        camera.lookAt(
            cannonGroup.position.x *
                0.02,
            5,
            0
        );

        // =====================================
        // ירי
        // =====================================
        if (
            time -
            lastShotTime >
            1000 /
                (fireRate * 4)
        ) {

            spawnBullet(
                cannonGroup.position.x -
                    0.35,
                1.5,
                0
            );

            spawnBullet(
                cannonGroup.position.x +
                    0.35,
                1.5,
                0
            );

            playSound('shoot');

            lastShotTime =
                time;
        }

        // =====================================
        // כדורים
        // =====================================
        for (
            let i = bullets.length - 1;
            i >= 0;
            i--
        ) {

            const b =
                bullets[i];

            b.position.y +=
                b.userData.vy *
                dt;

            if (
                b.position.y >
                24
            ) {

                scene.remove(
                    b
                );

                bullets.splice(
                    i,
                    1
                );
            }
        }

        // =====================================
        // סלעים
        // =====================================
        for (
            let rIdx = rocks.length - 1;
            rIdx >= 0;
            rIdx--
        ) {

            const r =
                rocks[rIdx];

            // כוח משיכה
            r.userData.vy -=
                18 * dt;

            r.position.x +=
                r.userData.vx *
                dt;

            r.position.y +=
                r.userData.vy *
                dt;

            // סיבוב
            r.rotation.x +=
                0.8 * dt;

            r.rotation.z +=
                1.1 * dt;

            // קפיצה מהקרקע
            if (
                r.position.y -
                    r.userData.size <
                0.2
            ) {

                r.position.y =
                    0.2 +
                    r.userData.size;

                r.userData.vy =
                    Math.max(
                        5.5,
                        Math.abs(
                            r.userData.vy
                        ) *
                        0.72
                    );
            }

            // גבולות הצדדים
            if (
                Math.abs(
                    r.position.x
                ) >
                screenLimitX
            ) {

                r.userData.vx *=
                    -1;

                r.position.x =
                    Math.sign(
                        r.position.x
                    ) *
                    screenLimitX;
            }

            // =================================
            // התנגשויות כדור-סלע
            // =================================
            for (
                let bIdx = bullets.length - 1;
                bIdx >= 0;
                bIdx--
            ) {

                const b =
                    bullets[bIdx];

                const dx =
                    b.position.x -
                    r.position.x;

                const dy =
                    b.position.y -
                    r.position.y;

                const hitRadius =
                    r.userData.size *
                    0.9;

                if (
                    dx * dx +
                    dy * dy <
                    hitRadius *
                    hitRadius
                ) {

                    scene.remove(
                        b
                    );

                    bullets.splice(
                        bIdx,
                        1
                    );

                    r.userData.hp -=
                        firePower;

                    score +=
                        firePower;

                    playSound('hit');

                    // סלע נהרס
                    if (
                        r.userData.hp <=
                        0
                    ) {

                        // מטבע
                        if (
                            Math.random() >
                            0.3
                        ) {

                            spawnCoin(
                                r.position.x,
                                r.position.y
                            );
                        }

                        // פיצול
                        if (
                            r.userData.size >
                            0.9
                        ) {

                            spawnRock(
                                r.position.x -
                                    0.35,
                                r.position.y,
                                Math.floor(
                                    r.userData
                                        .maxHp /
                                        2
                                ),
                                r.userData
                                    .size *
                                    0.7
                            );

                            spawnRock(
                                r.position.x +
                                    0.35,
                                r.position.y,
                                Math.floor(
                                    r.userData
                                        .maxHp /
                                        2
                                ),
                                r.userData
                                    .size *
                                    0.7
                            );
                        }

                        removeRock(
                            r,
                            rIdx
                        );

                        updateUI();

                        break;

                    } else {

                        updateRockLabel(
                            r
                        );
                    }
                }
            }

            // =================================
            // פגיעה בתותח
            // =================================
            const rcx =
                r.position.x -
                cannonGroup.position.x;

            const rcy =
                r.position.y -
                0.5;

            const rcRadius =
                r.userData.size +
                0.6;

            if (
                rcx * rcx +
                rcy * rcy <
                rcRadius *
                rcRadius
            ) {

                playerHp -= 10;

                updateUI();

                if (
                    playerHp <=
                    0
                ) {

                    isGameOver =
                        true;

                    if (
                        score >
                        bestScore
                    ) {

                        bestScore =
                            score;

                        localStorage.setItem(
                            'bb3d_best',
                            bestScore
                        );
                    }

                    localStorage.setItem(
                        'bb3d_coins',
                        coins
                    );

                    alert(
                        `Game Over!\nScore: ${score}`
                    );

                    location.reload();
                }
            }
        }

        // ==========================================
        // מטבעות
        // ==========================================
        for (
            let cIdx =
                droppedCoins.length - 1;
            cIdx >= 0;
            cIdx--
        ) {

            const c =
                droppedCoins[cIdx];

            if (
                magnetLvl > 0
            ) {

                const mdx =
                    c.position.x -
                    cannonGroup.position.x;

                const mdy =
                    c.position.y -
                    0.5;

                const magnetRadius =
                    2 +
                    magnetLvl *
                    1.5;

                if (
                    mdx * mdx +
                    mdy * mdy <
                    magnetRadius *
                    magnetRadius
                ) {

                    const pull =
                        Math.min(
                            1,
                            dt *
                                (
                                    7 +
                                    magnetLvl *
                                    1.2
                                )
                        );

                    c.position.x +=
                        (
                            cannonGroup
                                .position
                                .x -
                            c.position.x
                        ) *
                        pull;

                    c.position.y +=
                        (
                            0.5 -
                            c.position.y
                        ) *
                        pull;

                } else {

                    c.userData.vy -=
                        10 * dt;

                    c.position.y +=
                        c.userData.vy *
                        dt;
                }

            } else {

                c.position.y +=
                    c.userData.vy;
            }

            c.rotation.z +=
                3.5 * dt;

            const ccx =
                c.position.x -
                cannonGroup.position.x;

            const ccy =
                c.position.y -
                0.5;

            if (
                ccx * ccx +
                ccy * ccy <
                1.0
            ) {

                coins += 5;

                playSound('coin');

                scene.remove(c);

                droppedCoins.splice(
                    cIdx,
                    1
                );

                updateUI();

            } else if (
                c.position.y <
                0.2
            ) {

                c.position.y =
                    0.2;

                c.userData.vy =
                    0;
            }
        }

        // ==========================================
        // מעבר לשלב הבא
        // ==========================================
        if (
            rocks.length === 0
        ) {

            waveCooldown -=
                dt;

            if (
                waveCooldown <=
                0
            ) {

                level++;

                waveCooldown =
                    0.45;

                startNextWave();
            }

        } else {

            waveCooldown =
                0.45;
        }

        renderer.render(
            scene,
            camera
        );
    }

    window.addEventListener(
        'resize',
        updateCameraForDevice
    );

    animate(0);
});