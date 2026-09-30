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

    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    let screenLimitX = 4.8;

    // ==========================================
    // MOBILE ONLY
    // ==========================================
    // המשחק משתמש בקומפוזיציה אנכית אחת בלבד.
    function updateCameraForDevice() {
        const width = window.innerWidth;
        const height = Math.max(window.innerHeight, 1);

        camera.aspect = width / height;
        camera.position.set(0, 12, 25);
        camera.lookAt(0, 5, 0);

        // שומרים על טווח תנועה מתאים למסך טלפון.
        screenLimitX = Math.max(4.25, Math.min(4.9, width / 78));

        camera.updateProjectionMatrix();

        renderer.setSize(
            width,
            height,
            false
        );

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio || 1,
                1.5
            )
        );
    }

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.innerWidth <= 768
        ? Math.min(window.devicePixelRatio || 1, 1.5)
        : Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    document.body.appendChild(renderer.domElement);

    function updateMobileViewportState() {
        const desktopBlocker = document.getElementById('desktop-blocker');
        const landscapeBlocker = document.getElementById('landscape-blocker');

        const isDesktopViewport =
            window.innerWidth > 768;

        const isLandscapePhone =
            window.innerWidth <= 768 &&
            window.innerWidth > window.innerHeight;

        if (desktopBlocker) {
            desktopBlocker.style.display =
                isDesktopViewport ? 'flex' : 'none';
        }

        if (landscapeBlocker) {
            landscapeBlocker.style.display =
                isLandscapePhone ? 'flex' : 'none';
        }
    }

    updateCameraForDevice();
    updateMobileViewportState();

    // ==========================================
    // 2. תאורה מתקדמת ל-Low Poly
    // ==========================================
    const hemiLight = new THREE.HemisphereLight(0xfff4dc, 0x35521f, 0.50);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff7e8, 1.55);
    sunLight.position.set(11, 24, 13);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 60;
    sunLight.shadow.camera.left = -22;
    sunLight.shadow.camera.right = 22;
    sunLight.shadow.camera.top = 26;
    sunLight.shadow.camera.bottom = -12;
    sunLight.shadow.bias = -0.00035;
    scene.add(sunLight);

    const fillLight = new THREE.DirectionalLight(0xb8d8ff, 0.18);
    fillLight.position.set(-12, 10, 18);
    scene.add(fillLight);

    // ==========================================
    // 3. מערכת מפות
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

    if (!purchasedMaps.includes(selectedMap)) selectedMap = 'desert';

    function clearMapGroup() {
        while (mapGroup.children.length) {
            const obj = mapGroup.children.pop();
            obj.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    const disposeMaterial = material => {
                        if (material.map) material.map.dispose();
                        material.dispose();
                    };
                    if (Array.isArray(child.material)) child.material.forEach(disposeMaterial);
                    else disposeMaterial(child.material);
                }
            });
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
        const cactusMat = new THREE.MeshStandardMaterial({
            color: 0x3f6212,
            roughness: 0.95,
            flatShading: true
        });

        const trunk = addMesh(
            new THREE.CylinderGeometry(0.14 * scale, 0.18 * scale, 1.45 * scale, 7),
            cactusMat,
            x,
            0.72 * scale,
            z,
            true,
            true
        );
        trunk.rotation.z = (Math.random() - 0.5) * 0.06;

        const arm = addMesh(
            new THREE.CylinderGeometry(0.09 * scale, 0.12 * scale, 0.7 * scale, 7),
            cactusMat,
            x + 0.24 * scale,
            0.75 * scale,
            z,
            true,
            true
        );
        arm.rotation.z = -0.9;

        addMesh(
            new THREE.SphereGeometry(0.13 * scale, 8, 6),
            cactusMat,
            x + 0.51 * scale,
            0.97 * scale,
            z,
            true,
            true
        );
    }

    // ==========================================
    // 3A. שכבת שמיים + עומק סביבתי
    // ==========================================
    // הרעיון כאן הוא ליצור "עולם" מאחורי אזור המשחק:
    // שמיים מדורגים, שמש/זוהר, רכסי הרים רחוקים ושכבות
    // של אובייקטים. הכול עדיין Low-Poly כדי לשמור על ביצועים.
    function createSkyTexture(mapId) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        let top = '#2f4b63';
        let middle = '#8eb7c8';
        let horizon = '#e5b17e';
        let glow = 'rgba(255, 236, 184, 0.48)';

        if (mapId === 'desert') {
            top = '#5d4960';
            middle = '#cf7f6f';
            horizon = '#f3c28c';
            glow = 'rgba(255, 226, 163, 0.58)';
        } else if (mapId === 'forest') {
            top = '#193b46';
            middle = '#39766c';
            horizon = '#8fb58a';
            glow = 'rgba(205, 232, 176, 0.33)';
        } else if (mapId === 'ice') {
            top = '#355b79';
            middle = '#79afd0';
            horizon = '#d8eff5';
            glow = 'rgba(236, 251, 255, 0.64)';
        } else if (mapId === 'volcano') {
            top = '#160f18';
            middle = '#3e1b24';
            horizon = '#8e3b2d';
            glow = 'rgba(255, 126, 62, 0.36)';
        }

        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, top);
        gradient.addColorStop(0.45, middle);
        gradient.addColorStop(0.82, horizon);
        gradient.addColorStop(1, horizon);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);

        // הילה רכה באזור האופק.
        const horizonGlow = ctx.createRadialGradient(256, 425, 10, 256, 425, 190);
        horizonGlow.addColorStop(0, glow);
        horizonGlow.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = horizonGlow;
        ctx.fillRect(0, 280, 512, 232);

        // שכבה עדינה של עננות/ערפל גרפי.
        ctx.globalAlpha = 0.08;
        for (let i = 0; i < 22; i++) {
            const x = Math.random() * 512;
            const y = 170 + Math.random() * 220;
            const rx = 45 + Math.random() * 85;
            const ry = 10 + Math.random() * 20;
            const cloud = ctx.createRadialGradient(x, y, 0, x, y, rx);
            cloud.addColorStop(0, 'rgba(255,255,255,0.7)');
            cloud.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = cloud;
            ctx.beginPath();
            ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;

        const texture = new THREE.CanvasTexture(canvas);
        texture.encoding = THREE.sRGBEncoding;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;
        return texture;
    }

    function addSkyDome(mapId) {
        const skyMat = new THREE.MeshBasicMaterial({
            map: createSkyTexture(mapId),
            side: THREE.BackSide,
            depthWrite: false,
            fog: false
        });

        const sky = new THREE.Mesh(
            new THREE.SphereGeometry(180, 24, 14),
            skyMat
        );

        sky.position.set(0, 12, 0);
        sky.renderOrder = -100;

        mapGroup.add(sky);

        return sky;
    }

    function addSunGlow(mapId) {
        let color = 0xffe0a8;

        if (mapId === 'forest') {
            color = 0xd7efc1;
        }

        if (mapId === 'ice') {
            color = 0xe5f8ff;
        }

        if (mapId === 'volcano') {
            color = 0xff6a3a;
        }

        const sun = new THREE.Mesh(
            new THREE.SphereGeometry(2.2, 16, 12),
            new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 0.72,
                depthWrite: false,
                fog: false
            })
        );

        sun.position.set(-8, 17, -52);
        sun.renderOrder = -50;
        mapGroup.add(sun);

        const halo = new THREE.Mesh(
            new THREE.SphereGeometry(4.8, 16, 10),
            new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity: 0.10,
                depthWrite: false,
                fog: false
            })
        );

        halo.position.copy(sun.position);

        halo.scale.set(
            1.7,
            0.85,
            1
        );

        halo.renderOrder = -51;

        mapGroup.add(halo);
    }

    function addDistantHill(
        x,
        y,
        z,
        sx,
        sy,
        sz,
        color,
        opacity = 1
    ) {

        const mat = new THREE.MeshStandardMaterial({

            color,

            roughness: 1,

            flatShading: true,

            transparent: opacity < 1,

            opacity,

            depthWrite: opacity >= 1
        });

        const hill = addMesh(

            new THREE.SphereGeometry(
                1,
                10,
                6
            ),

            mat,

            x,
            y,
            z,

            false,
            false
        );

        hill.scale.set(
            sx,
            sy,
            sz
        );

        return hill;
    }

    function addDistantMountain(
        x,
        y,
        z,
        radius,
        height,
        color,
        rotation = 0
    ) {

        const mat = new THREE.MeshStandardMaterial({

            color,

            roughness: 1,

            flatShading: true
        });

        const mountain = addMesh(

            new THREE.ConeGeometry(
                radius,
                height,
                7
            ),

            mat,

            x,
            y,
            z,

            false,
            false
        );

        mountain.rotation.y = rotation;

        return mountain;
    }

    function addBush(
        x,
        z,
        scale = 1,
        color = 0x356b23
    ) {

        const mat = new THREE.MeshStandardMaterial({

            color,

            roughness: 1,

            flatShading: true
        });

        const bush = addMesh(

            new THREE.DodecahedronGeometry(
                0.65 * scale,
                0
            ),

            mat,

            x,
            0.48 * scale,
            z,

            true,
            true
        );

        bush.scale.y = 0.78;

        return bush;
    }

    function addDistantForestRow(
        z,
        baseScale = 1
    ) {

        const xs = [
            -13.5,
            -10.8,
            -8.1,
            -5.4,
            -2.7,
            0,
            2.7,
            5.4,
            8.1,
            10.8,
            13.5
        ];

        xs.forEach((x, index) => {

            const scale =
                baseScale *
                (
                    0.78 +
                    ((index * 17) % 7) * 0.07
                );

            addLowPolyTree(
                x,
                z,
                scale
            );
        });
    }

    function addEnvironmentalDepth(mapId) {

        // שמיים
        addSkyDome(mapId);

        // שמש והילה
        addSunGlow(mapId);

        // ======================================
        // DESERT
        // ======================================

        if (mapId === 'desert') {

            // שכבת דיונות קרובה
            addDistantHill(
                -12,
                1.0,
                -10,
                9.5,
                3.2,
                3.4,
                0xa86048,
                0.95
            );

            addDistantHill(
                12,
                1.2,
                -12,
                10.5,
                3.7,
                3.8,
                0x98503e,
                0.94
            );

            // שכבת הרים בינונית
            addDistantHill(
                -2,
                2.0,
                -22,
                18,
                6.0,
                5.0,
                0x713b3e,
                0.88
            );

            // שכבה רחוקה
            addDistantHill(
                10,
                2.4,
                -32,
                20,
                7.2,
                6.2,
                0x59333b,
                0.74
            );

            // צמחייה קטנה
            addBush(
                -12.0,
                -8.0,
                0.8,
                0x725032
            );

            addBush(
                12.0,
                -9.0,
                0.7,
                0x6a472e
            );

            addBush(
                -10.5,
                -12.5,
                0.62,
                0x81583c
            );

            addBush(
                10.6,
                -13.0,
                0.68,
                0x795035
            );
        }

        // ======================================
        // FOREST
        // ======================================

        else if (mapId === 'forest') {

            // גבעות רחוקות
            addDistantHill(
                -10,
                1.5,
                -22,
                11,
                5.0,
                4.0,
                0x28543a,
                0.82
            );

            addDistantHill(
                10,
                1.7,
                -24,
                12,
                5.6,
                4.5,
                0x244b34,
                0.80
            );

            addDistantHill(
                0,
                2.0,
                -36,
                22,
                7.5,
                6.0,
                0x1d3d2d,
                0.64
            );

            // יער רחוק
            addDistantForestRow(
                -20,
                1.25
            );

            addDistantForestRow(
                -30,
                1.75
            );

            // שיחים קרובים
            addBush(
                -11.5,
                -6.5,
                1.0,
                0x2d5d25
            );

            addBush(
                11.5,
                -7.0,
                1.1,
                0x2a5722
            );

            addBush(
                -9.5,
                -10.5,
                0.72,
                0x376e29
            );

            addBush(
                9.5,
                -11.5,
                0.82,
                0x356728
            );
        }

        // ======================================
        // ICE
        // ======================================

        else if (mapId === 'ice') {

            addDistantMountain(
                -15,
                6,
                -21,
                7.5,
                15,
                0xb8d6e4,
                0.3
            );

            addDistantMountain(
                15,
                7,
                -23,
                9.5,
                18,
                0x9fc5d8,
                -0.15
            );

            addDistantMountain(
                -3,
                9,
                -34,
                14,
                23,
                0x86b1c7,
                0.4
            );

            addDistantHill(
                0,
                1.2,
                -18,
                20,
                4.0,
                4.0,
                0xb9d7e1,
                0.72
            );

            // גבישי קרח
            for (let i = 0; i < 7; i++) {

                addCrystal(
                    -11 + i * 3.4,
                    -8 - (i % 3) * 1.8,
                    0.45 + (i % 2) * 0.25
                );
            }
        }

        // ======================================
        // VOLCANO
        // ======================================

        else if (mapId === 'volcano') {

            addDistantMountain(
                -14,
                5.5,
                -24,
                8.0,
                15,
                0x302528,
                -0.2
            );

            addDistantMountain(
                14,
                5.8,
                -27,
                9.0,
                17,
                0x2a2225,
                0.25
            );

            addDistantMountain(
                1,
                8,
                -40,
                15,
                25,
                0x1d171a,
                0.1
            );

            addDistantHill(
                0,
                1.1,
                -14,
                20,
                3.7,
                3.7,
                0x3a2b2c,
                0.84
            );

            // נקודות לבה רחוקות
            [-10, -3, 6, 12].forEach((x, i) => {

                const lavaMat =
                    new THREE.MeshBasicMaterial({
                        color: 0xff7138,
                        transparent: true,
                        opacity: 0.7,
                        depthWrite: false
                    });

                addMesh(
                    new THREE.SphereGeometry(
                        0.18 + (i % 2) * 0.08,
                        8,
                        6
                    ),
                    lavaMat,
                    x,
                    0.22,
                    -10 - (i % 3) * 3,
                    false,
                    false
                );
            });
        }
    }

    function createGroundTexture(mapId) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        let base = '#54771f';
        let specks = ['#668b28', '#3f5f18', '#718f31'];

        if (mapId === 'forest') {
            base = '#304f20';
            specks = ['#3b6127', '#27431b', '#486d2d'];
        } else if (mapId === 'ice') {
            base = '#b9dce7';
            specks = ['#d9f2f7', '#8fc5d5', '#a9d4df'];
        } else if (mapId === 'volcano') {
            base = '#34302d';
            specks = ['#4a4541', '#211f1e', '#5a514a'];
        }

        ctx.fillStyle = base;
        ctx.fillRect(0, 0, 256, 256);

        for (let i = 0; i < 900; i++) {
            const x = Math.random() * 256;
            const y = Math.random() * 256;
            const size = 1 + Math.random() * 4;
            ctx.globalAlpha = 0.08 + Math.random() * 0.18;
            ctx.fillStyle = specks[i % specks.length];
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.globalAlpha = 1;

        if (mapId === 'desert' || mapId === 'forest') {
            for (let i = 0; i < 140; i++) {
                const x = Math.random() * 256;
                const y = Math.random() * 256;
                ctx.strokeStyle = mapId === 'forest'
                    ? 'rgba(125,160,72,0.18)'
                    : 'rgba(180,205,100,0.14)';
                ctx.lineWidth = 0.6;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + (Math.random() - 0.5) * 1.8, y - 2 - Math.random() * 5);
                ctx.stroke();
            }
        } else if (mapId === 'ice') {
            for (let i = 0; i < 55; i++) {
                const x = Math.random() * 256;
                const y = Math.random() * 256;
                ctx.strokeStyle = 'rgba(72,130,150,0.18)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + (Math.random() - 0.5) * 22, y + Math.random() * 12);
                ctx.stroke();
            }
        } else if (mapId === 'volcano') {
            for (let i = 0; i < 70; i++) {
                const x = Math.random() * 256;
                const y = Math.random() * 256;
                ctx.strokeStyle = 'rgba(110,80,60,0.22)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + 10 + Math.random() * 22, y + (Math.random() - 0.5) * 8);
                ctx.stroke();
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(6, 5);
        texture.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        texture.encoding = THREE.sRGBEncoding;
        texture.needsUpdate = true;
        return texture;
    }

    function buildMap(mapId) {
        clearMapGroup();

        // עומק סביבתי נבנה לפני הקרקע והפריטים, כדי שהעולם ירגיש
        // כמו סביבה שלמה ולא רק אוסף אובייקטים.
        addEnvironmentalDepth(mapId);

        const grassGeo = new THREE.BoxGeometry(40, 1, 30);
        let groundColor = 0x3f6212;
        let groundRoughness = 0.85;

        if (mapId === 'forest') {
            groundColor = 0x365314;
        }

        if (mapId === 'ice') {
            groundColor = 0xbfe7f5;
            groundRoughness = 0.55;
        }

        if (mapId === 'volcano') {
            groundColor = 0x292524;
            groundRoughness = 0.95;
        }

        const groundTexture = createGroundTexture(mapId);

        const grassMat = new THREE.MeshStandardMaterial({
            color: groundColor,
            map: groundTexture,
            roughness: groundRoughness,
            metalness: 0.015
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

        if (mapId === 'desert') {

            scene.background.set(0xdd8c55);
            scene.fog.color.set(0xdd8c55);
            scene.fog.density = 0.012;

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

            addCactus(
                -9.0,
                -5.0,
                0.9
            );

            addCactus(
                9.2,
                -6.5,
                0.75
            );

            addCactus(
                -10.5,
                -11.0,
                1.1
            );

            addCactus(
                11.0,
                -12.0,
                1.0
            );

        } else if (mapId === 'forest') {

            scene.background.set(0x21452a);
            scene.fog.color.set(0x21452a);
            scene.fog.density = 0.018;

            [-9, -5, 5, 9].forEach(
                (x, i) =>
                    addLowPolyTree(
                        x,
                        -7 - (i % 2) * 2,
                        1.15 + (i % 3) * 0.15
                    )
            );

            [-12, 12].forEach(
                x =>
                    addLowPolyTree(
                        x,
                        -15,
                        1.7
                    )
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

        } else if (mapId === 'ice') {

            scene.background.set(0x79b8d1);
            scene.fog.color.set(0x79b8d1);
            scene.fog.density = 0.015;

            const mountainMat =
                new THREE.MeshStandardMaterial({
                    color: 0xe0f2fe,
                    roughness: 0.6,
                    flatShading: true
                });

            [-15, 15].forEach((x, i) => {

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

                m.rotation.y = 0.35;
            });

            for (let i = 0; i < 8; i++) {

                addCrystal(
                    (Math.random() - 0.5) * 24,
                    -5 - Math.random() * 13,
                    0.7 + Math.random() * 0.8
                );
            }

        } else if (mapId === 'volcano') {

            scene.background.set(0x241114);
            scene.fog.color.set(0x241114);
            scene.fog.density = 0.02;

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

            volcano.rotation.y = 0.2;

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

            [-10, -5, 5, 10].forEach(
                (x, i) =>
                    addLavaRock(
                        x,
                        -7 - (i % 2) * 3,
                        0.9 + (i % 2) * 0.25
                    )
            );
        }
    }

    buildMap(selectedMap);

    // ==========================================
    // 4. עיצוב התותח - גרסה משופצת
    // ==========================================
    const cannonGroup = new THREE.Group();
    const CANNON_SCALE = 1.14;

    const baseGeo =
        new THREE.BoxGeometry(
            2.25,
            0.58,
            1.7
        );

    const baseMat =
        new THREE.MeshStandardMaterial({
            color: 0x25313b,
            roughness: 0.30,
            metalness: 0.58
        });

    const base =
        new THREE.Mesh(
            baseGeo,
            baseMat
        );

    base.position.y = 0.3;
    base.castShadow = true;
    base.receiveShadow = true;

    cannonGroup.add(base);

    // מסגרת קדמית שמרככת את הצורה הקופסתית
    const frontRing =
        new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.78,
                0.78,
                0.22,
                24
            ),
            new THREE.MeshStandardMaterial({
                color: 0x0f172a,
                roughness: 0.35,
                metalness: 0.45
            })
        );

    frontRing.rotation.x =
        Math.PI / 2;

    frontRing.position.set(
        0,
        0.63,
        -0.18
    );

    frontRing.castShadow = true;

    cannonGroup.add(
        frontRing
    );

    const domeGeo =
        new THREE.SphereGeometry(
            0.9,
            24,
            16,
            0,
            Math.PI * 2,
            0,
            Math.PI / 2
        );

    const domeMat =
        new THREE.MeshStandardMaterial({
            color: 0x0b7db8,
            roughness: 0.16,
            metalness: 0.28,
            transparent: true,
            opacity: 0.95
        });

    const dome =
        new THREE.Mesh(
            domeGeo,
            domeMat
        );

    dome.position.y = 0.57;
    dome.castShadow = true;

    cannonGroup.add(
        dome
    );

    // גלגלים: אין סיבוב 360° בזמן תנועה. הם רק משנים זווית היגוי.
    const wheelGeo =
        new THREE.CylinderGeometry(
            0.39,
            0.39,
            0.24,
            16
        );

    const wheelMat =
        new THREE.MeshStandardMaterial({
            color: 0x111827,
            roughness: 0.90,
            metalness: 0.02
        });

    const cannonWheels = [];

    const wheelPositions = [
        [-1.12, 0.2, 0.68],
        [ 1.12, 0.2, 0.68],
        [-1.12, 0.2, -0.68],
        [ 1.12, 0.2, -0.68]
    ];

    wheelPositions.forEach((pos, index) => {

        const wheel =
            new THREE.Mesh(
                wheelGeo,
                wheelMat
            );

        wheel.rotation.z =
            Math.PI / 2;

        wheel.position.set(...pos);

        wheel.castShadow = true;

        // חזית התותח (z חיובי) יכולה להציג היגוי; האחוריים נשארים קבועים.
        wheel.userData.steerable =
            pos[2] > 0;

        wheel.userData.side =
            pos[0] < 0 ? -1 : 1;

        wheel.userData.baseRotationY =
            0;

        cannonGroup.add(
            wheel
        );

        cannonWheels.push(
            wheel
        );
    });

    cannonWheels.forEach(
        wheel => {

            const hub =
                new THREE.Mesh(
                    new THREE.CylinderGeometry(
                        0.13,
                        0.13,
                        0.26,
                        12
                    ),
                    new THREE.MeshStandardMaterial({
                        color: 0x64748b,
                        roughness: 0.34,
                        metalness: 0.72
                    })
                );

            hub.rotation.z =
                Math.PI / 2;

            hub.position.copy(
                wheel.position
            );

            hub.castShadow = true;

            cannonGroup.add(
                hub
            );
        }
    );

    const barrelGeo =
        new THREE.CylinderGeometry(
            0.13,
            0.13,
            0.95,
            16
        );

    const barrelMat =
        new THREE.MeshStandardMaterial({
            color: 0x334155,
            metalness: 0.72,
            roughness: 0.28
        });

    const leftBarrel =
        new THREE.Mesh(
            barrelGeo,
            barrelMat
        );

    leftBarrel.position.set(
        -0.38,
        1.02,
        0
    );

    const rightBarrel =
        new THREE.Mesh(
            barrelGeo,
            barrelMat
        );

    rightBarrel.position.set(
        0.38,
        1.02,
        0
    );

    leftBarrel.castShadow = true;
    rightBarrel.castShadow = true;

    cannonGroup.add(
        leftBarrel,
        rightBarrel
    );

    cannonGroup.scale.setScalar(
        CANNON_SCALE
    );

    scene.add(
        cannonGroup
    );

    // צל רך מתחת לתותח - חלק מהדשא, לא פלטפורמה.
    const cannonShadow =
        new THREE.Mesh(
            new THREE.CircleGeometry(
                1.35,
                28
            ),
            new THREE.MeshBasicMaterial({
                color: 0x1f2937,
                transparent: true,
                opacity: 0.20,
                depthWrite: false
            })
        );

    cannonShadow.rotation.x =
        -Math.PI / 2;

    cannonShadow.position.y =
        0.015;

    cannonShadow.scale.set(
        1.15,
        0.72,
        1
    );

    scene.add(
        cannonShadow
    );

    const cannonShadowSoft =
        new THREE.Mesh(
            new THREE.CircleGeometry(
                0.9,
                24
            ),
            new THREE.MeshBasicMaterial({
                color: 0x0f172a,
                transparent: true,
                opacity: 0.09,
                depthWrite: false
            })
        );

    cannonShadowSoft.rotation.x =
        -Math.PI / 2;

    cannonShadowSoft.position.y =
        0.018;

    cannonShadowSoft.scale.set(
        1.05,
        0.55,
        1
    );

    scene.add(
        cannonShadowSoft
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

    let cannonRecoil = 0;

    const cannonBaseY = 0;

    const effects = [];

    const tempVec3 =
        new THREE.Vector3();

    // ==========================================
    // 6. אלמנטים של UI ועדכון החנות במסך הפתיחה
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

    const mapButtons =
        Array.from(
            document.querySelectorAll(
                '[data-map-id]'
            )
        );

    function updateUI() {

        if (coinsValEl)
            coinsValEl.innerText =
                coins;

        if (scoreValEl)
            scoreValEl.innerText =
                score;

        if (startCoinsEl)
            startCoinsEl.innerText =
                coins;

        if (startBestScoreEl)
            startBestScoreEl.innerText =
                bestScore;

        if (hpTextEl)
            hpTextEl.innerText =
                `${Math.max(0, playerHp)} / ${maxHp}`;

        if (hpBarEl)
            hpBarEl.style.width =
                `${Math.max(0, (playerHp / maxHp) * 100)}%`;

        if (levelTextEl)
            levelTextEl.innerText =
                `LEVEL ${level}`;

        // מחירים לשדרוגים
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

            if (el)
                el.innerText =
                    `Lvl ${firePowerLvl}`;
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

            if (el)
                el.innerText =
                    `Lvl ${fireRateLvl}`;
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

            if (el)
                el.innerText =
                    `Lvl ${magnetLvl}`;
        }

        mapButtons.forEach(btn => {

            const mapId =
                btn.dataset.mapId;

            const map =
                MAPS[mapId];

            if (!map)
                return;

            const owned =
                purchasedMaps.includes(
                    mapId
                );

            const selected =
                selectedMap === mapId;

            const action =
                btn.querySelector(
                    '.map-action'
                );

            const state =
                btn.querySelector(
                    '.map-state'
                );

            if (action)
                action.innerText =
                    selected
                        ? 'נבחרה'
                        : owned
                            ? 'בחר'
                            : `${map.price} C`;

            if (state)
                state.innerText =
                    selected
                        ? 'ACTIVE'
                        : owned
                            ? 'OWNED'
                            : 'LOCKED';

            btn.classList.toggle(
                'selected',
                selected
            );

            btn.classList.toggle(
                'owned',
                owned
            );

            btn.disabled =
                !owned &&
                coins < map.price;
        });
    }

    // חנות מפות - הקנייה והשינוי נעשים במסך הפתיחה בלבד.
    mapButtons.forEach(btn => {

        btn.addEventListener(
            'click',
            () => {

                const mapId =
                    btn.dataset.mapId;

                const map =
                    MAPS[mapId];

                if (!map)
                    return;

                const owned =
                    purchasedMaps.includes(
                        mapId
                    );

                if (!owned) {

                    if (
                        coins <
                        map.price
                    )
                        return;

                    coins -=
                        map.price;

                    purchasedMaps.push(
                        mapId
                    );

                    localStorage.setItem(
                        'bb3d_coins',
                        coins
                    );

                    localStorage.setItem(
                        'bb3d_purchased_maps',
                        JSON.stringify(
                            purchasedMaps
                        )
                    );
                }

                selectedMap =
                    mapId;

                localStorage.setItem(
                    'bb3d_map',
                    selectedMap
                );

                buildMap(
                    selectedMap
                );

                updateUI();
            }
        );
    });

    // חיבור כפתורי השדרוגים במסך הפתיחה
    if (buyPowerBtn) {

        buyPowerBtn.addEventListener(
            'click',
            () => {

                const cost =
                    firePowerLvl * 50;

                if (
                    coins >= cost
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
                    fireRateLvl * 60;

                if (
                    coins >= cost
                ) {

                    coins -=
                        cost;

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

    if (buyMagnetBtn) {

        buyMagnetBtn.addEventListener(
            'click',
            () => {

                const cost =
                    (magnetLvl + 1) *
                    100;

                if (
                    coins >= cost
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
    let audioCtx = null;

    function getAudioCtx() {

        if (!audioCtx) {

            const AudioContextClass =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContextClass)
                return null;

            audioCtx =
                new AudioContextClass();
        }

        return audioCtx;
    }

    function playSound(type) {

        const ctx =
            getAudioCtx();

        if (!ctx)
            return;

        if (
            ctx.state ===
            'suspended'
        )
            ctx.resume();

        const osc =
            ctx.createOscillator();

        const gain =
            ctx.createGain();

        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'shoot') {

            osc.frequency.setValueAtTime(
                320,
                ctx.currentTime
            );

            osc.frequency.exponentialRampToValueAtTime(
                90,
                ctx.currentTime + 0.07
            );

            gain.gain.setValueAtTime(
                0.05,
                ctx.currentTime
            );

            gain.gain.linearRampToValueAtTime(
                0.01,
                ctx.currentTime + 0.07
            );

            osc.start();
            osc.stop(
                ctx.currentTime + 0.07
            );

        } else if (type === 'hit') {

            osc.type =
                'triangle';

            osc.frequency.setValueAtTime(
                120,
                ctx.currentTime
            );

            osc.frequency.exponentialRampToValueAtTime(
                40,
                ctx.currentTime + 0.06
            );

            gain.gain.setValueAtTime(
                0.08,
                ctx.currentTime
            );

            gain.gain.linearRampToValueAtTime(
                0.01,
                ctx.currentTime + 0.06
            );

            osc.start();

            osc.stop(
                ctx.currentTime + 0.06
            );

        } else if (type === 'coin') {

            osc.frequency.setValueAtTime(
                850,
                ctx.currentTime
            );

            osc.frequency.setValueAtTime(
                1250,
                ctx.currentTime + 0.05
            );

            gain.gain.setValueAtTime(
                0.07,
                ctx.currentTime
            );

            gain.gain.linearRampToValueAtTime(
                0.01,
                ctx.currentTime + 0.12
            );

            osc.start();

            osc.stop(
                ctx.currentTime + 0.12
            );
        }
    }

    // ==========================================
    // 8. יצירת סלעים, כדורים ומטבעות
    // ==========================================
    function spawnBullet(
        x,
        y,
        z
    ) {

        const bullet =
            new THREE.Group();

        const core =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.19,
                    10,
                    10
                ),
                new THREE.MeshBasicMaterial({
                    color: 0xfff59d
                })
            );

        const trail =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.10,
                    8,
                    8
                ),
                new THREE.MeshBasicMaterial({
                    color: 0xfacc15,
                    transparent: true,
                    opacity: 0.55
                })
            );

        trail.scale.set(
            0.75,
            2.8,
            0.75
        );

        trail.position.y =
            -0.2;

        bullet.add(
            core,
            trail
        );

        bullet.position.set(
            x,
            y,
            z
        );

        bullet.userData = {
            core,
            trail
        };

        scene.add(
            bullet
        );

        bullets.push(
            bullet
        );
    }

    function createIrregularRockGeometry(
        size
    ) {

        const geo =
            new THREE.IcosahedronGeometry(
                size,
                1
            );

        const position =
            geo.attributes.position;

        const colors = [];

        for (
            let i = 0;
            i < position.count;
            i++
        ) {

            const ox =
                position.getX(i);

            const oy =
                position.getY(i);

            const oz =
                position.getZ(i);

            const factorX =
                0.82 +
                Math.random() * 0.32;

            const factorY =
                0.72 +
                Math.random() * 0.34;

            const factorZ =
                0.84 +
                Math.random() * 0.30;

            const jitter =
                0.93 +
                Math.random() * 0.14;

            position.setXYZ(
                i,
                ox *
                    factorX *
                    jitter,
                oy *
                    factorY,
                oz *
                    factorZ *
                    jitter
            );

            const shade =
                0.72 +
                (
                    position.getY(i) /
                    Math.max(
                        size,
                        0.001
                    ) +
                    1
                ) *
                0.11 +
                Math.random() *
                0.08;

            colors.push(
                Math.min(
                    1,
                    shade
                ),
                Math.min(
                    1,
                    shade * 0.94
                ),
                Math.min(
                    1,
                    shade * 0.88
                )
            );
        }

        geo.setAttribute(
            'color',
            new THREE.Float32BufferAttribute(
                colors,
                3
            )
        );

        geo.computeVertexNormals();

        return geo;
    }

    function getRockColor() {

        if (
            selectedMap ===
            'forest'
        )
            return 0x58656b;

        if (
            selectedMap ===
            'ice'
        )
            return 0x6f8792;

        if (
            selectedMap ===
            'volcano'
        )
            return 0x46413e;

        return 0x756a5e;
    }

    function spawnRock(
        x,
        y,
        hp,
        size,
        launchVx = null,
        launchVy = null
    ) {

        const geo =
            createIrregularRockGeometry(
                size
            );

        const mat =
            new THREE.MeshStandardMaterial({

                color:
                    getRockColor(),

                vertexColors:
                    true,

                roughness:
                    0.92,

                metalness:
                    0.0,

                flatShading:
                    false
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

        rock.rotation.set(
            Math.random() *
                0.6,
            Math.random() *
                0.8,
            Math.random() *
                0.6
        );

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

        ctx.shadowColor =
            'rgba(0,0,0,0.4)';

        ctx.shadowBlur =
            5;

        ctx.fillText(
            hp,
            64,
            64
        );

        const texture =
            new THREE.CanvasTexture(
                canvas
            );

        texture.generateMipmaps =
            false;

        texture.minFilter =
            THREE.LinearFilter;

        const spriteMat =
            new THREE.SpriteMaterial({
                map:
                    texture,

                transparent:
                    true,

                depthTest:
                    true
            });

        const label =
            new THREE.Sprite(
                spriteMat
            );

        label.scale.set(
            size * 1.0,
            size * 1.0,
            1
        );

        label.position.y =
            0.08;

        rock.add(
            label
        );

        rock.userData = {

            hp,

            maxHp:
                hp,

            size,

            vx:
                launchVx !== null
                    ? launchVx
                    : (
                        Math.random() -
                        0.5
                    ) *
                    0.055,

            vy:
                launchVy !== null
                    ? launchVy
                    : 0,

            rotX:
                (
                    Math.random() -
                    0.5
                ) *
                0.032,

            rotY:
                (
                    Math.random() -
                    0.5
                ) *
                0.038,

            rotZ:
                (
                    Math.random() -
                    0.5
                ) *
                0.028,

            ctx,

            texture,

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

    function spawnMuzzleFlash(
        x,
        y,
        z
    ) {

        const flash =
            new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.24,
                    8,
                    8
                ),
                new THREE.MeshBasicMaterial({
                    color: 0xfff1a8,
                    transparent: true,
                    opacity: 0.95
                })
            );

        flash.position.set(
            x,
            y,
            z
        );

        flash.scale.set(
            0.75,
            1.8,
            0.75
        );

        flash.userData = {

            type:
                'flash',

            life:
                5,

            maxLife:
                5,

            startScale:
                1
        };

        scene.add(
            flash
        );

        effects.push(
            flash
        );
    }

    function spawnImpactBurst(
        x,
        y,
        z,
        color = 0xfde68a
    ) {

        const count =
            6;

        for (
            let i = 0;
            i < count;
            i++
        ) {

            const particle =
                new THREE.Mesh(
                    new THREE.TetrahedronGeometry(
                        0.08 +
                        Math.random() *
                        0.06,
                        0
                    ),
                    new THREE.MeshBasicMaterial({
                        color,
                        transparent:
                            true,
                        opacity:
                            1
                    })
                );

            particle.position.set(
                x +
                    (
                        Math.random() -
                        0.5
                    ) *
                    0.16,

                y +
                    (
                        Math.random() -
                        0.5
                    ) *
                    0.16,

                z +
                    (
                        Math.random() -
                        0.5
                    ) *
                    0.12
            );

            particle.userData = {

                type:
                    'particle',

                life:
                    14 +
                    Math.random() *
                    7,

                vx:
                    (
                        Math.random() -
                        0.5
                    ) *
                    0.16,

                vy:
                    0.04 +
                    Math.random() *
                    0.12,

                vz:
                    (
                        Math.random() -
                        0.5
                    ) *
                    0.08,

                spin:
                    (
                        Math.random() -
                        0.5
                    ) *
                    0.2
            };

            scene.add(
                particle
            );

            effects.push(
                particle
            );
        }
    }

    function spawnDustBurst(
        x,
        y,
        z
    ) {

        const count =
            5;

        for (
            let i = 0;
            i < count;
            i++
        ) {

            const dust =
                new THREE.Mesh(
                    new THREE.SphereGeometry(
                        0.10 +
                        Math.random() *
                        0.08,
                        7,
                        7
                    ),
                    new THREE.MeshBasicMaterial({
                        color: 0xd6b58a,
                        transparent: true,
                        opacity: 0.55
                    })
                );

            dust.position.set(
                x +
                    (
                        Math.random() -
                        0.5
                    ) *
                    0.5,

                Math.max(
                    0.3,
                    y -
                        0.2 +
                        Math.random() *
                        0.25
                ),

                z +
                    (
                        Math.random() -
                        0.5
                    ) *
                    0.22
            );

            dust.userData = {

                type:
                    'dust',

                life:
                    16 +
                    Math.random() *
                    10,

                vx:
                    (
                        Math.random() -
                        0.5
                    ) *
                    0.06,

                vy:
                    0.015 +
                    Math.random() *
                    0.035,

                vz:
                    (
                        Math.random() -
                        0.5
                    ) *
                    0.035
            };

            scene.add(
                dust
            );

            effects.push(
                dust
            );
        }
    }

    function updateEffects() {

        for (
            let i =
                effects.length - 1;
            i >= 0;
            i--
        ) {

            const fx =
                effects[i];

            const data =
                fx.userData;

            data.life -=
                1;

            if (
                data.type ===
                'flash'
            ) {

                const progress =
                    1 -
                    data.life /
                    data.maxLife;

                const scale =
                    1 +
                    progress *
                    1.4;

                fx.scale.set(
                    0.75 *
                        scale,
                    1.8 *
                        scale,
                    0.75 *
                        scale
                );

                fx.material.opacity =
                    Math.max(
                        0,
                        data.life /
                            data.maxLife
                    );

            } else {

                fx.position.x +=
                    data.vx;

                fx.position.y +=
                    data.vy;

                fx.position.z +=
                    data.vz;

                data.vy -=
                    0.0025;

                if (
                    data.spin
                ) {

                    fx.rotation.x +=
                        data.spin;

                    fx.rotation.y +=
                        data.spin *
                        0.7;
                }

                fx.material.opacity =
                    Math.max(
                        0,
                        data.life /
                            24
                    );

                if (
                    data.type ===
                    'dust'
                )
                    fx.scale.multiplyScalar(
                        1.015
                    );
            }

            if (
                data.life <=
                0
            ) {

                scene.remove(
                    fx
                );

                if (
                    fx.geometry
                )
                    fx.geometry.dispose();

                if (
                    fx.material
                )
                    fx.material.dispose();

                effects.splice(
                    i,
                    1
                );
            }
        }

        // הגנה על מובייל: לא יותר מדי אפקטים בבת אחת.
        if (
            effects.length >
            32
        ) {

            const overflow =
                effects.length -
                32;

            for (
                let i = 0;
                i < overflow;
                i++
            ) {

                const fx =
                    effects.shift();

                scene.remove(
                    fx
                );

                if (
                    fx.geometry
                )
                    fx.geometry.dispose();

                if (
                    fx.material
                )
                    fx.material.dispose();
            }
        }
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

        rock.userData.texture.needsUpdate =
            true;
    }

    function removeRock(
        rock,
        index
    ) {

        spawnImpactBurst(
            rock.position.x,
            rock.position.y,
            rock.position.z
        );

        if (
            rock.position.y <
            2.2
        ) {

            spawnDustBurst(
                rock.position.x,
                rock.position.y,
                rock.position.z
            );
        }

        if (
            rock.userData.texture
        )
            rock.userData.texture.dispose();

        if (
            rock.geometry
        )
            rock.geometry.dispose();

        if (
            rock.material
        )
            rock.material.dispose();

        scene.remove(
            rock
        );

        rocks.splice(
            index,
            1
        );
    }

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

    let hasStartedFirstWave =
        false;

    function startNextWave() {

        if (
            rocks.length ===
            0
        ) {

            if (
                hasStartedFirstWave
            )
                level++;

            hasStartedFirstWave =
                true;

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
                        i *
                        3,
                    hp,
                    size
                );
            }

            updateUI();
        }
    }

    // ==========================================
    // 9. שליטה וגרירה - מותאמת במיוחד למובייל
    // ==========================================
    // במקום לקשור את התותח ישירות למיקום האצבע על המסך,
    // אנחנו משתמשים בתנועה יחסית: מזיזים את האצבע ->
    // התותח זז באותו כיוון, אבל במהירות נשלטת.
    let isDragging = false;
    let dragPointerId = null;
    let dragStartX = 0;
    let dragStartTargetX = 0;
    let lastPointerX = 0;

    const TOUCH_DEADZONE = 2.5;
    const TOUCH_SENSITIVITY = 0.016;
    const DESKTOP_SENSITIVITY = 0.020;

    function getPointerSensitivity() {

        return window.innerWidth <=
            768
            ? TOUCH_SENSITIVITY
            : DESKTOP_SENSITIVITY;
    }

    function moveCannonByPointer(
        clientX
    ) {

        const deltaX =
            clientX -
            dragStartX;

        if (
            Math.abs(
                deltaX
            ) <
            TOUCH_DEADZONE
        )
            return;

        const nextTarget =
            dragStartTargetX +
            deltaX *
            getPointerSensitivity();

        targetX =
            Math.max(
                -screenLimitX,
                Math.min(
                    screenLimitX,
                    nextTarget
                )
            );
    }

    const controlSurface =
        renderer.domElement;

    controlSurface.addEventListener(
        'pointerdown',
        e => {

            if (
                !isGameStarted ||
                isPaused ||
                isGameOver
            )
                return;

            // רק אצבע אחת / מצביע אחד שולט בתותח.
            if (
                dragPointerId !==
                null
            )
                return;

            isDragging =
                true;

            dragPointerId =
                e.pointerId;

            dragStartX =
                e.clientX;

            lastPointerX =
                e.clientX;

            dragStartTargetX =
                targetX;

            try {

                controlSurface.setPointerCapture(
                    e.pointerId
                );

            } catch (_) {}

            e.preventDefault();

        },
        {
            passive:
                false
        }
    );

    controlSurface.addEventListener(
        'pointermove',
        e => {

            if (
                !isDragging ||
                e.pointerId !==
                    dragPointerId
            )
                return;

            const movementSinceLastFrame =
                e.clientX -
                lastPointerX;

            // מונע קפיצה במקרה של אירוע pointermove גדול.
            if (
                Math.abs(
                    movementSinceLastFrame
                ) >
                120
            ) {

                dragStartX =
                    e.clientX;

                dragStartTargetX =
                    targetX;

                lastPointerX =
                    e.clientX;

                return;
            }

            moveCannonByPointer(
                e.clientX
            );

            lastPointerX =
                e.clientX;

            e.preventDefault();

        },
        {
            passive:
                false
        }
    );

    function endPointerControl(
        e
    ) {

        if (
            dragPointerId !==
                null &&
            e.pointerId !==
                dragPointerId
        )
            return;

        isDragging =
            false;

        try {

            if (
                dragPointerId !==
                null
            ) {

                controlSurface.releasePointerCapture(
                    dragPointerId
                );
            }

        } catch (_) {}

        dragPointerId =
            null;
    }

    controlSurface.addEventListener(
        'pointerup',
        endPointerControl
    );

    controlSurface.addEventListener(
        'pointercancel',
        endPointerControl
    );

    controlSurface.addEventListener(
        'lostpointercapture',
        () => {

            isDragging =
                false;

            dragPointerId =
                null;
        }
    );

    // קו יישור קטן למניעת התנהגות לא צפויה ממגע במכשירים מסוימים.
    controlSurface.addEventListener(
        'contextmenu',
        e => {

            e.preventDefault();
        }
    );

    // ==========================================
    // 10. התחלת משחק והסרת מסך הפתיחה
    // ==========================================
    function startGame() {

        if (
            isGameStarted
        )
            return;

        isGameStarted =
            true;

        isGameOver =
            false;

        if (
            splashScreen
        )
            splashScreen.classList.add(
                'hidden'
            );

        score =
            0;

        playerHp =
            maxHp;

        level =
            1;

        hasStartedFirstWave =
            false;

        cannonRecoil =
            0;

        cannonGroup.position.set(
            0,
            cannonBaseY,
            0
        );

        buildMap(
            selectedMap
        );

        updateUI();

        startNextWave();
    }

    if (
        startBtn
    )
        startBtn.addEventListener(
            'click',
            startGame
        );

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

        // ======================================
        // תנועת התותח + רתיעה קטנה בירי
        // ======================================
        cannonGroup.position.x +=
            (
                targetX -
                cannonGroup.position.x
            ) *
            0.2;

        cannonShadow.position.x +=
            (
                cannonGroup.position.x -
                cannonShadow.position.x
            ) *
            0.3;

        cannonShadowSoft.position.x +=
            (
                cannonGroup.position.x -
                cannonShadowSoft.position.x
            ) *
            0.32;

        cannonRecoil *=
            0.78;

        cannonGroup.position.y +=
            (
                (
                    cannonBaseY +
                    cannonRecoil
                ) -
                cannonGroup.position.y
            ) *
            0.35;

        // ======================================
        // היגוי גלגלים - ימינה / שמאלה בלבד
        // ======================================
        const moveDelta =
            targetX -
            cannonGroup.position.x;

        const steerAngle =
            THREE.MathUtils.clamp(
                moveDelta *
                    -0.26,
                -0.18,
                0.18
            );

        cannonWheels.forEach(
            wheel => {

                const targetSteer =
                    wheel.userData
                        .steerable
                        ? steerAngle
                        : 0;

                wheel.rotation.y +=
                    (
                        targetSteer -
                        wheel.rotation.y
                    ) *
                    0.18;
            }
        );

        // ======================================
        // ירי
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

            const bulletY =
                cannonGroup.position.y +
                1.5 *
                CANNON_SCALE;

            const leftX =
                cannonGroup.position.x -
                0.35 *
                CANNON_SCALE;

            const rightX =
                cannonGroup.position.x +
                0.35 *
                CANNON_SCALE;

            spawnBullet(
                leftX,
                bulletY,
                0
            );

            spawnBullet(
                rightX,
                bulletY,
                0
            );

            spawnMuzzleFlash(
                leftX,
                bulletY,
                0
            );

            spawnMuzzleFlash(
                rightX,
                bulletY,
                0
            );

            cannonRecoil =
                0.14;

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

                b.traverse(
                    child => {

                        if (
                            child.geometry
                        )
                            child.geometry.dispose();

                        if (
                            child.material
                        )
                            child.material.dispose();
                    }
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

            const data =
                r.userData;

            if (
                data.hitCooldown >
                0
            )
                data.hitCooldown -=
                    1;

            data.vy -=
                0.0025;

            r.position.x +=
                data.vx;

            r.position.y +=
                data.vy;

            r.rotation.x +=
                data.rotX;

            r.rotation.y +=
                data.rotY;

            r.rotation.z +=
                data.rotZ;

            // ==================================
            // קפיצות מהקרקע
            // ==================================
            if (
                r.position.y -
                    data.size <
                0.2
            ) {

                r.position.y =
                    0.2 +
                    data.size;

                data.vy =
                    Math.abs(
                        data.vy
                    ) *
                    0.95;

                if (
                    data.vy <
                    0.12
                )
                    data.vy =
                        0.16;

                data.vx *=
                    0.985;

                spawnDustBurst(
                    r.position.x,
                    0.25,
                    r.position.z
                );
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

                data.vx *=
                    -1;

                r.position.x =
                    Math.sign(
                        r.position.x
                    ) *
                    screenLimitX;
            }

            // ==================================
            // פגיעה של כדור בסלע
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
                    data.size *
                        0.88
                ) {

                    scene.remove(
                        b
                    );

                    b.traverse(
                        child => {

                            if (
                                child.geometry
                            )
                                child.geometry.dispose();

                            if (
                                child.material
                            )
                                child.material.dispose();
                        }
                    );

                    bullets.splice(
                        bIdx,
                        1
                    );

                    data.hp -=
                        firePower;

                    score +=
                        firePower;

                    spawnImpactBurst(
                        r.position.x,
                        r.position.y,
                        r.position.z
                    );

                    playSound(
                        'hit'
                    );

                    if (
                        data.hp <=
                        0
                    ) {

                        if (
                            Math.random() >
                            0.3
                        )
                            spawnCoin(
                                r.position.x,
                                r.position.y
                            );

                        if (
                            data.size >
                            0.9
                        ) {

                            const childHp =
                                Math.max(
                                    1,
                                    Math.floor(
                                        data.maxHp /
                                        2
                                    )
                                );

                            spawnRock(
                                r.position.x -
                                    0.35,
                                r.position.y,
                                childHp,
                                data.size *
                                    0.7,
                                -0.05 -
                                    Math.random() *
                                    0.03,
                                0.05 +
                                    Math.random() *
                                    0.08
                            );

                            spawnRock(
                                r.position.x +
                                    0.35,
                                r.position.y,
                                childHp,
                                data.size *
                                    0.7,
                                0.05 +
                                    Math.random() *
                                    0.03,
                                0.05 +
                                    Math.random() *
                                    0.08
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

            if (
                !rocks[rIdx]
            )
                continue;

            // ==================================
            // פגיעה בתותח
            // ==================================
            if (
                data.hitCooldown <=
                    0 &&
                Math.hypot(
                    r.position.x -
                        cannonGroup.position.x,
                    r.position.y -
                        0.55
                ) <
                    data.size +
                    0.65
            ) {

                playerHp -=
                    10;

                data.hitCooldown =
                    24;

                cannonRecoil =
                    -0.08;

                spawnDustBurst(
                    cannonGroup.position.x,
                    0.3,
                    0
                );

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
                            0.55
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
                            0.55 -
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
                        0.55
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

                if (
                    c.geometry
                )
                    c.geometry.dispose();

                if (
                    c.material
                )
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

                c.position.y =
                    0.2;

                c.userData.vy =
                    0;
            }
        }

        updateEffects();

        startNextWave();

        renderer.render(
            scene,
            camera
        );
    }

    window.addEventListener(
        'resize',
        () => {

            updateCameraForDevice();
            updateMobileViewportState();
        }
    );

    window.addEventListener(
        'orientationchange',
        () => {

            setTimeout(
                () => {

                    updateCameraForDevice();
                    updateMobileViewportState();

                },
                120
            );
        }
    );

    animate(0);
});