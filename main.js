window.addEventListener('DOMContentLoaded', () => {

    'use strict';

    // =========================================================
    // 0. CHECK THREE.JS
    // =========================================================

    if (typeof THREE === 'undefined') {
        console.error('Three.js library is missing!');
        return;
    }


    // =========================================================
    // HELPERS
    // =========================================================

    const $ = (id) => document.getElementById(id);

    const clamp = (value, min, max) =>
        Math.max(min, Math.min(max, value));

    const rand = (min, max) =>
        min + Math.random() * (max - min);


    // =========================================================
    // 1. SCENE
    // =========================================================

    const scene =
        new THREE.Scene();

    scene.background =
        new THREE.Color(
            0xdd8c55
        );

    scene.fog =
        new THREE.FogExp2(
            0xdd8c55,
            0.012
        );


    // =========================================================
    // 2. CAMERA
    // =========================================================

    const camera =
        new THREE.PerspectiveCamera(
            55,
            window.innerWidth /
            Math.max(
                1,
                window.innerHeight
            ),
            0.1,
            1000
        );


    let screenLimitX =
        4.8;


    function updateCameraForDevice() {

        const aspect =
            window.innerWidth /
            Math.max(
                1,
                window.innerHeight
            );


        camera.aspect =
            aspect;


        // Mobile-first.

        if (
            aspect < 1
        ) {

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


            screenLimitX =
                4.8;

        } else {

            camera.position.set(
                0,
                9,
                18
            );


            camera.lookAt(
                0,
                5.5,
                0
            );


            screenLimitX =
                6.2;
        }


        camera.updateProjectionMatrix();


        updateRendererSize();
    }


    // =========================================================
    // 3. RENDERER - MOBILE OPTIMIZED
    // =========================================================

    const renderer =
        new THREE.WebGLRenderer({

            antialias:
                true,

            powerPreference:
                'high-performance',

            alpha:
                false
        });


    renderer.setSize(
        window.innerWidth,
        window.innerHeight,
        false
    );


    /*
     * Do not force 1080x1920 on every phone.
     * Instead, keep the visible canvas full screen
     * and limit the internal pixel density.
     */

    function getMobilePixelRatio() {

        const dpr =
            window.devicePixelRatio ||
            1;


        const width =
            window.innerWidth;


        if (
            width <= 390
        ) {

            return Math.min(
                dpr,
                1.10
            );
        }


        if (
            width <= 600
        ) {

            return Math.min(
                dpr,
                1.25
            );
        }


        return Math.min(
            dpr,
            1.35
        );
    }


    function updateRendererSize() {

        renderer.setPixelRatio(
            getMobilePixelRatio()
        );


        renderer.setSize(
            window.innerWidth,
            window.innerHeight,
            false
        );
    }


    renderer.shadowMap.enabled =
        true;


    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;


    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;


    renderer.toneMappingExposure =
        1.08;


    document.body.appendChild(
        renderer.domElement
    );


    updateCameraForDevice();


    // =========================================================
    // 4. LIGHTING
    // =========================================================

    const hemiLight =
        new THREE.HemisphereLight(
            0xffedd5,
            0x7c2d12,
            0.78
        );


    scene.add(
        hemiLight
    );


    const sunLight =
        new THREE.DirectionalLight(
            0xfff4df,
            1.35
        );


    sunLight.position.set(
        12,
        22,
        16
    );


    sunLight.castShadow =
        true;


    const shadowResolution =
        window.innerWidth < 600
            ? 512
            : 768;


    sunLight.shadow.mapSize.width =
        shadowResolution;


    sunLight.shadow.mapSize.height =
        shadowResolution;


    sunLight.shadow.camera.near =
        0.5;


    sunLight.shadow.camera.far =
        55;


    sunLight.shadow.camera.left =
        -15;


    sunLight.shadow.camera.right =
        15;


    sunLight.shadow.camera.top =
        20;


    sunLight.shadow.camera.bottom =
        -5;


    sunLight.shadow.bias =
        -0.0005;


    scene.add(
        sunLight
    );


    const warmLight =
        new THREE.PointLight(
            0xffad55,
            2.0,
            28
        );


    warmLight.position.set(
        0,
        8,
        -18
    );


    scene.add(
        warmLight
    );


    const cannonLight =
        new THREE.PointLight(
            0x38bdf8,
            1.3,
            5
        );


    cannonLight.position.set(
        0,
        1,
        1
    );


    scene.add(
        cannonLight
    );


    // =========================================================
    // 5. WORLD
    // =========================================================

    const world =
        new THREE.Group();


    scene.add(
        world
    );


    // =========================================================
    // SUN
    // =========================================================

    const sunDisc =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                2.3,
                18,
                14
            ),

            new THREE.MeshBasicMaterial({

                color:
                    0xffd45f,

                transparent:
                    true,

                opacity:
                    0.95
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


    const sunGlow =
        new THREE.Mesh(

            new THREE.SphereGeometry(
                4.5,
                14,
                10
            ),

            new THREE.MeshBasicMaterial({

                color:
                    0xffbd68,

                transparent:
                    true,

                opacity:
                    0.07,

                depthWrite:
                    false
            })
        );


    sunGlow.position.copy(
        sunDisc.position
    );


    world.add(
        sunGlow
    );


    // =========================================================
    // GRASS GROUND
    // =========================================================

    /*
     * IMPORTANT:
     * No metal platform under the cannon.
     * The cannon stands directly on grass.
     */

    const grassGeometry =
        new THREE.PlaneGeometry(
            46,
            22
        );


    const grassMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0x416b16,

            roughness:
                0.96,

            metalness:
                0
        });


    const grassGround =
        new THREE.Mesh(
            grassGeometry,
            grassMaterial
        );


    grassGround.rotation.x =
        -Math.PI / 2;


    grassGround.position.set(
        0,
        0,
        0
    );


    grassGround.receiveShadow =
        true;


    world.add(
        grassGround
    );


    // =========================================================
    // 3D GRASS
    // =========================================================

    const grassBladeGeometry =
        new THREE.ConeGeometry(
            0.045,
            0.30,
            3
        );


    const grassBladeMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0x4f7d19,

            roughness:
                1,

            metalness:
                0,

            flatShading:
                true
        });


    const grassCount =
        window.innerWidth < 600
            ? 260
            : 360;


    const grass3D =
        new THREE.InstancedMesh(

            grassBladeGeometry,

            grassBladeMaterial,

            grassCount
        );


    const grassDummy =
        new THREE.Object3D();


    for (
        let i = 0;
        i < grassCount;
        i++
    ) {

        grassDummy.position.set(

            rand(
                -20,
                20
            ),

            0.08,

            rand(
                -2,
                3
            )
        );


        const s =
            rand(
                0.7,
                1.2
            );


        grassDummy.scale.set(
            s,
            rand(
                0.7,
                1.35
            ),
            s
        );


        grassDummy.rotation.y =
            rand(
                0,
                Math.PI
            );


        grassDummy.rotation.z =
            rand(
                -0.14,
                0.14
            );


        grassDummy.updateMatrix();


        grass3D.setMatrixAt(
            i,
            grassDummy.matrix
        );
    }


    grass3D.instanceMatrix.needsUpdate =
        true;


    // Do not cast shadows from every grass blade.

    grass3D.castShadow =
        false;


    grass3D.receiveShadow =
        false;


    world.add(
        grass3D
    );


    // =========================================================
    // BACKGROUND PYRAMIDS
    // =========================================================

    function createBackgroundPyramid(
        x,
        z,
        scale,
        color
    ) {

        const geometry =
            new THREE.ConeGeometry(
                8 * scale,
                13 * scale,
                4
            );


        const material =
            new THREE.MeshStandardMaterial({

                color:
                    color,

                roughness:
                    0.88,

                flatShading:
                    true
            });


        const pyramid =
            new THREE.Mesh(
                geometry,
                material
            );


        pyramid.position.set(
            x,
            5.5 * scale,
            z
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
    }


    createBackgroundPyramid(
        -16,
        -13,
        1.35,
        0x8c5135
    );


    createBackgroundPyramid(
        16,
        -14,
        1.60,
        0x7e4a31
    );


    createBackgroundPyramid(
        0,
        -23,
        2.15,
        0x70432e
    );


    // =========================================================
    // SMALL ROCKS IN ENVIRONMENT
    // =========================================================

    const sceneryRockGeometry =
        new THREE.IcosahedronGeometry(
            0.32,
            0
        );


    const sceneryRockMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0x65594e,

            roughness:
                0.95,

            flatShading:
                true
        });


    function addSceneryRock(
        x,
        z,
        scale
    ) {

        const rock =
            new THREE.Mesh(
                sceneryRockGeometry,
                sceneryRockMaterial
            );


        rock.position.set(
            x,
            0.25,
            z
        );


        rock.scale.set(
            scale,
            scale *
            rand(
                0.6,
                1.1
            ),
            scale
        );


        rock.rotation.set(
            rand(
                0,
                Math.PI
            ),
            rand(
                0,
                Math.PI
            ),
            rand(
                0,
                Math.PI
            )
        );


        rock.castShadow =
            true;


        rock.receiveShadow =
            true;


        world.add(
            rock
        );
    }


    addSceneryRock(
        -7,
        -5,
        0.8
    );


    addSceneryRock(
        -6.4,
        -4.4,
        0.55
    );


    addSceneryRock(
        7,
        -5,
        0.85
    );


    addSceneryRock(
        6.5,
        -4.4,
        0.55
    );


    addSceneryRock(
        -11,
        -7,
        0.75
    );


    addSceneryRock(
        11,
        -7,
        0.75
    );


    // =========================================================
    // 6. ROUNDED CANNON
    // =========================================================

    const cannonGroup =
        new THREE.Group();


    /*
     * Position directly on grass.
     */

    cannonGroup.position.set(
        0,
        0,
        0.9
    );


    scene.add(
        cannonGroup
    );


    const cannonDarkMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0x111827,

            roughness:
                0.30,

            metalness:
                0.78
        });


    const cannonBlueMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0x075985,

            roughness:
                0.23,

            metalness:
                0.58
        });


    const cannonCyanMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0x38bdf8,

            emissive:
                0x06465c,

            emissiveIntensity:
                0.70,

            roughness:
                0.18,

            metalness:
                0.50
        });


    // =========================================================
    // ROUNDED BASE
    // =========================================================

    const cannonBaseGeometry =
        new THREE.CylinderGeometry(
            1.12,
            1.24,
            0.45,
            28
        );


    const cannonBase =
        new THREE.Mesh(
            cannonBaseGeometry,
            cannonDarkMaterial
        );


    cannonBase.position.y =
        0.34;


    cannonBase.scale.z =
        0.76;


    cannonBase.castShadow =
        true;


    cannonGroup.add(
        cannonBase
    );


    // =========================================================
    // ROUNDED BODY
    // =========================================================

    const cannonBodyGeometry =
        new THREE.SphereGeometry(
            1,
            22,
            14
        );


    const cannonBody =
        new THREE.Mesh(
            cannonBodyGeometry,
            cannonBlueMaterial
        );


    cannonBody.position.y =
        0.58;


    cannonBody.scale.set(
        1.05,
        0.60,
        0.80
    );


    cannonBody.castShadow =
        true;


    cannonGroup.add(
        cannonBody
    );


    // =========================================================
    // DOME
    // =========================================================

    const cannonDomeGeometry =
        new THREE.SphereGeometry(
            0.84,
            22,
            15,
            0,
            Math.PI * 2,
            0,
            Math.PI / 2
        );


    const cannonDome =
        new THREE.Mesh(

            cannonDomeGeometry,

            new THREE.MeshStandardMaterial({

                color:
                    0x0ea5e9,

                emissive:
                    0x06465e,

                emissiveIntensity:
                    0.62,

                transparent:
                    true,

                opacity:
                    0.93,

                roughness:
                    0.15,

                metalness:
                    0.34
            })
        );


    cannonDome.position.y =
        0.76;


    cannonDome.castShadow =
        true;


    cannonGroup.add(
        cannonDome
    );


    // =========================================================
    // DOME RING
    // =========================================================

    const domeRing =
        new THREE.Mesh(

            new THREE.TorusGeometry(
                0.86,
                0.045,
                8,
                26
            ),

            cannonCyanMaterial
        );


    domeRing.rotation.x =
        Math.PI / 2;


    domeRing.position.y =
        0.75;


    cannonGroup.add(
        domeRing
    );


    // =========================================================
    // WHEELS
    // =========================================================

    const wheelGeometry =
        new THREE.CylinderGeometry(
            0.37,
            0.37,
            0.20,
            18
        );


    const wheelMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0x0f172a,

            roughness:
                0.70,

            metalness:
                0.16
        });


    const hubGeometry =
        new THREE.CylinderGeometry(
            0.12,
            0.12,
            0.23,
            14
        );


    const wheelPositions = [

        [-0.98, 0.30, 0.60],

        [ 0.98, 0.30, 0.60],

        [-0.98, 0.30, -0.60],

        [ 0.98, 0.30, -0.60]

    ];


    const cannonWheels = [];


    for (
        const position of
        wheelPositions
    ) {

        const wheel =
            new THREE.Mesh(
                wheelGeometry,
                wheelMaterial
            );


        /*
         * Rotate so the wheel faces
         * the camera properly.
         */

        wheel.rotation.x =
            Math.PI / 2;


        wheel.position.set(
            position[0],
            position[1],
            position[2]
        );


        wheel.castShadow =
            true;


        cannonGroup.add(
            wheel
        );


        cannonWheels.push(
            wheel
        );


        const hub =
            new THREE.Mesh(
                hubGeometry,
                cannonCyanMaterial
            );


        hub.rotation.x =
            Math.PI / 2;


        hub.position.set(
            position[0],
            position[1],
            position[2]
        );


        cannonGroup.add(
            hub
        );
    }


    // =========================================================
    // BARRELS
    // =========================================================

    const barrelGeometry =
        new THREE.CylinderGeometry(
            0.11,
            0.14,
            0.90,
            16
        );


    const barrelMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0x334155,

            metalness:
                0.75,

            roughness:
                0.28
        });


    const leftBarrel =
        new THREE.Mesh(
            barrelGeometry,
            barrelMaterial
        );


    leftBarrel.position.set(
        -0.34,
        1.03,
        0
    );


    leftBarrel.castShadow =
        true;


    const rightBarrel =
        new THREE.Mesh(
            barrelGeometry,
            barrelMaterial
        );


    rightBarrel.position.set(
        0.34,
        1.03,
        0
    );


    rightBarrel.castShadow =
        true;


    cannonGroup.add(
        leftBarrel
    );


    cannonGroup.add(
        rightBarrel
    );


    // =========================================================
    // CANNON LIGHT
    // =========================================================

    cannonLight.position.set(
        0,
        0.95,
        1.15
    );


    // =========================================================
    // 7. GAME VARIABLES
    // =========================================================

    let isGameStarted =
        false;


    let isPaused =
        false;


    let isGameOver =
        false;


    let score =
        0;


    let coins =
        parseInt(
            localStorage.getItem(
                'bb3d_coins'
            ),
            10
        ) || 0;


    let bestScore =
        parseInt(
            localStorage.getItem(
                'bb3d_best'
            ),
            10
        ) || 0;


    let level =
        1;


    let playerHp =
        1000;


    const maxHp =
        1000;


    let firePowerLvl =
        parseInt(
            localStorage.getItem(
                'bb3d_upg_power'
            ),
            10
        ) || 1;


    let fireRateLvl =
        parseInt(
            localStorage.getItem(
                'bb3d_upg_rate'
            ),
            10
        ) || 1;


    let magnetLvl =
        parseInt(
            localStorage.getItem(
                'bb3d_upg_magnet'
            ),
            10
        ) || 0;


    /*
     * Slightly stronger default cannon.
     */

    let firePower =
        firePowerLvl + 1;


    let fireRate =
        1 +
        (
            fireRateLvl - 1
        ) *
        0.25;


    const bullets = [];

    const rocks = [];

    const droppedCoins = [];


    let lastShotTime =
        0;


    let targetX =
        0;


    let lastFrameTime =
        performance.now();


    // =========================================================
    // 8. UI
    // =========================================================

    const coinsValEl =
        $('coins-val');


    const scoreValEl =
        $('score-val');


    const hpTextEl =
        $('hp-text');


    const hpBarEl =
        $('hp-bar');


    const levelTextEl =
        $('level-text');


    const splashScreen =
        $('splash-screen');


    const startBtn =
        $('start-btn');


    const startCoinsEl =
        $('start-coins');


    const startBestScoreEl =
        $('start-best-score');


    const buyPowerBtn =
        $('buy-power-btn');


    const buyRateBtn =
        $('buy-rate-btn');


    const buyMagnetBtn =
        $('buy-magnet-btn');


    const pauseBtn =
        $('pause-btn');


    const pauseScreen =
        $('pause-screen');


    const resumeBtn =
        $('resume-btn');


    const gameOverScreen =
        $('game-over-screen');


    const restartBtn =
        $('restart-btn');


    const finalScoreEl =
        $('final-score');


    const finalLevelEl =
        $('final-level');


    const finalCoinsEl =
        $('final-coins');


    const introScreen =
        $('intro-screen');


    const introButton =
        $('intro-btn');


    // =========================================================
    // UI UPDATE
    // =========================================================

    function updateUI() {

        if (
            coinsValEl
        ) {

            coinsValEl.innerText =
                coins;
        }


        if (
            scoreValEl
        ) {

            scoreValEl.innerText =
                score;
        }


        if (
            startCoinsEl
        ) {

            startCoinsEl.innerText =
                coins;
        }


        if (
            startBestScoreEl
        ) {

            startBestScoreEl.innerText =
                bestScore;
        }


        if (
            hpTextEl
        ) {

            hpTextEl.innerText =
                `${Math.max(
                    0,
                    Math.ceil(
                        playerHp
                    )
                )} / ${maxHp}`;
        }


        if (
            hpBarEl
        ) {

            hpBarEl.style.width =
                `${clamp(
                    (
                        playerHp /
                        maxHp
                    ) *
                    100,

                    0,

                    100
                )}%`;
        }


        if (
            levelTextEl
        ) {

            /*
             * Support both "1" and "LEVEL 1"
             * depending on the user's HTML.
             */

            levelTextEl.innerText =
                `LEVEL ${level}`;
        }


        const powerCost =
            firePowerLvl *
            50;


        const rateCost =
            fireRateLvl *
            60;


        const magnetCost =
            (
                magnetLvl +
                1
            ) *
            100;


        if (
            buyPowerBtn
        ) {

            buyPowerBtn.innerText =
                `${powerCost} C`;


            buyPowerBtn.disabled =
                coins <
                powerCost;


            const levelEl =
                $('power-lvl-text');


            if (
                levelEl
            ) {

                levelEl.innerText =
                    `Lvl ${firePowerLvl}`;
            }
        }


        if (
            buyRateBtn
        ) {

            buyRateBtn.innerText =
                `${rateCost} C`;


            buyRateBtn.disabled =
                coins <
                rateCost;


            const levelEl =
                $('rate-lvl-text');


            if (
                levelEl
            ) {

                levelEl.innerText =
                    `Lvl ${fireRateLvl}`;
            }
        }


        if (
            buyMagnetBtn
        ) {

            buyMagnetBtn.innerText =
                `${magnetCost} C`;


            buyMagnetBtn.disabled =
                coins <
                magnetCost;


            const levelEl =
                $('magnet-lvl-text');


            if (
                levelEl
            ) {

                levelEl.innerText =
                    `Lvl ${magnetLvl}`;
            }
        }
    }


    updateUI();


    // =========================================================
    // 9. AUDIO
    // =========================================================

    /*
     * IMPORTANT:
     *
     * Do NOT create AudioContext while the
     * page is loading.
     *
     * Some mobile browsers can block or reject
     * it before a user interaction.
     */

    let audioCtx =
        null;


    function ensureAudioContext() {

        if (
            audioCtx
        ) {

            return audioCtx;
        }


        const AudioContextClass =
            window.AudioContext ||
            window.webkitAudioContext;


        if (
            !AudioContextClass
        ) {

            return null;
        }


        try {

            audioCtx =
                new AudioContextClass();

            return audioCtx;

        } catch (
            error
        ) {

            console.warn(
                'Audio unavailable:',
                error
            );

            return null;
        }
    }


    function playSound(
        type
    ) {

        const context =
            ensureAudioContext();


        if (
            !context
        ) {

            return;
        }


        if (
            context.state ===
            'suspended'
        ) {

            context.resume()
                .catch(
                    () => {}
                );
        }


        const oscillator =
            context.createOscillator();


        const gain =
            context.createGain();


        oscillator.connect(
            gain
        );


        gain.connect(
            context.destination
        );


        const now =
            context.currentTime;


        if (
            type ===
            'shoot'
        ) {

            oscillator.type =
                'sawtooth';


            oscillator.frequency.setValueAtTime(
                300,
                now
            );


            oscillator.frequency
                .exponentialRampToValueAtTime(
                    85,
                    now +
                    0.08
                );


            gain.gain.setValueAtTime(
                0.035,
                now
            );


            gain.gain.exponentialRampToValueAtTime(
                0.001,
                now +
                0.09
            );


            oscillator.start(
                now
            );


            oscillator.stop(
                now +
                0.09
            );


        } else if (
            type ===
            'hit'
        ) {

            oscillator.type =
                'triangle';


            oscillator.frequency.setValueAtTime(
                140,
                now
            );


            oscillator.frequency
                .exponentialRampToValueAtTime(
                    45,
                    now +
                    0.07
                );


            gain.gain.setValueAtTime(
                0.05,
                now
            );


            gain.gain.exponentialRampToValueAtTime(
                0.001,
                now +
                0.08
            );


            oscillator.start(
                now
            );


            oscillator.stop(
                now +
                0.08
            );


        } else if (
            type ===
            'coin'
        ) {

            oscillator.type =
                'sine';


            oscillator.frequency.setValueAtTime(
                850,
                now
            );


            oscillator.frequency.setValueAtTime(
                1240,
                now +
                0.05
            );


            gain.gain.setValueAtTime(
                0.045,
                now
            );


            gain.gain.exponentialRampToValueAtTime(
                0.001,
                now +
                0.14
            );


            oscillator.start(
                now
            );


            oscillator.stop(
                now +
                0.14
            );
        }
    }


    // =========================================================
    // 10. BULLETS
    // =========================================================

    const bulletGeometry =
        new THREE.SphereGeometry(
            0.17,
            10,
            10
        );


    const bulletMaterial =
        new THREE.MeshBasicMaterial({

            color:
                0xfde047
        });


    function spawnBullet(
        x,
        y,
        z
    ) {

        const bullet =
            new THREE.Mesh(
                bulletGeometry,
                bulletMaterial
            );


        bullet.position.set(
            x,
            y,
            z
        );


        bullet.userData.life =
            2.2;


        scene.add(
            bullet
        );


        bullets.push(
            bullet
        );
    }


    function removeBullet(
        index
    ) {

        const bullet =
            bullets[index];


        if (
            !bullet
        ) {

            return;
        }


        scene.remove(
            bullet
        );


        bullets.splice(
            index,
            1
        );
    }


    // =========================================================
    // 11. ROCKS
    // =========================================================

    const rockMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0x64748b,

            roughness:
                0.76,

            flatShading:
                true
        });


    function createHpLabel(
        value,
        size
    ) {

        const canvas =
            document.createElement(
                'canvas'
            );


        canvas.width =
            128;


        canvas.height =
            128;


        const ctx =
            canvas.getContext(
                '2d'
            );


        ctx.clearRect(
            0,
            0,
            128,
            128
        );


        ctx.fillStyle =
            '#ffffff';


        ctx.font =
            '900 58px Arial';


        ctx.textAlign =
            'center';


        ctx.textBaseline =
            'middle';


        ctx.shadowColor =
            'rgba(0,0,0,0.9)';


        ctx.shadowBlur =
            8;


        ctx.fillText(
            Math.max(
                0,
                Math.ceil(
                    value
                )
            ),
            64,
            64
        );


        const texture =
            new THREE.CanvasTexture(
                canvas
            );


        texture.minFilter =
            THREE.LinearFilter;


        texture.magFilter =
            THREE.LinearFilter;


        const sprite =
            new THREE.Sprite(

                new THREE.SpriteMaterial({

                    map:
                        texture,

                    transparent:
                        true,

                    depthWrite:
                        false
                })
            );


        sprite.scale.set(
            size *
            1.1,

            size *
            1.1,

            1
        );


        return {
            sprite,
            canvas,
            context: ctx,
            texture
        };
    }


    function updateRockLabel(
        rock
    ) {

        const info =
            rock.userData.labelInfo;


        if (
            !info
        ) {

            return;
        }


        const ctx =
            info.context;


        ctx.clearRect(
            0,
            0,
            128,
            128
        );


        ctx.fillStyle =
            '#ffffff';


        ctx.font =
            '900 58px Arial';


        ctx.textAlign =
            'center';


        ctx.textBaseline =
            'middle';


        ctx.shadowColor =
            'rgba(0,0,0,0.9)';


        ctx.shadowBlur =
            8;


        ctx.fillText(
            Math.max(
                0,
                Math.ceil(
                    rock.userData.hp
                )
            ),
            64,
            64
        );


        info.texture.needsUpdate =
            true;
    }


    function spawnRock(
        x,
        y,
        hp,
        size
    ) {

        const geometry =
            new THREE.ConeGeometry(
                size,
                size *
                1.35,
                4
            );


        const rock =
            new THREE.Mesh(
                geometry,
                rockMaterial
            );


        rock.position.set(
            x,
            y,
            0
        );


        rock.rotation.y =
            rand(
                0,
                Math.PI
            );


        rock.castShadow =
            true;


        rock.receiveShadow =
            true;


        const labelInfo =
            createHpLabel(
                hp,
                size
            );


        rock.add(
            labelInfo.sprite
        );


        rock.userData = {

            hp:
                hp,

            maxHp:
                hp,

            size:
                size,

            vx:
                rand(
                    -0.035,
                    0.035
                ),

            vy:
                0,

            labelInfo:
                labelInfo,

            hitCooldown:
                0
        };


        scene.add(
            rock
        );


        rocks.push(
            rock
        );
    }


    function removeRock(
        rock,
        index
    ) {

        if (
            rock.userData.labelInfo
        ) {

            rock.userData.labelInfo.texture
                .dispose();
        }


        if (
            rock.geometry
        ) {

            rock.geometry.dispose();
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
    // 12. COINS
    // =========================================================

    const coinGeometry =
        new THREE.CylinderGeometry(
            0.27,
            0.27,
            0.08,
            14
        );


    const coinMaterial =
        new THREE.MeshStandardMaterial({

            color:
                0xfacc15,

            metalness:
                0.82,

            roughness:
                0.18
        });


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
            0
        );


        coin.userData = {

            vy:
                -0.03
        };


        scene.add(
            coin
        );


        droppedCoins.push(
            coin
        );
    }


    function removeCoin(
        coin,
        index
    ) {

        scene.remove(
            coin
        );


        droppedCoins.splice(
            index,
            1
        );
    }


    // =========================================================
    // 13. WAVE SYSTEM
    // =========================================================

    let firstWaveStarted =
        false;


    function spawnWave() {

        const count =
            Math.min(

                2 +
                Math.floor(
                    (
                        level -
                        1
                    ) /
                    2
                ),

                5
            );


        for (
            let i = 0;
            i < count;
            i++
        ) {

            const size =
                0.9 +
                Math.random() *
                0.72;


            const hp =
                Math.floor(

                    (
                        8 +
                        level *
                        6
                    ) *
                    (
                        size /
                        1.2
                    )
                );


            const x =
                (
                    Math.random() -
                    0.5
                ) *
                (
                    screenLimitX *
                    1.35
                );


            spawnRock(
                x,
                11.5 +
                i *
                2.5,
                hp,
                size
            );
        }


        updateUI();
    }


    function startNextWave() {

        if (
            rocks.length !==
            0
        ) {

            return;
        }


        /*
         * First wave:
         * keep the player at level 1.
         */

        if (
            !firstWaveStarted
        ) {

            firstWaveStarted =
                true;

            level =
                1;

            spawnWave();

            return;
        }


        level +=
            1;


        spawnWave();
    }


    // =========================================================
    // 14. INPUT
    // =========================================================

    let isDragging =
        false;


    function handleMove(
        clientX
    ) {

        const normalized =
            (
                clientX /
                Math.max(
                    1,
                    window.innerWidth
                )
            ) *
            2 -
            1;


        targetX =
            clamp(

                normalized *
                (
                    screenLimitX *
                    1.18
                ),

                -screenLimitX,

                screenLimitX
            );
    }


    renderer.domElement.addEventListener(
        'pointerdown',
        (event) => {

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
                event.clientX
            );


            if (
                renderer.domElement
                    .setPointerCapture
            ) {

                try {

                    renderer.domElement
                        .setPointerCapture(
                            event.pointerId
                        );

                } catch (
                    error
                ) {

                    // Ignore.
                }
            }
        }
    );


    renderer.domElement.addEventListener(
        'pointermove',
        (event) => {

            if (
                isDragging
            ) {

                handleMove(
                    event.clientX
                );
            }
        }
    );


    renderer.domElement.addEventListener(
        'pointerup',
        () => {

            isDragging =
                false;
        }
    );


    renderer.domElement.addEventListener(
        'pointercancel',
        () => {

            isDragging =
                false;
        }
    );


    // =========================================================
    // 15. INTRO SUPPORT
    // =========================================================

    let introFinished =
        !introScreen;


    function finishIntro() {

        if (
            introFinished
        ) {

            return;
        }


        introFinished =
            true;


        /*
         * Resume audio only after user interaction.
         */

        ensureAudioContext();


        if (
            introScreen
        ) {

            introScreen.classList.add(
                'intro-hidden'
            );
        }


        /*
         * Give CSS animation a moment to finish.
         */

        setTimeout(
            () => {

                if (
                    splashScreen
                ) {

                    splashScreen.classList.remove(
                        'hidden'
                    );
                }

            },
            350
        );
    }


    if (
        introButton
    ) {

        introButton.addEventListener(
            'click',
            finishIntro
        );
    }


    /*
     * Automatically continue after the intro,
     * but only if an intro actually exists.
     */

    if (
        introScreen
    ) {

        setTimeout(
            finishIntro,
            5200
        );
    }


    // =========================================================
    // 16. START GAME
    // =========================================================

    function startGame() {

        if (
            isGameStarted
        ) {

            return;
        }


        /*
         * If the new intro exists,
         * clicking start too early simply
         * finishes the intro.
         */

        if (
            !introFinished
        ) {

            finishIntro();

            return;
        }


        isGameStarted =
            true;


        isGameOver =
            false;


        isPaused =
            false;


        score =
            0;


        playerHp =
            maxHp;


        firstWaveStarted =
            false;


        /*
         * Start at level 1.
         */

        level =
            1;


        targetX =
            0;


        cannonGroup.position.x =
            0;


        if (
            splashScreen
        ) {

            splashScreen.classList.add(
                'hidden'
            );
        }


        if (
            gameOverScreen
        ) {

            gameOverScreen.classList.add(
                'hidden'
            );
        }


        if (
            pauseScreen
        ) {

            pauseScreen.classList.add(
                'hidden'
            );
        }


        if (
            pauseBtn
        ) {

            pauseBtn.classList.remove(
                'hidden'
            );
        }


        /*
         * User interaction unlocks audio.
         */

        const audio =
            ensureAudioContext();


        if (
            audio &&
            audio.state ===
            'suspended'
        ) {

            audio.resume()
                .catch(
                    () => {}
                );
        }


        updateUI();


        startNextWave();
    }


    if (
        startBtn
    ) {

        startBtn.addEventListener(
            'click',
            startGame
        );
    }


    if (
        restartBtn
    ) {

        restartBtn.addEventListener(
            'click',
            () => {

                if (
                    gameOverScreen
                ) {

                    gameOverScreen.classList.add(
                        'hidden'
                    );
                }


                isGameStarted =
                    false;


                startGame();
            }
        );
    }


    // =========================================================
    // 17. PAUSE
    // =========================================================

    function togglePause() {

        if (
            !isGameStarted ||
            isGameOver
        ) {

            return;
        }


        isPaused =
            !isPaused;


        if (
            pauseScreen
        ) {

            pauseScreen.classList.toggle(
                'hidden',
                !isPaused
            );
        }


        if (
            pauseBtn
        ) {

            pauseBtn.classList.toggle(
                'hidden',
                isPaused
            );
        }
    }


    if (
        pauseBtn
    ) {

        pauseBtn.addEventListener(
            'click',
            togglePause
        );
    }


    if (
        resumeBtn
    ) {

        resumeBtn.addEventListener(
            'click',
            togglePause
        );
    }


    // =========================================================
    // 18. UPGRADES
    // =========================================================

    if (
        buyPowerBtn
    ) {

        buyPowerBtn.addEventListener(
            'click',
            () => {

                const cost =
                    firePowerLvl *
                    50;


                if (
                    coins <
                    cost
                ) {

                    return;
                }


                coins -=
                    cost;


                firePowerLvl +=
                    1;


                firePower =
                    firePowerLvl +
                    1;


                localStorage.setItem(
                    'bb3d_coins',
                    String(coins)
                );


                localStorage.setItem(
                    'bb3d_upg_power',
                    String(
                        firePowerLvl
                    )
                );


                updateUI();
            }
        );
    }


    if (
        buyRateBtn
    ) {

        buyRateBtn.addEventListener(
            'click',
            () => {

                const cost =
                    fireRateLvl *
                    60;


                if (
                    coins <
                    cost
                ) {

                    return;
                }


                coins -=
                    cost;


                fireRateLvl +=
                    1;


                fireRate =
                    1 +
                    (
                        fireRateLvl -
                        1
                    ) *
                    0.25;


                localStorage.setItem(
                    'bb3d_coins',
                    String(coins)
                );


                localStorage.setItem(
                    'bb3d_upg_rate',
                    String(
                        fireRateLvl
                    )
                );


                updateUI();
            }
        );
    }


    if (
        buyMagnetBtn
    ) {

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
                    coins <
                    cost
                ) {

                    return;
                }


                coins -=
                    cost;


                magnetLvl +=
                    1;


                localStorage.setItem(
                    'bb3d_coins',
                    String(coins)
                );


                localStorage.setItem(
                    'bb3d_upg_magnet',
                    String(
                        magnetLvl
                    )
                );


                updateUI();
            }
        );
    }


    // =========================================================
    // 19. GAME OVER
    // =========================================================

    function showGameOver() {

        isGameOver =
            true;


        isPaused =
            false;


        if (
            score >
            bestScore
        ) {

            bestScore =
                score;


            localStorage.setItem(
                'bb3d_best',
                String(
                    bestScore
                )
            );
        }


        localStorage.setItem(
            'bb3d_coins',
            String(
                coins
            )
        );


        if (
            finalScoreEl
        ) {

            finalScoreEl.innerText =
                score;
        }


        if (
            finalLevelEl
        ) {

            finalLevelEl.innerText =
                level;
        }


        if (
            finalCoinsEl
        ) {

            finalCoinsEl.innerText =
                coins;
        }


        if (
            gameOverScreen
        ) {

            gameOverScreen.classList.remove(
                'hidden'
            );
        }


        if (
            pauseBtn
        ) {

            pauseBtn.classList.add(
                'hidden'
            );
        }
    }


    // =========================================================
    // 20. GAME UPDATE
    // =========================================================

    function updateGame(
        dt,
        time
    ) {

        // -----------------------------------------------------
        // CANNON MOVEMENT
        // -----------------------------------------------------

        const movementSpeed =
            Math.min(
                1,
                dt * 12
            );


        cannonGroup.position.x += (

            targetX -
            cannonGroup.position.x

        ) *
        movementSpeed;


        // -----------------------------------------------------
        // WHEEL MOVEMENT
        // -----------------------------------------------------

        if (
            isDragging
        ) {

            for (
                const wheel of
                cannonWheels
            ) {

                wheel.rotation.z +=
                    dt * 4.5;
            }
        }


        // -----------------------------------------------------
        // CANNON LIGHT
        // -----------------------------------------------------

        cannonLight.intensity =
            1.2 +
            Math.sin(
                time *
                0.003
            ) *
            0.10;


        domeRing.rotation.z +=
            dt *
            0.18;


        // -----------------------------------------------------
        // AUTO FIRE
        // -----------------------------------------------------

        const shotsPerSecond =
            fireRate *
            4;


        const shotInterval =
            1000 /
            Math.max(
                0.1,
                shotsPerSecond
            );


        if (
            time -
            lastShotTime >=
            shotInterval
        ) {

            spawnBullet(
                cannonGroup.position.x -
                0.34,

                1.48,

                0
            );


            spawnBullet(
                cannonGroup.position.x +
                0.34,

                1.48,

                0
            );


            playSound(
                'shoot'
            );


            lastShotTime =
                time;
        }


        // -----------------------------------------------------
        // BULLETS
        // -----------------------------------------------------

        for (
            let i =
                bullets.length - 1;

            i >= 0;

            i--
        ) {

            const bullet =
                bullets[i];


            bullet.position.y +=
                14 *
                dt;


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
            }
        }


        // -----------------------------------------------------
        // ROCKS
        // -----------------------------------------------------

        for (
            let rIdx =
                rocks.length - 1;

            rIdx >= 0;

            rIdx--
        ) {

            const rock =
                rocks[rIdx];


            if (
                !rock
            ) {

                continue;
            }


            const data =
                rock.userData;


            data.hitCooldown =
                Math.max(
                    0,
                    data.hitCooldown -
                    dt
                );


            // =================================================
            // SLOWER FALLING
            // =================================================

            const gravity =
                8.0 +
                level *
                0.025;


            data.vy -=
                gravity *
                dt;


            rock.position.x +=
                data.vx *
                dt;


            rock.position.y +=
                data.vy *
                dt;


            // Rotate slowly.

            rock.rotation.y +=
                dt *
                0.8;


            rock.rotation.x +=
                dt *
                0.22;


            // =================================================
            // REPEATED BOUNCE
            // =================================================

            const floor =
                0.20 +
                data.size;


            if (
                rock.position.y <=
                floor
            ) {

                rock.position.y =
                    floor;


                /*
                 * New upward velocity on every
                 * floor collision.
                 *
                 * The rock continues bouncing
                 * until it is destroyed.
                 */

                const bounceStrength =
                    Math.min(
                        5.2,
                        3.65 +
                        level *
                        0.025
                    );


                data.vy =
                    Math.max(

                        bounceStrength,

                        Math.abs(
                            data.vy
                        ) *
                        0.78
                    );


                data.vx *=
                    0.985;
            }


            // =================================================
            // SIDE WALLS
            // =================================================

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
            // BULLET COLLISIONS
            // =================================================

            for (
                let bIdx =
                    bullets.length - 1;

                bIdx >= 0;

                bIdx--
            ) {

                const bullet =
                    bullets[bIdx];


                if (
                    !bullet
                ) {

                    continue;
                }


                const distance =
                    bullet.position.distanceTo(
                        rock.position
                    );


                if (
                    distance <
                    data.size *
                    0.92
                ) {

                    removeBullet(
                        bIdx
                    );


                    data.hp -=
                        firePower;


                    score +=
                        firePower;


                    playSound(
                        'hit'
                    );


                    // Small knockback.

                    data.vy +=
                        0.35;


                    // -------------------------------------------------
                    // ROCK DESTROYED
                    // -------------------------------------------------

                    if (
                        data.hp <=
                        0
                    ) {

                        /*
                         * Coin drop.
                         */

                        if (
                            Math.random() >
                            0.30
                        ) {

                            spawnCoin(
                                rock.position.x,
                                rock.position.y
                            );
                        }


                        /*
                         * Split big rocks.
                         */

                        if (
                            data.size >
                            0.95
                        ) {

                            const childSize =
                                data.size *
                                0.68;


                            const childHp =
                                Math.max(
                                    4,

                                    Math.floor(
                                        data.maxHp *
                                        0.5
                                    )
                                );


                            spawnRock(

                                rock.position.x -
                                0.35,

                                rock.position.y,

                                childHp,

                                childSize
                            );


                            spawnRock(

                                rock.position.x +
                                0.35,

                                rock.position.y,

                                childHp,

                                childSize
                            );
                        }


                        removeRock(
                            rock,
                            rIdx
                        );


                        updateUI();


                        break;

                    } else {

                        updateRockLabel(
                            rock
                        );


                        updateUI();
                    }
                }
            }


            /*
             * It may have been removed
             * after a bullet hit.
             */

            if (
                !rocks.includes(
                    rock
                )
            ) {

                continue;
            }


            // =================================================
            // CANNON COLLISION
            // =================================================

            if (
                data.hitCooldown <=
                0
            ) {

                const dx =
                    rock.position.x -
                    cannonGroup.position.x;


                const dy =
                    rock.position.y -
                    0.7;


                const distance =
                    Math.hypot(
                        dx,
                        dy
                    );


                if (
                    distance <
                    data.size +
                    0.55
                ) {

                    playerHp -=
                        10;


                    data.hitCooldown =
                        0.8;


                    /*
                     * Knock rock back upward.
                     */

                    data.vy =
                        Math.max(
                            4.0,
                            data.vy
                        );


                    /*
                     * Push rock sideways.
                     */

                    data.vx +=
                        Math.sign(
                            dx ||
                            rand(
                                -1,
                                1
                            )
                        ) *
                        0.06;


                    updateUI();


                    if (
                        playerHp <=
                        0
                    ) {

                        showGameOver();


                        break;
                    }
                }
            }
        }


        // =====================================================
        // COINS
        // =====================================================

        for (
            let cIdx =
                droppedCoins.length - 1;

            cIdx >= 0;

            cIdx--
        ) {

            const coin =
                droppedCoins[cIdx];


            if (
                !coin
            ) {

                continue;
            }


            const dx =
                cannonGroup.position.x -
                coin.position.x;


            const dy =
                0.55 -
                coin.position.y;


            const distance =
                Math.hypot(
                    dx,
                    dy
                );


            const magnetRadius =
                2 +
                magnetLvl *
                1.5;


            if (
                magnetLvl >
                0 &&
                distance <
                magnetRadius
            ) {

                const pull =
                    Math.min(
                        1,
                        dt *
                        (
                            7 +
                            magnetLvl *
                            1.25
                        )
                    );


                coin.position.x +=
                    dx *
                    pull;


                coin.position.y +=
                    dy *
                    pull;

            } else {

                coin.position.y +=
                    coin.userData.vy;
            }


            coin.rotation.z +=
                dt *
                4.5;


            if (
                distance <
                0.9
            ) {

                coins +=
                    5;


                score +=
                    10;


                playSound(
                    'coin'
                );


                removeCoin(
                    coin,
                    cIdx
                );


                updateUI();


            } else if (
                coin.position.y <
                0.20
            ) {

                coin.position.y =
                    0.20;


                coin.userData.vy =
                    0;
            }
        }


        // =====================================================
        // NEXT WAVE
        // =====================================================

        if (
            rocks.length ===
            0
        ) {

            startNextWave();
        }


        // =====================================================
        // GRASS BREEZE
        // =====================================================

        grass3D.rotation.z =
            Math.sin(
                time *
                0.0012
            ) *
            0.005;


        // =====================================================
        // WARM LIGHT
        // =====================================================

        warmLight.intensity =
            2.0 +
            Math.sin(
                time *
                0.0005
            ) *
            0.10;
    }


    // =========================================================
    // 21. KEYBOARD PAUSE
    // =========================================================

    window.addEventListener(
        'keydown',
        (event) => {

            if (
                event.code ===
                'KeyP' ||

                event.code ===
                'Escape'
            ) {

                togglePause();
            }
        }
    );


    // =========================================================
    // 22. RESIZE
    // =========================================================

    window.addEventListener(
        'resize',
        () => {

            updateCameraForDevice();

        },
        {
            passive:
                true
        }
    );


    window.addEventListener(
        'orientationchange',
        () => {

            setTimeout(
                updateCameraForDevice,
                100
            );

        },
        {
            passive:
                true
        }
    );


    // =========================================================
    // 23. MAIN LOOP
    // =========================================================

    function animate(
        time
    ) {

        requestAnimationFrame(
            animate
        );


        /*
         * Delta time makes the game behave
         * consistently on different phones.
         */

        const delta =
            Math.min(

                0.033,

                Math.max(

                    0,

                    (
                        time -
                        lastFrameTime
                    ) /
                    1000
                )
            );


        lastFrameTime =
            time;


        if (
            isGameStarted &&
            !isPaused &&
            !isGameOver
        ) {

            updateGame(
                delta,
                time
            );
        }


        renderer.render(
            scene,
            camera
        );
    }


    // =========================================================
    // 24. CLEAN STARTUP
    // =========================================================

    /*
     * Render immediately.
     *
     * This guarantees the 3D scene is alive
     * even before pressing "Start".
     */

    renderer.render(
        scene,
        camera
    );


    /*
     * Start animation loop.
     */

    animate(
        performance.now()
    );

});