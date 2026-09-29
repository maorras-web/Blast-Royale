window.addEventListener('DOMContentLoaded', () => {

    if (typeof THREE === 'undefined') {
        console.error('Three.js library is missing!');
        return;
    }

    // ==========================================
    // 1. הגדרת סצנה וגרפיקה
    // ==========================================
    const scene = new THREE.Scene();

    // סביבה צבעונית רכה ושקיעה
    scene.background = new THREE.Color(0xdd8c55);
    scene.fog = new THREE.FogExp2(0xdd8c55, 0.012);

    // מצלמה למובייל
    const camera = new THREE.PerspectiveCamera(
        55,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );

    let screenLimitX = 4.8;

    function updateCameraForDevice() {

        const aspect =
            window.innerWidth /
            Math.max(1, window.innerHeight);

        camera.aspect = aspect;

        /*
         * המשחק מיועד קודם כל לטלפונים.
         * גם אם פותחים אותו במחשב,
         * הקומפוזיציה נשארת בסגנון המובייל.
         */

        if (aspect < 1) {

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

            /*
             * לא משנים את המשחק לגרסת מחשב רחבה.
             * שומרים על קומפוזיציה צרה יחסית.
             */

            camera.position.set(
                0,
                11,
                23
            );

            camera.lookAt(
                0,
                5,
                0
            );

            screenLimitX = 5.3;
        }

        camera.updateProjectionMatrix();

        renderer.setSize(
            window.innerWidth,
            window.innerHeight
        );
    }


    // ==========================================
    // Renderer - Mobile Optimized
    // ==========================================

    const renderer =
        new THREE.WebGLRenderer({

            antialias: true,

            powerPreference:
                'high-performance'
        });


    renderer.setSize(
        window.innerWidth,
        window.innerHeight
    );


    /*
     * הגבלת Pixel Ratio כדי שהטלפון
     * לא ירנדר עומס מיותר.
     */

    renderer.setPixelRatio(
        Math.min(
            window.devicePixelRatio || 1,
            1.35
        )
    );


    renderer.shadowMap.enabled = true;

    renderer.shadowMap.type =
        THREE.PCFSoftShadowMap;

    renderer.toneMapping =
        THREE.ACESFilmicToneMapping;

    renderer.toneMappingExposure =
        1.1;

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

    scene.add(
        hemiLight
    );


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


    sunLight.shadow.mapSize.width =
        window.innerWidth < 600
            ? 512
            : 768;

    sunLight.shadow.mapSize.height =
        window.innerWidth < 600
            ? 512
            : 768;


    sunLight.shadow.camera.near =
        0.5;

    sunLight.shadow.camera.far =
        50;

    sunLight.shadow.bias =
        -0.0005;

    scene.add(
        sunLight
    );


    // ==========================================
    // 3. סביבה - דשא ופירמידות
    // ==========================================

    /*
     * אין יותר פלטפורמה עבה מתחת לתותח.
     * יש רק משטח דשא שטוח.
     */

    const grassGeo =
        new THREE.PlaneGeometry(
            40,
            18,
            1,
            1
        );


    const grassMat =
        new THREE.MeshStandardMaterial({

            color:
                0x3f6212,

            roughness:
                0.88,

            metalness:
                0.02
        });


    const grass =
        new THREE.Mesh(
            grassGeo,
            grassMat
        );


    grass.rotation.x =
        -Math.PI / 2;


    grass.position.set(
        0,
        0,
        0
    );


    grass.receiveShadow = true;


    scene.add(
        grass
    );


    // ==========================================
    // 3D GRASS
    // ==========================================

    /*
     * דשא תלת-ממדי באמצעות InstancedMesh.
     * כך אפשר להציג הרבה להבים
     * בלי ליצור מאות Mesh נפרדים.
     */

    const grassBladeGeo =
        new THREE.ConeGeometry(
            0.045,
            0.30,
            3
        );


    const grassBladeMat =
        new THREE.MeshStandardMaterial({

            color:
                0x4f7d18,

            roughness:
                1,

            metalness:
                0,

            flatShading:
                true
        });


    const grassCount =
        window.innerWidth < 600
            ? 280
            : 360;


    const grass3D =
        new THREE.InstancedMesh(
            grassBladeGeo,
            grassBladeMat,
            grassCount
        );


    const grassDummy =
        new THREE.Object3D();


    for (
        let i = 0;
        i < grassCount;
        i++
    ) {

        /*
         * רוב הדשא בחלק הקדמי,
         * כדי שיראה מלא יותר סביב התותח.
         */

        const x =
            -19 +
            Math.random() * 38;


        const z =
            -1.5 +
            Math.random() * 5;


        grassDummy.position.set(
            x,
            0.12,
            z
        );


        const width =
            0.65 +
            Math.random() *
            0.5;


        const height =
            0.65 +
            Math.random() *
            0.7;


        grassDummy.scale.set(
            width,
            height,
            width
        );


        grassDummy.rotation.y =
            Math.random() *
            Math.PI;


        grassDummy.rotation.z =
            (
                Math.random() -
                0.5
            ) *
            0.24;


        grassDummy.updateMatrix();


        grass3D.setMatrixAt(
            i,
            grassDummy.matrix
        );
    }


    grass3D.instanceMatrix.needsUpdate =
        true;


    /*
     * לא מטילים צל מכל להב דשא,
     * כדי לשמור על ביצועים במובייל.
     */

    grass3D.castShadow = false;
    grass3D.receiveShadow = false;


    scene.add(
        grass3D
    );


    // ==========================================
    // פירמידות
    // ==========================================

    function createBackgroundPyramid(
        x,
        z,
        scale,
        colorHex
    ) {

        const geo =
            new THREE.ConeGeometry(
                8 * scale,
                13 * scale,
                4
            );


        const mat =
            new THREE.MeshStandardMaterial({

                color:
                    colorHex,

                roughness:
                    0.8,

                flatShading:
                    true
            });


        const pyr =
            new THREE.Mesh(
                geo,
                mat
            );


        pyr.position.set(
            x,
            5.5 * scale,
            z
        );


        pyr.rotation.y =
            Math.PI / 4;


        pyr.castShadow = true;

        pyr.receiveShadow = true;


        scene.add(
            pyr
        );
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


    // ==========================================
    // 4. עיצוב התותח - גוף מעוגל
    // ==========================================

    const cannonGroup =
        new THREE.Group();


    /*
     * גוף תחתון עגול במקום קופסה.
     */

    const baseGeo =
        new THREE.CylinderGeometry(
            1.05,
            1.18,
            0.48,
            28
        );


    const baseMat =
        new THREE.MeshStandardMaterial({

            color:
                0x1e293b,

            roughness:
                0.32,

            metalness:
                0.48
        });


    const base =
        new THREE.Mesh(
            baseGeo,
            baseMat
        );


    base.position.y =
        0.27;


    /*
     * משטיח מעט את הגוף לאורך Z.
     */

    base.scale.z =
        0.76;


    base.castShadow = true;


    cannonGroup.add(
        base
    );


    /*
     * גוף כחול מעוגל נוסף.
     */

    const bodyGeo =
        new THREE.SphereGeometry(
            1,
            20,
            14
        );


    const bodyMat =
        new THREE.MeshStandardMaterial({

            color:
                0x075985,

            roughness:
                0.25,

            metalness:
                0.58
        });


    const body =
        new THREE.Mesh(
            bodyGeo,
            bodyMat
        );


    body.position.y =
        0.54;


    body.scale.set(
        1.05,
        0.58,
        0.80
    );


    body.castShadow = true;


    cannonGroup.add(
        body
    );


    // ==========================================
    // כיפה
    // ==========================================

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

            color:
                0x0284c7,

            roughness:
                0.18,

            metalness:
                0.16,

            transparent:
                true,

            opacity:
                0.92
        });


    const dome =
        new THREE.Mesh(
            domeGeo,
            domeMat
        );


    dome.position.y =
        0.70;


    cannonGroup.add(
        dome
    );


    // ==========================================
    // טבעת סביב הכיפה
    // ==========================================

    const domeRingGeo =
        new THREE.TorusGeometry(
            0.86,
            0.045,
            8,
            24
        );


    const domeRingMat =
        new THREE.MeshStandardMaterial({

            color:
                0x38bdf8,

            emissive:
                0x064e67,

            emissiveIntensity:
                0.7,

            metalness:
                0.55,

            roughness:
                0.2
        });


    const domeRing =
        new THREE.Mesh(
            domeRingGeo,
            domeRingMat
        );


    domeRing.rotation.x =
        Math.PI / 2;


    domeRing.position.y =
        0.69;


    cannonGroup.add(
        domeRing
    );


    // ==========================================
    // גלגלים
    // ==========================================

    const wheelGeo =
        new THREE.CylinderGeometry(
            0.36,
            0.36,
            0.22,
            18
        );


    const wheelMat =
        new THREE.MeshStandardMaterial({

            color:
                0x0f172a,

            roughness:
                0.68,

            metalness:
                0.18
        });


    const hubGeo =
        new THREE.CylinderGeometry(
            0.12,
            0.12,
            0.24,
            14
        );


    const hubMat =
        new THREE.MeshStandardMaterial({

            color:
                0x38bdf8,

            emissive:
                0x06384a,

            emissiveIntensity:
                0.6,

            metalness:
                0.55,

            roughness:
                0.22
        });


    const wheelPositions = [

        [-1.00, 0.31, 0.62],

        [ 1.00, 0.31, 0.62],

        [-1.00, 0.31, -0.62],

        [ 1.00, 0.31, -0.62]

    ];


    const cannonWheels = [];


    wheelPositions.forEach(
        pos => {

            const wheel =
                new THREE.Mesh(
                    wheelGeo,
                    wheelMat
                );


            /*
             * כך הגלגל פונה לכיוון
             * המצלמה ונראה עגול.
             */

            wheel.rotation.x =
                Math.PI / 2;


            wheel.position.set(
                pos[0],
                pos[1],
                pos[2]
            );


            wheel.castShadow = true;


            cannonGroup.add(
                wheel
            );


            cannonWheels.push(
                wheel
            );


            const hub =
                new THREE.Mesh(
                    hubGeo,
                    hubMat
                );


            hub.rotation.x =
                Math.PI / 2;


            hub.position.set(
                pos[0],
                pos[1],
                pos[2]
            );


            cannonGroup.add(
                hub
            );
        }
    );


    // ==========================================
    // 4.1 קנים
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

            color:
                0x334155,

            metalness:
                0.72,

            roughness:
                0.28
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


    leftBarrel.castShadow = true;


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


    rightBarrel.castShadow = true;


    cannonGroup.add(
        leftBarrel
    );


    cannonGroup.add(
        rightBarrel
    );


    // ==========================================
    // 4.2 תאורה קטנה לתותח
    // ==========================================

    const cannonLight =
        new THREE.PointLight(
            0x38bdf8,
            1.2,
            5
        );


    cannonLight.position.set(
        0,
        0.8,
        0.9
    );


    cannonGroup.add(
        cannonLight
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


    /*
     * כוח התחלתי מעט יותר חזק.
     */

    let firePower =
        firePowerLvl + 1;


    let fireRate =
        1 +
        (
            fireRateLvl - 1
        ) *
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


        // ==========================================
        // מחירי שדרוגים
        // ==========================================

        const powerCost =
            firePowerLvl * 50;


        const rateCost =
            fireRateLvl * 60;


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
    }


    // ==========================================
    // כפתורי שדרוג
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


                    /*
                     * שומר על כוח הפתיחה
                     * המוגבר גם אחרי שדרוגים.
                     */

                    firePower =
                        firePowerLvl + 1;


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
                        magnetLvl + 1
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


    updateUI();


    // ==========================================
    // 7. סאונד
    // ==========================================

    const audioCtx =
        new (
            window.AudioContext ||
            window.webkitAudioContext
        )();


    function playSound(
        type
    ) {

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


        osc.connect(
            gain
        );


        gain.connect(
            audioCtx.destination
        );


        if (
            type ===
            'shoot'
        ) {

            osc.frequency.setValueAtTime(
                320,
                audioCtx.currentTime
            );


            osc.frequency
                .exponentialRampToValueAtTime(
                    90,
                    audioCtx.currentTime +
                    0.07
                );


            gain.gain.setValueAtTime(
                0.05,
                audioCtx.currentTime
            );


            gain.gain.linearRampToValueAtTime(
                0.01,
                audioCtx.currentTime +
                0.07
            );


            osc.start();


            osc.stop(
                audioCtx.currentTime +
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
                audioCtx.currentTime
            );


            osc.frequency
                .exponentialRampToValueAtTime(
                    40,
                    audioCtx.currentTime +
                    0.06
                );


            gain.gain.setValueAtTime(
                0.08,
                audioCtx.currentTime
            );


            gain.gain.linearRampToValueAtTime(
                0.01,
                audioCtx.currentTime +
                0.06
            );


            osc.start();


            osc.stop(
                audioCtx.currentTime +
                0.06
            );

        } else if (
            type ===
            'coin'
        ) {

            osc.frequency.setValueAtTime(
                850,
                audioCtx.currentTime
            );


            osc.frequency.setValueAtTime(
                1250,
                audioCtx.currentTime +
                0.05
            );


            gain.gain.setValueAtTime(
                0.07,
                audioCtx.currentTime
            );


            gain.gain.linearRampToValueAtTime(
                0.01,
                audioCtx.currentTime +
                0.12
            );


            osc.start();


            osc.stop(
                audioCtx.currentTime +
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
                color:
                    0xfde047
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
    // יצירת סלע
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

                color:
                    0x64748b,

                roughness:
                    0.75,

                flatShading:
                    true
            });


        const rock =
            new THREE.Mesh(
                geo,
                mat
            );


        rock.castShadow =
            true;


        rock.receiveShadow =
            true;


        rock.position.set(
            x,
            y,
            0
        );


        // ==========================================
        // מספר HP
        // ==========================================

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
                map:
                    texture
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

            hp:
                hp,

            maxHp:
                hp,

            size:
                size,

            vx:
                (
                    Math.random() -
                    0.5
                ) *
                0.05,

            vy:
                0,

            ctx:
                ctx,

            texture:
                texture
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
            .needsUpdate =
            true;
    }


    function removeRock(
        rock,
        index
    ) {

        if (
            rock.userData.texture
        ) {

            rock.userData.texture
                .dispose();
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
    // מטבע
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

                color:
                    0xfacc15,

                metalness:
                    0.8,

                roughness:
                    0.2
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


        coin.castShadow =
            true;


        coin.userData = {
            vy:
                -0.04
        };


        scene.add(
            coin
        );


        droppedCoins.push(
            coin
        );
    }


    // ==========================================
    // WAVE
    // ==========================================

    function startNextWave() {

        if (
            rocks.length ===
            0
        ) {

            level++;


            const count =
                Math.min(
                    2 +
                    Math.floor(
                        level /
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
                    0.95 +
                    Math.random() *
                    0.8;


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
                    12 +
                    i * 3,
                    hp,
                    size
                );
            }


            updateUI();
        }
    }


    // ==========================================
    // 9. שליטה וגרירה
    // ==========================================

    let isDragging =
        false;


    function handleMove(
        clientX
    ) {

        const normalizedX =
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
        (e) => {

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
        (e) => {

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
    // 10. התחלת משחק
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

            splashScreen
                .classList
                .add(
                    'hidden'
                );
        }


        score =
            0;


        playerHp =
            maxHp;


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


    // ==========================================
    // 11. לולאת המשחק
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


        // ==========================================
        // תנועת התותח
        // ==========================================

        cannonGroup.position.x += (

            targetX -
            cannonGroup.position.x

        ) *
        0.2;


        // ==========================================
        // תזוזת גלגלים
        // ==========================================

        if (
            isDragging
        ) {

            for (
                const wheel of
                cannonWheels
            ) {

                wheel.rotation.z +=
                    0.16;
            }
        }


        // ==========================================
        // תאורת תותח
        // ==========================================

        cannonLight.intensity =
            1.15 +
            Math.sin(
                time *
                0.003
            ) *
            0.12;


        domeRing.rotation.z +=
            0.003;


        // ==========================================
        // ירי
        // ==========================================

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


        // ==========================================
        // כדורים
        // ==========================================

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


                b.geometry.dispose();

                b.material.dispose();


                bullets.splice(
                    i,
                    1
                );
            }
        }


        // ==========================================
        // סלעים
        // ==========================================

        for (
            let rIdx =
                rocks.length - 1;

            rIdx >= 0;

            rIdx--
        ) {

            const r =
                rocks[rIdx];


            // ==========================================
            // נפילה איטית יותר
            // ==========================================

            /*
             * הגרסה המקורית הייתה:
             *
             * r.userData.vy -= 0.0025;
             *
             * עכשיו הסלעים יורדים לאט יותר.
             */

            r.userData.vy -=
                0.00125;


            r.position.x +=
                r.userData.vx;


            r.position.y +=
                r.userData.vy;


            // ==========================================
            // קפיצה מהרצפה
            // ==========================================

            if (
                r.position.y -
                r.userData.size <
                0.2
            ) {

                r.position.y =
                    0.2 +
                    r.userData.size;


                /*
                 * בכל מגע עם הרצפה
                 * הסלע מקבל קפיצה חדשה.
                 *
                 * לכן הוא ממשיך לקפוץ
                 * עד שהשחקן משמיד אותו.
                 */

                r.userData.vy =
                    Math.max(

                        0.14,

                        Math.abs(
                            r.userData.vy
                        ) *
                        0.88
                    );
            }


            // ==========================================
            // קירות צד
            // ==========================================

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


            // ==========================================
            // פגיעה של כדור בסלע
            // ==========================================

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


                    b.geometry.dispose();

                    b.material.dispose();


                    bullets.splice(
                        bIdx,
                        1
                    );


                    // נזק.

                    r.userData.hp -=
                        firePower;


                    score +=
                        firePower;


                    playSound(
                        'hit'
                    );


                    // ==========================================
                    // הסלע נהרס
                    // ==========================================

                    if (
                        r.userData.hp <=
                        0
                    ) {

                        /*
                         * מטבע.
                         */

                        if (
                            Math.random() >
                            0.3
                        ) {

                            spawnCoin(
                                r.position.x,
                                r.position.y
                            );
                        }


                        /*
                         * סלע גדול מתפצל
                         * לשני סלעים קטנים.
                         */

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


            /*
             * ייתכן שהסלע כבר נמחק
             * אחרי הפגיעה.
             */

            if (
                !rocks.includes(
                    r
                )
            ) {

                continue;
            }


            // ==========================================
            // הסלע פוגע בתותח
            // ==========================================

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

                    c.position.x += (

                        cannonGroup.position.x -
                        c.position.x

                    ) *
                    0.12;


                    c.position.y += (

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


            c.rotation.z +=
                0.05;


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


                c.geometry.dispose();

                c.material.dispose();


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
        // Wave חדש
        // ==========================================

        startNextWave();


        // ==========================================
        // דשא - תנועה קלה
        // ==========================================

        grass3D.rotation.z =
            Math.sin(
                time *
                0.0013
            ) *
            0.005;


        // ==========================================
        // Render
        // ==========================================

        renderer.render(
            scene,
            camera
        );
    }


    window.addEventListener(
        'resize',
        updateCameraForDevice
    );


    animate(
        0
    );

});