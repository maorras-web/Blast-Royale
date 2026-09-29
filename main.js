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

    scene.fog = new THREE.FogExp2(
        0xdd8c55,
        0.012
    );

    const camera = new THREE.PerspectiveCamera(
        55,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    let screenLimitX = 7.5;

    function updateCameraForDevice() {

        const aspect =
            window.innerWidth /
            window.innerHeight;

        camera.aspect = aspect;

        if (aspect < 1) {

            // מובייל
            camera.position.set(
                0,
                12,
                25
            );

            camera.lookAt(
                0,
                5,
                0
            );

            screenLimitX = 4.8;

        } else {

            // מחשב
            camera.position.set(
                0,
                8,
                17
            );

            camera.lookAt(
                0,
                6,
                0
            );

            screenLimitX = 7.5;
        }

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }

    const renderer =
        new THREE.WebGLRenderer({
            antialias: true,
            powerPreference:
                "high-performance"
        });

    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );

    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio,
            2
        )
    );

    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;

    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure = 1.1;

    document.body.appendChild(
        renderer.domElement
    );

    updateCameraForDevice();

    // ==========================================
    // 2. תאורה
    // ==========================================

    const hemiLight =
        new THREE.HemisphereLight(
            0xffedd5,
            0x7c2d12,
            0.75
        );

    scene.add(hemiLight);

    const sunLight =
        new THREE.DirectionalLight(
            0xfff7ed,
            1.3
        );

    sunLight.position.set(
        12,
        22,
        16
    );

    sunLight.castShadow = true;

    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;

    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 50;

    sunLight.shadow.bias = -0.0005;

    scene.add(sunLight);

    // ==========================================
    // 3. מערכת מפות
    // ==========================================

    const mapGroup =
        new THREE.Group();

    scene.add(mapGroup);

    const MAPS = {

        desert: {
            name: 'DESERT',
            label: 'מדבר',
            price: 0
        },

        forest: {
            name: 'FOREST',
            label: 'יער',
            price: 500
        },

        ice: {
            name: 'ICE',
            label: 'קרח',
            price: 1500
        },

        volcano: {
            name: 'VOLCANO',
            label: 'הר געש',
            price: 3000
        }
    };

    const savedMap =
        localStorage.getItem(
            'bb3d_map'
        );

    let selectedMap =
        MAPS[savedMap]
            ? savedMap
            : 'desert';

    let purchasedMaps = [
        'desert'
    ];

    try {

        const savedPurchased =
            JSON.parse(
                localStorage.getItem(
                    'bb3d_purchased_maps'
                ) ||
                '["desert"]'
            );

        if (Array.isArray(savedPurchased)) {

            purchasedMaps =
                Array.from(
                    new Set([
                        'desert',
                        ...savedPurchased
                    ])
                ).filter(
                    id => MAPS[id]
                );
        }

    } catch (e) {

        purchasedMaps = [
            'desert'
        ];
    }

    if (
        !purchasedMaps.includes(
            selectedMap
        )
    ) {

        selectedMap = 'desert';
    }

    function saveMapData() {

        localStorage.setItem(
            'bb3d_map',
            selectedMap
        );

        localStorage.setItem(
            'bb3d_purchased_maps',
            JSON.stringify(
                purchasedMaps
            )
        );
    }

    function clearMapGroup() {

        while (
            mapGroup.children.length
        ) {

            const obj =
                mapGroup.children.pop();

            obj.traverse(
                child => {

                    if (child.geometry) {
                        child.geometry.dispose();
                    }

                    if (child.material) {

                        if (
                            Array.isArray(
                                child.material
                            )
                        ) {

                            child.material.forEach(
                                material =>
                                    material.dispose()
                            );

                        } else {

                            child.material.dispose();
                        }
                    }
                }
            );
        }
    }

    function addMesh(
        geo,
        mat,
        x = 0,
        y = 0,
        z = 0,
        cast = true,
        receive = true
    ) {

        const mesh =
            new THREE.Mesh(
                geo,
                mat
            );

        mesh.position.set(
            x,
            y,
            z
        );

        mesh.castShadow = cast;
        mesh.receiveShadow = receive;

        mapGroup.add(mesh);

        return mesh;
    }

    // ==========================================
    // קישוטי מפות
    // ==========================================

    function addLowPolyTree(
        x,
        z,
        scale = 1
    ) {

        const trunkMat =
            new THREE.MeshStandardMaterial({
                color: 0x5b3a29,
                roughness: 1
            });

        const leafMat =
            new THREE.MeshStandardMaterial({
                color: 0x166534,
                roughness: 0.9,
                flatShading: true
            });

        addMesh(
            new THREE.CylinderGeometry(
                0.18 * scale,
                0.24 * scale,
                1.5 * scale,
                6
            ),
            trunkMat,
            x,
            0.75 * scale,
            z
        );

        addMesh(
            new THREE.ConeGeometry(
                0.95 * scale,
                1.8 * scale,
                7
            ),
            leafMat,
            x,
            2.0 * scale,
            z
        );

        addMesh(
            new THREE.ConeGeometry(
                0.7 * scale,
                1.5 * scale,
                7
            ),
            leafMat,
            x,
            2.9 * scale,
            z
        );
    }

    function addRockDecoration(
        x,
        z,
        scale = 1,
        color = 0x64748b
    ) {

        const mat =
            new THREE.MeshStandardMaterial({
                color,
                roughness: 0.9,
                flatShading: true
            });

        addMesh(
            new THREE.DodecahedronGeometry(
                0.65 * scale,
                0
            ),
            mat,
            x,
            0.5 * scale,
            z,
            true,
            true
        );
    }

    function addCrystal(
        x,
        z,
        scale = 1
    ) {

        const mat =
            new THREE.MeshStandardMaterial({
                color: 0x67e8f9,
                roughness: 0.28,
                metalness: 0.15,
                flatShading: true
            });

        const crystal =
            addMesh(
                new THREE.ConeGeometry(
                    0.45 * scale,
                    1.8 * scale,
                    6
                ),
                mat,
                x,
                0.9 * scale,
                z
            );

        crystal.rotation.z =
            (Math.random() - 0.5) * 0.22;
    }

    function addLavaRock(
        x,
        z,
        scale = 1
    ) {

        const darkMat =
            new THREE.MeshStandardMaterial({
                color: 0x292524,
                roughness: 0.95,
                flatShading: true
            });

        addMesh(
            new THREE.DodecahedronGeometry(
                0.75 * scale,
                0
            ),
            darkMat,
            x,
            0.55 * scale,
            z
        );
    }

    // ==========================================
    // בניית מפה
    // ==========================================

    function buildMap(
        mapId
    ) {

        clearMapGroup();

        const grassGeo =
            new THREE.BoxGeometry(
                40,
                1,
                30
            );

        let groundColor =
            0x3f6212;

        let groundRoughness =
            0.85;

        if (
            mapId === 'forest'
        ) {

            groundColor =
                0x365314;
        }

        if (
            mapId === 'ice'
        ) {

            groundColor =
                0xbfe7f5;

            groundRoughness =
                0.55;
        }

        if (
            mapId === 'volcano'
        ) {

            groundColor =
                0x292524;

            groundRoughness =
                0.95;
        }

        const grassMat =
            new THREE.MeshStandardMaterial({
                color: groundColor,
                roughness: groundRoughness,
                metalness: 0.03
            });

        addMesh(
            grassGeo,
            grassMat,
            0,
            -0.5,
            0,
            false,
            true
        );

        // ======================================
        // DESERT
        // ======================================

        if (mapId === 'desert') {

            scene.background.set(
                0xdd8c55
            );

            scene.fog.color.set(
                0xdd8c55
            );

            scene.fog.density =
                0.012;

            const pyramidMatA =
                new THREE.MeshStandardMaterial({
                    color: 0x9a3412,
                    roughness: 0.8,
                    flatShading: true
                });

            const pyramidMatB =
                new THREE.MeshStandardMaterial({
                    color: 0x7c2d12,
                    roughness: 0.82,
                    flatShading: true
                });

            const p1 =
                addMesh(
                    new THREE.ConeGeometry(
                        11,
                        18,
                        4
                    ),
                    pyramidMatA,
                    -15,
                    7,
                    -12
                );

            p1.rotation.y =
                Math.PI / 4;

            const p2 =
                addMesh(
                    new THREE.ConeGeometry(
                        13,
                        22,
                        4
                    ),
                    pyramidMatA,
                    15,
                    9,
                    -14
                );

            p2.rotation.y =
                Math.PI / 4;

            const p3 =
                addMesh(
                    new THREE.ConeGeometry(
                        18,
                        31,
                        4
                    ),
                    pyramidMatB,
                    0,
                    15,
                    -24
                );

            p3.rotation.y =
                Math.PI / 4;

            addRockDecoration(
                -6,
                -5,
                1.2,
                0x7c4a28
            );

            addRockDecoration(
                7,
                -7,
                0.85,
                0x8b5a32
            );
        }

        // ======================================
        // FOREST
        // ======================================

        else if (
            mapId === 'forest'
        ) {

            scene.background.set(
                0x21452a
            );

            scene.fog.color.set(
                0x21452a
            );

            scene.fog.density =
                0.018;

            [
                -9,
                -5,
                5,
                9
            ].forEach(
                (x, i) => {

                    addLowPolyTree(
                        x,
                        -7 -
                        (i % 2) * 2,
                        1.15 +
                        (i % 3) * 0.15
                    );
                }
            );

            [
                -12,
                12
            ].forEach(
                x => {

                    addLowPolyTree(
                        x,
                        -15,
                        1.7
                    );
                }
            );

            addRockDecoration(
                -7,
                -10,
                0.9,
                0x475569
            );

            addRockDecoration(
                7,
                -12,
                1.0,
                0x475569
            );
        }

        // ======================================
        // ICE
        // ======================================

        else if (
            mapId === 'ice'
        ) {

            scene.background.set(
                0x79b8d1
            );

            scene.fog.color.set(
                0x79b8d1
            );

            scene.fog.density =
                0.015;

            const mountainMat =
                new THREE.MeshStandardMaterial({
                    color: 0xe0f2fe,
                    roughness: 0.6,
                    flatShading: true
                });

            [
                -15,
                15
            ].forEach(
                (x, i) => {

                    const m =
                        addMesh(
                            new THREE.ConeGeometry(
                                7 + i * 2,
                                13 + i * 4,
                                5
                            ),
                            mountainMat,
                            x,
                            6.5 + i * 2,
                            -15
                        );

                    m.rotation.y =
                        0.35;
                }
            );

            for (
                let i = 0;
                i < 8;
                i++
            ) {

                addCrystal(
                    (Math.random() - 0.5) * 24,
                    -5 -
                    Math.random() * 13,
                    0.7 +
                    Math.random() * 0.8
                );
            }
        }

        // ======================================
        // VOLCANO
        // ======================================

        else if (
            mapId === 'volcano'
        ) {

            scene.background.set(
                0x241114
            );

            scene.fog.color.set(
                0x241114
            );

            scene.fog.density =
                0.02;

            const mountainMat =
                new THREE.MeshStandardMaterial({
                    color: 0x44403c,
                    roughness: 1,
                    flatShading: true
                });

            const volcano =
                addMesh(
                    new THREE.ConeGeometry(
                        11,
                        19,
                        7
                    ),
                    mountainMat,
                    0,
                    7.5,
                    -18
                );

            volcano.rotation.y =
                0.2;

            const lavaMat =
                new THREE.MeshBasicMaterial({
                    color: 0xff6b35
                });

            addMesh(
                new THREE.CylinderGeometry(
                    1.9,
                    2.6,
                    0.15,
                    16
                ),
                lavaMat,
                0,
                0.12,
                -18,
                false,
                false
            );

            [
                -10,
                -5,
                5,
                10
            ].forEach(
                (x, i) => {

                    addLavaRock(
                        x,
                        -7 -
                        (i % 2) * 3,
                        0.9 +
                        (i % 2) * 0.25
                    );
                }
            );
        }
    }

    buildMap(
        selectedMap
    );

    // ==========================================
    // 4. עיצוב התותח
    // ==========================================

    const cannonGroup =
        new THREE.Group();

    // בסיס
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

    base.position.y =
        0.3;

    base.castShadow = true;

    cannonGroup.add(
        base
    );

    // כיפה
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

    dome.position.y =
        0.55;

    cannonGroup.add(
        dome
    );

    // ==========================================
    // גלגלים
    // ==========================================

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

    const cannonWheels = [];

    const wheelPositions = [
        [-1.05, 0.2, 0.65],
        [1.05, 0.2, 0.65],
        [-1.05, 0.2, -0.65],
        [1.05, 0.2, -0.65]
    ];

    wheelPositions.forEach(
        pos => {

            const wheel =
                new THREE.Mesh(
                    wheelGeo,
                    wheelMat
                );

            // הגלגל עומד במקום
            // ולא מסתובב כל הזמן סביב הציר שלו
            wheel.rotation.z =
                Math.PI / 2;

            wheel.position.set(
                ...pos
            );

            wheel.castShadow =
                true;

            cannonGroup.add(
                wheel
            );

            cannonWheels.push(
                wheel
            );
        }
    );

    // ==========================================
    // קנים
    // ==========================================

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

    cannonGroup.add(
        leftBarrel
    );

    cannonGroup.add(
        rightBarrel
    );

    scene.add(
        cannonGroup
    );

    // ==========================================
    // 5. משתני משחק
    // ==========================================

    let isGameStarted = false;
    let isPaused = false;
    let isGameOver = false;

    let score = 0;

    let coins =
        parseInt(
            localStorage.getItem(
                'bb3d_coins'
            )
        ) || 0;

    let bestScore =
        parseInt(
            localStorage.getItem(
                'bb3d_best'
            )
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
        1 +
        (fireRateLvl - 1) *
        0.25;

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

    const mapCards =
        document.querySelectorAll(
            '.map-card'
        );

    function updateMapUI() {

        mapCards.forEach(
            card => {

                const mapId =
                    card.dataset.mapId;

                const mapInfo =
                    MAPS[mapId];

                const isOwned =
                    purchasedMaps.includes(
                        mapId
                    );

                const isSelected =
                    selectedMap ===
                    mapId;

                const action =
                    card.querySelector(
                        '.map-action'
                    );

                const state =
                    card.querySelector(
                        '.map-state'
                    );

                card.classList.toggle(
                    'owned',
                    isOwned
                );

                card.classList.toggle(
                    'selected',
                    isSelected
                );

                if (
                    isSelected
                ) {

                    if (action) {
                        action.innerText =
                            'נבחרה';
                    }

                    if (state) {
                        state.innerText =
                            'ACTIVE';
                    }

                    card.disabled =
                        false;

                } else if (
                    isOwned
                ) {

                    if (action) {
                        action.innerText =
                            'בחר';
                    }

                    if (state) {
                        state.innerText =
                            'OWNED';
                    }

                    card.disabled =
                        false;

                } else {

                    if (action) {
                        action.innerText =
                            `${mapInfo.price} C`;
                    }

                    if (state) {
                        state.innerText =
                            'LOCKED';
                    }

                    card.disabled =
                        coins <
                        mapInfo.price;
                }
            }
        );
    }

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
                `${Math.max(
                    0,
                    playerHp
                )} / ${maxHp}`;
        }

        if (hpBarEl) {

            hpBarEl.style.width =
                `${Math.max(
                    0,
                    (
                        playerHp /
                        maxHp
                    ) *
                    100
                )}%`;
        }

        if (levelTextEl) {

            levelTextEl.innerText =
                `LEVEL ${level}`;
        }

        // מחירים לשדרוגים
        const powerCost =
            firePowerLvl *
            50;

        const rateCost =
            fireRateLvl *
            60;

        const magnetCost =
            (
                magnetLvl + 1
            ) *
            100;

        if (buyPowerBtn) {

            buyPowerBtn.innerText =
                `${powerCost} C`;

            buyPowerBtn.disabled =
                coins <
                powerCost;

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
                coins <
                rateCost;

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
                coins <
                magnetCost;

            const el =
                document.getElementById(
                    'magnet-lvl-text'
                );

            if (el) {
                el.innerText =
                    `Lvl ${magnetLvl}`;
            }
        }

        updateMapUI();
    }

    // ==========================================
    // רכישת שדרוגים
    // ==========================================

    if (buyPowerBtn) {

        buyPowerBtn.addEventListener(
            'click',
            () => {

                const cost =
                    firePowerLvl *
                    50;

                if (
                    coins >=
                    cost
                ) {

                    coins -=
                        cost;

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

    if (buyRateBtn) {

        buyRateBtn.addEventListener(
            'click',
            () => {

                const cost =
                    fireRateLvl *
                    60;

                if (
                    coins >=
                    cost
                ) {

                    coins -=
                        cost;

                    fireRateLvl++;

                    fireRate =
                        1 +
                        (
                            fireRateLvl -
                            1
                        ) *
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

    if (buyMagnetBtn) {

        buyMagnetBtn.addEventListener(
            'click',
            () => {

                const cost =
                    (
                        magnetLvl +
                        1
                    ) *
                    100;

                if (
                    coins >=
                    cost
                ) {

                    coins -=
                        cost;

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

    // ==========================================
    // בחירת / קניית מפה
    // ==========================================

    mapCards.forEach(
        card => {

            card.addEventListener(
                'click',
                () => {

                    const mapId =
                        card.dataset.mapId;

                    const mapInfo =
                        MAPS[mapId];

                    if (!mapInfo) {
                        return;
                    }

                    // מפה כבר בבעלות
                    if (
                        purchasedMaps.includes(
                            mapId
                        )
                    ) {

                        selectedMap =
                            mapId;

                        saveMapData();

                        updateMapUI();

                        return;
                    }

                    // קנייה
                    if (
                        coins >=
                        mapInfo.price
                    ) {

                        coins -=
                            mapInfo.price;

                        purchasedMaps.push(
                            mapId
                        );

                        selectedMap =
                            mapId;

                        saveMapData();

                        updateUI();
                    }
                }
            );
        }
    );

    updateUI();

    // ==========================================
    // 7. סאונד
    // ==========================================

    let audioCtx = null;

    function getAudioContext() {

        if (!audioCtx) {

            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContext) {
                return null;
            }

            audioCtx =
                new AudioContext();
        }

        return audioCtx;
    }

    function playSound(type) {

        const ctx =
            getAudioContext();

        if (!ctx) {
            return;
        }

        if (
            ctx.state ===
            'suspended'
        ) {

            ctx.resume();
        }

        const osc =
            ctx.createOscillator();

        const gain =
            ctx.createGain();

        osc.connect(gain);

        gain.connect(
            ctx.destination
        );

        if (
            type ===
            'shoot'
        ) {

            osc.frequency.setValueAtTime(
                320,
                ctx.currentTime
            );

            osc.frequency.exponentialRampToValueAtTime(
                90,
                ctx.currentTime +
                0.07
            );

            gain.gain.setValueAtTime(
                0.05,
                ctx.currentTime
            );

            gain.gain.linearRampToValueAtTime(
                0.01,
                ctx.currentTime +
                0.07
            );

            osc.start();

            osc.stop(
                ctx.currentTime +
                0.07
            );

        } else if (
            type ===
            'hit'
        ) {

            osc.type =
                'triangle';

            osc.frequency.setValueAtTime(
                120,
                ctx.currentTime
            );

            osc.frequency.exponentialRampToValueAtTime(
                40,
                ctx.currentTime +
                0.06
            );

            gain.gain.setValueAtTime(
                0.08,
                ctx.currentTime
            );

            gain.gain.linearRampToValueAtTime(
                0.01,
                ctx.currentTime +
                0.06
            );

            osc.start();

            osc.stop(
                ctx.currentTime +
                0.06
            );

        } else if (
            type ===
            'coin'
        ) {

            osc.frequency.setValueAtTime(
                850,
                ctx.currentTime
            );

            osc.frequency.setValueAtTime(
                1250,
                ctx.currentTime +
                0.05
            );

            gain.gain.setValueAtTime(
                0.07,
                ctx.currentTime
            );

            gain.gain.linearRampToValueAtTime(
                0.01,
                ctx.currentTime +
                0.12
            );

            osc.start();

            osc.stop(
                ctx.currentTime +
                0.12
            );
        }
    }

    // ==========================================
    // 8. יצירת כדורים
    // ==========================================

    function spawnBullet(
        x,
        y,
        z
    ) {

        const geo =
            new THREE.SphereGeometry(
                0.18,
                12,
                12
            );

        const mat =
            new THREE.MeshBasicMaterial({
                color: 0xfde047
            });

        const bullet =
            new THREE.Mesh(
                geo,
                mat
            );

        bullet.position.set(
            x,
            y,
            z
        );

        scene.add(
            bullet
        );

        bullets.push(
            bullet
        );
    }

    // ==========================================
    // 9. יצירת סלעים
    // ==========================================

    function spawnRock(
        x,
        y,
        hp,
        size
    ) {

        const geo =
            new THREE.ConeGeometry(
                size,
                size * 1.35,
                4
            );

        const mat =
            new THREE.MeshStandardMaterial({
                color: 0x64748b,
                roughness: 0.75,
                flatShading: true
            });

        const rock =
            new THREE.Mesh(
                geo,
                mat
            );

        rock.castShadow = true;

        rock.receiveShadow = true;

        rock.position.set(
            x,
            y,
            0
        );

        // ======================================
        // מספר HP על הסלע
        // ======================================

        const canvas =
            document.createElement(
                'canvas'
            );

        canvas.width = 128;
        canvas.height = 128;

        const ctx =
            canvas.getContext(
                '2d'
            );

        ctx.fillStyle =
            '#ffffff';

        ctx.font =
            'Bold 60px Rubik, Arial';

        ctx.textAlign =
            'center';

        ctx.textBaseline =
            'middle';

        ctx.fillText(
            hp,
            64,
            64
        );

        const texture =
            new THREE.CanvasTexture(
                canvas
            );

        const spriteMat =
            new THREE.SpriteMaterial({
                map: texture
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

        rock.add(
            label
        );

        rock.userData = {

            hp: hp,

            maxHp: hp,

            size: size,

            vx:
                (
                    Math.random() -
                    0.5
                ) *
                0.05,

            vy: 0,

            ctx: ctx,

            texture: texture
        };

        scene.add(
            rock
        );

        rocks.push(
            rock
        );
    }

    function updateRockLabel(
        rock
    ) {

        const ctx =
            rock.userData.ctx;

        ctx.clearRect(
            0,
            0,
            128,
            128
        );

        ctx.fillStyle =
            '#ffffff';

        ctx.font =
            'Bold 60px Rubik, Arial';

        ctx.textAlign =
            'center';

        ctx.textBaseline =
            'middle';

        ctx.fillText(
            rock.userData.hp,
            64,
            64
        );

        rock.userData.texture
            .needsUpdate = true;
    }

    function removeRock(
        rock,
        index
    ) {

        if (
            rock.userData.texture
        ) {

            rock.userData.texture.dispose();
        }

        scene.remove(
            rock
        );

        rocks.splice(
            index,
            1
        );
    }

    // ==========================================
    // 10. מטבעות
    // ==========================================

    function spawnCoin(
        x,
        y
    ) {

        const geo =
            new THREE.CylinderGeometry(
                0.28,
                0.28,
                0.08,
                14
            );

        const mat =
            new THREE.MeshStandardMaterial({
                color: 0xfacc15,
                metalness: 0.8,
                roughness: 0.2
            });

        const coin =
            new THREE.Mesh(
                geo,
                mat
            );

        coin.rotation.x =
            Math.PI / 2;

        coin.position.set(
            x,
            y,
            0
        );

        coin.castShadow = true;

        coin.userData = {
            vy: -0.04
        };

        scene.add(
            coin
        );

        droppedCoins.push(
            coin
        );
    }

    // ==========================================
    // 11. גלים / LEVEL
    // ==========================================

    let hasStartedFirstWave =
        false;

    function startNextWave() {

        if (
            rocks.length === 0
        ) {

            // חשוב:
            // המפה אינה משתנה כאן.
            // רק LEVEL עולה.

            if (
                hasStartedFirstWave
            ) {

                level++;
            }

            hasStartedFirstWave =
                true;

            const count =
                Math.min(
                    2 +
                    Math.floor(
                        level / 2
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
                        (
                            8 +
                            level * 6
                        ) *
                        (
                            size /
                            1.2
                        )
                    );

                const spawnX =
                    (
                        Math.random() -
                        0.5
                    ) *
                    (
                        screenLimitX *
                        1.4
                    );

                spawnRock(
                    spawnX,
                    12 + i * 3,
                    hp,
                    size
                );
            }

            updateUI();
        }
    }

    // ==========================================
    // 12. שליטה
    // ==========================================

    let isDragging =
        false;

    function handleMove(
        clientX
    ) {

        const normalizedX =
            (
                clientX /
                window.innerWidth
            ) *
            2 -
            1;

        targetX =
            Math.max(
                -screenLimitX,
                Math.min(
                    screenLimitX,
                    normalizedX *
                    (
                        screenLimitX *
                        1.25
                    )
                )
            );
    }

    window.addEventListener(
        'pointerdown',
        e => {

            if (
                !isGameStarted ||
                isPaused ||
                isGameOver
            ) {
                return;
            }

            isDragging =
                true;

            handleMove(
                e.clientX
            );
        }
    );

    window.addEventListener(
        'pointermove',
        e => {

            if (
                isDragging
            ) {

                handleMove(
                    e.clientX
                );
            }
        }
    );

    window.addEventListener(
        'pointerup',
        () => {

            isDragging =
                false;
        }
    );

    window.addEventListener(
        'pointercancel',
        () => {

            isDragging =
                false;
        }
    );

    // ==========================================
    // 13. התחלת המשחק
    // ==========================================

    function startGame() {

        if (
            isGameStarted
        ) {
            return;
        }

        isGameStarted =
            true;

        isGameOver =
            false;

        if (
            splashScreen
        ) {

            splashScreen.classList.add(
                'hidden'
            );
        }

        score = 0;

        playerHp =
            maxHp;

        level = 1;

        hasStartedFirstWave =
            false;

        // טוענים את המפה שבחר השחקן.
        // היא לא תתחלף בעקבות LEVEL.
        buildMap(
            selectedMap
        );

        updateUI();

        startNextWave();
    }

    if (
        startBtn
    ) {

        startBtn.addEventListener(
            'click',
            () => {

                const ctx =
                    getAudioContext();

                if (
                    ctx &&
                    ctx.state ===
                    'suspended'
                ) {

                    ctx.resume();
                }

                startGame();
            }
        );
    }

    // ==========================================
    // 14. לולאת המשחק
    // ==========================================

    function animate(
        time
    ) {

        requestAnimationFrame(
            animate
        );

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

        // ======================================
        // תנועת התותח
        // ======================================

        cannonGroup.position.x +=
            (
                targetX -
                cannonGroup.position.x
            ) *
            0.2;

        // ======================================
        // גלגלים:
        // לא מסתובבים 360 מעלות
        // רק פונים מעט ימינה / שמאלה
        // ======================================

        const moveDelta =
            targetX -
            cannonGroup.position.x;

        const steerAngle =
            THREE.MathUtils.clamp(
                moveDelta *
                -0.22,
                -0.16,
                0.16
            );

        cannonWheels.forEach(
            wheel => {

                wheel.rotation.y +=
                    (
                        steerAngle -
                        wheel.rotation.y
                    ) *
                    0.18;
            }
        );

        // ======================================
        // ירי אוטומטי
        // ======================================

        if (
            time -
            lastShotTime >
            1000 /
            (
                fireRate *
                4
            )
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

            playSound(
                'shoot'
            );

            lastShotTime =
                time;
        }

        // ======================================
        // כדורים
        // ======================================

        for (
            let i =
                bullets.length - 1;
            i >= 0;
            i--
        ) {

            const b =
                bullets[i];

            b.position.y +=
                0.42;

            if (
                b.position.y >
                18
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

        // ======================================
        // סלעים
        // ======================================

        for (
            let rIdx =
                rocks.length - 1;
            rIdx >= 0;
            rIdx--
        ) {

            const r =
                rocks[rIdx];

            // כוח כבידה
            r.userData.vy -=
                0.0025;

            // תזוזה
            r.position.x +=
                r.userData.vx;

            r.position.y +=
                r.userData.vy;

            // ==================================
            // קפיצה מהקרקע
            // ==================================

            if (
                r.position.y -
                r.userData.size <
                0.2
            ) {

                r.position.y =
                    0.2 +
                    r.userData.size;

                r.userData.vy =
                    Math.abs(
                        r.userData.vy
                    ) *
                    0.95;

                if (
                    r.userData.vy <
                    0.12
                ) {

                    r.userData.vy =
                        0.16;
                }
            }

            // ==================================
            // גבולות X
            // ==================================

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

            // ==================================
            // פגיעות
            // ==================================

            for (
                let bIdx =
                    bullets.length - 1;
                bIdx >= 0;
                bIdx--
            ) {

                const b =
                    bullets[bIdx];

                if (
                    b.position.distanceTo(
                        r.position
                    ) <
                    r.userData.size *
                    0.9
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

                    playSound(
                        'hit'
                    );

                    // =================================
                    // הסלע הושמד
                    // =================================

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

                        // פיצול סלע
                        if (
                            r.userData.size >
                            0.9
                        ) {

                            spawnRock(
                                r.position.x -
                                0.35,
                                r.position.y,
                                Math.floor(
                                    r.userData.maxHp /
                                    2
                                ),
                                r.userData.size *
                                0.7
                            );

                            spawnRock(
                                r.position.x +
                                0.35,
                                r.position.y,
                                Math.floor(
                                    r.userData.maxHp /
                                    2
                                ),
                                r.userData.size *
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

            // ==================================
            // פגיעה בתותח
            // ==================================

            if (
                Math.hypot(
                    r.position.x -
                    cannonGroup.position.x,

                    r.position.y -
                    0.5
                ) <
                r.userData.size +
                0.6
            ) {

                playerHp -=
                    10;

                updateUI();

                if (
                    playerHp <=
                    0
                ) {

                    isGameOver =
                        true;

                    // שיא
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

                    // שמירת מטבעות
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
                magnetLvl >
                0
            ) {

                const distToPlayer =
                    Math.hypot(
                        c.position.x -
                        cannonGroup.position.x,

                        c.position.y -
                        0.5
                    );

                const magnetRadius =
                    2 +
                    magnetLvl *
                    1.5;

                if (
                    distToPlayer <
                    magnetRadius
                ) {

                    c.position.x +=
                        (
                            cannonGroup.position.x -
                            c.position.x
                        ) *
                        0.12;

                    c.position.y +=
                        (
                            0.5 -
                            c.position.y
                        ) *
                        0.12;

                } else {

                    c.position.y +=
                        c.userData.vy;
                }

            } else {

                c.position.y +=
                    c.userData.vy;
            }

            // סיבוב מטבע
            c.rotation.z +=
                0.05;

            // איסוף
            if (
                Math.hypot(
                    c.position.x -
                    cannonGroup.position.x,

                    c.position.y -
                    0.5
                ) <
                1.0
            ) {

                coins +=
                    5;

                playSound(
                    'coin'
                );

                scene.remove(
                    c
                );

                droppedCoins.splice(
                    cIdx,
                    1
                );

                updateUI();

            } else if (
                c.position.y <
                0.2
            ) {

                c.userData.vy =
                    0;
            }
        }

        // ==========================================
        // גל הבא
        //
        // חשוב:
        // LEVEL עולה כאן בלבד.
        // המפה נשארת אותה מפה.
        // ==========================================

        startNextWave();

        renderer.render(
            scene,
            camera
        );
    }

    // ==========================================
    // Resize
    // ==========================================

    window.addEventListener(
        'resize',
        updateCameraForDevice
    );

    // ==========================================
    // התחלה
    // ==========================================

    animate(0);
});