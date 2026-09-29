window.addEventListener(
    'DOMContentLoaded',
    () => {

        'use strict';


        // =====================================================
        // BASIC CHECK
        // =====================================================

        if (
            typeof THREE ===
            'undefined'
        ) {

            console.error(
                'Three.js לא נטען.'
            );

            return;
        }


        // =====================================================
        // HELPERS
        // =====================================================

        const $ = (id) => {

            return document.getElementById(
                id
            );
        };


        const clamp = (
            value,
            min,
            max
        ) => {

            return Math.max(
                min,
                Math.min(
                    max,
                    value
                )
            );
        };


        const rand = (
            min,
            max
        ) => {

            return (
                min +
                Math.random() *
                (max - min)
            );
        };


        // =====================================================
        // SCENE
        // =====================================================

        const scene =
            new THREE.Scene();


        // =====================================================
        // CAMERA
        // =====================================================

        const camera =
            new THREE.PerspectiveCamera(
                50,
                window.innerWidth /
                window.innerHeight,
                0.1,
                250
            );


        let screenLimitX =
            7.5;


        let cameraY =
            8.6;


        let cameraZ =
            19.5;


        // =====================================================
        // RENDERER
        // =====================================================

        const renderer =
            new THREE.WebGLRenderer({

                antialias:
                    window.innerWidth >
                    650,

                powerPreference:
                    'high-performance',

                preserveDrawingBuffer:
                    false
            });


        renderer.shadowMap.enabled =
            true;


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


        // =====================================================
        // HD RESOLUTION
        // =====================================================

        function setHDResolution() {

            const aspect =
                window.innerWidth /
                Math.max(
                    1,
                    window.innerHeight
                );


            let width;

            let height;


            /*
             * Landscape:
             * 1920 x 1080
             *
             * Portrait:
             * 1080 x 1920
             */

            if (
                aspect >= 1
            ) {

                width =
                    1920;

                height =
                    1080;

            } else {

                width =
                    1080;

                height =
                    1920;
            }


            renderer.setPixelRatio(
                1
            );


            renderer.setSize(
                width,
                height,
                false
            );
        }


        setHDResolution();


        // =====================================================
        // RESPONSIVE CAMERA
        // =====================================================

        function resize() {

            const aspect =
                window.innerWidth /
                Math.max(
                    1,
                    window.innerHeight
                );


            camera.aspect =
                aspect;


            if (
                aspect <
                0.72
            ) {

                screenLimitX =
                    4.35;

                cameraY =
                    12.4;

                cameraZ =
                    25.5;

            } else if (
                aspect <
                1
            ) {

                screenLimitX =
                    5.35;

                cameraY =
                    10.6;

                cameraZ =
                    22.7;

            } else {

                screenLimitX =
                    7.5;

                cameraY =
                    8.6;

                cameraZ =
                    19.5;
            }


            camera.position.set(
                0,
                cameraY,
                cameraZ
            );


            camera.lookAt(
                0,
                5.1,
                0
            );


            camera.updateProjectionMatrix();


            setHDResolution();
        }


        resize();


        window.addEventListener(
            'resize',
            resize,
            {
                passive:
                    true
            }
        );


        // =====================================================
        // SKY
        // =====================================================

        function createSkyTexture() {

            const canvas =
                document.createElement(
                    'canvas'
                );


            canvas.width =
                8;

            canvas.height =
                768;


            const ctx =
                canvas.getContext(
                    '2d'
                );


            const gradient =
                ctx.createLinearGradient(
                    0,
                    0,
                    0,
                    768
                );


            gradient.addColorStop(
                0,
                '#626b73'
            );


            gradient.addColorStop(
                0.20,
                '#807874'
            );


            gradient.addColorStop(
                0.40,
                '#a86f58'
            );


            gradient.addColorStop(
                0.58,
                '#db8d4f'
            );


            gradient.addColorStop(
                0.76,
                '#f6bc59'
            );


            gradient.addColorStop(
                1,
                '#f5d27e'
            );


            ctx.fillStyle =
                gradient;


            ctx.fillRect(
                0,
                0,
                canvas.width,
                canvas.height
            );


            // Atmospheric clouds.

            for (
                let i = 0;
                i < 14;
                i++
            ) {

                const y =
                    90 +
                    i * 48;


                const cloud =
                    ctx.createLinearGradient(
                        0,
                        y,
                        8,
                        y + 30
                    );


                cloud.addColorStop(
                    0,
                    'rgba(255,255,255,0)'
                );


                cloud.addColorStop(
                    0.35,
                    'rgba(255,222,188,0.09)'
                );


                cloud.addColorStop(
                    0.60,
                    'rgba(90,81,77,0.11)'
                );


                cloud.addColorStop(
                    1,
                    'rgba(255,255,255,0)'
                );


                ctx.fillStyle =
                    cloud;


                ctx.fillRect(
                    0,
                    y,
                    canvas.width,
                    28
                );
            }


            const texture =
                new THREE.CanvasTexture(
                    canvas
                );


            texture.encoding =
                THREE.sRGBEncoding;


            return texture;
        }


        scene.background =
            createSkyTexture();


        scene.fog =
            new THREE.FogExp2(
                0xd68a57,
                0.014
            );


        // =====================================================
        // LIGHTING
        // =====================================================

        const hemisphere =
            new THREE.HemisphereLight(
                0xffe7c5,
                0x29170e,
                0.88
            );


        scene.add(
            hemisphere
        );


        const sun =
            new THREE.DirectionalLight(
                0xffefc9,
                1.72
            );


        sun.position.set(
            12,
            21,
            14
        );


        sun.castShadow =
            true;


        const shadowSize =
            window.innerWidth <
            650
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
            70;


        sun.shadow.bias =
            -0.0005;


        scene.add(
            sun
        );


        const blueFill =
            new THREE.DirectionalLight(
                0x8ddcff,
                0.34
            );


        blueFill.position.set(
            -13,
            10,
            8
        );


        scene.add(
            blueFill
        );


        const sunsetLight =
            new THREE.PointLight(
                0xffb15e,
                2.8,
                28,
                2
            );


        sunsetLight.position.set(
            0,
            8,
            -18
        );


        scene.add(
            sunsetLight
        );


        const cannonLight =
            new THREE.PointLight(
                0x38bdf8,
                2,
                7,
                2
            );


        cannonLight.position.set(
            0,
            1.2,
            2
        );


        scene.add(
            cannonLight
        );


        // =====================================================
        // WORLD
        // =====================================================

        const world =
            new THREE.Group();


        scene.add(
            world
        );


        // =====================================================
        // SUN
        // =====================================================

        const sunDisc =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    2.6,
                    24,
                    16
                ),

                new THREE.MeshBasicMaterial({

                    color:
                        0xffd55c,

                    transparent:
                        true,

                    opacity:
                        0.95
                })
            );


        sunDisc.position.set(
            0,
            10.7,
            -26
        );


        world.add(
            sunDisc
        );


        const sunGlow =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    5,
                    20,
                    14
                ),

                new THREE.MeshBasicMaterial({

                    color:
                        0xffc56b,

                    transparent:
                        true,

                    opacity:
                        0.09,

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


        // =====================================================
        // GROUND
        // =====================================================

        const ground =
            new THREE.Mesh(

                new THREE.PlaneGeometry(
                    62,
                    50
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0x725d2b,

                    roughness:
                        1,

                    metalness:
                        0,

                    flatShading:
                        true
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


        // =====================================================
        // SOIL
        // =====================================================

        const soil =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    54,
                    2.8,
                    7
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0x3d2516,

                    roughness:
                        1,

                    flatShading:
                        true
                })
            );


        soil.position.set(
            0,
            -1.55,
            1
        );


        soil.receiveShadow =
            true;


        world.add(
            soil
        );


        // =====================================================
        // GRASS GROUND
        // =====================================================

        const grassTop =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    54,
                    0.56,
                    7.08
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0x4c721a,

                    roughness:
                        1,

                    flatShading:
                        true
                })
            );


        grassTop.position.set(
            0,
            -0.16,
            1
        );


        grassTop.receiveShadow =
            true;


        world.add(
            grassTop
        );


        // =====================================================
        // 3D GRASS
        // =====================================================

        const grassMaterial =
            new THREE.MeshStandardMaterial({

                color:
                    0x4d7d18,

                roughness:
                    0.95,

                metalness:
                    0,

                flatShading:
                    true,

                side:
                    THREE.DoubleSide
            });


        const grassGeometry =
            new THREE.ConeGeometry(
                0.055,
                0.34,
                3
            );


        const GRASS_COUNT =
            520;


        const grass =
            new THREE.InstancedMesh(

                grassGeometry,

                grassMaterial,

                GRASS_COUNT
            );


        const grassDummy =
            new THREE.Object3D();


        let grassIndex =
            0;


        // Front grass.

        for (
            let i = 0;
            i < 320;
            i++
        ) {

            const x =
                rand(
                    -19,
                    19
                );


            const z =
                rand(
                    -1.3,
                    2.2
                );


            grassDummy.position.set(
                x,
                0.05,
                z
            );


            grassDummy.scale.set(
                rand(
                    0.7,
                    1.2
                ),
                rand(
                    0.7,
                    1.35
                ),
                rand(
                    0.7,
                    1.2
                )
            );


            grassDummy.rotation.y =
                rand(
                    0,
                    Math.PI
                );


            grassDummy.rotation.z =
                rand(
                    -0.15,
                    0.15
                );


            grassDummy.updateMatrix();


            grass.setMatrixAt(
                grassIndex++,
                grassDummy.matrix
            );
        }


        // Valley grass.

        for (
            let i = 0;
            i < 200;
            i++
        ) {

            const x =
                rand(
                    -7,
                    7
                );


            const z =
                rand(
                    -7.5,
                    -2.0
                );


            grassDummy.position.set(
                x,
                0.07,
                z
            );


            grassDummy.scale.set(
                rand(
                    0.65,
                    1.0
                ),
                rand(
                    0.7,
                    1.2
                ),
                rand(
                    0.65,
                    1.0
                )
            );


            grassDummy.rotation.y =
                rand(
                    0,
                    Math.PI
                );


            grassDummy.rotation.z =
                rand(
                    -0.16,
                    0.16
                );


            grassDummy.updateMatrix();


            grass.setMatrixAt(
                grassIndex++,
                grassDummy.matrix
            );
        }


        grass.instanceMatrix.needsUpdate =
            true;


        grass.castShadow =
            true;


        grass.receiveShadow =
            true;


        world.add(
            grass
        );


        // =====================================================
        // PYRAMIDS
        // =====================================================

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

                        color:
                            color,

                        roughness:
                            0.9,

                        metalness:
                            0.02,

                        flatShading:
                            true
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


        // Distant.

        addPyramid(
            -17,
            5.1,
            -19,
            7.8,
            11.1,
            7.8,
            0x875033
        );


        addPyramid(
            17,
            5,
            -20,
            7.4,
            10.7,
            7.4,
            0x7c4a32
        );


        addPyramid(
            0,
            4.2,
            -24,
            6.6,
            8.8,
            6.6,
            0x704832
        );


        // Middle.

        addPyramid(
            -10.5,
            3.7,
            -12,
            5.2,
            7.2,
            5.2,
            0x594338
        );


        addPyramid(
            10.5,
            3.6,
            -12.5,
            5.5,
            7.5,
            5.5,
            0x584237
        );


        addPyramid(
            0,
            2.7,
            -16,
            4.3,
            5.7,
            4.3,
            0x504036
        );


        // Foreground.

        addPyramid(
            -8.8,
            2.2,
            -5.8,
            3.7,
            4.8,
            3.1,
            0x302924
        );


        addPyramid(
            8.8,
            2.1,
            -5.7,
            3.7,
            4.7,
            3.1,
            0x2d2824
        );


        addPyramid(
            -14,
            1.6,
            -4.5,
            2.7,
            3.2,
            2.3,
            0x352a25
        );


        addPyramid(
            14,
            1.6,
            -4.2,
            2.7,
            3.3,
            2.3,
            0x342a25
        );


        // =====================================================
        // GREEN VALLEY
        // =====================================================

        const valley =
            new THREE.Mesh(

                new THREE.PlaneGeometry(
                    14,
                    8
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0x55781f,

                    roughness:
                        1,

                    flatShading:
                        true
                })
            );


        valley.rotation.x =
            -Math.PI / 2;


        valley.position.set(
            0,
            0.025,
            -4.5
        );


        world.add(
            valley
        );


        // =====================================================
        // ARENA
        // =====================================================

        const arena =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    5.7,
                    6.3,
                    0.38,
                    56
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0x26323a,

                    roughness:
                        0.5,

                    metalness:
                        0.3,

                    flatShading:
                        true
                })
            );


        arena.position.set(
            0,
            0.15,
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
                    5,
                    5.3,
                    0.13,
                    56
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0x10202a,

                    roughness:
                        0.72,

                    metalness:
                        0.18
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


        // =====================================================
        // ARENA RINGS
        // =====================================================

        const ringMaterial =
            new THREE.MeshBasicMaterial({

                color:
                    0x35c3ef,

                transparent:
                    true,

                opacity:
                    0.7
            });


        const arenaRings = [];


        for (
            let i = 0;
            i < 2;
            i++
        ) {

            const ring =
                new THREE.Mesh(

                    new THREE.TorusGeometry(
                        3.7 +
                        i *
                        0.72,

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
                0.43 +
                i *
                0.015,
                1.05
            );


            ring.scale.z =
                0.69;


            world.add(
                ring
            );


            arenaRings.push(
                ring
            );
        }


        // =====================================================
        // CANNON
        // =====================================================

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

                color:
                    0x101820,

                roughness:
                    0.28,

                metalness:
                    0.86
            });


        const metalBlue =
            new THREE.MeshStandardMaterial({

                color:
                    0x0d628f,

                roughness:
                    0.25,

                metalness:
                    0.6
            });


        const cyanMetal =
            new THREE.MeshStandardMaterial({

                color:
                    0x35a8ce,

                emissive:
                    0x064252,

                emissiveIntensity:
                    0.75,

                roughness:
                    0.2,

                metalness:
                    0.48
            });


        // Base.

        const cannonBase =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    2.55,
                    0.55,
                    1.9
                ),

                metalDark
            );


        cannonBase.position.y =
            0.34;


        cannonBase.castShadow =
            true;


        cannon.add(
            cannonBase
        );


        // Top.

        const cannonTop =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    2.18,
                    0.15,
                    2.03
                ),

                metalBlue
            );


        cannonTop.position.y =
            0.63;


        cannonTop.castShadow =
            true;


        cannon.add(
            cannonTop
        );


        // Dome.

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

                    color:
                        0x0d8bc3,

                    emissive:
                        0x06425d,

                    emissiveIntensity:
                        0.65,

                    transparent:
                        true,

                    opacity:
                        0.94,

                    roughness:
                        0.16,

                    metalness:
                        0.35
                })
            );


        dome.position.y =
            0.69;


        dome.castShadow =
            true;


        cannon.add(
            dome
        );


        // Dome ring.

        const domeRing =
            new THREE.Mesh(

                new THREE.TorusGeometry(
                    0.91,
                    0.055,
                    8,
                    24
                ),

                cyanMetal
            );


        domeRing.rotation.x =
            Math.PI / 2;


        domeRing.position.y =
            0.69;


        cannon.add(
            domeRing
        );


        // Axle.

        const axle =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    0.18,
                    0.18,
                    2.45,
                    16
                ),

                metalDark
            );


        axle.rotation.z =
            Math.PI / 2;


        axle.position.y =
            0.29;


        axle.castShadow =
            true;


        cannon.add(
            axle
        );


        // Wheels.

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


        // Barrel assembly.

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
                0.20,
                0.20,
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

                        color:
                            0xffefae,

                        transparent:
                            true,

                        opacity:
                            0,

                        depthWrite:
                            false
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


        // Cannon core.

        const cannonCore =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    0.14,
                    12,
                    12
                ),

                new THREE.MeshBasicMaterial({
                    color:
                        0x9ff4ff
                })
            );


        cannonCore.position.set(
            0,
            0.95,
            0.73
        );


        cannon.add(
            cannonCore
        );


        // Cannon light.

        const cannonGlow =
            new THREE.PointLight(
                0x35d7ff,
                2.5,
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


        // =====================================================
        // UI
        // =====================================================

        const ui = {

            intro:
                $('intro-screen'),

            introButton:
                $('intro-btn'),


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

            startButton:
                $('start-btn'),


            startCoins:
                $('start-coins'),

            best:
                $('start-best-score'),


            powerButton:
                $('buy-power-btn'),

            rateButton:
                $('buy-rate-btn'),

            magnetButton:
                $('buy-magnet-btn'),


            powerLevel:
                $('power-lvl-text'),

            rateLevel:
                $('rate-lvl-text'),

            magnetLevel:
                $('magnet-lvl-text'),


            combat:
                $('combat-ui'),

            wave:
                $('wave-badge'),

            combo:
                $('combo-badge'),


            pauseButton:
                $('pause-btn'),

            pauseScreen:
                $('pause-screen'),

            resumeButton:
                $('resume-btn'),


            gameOver:
                $('game-over-screen'),

            restartButton:
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


        // =====================================================
        // GAME VARIABLES
        // =====================================================

        let score =
            0;


        let coins =
            parseInt(
                localStorage.getItem(
                    'bb3d_coins'
                ) ||
                '0',
                10
            ) ||
            0;


        let bestScore =
            parseInt(
                localStorage.getItem(
                    'bb3d_best'
                ) ||
                '0',
                10
            ) ||
            0;


        let level =
            1;


        let playerHp =
            1000;


        /*
         * DEFAULT POWER
         *
         * The cannon starts a little stronger
         * than the original version.
         */

        let powerLevel =
            parseInt(
                localStorage.getItem(
                    'bb3d_upg_power'
                ) ||
                '1',
                10
            ) ||
            1;


        let rateLevel =
            parseInt(
                localStorage.getItem(
                    'bb3d_upg_rate'
                ) ||
                '1',
                10
            ) ||
            1;


        let magnetLevel =
            parseInt(
                localStorage.getItem(
                    'bb3d_upg_magnet'
                ) ||
                '0',
                10
            ) ||
            0;


        /*
         * +1 gives the cannon a small
         * starting damage increase.
         */

        let firePower =
            powerLevel +
            1;


        let fireRate =
            1 +
            (
                rateLevel -
                1
            ) *
            0.25;


        let started =
            false;


        let paused =
            false;


        let gameOver =
            false;


        let introFinished =
            false;


        let dragging =
            false;


        let targetX =
            0;


        let lastShotTime =
            0;


        let waveTimer =
            0;


        let combo =
            0;


        let comboTimer =
            0;


        let recoil =
            0;


        let cameraShake =
            0;


        let elapsed =
            0;


        let saveTimer =
            0;


        let introTimeout =
            null;


        const bullets = [];

        const rocks = [];

        const droppedCoins = [];


        // =====================================================
        // SAVE
        // =====================================================

        function saveGame() {

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


        // =====================================================
        // UPDATE UI
        // =====================================================

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
                    Math.ceil(
                        playerHp
                    )
                )} / 1000`;


            ui.hpBar.style.width =
                `${clamp(
                    playerHp / 10,
                    0,
                    100
                )}%`;


            ui.startCoins.textContent =
                coins;


            ui.best.textContent =
                bestScore;


            ui.powerLevel.textContent =
                `Lvl ${powerLevel}`;


            ui.rateLevel.textContent =
                `Lvl ${rateLevel}`;


            ui.magnetLevel.textContent =
                `Lvl ${magnetLevel}`;


            ui.powerButton.textContent =
                `${powerLevel * 50} C`;


            ui.rateButton.textContent =
                `${rateLevel * 60} C`;


            ui.magnetButton.textContent =
                `${(magnetLevel + 1) * 100} C`;


            ui.powerButton.disabled =
                coins <
                powerLevel * 50;


            ui.rateButton.disabled =
                coins <
                rateLevel * 60;


            ui.magnetButton.disabled =
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


        // =====================================================
        // INTRO
        // =====================================================

        function enterGameMenu() {

            if (
                introFinished
            ) {

                return;
            }


            introFinished =
                true;


            if (
                introTimeout
            ) {

                clearTimeout(
                    introTimeout
                );
            }


            ui.intro.classList.add(
                'intro-hidden'
            );


            setTimeout(
                () => {

                    ui.start.classList.remove(
                        'hidden'
                    );

                },
                450
            );
        }


        ui.introButton.addEventListener(
            'click',
            enterGameMenu
        );


        introTimeout =
            setTimeout(
                enterGameMenu,
                5200
            );


        // =====================================================
        // AUDIO
        // =====================================================

        let audioContext =
            null;


        function playSound(
            type
        ) {

            const AudioClass =
                window.AudioContext ||
                window.webkitAudioContext;


            if (
                !AudioClass
            ) {

                return;
            }


            if (
                !audioContext
            ) {

                try {

                    audioContext =
                        new AudioClass();

                } catch (
                    error
                ) {

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
                    now +
                    0.08
                );


                gain.gain.setValueAtTime(
                    0.045,
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
                    160,
                    now
                );


                oscillator.frequency.exponentialRampToValueAtTime(
                    42,
                    now +
                    0.09
                );


                gain.gain.setValueAtTime(
                    0.065,
                    now
                );


                gain.gain.exponentialRampToValueAtTime(
                    0.001,
                    now +
                    0.1
                );


                oscillator.start(
                    now
                );


                oscillator.stop(
                    now +
                    0.1
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
                    now +
                    0.055
                );


                gain.gain.setValueAtTime(
                    0.06,
                    now
                );


                gain.gain.exponentialRampToValueAtTime(
                    0.001,
                    now +
                    0.15
                );


                oscillator.start(
                    now
                );


                oscillator.stop(
                    now +
                    0.15
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
                    now +
                    0.07
                );


                oscillator.frequency.setValueAtTime(
                    1040,
                    now +
                    0.14
                );


                gain.gain.setValueAtTime(
                    0.05,
                    now
                );


                gain.gain.exponentialRampToValueAtTime(
                    0.001,
                    now +
                    0.28
                );


                oscillator.start(
                    now
                );


                oscillator.stop(
                    now +
                    0.28
                );
            }
        }


        // =====================================================
        // BULLETS
        // =====================================================

        const bulletCoreGeometry =
            new THREE.SphereGeometry(
                0.17,
                10,
                10
            );


        const bulletCoreMaterial =
            new THREE.MeshBasicMaterial({

                color:
                    0xffefa5
            });


        const bulletGlowGeometry =
            new THREE.SphereGeometry(
                0.31,
                8,
                8
            );


        const bulletGlowMaterial =
            new THREE.MeshBasicMaterial({

                color:
                    0xffa63d,

                transparent:
                    true,

                opacity:
                    0.27,

                depthWrite:
                    false
            });


        function spawnBullet(
            x
        ) {

            const group =
                new THREE.Group();


            const core =
                new THREE.Mesh(
                    bulletCoreGeometry,
                    bulletCoreMaterial
                );


            const glow =
                new THREE.Mesh(
                    bulletGlowGeometry,
                    bulletGlowMaterial
                );


            group.add(
                core
            );


            group.add(
                glow
            );


            // Trail.

            for (
                let i = 0;
                i < 3;
                i++
            ) {

                const trail =
                    new THREE.Mesh(

                        new THREE.SphereGeometry(
                            0.13 -
                            i *
                            0.025,
                            8,
                            8
                        ),

                        new THREE.MeshBasicMaterial({

                            color:
                                0xffd477,

                            transparent:
                                true,

                            opacity:
                                0.17 -
                                i *
                                0.04,

                            depthWrite:
                                false
                        })
                    );


                trail.position.y =
                    -(
                        i +
                        1
                    ) *
                    0.22;


                group.add(
                    trail
                );
            }


            group.position.set(
                x,
                2.25,
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


        // =====================================================
        // ROCKS
        // =====================================================

        const rockGeometry =
            new THREE.IcosahedronGeometry(
                1,
                1
            );


        const rockPositions =
            rockGeometry.attributes.position;


        for (
            let i = 0;
            i <
            rockPositions.count;
            i++
        ) {

            const factor =
                0.78 +
                (
                    (i * 7) %
                    13
                ) /
                30;


            rockPositions.setXYZ(

                i,

                rockPositions.getX(i) *
                    factor,

                rockPositions.getY(i) *
                    (
                        0.86 +
                        (i % 5) /
                        25
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

                color:
                    0x6d655a,

                roughness:
                    0.91,

                flatShading:
                    true
            }),


            new THREE.MeshStandardMaterial({

                color:
                    0x745039,

                roughness:
                    0.94,

                flatShading:
                    true
            }),


            new THREE.MeshStandardMaterial({

                color:
                    0x515e63,

                roughness:
                    0.84,

                metalness:
                    0.04,

                flatShading:
                    true
            })
        ];


        const hpTextureCache =
            new Map();


        function getHpTexture(
            value
        ) {

            const text =
                String(
                    Math.max(
                        0,
                        Math.ceil(
                            value
                        )
                    )
                );


            if (
                hpTextureCache.has(
                    text
                )
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
                'rgba(0,0,0,0.85)';


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
            materialIndex =
                0
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
                rand(
                    0.72,
                    1
                )
            );


            rock.scale.set(
                size,
                size *
                1.12,
                size
            );


            rock.rotation.set(
                rand(-1, 1),
                rand(
                    0,
                    Math.PI * 2
                ),
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

                        transparent:
                            true,

                        depthWrite:
                            false
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


            /*
             * IMPORTANT:
             *
             * Gravity is intentionally
             * slower than before.
             *
             * Bounce velocity is restored
             * every time the rock reaches
             * the floor, so it keeps bouncing
             * until destroyed.
             */

            rock.userData = {

                hp:
                    hpValue,

                maxHp:
                    hpValue,

                size:
                    size,

                vx:
                    rand(
                        -1.15,
                        1.15
                    ),

                vy:
                    rand(
                        -1.0,
                        0.15
                    ),

                coolDown:
                    0,

                rotationX:
                    rand(
                        -1.1,
                        1.1
                    ),

                rotationY:
                    rand(
                        -1.0,
                        1.0
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


        function removeRock(
            index
        ) {

            const rock =
                rocks[index];


            if (
                !rock
            ) {

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


        // =====================================================
        // COINS
        // =====================================================

        const coinGeometry =
            new THREE.CylinderGeometry(
                0.29,
                0.29,
                0.10,
                16
            );


        const coinMaterial =
            new THREE.MeshStandardMaterial({

                color:
                    0xf3b516,

                emissive:
                    0x704400,

                emissiveIntensity:
                    0.2,

                metalness:
                    0.88,

                roughness:
                    0.17
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
                1
            );


            coin.castShadow =
                true;


            coin.userData = {

                vy:
                    rand(
                        1.3,
                        2.3
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


            glow.position.z =
                0.16;


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


        // =====================================================
        // PARTICLES
        // =====================================================

        const PARTICLE_COUNT =
            200;


        const particlePositions =
            new Float32Array(
                PARTICLE_COUNT * 3
            );


        const particleVX =
            new Float32Array(
                PARTICLE_COUNT
            );


        const particleVY =
            new Float32Array(
                PARTICLE_COUNT
            );


        const particleVZ =
            new Float32Array(
                PARTICLE_COUNT
            );


        const particleLife =
            new Float32Array(
                PARTICLE_COUNT
            );


        const particleGeometry =
            new THREE.BufferGeometry();


        particleGeometry.setAttribute(

            'position',

            new THREE.BufferAttribute(
                particlePositions,
                3
            )
        );


        const particleMaterial =
            new THREE.PointsMaterial({

                color:
                    0xffcd76,

                size:
                    0.13,

                transparent:
                    true,

                opacity:
                    0.9,

                depthWrite:
                    false
            });


        const particles =
            new THREE.Points(
                particleGeometry,
                particleMaterial
            );


        scene.add(
            particles
        );


        function createBurst(
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
                    p < PARTICLE_COUNT;
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
                    index <
                    0
                ) {

                    break;
                }


                const angle =
                    Math.random() *
                    Math.PI *
                    2;


                const speed =
                    rand(
                        1.5,
                        5.1
                    );


                particlePositions[
                    index * 3
                ] =
                    x;


                particlePositions[
                    index * 3 + 1
                ] =
                    y;


                particlePositions[
                    index * 3 + 2
                ] =
                    1;


                particleVX[index] =
                    Math.cos(angle) *
                    speed;


                particleVY[index] =
                    rand(
                        1.4,
                        4.6
                    );


                particleVZ[index] =
                    Math.sin(angle) *
                    speed *
                    0.22;


                particleLife[index] =
                    rand(
                        0.22,
                        0.58
                    );
            }


            particleGeometry
                .attributes
                .position
                .needsUpdate =
                true;
        }


        // =====================================================
        // SHOCKWAVES
        // =====================================================

        const shockwaves =
            [];


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

                        color:
                            0xffd166,

                        transparent:
                            true,

                        opacity:
                            0,

                        depthWrite:
                            false
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
                    0.28,

                scale:
                    1
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


            if (
                !shock
            ) {

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
                0.18 *
                scale
            );


            shock.material.opacity =
                0.85;


            shock.userData.life =
                shock.userData.maxLife;


            shock.userData.scale =
                scale;
        }


        function updateEffects(
            dt
        ) {

            // Particles.

            for (
                let i = 0;
                i < PARTICLE_COUNT;
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


                particlePositions[
                    i * 3
                ] +=
                    particleVX[i] *
                    dt;


                particlePositions[
                    i * 3 + 1
                ] +=
                    particleVY[i] *
                    dt;


                particlePositions[
                    i * 3 + 2
                ] +=
                    particleVZ[i] *
                    dt;


                particleVY[i] -=
                    8.5 *
                    dt;
            }


            particleGeometry
                .attributes
                .position
                .needsUpdate =
                true;


            // Shockwaves.

            for (
                const shock of
                shockwaves
            ) {

                if (
                    !shock.visible
                ) {

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
                        1 -
                        progress
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


        // =====================================================
        // CLEAR OBJECTS
        // =====================================================

        function clearGameObjects() {

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


        // =====================================================
        // SPAWN WAVE
        // =====================================================

        function spawnWave() {

            const count =
                Math.min(

                    3 +
                    Math.floor(
                        (
                            level -
                            1
                        ) *
                        0.55
                    ),

                    7
                );


            const baseHp =
                18 +
                level *
                8;


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

                    12 +
                    i *
                    rand(
                        1.25,
                        1.8
                    ),

                    hpValue,

                    size,

                    i % 3
                );
            }


            // Boss.

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


        // =====================================================
        // START GAME
        // =====================================================

        function startGame() {

            if (
                !introFinished
            ) {

                enterGameMenu();

                return;
            }


            clearGameObjects();


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


            playerHp =
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


            ui.gameOver.classList.add(
                'hidden'
            );


            ui.pauseButton.classList.remove(
                'hidden'
            );


            ui.combat.classList.remove(
                'hidden'
            );


            updateUI();


            spawnWave();
        }


        // =====================================================
        // END GAME
        // =====================================================

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


            saveGame();


            ui.finalScore.textContent =
                score;


            ui.finalLevel.textContent =
                level;


            ui.finalCoins.textContent =
                coins;


            ui.pauseButton.classList.add(
                'hidden'
            );


            ui.combat.classList.add(
                'hidden'
            );


            ui.gameOver.classList.remove(
                'hidden'
            );


            updateUI();
        }


        // =====================================================
        // PAUSE
        // =====================================================

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


            ui.pauseButton.classList.toggle(
                'hidden',
                paused
            );
        }


        // =====================================================
        // BUTTONS
        // =====================================================

        ui.startButton.addEventListener(
            'click',
            startGame
        );


        ui.restartButton.addEventListener(
            'click',
            startGame
        );


        ui.pauseButton.addEventListener(
            'click',
            togglePause
        );


        ui.resumeButton.addEventListener(
            'click',
            togglePause
        );


        // =====================================================
        // POWER UPGRADE
        // =====================================================

        ui.powerButton.addEventListener(
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


                firePower =
                    powerLevel +
                    1;


                saveGame();


                updateUI();
            }
        );


        // =====================================================
        // RATE UPGRADE
        // =====================================================

        ui.rateButton.addEventListener(
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
                        rateLevel -
                        1
                    ) *
                    0.25;


                saveGame();


                updateUI();
            }
        );


        // =====================================================
        // MAGNET UPGRADE
        // =====================================================

        ui.magnetButton.addEventListener(
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


                saveGame();


                updateUI();
            }
        );


        // =====================================================
        // INPUT
        // =====================================================

        function setTargetX(
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


        // =====================================================
        // FIRE
        // =====================================================

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


            // Stronger recoil.

            recoil =
                0.20;


            // Stronger camera response.

            cameraShake =
                Math.min(
                    0.28,
                    cameraShake +
                    0.04
                );


            cannonGlow.intensity =
                4.6;


            createBurst(
                cannon.position.x,
                2,
                4
            );


            playSound(
                'shoot'
            );
        }


        // =====================================================
        // DAMAGE PLAYER
        // =====================================================

        function damagePlayer(
            amount
        ) {

            playerHp -=
                amount;


            combo =
                0;


            comboTimer =
                0;


            cameraShake =
                Math.min(
                    0.5,
                    cameraShake +
                    0.18
                );


            ui.damageFlash.style.opacity =
                '0.52';


            setTimeout(
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
                playerHp <=
                0
            ) {

                endGame();
            }
        }


        // =====================================================
        // GAME UPDATE
        // =====================================================

        function updateGame(
            dt,
            time
        ) {

            // =================================================
            // CANNON
            // =================================================

            cannon.position.x += (

                targetX -
                cannon.position.x

            ) *
            Math.min(
                1,
                dt *
                14
            );


            recoil =
                Math.max(
                    0,
                    recoil -
                    dt *
                    3.3
                );


            barrelAssembly.position.y =
                0.75 -
                recoil;


            cannonGlow.intensity += (

                1.7 -
                cannonGlow.intensity

            ) *
            Math.min(
                1,
                dt *
                9
            );


            domeRing.rotation.z +=
                dt *
                0.28;


            // Arena animation.

            for (
                let i = 0;
                i < arenaRings.length;
                i++
            ) {

                arenaRings[i].rotation.z +=
                    dt *
                    (
                        i === 0
                            ? 0.25
                            : -0.18
                    );
            }


            // =================================================
            // MUZZLE FLASH
            // =================================================

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
                    dt *
                    16;


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


            // =================================================
            // AUTOMATIC FIRE
            // =================================================

            if (
                time -
                lastShotTime >=
                1000 /
                (
                    fireRate *
                    4
                )
            ) {

                fire();


                lastShotTime =
                    time;
            }


            // =================================================
            // BULLETS
            // =================================================

            for (
                let i =
                    bullets.length - 1;

                i >= 0;

                i--
            ) {

                const bullet =
                    bullets[i];


                bullet.position.y +=
                    24 *
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

                    continue;
                }


                const pulse =
                    1 +
                    Math.sin(
                        elapsed *
                        24 +
                        i
                    ) *
                    0.12;


                bullet.children[1]
                    .scale.setScalar(
                        pulse
                    );
            }


            // =================================================
            // ROCKS
            // =================================================

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


                // =================================================
                // SLOWER GRAVITY
                // =================================================

                const rockGravity =
                    8.5 +
                    level *
                    0.035;


                data.vy -=
                    rockGravity *
                    dt;


                // Movement.

                rock.position.x +=
                    data.vx *
                    dt;


                rock.position.y +=
                    data.vy *
                    dt;


                // Rotation.

                rock.rotation.x +=
                    data.rotationX *
                    dt;


                rock.rotation.y +=
                    data.rotationY *
                    dt;


                // =================================================
                // REPEATING FLOOR BOUNCE
                // =================================================

                const floorHeight =
                    0.48 +
                    data.size;


                if (
                    rock.position.y <
                    floorHeight
                ) {

                    rock.position.y =
                        floorHeight;


                    /*
                     * The rock receives a fresh
                     * upward velocity every time
                     * it touches the floor.
                     *
                     * This means it will continue
                     * bouncing until it is destroyed.
                     */

                    const bounceStrength =
                        Math.min(
                            5.2,
                            3.9 +
                            level *
                            0.025
                        );


                    data.vy =
                        Math.max(
                            bounceStrength,

                            Math.abs(
                                data.vy
                            ) *
                            0.72
                        );


                    data.vx *=
                        0.985;


                    // Small dust effect.

                    createBurst(
                        rock.position.x,
                        0.48,
                        2
                    );
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


                    const impactX =
                        bullet.position.x;


                    const impactY =
                        bullet.position.y;


                    removeBullet(
                        b
                    );


                    // Damage.

                    data.hp -=
                        firePower;


                    // Combo.

                    combo =
                        Math.min(
                            50,
                            combo +
                            1
                        );


                    comboTimer =
                        1.15;


                    // Score.

                    score +=
                        firePower *
                        Math.max(
                            1,
                            combo
                        );


                    // Stronger hit feedback.

                    cameraShake =
                        Math.min(
                            0.28,
                            cameraShake +
                            0.04
                        );


                    createBurst(
                        impactX,
                        impactY,
                        6
                    );


                    createShockwave(
                        impactX,
                        impactY,
                        0.55
                    );


                    playSound(
                        'hit'
                    );


                    // =================================================
                    // ROCK DESTROYED
                    // =================================================

                    if (
                        data.hp <=
                        0
                    ) {

                        // Reward.

                        coins +=
                            5 +
                            Math.min(
                                level,
                                20
                            );


                        // Split large rocks.

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


                        // Coin.

                        spawnCoin(
                            rock.position.x,
                            rock.position.y +
                            0.2
                        );


                        // Explosion.

                        createBurst(
                            rock.position.x,
                            rock.position.y,
                            18
                        );


                        createShockwave(
                            rock.position.x,
                            rock.position.y,
                            1.1 +
                            data.size *
                            0.3
                        );


                        cameraShake =
                            Math.min(
                                0.42,
                                cameraShake +
                                0.09
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


                /*
                 * If this rock was removed from
                 * the array, do not continue using
                 * its old data.
                 */

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
                            rand(
                                -1,
                                1
                            )
                        ) *
                        1.7;


                    damagePlayer(
                        20
                    );


                    createBurst(
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


            // =================================================
            // COINS
            // =================================================

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


                    createBurst(
                        coin.position.x,
                        coin.position.y,
                        7
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


            // =================================================
            // PARTICLES
            // =================================================

            updateEffects(
                dt
            );


            // =================================================
            // COMBO
            // =================================================

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


            // =================================================
            // NEXT WAVE
            // =================================================

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


            // =================================================
            // CAMERA SHAKE
            // =================================================

            cameraShake *=
                Math.max(
                    0,
                    1 -
                    dt *
                    7
                );


            const shakeX =
                rand(
                    -cameraShake,
                    cameraShake
                );


            const shakeY =
                rand(
                    -cameraShake *
                    0.35,

                    cameraShake *
                    0.35
                );


            camera.position.x += (

                cannon.position.x *
                0.05 +

                shakeX -

                camera.position.x

            ) *
            Math.min(
                1,
                dt *
                5
            );


            camera.position.y += (

                cameraY +
                shakeY -
                camera.position.y

            ) *
            Math.min(
                1,
                dt *
                4
            );


            camera.position.z += (

                cameraZ -
                camera.position.z

            ) *
            Math.min(
                1,
                dt *
                4
            );


            camera.lookAt(

                cannon.position.x *
                0.025,

                5.1,

                0
            );


            // =================================================
            // LIGHT ANIMATION
            // =================================================

            sunsetLight.intensity =
                2.8 +
                Math.sin(
                    elapsed *
                    0.42
                ) *
                0.12;


            cannonLight.intensity =
                2 +
                Math.sin(
                    elapsed *
                    2
                ) *
                0.18;


            // Gentle grass sway.

            grass.rotation.y =
                Math.sin(
                    elapsed *
                    1.6
                ) *
                0.012;


            elapsed +=
                dt;
        }


        // =====================================================
        // MAIN LOOP
        // =====================================================

        let lastFrameTime =
            performance.now();


        function animate(
            time
        ) {

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
                            lastFrameTime
                        ) /
                        1000
                    )
                );


            lastFrameTime =
                time;


            if (
                started &&
                !paused &&
                !gameOver
            ) {

                updateGame(
                    dt,
                    time
                );

            } else {

                updateEffects(
                    dt
                );
            }


            saveTimer +=
                dt;


            if (
                saveTimer >
                2
            ) {

                saveGame();


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

    }
);