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

        const $ = (
            id
        ) => {

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
        // MOBILE QUALITY PROFILE
        // =====================================================

        const isMobile =
            /Android|iPhone|iPad|iPod/i
                .test(
                    navigator.userAgent
                );


        /*
         * Keep the game mobile-first.
         *
         * We use a smaller internal render resolution
         * on weaker phones while keeping the canvas
         * visually full-screen.
         */

        const memory =
            navigator.deviceMemory ||
            4;


        const cores =
            navigator.hardwareConcurrency ||
            4;


        let quality;


        if (
            memory <= 2 ||
            cores <= 4
        ) {

            quality = 0;

        } else if (
            memory <= 4
        ) {

            quality = 1;

        } else {

            quality = 2;
        }


        if (
            !isMobile
        ) {

            quality =
                Math.min(
                    quality,
                    1
                );
        }


        const QUALITY = {

            0: {
                renderScale: 0.70,
                shadowMap: 256,
                grassCount: 300,
                particleCount: 90,
                backgroundDetails: 0.65
            },

            1: {
                renderScale: 0.82,
                shadowMap: 512,
                grassCount: 430,
                particleCount: 125,
                backgroundDetails: 0.82
            },

            2: {
                renderScale: 0.92,
                shadowMap: 768,
                grassCount: 560,
                particleCount: 160,
                backgroundDetails: 1
            }
        }[quality];


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
                48,
                window.innerWidth /
                window.innerHeight,
                0.1,
                180
            );


        let screenLimitX =
            4.6;


        let cameraY =
            10.5;


        let cameraZ =
            22.5;


        // =====================================================
        // RENDERER
        // =====================================================

        const renderer =
            new THREE.WebGLRenderer({

                antialias:
                    quality >= 1,

                powerPreference:
                    'high-performance',

                preserveDrawingBuffer:
                    false
            });


        renderer.outputEncoding =
            THREE.sRGBEncoding;


        renderer.toneMapping =
            THREE.ACESFilmicToneMapping;


        renderer.toneMappingExposure =
            1.08;


        renderer.shadowMap.enabled =
            true;


        renderer.shadowMap.type =
            THREE.PCFSoftShadowMap;


        document.body.appendChild(
            renderer.domElement
        );


        // =====================================================
        // MOBILE RENDERING
        // =====================================================

        function applyMobileResolution() {

            /*
             * Instead of forcing a 1080x1920 buffer
             * on every phone, render at the current
             * viewport multiplied by a mobile quality
             * scale.
             *
             * This is much lighter on the GPU.
             */

            renderer.setPixelRatio(
                QUALITY.renderScale
            );


            renderer.setSize(
                window.innerWidth,
                window.innerHeight,
                false
            );
        }


        // =====================================================
        // CAMERA RESIZE
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


            /*
             * The game is designed around
             * a portrait mobile composition.
             */

            if (
                aspect < 0.56
            ) {

                screenLimitX =
                    3.95;

                cameraY =
                    13.2;

                cameraZ =
                    27.2;

            } else if (
                aspect < 0.70
            ) {

                screenLimitX =
                    4.35;

                cameraY =
                    12.2;

                cameraZ =
                    25.4;

            } else {

                screenLimitX =
                    4.7;

                cameraY =
                    10.5;

                cameraZ =
                    22.5;
            }


            camera.position.set(
                0,
                cameraY,
                cameraZ
            );


            camera.lookAt(
                0,
                5.4,
                0
            );


            camera.updateProjectionMatrix();


            applyMobileResolution();
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
        // LANDSCAPE WARNING
        // =====================================================

        const landscapeWarning =
            $('landscape-warning');


        function updateOrientation() {

            const landscape =
                window.innerWidth >
                window.innerHeight;


            landscapeWarning.classList.toggle(
                'hidden',
                !landscape
            );
        }


        updateOrientation();


        window.addEventListener(
            'resize',
            updateOrientation,
            {
                passive:
                    true
            }
        );


        window.addEventListener(
            'orientationchange',
            () => {

                setTimeout(
                    updateOrientation,
                    120
                );
            },
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
                '#646f79'
            );


            gradient.addColorStop(
                0.18,
                '#827b76'
            );


            gradient.addColorStop(
                0.38,
                '#a96e56'
            );


            gradient.addColorStop(
                0.56,
                '#dc8f50'
            );


            gradient.addColorStop(
                0.76,
                '#f6bb58'
            );


            gradient.addColorStop(
                1,
                '#f4d17b'
            );


            ctx.fillStyle =
                gradient;


            ctx.fillRect(
                0,
                0,
                canvas.width,
                canvas.height
            );


            for (
                let i = 0;
                i < 14;
                i++
            ) {

                const y =
                    80 +
                    i * 50;


                const cloud =
                    ctx.createLinearGradient(
                        0,
                        y,
                        8,
                        y + 28
                    );


                cloud.addColorStop(
                    0,
                    'rgba(255,255,255,0)'
                );


                cloud.addColorStop(
                    0.35,
                    'rgba(255,230,205,0.08)'
                );


                cloud.addColorStop(
                    0.58,
                    'rgba(91,80,75,0.12)'
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
                0xd68b57,
                0.0145
            );


        // =====================================================
        // LIGHTING
        // =====================================================

        const hemisphere =
            new THREE.HemisphereLight(
                0xffe8c8,
                0x28170e,
                0.84
            );


        scene.add(
            hemisphere
        );


        const sun =
            new THREE.DirectionalLight(
                0xffedc7,
                1.65
            );


        sun.position.set(
            11,
            22,
            13
        );


        sun.castShadow =
            true;


        sun.shadow.mapSize.set(
            QUALITY.shadowMap,
            QUALITY.shadowMap
        );


        sun.shadow.camera.left =
            -13;


        sun.shadow.camera.right =
            13;


        sun.shadow.camera.top =
            20;


        sun.shadow.camera.bottom =
            -4;


        sun.shadow.camera.near =
            0.5;


        sun.shadow.camera.far =
            55;


        sun.shadow.bias =
            -0.0006;


        scene.add(
            sun
        );


        const blueFill =
            new THREE.DirectionalLight(
                0x89dbff,
                0.24
            );


        blueFill.position.set(
            -12,
            9,
            7
        );


        scene.add(
            blueFill
        );


        const sunsetLight =
            new THREE.PointLight(
                0xffae5c,
                2.35,
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

        const sunDisk =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    2.4,
                    20,
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


        sunDisk.position.set(
            0,
            11,
            -25
        );


        world.add(
            sunDisk
        );


        const sunGlow =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    4.8,
                    16,
                    12
                ),

                new THREE.MeshBasicMaterial({

                    color:
                        0xffbe68,

                    transparent:
                        true,

                    opacity:
                        0.075,

                    depthWrite:
                        false
                })
            );


        sunGlow.position.copy(
            sunDisk.position
        );


        world.add(
            sunGlow
        );


        // =====================================================
        // GRASS FIELD
        // =====================================================

        const grassGround =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    52,
                    0.45,
                    10
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0x4d761b,

                    roughness:
                        1,

                    flatShading:
                        true
                })
            );


        grassGround.position.set(
            0,
            -0.20,
            0.5
        );


        grassGround.receiveShadow =
            true;


        world.add(
            grassGround
        );


        // =====================================================
        // SOIL BELOW GRASS
        // =====================================================

        const soil =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    52,
                    2.4,
                    10
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0x3b2517,

                    roughness:
                        1,

                    flatShading:
                        true
                })
            );


        soil.position.set(
            0,
            -1.55,
            0.5
        );


        soil.receiveShadow =
            true;


        world.add(
            soil
        );


        // =====================================================
        // 3D GRASS
        // =====================================================

        const grassBladeGeometry =
            new THREE.ConeGeometry(
                0.045,
                0.30,
                3
            );


        const grassMaterial =
            new THREE.MeshStandardMaterial({

                color:
                    0x4f7f18,

                roughness:
                    0.96,

                flatShading:
                    true,

                side:
                    THREE.DoubleSide
            });


        const grass =
            new THREE.InstancedMesh(

                grassBladeGeometry,

                grassMaterial,

                QUALITY.grassCount
            );


        const grassDummy =
            new THREE.Object3D();


        for (
            let i = 0;
            i < QUALITY.grassCount;
            i++
        ) {

            /*
             * Keep most grass near the
             * playable foreground.
             */

            let x =
                rand(
                    -18,
                    18
                );


            let z =
                rand(
                    -1.8,
                    2.2
                );


            /*
             * Some blades reach the valley
             * to connect the foreground
             * with the background.
             */

            if (
                i >
                QUALITY.grassCount *
                0.7
            ) {

                x =
                    rand(
                        -7,
                        7
                    );


                z =
                    rand(
                        -7,
                        -2.2
                    );
            }


            grassDummy.position.set(
                x,
                0.03,
                z
            );


            const scale =
                rand(
                    0.70,
                    1.16
                );


            grassDummy.scale.set(
                scale,
                rand(
                    0.75,
                    1.35
                ),
                scale
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
                i,
                grassDummy.matrix
            );
        }


        grass.instanceMatrix.needsUpdate =
            true;


        grass.castShadow =
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
            sx,
            sy,
            sz,
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
                            0.91,

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
                sx,
                sy,
                sz
            );


            pyramid.rotation.y =
                Math.PI / 4;


            pyramid.castShadow =
                quality >= 1;


            pyramid.receiveShadow =
                true;


            world.add(
                pyramid
            );


            return pyramid;
        }


        // Far layer.

        addPyramid(
            -15.5,
            5.2,
            -20,
            7.3,
            10.7,
            7.3,
            0x875237
        );


        addPyramid(
            15.5,
            5.0,
            -20.5,
            7.2,
            10.2,
            7.2,
            0x784a32
        );


        addPyramid(
            0,
            4.3,
            -25,
            6.2,
            8.2,
            6.2,
            0x704831
        );


        // Mid layer.

        addPyramid(
            -9.5,
            3.4,
            -13,
            4.8,
            6.7,
            4.8,
            0x5e483b
        );


        addPyramid(
            9.5,
            3.3,
            -13.4,
            4.9,
            6.8,
            4.9,
            0x594338
        );


        addPyramid(
            0,
            2.6,
            -16.3,
            4.0,
            5.2,
            4.0,
            0x504036
        );


        // Foreground rocks.

        addPyramid(
            -8.5,
            1.9,
            -6,
            3.3,
            4.2,
            2.9,
            0x302a25
        );


        addPyramid(
            8.5,
            1.9,
            -6,
            3.3,
            4.2,
            2.9,
            0x2e2924
        );


        // =====================================================
        // ROCK CLUSTERS
        // =====================================================

        const backgroundRockGeometry =
            new THREE.IcosahedronGeometry(
                0.32,
                0
            );


        const backgroundRockMaterial =
            new THREE.MeshStandardMaterial({

                color:
                    0x65594e,

                roughness:
                    0.94,

                flatShading:
                    true
            });


        function addRockCluster(
            x,
            z,
            count,
            scale
        ) {

            if (
                quality === 0 &&
                count > 5
            ) {

                count = 5;
            }


            const group =
                new THREE.Group();


            for (
                let i = 0;
                i < count;
                i++
            ) {

                const rock =
                    new THREE.Mesh(

                        backgroundRockGeometry,

                        backgroundRockMaterial
                    );


                rock.position.set(

                    rand(
                        -0.9,
                        0.9
                    ),

                    rand(
                        0.12,
                        0.35
                    ),

                    rand(
                        -0.4,
                        0.4
                    )
                );


                rock.scale.set(

                    rand(
                        0.7,
                        1.25
                    ) *
                    scale,

                    rand(
                        0.55,
                        1.15
                    ) *
                    scale,

                    rand(
                        0.7,
                        1.15
                    ) *
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
                    quality >= 1;


                rock.receiveShadow =
                    true;


                group.add(
                    rock
                );
            }


            group.position.set(
                x,
                0,
                z
            );


            world.add(
                group
            );
        }


        addRockCluster(
            -5.8,
            -4.8,
            7,
            1.1
        );


        addRockCluster(
            5.8,
            -4.8,
            7,
            1.1
        );


        addRockCluster(
            -11,
            -8,
            5,
            0.85
        );


        addRockCluster(
            11,
            -8,
            5,
            0.85
        );


        // =====================================================
        // CRYSTALS
        // =====================================================

        const crystalMaterial =
            new THREE.MeshStandardMaterial({

                color:
                    0x32d2e2,

                emissive:
                    0x07566a,

                emissiveIntensity:
                    0.85,

                roughness:
                    0.18,

                metalness:
                    0.32,

                flatShading:
                    true
            });


        function addCrystal(
            x,
            z,
            size
        ) {

            const crystal =
                new THREE.Mesh(

                    new THREE.OctahedronGeometry(
                        1,
                        0
                    ),

                    crystalMaterial
                );


            crystal.position.set(
                x,
                size,
                z
            );


            crystal.scale.set(
                size *
                0.68,

                size *
                1.65,

                size *
                0.68
            );


            crystal.rotation.y =
                rand(
                    0,
                    Math.PI
                );


            crystal.rotation.z =
                rand(
                    -0.2,
                    0.2
                );


            crystal.castShadow =
                quality >= 1;


            world.add(
                crystal
            );
        }


        if (
            quality >= 1
        ) {

            addCrystal(
                -6.2,
                -5,
                0.45
            );


            addCrystal(
                6.2,
                -5,
                0.46
            );


            addCrystal(
                -10.5,
                -8.6,
                0.62
            );


            addCrystal(
                10.5,
                -8.6,
                0.65
            );
        }


        // =====================================================
        // ROUNDED CANNON
        // NO PLATFORM UNDER CANNON
        // CANNON STANDS DIRECTLY ON GRASS
        // =====================================================

        const cannon =
            new THREE.Group();


        cannon.position.set(
            0,
            0,
            1.0
        );


        scene.add(
            cannon
        );


        const cannonDark =
            new THREE.MeshStandardMaterial({

                color:
                    0x101820,

                roughness:
                    0.24,

                metalness:
                    0.88
            });


        const cannonBlue =
            new THREE.MeshStandardMaterial({

                color:
                    0x087db3,

                roughness:
                    0.22,

                metalness:
                    0.61
            });


        const cannonCyan =
            new THREE.MeshStandardMaterial({

                color:
                    0x38b2d4,

                emissive:
                    0x064658,

                emissiveIntensity:
                    0.8,

                roughness:
                    0.17,

                metalness:
                    0.45
            });


        // Rounded lower body.

        const cannonBase =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    1.18,
                    1.28,
                    0.46,
                    28
                ),

                cannonDark
            );


        cannonBase.position.y =
            0.38;


        cannonBase.scale.z =
            0.72;


        cannonBase.castShadow =
            true;


        cannon.add(
            cannonBase
        );


        // Rounded blue body.

        const body =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    1,
                    24,
                    16
                ),

                cannonBlue
            );


        body.position.y =
            0.63;


        body.scale.set(
            1.05,
            0.61,
            0.80
        );


        body.castShadow =
            true;


        cannon.add(
            body
        );


        // Dome.

        const dome =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    0.86,
                    24,
                    16,
                    0,
                    Math.PI * 2,
                    0,
                    Math.PI / 2
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0x0c8fc7,

                    emissive:
                        0x06435e,

                    emissiveIntensity:
                        0.7,

                    transparent:
                        true,

                    opacity:
                        0.95,

                    roughness:
                        0.14,

                    metalness:
                        0.34
                })
            );


        dome.position.y =
            0.83;


        dome.castShadow =
            true;


        cannon.add(
            dome
        );


        // Dome ring.

        const domeRing =
            new THREE.Mesh(

                new THREE.TorusGeometry(
                    0.88,
                    0.052,
                    8,
                    28
                ),

                cannonCyan
            );


        domeRing.rotation.x =
            Math.PI / 2;


        domeRing.position.y =
            0.80;


        cannon.add(
            domeRing
        );


        // =====================================================
        // WHEELS
        // =====================================================

        /*
         * The wheel cylinders use the Z axis,
         * so their circular faces are clearly
         * visible from the camera.
         */

        const wheelOuterGeometry =
            new THREE.CylinderGeometry(
                0.43,
                0.43,
                0.20,
                20
            );


        const wheelHubGeometry =
            new THREE.CylinderGeometry(
                0.15,
                0.15,
                0.225,
                16
            );


        const wheelPositions = [

            [-0.97, 0.35, 1.02],

            [ 0.97, 0.35, 1.02],

            [-0.76, 0.32, 0.52],

            [ 0.76, 0.32, 0.52]
        ];


        const wheels = [];


        for (
            const position of
            wheelPositions
        ) {

            const wheel =
                new THREE.Mesh(

                    wheelOuterGeometry,

                    cannonDark
                );


            wheel.rotation.x =
                Math.PI / 2;


            wheel.position.set(
                position[0],
                position[1],
                position[2]
            );


            wheel.castShadow =
                true;


            cannon.add(
                wheel
            );


            wheels.push(
                wheel
            );


            const hub =
                new THREE.Mesh(

                    wheelHubGeometry,

                    cannonCyan
                );


            hub.rotation.x =
                Math.PI / 2;


            hub.position.set(
                position[0],
                position[1],
                position[2]
            );


            cannon.add(
                hub
            );
        }


        // =====================================================
        // BARREL SYSTEM
        // =====================================================

        const barrelAssembly =
            new THREE.Group();


        barrelAssembly.position.y =
            0.80;


        cannon.add(
            barrelAssembly
        );


        const barrelGeometry =
            new THREE.CylinderGeometry(
                0.15,
                0.20,
                1.42,
                16
            );


        const muzzleGeometry =
            new THREE.CylinderGeometry(
                0.20,
                0.21,
                0.22,
                16
            );


        const muzzleFlashes =
            [];


        for (
            const x of [
                -0.38,
                0.38
            ]
        ) {

            const barrel =
                new THREE.Mesh(
                    barrelGeometry,
                    cannonDark
                );


            barrel.position.set(
                x,
                0.87,
                0.04
            );


            barrel.castShadow =
                true;


            barrelAssembly.add(
                barrel
            );


            const muzzle =
                new THREE.Mesh(
                    muzzleGeometry,
                    cannonBlue
                );


            muzzle.position.set(
                x,
                1.66,
                0.04
            );


            muzzle.castShadow =
                true;


            barrelAssembly.add(
                muzzle
            );


            const muzzleRing =
                new THREE.Mesh(

                    new THREE.TorusGeometry(
                        0.21,
                        0.045,
                        8,
                        20
                    ),

                    cannonCyan
                );


            muzzleRing.rotation.x =
                Math.PI / 2;


            muzzleRing.position.set(
                x,
                1.55,
                0.04
            );


            barrelAssembly.add(
                muzzleRing
            );


            const flash =
                new THREE.Mesh(

                    new THREE.SphereGeometry(
                        0.33,
                        10,
                        8
                    ),

                    new THREE.MeshBasicMaterial({

                        color:
                            0xffedab,

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
                1.85,
                0.04
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
                    0.13,
                    12,
                    12
                ),

                new THREE.MeshBasicMaterial({
                    color:
                        0xa2f4ff
                })
            );


        cannonCore.position.set(
            0,
            1.02,
            0.72
        );


        cannon.add(
            cannonCore
        );


        const cannonGlow =
            new THREE.PointLight(
                0x35d8ff,
                2.3,
                6.5,
                2
            );


        cannonGlow.position.set(
            0,
            1.05,
            1.55
        );


        cannon.add(
            cannonGlow
        );


        // =====================================================
        // UI REFERENCES
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
        // GAME DATA
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
         * Stronger default damage.
         *
         * Level 1 starts at 2 damage.
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


        const bullets =
            [];


        const rocks =
            [];


        const droppedCoins =
            [];


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
        // UI
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
                    Math.ceil(playerHp)
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
                audioContext
                    .createOscillator();


            const gain =
                audioContext
                    .createGain();


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


                oscillator.frequency
                    .setValueAtTime(
                        360,
                        now
                    );


                oscillator.frequency
                    .exponentialRampToValueAtTime(
                        95,
                        now +
                        0.08
                    );


                gain.gain
                    .setValueAtTime(
                        0.04,
                        now
                    );


                gain.gain
                    .exponentialRampToValueAtTime(
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


                oscillator.frequency
                    .setValueAtTime(
                        160,
                        now
                    );


                oscillator.frequency
                    .exponentialRampToValueAtTime(
                        42,
                        now +
                        0.09
                    );


                gain.gain
                    .setValueAtTime(
                        0.06,
                        now
                    );


                gain.gain
                    .exponentialRampToValueAtTime(
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


                oscillator.frequency
                    .setValueAtTime(
                        900,
                        now
                    );


                oscillator.frequency
                    .setValueAtTime(
                        1320,
                        now +
                        0.055
                    );


                gain.gain
                    .setValueAtTime(
                        0.055,
                        now
                    );


                gain.gain
                    .exponentialRampToValueAtTime(
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


                oscillator.frequency
                    .setValueAtTime(
                        520,
                        now
                    );


                oscillator.frequency
                    .setValueAtTime(
                        780,
                        now +
                        0.07
                    );


                oscillator.frequency
                    .setValueAtTime(
                        1040,
                        now +
                        0.14
                    );


                gain.gain
                    .setValueAtTime(
                        0.045,
                        now
                    );


                gain.gain
                    .exponentialRampToValueAtTime(
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
                0.16,
                9,
                9
            );


        const bulletCoreMaterial =
            new THREE.MeshBasicMaterial({
                color:
                    0xfff0ab
            });


        const bulletGlowGeometry =
            new THREE.SphereGeometry(
                0.29,
                7,
                7
            );


        const bulletGlowMaterial =
            new THREE.MeshBasicMaterial({

                color:
                    0xffa943,

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


            group.add(

                new THREE.Mesh(
                    bulletCoreGeometry,
                    bulletCoreMaterial
                ),

                new THREE.Mesh(
                    bulletGlowGeometry,
                    bulletGlowMaterial
                )
            );


            // Short trail.

            for (
                let i = 0;
                i < 2;
                i++
            ) {

                const trail =
                    new THREE.Mesh(

                        new THREE.SphereGeometry(
                            0.11 -
                            i *
                            0.025,

                            7,
                            7
                        ),

                        new THREE.MeshBasicMaterial({

                            color:
                                0xffd378,

                            transparent:
                                true,

                            opacity:
                                0.16 -
                                i *
                                0.045,

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
                1.40
            );


            group.userData.life =
                2.15;


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

                if (
                    bullet.children[i]
                        .material
                ) {

                    bullet.children[i]
                        .material
                        .dispose();
                }
            }


            bullets.splice(
                index,
                1
            );
        }


        // =====================================================
        // ROCK GEOMETRY
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
                    0x6c6459,

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


        // =====================================================
        // HP TEXTURE CACHE
        // =====================================================

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
                '900 40px Rubik,Arial';


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


        // =====================================================
        // ROCK SPAWN
        // =====================================================

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
                rand(
                    0.72,
                    0.96
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
                quality >= 1;


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
                1.3 *
                size,

                0.65 *
                size,

                1
            );


            label.position.z =
                0.85 *
                size;


            rock.add(
                label
            );


            /*
             * Slower falling.
             *
             * The bounce resets on every
             * floor contact.
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
                        -1.05,
                        1.05
                    ),

                vy:
                    rand(
                        -0.9,
                        0.15
                    ),

                coolDown:
                    0,

                rotationX:
                    rand(
                        -1,
                        1
                    ),

                rotationY:
                    rand(
                        -1,
                        1
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
                0.28,
                0.28,
                0.095,
                14
            );


        const coinMaterial =
            new THREE.MeshStandardMaterial({

                color:
                    0xf2b714,

                emissive:
                    0x704500,

                emissiveIntensity:
                    0.22,

                metalness:
                    0.88,

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
                1
            );


            coin.castShadow =
                quality >= 1;


            coin.userData = {

                vy:
                    rand(
                        1.3,
                        2.2
                    ),

                spin:
                    rand(
                        4.5,
                        6.2
                    )
            };


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

        const PARTICLES =
            QUALITY.particleCount;


        const particlePositions =
            new Float32Array(
                PARTICLES * 3
            );


        const particleVX =
            new Float32Array(
                PARTICLES
            );


        const particleVY =
            new Float32Array(
                PARTICLES
            );


        const particleVZ =
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
                particlePositions,
                3
            )
        );


        const particleSystem =
            new THREE.Points(

                particleGeometry,

                new THREE.PointsMaterial({

                    color:
                        0xffcb74,

                    size:
                        quality === 0
                            ? 0.10
                            : 0.12,

                    transparent:
                        true,

                    opacity:
                        0.88,

                    depthWrite:
                        false
                })
            );


        scene.add(
            particleSystem
        );


        function createBurst(
            x,
            y,
            amount = 10
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
                        1.4,
                        4.8
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
                    Math.cos(
                        angle
                    ) *
                    speed;


                particleVY[index] =
                    rand(
                        1.3,
                        4.3
                    );


                particleVZ[index] =
                    Math.sin(
                        angle
                    ) *
                    speed *
                    0.2;


                particleLife[index] =
                    rand(
                        0.22,
                        0.55
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


        const shockGeometry =
            new THREE.TorusGeometry(
                0.48,
                0.042,
                7,
                24
            );


        for (
            let i = 0;
            i < 5;
            i++
        ) {

            const shock =
                new THREE.Mesh(

                    shockGeometry,

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
                    0.25,

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
                    item =>
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
                0.2 *
                scale
            );


            shock.material.opacity =
                0.82;


            shock.userData.life =
                shock.userData.maxLife;


            shock.userData.scale =
                scale;
        }


        function updateEffects(
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
                    8 *
                    dt;
            }


            particleGeometry
                .attributes
                .position
                .needsUpdate =
                true;


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
                        0.20 +
                        progress *
                        3.0
                    ) *
                    shock.userData.scale
                );


                shock.material.opacity =
                    0.82 *
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
        // CLEAR GAME
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

                scene.remove(
                    droppedCoins.pop()
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
        // WAVE
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
                        0.48
                    ),

                    quality === 0
                        ? 5
                        : 7
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
                        1.15
                    ) +
                    Math.min(
                        0.25,
                        level *
                        0.017
                    );


                const hp =
                    Math.floor(

                        baseHp *
                        size *
                        rand(
                            0.86,
                            1.12
                        )
                    );


                spawnRock(

                    rand(
                        -screenLimitX *
                        0.84,

                        screenLimitX *
                        0.84
                    ),

                    11.6 +
                    i *
                    rand(
                        1.25,
                        1.8
                    ),

                    hp,

                    size,

                    i % 3
                );
            }


            if (
                level %
                5 ===
                0
            ) {

                spawnRock(

                    rand(
                        -1.2,
                        1.2
                    ),

                    15,

                    Math.floor(
                        baseHp *
                        2.7
                    ),

                    1.42,

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
        // GAME OVER
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
        // FIRE RATE UPGRADE
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
        // TOUCH INPUT
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
                    1.10,

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


        document.addEventListener(
            'contextmenu',
            event => {
                event.preventDefault();
            }
        );


        // =====================================================
        // FIRE
        // =====================================================

        function fire() {

            spawnBullet(
                cannon.position.x -
                0.38
            );


            spawnBullet(
                cannon.position.x +
                0.38
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
                        1.18
                    )
                );
            }


            // Strong recoil.

            recoil =
                0.20;


            // Strong shot feedback.

            cameraShake =
                Math.min(
                    0.25,
                    cameraShake +
                    0.035
                );


            cannonGlow.intensity =
                4.6;


            createBurst(
                cannon.position.x,
                2,
                3
            );


            playSound(
                'shoot'
            );
        }


        // =====================================================
        // PLAYER DAMAGE
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
                    0.45,
                    cameraShake +
                    0.16
                );


            ui.damageFlash.style.opacity =
                '0.48';


            setTimeout(
                () => {

                    ui.damageFlash.style.opacity =
                        '0';

                },
                80
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
            // CANNON MOVEMENT
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


            // =================================================
            // CANNON ANIMATION
            // =================================================

            recoil =
                Math.max(
                    0,
                    recoil -
                    dt *
                    3.3
                );


            barrelAssembly.position.y =
                0.80 -
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
                0.23;


            // Wheel animation while moving.

            if (
                dragging
            ) {

                for (
                    const wheel of
                    wheels
                ) {

                    wheel.rotation.y +=
                        dt *
                        2.0;
                }
            }


            // =================================================
            // ARENA RINGS REMOVED
            // =================================================

            /*
             * No arena/platform exists under
             * the cannon anymore.
             *
             * The cannon sits directly
             * on the grass.
             */


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
                    17;


                flash.scale.multiplyScalar(
                    0.87
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
            // AUTO FIRE
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
                    24
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
                    0.10;


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
                // SLOWER FALLING
                // =================================================

                const gravity =
                    8.2 +
                    level *
                    0.03;


                data.vy -=
                    gravity *
                    dt;


                rock.position.x +=
                    data.vx *
                    dt;


                rock.position.y +=
                    data.vy *
                    dt;


                rock.rotation.x +=
                    data.rotationX *
                    dt;


                rock.rotation.y +=
                    data.rotationY *
                    dt;


                // =================================================
                // REPEATING BOUNCE
                // =================================================

                const floorHeight =
                    0.46 +
                    data.size;


                if (
                    rock.position.y <
                    floorHeight
                ) {

                    rock.position.y =
                        floorHeight;


                    const bounce =
                        Math.min(
                            5.0,
                            3.8 +
                            level *
                            0.02
                        );


                    data.vy =
                        Math.max(

                            bounce,

                            Math.abs(
                                data.vy
                            ) *
                            0.72
                        );


                    data.vx *=
                        0.985;


                    createBurst(
                        rock.position.x,
                        0.44,
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
                // BULLET COLLISIONS
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
                        0.87;


                    if (
                        dx * dx +
                        dy * dy >
                        radius *
                        radius
                    ) {

                        continue;
                    }


                    const hitX =
                        bullet.position.x;


                    const hitY =
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


                    cameraShake =
                        Math.min(
                            0.25,
                            cameraShake +
                            0.035
                        );


                    createBurst(
                        hitX,
                        hitY,
                        5
                    );


                    createShockwave(
                        hitX,
                        hitY,
                        0.52
                    );


                    playSound(
                        'hit'
                    );


                    // =================================================
                    // DESTROY ROCK
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


                        // Split.

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
                                0.43,

                                rock.position.y +
                                0.15,

                                childHp,

                                childSize,

                                1
                            );


                            spawnRock(

                                rock.position.x +
                                0.43,

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
                            0.18
                        );


                        // Explosion.

                        createBurst(
                            rock.position.x,
                            rock.position.y,
                            quality === 0
                                ? 11
                                : 15
                        );


                        createShockwave(
                            rock.position.x,
                            rock.position.y,
                            1.05 +
                            data.size *
                            0.28
                        );


                        cameraShake =
                            Math.min(
                                0.38,
                                cameraShake +
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
                // CANNON HIT
                // =================================================

                const cannonDx =
                    rock.position.x -
                    cannon.position.x;


                const cannonDy =
                    rock.position.y -
                    1.0;


                const collisionRadius =
                    data.size +
                    0.68;


                if (

                    cannonDx *
                        cannonDx +

                    cannonDy *
                        cannonDy <

                    collisionRadius *
                        collisionRadius &&

                    data.coolDown <=
                        0

                ) {

                    data.coolDown =
                        0.78;


                    data.vy =
                        Math.max(
                            data.vy,
                            4.3
                        );


                    data.vx +=
                        Math.sign(
                            cannonDx ||
                            rand(
                                -1,
                                1
                            )
                        ) *
                        1.5;


                    damagePlayer(
                        20
                    );


                    createBurst(
                        rock.position.x,
                        0.8,
                        7
                    );


                    createShockwave(
                        rock.position.x,
                        0.8,
                        0.72
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
                    1.0 -
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
                                1.3
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
                        9.0 *
                        dt;


                    coin.position.y +=
                        data.vy *
                        dt;


                    if (
                        coin.position.y <
                        0.48
                    ) {

                        coin.position.y =
                            0.48;


                        data.vy =
                            0;
                    }
                }


                coin.rotation.z +=
                    data.spin *
                    dt;


                coin.rotation.y +=
                    data.spin *
                    0.38 *
                    dt;


                if (
                    distanceSq <
                    1.25
                ) {

                    coins +=
                        5;


                    score +=
                        10;


                    createBurst(
                        coin.position.x,
                        coin.position.y,
                        5
                    );


                    playSound(
                        'coin'
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
            // EFFECTS
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
                    0.3,

                    cameraShake *
                    0.3
                );


            camera.position.x += (

                cannon.position.x *
                0.055 +

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
                0.02,

                5.2,

                0
            );


            // =================================================
            // LIGHT ANIMATION
            // =================================================

            sunsetLight.intensity =
                2.35 +
                Math.sin(
                    elapsed *
                    0.4
                ) *
                0.10;


            cannonLight.intensity =
                2.0 +
                Math.sin(
                    elapsed *
                    2
                ) *
                0.16;


            // =================================================
            // GRASS BREEZE
            // =================================================

            grass.rotation.z =
                Math.sin(
                    elapsed *
                    1.25
                ) *
                0.006;


            elapsed +=
                dt;
        }


        // =====================================================
        // MAIN LOOP
        // =====================================================

        let lastFrame =
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