window.addEventListener(
    'DOMContentLoaded',
    () => {

        'use strict';

        // =====================================================
        // BASIC CHECK
        // =====================================================

        if (typeof THREE === 'undefined') {

            console.error(
                'Three.js לא נטען.'
            );

            return;
        }


        // =====================================================
        // HELPERS
        // =====================================================

        const $ = (id) => {
            return document.getElementById(id);
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
                    window.innerWidth > 650,

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
                aspect < 0.72
            ) {

                screenLimitX =
                    4.35;

                cameraY =
                    12.4;

                cameraZ =
                    25.5;

            } else if (
                aspect < 1
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
                '#66717a'
            );


            gradient.addColorStop(
                0.18,
                '#817b76'
            );


            gradient.addColorStop(
                0.38,
                '#a96d56'
            );


            gradient.addColorStop(
                0.56,
                '#dc8f50'
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


            // Soft clouds.

            for (
                let i = 0;
                i < 16;
                i++
            ) {

                const y =
                    65 +
                    i * 46;


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
                    0.30,
                    'rgba(255,230,203,0.08)'
                );


                cloud.addColorStop(
                    0.52,
                    'rgba(87,78,74,0.13)'
                );


                cloud.addColorStop(
                    0.80,
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
                0xd58a57,
                0.013
            );


        // =====================================================
        // LIGHTING
        // =====================================================

        const hemisphere =
            new THREE.HemisphereLight(
                0xffebcf,
                0x2a170d,
                0.92
            );


        scene.add(
            hemisphere
        );


        const sun =
            new THREE.DirectionalLight(
                0xffecc4,
                1.78
            );


        sun.position.set(
            14,
            22,
            15
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
            -22;


        sun.shadow.camera.right =
            22;


        sun.shadow.camera.top =
            25;


        sun.shadow.camera.bottom =
            -5;


        sun.shadow.camera.near =
            0.5;


        sun.shadow.camera.far =
            75;


        sun.shadow.bias =
            -0.0004;


        scene.add(
            sun
        );


        const blueFill =
            new THREE.DirectionalLight(
                0x8fdcff,
                0.35
            );


        blueFill.position.set(
            -15,
            10,
            8
        );


        scene.add(
            blueFill
        );


        const sunsetLight =
            new THREE.PointLight(
                0xffb45f,
                3.0,
                32,
                2
            );


        sunsetLight.position.set(
            0,
            8,
            -19
        );


        scene.add(
            sunsetLight
        );


        const environmentFill =
            new THREE.PointLight(
                0xf7cf90,
                0.55,
                20,
                2
            );


        environmentFill.position.set(
            0,
            4,
            -7
        );


        scene.add(
            environmentFill
        );


        // =====================================================
        // WORLD GROUP
        // =====================================================

        const world =
            new THREE.Group();


        scene.add(
            world
        );


        // =====================================================
        // SUN DISK
        // =====================================================

        const sunDisk =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    2.7,
                    24,
                    18
                ),

                new THREE.MeshBasicMaterial({
                    color:
                        0xffd45f,

                    transparent:
                        true,

                    opacity:
                        0.96
                })
            );


        sunDisk.position.set(
            0,
            10.7,
            -27
        );


        world.add(
            sunDisk
        );


        const sunGlow =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    5.2,
                    20,
                    14
                ),

                new THREE.MeshBasicMaterial({

                    color:
                        0xffbf69,

                    transparent:
                        true,

                    opacity:
                        0.10,

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
        // GROUND
        // =====================================================

        const ground =
            new THREE.Mesh(

                new THREE.PlaneGeometry(
                    68,
                    54
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0x75602d,

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
            -7
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
                    56,
                    3,
                    8
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0x3f2718,

                    roughness:
                        1,

                    flatShading:
                        true
                })
            );


        soil.position.set(
            0,
            -1.58,
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

        const grassGround =
            new THREE.Mesh(

                new THREE.BoxGeometry(
                    56,
                    0.55,
                    8.08
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0x4d741b,

                    roughness:
                        1,

                    flatShading:
                        true
                })
            );


        grassGround.position.set(
            0,
            -0.18,
            1
        );


        grassGround.receiveShadow =
            true;


        world.add(
            grassGround
        );


        // =====================================================
        // TERRAIN RIDGES
        // =====================================================

        function addTerrainRidge(
            x,
            z,
            width,
            height,
            depth,
            color
        ) {

            const ridge =
                new THREE.Mesh(

                    new THREE.ConeGeometry(
                        1,
                        1,
                        7
                    ),

                    new THREE.MeshStandardMaterial({

                        color:
                            color,

                        roughness:
                            0.97,

                        flatShading:
                            true
                    })
                );


            ridge.position.set(
                x,
                height / 2 - 0.1,
                z
            );


            ridge.scale.set(
                width,
                height,
                depth
            );


            ridge.rotation.y =
                rand(
                    -0.15,
                    0.15
                );


            ridge.castShadow =
                true;


            ridge.receiveShadow =
                true;


            world.add(
                ridge
            );


            return ridge;
        }


        // Distant desert mountains.

        addTerrainRidge(
            -19,
            -18,
            11,
            10,
            4,
            0x77513b
        );


        addTerrainRidge(
            19,
            -18,
            11,
            9,
            4,
            0x744d38
        );


        addTerrainRidge(
            -13,
            -13,
            8,
            7,
            4,
            0x644536
        );


        addTerrainRidge(
            13,
            -14,
            8,
            7,
            4,
            0x614133
        );


        // =====================================================
        // PYRAMID FUNCTION
        // =====================================================

        function addPyramid(
            x,
            y,
            z,
            width,
            height,
            depth,
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
                            0.88,

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
                width,
                height,
                depth
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


        // =====================================================
        // DISTANT PYRAMIDS
        // =====================================================

        addPyramid(
            -17,
            5.2,
            -20,
            7.7,
            11,
            7.7,
            0x895234
        );


        addPyramid(
            17,
            5.0,
            -20,
            7.5,
            10.5,
            7.5,
            0x7a4a31
        );


        addPyramid(
            0,
            4.3,
            -25,
            6.5,
            8.7,
            6.5,
            0x704832
        );


        // =====================================================
        // MIDDLE PYRAMIDS
        // =====================================================

        addPyramid(
            -10.2,
            3.6,
            -13,
            5.1,
            7.1,
            5.1,
            0x5e483b
        );


        addPyramid(
            10.2,
            3.5,
            -13.2,
            5.3,
            7.3,
            5.3,
            0x594338
        );


        addPyramid(
            0,
            2.6,
            -16.2,
            4.2,
            5.7,
            4.2,
            0x504036
        );


        // =====================================================
        // FOREGROUND ROCK WALLS
        // =====================================================

        addPyramid(
            -9.0,
            2.1,
            -6.2,
            3.7,
            4.8,
            3.0,
            0x302b26
        );


        addPyramid(
            9.0,
            2.0,
            -6.0,
            3.7,
            4.7,
            3.0,
            0x2d2925
        );


        addPyramid(
            -14,
            1.55,
            -4.2,
            2.75,
            3.2,
            2.25,
            0x382d27
        );


        addPyramid(
            14,
            1.55,
            -4.0,
            2.75,
            3.2,
            2.25,
            0x342b27
        );


        // =====================================================
        // VALLEY
        // =====================================================

        const valley =
            new THREE.Mesh(

                new THREE.PlaneGeometry(
                    14,
                    8.5
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0x5d8122,

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
            0.028,
            -4.7
        );


        world.add(
            valley
        );


        // =====================================================
        // 3D GRASS
        // =====================================================

        const grassMaterial =
            new THREE.MeshStandardMaterial({

                color:
                    0x4e7e1a,

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
                0.36,
                3
            );


        const GRASS_COUNT =
            700;


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


        // Front field.

        for (
            let i = 0;
            i < 420;
            i++
        ) {

            grassDummy.position.set(

                rand(
                    -20,
                    20
                ),

                0.06,

                rand(
                    -1.5,
                    2.7
                )
            );


            grassDummy.scale.set(

                rand(
                    0.65,
                    1.15
                ),

                rand(
                    0.65,
                    1.45
                ),

                rand(
                    0.65,
                    1.15
                )
            );


            grassDummy.rotation.y =
                rand(
                    0,
                    Math.PI
                );


            grassDummy.rotation.z =
                rand(
                    -0.18,
                    0.18
                );


            grassDummy.updateMatrix();


            grass.setMatrixAt(
                grassIndex++,
                grassDummy.matrix
            );
        }


        // Valley.

        for (
            let i = 0;
            i < 280;
            i++
        ) {

            grassDummy.position.set(

                rand(
                    -7,
                    7
                ),

                0.075,

                rand(
                    -8,
                    -2
                )
            );


            grassDummy.scale.set(

                rand(
                    0.65,
                    1.0
                ),

                rand(
                    0.7,
                    1.25
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
                    -0.18,
                    0.18
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
        // SMALL ROCK CLUSTERS
        // =====================================================

        const smallRockMaterial =
            new THREE.MeshStandardMaterial({

                color:
                    0x6f675d,

                roughness:
                    0.94,

                flatShading:
                    true
            });


        const smallRockGeometry =
            new THREE.IcosahedronGeometry(
                0.34,
                0
            );


        function addRockCluster(
            x,
            z,
            count,
            scale
        ) {

            const group =
                new THREE.Group();


            for (
                let i = 0;
                i < count;
                i++
            ) {

                const rock =
                    new THREE.Mesh(
                        smallRockGeometry,
                        smallRockMaterial
                    );


                rock.position.set(
                    rand(
                        -0.9,
                        0.9
                    ),
                    rand(
                        0.15,
                        0.4
                    ),
                    rand(
                        -0.45,
                        0.45
                    )
                );


                rock.scale.set(

                    rand(
                        0.65,
                        1.25
                    ) *
                    scale,

                    rand(
                        0.55,
                        1.2
                    ) *
                    scale,

                    rand(
                        0.65,
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
                    true;


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
            -5.0,
            8,
            1.15
        );


        addRockCluster(
            5.9,
            -5.2,
            8,
            1.2
        );


        addRockCluster(
            -11.5,
            -7.4,
            6,
            0.9
        );


        addRockCluster(
            11.8,
            -7.2,
            6,
            0.95
        );


        // =====================================================
        // CRYSTALS
        // =====================================================

        const crystalMaterial =
            new THREE.MeshStandardMaterial({

                color:
                    0x34d7e8,

                emissive:
                    0x07586d,

                emissiveIntensity:
                    0.95,

                roughness:
                    0.19,

                metalness:
                    0.34,

                flatShading:
                    true
            });


        function addCrystal(
            x,
            z,
            size
        ) {

            const group =
                new THREE.Group();


            for (
                let i = 0;
                i < 2;
                i++
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

                    (i - 0.5) *
                    0.38,

                    i *
                    0.13,

                    0
                );


                crystal.scale.set(

                    size *
                    (
                        i
                            ? 0.62
                            : 0.82
                    ),

                    size *
                    (
                        i
                            ? 1.45
                            : 1.7
                    ),

                    size *
                    (
                        i
                            ? 0.62
                            : 0.82
                    )
                );


                crystal.rotation.z =
                    i *
                    0.35;


                crystal.castShadow =
                    true;


                group.add(
                    crystal
                );
            }


            group.position.set(
                x,
                0.33,
                z
            );


            world.add(
                group
            );
        }


        addCrystal(
            -6.3,
            -4.9,
            0.55
        );


        addCrystal(
            6.3,
            -4.9,
            0.58
        );


        addCrystal(
            -11,
            -8.5,
            0.75
        );


        addCrystal(
            11,
            -8.5,
            0.8
        );


        // =====================================================
        // ARENA PLATFORM
        // =====================================================

        const arena =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    5.8,
                    6.45,
                    0.42,
                    64
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0x26333a,

                    roughness:
                        0.47,

                    metalness:
                        0.31,

                    flatShading:
                        true
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
                    5.08,
                    5.35,
                    0.14,
                    64
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0x10222d,

                    roughness:
                        0.69,

                    metalness:
                        0.18
                })
            );


        arenaInner.position.set(
            0,
            0.40,
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
                    0x34c6ed,

                transparent:
                    true,

                opacity:
                    0.68
            });


        const arenaRings =
            [];


        for (
            let i = 0;
            i < 3;
            i++
        ) {

            const ring =
                new THREE.Mesh(

                    new THREE.TorusGeometry(
                        3.45 +
                        i *
                        0.82,

                        i === 0
                            ? 0.05
                            : 0.025,

                        8,
                        56
                    ),

                    ringMaterial
                );


            ring.rotation.x =
                Math.PI / 2;


            ring.position.set(
                0,
                0.44 +
                i *
                0.016,
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
        // ROUNDED CANNON
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


        const cannonDark =
            new THREE.MeshStandardMaterial({

                color:
                    0x101820,

                roughness:
                    0.25,

                metalness:
                    0.88
            });


        const cannonBlue =
            new THREE.MeshStandardMaterial({

                color:
                    0x087bb2,

                roughness:
                    0.22,

                metalness:
                    0.62
            });


        const cannonCyan =
            new THREE.MeshStandardMaterial({

                color:
                    0x39b3d7,

                emissive:
                    0x064758,

                emissiveIntensity:
                    0.82,

                roughness:
                    0.17,

                metalness:
                    0.46
            });


        // Lower rounded body.

        const roundedBase =
            new THREE.Mesh(

                new THREE.CylinderGeometry(
                    1.23,
                    1.32,
                    0.48,
                    32
                ),

                cannonDark
            );


        roundedBase.position.y =
            0.30;


        roundedBase.scale.z =
            0.72;


        roundedBase.castShadow =
            true;


        cannon.add(
            roundedBase
        );


        // Rounded blue body.

        const blueBody =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    1,
                    24,
                    16
                ),

                cannonBlue
            );


        blueBody.position.y =
            0.54;


        blueBody.scale.set(
            1.08,
            0.62,
            0.82
        );


        blueBody.castShadow =
            true;


        cannon.add(
            blueBody
        );


        // Main dome.

        const dome =
            new THREE.Mesh(

                new THREE.SphereGeometry(
                    0.88,
                    28,
                    18,
                    0,
                    Math.PI * 2,
                    0,
                    Math.PI / 2
                ),

                new THREE.MeshStandardMaterial({

                    color:
                        0x0d8fc6,

                    emissive:
                        0x06425d,

                    emissiveIntensity:
                        0.75,

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
            0.78;


        dome.castShadow =
            true;


        cannon.add(
            dome
        );


        // Lower ring.

        const domeRing =
            new THREE.Mesh(

                new THREE.TorusGeometry(
                    0.89,
                    0.055,
                    8,
                    32
                ),

                cannonCyan
            );


        domeRing.rotation.x =
            Math.PI / 2;


        domeRing.position.y =
            0.76;


        cannon.add(
            domeRing
        );


        // Side rounded pods.

        for (
            const z of [
                -0.60,
                0.60
            ]
        ) {

            const pod =
                new THREE.Mesh(

                    new THREE.SphereGeometry(
                        0.34,
                        18,
                        12
                    ),

                    cannonDark
                );


            pod.position.set(
                0,
                0.31,
                z
            );


            pod.scale.set(
                1.05,
                0.8,
                0.8
            );


            pod.castShadow =
                true;


            cannon.add(
                pod
            );
        }


        // Wheels.

        const wheelGeometry =
            new THREE.CylinderGeometry(
                0.40,
                0.40,
                0.22,
                20
            );


        const wheelHubGeometry =
            new THREE.CylinderGeometry(
                0.13,
                0.13,
                0.235,
                16
            );


        const wheels =
            [];


        for (
            const z of [
                -0.75,
                0.75
            ]
        ) {

            const wheel =
                new THREE.Mesh(
                    wheelGeometry,
                    cannonDark
                );


            wheel.rotation.z =
                Math.PI / 2;


            wheel.position.set(
                0,
                0.25,
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


            const hub =
                new THREE.Mesh(
                    wheelHubGeometry,
                    cannonCyan
                );


            hub.rotation.z =
                Math.PI / 2;


            hub.position.set(
                0,
                0.25,
                z
            );


            cannon.add(
                hub
            );
        }


        // =====================================================
        // BARRELS
        // =====================================================

        const barrelAssembly =
            new THREE.Group();


        barrelAssembly.position.y =
            0.74;


        cannon.add(
            barrelAssembly
        );


        const barrelGeometry =
            new THREE.CylinderGeometry(
                0.15,
                0.20,
                1.42,
                18
            );


        const muzzleGeometry =
            new THREE.CylinderGeometry(
                0.20,
                0.22,
                0.22,
                18
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
                0.86,
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
                1.65,
                0.04
            );


            muzzle.castShadow =
                true;


            barrelAssembly.add(
                muzzle
            );


            const ring =
                new THREE.Mesh(

                    new THREE.TorusGeometry(
                        0.21,
                        0.045,
                        8,
                        20
                    ),

                    cannonCyan
                );


            ring.rotation.x =
                Math.PI / 2;


            ring.position.set(
                x,
                1.54,
                0.04
            );


            barrelAssembly.add(
                ring
            );


            const flash =
                new THREE.Mesh(

                    new THREE.SphereGeometry(
                        0.35,
                        12,
                        10
                    ),

                    new THREE.MeshBasicMaterial({

                        color:
                            0xffefab,

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
                1.84,
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
                    0.14,
                    14,
                    14
                ),

                new THREE.MeshBasicMaterial({

                    color:
                        0xa4f5ff
                })
            );


        cannonCore.position.set(
            0,
            1.0,
            0.73
        );


        cannon.add(
            cannonCore
        );


        const cannonGlow =
            new THREE.PointLight(
                0x36d8ff,
                2.6,
                7,
                2
            );


        cannonGlow.position.set(
            0,
            1.0,
            1.55
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
        // GAME DATA
        // =====================================================

        let score =
            0;


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


        let level =
            1;


        let playerHp =
            1000;


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


        /*
         * Slightly stronger default cannon.
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
        // UI UPDATE
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
                        i + 1
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
                    1
                )
            );


            rock.scale.set(
                size,
                size * 1.12,
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


            // Slower falling + repeating bounce.

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
                PARTICLE_COUNT *
                3
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


        const particles =
            new THREE.Points(

                particleGeometry,

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
                })
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
                    Math.cos(
                        angle
                    ) *
                    speed;


                particleVY[index] =
                    rand(
                        1.4,
                        4.6
                    );


                particleVZ[index] =
                    Math.sin(
                        angle
                    ) *
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
                        progress *
                        3.2
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
        // WAVE SPAWN
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
                level %
                5 ===
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
        // START
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
                        1.2
                    )
                );
            }


            // Stronger recoil.

            recoil =
                0.20;


            // Stronger feedback.

            cameraShake =
                Math.min(
                    0.28,
                    cameraShake +
                    0.04
                );


            cannonGlow.intensity =
                4.7;


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
        // MAIN GAME UPDATE
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
                0.74 -
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
                0.25;


            // Small movement of wheels
            // to make the cannon feel alive.

            if (
                dragging
            ) {

                for (
                    const wheel of
                    wheels
                ) {

                    wheel.rotation.x +=
                        dt *
                        2.2;
                }
            }


            // =================================================
            // ARENA ANIMATION
            // =================================================

            for (
                let i = 0;
                i < arenaRings.length;
                i++
            ) {

                arenaRings[i].rotation.z +=

                    dt *
                    (
                        i === 0
                            ? 0.22
                            : i === 1
                                ? -0.14
                                : 0.08
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


                // -------------------------------------------------
                // SLOWER FALL
                // -------------------------------------------------

                const rockGravity =
                    8.5 +
                    level *
                    0.035;


                data.vy -=
                    rockGravity *
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


                // -------------------------------------------------
                // REPEATED BOUNCE
                // -------------------------------------------------

                const floorHeight =
                    0.48 +
                    data.size;


                if (
                    rock.position.y <
                    floorHeight
                ) {

                    rock.position.y =
                        floorHeight;


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


                    // Small dust burst.

                    createBurst(
                        rock.position.x,
                        0.48,
                        2
                    );
                }


                // -------------------------------------------------
                // SIDE WALLS
                // -------------------------------------------------

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


                    data.hp -=
                        firePower;


                    combo =
                        Math.min(
                            50,
                            combo +
                            1
                        );


                    comboTimer =
                        1.15;


                    score +=
                        firePower *
                        Math.max(
                            1,
                            combo
                        );


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


                        spawnCoin(
                            rock.position.x,
                            rock.position.y +
                            0.20
                        );


                        // Bigger explosion.

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
            // CAMERA
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
                3.0 +
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


            // Slight world breathing.

            world.position.y =
                Math.sin(
                    elapsed *
                    0.28
                ) *
                0.008;


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