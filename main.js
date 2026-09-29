window.addEventListener('DOMContentLoaded', () => {

    'use strict';


    // =========================================================
    // BASIC HELPERS
    // =========================================================

    if (typeof THREE === 'undefined') {
        console.error('Three.js לא נטען.');
        return;
    }


    const $ = (id) => {
        return document.getElementById(id);
    };


    const clamp = (value, min, max) => {
        return Math.max(min, Math.min(max, value));
    };


    const rand = (min, max) => {
        return min + Math.random() * (max - min);
    };


    // =========================================================
    // SCENE
    // =========================================================

    const scene = new THREE.Scene();


    const camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        250
    );


    const renderer = new THREE.WebGLRenderer({
        antialias: window.innerWidth > 650,
        powerPreference: 'high-performance'
    });


    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio || 1,
            1.45
        )
    );


    renderer.setSize(
        window.innerWidth,
        window.innerHeight,
        false
    );


    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;


    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;


    renderer.toneMappingExposure =
        1.12;


    renderer.outputEncoding =
        THREE.sRGBEncoding;


    document.body.appendChild(
        renderer.domElement
    );


    let screenLimitX = 7.5;

    let cameraY = 8.6;

    let cameraZ = 19.5;


    function resize() {

        const aspect =
            window.innerWidth /
            Math.max(
                1,
                window.innerHeight
            );


        camera.aspect =
            aspect;


        if (aspect < 0.72) {

            screenLimitX = 4.35;

            cameraY = 12.4;

            cameraZ = 25.5;

        } else if (aspect < 1.0) {

            screenLimitX = 5.35;

            cameraY = 10.6;

            cameraZ = 22.7;

        } else {

            screenLimitX = 7.5;

            cameraY = 8.6;

            cameraZ = 19.5;
        }


        camera.position.set(
            0,
            cameraY,
            cameraZ
        );


        camera.lookAt(
            0,
            5.15,
            0
        );


        camera.updateProjectionMatrix();


        renderer.setSize(
            window.innerWidth,
            window.innerHeight,
            false
        );


        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio || 1,
                window.innerWidth < 650
                    ? 1.15
                    : 1.45
            )
        );
    }


    resize();


    window.addEventListener(
        'resize',
        resize,
        {
            passive: true
        }
    );


    // =========================================================
    // SUNSET SKY
    // =========================================================

    function createSkyTexture() {

        const canvas =
            document.createElement(
                'canvas'
            );


        canvas.width = 4;

        canvas.height = 768;


        const ctx =
            canvas.getContext('2d');


        const gradient =
            ctx.createLinearGradient(
                0,
                0,
                0,
                768
            );


        gradient.addColorStop(
            0.00,
            '#566574'
        );


        gradient.addColorStop(
            0.18,
            '#7d7b78'
        );


        gradient.addColorStop(
            0.38,
            '#a56c58'
        );


        gradient.addColorStop(
            0.56,
            '#e39b59'
        );


        gradient.addColorStop(
            0.74,
            '#f7bf5b'
        );


        gradient.addColorStop(
            1.00,
            '#f2d37e'
        );


        ctx.fillStyle =
            gradient;


        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        // Clouds / atmospheric bands.

        for (
            let i = 0;
            i < 11;
            i++
        ) {

            const y =
                105 +
                i * 51;


            const glow =
                ctx.createLinearGradient(
                    0,
                    y,
                    4,
                    y + 22
                );


            glow.addColorStop(
                0,
                'rgba(255,255,255,0)'
            );


            glow.addColorStop(
                0.45,
                'rgba(255,224,188,0.12)'
            );


            glow.addColorStop(
                0.7,
                'rgba(82,76,73,0.12)'
            );


            glow.addColorStop(
                1,
                'rgba(255,255,255,0)'
            );


            ctx.fillStyle =
                glow;


            ctx.fillRect(
                0,
                y,
                canvas.width,
                22
            );
        }


        return new THREE.CanvasTexture(
            canvas
        );
    }


    scene.background =
        createSkyTexture();


    scene.fog =
        new THREE.FogExp2(
            0xd68a57,
            0.0145
        );


    // =========================================================
    // LIGHTING
    // =========================================================

    scene.add(
        new THREE.HemisphereLight(
            0xffe9c7,
            0x27160e,
            0.86
        )
    );


    const sun =
        new THREE.DirectionalLight(
            0xfff0cb,
            1.75
        );


    sun.position.set(
        12,
        20,
        13
    );


    sun.castShadow =
        true;


    const shadowSize =
        window.innerWidth < 650
            ? 768
            : 1024;


    sun.shadow.mapSize.set(
        shadowSize,
        shadowSize
    );


    sun.shadow.camera.left =
        -20;


    sun.shadow.camera.right =
        20;


    sun.shadow.camera.top =
        24;


    sun.shadow.camera.bottom =
        -4;


    sun.shadow.camera.near =
        0.5;


    sun.shadow.camera.far =
        65;


    sun.shadow.bias =
        -0.0005;


    scene.add(sun);


    const skyFill =
        new THREE.DirectionalLight(
            0x8ddcff,
            0.32
        );


    skyFill.position.set(
        -12,
        8,
        7
    );


    scene.add(skyFill);


    const cannonLight =
        new THREE.PointLight(
            0x38bdf8,
            1.6,
            6,
            2
        );


    cannonLight.position.set(
        0,
        1.2,
        2
    );


    scene.add(cannonLight);


    const sunsetLight =
        new THREE.PointLight(
            0xffb45c,
            2.5,
            28,
            2
        );


    sunsetLight.position.set(
        0,
        7,
        -18
    );


    scene.add(
        sunsetLight
    );


    // =========================================================
    // WORLD
    // =========================================================

    const world =
        new THREE.Group();


    scene.add(
        world
    );


    // Sun disk.

    const sunDisc =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                2.6,
                24,
                16
            ),
            new THREE.MeshBasicMaterial({
                color: 0xffd65a,
                transparent: true,
                opacity: 0.95
            })
        );


    sunDisc.position.set(
        0,
        10.5,
        -25
    );


    world.add(
        sunDisc
    );


    // Sun glow.

    const sunGlow =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                4.8,
                20,
                14
            ),
            new THREE.MeshBasicMaterial({
                color: 0xffc56b,
                transparent: true,
                opacity: 0.09,
                depthWrite: false
            })
        );


    sunGlow.position.copy(
        sunDisc.position
    );


    world.add(
        sunGlow
    );


    // =========================================================
    // GROUND
    // =========================================================

    const ground =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                62,
                48
            ),
            new THREE.MeshStandardMaterial({
                color: 0x6e5a28,
                roughness: 1,
                metalness: 0,
                flatShading: true
            })
        );


    ground.rotation.x =
        -Math.PI / 2;


    ground.position.set(
        0,
        -0.28,
        -6
    );


    ground.receiveShadow =
        true;


    world.add(
        ground
    );


    // =========================================================
    // SOIL
    // =========================================================

    const soil =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                52,
                2.6,
                7
            ),
            new THREE.MeshStandardMaterial({
                color: 0x3b2415,
                roughness: 0.98,
                flatShading: true
            })
        );


    soil.position.set(
        0,
        -1.55,
        0.6
    );


    soil.receiveShadow =
        true;


    world.add(
        soil
    );


    // Grass top.

    const soilTop =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                52,
                0.55,
                7.05
            ),
            new THREE.MeshStandardMaterial({
                color: 0x456b18,
                roughness: 0.96,
                flatShading: true
            })
        );


    soilTop.position.set(
        0,
        -0.16,
        0.6
    );


    soilTop.receiveShadow =
        true;


    world.add(
        soilTop
    );


    // =========================================================
    // PYRAMIDS
    // =========================================================

    function addPyramid(
        x,
        y,
        z,
        scaleX,
        scaleY,
        scaleZ,
        color
    ) {

        const pyramid =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    1,
                    1,
                    4
                ),
                new THREE.MeshStandardMaterial({
                    color,
                    roughness: 0.9,
                    metalness: 0.02,
                    flatShading: true
                })
            );


        pyramid.position.set(
            x,
            y,
            z
        );


        pyramid.scale.set(
            scaleX,
            scaleY,
            scaleZ
        );


        pyramid.rotation.y =
            Math.PI / 4;


        pyramid.castShadow =
            true;


        pyramid.receiveShadow =
            true;


        world.add(
            pyramid
        );


        return pyramid;
    }


    // רחוק.

    addPyramid(
        -16,
        5.4,
        -18,
        7.6,
        11.4,
        7.6,
        0x8a4d2d
    );


    addPyramid(
        16,
        5.0,
        -19,
        7.2,
        10.5,
        7.2,
        0x7a452c
    );


    addPyramid(
        0,
        4.3,
        -23,
        6.5,
        8.5,
        6.5,
        0x70452f
    );


    // שכבה אמצעית.

    addPyramid(
        -10.5,
        3.8,
        -11,
        5.2,
        7.3,
        5.2,
        0x594234
    );


    addPyramid(
        10.5,
        3.6,
        -12,
        5.5,
        7.8,
        5.5,
        0x594234
    );


    addPyramid(
        0,
        2.8,
        -15.5,
        4.4,
        5.7,
        4.4,
        0x4e3c32
    );


    // סלעים כהים בחזית.

    addPyramid(
        -8.8,
        2.2,
        -5.8,
        3.55,
        4.6,
        3.0,
        0x302922
    );


    addPyramid(
        8.8,
        2.0,
        -5.7,
        3.65,
        4.4,
        3.0,
        0x2c2724
    );


    addPyramid(
        -14,
        1.7,
        -4,
        2.8,
        3.4,
        2.4,
        0x352923
    );


    addPyramid(
        14,
        1.6,
        -3.8,
        2.8,
        3.3,
        2.4,
        0x342721
    );


    // =========================================================
    // GREEN VALLEY
    // =========================================================

    const valley =
        new THREE.Mesh(
            new THREE.PlaneGeometry(
                13,
                7
            ),
            new THREE.MeshStandardMaterial({
                color: 0x4f751e,
                roughness: 1,
                flatShading: true
            })
        );


    valley.rotation.x =
        -Math.PI / 2;


    valley.position.set(
        0,
        0.03,
        -5
    );


    world.add(
        valley
    );


    // =========================================================
    // GRASS
    // =========================================================

    const grassMaterial =
        new THREE.MeshStandardMaterial({
            color: 0x4d7c18,
            roughness: 1,
            flatShading: true
        });


    for (
        let i = 0;
        i < 75;
        i++
    ) {

        const blade =
            new THREE.Mesh(
                new THREE.ConeGeometry(
                    0.06,
                    rand(0.18, 0.38),
                    3
                ),
                grassMaterial
            );


        blade.position.set(
            rand(-18, 18),
            0.13,
            rand(-1.4, 1.8)
        );


        blade.rotation.y =
            rand(0, Math.PI);


        world.add(
            blade
        );
    }


    // =========================================================
    // ARENA
    // =========================================================

    const arena =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                5.6,
                6.2,
                0.36,
                56
            ),
            new THREE.MeshStandardMaterial({
                color: 0x26313a,
                roughness: 0.52,
                metalness: 0.28,
                flatShading: true
            })
        );


    arena.position.set(
        0,
        0.16,
        1.05
    );


    arena.scale.z =
        0.69;


    arena.castShadow =
        true;


    arena.receiveShadow =
        true;


    world.add(
        arena
    );


    const arenaInner =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                5.0,
                5.25,
                0.13,
                56
            ),
            new THREE.MeshStandardMaterial({
                color: 0x10202a,
                roughness: 0.7,
                metalness: 0.18
            })
        );


    arenaInner.position.set(
        0,
        0.39,
        1.05
    );


    arenaInner.scale.z =
        0.69;


    world.add(
        arenaInner
    );


    const ringMaterial =
        new THREE.MeshBasicMaterial({
            color: 0x38bdf8,
            transparent: true,
            opacity: 0.72
        });


    for (
        let i = 0;
        i < 2;
        i++
    ) {

        const ring =
            new THREE.Mesh(
                new THREE.TorusGeometry(
                    3.7 + i * 0.72,
                    i === 0
                        ? 0.05
                        : 0.028,
                    8,
                    48
                ),
                ringMaterial
            );


        ring.rotation.x =
            Math.PI / 2;


        ring.position.set(
            0,
            0.44 + i * 0.015,
            1.05
        );


        ring.scale.z =
            0.69;


        world.add(
            ring
        );
    }


    // =========================================================
    // CANNON
    // =========================================================

    const cannon =
        new THREE.Group();


    cannon.position.set(
        0,
        0,
        1
    );


    scene.add(
        cannon
    );


    const metalDark =
        new THREE.MeshStandardMaterial({
            color: 0x101820,
            roughness: 0.28,
            metalness: 0.86
        });


    const metalBlue =
        new THREE.MeshStandardMaterial({
            color: 0x0d628f,
            roughness: 0.25,
            metalness: 0.6
        });


    const cyanMetal =
        new THREE.MeshStandardMaterial({
            color: 0x39a7cd,
            emissive: 0x063f52,
            emissiveIntensity: 0.72,
            roughness: 0.2,
            metalness: 0.48
        });


    const base =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                2.55,
                0.55,
                1.9
            ),
            metalDark
        );


    base.position.y =
        0.34;


    base.castShadow =
        true;


    cannon.add(
        base
    );


    const top =
        new THREE.Mesh(
            new THREE.BoxGeometry(
                2.18,
                0.15,
                2.03
            ),
            metalBlue
        );


    top.position.y =
        0.63;


    top.castShadow =
        true;


    cannon.add(
        top
    );


    const dome =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.9,
                24,
                16,
                0,
                Math.PI * 2,
                0,
                Math.PI / 2
            ),

            new THREE.MeshStandardMaterial({
                color: 0x0c87bf,
                emissive: 0x06415b,
                emissiveIntensity: 0.6,
                transparent: true,
                opacity: 0.94,
                roughness: 0.16,
                metalness: 0.35
            })
        );


    dome.position.y =
        0.69;


    dome.castShadow =
        true;


    cannon.add(
        dome
    );


    const cannonRing =
        new THREE.Mesh(
            new THREE.TorusGeometry(
                0.91,
                0.055,
                8,
                24
            ),
            cyanMetal
        );


    cannonRing.rotation.x =
        Math.PI / 2;


    cannonRing.position.y =
        0.69;


    cannon.add(
        cannonRing
    );


    const wheelGeometry =
        new THREE.CylinderGeometry(
            0.39,
            0.39,
            0.22,
            18
        );


    const wheels = [];


    for (
        const z of [
            -0.72,
            0.72
        ]
    ) {

        const wheel =
            new THREE.Mesh(
                wheelGeometry,
                metalDark
            );


        wheel.rotation.z =
            Math.PI / 2;


        wheel.position.set(
            0,
            0.29,
            z
        );


        wheel.castShadow =
            true;


        cannon.add(
            wheel
        );


        wheels.push(
            wheel
        );
    }


    const barrelAssembly =
        new THREE.Group();


    barrelAssembly.position.y =
        0.75;


    cannon.add(
        barrelAssembly
    );


    const barrelGeometry =
        new THREE.CylinderGeometry(
            0.16,
            0.22,
            1.42,
            16
        );


    const muzzleGeometry =
        new THREE.CylinderGeometry(
            0.2,
            0.2,
            0.22,
            16
        );


    const muzzleFlashes = [];


    for (
        const x of [
            -0.4,
            0.4
        ]
    ) {

        const barrel =
            new THREE.Mesh(
                barrelGeometry,
                metalDark
            );


        barrel.position.set(
            x,
            0.85,
            0.03
        );


        barrel.castShadow =
            true;


        barrelAssembly.add(
            barrel
        );


        const muzzle =
            new THREE.Mesh(
                muzzleGeometry,
                metalBlue
            );


        muzzle.position.set(
            x,
            1.66,
            0.03
        );


        muzzle.castShadow =
            true;


        barrelAssembly.add(
            muzzle
        );


        const flash =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.34,
                    10,
                    8
                ),

                new THREE.MeshBasicMaterial({
                    color: 0xfff0a8,
                    transparent: true,
                    opacity: 0,
                    depthWrite: false
                })
            );


        flash.position.set(
            x,
            1.83,
            0.03
        );


        flash.visible =
            false;


        barrelAssembly.add(
            flash
        );


        muzzleFlashes.push(
            flash
        );
    }


    const core =
        new THREE.Mesh(
            new THREE.SphereGeometry(
                0.14,
                12,
                12
            ),

            new THREE.MeshBasicMaterial({
                color: 0x9ff3ff
            })
        );


    core.position.set(
        0,
        0.94,
        0.73
    );


    cannon.add(
        core
    );


    const cannonGlow =
        new THREE.PointLight(
            0x2dd4ff,
            2.4,
            7,
            2
        );


    cannonGlow.position.set(
        0,
        1,
        1.5
    );


    cannon.add(
        cannonGlow
    );


    // =========================================================
    // UI
    // =========================================================

    const ui = {

        score:
            $('score-val'),

        coins:
            $('coins-val'),

        level:
            $('level-text'),

        hpText:
            $('hp-text'),

        hpBar:
            $('hp-bar'),

        start:
            $('splash-screen'),

        startBtn:
            $('start-btn'),

        startCoins:
            $('start-coins'),

        best:
            $('start-best-score'),

        powerBtn:
            $('buy-power-btn'),

        rateBtn:
            $('buy-rate-btn'),

        magnetBtn:
            $('buy-magnet-btn'),

        powerLvl:
            $('power-lvl-text'),

        rateLvl:
            $('rate-lvl-text'),

        magnetLvl:
            $('magnet-lvl-text'),

        combat:
            $('combat-ui'),

        wave:
            $('wave-badge'),

        combo:
            $('combo-badge'),

        pauseBtn:
            $('pause-btn'),

        pauseScreen:
            $('pause-screen'),

        resumeBtn:
            $('resume-btn'),

        over:
            $('game-over-screen'),

        restart:
            $('restart-btn'),

        finalScore:
            $('final-score'),

        finalLevel:
            $('final-level'),

        finalCoins:
            $('final-coins'),

        damageFlash:
            $('damage-flash')
    };


    // =========================================================
    // GAME DATA
    // =========================================================

    let score = 0;


    let coins =
        parseInt(
            localStorage.getItem(
                'bb3d_coins'
            ) || '0',
            10
        ) || 0;


    let bestScore =
        parseInt(
            localStorage.getItem(
                'bb3d_best'
            ) || '0',
            10
        ) || 0;


    let level = 1;


    let hp = 1000;


    let powerLevel =
        parseInt(
            localStorage.getItem(
                'bb3d_upg_power'
            ) || '1',
            10
        ) || 1;


    let rateLevel =
        parseInt(
            localStorage.getItem(
                'bb3d_upg_rate'
            ) || '1',
            10
        ) || 1;


    let magnetLevel =
        parseInt(
            localStorage.getItem(
                'bb3d_upg_magnet'
            ) || '0',
            10
        ) || 0;


    let power =
        powerLevel;


    let fireRate =
        1 +
        (
            rateLevel - 1
        ) *
        0.25;


    let started = false;

    let paused = false;

    let gameOver = false;


    let targetX = 0;

    let lastShot = 0;

    let waveTimer = 0;

    let combo = 0;

    let comboTimer = 0;

    let recoil = 0;

    let shake = 0;

    let elapsed = 0;


    const bullets = [];

    const rocks = [];

    const droppedCoins = [];


    // =========================================================
    // SAVE / UI
    // =========================================================

    function save() {

        localStorage.setItem(
            'bb3d_coins',
            String(coins)
        );


        localStorage.setItem(
            'bb3d_best',
            String(bestScore)
        );


        localStorage.setItem(
            'bb3d_upg_power',
            String(powerLevel)
        );


        localStorage.setItem(
            'bb3d_upg_rate',
            String(rateLevel)
        );


        localStorage.setItem(
            'bb3d_upg_magnet',
            String(magnetLevel)
        );
    }


    function updateUI() {

        ui.score.textContent =
            score;


        ui.coins.textContent =
            coins;


        ui.level.textContent =
            level;


        ui.hpText.textContent =
            `${Math.max(
                0,
                Math.ceil(hp)
            )} / 1000`;


        ui.hpBar.style.width =
            `${clamp(
                hp / 10,
                0,
                100
            )}%`;


        ui.startCoins.textContent =
            coins;


        ui.best.textContent =
            bestScore;


        ui.powerLvl.textContent =
            `Lvl ${powerLevel}`;


        ui.rateLvl.textContent =
            `Lvl ${rateLevel}`;


        ui.magnetLvl.textContent =
            `Lvl ${magnetLevel}`;


        ui.powerBtn.textContent =
            `${powerLevel * 50} C`;


        ui.rateBtn.textContent =
            `${rateLevel * 60} C`;


        ui.magnetBtn.textContent =
            `${(magnetLevel + 1) * 100} C`;


        ui.powerBtn.disabled =
            coins <
            powerLevel * 50;


        ui.rateBtn.disabled =
            coins <
            rateLevel * 60;


        ui.magnetBtn.disabled =
            coins <
            (magnetLevel + 1) * 100;


        ui.wave.textContent =
            `WAVE ${level}`;


        ui.combo.textContent =
            `COMBO x${Math.max(
                1,
                combo
            )}`;
    }


    updateUI();


    // =========================================================
    // SOUND
    // =========================================================

    let audioContext = null;


    function playSound(type) {

        const AudioClass =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioClass) {
            return;
        }


        if (!audioContext) {

            try {

                audioContext =
                    new AudioClass();

            } catch (error) {

                return;
            }
        }


        if (
            audioContext.state ===
            'suspended'
        ) {

            audioContext.resume();
        }


        const oscillator =
            audioContext.createOscillator();


        const gain =
            audioContext.createGain();


        const now =
            audioContext.currentTime;


        oscillator.connect(
            gain
        );


        gain.connect(
            audioContext.destination
        );


        if (
            type ===
            'shoot'
        ) {

            oscillator.type =
                'sawtooth';


            oscillator.frequency.setValueAtTime(
                360,
                now
            );


            oscillator.frequency.exponentialRampToValueAtTime(
                95,
                now + 0.08
            );


            gain.gain.setValueAtTime(
                0.045,
                now
            );


            gain.gain.exponentialRampToValueAtTime(
                0.001,
                now + 0.09
            );


            oscillator.start(
                now
            );


            oscillator.stop(
                now + 0.09
            );

        } else if (
            type ===
            'hit'
        ) {

            oscillator.type =
                'triangle';


            oscillator.frequency.setValueAtTime(
                160,
                now
            );


            oscillator.frequency.exponentialRampToValueAtTime(
                42,
                now + 0.09
            );


            gain.gain.setValueAtTime(
                0.065,
                now
            );


            gain.gain.exponentialRampToValueAtTime(
                0.001,
                now + 0.1
            );


            oscillator.start(
                now
            );


            oscillator.stop(
                now + 0.1
            );

        } else if (
            type ===
            'coin'
        ) {

            oscillator.type =
                'sine';


            oscillator.frequency.setValueAtTime(
                900,
                now
            );


            oscillator.frequency.setValueAtTime(
                1320,
                now + 0.055
            );


            gain.gain.setValueAtTime(
                0.06,
                now
            );


            gain.gain.exponentialRampToValueAtTime(
                0.001,
                now + 0.15
            );


            oscillator.start(
                now
            );


            oscillator.stop(
                now + 0.15
            );

        } else if (
            type ===
            'level'
        ) {

            oscillator.type =
                'sine';


            oscillator.frequency.setValueAtTime(
                520,
                now
            );


            oscillator.frequency.setValueAtTime(
                780,
                now + 0.07
            );


            oscillator.frequency.setValueAtTime(
                1040,
                now + 0.14
            );


            gain.gain.setValueAtTime(
                0.05,
                now
            );


            gain.gain.exponentialRampToValueAtTime(
                0.001,
                now + 0.28
            );


            oscillator.start(
                now
            );


            oscillator.stop(
                now + 0.28
            );
        }
    }


    // =========================================================
    // BULLETS
    // =========================================================

    const bulletCoreGeometry =
        new THREE.SphereGeometry(
            0.17,
            10,
            10
        );


    const bulletCoreMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xffeea3
        });


    const bulletGlowGeometry =
        new THREE.SphereGeometry(
            0.3,
            8,
            8
        );


    const bulletGlowMaterial =
        new THREE.MeshBasicMaterial({
            color: 0xffb54a,
            transparent: true,
            opacity: 0.28,
            depthWrite: false
        });


    function spawnBullet(x) {

        const group =
            new THREE.Group();


        const coreMesh =
            new THREE.Mesh(
                bulletCoreGeometry,
                bulletCoreMaterial
            );


        const glowMesh =
            new THREE.Mesh(
                bulletGlowGeometry,
                bulletGlowMaterial
            );


        group.add(
            coreMesh
        );


        group.add(
            glowMesh
        );


        // Fire trail.

        for (
            let i = 0;
            i < 3;
            i++
        ) {

            const trail =
                new THREE.Mesh(
                    new THREE.SphereGeometry(
                        0.13 -
                        i * 0.025,
                        8,
                        8
                    ),

                    new THREE.MeshBasicMaterial({
                        color: 0xffd27a,
                        transparent: true,
                        opacity:
                            0.18 -
                            i * 0.045,
                        depthWrite: false
                    })
                );


            trail.position.y =
                -(i + 1) *
                0.22;


            group.add(
                trail
            );
        }


        group.position.set(
            x,
            2.28,
            1.42
        );


        group.userData.life =
            2.2;


        scene.add(
            group
        );


        bullets.push(
            group
        );
    }


    function removeBullet(index) {

        const bullet =
            bullets[index];


        if (!bullet) {
            return;
        }


        scene.remove(
            bullet
        );


        for (
            let i = 2;
            i < bullet.children.length;
            i++
        ) {

            bullet.children[i]
                .material
                .dispose();
        }


        bullets.splice(
            index,
            1
        );
    }


    // =========================================================
    // ROCKS
    // =========================================================

    const rockGeometry =
        new THREE.IcosahedronGeometry(
            1,
            1
        );


    const rockPositions =
        rockGeometry.attributes.position;


    for (
        let i = 0;
        i < rockPositions.count;
        i++
    ) {

        const factor =
            0.78 +
            (
                (i * 7) % 13
            ) /
            30;


        rockPositions.setXYZ(
            i,

            rockPositions.getX(i) *
            factor,

            rockPositions.getY(i) *
            (
                0.86 +
                (i % 5) / 25
            ),

            rockPositions.getZ(i) *
            factor
        );
    }


    rockPositions.needsUpdate =
        true;


    rockGeometry.computeVertexNormals();


    const rockMaterials = [

        new THREE.MeshStandardMaterial({
            color: 0x6b6256,
            roughness: 0.9,
            flatShading: true
        }),

        new THREE.MeshStandardMaterial({
            color: 0x73513c,
            roughness: 0.93,
            flatShading: true
        }),

        new THREE.MeshStandardMaterial({
            color: 0x4c5961,
            roughness: 0.82,
            metalness: 0.04,
            flatShading: true
        })
    ];


    const hpTextureCache =
        new Map();


    function getHpTexture(value) {

        const text =
            String(
                Math.max(
                    0,
                    Math.ceil(value)
                )
            );


        if (
            hpTextureCache.has(text)
        ) {

            return hpTextureCache.get(
                text
            );
        }


        const canvas =
            document.createElement(
                'canvas'
            );


        canvas.width =
            128;


        canvas.height =
            64;


        const ctx =
            canvas.getContext(
                '2d'
            );


        ctx.font =
            '900 40px Rubik, Arial';


        ctx.textAlign =
            'center';


        ctx.textBaseline =
            'middle';


        ctx.shadowColor =
            'rgba(0, 0, 0, 0.85)';


        ctx.shadowBlur =
            8;


        ctx.fillStyle =
            '#ffffff';


        ctx.fillText(
            text,
            64,
            32
        );


        const texture =
            new THREE.CanvasTexture(
                canvas
            );


        texture.minFilter =
            THREE.LinearFilter;


        texture.magFilter =
            THREE.LinearFilter;


        texture.encoding =
            THREE.sRGBEncoding;


        hpTextureCache.set(
            text,
            texture
        );


        return texture;
    }


    function spawnRock(
        x,
        y,
        hpValue,
        size,
        materialIndex = 0
    ) {

        const rock =
            new THREE.Mesh(
                rockGeometry,

                rockMaterials[
                    materialIndex %
                    rockMaterials.length
                ]
            );


        rock.position.set(
            x,
            y,
            rand(0.72, 1.0)
        );


        rock.scale.set(
            size,
            size * 1.12,
            size
        );


        rock.rotation.set(
            rand(-1, 1),
            rand(0, Math.PI * 2),
            rand(-1, 1)
        );


        rock.castShadow =
            true;


        rock.receiveShadow =
            true;


        const label =
            new THREE.Sprite(
                new THREE.SpriteMaterial({
                    map:
                        getHpTexture(
                            hpValue
                        ),

                    transparent: true,

                    depthWrite: false
                })
            );


        label.scale.set(
            1.35 * size,
            0.68 * size,
            1
        );


        label.position.z =
            0.86 * size;


        rock.add(
            label
        );


        rock.userData = {

            hp:
                hpValue,

            maxHp:
                hpValue,

            size:
                size,

            vx:
                rand(
                    -1.35,
                    1.35
                ),

            vy:
                rand(
                    -1.4,
                    -0.2
                ),

            coolDown:
                0,

            rotX:
                rand(
                    -1.35,
                    1.35
                ),

            rotY:
                rand(
                    -1.25,
                    1.25
                ),

            label:
                label
        };


        scene.add(
            rock
        );


        rocks.push(
            rock
        );
    }


    function removeRock(index) {

        const rock =
            rocks[index];


        if (!rock) {
            return;
        }


        scene.remove(
            rock
        );


        rocks.splice(
            index,
            1
        );
    }


    // =========================================================
    // COINS
    // =========================================================

    const coinMaterial =
        new THREE.MeshStandardMaterial({
            color: 0xf2b90f,
            emissive: 0x6f4400,
            emissiveIntensity: 0.18,
            metalness: 0.88,
            roughness: 0.17
        });


    const coinGeometry =
        new THREE.CylinderGeometry(
            0.29,
            0.29,
            0.10,
            16
        );


    function spawnCoin(
        x,
        y
    ) {

        const coin =
            new THREE.Mesh(
                coinGeometry,
                coinMaterial
            );


        coin.rotation.x =
            Math.PI / 2;


        coin.position.set(
            x,
            y,
            1
        );


        coin.castShadow =
            true;


        coin.userData = {

            vy:
                rand(
                    1.3,
                    2.2
                ),

            spin:
                rand(
                    4.5,
                    6.5
                )
        };


        const glow =
            new THREE.PointLight(
                0xffc928,
                0.7,
                2.8,
                2
            );


        glow.position.set(
            0,
            0,
            0.18
        );


        coin.add(
            glow
        );


        scene.add(
            coin
        );


        droppedCoins.push(
            coin
        );
    }


    // =========================================================
    // PARTICLES
    // =========================================================

    const PARTICLES =
        180;


    const particlePosition =
        new Float32Array(
            PARTICLES * 3
        );


    const particleVelocityX =
        new Float32Array(
            PARTICLES
        );


    const particleVelocityY =
        new Float32Array(
            PARTICLES
        );


    const particleVelocityZ =
        new Float32Array(
            PARTICLES
        );


    const particleLife =
        new Float32Array(
            PARTICLES
        );


    const particleGeometry =
        new THREE.BufferGeometry();


    particleGeometry.setAttribute(
        'position',

        new THREE.BufferAttribute(
            particlePosition,
            3
        )
    );


    const particleSystem =
        new THREE.Points(
            particleGeometry,

            new THREE.PointsMaterial({
                color: 0xffcc73,
                size: 0.13,
                transparent: true,
                opacity: 0.92,
                depthWrite: false
            })
        );


    scene.add(
        particleSystem
    );


    function burst(
        x,
        y,
        amount = 12
    ) {

        for (
            let i = 0;
            i < amount;
            i++
        ) {

            let index =
                -1;


            for (
                let p = 0;
                p < PARTICLES;
                p++
            ) {

                if (
                    particleLife[p] <=
                    0
                ) {

                    index =
                        p;

                    break;
                }
            }


            if (
                index < 0
            ) {

                break;
            }


            const angle =
                Math.random() *
                Math.PI *
                2;


            const speed =
                rand(
                    1.6,
                    5.2
                );


            particlePosition[
                index * 3
            ] = x;


            particlePosition[
                index * 3 + 1
            ] = y;


            particlePosition[
                index * 3 + 2
            ] = 1;


            particleVelocityX[index] =
                Math.cos(angle) *
                speed;


            particleVelocityY[index] =
                rand(
                    1.5,
                    4.5
                );


            particleVelocityZ[index] =
                Math.sin(angle) *
                speed *
                0.22;


            particleLife[index] =
                rand(
                    0.22,
                    0.58
                );
        }


        particleGeometry.attributes
            .position
            .needsUpdate = true;
    }


    // =========================================================
    // SHOCKWAVES
    // =========================================================

    const shockwaves = [];


    for (
        let i = 0;
        i < 8;
        i++
    ) {

        const shock =
            new THREE.Mesh(

                new THREE.TorusGeometry(
                    0.48,
                    0.045,
                    8,
                    28
                ),

                new THREE.MeshBasicMaterial({
                    color: 0xffd166,
                    transparent: true,
                    opacity: 0,
                    depthWrite: false
                })
            );


        shock.rotation.x =
            Math.PI / 2;


        shock.visible =
            false;


        shock.userData = {

            life:
                0,

            maxLife:
                0.28
        };


        scene.add(
            shock
        );


        shockwaves.push(
            shock
        );
    }


    function createShockwave(
        x,
        y,
        scale = 1
    ) {

        const shock =
            shockwaves.find(
                (item) =>
                    !item.visible
            );


        if (!shock) {
            return;
        }


        shock.visible =
            true;


        shock.position.set(
            x,
            y,
            1
        );


        shock.scale.setScalar(
            0.18 * scale
        );


        shock.material.opacity =
            0.85;


        shock.userData.life =
            shock.userData.maxLife;


        shock.userData.scale =
            scale;
    }


    function updateParticles(
        dt
    ) {

        for (
            let i = 0;
            i < PARTICLES;
            i++
        ) {

            if (
                particleLife[i] <=
                0
            ) {

                continue;
            }


            particleLife[i] -=
                dt;


            particlePosition[
                i * 3
            ] +=
                particleVelocityX[i] *
                dt;


            particlePosition[
                i * 3 + 1
            ] +=
                particleVelocityY[i] *
                dt;


            particlePosition[
                i * 3 + 2
            ] +=
                particleVelocityZ[i] *
                dt;


            particleVelocityY[i] -=
                8.5 * dt;
        }


        particleGeometry.attributes
            .position
            .needsUpdate = true;


        for (
            const shock of
            shockwaves
        ) {

            if (!shock.visible) {
                continue;
            }


            shock.userData.life -=
                dt;


            const progress =
                1 -
                shock.userData.life /
                shock.userData.maxLife;


            shock.scale.setScalar(
                (
                    0.18 +
                    progress * 3.2
                ) *
                shock.userData.scale
            );


            shock.material.opacity =
                0.85 *
                (
                    1 - progress
                );


            if (
                shock.userData.life <=
                0
            ) {

                shock.visible =
                    false;

                shock.material.opacity =
                    0;
            }
        }
    }


    // =========================================================
    // GAME FLOW
    // =========================================================

    function clearObjects() {

        while (
            bullets.length
        ) {

            removeBullet(
                0
            );
        }


        while (
            rocks.length
        ) {

            removeRock(
                0
            );
        }


        while (
            droppedCoins.length
        ) {

            const coin =
                droppedCoins.pop();


            scene.remove(
                coin
            );
        }


        particleLife.fill(
            0
        );


        for (
            const shock of
            shockwaves
        ) {

            shock.visible =
                false;

            shock.material.opacity =
                0;
        }
    }


    function spawnWave() {

        const count =
            Math.min(
                3 +
                Math.floor(
                    (level - 1) *
                    0.55
                ),
                7
            );


        const baseHp =
            18 +
            level * 8;


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const size =
                rand(
                    0.82,
                    1.18
                ) +
                Math.min(
                    0.28,
                    level *
                    0.018
                );


            const hpValue =
                Math.floor(
                    baseHp *
                    size *
                    rand(
                        0.86,
                        1.15
                    )
                );


            spawnRock(

                rand(
                    -screenLimitX *
                    0.86,

                    screenLimitX *
                    0.86
                ),

                11.8 +
                i *
                rand(
                    1.35,
                    2
                ),

                hpValue,

                size,

                i % 3
            );
        }


        // Boss rock every 5th level.

        if (
            level % 5 ===
            0
        ) {

            spawnRock(

                rand(
                    -1.4,
                    1.4
                ),

                15,

                Math.floor(
                    baseHp *
                    2.7
                ),

                1.45,

                2
            );
        }


        waveTimer =
            0;


        playSound(
            'level'
        );


        updateUI();
    }


    function startGame() {

        clearObjects();


        started =
            true;


        paused =
            false;


        gameOver =
            false;


        score =
            0;


        level =
            1;


        hp =
            1000;


        combo =
            0;


        comboTimer =
            0;


        waveTimer =
            0;


        targetX =
            0;


        cannon.position.x =
            0;


        ui.start.classList.add(
            'hidden'
        );


        ui.pauseScreen.classList.add(
            'hidden'
        );


        ui.over.classList.add(
            'hidden'
        );


        ui.pauseBtn.classList.remove(
            'hidden'
        );


        ui.combat.classList.remove(
            'hidden'
        );


        updateUI();


        spawnWave();
    }


    function endGame() {

        gameOver =
            true;


        paused =
            false;


        if (
            score >
            bestScore
        ) {

            bestScore =
                score;
        }


        save();


        ui.finalScore.textContent =
            score;


        ui.finalLevel.textContent =
            level;


        ui.finalCoins.textContent =
            coins;


        ui.pauseBtn.classList.add(
            'hidden'
        );


        ui.combat.classList.add(
            'hidden'
        );


        ui.over.classList.remove(
            'hidden'
        );


        updateUI();
    }


    // =========================================================
    // BUTTONS
    // =========================================================

    ui.startBtn.addEventListener(
        'click',
        startGame
    );


    ui.restart.addEventListener(
        'click',
        startGame
    );


    function togglePause() {

        if (
            !started ||
            gameOver
        ) {

            return;
        }


        paused =
            !paused;


        ui.pauseScreen.classList.toggle(
            'hidden',
            !paused
        );


        ui.pauseBtn.classList.toggle(
            'hidden',
            paused
        );
    }


    ui.pauseBtn.addEventListener(
        'click',
        togglePause
    );


    ui.resumeBtn.addEventListener(
        'click',
        togglePause
    );


    // =========================================================
    // UPGRADES
    // =========================================================

    ui.powerBtn.addEventListener(
        'click',
        () => {

            const cost =
                powerLevel *
                50;


            if (
                coins <
                cost
            ) {

                return;
            }


            coins -=
                cost;


            powerLevel +=
                1;


            power =
                powerLevel;


            save();


            updateUI();
        }
    );


    ui.rateBtn.addEventListener(
        'click',
        () => {

            const cost =
                rateLevel *
                60;


            if (
                coins <
                cost
            ) {

                return;
            }


            coins -=
                cost;


            rateLevel +=
                1;


            fireRate =
                1 +
                (
                    rateLevel - 1
                ) *
                0.25;


            save();


            updateUI();
        }
    );


    ui.magnetBtn.addEventListener(
        'click',
        () => {

            const cost =
                (
                    magnetLevel +
                    1
                ) *
                100;


            if (
                coins <
                cost
            ) {

                return;
            }


            coins -=
                cost;


            magnetLevel +=
                1;


            save();


            updateUI();
        }
    );


    // =========================================================
    // INPUT
    // =========================================================

    let dragging =
        false;


    function setTargetX(
        clientX
    ) {

        const normalized =
            clientX /
            Math.max(
                1,
                window.innerWidth
            ) *
            2 -
            1;


        targetX =
            clamp(
                normalized *
                screenLimitX *
                1.12,

                -screenLimitX,

                screenLimitX
            );
    }


    renderer.domElement.addEventListener(
        'pointerdown',
        (event) => {

            if (
                !started ||
                paused ||
                gameOver
            ) {

                return;
            }


            dragging =
                true;


            renderer.domElement
                .setPointerCapture?.(
                    event.pointerId
                );


            setTargetX(
                event.clientX
            );
        }
    );


    renderer.domElement.addEventListener(
        'pointermove',
        (event) => {

            if (
                dragging
            ) {

                setTargetX(
                    event.clientX
                );
            }
        }
    );


    renderer.domElement.addEventListener(
        'pointerup',
        () => {

            dragging =
                false;
        }
    );


    renderer.domElement.addEventListener(
        'pointercancel',
        () => {

            dragging =
                false;
        }
    );


    window.addEventListener(
        'keydown',
        (event) => {

            if (
                event.code ===
                    'KeyP' ||

                event.code ===
                    'Escape'
            ) {

                event.preventDefault();

                togglePause();
            }
        }
    );


    document.addEventListener(
        'contextmenu',
        (event) => {

            event.preventDefault();
        }
    );


    // =========================================================
    // SHOOTING
    // =========================================================

    function fire() {

        spawnBullet(
            cannon.position.x -
            0.4
        );


        spawnBullet(
            cannon.position.x +
            0.4
        );


        for (
            const flash of
            muzzleFlashes
        ) {

            flash.visible =
                true;


            flash.material.opacity =
                0.95;


            flash.scale.setScalar(
                rand(
                    0.85,
                    1.2
                )
            );
        }


        recoil =
            0.16;


        cannonGlow.intensity =
            4.5;


        shake =
            Math.min(
                0.24,
                shake +
                0.025
            );


        burst(
            cannon.position.x,
            2,
            4
        );


        playSound(
            'shoot'
        );
    }


    // =========================================================
    // PLAYER DAMAGE
    // =========================================================

    function damagePlayer(
        amount
    ) {

        hp -=
            amount;


        combo =
            0;


        comboTimer =
            0;


        shake =
            Math.min(
                0.5,
                shake +
                0.18
            );


        ui.damageFlash.style.opacity =
            '0.52';


        window.setTimeout(
            () => {

                ui.damageFlash.style.opacity =
                    '0';

            },
            85
        );


        playSound(
            'hit'
        );


        updateUI();


        if (
            hp <=
            0
        ) {

            endGame();
        }
    }


    // =========================================================
    // MAIN UPDATE
    // =========================================================

    function update(
        dt,
        time
    ) {

        // Cannon movement.

        cannon.position.x += (

            targetX -
            cannon.position.x

        ) *
        Math.min(
            1,
            dt * 14
        );


        // Cannon animation.

        recoil =
            Math.max(
                0,
                recoil -
                dt * 3.3
            );


        barrelAssembly.position.y =
            0.75 -
            recoil;


        cannonRing.rotation.z +=
            dt * 0.35;


        cannonGlow.intensity += (

            1.7 -
            cannonGlow.intensity

        ) *
        Math.min(
            1,
            dt * 9
        );


        for (
            const flash of
            muzzleFlashes
        ) {

            if (
                !flash.visible
            ) {

                continue;
            }


            flash.material.opacity -=
                dt * 16;


            flash.scale.multiplyScalar(
                0.88
            );


            if (
                flash.material.opacity <=
                0
            ) {

                flash.material.opacity =
                    0;


                flash.visible =
                    false;
            }
        }


        // Automatic fire.

        if (
            time -
            lastShot >=
            1000 /
            (fireRate * 4)
        ) {

            fire();


            lastShot =
                time;
        }


        // =====================================================
        // BULLETS
        // =====================================================

        for (
            let i =
                bullets.length - 1;

            i >= 0;

            i--
        ) {

            const bullet =
                bullets[i];


            bullet.position.y +=
                24 * dt;


            bullet.userData.life -=
                dt;


            if (
                bullet.userData.life <=
                0 ||
                bullet.position.y >
                25
            ) {

                removeBullet(
                    i
                );

                continue;
            }


            const pulse =
                1 +
                Math.sin(
                    elapsed * 24 +
                    i
                ) *
                0.12;


            bullet.children[1]
                .scale.setScalar(
                    pulse
                );
        }


        // =====================================================
        // ROCKS
        // =====================================================

        for (
            let r =
                rocks.length - 1;

            r >= 0;

            r--
        ) {

            const rock =
                rocks[r];


            const data =
                rock.userData;


            data.coolDown =
                Math.max(
                    0,
                    data.coolDown -
                    dt
                );


            data.vy -=
                (
                    16 +
                    level *
                    0.08
                ) *
                dt;


            rock.position.x +=
                data.vx *
                dt;


            rock.position.y +=
                data.vy *
                dt;


            rock.rotation.x +=
                data.rotX *
                dt;


            rock.rotation.y +=
                data.rotY *
                dt;


            // Bounce.

            if (
                rock.position.y -
                data.size <
                0.48
            ) {

                rock.position.y =
                    0.48 +
                    data.size;


                data.vy =
                    Math.max(

                        4.2 +
                        Math.min(
                            1.2,
                            level * 0.04
                        ),

                        Math.abs(
                            data.vy
                        ) *
                        0.68
                    );


                data.vx *=
                    0.97;
            }


            // Side walls.

            if (
                Math.abs(
                    rock.position.x
                ) >
                screenLimitX
            ) {

                rock.position.x =
                    Math.sign(
                        rock.position.x
                    ) *
                    screenLimitX;


                data.vx *=
                    -1;
            }


            // =================================================
            // BULLET COLLISION
            // =================================================

            for (
                let b =
                    bullets.length - 1;

                b >= 0;

                b--
            ) {

                const bullet =
                    bullets[b];


                const dx =
                    bullet.position.x -
                    rock.position.x;


                const dy =
                    bullet.position.y -
                    rock.position.y;


                const radius =
                    data.size *
                    0.88;


                if (
                    dx * dx +
                    dy * dy >
                    radius *
                    radius
                ) {

                    continue;
                }


                // Remove bullet.

                removeBullet(
                    b
                );


                // Damage.

                data.hp -=
                    power;


                combo =
                    Math.min(
                        50,
                        combo + 1
                    );


                comboTimer =
                    1.15;


                score +=
                    power *
                    Math.max(
                        1,
                        combo
                    );


                shake =
                    Math.min(
                        0.28,
                        shake +
                        0.04
                    );


                burst(
                    bullet.position.x,
                    bullet.position.y,
                    5
                );


                createShockwave(
                    bullet.position.x,
                    bullet.position.y,
                    0.55
                );


                playSound(
                    'hit'
                );


                // Rock destroyed.

                if (
                    data.hp <=
                    0
                ) {

                    // Coins.

                    coins +=
                        5 +
                        Math.min(
                            level,
                            20
                        );


                    // Split large rock.

                    if (
                        data.size >
                            1.0 &&

                        level <
                            25
                    ) {

                        const childSize =
                            data.size *
                            0.58;


                        const childHp =
                            Math.max(
                                6,

                                Math.floor(
                                    data.maxHp *
                                    0.36
                                )
                            );


                        spawnRock(

                            rock.position.x -
                                0.45,

                            rock.position.y +
                                0.15,

                            childHp,

                            childSize,

                            1
                        );


                        spawnRock(

                            rock.position.x +
                                0.45,

                            rock.position.y +
                                0.15,

                            childHp,

                            childSize,

                            2
                        );
                    }


                    // Drop coin.

                    spawnCoin(
                        rock.position.x,
                        rock.position.y +
                            0.2
                    );


                    // Explosion.

                    burst(
                        rock.position.x,
                        rock.position.y,
                        16
                    );


                    createShockwave(
                        rock.position.x,
                        rock.position.y,
                        1.05 +
                        data.size *
                        0.3
                    );


                    shake =
                        Math.min(
                            0.4,
                            shake +
                            0.08
                        );


                    removeRock(
                        r
                    );


                    updateUI();


                    break;

                } else {

                    data.label.material.map =
                        getHpTexture(
                            data.hp
                        );


                    data.label.material
                        .needsUpdate =
                        true;


                    updateUI();
                }
            }


            if (
                !rocks[r]
            ) {

                continue;
            }


            // =================================================
            // CANNON COLLISION
            // =================================================

            const cannonDx =
                rock.position.x -
                cannon.position.x;


            const cannonDy =
                rock.position.y -
                0.95;


            const cannonRadius =
                data.size +
                0.72;


            if (

                cannonDx *
                    cannonDx +

                cannonDy *
                    cannonDy <

                cannonRadius *
                    cannonRadius &&

                data.coolDown <=
                    0

            ) {

                data.coolDown =
                    0.8;


                data.vy =
                    Math.max(
                        data.vy,
                        4.4
                    );


                data.vx +=
                    Math.sign(
                        cannonDx ||
                        rand(-1, 1)
                    ) *
                    1.7;


                damagePlayer(
                    20
                );


                burst(
                    rock.position.x,
                    0.8,
                    9
                );


                createShockwave(
                    rock.position.x,
                    0.8,
                    0.8
                );


                if (
                    gameOver
                ) {

                    break;
                }
            }
        }


        // =====================================================
        // COINS
        // =====================================================

        for (
            let i =
                droppedCoins.length - 1;

            i >= 0;

            i--
        ) {

            const coin =
                droppedCoins[i];


            const data =
                coin.userData;


            const dx =
                cannon.position.x -
                coin.position.x;


            const dy =
                1 -
                coin.position.y;


            const distanceSq =
                dx * dx +
                dy * dy;


            const magnetRadius =
                1.8 +
                magnetLevel *
                1.4;


            if (

                magnetLevel >
                    0 &&

                distanceSq <
                    magnetRadius *
                    magnetRadius

            ) {

                const pull =
                    Math.min(

                        1,

                        dt *
                        (
                            8 +
                            magnetLevel *
                            1.35
                        )
                    );


                coin.position.x +=
                    dx *
                    pull;


                coin.position.y +=
                    dy *
                    pull;

            } else {

                data.vy -=
                    9.2 *
                    dt;


                coin.position.y +=
                    data.vy *
                    dt;


                if (
                    coin.position.y <
                    0.5
                ) {

                    coin.position.y =
                        0.5;


                    data.vy =
                        0;
                }
            }


            coin.rotation.z +=
                data.spin *
                dt;


            coin.rotation.y +=
                data.spin *
                0.4 *
                dt;


            if (
                distanceSq <
                1.3
            ) {

                coins +=
                    5;


                score +=
                    10;


                playSound(
                    'coin'
                );


                burst(
                    coin.position.x,
                    coin.position.y,
                    6
                );


                scene.remove(
                    coin
                );


                droppedCoins.splice(
                    i,
                    1
                );


                updateUI();
            }
        }


        // =====================================================
        // PARTICLES
        // =====================================================

        updateParticles(
            dt
        );


        // Combo timeout.

        comboTimer -=
            dt;


        if (
            comboTimer <=
                0 &&
            combo !==
                0
        ) {

            combo =
                0;


            updateUI();
        }


        // =====================================================
        // NEXT WAVE
        // =====================================================

        if (
            rocks.length ===
            0
        ) {

            waveTimer +=
                dt;


            if (
                waveTimer >
                0.65
            ) {

                level +=
                    1;


                spawnWave();
            }

        } else {

            waveTimer =
                0;
        }


        // =====================================================
        // CAMERA
        // =====================================================

        shake *=
            Math.max(
                0,
                1 -
                dt * 7
            );


        const shakeX =
            rand(
                -shake,
                shake
            );


        const shakeY =
            rand(
                -shake * 0.35,
                shake * 0.35
            );


        camera.position.x += (

            cannon.position.x *
            0.05 +

            shakeX -

            camera.position.x

        ) *
        Math.min(
            1,
            dt * 5
        );


        camera.position.y += (

            cameraY +
            shakeY -
            camera.position.y

        ) *
        Math.min(
            1,
            dt * 4
        );


        camera.position.z += (

            cameraZ -
            camera.position.z

        ) *
        Math.min(
            1,
            dt * 4
        );


        camera.lookAt(
            cannon.position.x *
                0.025,

            5.1,

            0
        );


        // =====================================================
        // LIGHT ANIMATION
        // =====================================================

        sunsetLight.intensity =
            2.5 +
            Math.sin(
                elapsed *
                0.42
            ) *
            0.12;


        cannonLight.intensity =
            1.6 +
            Math.sin(
                elapsed *
                2
            ) *
            0.18;


        elapsed +=
            dt;
    }


    // =========================================================
    // MAIN LOOP
    // =========================================================

    let lastFrame =
        performance.now();


    let saveTimer =
        0;


    function animate(time) {

        requestAnimationFrame(
            animate
        );


        const dt =
            Math.min(

                0.033,

                Math.max(
                    0,
                    (
                        time -
                        lastFrame
                    ) /
                    1000
                )
            );


        lastFrame =
            time;


        if (
            started &&
            !paused &&
            !gameOver
        ) {

            update(
                dt,
                time
            );

        } else {

            updateParticles(
                dt
            );
        }


        saveTimer +=
            dt;


        if (
            saveTimer >
            2
        ) {

            save();

            saveTimer =
                0;
        }


        renderer.render(
            scene,
            camera
        );
    }


    animate(
        performance.now()
    );

});