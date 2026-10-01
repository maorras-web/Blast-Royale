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
    scene.background = new THREE.Color(0x5a4a50);
    scene.fog = new THREE.Fog(0xd09a6d, 25, 92);
    // צבע דשא אחיד אחד לכל המשחק — שנה כאן כדי לשנות את כל הדשא.
    // שימו לב: בגרסת Three.js הזו צבעי חומר נכנסים לחישוב התאורה כמו שהם (בלי המרת gamma),
    // ולכן הערך נראה כהה מאוד בקוד, אבל על המסך הוא יוצא ירוק עשיר (~ #68a037).
    // אם הדשא נראה חיוור או שרוף — להחשיך את הערך; אם כהה מדי — להבהיר אותו.
    const GRASS_GREEN = 0x13410d;

    // ערפל אווירי: הצבע קרוב לצבע האופק של שמיים השקיעה, כך שהמרחק "נבלע" בשמיים.
    // עד FOG_NEAR (מרחק מהמצלמה) אין ערפל בכלל, ומשם הוא מתגבר בהדרגה עד FOG_FAR.
    const FOG_COLOR = 0xc9956b;
    const FOG_NEAR = 24;
    const FOG_FAR = 92;

    const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    let screenLimitX = 4.8;

    // ==========================================
    // MOBILE ONLY
    // ==========================================
    // המשחק משתמש בקומפוזיציה אנכית אחת בלבד.
    function updateCameraForDevice() {
        const width = window.innerWidth;
        const height = Math.max(window.innerHeight, 1);

        camera.aspect = width / height;
        camera.position.set(0, 7.15, 14.9);
        camera.lookAt(0, 2.50, -8.8);

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
    renderer.toneMappingExposure = 0.88;
    document.body.appendChild(renderer.domElement);

    // ==========================================
    // 1B. שכבת Color Grade קולנועית — ויזואלית בלבד
    // ==========================================
    const cinematicGrade = document.createElement('div');
    cinematicGrade.setAttribute('aria-hidden', 'true');
    Object.assign(cinematicGrade.style, {
        position: 'fixed',
        inset: '0',
        pointerEvents: 'none',
        zIndex: '5',
        background: 'radial-gradient(ellipse at 50% 42%, rgba(255,196,112,0.02) 0%, rgba(112,54,37,0.06) 58%, rgba(18,15,24,0.30) 100%), linear-gradient(to bottom, rgba(40,34,55,0.08), rgba(255,168,88,0.03) 58%, rgba(35,24,16,0.10))',
        mixBlendMode: 'multiply'
    });
    document.body.appendChild(cinematicGrade);

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
    const hemiLight = new THREE.HemisphereLight(0xffd9a0, 0x172612, 0.30);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xffbd78, 1.75);
    sunLight.position.set(-10, 20, 14);
    sunLight.castShadow = true;
    // טלפונים חזקים מקבלים מפת צללים חדה פי 2 (2048), שאר הטלפונים נשארים על 1024.
    const isStrongPhone = (navigator.hardwareConcurrency || 4) >= 6 && (navigator.deviceMemory || 4) >= 4;
    const SHADOW_MAP_SIZE = isStrongPhone ? 2048 : 1024;
    sunLight.shadow.mapSize.width = SHADOW_MAP_SIZE;
    sunLight.shadow.mapSize.height = SHADOW_MAP_SIZE;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 60;
    sunLight.shadow.camera.left = -22;
    sunLight.shadow.camera.right = 22;
    sunLight.shadow.camera.top = 26;
    sunLight.shadow.camera.bottom = -12;
    sunLight.shadow.bias = -0.00035;
    sunLight.shadow.normalBias = 0.018;
    sunLight.shadow.radius = 1.6;
    scene.add(sunLight);

    // אור משלים קריר־סגלגל מימין: הצד המוצל נהיה קריר והמואר חם — ניגוד צבע של שקיעה.
    const fillLight = new THREE.DirectionalLight(0x7f8fd0, 0.22);
    fillLight.position.set(12, 8, 16);
    scene.add(fillLight);

    // אור קדמי עדין שמחזיר פרטים מהאזורים הכהים.
    const frontLight = new THREE.DirectionalLight(0xffd19a, 0.10);
    frontLight.position.set(0, 8, 20);
    scene.add(frontLight);

    // אור קצה זהוב מאחור-שמאל: מדגיש את קצוות הפירמידות כמו בתמונת היעד.
    const rimLight = new THREE.DirectionalLight(0xffb04a, 1.15);
    rimLight.position.set(-16, 7, -34);
    scene.add(rimLight);

    // ==========================================
    // 3. מערכת מפות
    // ==========================================
    const mapGroup = new THREE.Group();
    scene.add(mapGroup);

    // חלקיקי אווירה לכל מפה — מעט אובייקטים, הרבה יותר תחושת עולם חי.
    let weatherParticles = null;

    // בשלב הזה המשחק מתמקד במפה אחת בלבד: יער.
    // שומרים את ההגדרה פשוטה כדי שכל השיפור הגרפי יושקע בעולם אחד.
    const MAPS = {
        forest: { name: 'FOREST', label: 'יער', price: 0 }
    };

    let selectedMap = 'forest';
    let purchasedMaps = ['forest'];

    // מנקים בחירה ישנה של מפות שהיו בגרסאות קודמות.
    localStorage.setItem('bb3d_map', 'forest');
    localStorage.setItem('bb3d_purchased_maps', JSON.stringify(['forest']));

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
            top = '#25283d';
            middle = '#8a5360';
            horizon = '#f1a35f';
            glow = 'rgba(255, 194, 104, 0.78)';
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
        const cloudRGB = mapId === 'desert' ? '42,39,48' : '255,255,255';
        ctx.globalAlpha = mapId === 'desert' ? 0.34 : 0.08;
        for (let i = 0; i < 16; i++) {
            const x = Math.random() * 512;
            const y = 105 + Math.random() * 190;
            const rx = 55 + Math.random() * 120;
            const ry = 14 + Math.random() * 28;
            const cloud = ctx.createRadialGradient(x, y, 0, x, y, rx);
            cloud.addColorStop(0, `rgba(${cloudRGB},0.72)`);
            cloud.addColorStop(0.55, `rgba(${cloudRGB},0.28)`);
            cloud.addColorStop(1, `rgba(${cloudRGB},0)`);
            ctx.fillStyle = cloud;
            ctx.beginPath();
            ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
            ctx.fill();
        }
        // שכבת ענני-אופק חמה ורכה, בהשראת תמונת הפתיחה.
        if (mapId === 'desert') {
            const warmCloud = ctx.createLinearGradient(0, 315, 0, 440);
            warmCloud.addColorStop(0, 'rgba(255,196,112,0)');
            warmCloud.addColorStop(0.5, 'rgba(255,174,91,0.20)');
            warmCloud.addColorStop(1, 'rgba(255,232,185,0)');
            ctx.fillStyle = warmCloud;
            ctx.fillRect(0, 300, 512, 150);
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

    // ==========================================
    // שמיים דרמטיים (backdrop): לוח ענק מאחורי הפירמידות עם גרדיאנט שקיעה, עננים כהים,
    // זוהר שמש וקרני אור. הוא מצויר ברזולוציה מלאה בדיוק על הטווח שהמצלמה רואה
    // (כיפת השמיים הרגילה מותחת רק ~40 פיקסלים על כל המסך, ולכן יצאה מטושטשת ושטוחה),
    // ובלי tone mapping, כדי שהצבעים יגיעו למסך כמו שהם מוגדרים כאן.
    // ==========================================
    function createSunsetBackdropTexture() {
        const W = 1024;
        const H = 512;
        const canvas = document.createElement('canvas');
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');

        // המרה מזווית מעל האופק (מעלות) לשורת פיקסל בקנבס.
        // הלוח במרחק 165 מהמצלמה, גובה המצלמה ~7.5, והלוח מכסה y מ-94 (למעלה) עד -34 (למטה).
        const DIST = 165;
        const pyAt = deg => (94 - (7.5 + DIST * Math.tan(deg * Math.PI / 180))) * 4;

        // מחולל מספרים אקראי קבוע, כדי שהשמיים ייראו אותו דבר בכל טעינה.
        let seed = 20260930;
        const rnd = () => {
            seed = (seed + 0x6D2B79F5) | 0;
            let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };

        // 1) גרדיאנט אנכי: סגול עמוק למעלה, ורוד־אדום, כתום, וזהב בקו האופק.
        const sky = ctx.createLinearGradient(0, 0, 0, H);
        const stops = [
            [30, '#3b3739'], [20, '#5a4a47'], [14, '#8a6046'], [10, '#c98a45'],
            [6.5, '#efae4c'], [3, '#ffc968'], [0, '#ffe3a3'], [-6, '#f4c27a'], [-12, '#b98a58']
        ];
        stops.forEach(([deg, color]) => {
            sky.addColorStop(Math.min(1, Math.max(0, pyAt(deg) / H)), color);
        });
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, W, H);

        // 2) זוהר השמש: מאחורי קצה הפירמידה המרכזית.
        const sunX = W / 2;
        const sunY = pyAt(7.6);
        ctx.globalCompositeOperation = 'lighter';
        const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 210);
        glow.addColorStop(0, 'rgba(255,236,170,0.95)');
        glow.addColorStop(0.10, 'rgba(255,205,120,0.70)');
        glow.addColorStop(0.35, 'rgba(255,140,60,0.28)');
        glow.addColorStop(1, 'rgba(255,100,50,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);

        // 3) קרני אור (god rays) שיוצאות מהשמש.
        for (let i = 0; i < 22; i++) {
            const angle = (-Math.PI / 2) + (rnd() - 0.5) * 2.5;
            const spread = 0.02 + rnd() * 0.05;
            const len = 330 + rnd() * 120;
            ctx.save();
            ctx.beginPath();
            ctx.moveTo(sunX, sunY);
            ctx.lineTo(sunX + Math.cos(angle - spread) * len, sunY + Math.sin(angle - spread) * len);
            ctx.lineTo(sunX + Math.cos(angle + spread) * len, sunY + Math.sin(angle + spread) * len);
            ctx.closePath();
            ctx.clip();
            const ray = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, len);
            ray.addColorStop(0, `rgba(255,222,150,${0.14 + rnd() * 0.12})`);
            ray.addColorStop(1, 'rgba(255,200,120,0)');
            ctx.fillStyle = ray;
            ctx.fillRect(0, 0, W, H);
            ctx.restore();
        }
        ctx.globalCompositeOperation = 'source-over';

        // 4) עננים כהים וארוכים עם קצה תחתון זהוב. הקצוות רכים (גרדיאנט), בלי קווי מתאר חדים.
        // העננים הנמוכים (קרובים לשמש) דלילים יותר, כדי שהזוהר יישאר גלוי מעל הפירמידות.
        const softBlob = (cx, cy, rx, ry, rgb, alpha) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(1, ry / rx);
            const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
            g.addColorStop(0, `rgba(${rgb},${alpha})`);
            g.addColorStop(0.55, `rgba(${rgb},${alpha * 0.7})`);
            g.addColorStop(1, `rgba(${rgb},0)`);
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(0, 0, rx, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        };

        const bands = [
            { deg: 26.0, tint: '58,52,54', a: 0.80, n: 9 },
            { deg: 22.0, tint: '64,54,54', a: 0.80, n: 9 },
            { deg: 18.5, tint: '74,58,54', a: 0.75, n: 8 },
            { deg: 15.5, tint: '88,64,54', a: 0.70, n: 7 },
            { deg: 13.0, tint: '104,70,52', a: 0.62, n: 6 },
            { deg: 11.0, tint: '124,78,50', a: 0.52, n: 4 },
            { deg: 9.4,  tint: '140,88,48', a: 0.38, n: 2 }
        ];
        bands.forEach(({ deg, tint, a, n }) => {
            const baseY = pyAt(deg);
            for (let c = 0; c < n; c++) {
                const cx = 220 + rnd() * 580;
                const cy = baseY + (rnd() - 0.5) * 10;
                const rx = 70 + rnd() * 140;
                const ry = 7 + rnd() * 11;
                for (let k = 0; k < 3; k++) {
                    const ox = (rnd() - 0.5) * rx * 0.8;
                    const oy = (rnd() - 0.5) * ry * 0.6;
                    const erx = rx * (0.55 + rnd() * 0.4);
                    const ery = ry * (0.8 + rnd() * 0.5);
                    softBlob(cx + ox, cy + oy + ery * 0.7, erx, ery * 1.1, '255,170,80', 0.42);  // קצה זהוב מתחת
                    softBlob(cx + ox, cy + oy, erx, ery, tint, a);                                 // גוף כהה
                }
            }
        });

        const texture = new THREE.CanvasTexture(canvas);
        texture.encoding = THREE.sRGBEncoding;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;
        texture.needsUpdate = true;
        return texture;
    }

    function addSkyBackdrop() {
        const mat = new THREE.MeshBasicMaterial({
            map: createSunsetBackdropTexture(),
            depthWrite: false,
            fog: false,
            toneMapped: false
        });
        const plane = new THREE.Mesh(new THREE.PlaneGeometry(256, 128), mat);
        plane.position.set(0, 30, -150);
        plane.renderOrder = -90;
        mapGroup.add(plane);
        return plane;
    }

    function addSunGlow(mapId) {
        let color = 0xffe0a8;
        if (mapId === 'forest') color = 0xd7efc1;
        if (mapId === 'ice') color = 0xe5f8ff;
        if (mapId === 'volcano') color = 0xff6a3a;

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

        // טבעת זוהר רחבה סביב השמש — מעט גאומטריה, הרבה עומק.
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
        halo.scale.set(1.7, 0.85, 1);
        halo.renderOrder = -51;
        mapGroup.add(halo);
    }

    function addDistantHill(x, y, z, sx, sy, sz, color, opacity = 1) {
        const mat = new THREE.MeshStandardMaterial({
            color,
            roughness: 1,
            flatShading: true,
            transparent: opacity < 1,
            opacity,
            depthWrite: opacity >= 1
        });
        const hill = addMesh(
            new THREE.SphereGeometry(1, 10, 6),
            mat,
            x,
            y,
            z,
            false,
            false
        );
        hill.scale.set(sx, sy, sz);
        return hill;
    }

    function addDistantMountain(x, y, z, radius, height, color, rotation = 0) {
        const mat = new THREE.MeshStandardMaterial({
            color,
            roughness: 1,
            flatShading: true
        });
        const mountain = addMesh(
            new THREE.ConeGeometry(radius, height, 7),
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

    function addBush(x, z, scale = 1, color = 0x356b23) {
        const mat = new THREE.MeshStandardMaterial({
            color,
            roughness: 1,
            flatShading: true
        });
        const bush = addMesh(
            new THREE.DodecahedronGeometry(0.65 * scale, 0),
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

    function addDistantForestRow(z, baseScale = 1) {
        const xs = [-13.5, -10.8, -8.1, -5.4, -2.7, 0, 2.7, 5.4, 8.1, 10.8, 13.5];
        xs.forEach((x, index) => {
            const scale = baseScale * (0.78 + ((index * 17) % 7) * 0.07);
            addLowPolyTree(x, z, scale);
        });
    }

    function addEnvironmentalDepth(mapId) {
        addSkyDome(mapId);
        if (mapId === 'desert') {
            addSkyBackdrop();   // שמיים דרמטיים + שמש מאחורי הפירמידה (במקום כדור השמש הלבן)
        } else {
            addSunGlow(mapId);
        }

        if (mapId === 'desert') {
            // שכבת אובך חמה באופק — מחברת את הפירמידות לשמיים.
            const hazeMat = new THREE.MeshBasicMaterial({
                color: 0xffc27a,
                transparent: true,
                opacity: 0.075,
                depthWrite: false,
                fog: false
            });
            const haze = new THREE.Mesh(new THREE.PlaneGeometry(34, 8), hazeMat);
            haze.position.set(0, 5.0, -35);
            haze.renderOrder = -10;
            mapGroup.add(haze);

            // שלוש שכבות של דיונות/הרים יוצרות מרחק ברור.
            // שיחים ירוקים בקצוות הקדמיים, באותו ירוק אחיד של הדשא.
            addBush(-12.0, -8.0, 0.8, GRASS_GREEN);
            addBush(12.0, -9.0, 0.7, GRASS_GREEN);
            addBush(-10.5, -12.5, 0.62, GRASS_GREEN);
            addBush(10.6, -13.0, 0.68, GRASS_GREEN);
        } else if (mapId === 'forest') {
            // יער בשכבות: שורה רחוקה, שורה בינונית, ואז כמה עצים קרובים.
            addDistantHill(-10, 1.5, -22, 11, 5.0, 4.0, 0x28543a, 0.82);
            addDistantHill(10, 1.7, -24, 12, 5.6, 4.5, 0x244b34, 0.80);
            addDistantHill(0, 2.0, -36, 22, 7.5, 6.0, 0x1d3d2d, 0.64);
            addDistantForestRow(-20, 1.25);
            addDistantForestRow(-30, 1.75);
            addBush(-11.5, -6.5, 1.0, 0x2d5d25);
            addBush(11.5, -7.0, 1.1, 0x2a5722);
            addBush(-9.5, -10.5, 0.72, 0x376e29);
            addBush(9.5, -11.5, 0.82, 0x356728);
        } else if (mapId === 'ice') {
            addDistantMountain(-15, 6, -21, 7.5, 15, 0xb8d6e4, 0.3);
            addDistantMountain(15, 7, -23, 9.5, 18, 0x9fc5d8, -0.15);
            addDistantMountain(-3, 9, -34, 14, 23, 0x86b1c7, 0.4);
            addDistantHill(0, 1.2, -18, 20, 4.0, 4.0, 0xb9d7e1, 0.72);
            for (let i = 0; i < 7; i++) {
                addCrystal(-11 + i * 3.4, -8 - (i % 3) * 1.8, 0.45 + (i % 2) * 0.25);
            }
        } else if (mapId === 'volcano') {
            addDistantMountain(-14, 5.5, -24, 8.0, 15, 0x302528, -0.2);
            addDistantMountain(14, 5.8, -27, 9.0, 17, 0x2a2225, 0.25);
            addDistantMountain(1, 8, -40, 15, 25, 0x1d171a, 0.1);
            addDistantHill(0, 1.1, -14, 20, 3.7, 3.7, 0x3a2b2c, 0.84);

            // לבה זעירה בנקודות רחוקות כדי לתת תחושת "חי" לסביבה.
            [-10, -3, 6, 12].forEach((x, i) => {
                const lavaMat = new THREE.MeshBasicMaterial({
                    color: 0xff7138,
                    transparent: true,
                    opacity: 0.7,
                    depthWrite: false
                });
                addMesh(
                    new THREE.SphereGeometry(0.18 + (i % 2) * 0.08, 8, 6),
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

    function addWeatherParticles(mapId) {
        const group = new THREE.Group();
        mapGroup.add(group);

        const count = mapId === 'ice' ? 52 : mapId === 'volcano' ? 42 : mapId === 'forest' ? 34 : 22;
        const positions = new Float32Array(count * 3);
        const velocity = new Float32Array(count * 3);

        let color = 0xdbe9e2;
        let size = 0.055;
        let opacity = 0.24;

        if (mapId === 'desert') {
            color = 0xf4d0a2;
            size = 0.042;
            opacity = 0.16;
        } else if (mapId === 'forest') {
            color = 0xd8f0b6;
            size = 0.048;
            opacity = 0.18;
        } else if (mapId === 'ice') {
            color = 0xf4fdff;
            size = 0.075;
            opacity = 0.52;
        } else if (mapId === 'volcano') {
            color = 0xff8b45;
            size = 0.060;
            opacity = 0.36;
        }

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3] = (Math.random() - 0.5) * 25;
            positions[i3 + 1] = 1.1 + Math.random() * 8.5;
            positions[i3 + 2] = -2 - Math.random() * 25;

            if (mapId === 'ice') {
                velocity[i3] = -0.008 + Math.random() * 0.016;
                velocity[i3 + 1] = -(0.018 + Math.random() * 0.024);
                velocity[i3 + 2] = 0.002 + Math.random() * 0.008;
            } else if (mapId === 'volcano') {
                velocity[i3] = -0.012 + Math.random() * 0.024;
                velocity[i3 + 1] = 0.010 + Math.random() * 0.022;
                velocity[i3 + 2] = -0.002 + Math.random() * 0.010;
            } else {
                velocity[i3] = -0.004 + Math.random() * 0.008;
                velocity[i3 + 1] = 0.004 + Math.random() * 0.008;
                velocity[i3 + 2] = 0.001 + Math.random() * 0.004;
            }
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            color,
            size,
            transparent: true,
            opacity,
            depthWrite: false,
            sizeAttenuation: true
        });

        const points = new THREE.Points(geometry, material);
        points.renderOrder = 5;
        group.add(points);

        weatherParticles = {
            mapId,
            points,
            positions,
            velocity,
            count
        };

        // תאורת אווירה מקומית בלבד במפת הר הגעש — ללא צללים כדי לשמור על מובייל חלק.
        if (mapId === 'volcano') {
            [[-7, 1.1, -8], [7, 1.0, -10], [0, 1.4, -15]].forEach(([x, y, z]) => {
                const glow = new THREE.PointLight(0xff5a2a, 0.70, 11, 2);
                glow.position.set(x, y, z);
                mapGroup.add(glow);
            });
        }
    }

    function updateWeatherParticles() {
        if (!weatherParticles) return;

        const { mapId, points, positions, velocity, count } = weatherParticles;
        for (let i = 0; i < count; i++) {
            const i3 = i * 3;
            positions[i3] += velocity[i3];
            positions[i3 + 1] += velocity[i3 + 1];
            positions[i3 + 2] += velocity[i3 + 2];

            if (mapId === 'ice' && positions[i3 + 1] < 0.5) {
                positions[i3] = (Math.random() - 0.5) * 25;
                positions[i3 + 1] = 8.5 + Math.random() * 2;
                positions[i3 + 2] = -2 - Math.random() * 25;
            } else if (mapId === 'volcano' && positions[i3 + 1] > 10.5) {
                positions[i3] = (Math.random() - 0.5) * 20;
                positions[i3 + 1] = 0.8 + Math.random() * 1.8;
                positions[i3 + 2] = -8 - Math.random() * 14;
            } else if (mapId !== 'ice' && positions[i3 + 2] > 1) {
                positions[i3 + 2] = -25;
                positions[i3] = (Math.random() - 0.5) * 25;
                positions[i3 + 1] = 1.2 + Math.random() * 7.5;
            }
        }
        points.geometry.attributes.position.needsUpdate = true;
    }

    // ==========================================
    // 3B. נפח קרקע + פרטי 3D קטנים
    // ==========================================
    function createTerrainGeometry(mapId) {
        const geometry = new THREE.PlaneGeometry(40, 90, 32, 60);
        const position = geometry.attributes.position;

        for (let i = 0; i < position.count; i++) {
            const x = position.getX(i);
            const z = position.getY(i);

            const waveA = Math.sin(x * 0.42 + z * 0.18) * 0.105;
            const waveB = Math.cos(z * 0.55 - x * 0.22) * 0.070;
            const waveC = Math.sin((x + z) * 0.9) * 0.032;

            let height = waveA + waveB + waveC;

            // משאירים את האזור שמתחת לקנון כמעט שטוח.
            const centerDistance = Math.hypot(x / 5.0, z / 3.8);
            const centerWeight = THREE.MathUtils.smoothstep(centerDistance, 0.25, 1.0);
            height *= centerWeight;

            if (mapId === 'ice') {
                height *= 0.55;
            } else if (mapId === 'volcano') {
                height += Math.sin(x * 0.23 - z * 0.31) * 0.018;
            }

            position.setZ(i, height);
        }

        geometry.computeVertexNormals();
        return geometry;
    }

    function addGroundDetail(mapId) {
        const detailGroup = new THREE.Group();
        mapGroup.add(detailGroup);

        const isIce = mapId === 'ice';
        const isVolcano = mapId === 'volcano';
        const isForest = mapId === 'forest';

        const pebbleColors = isIce
            ? [0x8ebdce, 0xaad4df, 0x6e9eaf]
            : isVolcano
                ? [0x302b29, 0x48403b, 0x201d1b]
                : isForest
                    ? [0x415b2f, 0x526e35, 0x314b27]
                    : [0x6d572f, 0x806842, 0x5c4727];

        // מעט מאוד פרטים כדי לתת קנה מידה ועומק בלי להעמיס על מובייל.
        for (let i = 0; i < 26; i++) {
            const side = i % 2 === 0 ? -1 : 1;
            const x = side * (8.3 + Math.random() * 5.2);
            const z = -5.5 - Math.random() * 10.5;
            const size = 0.045 + Math.random() * 0.085;

            const pebble = new THREE.Mesh(
                new THREE.DodecahedronGeometry(size, 0),
                new THREE.MeshStandardMaterial({
                    color: pebbleColors[i % pebbleColors.length],
                    roughness: 0.95,
                    metalness: 0.0,
                    flatShading: true
                })
            );

            pebble.position.set(
                x + (Math.random() - 0.5) * 1.8,
                0.05 + size * 0.55,
                z
            );

            pebble.rotation.set(
                Math.random() * 0.6,
                Math.random() * 1.2,
                Math.random() * 0.5
            );

            pebble.castShadow = true;
            pebble.receiveShadow = true;
            detailGroup.add(pebble);
        }

        // עשבונים קטנים רק במפות טבעיות.
        if (!isIce && !isVolcano) {
            for (let i = 0; i < 18; i++) {
                const side = i % 2 === 0 ? -1 : 1;
                const x = side * (8.1 + Math.random() * 5.5);
                const z = -4.5 - Math.random() * 11.5;
                const scale = 0.45 + Math.random() * 0.45;

                const grassMat = new THREE.MeshStandardMaterial({
                    color: GRASS_GREEN,
                    roughness: 1,
                    flatShading: true
                });

                const blade = new THREE.Mesh(
                    new THREE.ConeGeometry(0.055 * scale, 0.5 * scale, 5),
                    grassMat
                );

                blade.position.set(
                    x + (Math.random() - 0.5) * 1.7,
                    0.24 * scale,
                    z
                );

                blade.rotation.z = (Math.random() - 0.5) * 0.28;
                blade.castShadow = true;
                detailGroup.add(blade);
            }
        }
    }

    // ==========================================
    // 3C. שכבת פרטי חזית — נותנת תחושת עולם אמיתית
    // ==========================================
    function addForegroundScenery(mapId) {
        const group = new THREE.Group();
        mapGroup.add(group);

        const isDesert = mapId === 'desert';
        const isForest = mapId === 'forest';
        const isIce = mapId === 'ice';
        const isVolcano = mapId === 'volcano';

        // רכסי קרקע נמוכים בצדדים — לא פלטפורמה, אלא שולי שטח טבעיים.
        const ridgeMat = new THREE.MeshStandardMaterial({
            color: isIce ? 0xa7d0dd : isVolcano ? 0x24201f : (isForest || isDesert) ? GRASS_GREEN : 0x76532f,
            roughness: 0.98,
            metalness: 0.0,
            flatShading: true
        });

        [-1, 1].forEach(side => {
            const ridge = new THREE.Mesh(
                new THREE.SphereGeometry(1, 12, 7),
                ridgeMat
            );
            ridge.scale.set(6.8, 0.34, 10.5);
            ridge.position.set(side * 9.4, 0.13, -8.7);
            ridge.rotation.z = side * 0.025;
            ridge.castShadow = true;
            ridge.receiveShadow = true;
            group.add(ridge);
        });

        // אבנים שטוחות בפרונט, מפוזרות רק מחוץ למסלול התותח.
        const stonePalette = isIce
            ? [0x9ec8d5, 0x7faebb, 0xc8e7ee]
            : isVolcano
                ? [0x282322, 0x3a3330, 0x1f1b1a]
                : isForest
                    ? [0x3c522f, 0x51683f, 0x2c4024]
                    : [0x6b5d52, 0x7d6d60, 0x594d45];

        for (let i = 0; i < 20; i++) {
            const side = i % 2 === 0 ? -1 : 1;
            const stoneSize = 0.16 + Math.random() * 0.26;
            const stone = new THREE.Mesh(
                new THREE.IcosahedronGeometry(stoneSize, 1),
                new THREE.MeshStandardMaterial({
                    color: stonePalette[i % stonePalette.length],
                    roughness: 0.90,
                    metalness: 0.02,
                    flatShading: true
                })
            );
            stone.position.set(
                side * (5.9 + Math.random() * 4.8),
                0.16 + stoneSize * 0.5,
                -0.8 - Math.random() * 8.5
            );
            stone.scale.y = 0.55 + Math.random() * 0.35;
            stone.rotation.set(Math.random() * 0.9, Math.random() * 1.8, Math.random() * 0.7);
            stone.castShadow = true;
            stone.receiveShadow = true;
            group.add(stone);
        }

        if (isDesert) {
            // אדוות חול בולטות יותר במרחק קצר.
            for (let i = 0; i < 7; i++) {
                const dune = new THREE.Mesh(
                    new THREE.SphereGeometry(1, 14, 8),
                    new THREE.MeshStandardMaterial({
                        color: GRASS_GREEN,
                        roughness: 1,
                        flatShading: true
                    })
                );
                dune.scale.set(1.8 + Math.random() * 1.4, 0.16 + Math.random() * 0.12, 0.85 + Math.random() * 0.6);
                dune.position.set((i % 2 === 0 ? -1 : 1) * (7.2 + Math.random() * 5.0), 0.12, -3.0 - i * 1.5);
                dune.rotation.y = Math.random() * Math.PI;
                dune.receiveShadow = true;
                group.add(dune);
            }
        }

        if (isForest) {
            // צמחייה נמוכה עם גבעולים ועלים נפרדים — הרבה יותר נפח מעצים לבדם.
            const leafMat = new THREE.MeshStandardMaterial({
                color: 0x4d7e2f,
                roughness: 0.97,
                flatShading: true
            });
            const stemMat = new THREE.MeshStandardMaterial({
                color: 0x5b432c,
                roughness: 1,
                flatShading: true
            });

            for (let i = 0; i < 14; i++) {
                const side = i % 2 === 0 ? -1 : 1;
                const x = side * (6.5 + Math.random() * 4.8);
                const z = -2.0 - Math.random() * 9.0;
                const s = 0.55 + Math.random() * 0.55;

                const stem = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.035 * s, 0.05 * s, 0.45 * s, 6),
                    stemMat
                );
                stem.position.set(x, 0.22 * s, z);
                stem.castShadow = true;
                group.add(stem);

                const leaves = new THREE.Mesh(
                    new THREE.ConeGeometry(0.20 * s, 0.55 * s, 5),
                    leafMat
                );
                leaves.position.set(x, 0.49 * s, z);
                leaves.rotation.y = Math.random() * Math.PI;
                leaves.castShadow = true;
                group.add(leaves);
            }
        }

        if (isIce) {
            // שברי קרח זוויתיים שממשיכים את הקרקע לתוך העומק.
            const iceMat = new THREE.MeshPhysicalMaterial({
                color: 0xbfe7f2,
                roughness: 0.18,
                metalness: 0.04,
                clearcoat: 0.75,
                clearcoatRoughness: 0.12,
                flatShading: true
            });

            for (let i = 0; i < 9; i++) {
                const shard = new THREE.Mesh(
                    new THREE.CylinderGeometry(0.22, 0.42, 0.9 + Math.random() * 0.8, 5),
                    iceMat
                );
                const side = i % 2 === 0 ? -1 : 1;
                shard.position.set(side * (6.4 + Math.random() * 4.8), 0.38, -3.0 - Math.random() * 10);
                shard.rotation.set(Math.random() * 0.35, Math.random() * 1.5, (Math.random() - 0.5) * 0.22);
                shard.castShadow = true;
                shard.receiveShadow = true;
                group.add(shard);
            }
        }

        if (isVolcano) {
            // סלעים שחורים וחריצי לבה קטנים כדי להגדיל את עומק המפה.
            const lavaMat = new THREE.MeshBasicMaterial({
                color: 0xff6b35,
                transparent: true,
                opacity: 0.82,
                depthWrite: false
            });

            for (let i = 0; i < 7; i++) {
                const crack = new THREE.Mesh(
                    new THREE.BoxGeometry(0.06 + Math.random() * 0.08, 0.025, 0.65 + Math.random() * 0.65),
                    lavaMat
                );
                const side = i % 2 === 0 ? -1 : 1;
                crack.position.set(side * (6.0 + Math.random() * 5.0), 0.028, -2.0 - Math.random() * 10.0);
                crack.rotation.y = (Math.random() - 0.5) * 0.9;
                group.add(crack);
            }
        }
    }

    function addCannonLighting(mapId) {
        let keyColor = 0x5dd7ff;
        let rimColor = 0xc6edff;

        if (mapId === 'desert') {
            keyColor = 0xffc77a;
            rimColor = 0xb8d6ff;
        } else if (mapId === 'forest') {
            keyColor = 0x8be28b;
            rimColor = 0x9ed6ff;
        } else if (mapId === 'ice') {
            keyColor = 0xbcefff;
            rimColor = 0xe7fbff;
        } else if (mapId === 'volcano') {
            keyColor = 0xff7042;
            rimColor = 0x6db5ff;
        }

        const key = new THREE.PointLight(keyColor, mapId === 'volcano' ? 0.45 : 0.22, 6.5, 2);
        key.position.set(0, 2.7, 2.2);
        cannonGroup.add(key);

        const rim = new THREE.PointLight(rimColor, 0.34, 7, 2);
        rim.position.set(0, 2.0, -2.4);
        cannonGroup.add(rim);

        // תאורת צד חלשה שמדגישה את הקימורים בזמן תנועה.
        const side = new THREE.PointLight(0xffffff, 0.12, 5, 2);
        side.position.set(3.2, 1.15, 0.4);
        cannonGroup.add(side);
    }

    function createGroundTexture(mapId) {
        const canvas = document.createElement('canvas');
        const bumpCanvas = document.createElement('canvas');
        canvas.width = bumpCanvas.width = 512;
        canvas.height = bumpCanvas.height = 512;

        const ctx = canvas.getContext('2d');
        const bumpCtx = bumpCanvas.getContext('2d');

        // צבעי דשא בהירים בצדדים — כמו ברפרנס — עם מרקם עדין.
        const base = '#6f9148';
        const accentA = '#7fa456';
        const accentB = '#5e803f';

        ctx.fillStyle = base;
        ctx.fillRect(0, 0, 512, 512);
        bumpCtx.fillStyle = '#858585';
        bumpCtx.fillRect(0, 0, 512, 512);

        // שכבות רחבות, כדי שהקרקע תיראה טבעית ולא כמו כתמים אקראיים.
        for (let i = 0; i < 14; i++) {
            const y = (i / 14) * 512;
            const grad = ctx.createLinearGradient(0, y, 512, y + 55);
            grad.addColorStop(0, i % 2 === 0 ? accentA : accentB);
            grad.addColorStop(0.5, base);
            grad.addColorStop(1, i % 2 === 0 ? accentB : accentA);
            ctx.globalAlpha = 0.20;
            ctx.fillStyle = grad;
            ctx.fillRect(0, y, 512, 58);
        }
        ctx.globalAlpha = 1;

        // להבי דשא/קווים ארוכים ועדינים.
        for (let i = 0; i < 210; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const len = 18 + Math.random() * 70;
            const alpha = 0.035 + Math.random() * 0.055;
            ctx.strokeStyle = i % 3 === 0
                ? `rgba(190,220,135,${alpha})`
                : `rgba(30,62,25,${alpha})`;
            ctx.lineWidth = 0.6 + Math.random() * 0.8;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(
                x + len * 0.45,
                y + (Math.random() - 0.5) * 5,
                x + len,
                y + (Math.random() - 0.5) * 8
            );
            ctx.stroke();
        }

        // bump עדין שמרגיש כמו קרקע ולא כמו רעש.
        for (let i = 0; i < 120; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const len = 15 + Math.random() * 60;
            const shade = 105 + Math.floor(Math.random() * 40);
            bumpCtx.strokeStyle = `rgb(${shade},${shade},${shade})`;
            bumpCtx.globalAlpha = 0.12 + Math.random() * 0.12;
            bumpCtx.lineWidth = 0.8 + Math.random() * 1.2;
            bumpCtx.beginPath();
            bumpCtx.moveTo(x, y);
            bumpCtx.quadraticCurveTo(
                x + len * 0.5,
                y + (Math.random() - 0.5) * 4,
                x + len,
                y + (Math.random() - 0.5) * 6
            );
            bumpCtx.stroke();
        }
        bumpCtx.globalAlpha = 1;

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(5.5, 11.5);
        texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        texture.encoding = THREE.sRGBEncoding;
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        texture.magFilter = THREE.LinearFilter;
        texture.needsUpdate = true;

        const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
        bumpTexture.wrapS = THREE.RepeatWrapping;
        bumpTexture.wrapT = THREE.RepeatWrapping;
        bumpTexture.repeat.copy(texture.repeat);
        bumpTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        bumpTexture.minFilter = THREE.LinearMipMapLinearFilter;
        bumpTexture.magFilter = THREE.LinearFilter;
        bumpTexture.needsUpdate = true;

        return { texture, bumpTexture };
    }

    function createForestPathTexture() {
        const canvas = document.createElement('canvas');
        const bumpCanvas = document.createElement('canvas');
        canvas.width = bumpCanvas.width = 512;
        canvas.height = bumpCanvas.height = 512;

        const ctx = canvas.getContext('2d');
        const bumpCtx = bumpCanvas.getContext('2d');

        ctx.fillStyle = '#12371d';
        ctx.fillRect(0, 0, 512, 512);
        bumpCtx.fillStyle = '#777777';
        bumpCtx.fillRect(0, 0, 512, 512);

        for (let i = 0; i < 170; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const len = 20 + Math.random() * 90;
            const alpha = 0.045 + Math.random() * 0.055;
            ctx.strokeStyle = i % 2 === 0
                ? `rgba(42,82,38,${alpha})`
                : `rgba(6,28,14,${alpha})`;
            ctx.lineWidth = 0.8 + Math.random() * 1.1;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.quadraticCurveTo(
                x + len * 0.45,
                y + (Math.random() - 0.5) * 5,
                x + len,
                y + (Math.random() - 0.5) * 7
            );
            ctx.stroke();
        }

        for (let i = 0; i < 100; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const len = 18 + Math.random() * 65;
            const shade = 95 + Math.floor(Math.random() * 35);
            bumpCtx.strokeStyle = `rgb(${shade},${shade},${shade})`;
            bumpCtx.globalAlpha = 0.12 + Math.random() * 0.12;
            bumpCtx.lineWidth = 0.8 + Math.random() * 1.2;
            bumpCtx.beginPath();
            bumpCtx.moveTo(x, y);
            bumpCtx.lineTo(x + len, y + (Math.random() - 0.5) * 5);
            bumpCtx.stroke();
        }
        bumpCtx.globalAlpha = 1;

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(3.5, 8.5);
        texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        texture.encoding = THREE.sRGBEncoding;
        texture.minFilter = THREE.LinearMipMapLinearFilter;
        texture.magFilter = THREE.LinearFilter;

        const bumpTexture = new THREE.CanvasTexture(bumpCanvas);
        bumpTexture.wrapS = THREE.RepeatWrapping;
        bumpTexture.wrapT = THREE.RepeatWrapping;
        bumpTexture.repeat.copy(texture.repeat);
        bumpTexture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        bumpTexture.minFilter = THREE.LinearMipMapLinearFilter;
        bumpTexture.magFilter = THREE.LinearFilter;

        return { texture, bumpTexture };
    }

    // מרקם סלע מחוספס ואפור־חום לפירמידות (כמו בתמונת הפתיח).
    function createRockTexture() {
        const size = 512;
        const canvas = document.createElement('canvas');
        const bumpCanvas = document.createElement('canvas');
        canvas.width = canvas.height = bumpCanvas.width = bumpCanvas.height = size;
        const ctx = canvas.getContext('2d');
        const bumpCtx = bumpCanvas.getContext('2d');

        ctx.fillStyle = '#7a6d62';
        ctx.fillRect(0, 0, size, size);
        bumpCtx.fillStyle = '#808080';
        bumpCtx.fillRect(0, 0, size, size);

        const poly = (c, x, y, r, n, fill) => {
            c.beginPath();
            for (let k = 0; k < n; k++) {
                const a = (k / n) * Math.PI * 2 + Math.random() * 0.6;
                const rr = r * (0.65 + Math.random() * 0.5);
                const px = x + Math.cos(a) * rr;
                const py = y + Math.sin(a) * rr;
                if (k === 0) c.moveTo(px, py); else c.lineTo(px, py);
            }
            c.closePath();
            c.fillStyle = fill;
            c.fill();
        };

        // פלחי סלע לא סדירים בגוונים קרובים.
        for (let i = 0; i < 260; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const r = 14 + Math.random() * 46;
            const n = 5 + Math.floor(Math.random() * 3);
            const shade = 92 + Math.floor(Math.random() * 56);
            const tint = Math.floor(Math.random() * 14);
            poly(ctx, x, y, r, n, `rgba(${shade + tint},${shade},${shade - 10},0.55)`);
            const bump = 90 + Math.floor(Math.random() * 80);
            poly(bumpCtx, x, y, r, n, `rgba(${bump},${bump},${bump},0.5)`);
        }

        // סדקים כהים.
        for (let i = 0; i < 90; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const len = 20 + Math.random() * 60;
            const ang = Math.random() * Math.PI * 2;
            ctx.strokeStyle = 'rgba(30,24,22,0.28)';
            ctx.lineWidth = 1 + Math.random() * 1.6;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
            ctx.stroke();
            bumpCtx.strokeStyle = 'rgba(40,40,40,0.5)';
            bumpCtx.lineWidth = 1.5;
            bumpCtx.beginPath();
            bumpCtx.moveTo(x, y);
            bumpCtx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
            bumpCtx.stroke();
        }

        const aniso = Math.min(4, renderer.capabilities.getMaxAnisotropy());
        const map = new THREE.CanvasTexture(canvas);
        map.wrapS = map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(2.5, 2.5);
        map.anisotropy = aniso;
        map.encoding = THREE.sRGBEncoding;
        map.needsUpdate = true;

        const bumpMap = new THREE.CanvasTexture(bumpCanvas);
        bumpMap.wrapS = bumpMap.wrapT = THREE.RepeatWrapping;
        bumpMap.repeat.copy(map.repeat);
        bumpMap.anisotropy = aniso;
        bumpMap.needsUpdate = true;

        return { map, bumpMap };
    }

    function createStoneTexture() {
        const canvas = document.createElement('canvas');
        const bumpCanvas = document.createElement('canvas');
        canvas.width = bumpCanvas.width = 512;
        canvas.height = bumpCanvas.height = 512;

        const ctx = canvas.getContext('2d');
        const bumpCtx = bumpCanvas.getContext('2d');

        ctx.fillStyle = '#9c774d';
        ctx.fillRect(0, 0, 512, 512);
        bumpCtx.fillStyle = '#828282';
        bumpCtx.fillRect(0, 0, 512, 512);

        // אבני בנייה רחבות — נותנות לפירמידה חומר, בלי כתמי רעש.
        const rows = 11;
        const cols = 8;
        const tileW = 512 / cols;
        const tileH = 512 / rows;

        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const offset = row % 2 === 0 ? 0 : tileW * 0.5;
                const x = col * tileW - offset;
                const y = row * tileH;
                const w = tileW + 2;
                const h = tileH + 2;

                const value = 120 + ((row * 17 + col * 11) % 34);
                ctx.fillStyle = `rgb(${value + 20},${value},${value - 24})`;
                ctx.fillRect(x + 2, y + 2, w - 4, h - 4);

                ctx.strokeStyle = 'rgba(53,38,24,0.34)';
                ctx.lineWidth = 3;
                ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);

                const shade = 105 + ((row + col) % 4) * 15;
                bumpCtx.fillStyle = `rgb(${shade},${shade},${shade})`;
                bumpCtx.fillRect(x + 3, y + 3, w - 6, h - 6);
            }
        }

        ctx.globalAlpha = 0.35;
        for (let i = 0; i < 65; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            ctx.strokeStyle = i % 2 ? '#6f5239' : '#c09a6d';
            ctx.lineWidth = 0.8 + Math.random() * 1.2;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + 5 + Math.random() * 18, y + (Math.random() - 0.5) * 5);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;

        const map = new THREE.CanvasTexture(canvas);
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(0.95, 1.15);
        map.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        map.encoding = THREE.sRGBEncoding;
        map.minFilter = THREE.LinearMipMapLinearFilter;
        map.magFilter = THREE.LinearFilter;

        const bumpMap = new THREE.CanvasTexture(bumpCanvas);
        bumpMap.wrapS = THREE.RepeatWrapping;
        bumpMap.wrapT = THREE.RepeatWrapping;
        bumpMap.repeat.copy(map.repeat);
        bumpMap.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
        bumpMap.minFilter = THREE.LinearMipMapLinearFilter;
        bumpMap.magFilter = THREE.LinearFilter;

        return { map, bumpMap };
    }

    // ==========================================
    // 3D DEPTH CUES
    // ==========================================
    // אובייקטים בגדלים שונים לאורך ציר Z יוצרים
    // נקודות ייחוס ברורות למרחק ומחזקים את תחושת התלת-ממד.
    function addPerspectiveDepthDetails(mapId) {
        const group = new THREE.Group();
        mapGroup.add(group);

        let colors;

        if (mapId === 'forest') {
            colors = [0x294b2a, 0x355d31, 0x203f28];
        } else if (mapId === 'ice') {
            colors = [0x8bbdce, 0xaed8e2, 0x6f9faf];
        } else if (mapId === 'volcano') {
            colors = [0x25201f, 0x38302e, 0x1c1818];
        } else {
            colors = [0x6b5d52, 0x7d6d60, 0x594d45];
        }

        const depthLayers = [
            { z: -2.5, scale: 0.42 },
            { z: -7.0, scale: 0.60 },
            { z: -13.0, scale: 0.82 },
            { z: -21.0, scale: 1.08 },
            { z: -32.0, scale: 1.38 },
            { z: -45.0, scale: 1.72 }
        ];

        depthLayers.forEach((layer, layerIndex) => {
            [-1, 1].forEach(side => {
                const scale = layer.scale * (0.88 + Math.random() * 0.22);
                const mat = new THREE.MeshStandardMaterial({
                    color: colors[layerIndex % colors.length],
                    roughness: 0.94,
                    metalness: mapId === 'ice' ? 0.04 : 0,
                    flatShading: true
                });

                const marker = new THREE.Mesh(
                    new THREE.DodecahedronGeometry(0.72 * scale, 0),
                    mat
                );

                marker.position.set(
                    side * (7.0 + scale * 0.65),
                    0.42 * scale,
                    layer.z
                );

                marker.scale.y = 0.72 + Math.random() * 0.45;
                marker.rotation.set(
                    Math.random() * 0.45,
                    Math.random() * Math.PI,
                    Math.random() * 0.35
                );

                marker.castShadow = true;
                marker.receiveShadow = true;
                group.add(marker);

                // סימן גובה קטן מאחוריו נותן עוד רמז לפרספקטיבה.
                if (layerIndex >= 2) {
                    const postMat = new THREE.MeshStandardMaterial({
                        color: colors[(layerIndex + 1) % colors.length],
                        roughness: 0.9,
                        flatShading: true
                    });

                    const post = new THREE.Mesh(
                        new THREE.CylinderGeometry(
                            0.10 * scale,
                            0.16 * scale,
                            1.15 * scale,
                            6
                        ),
                        postMat
                    );

                    post.position.set(
                        side * (8.1 + scale * 0.4),
                        0.58 * scale,
                        layer.z - 0.45
                    );

                    post.castShadow = true;
                    post.receiveShadow = true;
                    group.add(post);
                }
            });
        });
    }

    function add3DGrass(mapId) {
        if (mapId !== 'forest') return;

        const grassGroup = new THREE.Group();
        mapGroup.add(grassGroup);

        // להבי דשא משולשים במקום חרוטים: הם נראים טבעיים יותר,
        // ומכיוון שהם Instanced הם עדיין זולים יחסית לביצועים.
        const bladeGeo = new THREE.BufferGeometry();
        const bladeWidth = 0.055;
        const bladeHeight = 0.82;
        const vertices = new Float32Array([
            0, 0, 0,
            -bladeWidth, bladeHeight * 0.72, 0,
            0, bladeHeight, 0,
            bladeWidth, bladeHeight * 0.72, 0
        ]);
        const indices = [0, 1, 2, 0, 2, 3];
        bladeGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        bladeGeo.setIndex(indices);
        bladeGeo.computeVertexNormals();

        const crossGeo = new THREE.BufferGeometry();
        const crossVertices = new Float32Array([
            -bladeWidth, 0, 0,
             0, bladeHeight, 0,
             bladeWidth, 0, 0,

             0, 0, -bladeWidth,
             0, bladeHeight, 0,
             0, 0, bladeWidth
        ]);
        const crossIndices = [0, 1, 2, 3, 4, 5];
        crossGeo.setAttribute('position', new THREE.BufferAttribute(crossVertices, 3));
        crossGeo.setIndex(crossIndices);
        crossGeo.computeVertexNormals();

        const sideMat = new THREE.MeshStandardMaterial({
            color: GRASS_GREEN,
            roughness: 1,
            metalness: 0,
            flatShading: true,
            side: THREE.DoubleSide
        });

        const lightSideMat = new THREE.MeshStandardMaterial({
            color: GRASS_GREEN,
            roughness: 1,
            metalness: 0,
            flatShading: true,
            side: THREE.DoubleSide
        });

        const edgeMat = new THREE.MeshStandardMaterial({
            color: GRASS_GREEN,
            roughness: 1,
            metalness: 0,
            flatShading: true,
            side: THREE.DoubleSide
        });

        const darkMat = new THREE.MeshStandardMaterial({
            color: GRASS_GREEN,
            roughness: 1,
            metalness: 0,
            flatShading: true,
            side: THREE.DoubleSide
        });

        const dummy = new THREE.Object3D();

        // שכבה צפופה של דשא בהיר בצידי המסלול.
        // יותר צפופה בתחתית המסך ופחות צפופה רחוק באופק,
        // כדי לחזק את הפרספקטיבה של תמונת הרפרנס.
        const sideCount = 1850;
        const sideBlades = new THREE.InstancedMesh(
            crossGeo,
            sideMat,
            sideCount
        );

        for (let i = 0; i < sideCount; i++) {
            const z = -48 + Math.random() * 60;
            const t = THREE.MathUtils.clamp((z + 48) / 60, 0, 1);
            const pathHalfWidth = 2.35 + t * 3.25;
            const side = Math.random() < 0.5 ? -1 : 1;

            const edgeDistance = 0.55 + Math.random() * 5.7;
            const x = side * (pathHalfWidth + edgeDistance);

            const scale = 0.62 + Math.random() * 1.05;
            const heightScale = 0.65 + Math.random() * 0.9;

            dummy.position.set(
                x,
                0.045 + Math.random() * 0.035,
                z
            );
            dummy.rotation.set(
                (Math.random() - 0.5) * 0.18,
                Math.random() * Math.PI,
                (Math.random() - 0.5) * 0.18
            );
            dummy.scale.set(
                scale,
                heightScale,
                scale
            );
            dummy.updateMatrix();
            sideBlades.setMatrixAt(i, dummy.matrix);
        }

        sideBlades.instanceMatrix.needsUpdate = true;
        sideBlades.frustumCulled = true;
        grassGroup.add(sideBlades);

        // שכבה נוספת של להבים בהירים יותר ממש בקצה המסלול.
        // היא יוצרת מעבר טבעי בין השביל הכהה לדשא הבהיר.
        const edgeCount = 680;
        const edgeBlades = new THREE.InstancedMesh(
            bladeGeo,
            lightSideMat,
            edgeCount
        );

        for (let i = 0; i < edgeCount; i++) {
            const side = i % 2 === 0 ? -1 : 1;
            const z = -47 + Math.random() * 59;
            const t = THREE.MathUtils.clamp((z + 47) / 59, 0, 1);
            const pathHalfWidth = 2.42 + t * 3.05;
            const x = side * (
                pathHalfWidth +
                0.08 +
                Math.random() * 0.9
            );

            const scale = 0.65 + Math.random() * 1.15;
            dummy.position.set(x, 0.06, z);
            dummy.rotation.set(
                0,
                Math.random() * Math.PI,
                (Math.random() - 0.5) * 0.32
            );
            dummy.scale.set(
                scale,
                0.72 + Math.random() * 1.0,
                scale
            );
            dummy.updateMatrix();
            edgeBlades.setMatrixAt(i, dummy.matrix);
        }

        edgeBlades.instanceMatrix.needsUpdate = true;
        grassGroup.add(edgeBlades);

        // עשב כהה יותר על השביל עצמו, בכמות נמוכה.
        // הוא מונע מהשביל להיראות כמו טקסטורה שטוחה לחלוטין.
        const pathCount = 430;
        const pathBlades = new THREE.InstancedMesh(
            bladeGeo,
            darkMat,
            pathCount
        );

        for (let i = 0; i < pathCount; i++) {
            const z = -45 + Math.random() * 55;
            const t = THREE.MathUtils.clamp((z + 45) / 55, 0, 1);
            const pathHalfWidth = 2.35 + t * 2.85;
            const x = (Math.random() - 0.5) * pathHalfWidth * 1.7;

            dummy.position.set(x, 0.052, z);
            dummy.rotation.set(
                0,
                Math.random() * Math.PI,
                0
            );
            const scale = 0.35 + Math.random() * 0.7;
            dummy.scale.set(
                scale,
                0.45 + Math.random() * 0.65,
                scale
            );
            dummy.updateMatrix();
            pathBlades.setMatrixAt(i, dummy.matrix);
        }

        pathBlades.instanceMatrix.needsUpdate = true;
        grassGroup.add(pathBlades);

        // קבוצות קטנות של דשא גבוה יותר בקדמת המסך.
        // הן נותנות תחושת קנה מידה בלי להציף את כל המפה.
        const foregroundCount = 180;
        const foregroundBlades = new THREE.InstancedMesh(
            crossGeo,
            edgeMat,
            foregroundCount
        );

        for (let i = 0; i < foregroundCount; i++) {
            const side = i % 2 === 0 ? -1 : 1;
            const z = -2 + Math.random() * 13;
            const t = THREE.MathUtils.clamp((z + 2) / 13, 0, 1);
            const pathHalfWidth = 2.55 + t * 3.0;
            const x = side * (
                pathHalfWidth +
                0.5 +
                Math.random() * 4.2
            );

            dummy.position.set(x, 0.055, z);
            dummy.rotation.set(
                (Math.random() - 0.5) * 0.24,
                Math.random() * Math.PI,
                (Math.random() - 0.5) * 0.24
            );
            const scale = 0.68 + Math.random() * 1.05;
            dummy.scale.set(
                scale,
                0.70 + Math.random() * 0.85,
                scale
            );
            dummy.updateMatrix();
            foregroundBlades.setMatrixAt(i, dummy.matrix);
        }

        foregroundBlades.instanceMatrix.needsUpdate = true;
        grassGroup.add(foregroundBlades);

        // שכבה חדשה של עשבונים קטנים ועדינים: פחות בולטים מהשכבות הקדמיות,
        // אבל מוסיפים פרטים טבעיים בלי להחזיר את המראה הלבן והעמוס.
        const smallCount = 520;
        const smallGrassMat = new THREE.MeshStandardMaterial({
            color: GRASS_GREEN,
            roughness: 1,
            metalness: 0,
            flatShading: true,
            side: THREE.DoubleSide
        });
        const smallBlades = new THREE.InstancedMesh(
            bladeGeo,
            smallGrassMat,
            smallCount
        );

        for (let i = 0; i < smallCount; i++) {
            const side = Math.random() < 0.5 ? -1 : 1;
            const z = -45 + Math.random() * 54;
            const t = THREE.MathUtils.clamp((z + 45) / 54, 0, 1);
            const pathHalfWidth = 2.40 + t * 3.0;
            const x = side * (pathHalfWidth + 0.35 + Math.random() * 5.2);

            dummy.position.set(
                x,
                0.045 + Math.random() * 0.02,
                z
            );
            dummy.rotation.set(
                0,
                Math.random() * Math.PI,
                (Math.random() - 0.5) * 0.2
            );
            const scale = 0.42 + Math.random() * 0.55;
            dummy.scale.set(
                scale,
                0.42 + Math.random() * 0.55,
                scale
            );
            dummy.updateMatrix();
            smallBlades.setMatrixAt(i, dummy.matrix);
        }

        smallBlades.instanceMatrix.needsUpdate = true;
        grassGroup.add(smallBlades);

        bladeGeo.computeBoundingSphere();
        crossGeo.computeBoundingSphere();
    }

    function getForestTerrainHeight(x, z) {
        const waveA = Math.sin(x * 0.42 + z * 0.18) * 0.105;
        const waveB = Math.cos(z * 0.55 - x * 0.22) * 0.070;
        const waveC = Math.sin((x + z) * 0.9) * 0.032;
        const centerDistance = Math.hypot(x / 5.0, z / 3.8);
        const centerWeight = THREE.MathUtils.smoothstep(centerDistance, 0.25, 1.0);
        return (waveA + waveB + waveC) * centerWeight;
    }

    function createForestPathGeometry() {
        const segments = 42;
        const positions = [];
        const uvs = [];
        const indices = [];

        for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const z = 12 - t * 64;
            const width = 5.65 - t * 3.05;
            const curve = Math.sin(t * Math.PI * 1.15) * 0.22;
            const leftX = -width + curve;
            const rightX = width + curve;
            const leftY = getForestTerrainHeight(leftX, z) + 0.045;
            const rightY = getForestTerrainHeight(rightX, z) + 0.045;

            positions.push(leftX, leftY, z);
            positions.push(rightX, rightY, z);
            uvs.push(0, t * 8.0, 1, t * 8.0);
        }

        for (let i = 0; i < segments; i++) {
            const a = i * 2;
            const b = a + 1;
            const c = a + 2;
            const d = a + 3;
            indices.push(a, c, b, b, c, d);
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setIndex(indices);
        geometry.computeVertexNormals();
        return geometry;
    }

    // ==========================================
    // 3D WORLD CORRIDOR — שכבות עומק אמיתיות
    // ==========================================
    function addDeepPerspectiveCorridor(mapId) {
        const group = new THREE.Group();
        mapGroup.add(group);

        const palettes = {
            desert: [0x6b5d52, 0x7d6d60, 0x594d45],
            forest: [0x2b542e, 0x3b6938, 0x234526],
            ice: [0x86b7c8, 0xa6cfdb, 0x6d9cac],
            volcano: [0x292322, 0x3a302e, 0x211b1b]
        };
        const palette = palettes[mapId] || palettes.forest;

        // שולי מסלול מדורגים יוצרים קווי עומק רציפים.
        for (let sideIndex = 0; sideIndex < 2; sideIndex++) {
            const side = sideIndex === 0 ? -1 : 1;

            for (let i = 0; i < 12; i++) {
                const z = 2.0 - i * 4.25;
                const depth = Math.max(0, -z);
                const x = side * (6.0 + depth * 0.035);
                const width = 2.2 + depth * 0.018;
                const height = 0.28 + depth * 0.006;

                const shoulder = new THREE.Mesh(
                    new THREE.BoxGeometry(width, height, 4.5),
                    new THREE.MeshStandardMaterial({
                        color: mapId === 'desert' ? GRASS_GREEN : palette[(i + sideIndex) % palette.length],
                        roughness: 0.96,
                        metalness: mapId === 'ice' ? 0.03 : 0,
                        flatShading: true
                    })
                );

                shoulder.position.set(side * (6.0 + depth * 0.035), -0.03 + height * 0.45, z);
                shoulder.rotation.y = side * (0.035 + i * 0.002);
                shoulder.receiveShadow = true;
                shoulder.castShadow = i < 5;
                group.add(shoulder);
            }
        }

        // אבני מסגרת בגדלים שונים לאורך הציר.
        const markerDistances = [-3, -8, -15, -24, -35, -48];
        markerDistances.forEach((z, index) => {
            const depth = Math.abs(z);
            const scale = Math.max(0.22, 0.82 - depth * 0.0105);

            [-1, 1].forEach(side => {
                const marker = new THREE.Mesh(
                    new THREE.IcosahedronGeometry(scale, 1),
                    new THREE.MeshStandardMaterial({
                        color: palette[(index + 1) % palette.length],
                        roughness: 0.90,
                        flatShading: true
                    })
                );

                marker.position.set(side * (7.1 + depth * 0.025), scale * 0.45, z);
                marker.scale.y = 0.65 + index * 0.025;
                marker.rotation.set(0.12 * index, index * 0.65, side * 0.08);
                marker.castShadow = true;
                marker.receiveShadow = true;
                group.add(marker);
            });
        });

        // צלליות רחוקות יוצרות שכבה נוספת של עומק.
        const farGroup = new THREE.Group();
        group.add(farGroup);

        for (let i = 0; i < 18; i++) {
            const side = i % 2 === 0 ? -1 : 1;
            const z = -18 - Math.random() * 34;
            const x = side * (8.0 + Math.random() * 5.0);
            const h = 0.6 + Math.random() * 1.7;
            const w = 0.45 + Math.random() * 0.75;

            const silhouette = new THREE.Mesh(
                new THREE.ConeGeometry(w, h, 5),
                new THREE.MeshStandardMaterial({
                    color: palette[i % palette.length],
                    roughness: 1,
                    flatShading: true
                })
            );

            silhouette.position.set(x, h * 0.5, z);
            silhouette.rotation.y = Math.random() * Math.PI;
            silhouette.receiveShadow = true;
            farGroup.add(silhouette);
        }
    }

    function buildMap(mapId) {
        mapId = 'forest';   // ה-id נשאר 'forest' כדי לא לשבור את ה-UI והשמירה
        const theme = 'desert'; // העיצוב בפועל: פירמידות בשקיעה זהובה על דשא ירוק
        clearMapGroup();

        // עומק סביבתי נבנה לפני הקרקע והפריטים, כדי שהעולם ירגיש
        // כמו סביבה שלמה ולא רק אוסף אובייקטים.
        addEnvironmentalDepth(theme);

        // הקרקע הראשית היא דשא בהיר; השביל הכהה נבנה מעליה.
        const groundColor = GRASS_GREEN;
        const groundRoughness = 0.92;

        // בסיס שקוע שנותן לקרקע עובי בלי להיראות כפלטפורמה.
        const groundBaseMat = new THREE.MeshStandardMaterial({
            color: groundColor,
            roughness: groundRoughness + 0.08,
            metalness: 0.01
        });

        addMesh(
            new THREE.BoxGeometry(40, 0.55, 90),
            groundBaseMat,
            0,
            -0.31,
            0,
            false,
            true
        );

        const terrainMat = new THREE.MeshStandardMaterial({
            color: groundColor,
            roughness: groundRoughness,
            metalness: 0.015
        });

        const terrain = addMesh(
            createTerrainGeometry(mapId),
            terrainMat,
            0,
            0.018,
            0,
            false,
            true
        );

        terrain.rotation.x = -Math.PI / 2;
        terrain.position.y = 0.018;

        // שביל היער הכהה והמתכנס לאופק — האלמנט המרכזי של המפה.
        const pathMat = new THREE.MeshStandardMaterial({
            color: GRASS_GREEN,
            roughness: 0.92,
            metalness: 0
        });
        const forestPath = addMesh(
            createForestPathGeometry(),
            pathMat,
            0,
            0,
            0,
            false,
            true
        );
        forestPath.renderOrder = 1;

        addGroundDetail(theme);
        addForegroundScenery(theme);
        addPerspectiveDepthDetails(theme);
        addDeepPerspectiveCorridor(theme);
        add3DGrass(mapId);
        addWeatherParticles(theme);

        if (theme === 'desert') {
            // שקיעה זהובה: רקע, ערפל ותאורה חמים.
            scene.background.set(FOG_COLOR);
            scene.fog.color.set(FOG_COLOR);
            scene.fog.near = FOG_NEAR;
            scene.fog.far = FOG_FAR;

            // פירמידות סלע ענקיות: שתיים מסגרות משני הצדדים ואחת גדולה ברקע.
            // הן ממוקמות מחוץ לשביל, והשטח שבו התותח והסלעים זזים נשאר פנוי.
            const rockTexture = createRockTexture();
            const pyramidMatA = new THREE.MeshStandardMaterial({
                color: 0x4f4034,
                map: rockTexture.map,
                bumpMap: rockTexture.bumpMap,
                bumpScale: 0.9,
                roughness: 0.95,
                metalness: 0.0
            });
            const pyramidMatB = new THREE.MeshStandardMaterial({
                color: 0x382d25,
                map: rockTexture.map,
                bumpMap: rockTexture.bumpMap,
                bumpScale: 0.9,
                roughness: 0.96,
                metalness: 0.0
            });
            // הגובה והמרחק חושבו מול זווית המצלמה, כך שקצות הפירמידות נשארים
            // נמוכים מספיק והשמיים הזהובים נראים מעליהן; הבסיסים מחוץ לשביל (רוחב ~3.7).
            const p1 = addMesh(new THREE.ConeGeometry(7.4, 17.5, 4, 12), pyramidMatA, -11.6, 8.75, -29);
            p1.rotation.y = Math.PI / 4;
            const p2 = addMesh(new THREE.ConeGeometry(7.8, 18.5, 4, 12), pyramidMatA, 12.0, 9.25, -32);
            p2.rotation.y = Math.PI / 4;
            const p3 = addMesh(new THREE.ConeGeometry(10.5, 15.5, 4, 14), pyramidMatB, 0, 7.75, -47);
            p3.rotation.y = Math.PI / 4;

            // פסי אור דקים בקצוות — נותנים לפירמידות מראה קולנועי בלי לשנות collision.
            [p1, p2, p3].forEach((p, i) => {
                const edgeMat = new THREE.MeshBasicMaterial({
                    color: 0xffc36b,
                    transparent: true,
                    opacity: i === 2 ? 0.07 : 0.12,
                    depthWrite: false,
                    blending: THREE.AdditiveBlending
                });
                const edge = new THREE.Mesh(
                    new THREE.ConeGeometry(p.geometry.parameters.radius * 0.995, p.geometry.parameters.height * 1.002, 4, 1, true),
                    edgeMat
                );
                edge.position.copy(p.position);
                edge.rotation.y = p.rotation.y;
                edge.renderOrder = 2;
                mapGroup.add(edge);
            });
            addRockDecoration(-6, -5, 1.2, 0x6b5d52);
            addRockDecoration(7, -7, 0.85, 0x7d6d60);

            // פס אדמה עמוק בחזית, בהשראת החלק התחתון של תמונת הפתיחה.
            const soilMat = new THREE.MeshStandardMaterial({
                color: 0x513522,
                roughness: 1.0,
                metalness: 0
            });
            const soilBand = addMesh(
                new THREE.BoxGeometry(40, 0.42, 1.35),
                soilMat,
                0,
                -0.52,
                11.2,
                false,
                true
            );
            soilBand.receiveShadow = true;

            const rootShadow = new THREE.Mesh(
                new THREE.BoxGeometry(40, 0.05, 0.18),
                new THREE.MeshBasicMaterial({ color: 0x263713, transparent: true, opacity: 0.55 })
            );
            rootShadow.position.set(0, 0.03, 10.52);
            mapGroup.add(rootShadow);
        } else if (theme === 'forest') {
            scene.background.set(FOG_COLOR);
            scene.fog.color.set(FOG_COLOR);
            scene.fog.near = FOG_NEAR;
            scene.fog.far = FOG_FAR;
            sunLight.color.set(0xfff6d7);
            sunLight.intensity = 1.34;

            // עצים קרובים — גדולים וברורים, כמו ברפרנס.
            [
                [-9.8, -3.0, 1.15], [-7.8, -7.0, 1.45],
                [8.8, -4.0, 1.25], [10.0, -8.0, 1.55],
                [-10.8, -12.5, 1.65], [11.2, -14.0, 1.80]
            ].forEach(([x, z, scale]) => addLowPolyTree(x, z, scale));

            // שכבת עצים בינונית שממלאת את צידי המסלול.
            [-11, -8.5, -5.8, 5.8, 8.5, 11].forEach((x, i) => {
                addLowPolyTree(x, -19 - (i % 2) * 2.2, 1.55 + (i % 3) * 0.18);
            });

            // סלעים וצמחייה נמוכה נותנים קנה מידה לקרקע.
            addRockDecoration(-7.0, -9.0, 0.72, 0x56634f);
            addRockDecoration(7.2, -11.0, 0.82, 0x4d5c48);
            addRockDecoration(-9.2, -17.0, 0.95, 0x465542);
            addRockDecoration(9.4, -18.0, 1.05, 0x45533f);
        } else if (mapId === 'ice') {
            scene.background.set(0x79b8d1);
            scene.fog.color.set(0x79b8d1);
            scene.fog.density = 0.012;
            sunLight.color.set(0xeaf8ff);
            sunLight.intensity = 1.24;
            const mountainMat = new THREE.MeshStandardMaterial({ color: 0xe0f2fe, roughness: 0.6, flatShading: true });
            [-15, 15].forEach((x, i) => {
                const m = addMesh(new THREE.ConeGeometry(7 + i * 2, 13 + i * 4, 5), mountainMat, x, 6.5 + i * 2, -15);
                m.rotation.y = 0.35;
            });
            for (let i = 0; i < 8; i++) addCrystal((Math.random() - 0.5) * 24, -5 - Math.random() * 13, 0.7 + Math.random() * 0.8);
        } else if (mapId === 'volcano') {
            scene.background.set(0x241114);
            scene.fog.color.set(0x241114);
            scene.fog.density = 0.0155;
            sunLight.color.set(0xffb098);
            sunLight.intensity = 1.12;
            const mountainMat = new THREE.MeshStandardMaterial({ color: 0x44403c, roughness: 1, flatShading: true });
            const volcano = addMesh(new THREE.ConeGeometry(11, 19, 7), mountainMat, 0, 7.5, -18);
            volcano.rotation.y = 0.2;
            const lavaMat = new THREE.MeshBasicMaterial({ color: 0xff6b35 });
            addMesh(new THREE.CylinderGeometry(1.9, 2.6, 0.15, 16), lavaMat, 0, 0.12, -18, false, false);
            [-10, -5, 5, 10].forEach((x, i) => addLavaRock(x, -7 - (i % 2) * 3, 0.9 + (i % 2) * 0.25));
        }
    }

    buildMap('forest');

    // ==========================================
    // 4. עיצוב התותח - 3D DETAIL PASS
    // ==========================================
    const cannonGroup = new THREE.Group();
    const CANNON_SCALE = 1.14;

    // גוף תלת-ממדי עם קצוות מעוגלים.
    function createRoundedBoxGeometry(width, height, depth, radius, bevelSize = 0.08, bevelSegments = 2) {
        const shape = new THREE.Shape();
        const x = -width / 2;
        const y = -height / 2;
        const w = width;
        const h = height;
        const r = Math.min(radius, width / 2, height / 2);

        shape.moveTo(x + r, y);
        shape.lineTo(x + w - r, y);
        shape.quadraticCurveTo(x + w, y, x + w, y + r);
        shape.lineTo(x + w, y + h - r);
        shape.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        shape.lineTo(x + r, y + h);
        shape.quadraticCurveTo(x, y + h, x, y + h - r);
        shape.lineTo(x, y + r);
        shape.quadraticCurveTo(x, y, x + r, y);

        const geometry = new THREE.ExtrudeGeometry(shape, {
            depth,
            bevelEnabled: true,
            bevelSegments,
            steps: 1,
            bevelSize,
            bevelThickness: bevelSize
        });

        geometry.center();
        geometry.computeVertexNormals();
        return geometry;
    }

    function addCannonPart(geometry, material, position, cast = true, receive = true) {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        mesh.castShadow = cast;
        mesh.receiveShadow = receive;
        cannonGroup.add(mesh);
        return mesh;
    }

    // חומרים שונים כדי שהמתכת, הגומי והצבע לא ייראו כמו חומר אחד.
    const darkMetalMat = new THREE.MeshStandardMaterial({
        color: 0x18232d,
        roughness: 0.26,
        metalness: 0.72
    });

    const bodyMetalMat = new THREE.MeshPhysicalMaterial({
        color: 0x2d3e49,
        roughness: 0.27,
        metalness: 0.72,
        clearcoat: 0.22,
        clearcoatRoughness: 0.18
    });

    const edgeMetalMat = new THREE.MeshPhysicalMaterial({
        color: 0x526572,
        roughness: 0.20,
        metalness: 0.88,
        clearcoat: 0.16,
        clearcoatRoughness: 0.16
    });

    const rubberMat = new THREE.MeshStandardMaterial({
        color: 0x101417,
        roughness: 0.96,
        metalness: 0.01
    });

    const hubMat = new THREE.MeshStandardMaterial({
        color: 0x778994,
        roughness: 0.28,
        metalness: 0.78
    });

    const boltMat = new THREE.MeshStandardMaterial({
        color: 0x9aa7ae,
        roughness: 0.22,
        metalness: 0.88
    });

    // גוף ראשי מעוגל.
    addCannonPart(
        createRoundedBoxGeometry(
            2.25,
            0.64,
            1.72,
            0.22,
            0.10,
            3
        ),
        bodyMetalMat,
        new THREE.Vector3(0, 0.34, 0)
    );

    // מסגרת תחתונה שנותנת משקל ותחושת שלדה.
    addCannonPart(
        createRoundedBoxGeometry(
            1.86,
            0.24,
            1.44,
            0.09,
            0.05,
            2
        ),
        darkMetalMat,
        new THREE.Vector3(0, 0.04, 0)
    );

    // לוחות צד משוריינים וברגים.
    [-1, 1].forEach(side => {
        addCannonPart(
            createRoundedBoxGeometry(
                0.16,
                0.52,
                1.35,
                0.06,
                0.03,
                2
            ),
            edgeMetalMat,
            new THREE.Vector3(side * 1.06, 0.43, 0)
        );

        [-0.43, 0.43].forEach(z => {
            const bolt = new THREE.Mesh(
                new THREE.SphereGeometry(0.075, 10, 8),
                boltMat
            );
            bolt.position.set(side * 1.155, 0.51, z);
            bolt.castShadow = true;
            cannonGroup.add(bolt);
        });
    });

    // פרטי פאנלים עדינים שמונעים מהגוף להיראות כמו קופסה אחת.
    const panelLineMat = new THREE.MeshStandardMaterial({
        color: 0x111a20,
        roughness: 0.46,
        metalness: 0.55
    });

    [-0.58, 0, 0.58].forEach((z, index) => {
        const line = new THREE.Mesh(
            new THREE.BoxGeometry(0.075, 0.035, 0.72 - index * 0.05),
            panelLineMat
        );
        line.position.set(-0.48 + index * 0.48, 0.665, z * 0.7);
        line.castShadow = true;
        cannonGroup.add(line);
    });

    // פסי חיזוק קדמיים.
    [-0.68, 0.68].forEach(x => {
        const brace = new THREE.Mesh(
            createRoundedBoxGeometry(0.10, 0.34, 0.92, 0.04, 0.02, 2),
            edgeMetalMat
        );
        brace.position.set(x, 0.67, 0.05);
        brace.rotation.y = x > 0 ? -0.08 : 0.08;
        brace.castShadow = true;
        cannonGroup.add(brace);
    });

    // טבעת מסתובבת לבסיס הצריח.
    const turretRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.82, 0.10, 8, 24),
        edgeMetalMat
    );
    turretRing.rotation.x = Math.PI / 2;
    turretRing.position.set(0, 0.72, 0);
    turretRing.castShadow = true;
    cannonGroup.add(turretRing);

    // גוף צריח חצי-כיפתי.
    const dome = new THREE.Mesh(
        new THREE.SphereGeometry(0.90, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2),
        new THREE.MeshPhysicalMaterial({
            color: 0x6fc0ea,
            emissive: 0x0b2f44,
            roughness: 0.06,
            metalness: 0.15,
            clearcoat: 1.0,
            clearcoatRoughness: 0.12
        })
    );
    dome.position.y = 0.60;
    dome.castShadow = true;
    dome.receiveShadow = true;
    cannonGroup.add(dome);

    // צוואר צריח קטן שנותן מעבר פיזי בין הגוף לכיפה.
    const turretCollar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.67, 0.74, 0.20, 20),
        darkMetalMat
    );
    turretCollar.position.y = 0.67;
    turretCollar.castShadow = true;
    turretCollar.receiveShadow = true;
    cannonGroup.add(turretCollar);

    const rearHousing = new THREE.Mesh(
        createRoundedBoxGeometry(0.94, 0.32, 0.34, 0.10, 0.035, 2),
        darkMetalMat
    );
    rearHousing.position.set(0, 0.84, -0.63);
    rearHousing.castShadow = true;
    cannonGroup.add(rearHousing);

    // לוחית צבע קטנה שנותנת נקודת חומר שונה על הגוף.
    const accentPlate = new THREE.Mesh(
        createRoundedBoxGeometry(0.54, 0.12, 0.48, 0.045, 0.02, 2),
        edgeMetalMat
    );
    accentPlate.position.set(0, 0.73, -0.40);
    accentPlate.castShadow = true;
    cannonGroup.add(accentPlate);

    // לוח קדמי כהה לצריח.
    const frontPlate = new THREE.Mesh(
        createRoundedBoxGeometry(1.62, 0.48, 0.16, 0.12, 0.04, 2),
        darkMetalMat
    );
    frontPlate.position.set(0, 0.70, 0.70);
    frontPlate.castShadow = true;
    cannonGroup.add(frontPlate);

    // תושבת ומכלול הקנים נפרדים כדי שנוכל לתת רתיעה מכנית אמיתית.
    const barrelAssembly = new THREE.Group();
    barrelAssembly.position.set(0, 0.82, 0.05);
    cannonGroup.add(barrelAssembly);

    const barrelBase = new THREE.Mesh(
        createRoundedBoxGeometry(1.34, 0.28, 0.82, 0.10, 0.045, 2),
        darkMetalMat
    );
    barrelBase.position.set(0, 0.08, 0.02);
    barrelBase.castShadow = true;
    barrelAssembly.add(barrelBase);

    const barrelMat = new THREE.MeshStandardMaterial({
        color: 0x3d4e5a,
        metalness: 0.82,
        roughness: 0.22
    });

    const muzzleMat = new THREE.MeshStandardMaterial({
        color: 0x11191f,
        metalness: 0.68,
        roughness: 0.25
    });

    const barrelGeo = new THREE.CylinderGeometry(0.13, 0.15, 0.98, 18);
    const muzzleGeo = new THREE.CylinderGeometry(0.17, 0.15, 0.12, 18, 1, false);
    const muzzleBoreGeo = new THREE.CylinderGeometry(0.095, 0.095, 0.125, 16, 1, true);

    [-0.37, 0.37].forEach(x => {
        const barrel = new THREE.Mesh(barrelGeo, barrelMat);
        barrel.position.set(x, 0.61, 0);
        barrel.castShadow = true;
        barrelAssembly.add(barrel);

        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.145, 0.028, 6, 16),
            edgeMetalMat
        );
        ring.rotation.x = Math.PI / 2;
        ring.position.set(x, 0.56, 0);
        ring.castShadow = true;
        barrelAssembly.add(ring);

        const muzzle = new THREE.Mesh(muzzleGeo, muzzleMat);
        muzzle.position.set(x, 1.12, 0);
        muzzle.castShadow = true;
        barrelAssembly.add(muzzle);

        const bore = new THREE.Mesh(
            muzzleBoreGeo,
            new THREE.MeshBasicMaterial({ color: 0x020507 })
        );
        bore.position.set(x, 1.125, 0);
        barrelAssembly.add(bore);
    });

    // גלגלים - הקדמיים משנים זווית היגוי בלבד, האחוריים נשארים ישרים.
    const wheelGeo = new THREE.CylinderGeometry(0.40, 0.40, 0.25, 18);
    const cannonWheels = [];

    const wheelPositions = [
        [-1.12, 0.22, 0.68],
        [ 1.12, 0.22, 0.68],
        [-1.12, 0.22, -0.68],
        [ 1.12, 0.22, -0.68]
    ];

    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(
            wheelGeo,
            rubberMat
        );

        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(...pos);
        wheel.castShadow = true;
        wheel.receiveShadow = true;

        wheel.userData.steerable =
            pos[2] > 0;

        wheel.userData.side =
            pos[0] < 0 ? -1 : 1;

        wheel.userData.baseRotationY = 0;

        cannonGroup.add(wheel);
        cannonWheels.push(wheel);

        // דופן גלגל מתכתית.
        const tireSide = new THREE.Mesh(
            new THREE.TorusGeometry(
                0.29,
                0.055,
                8,
                18
            ),
            darkMetalMat
        );

        tireSide.rotation.y =
            Math.PI / 2;

        tireSide.position.copy(
            wheel.position
        );

        tireSide.castShadow = true;
        cannonGroup.add(tireSide);

        // טבור מתכתי.
        const hub = new THREE.Mesh(
            new THREE.CylinderGeometry(
                0.14,
                0.14,
                0.27,
                14
            ),
            hubMat
        );

        hub.rotation.z =
            Math.PI / 2;

        hub.position.copy(
            wheel.position
        );

        hub.castShadow = true;
        cannonGroup.add(hub);

        const hubCap = new THREE.Mesh(
            new THREE.CylinderGeometry(0.075, 0.075, 0.29, 12),
            darkMetalMat
        );
        hubCap.rotation.z = Math.PI / 2;
        hubCap.position.copy(wheel.position);
        hubCap.castShadow = true;
        cannonGroup.add(hubCap);

        // חמישה ברגים סביב הטבור.
        for (let i = 0; i < 5; i++) {
            const angle =
                (i / 5) * Math.PI * 2;

            const bolt = new THREE.Mesh(
                new THREE.SphereGeometry(
                    0.035,
                    7,
                    6
                ),
                boltMat
            );

            bolt.position.set(
                wheel.position.x,
                wheel.position.y + Math.cos(angle) * 0.10,
                wheel.position.z + Math.sin(angle) * 0.10
            );

            bolt.castShadow = true;
            cannonGroup.add(bolt);
        }
    });

    // זרועות מתלים שמחברות את הגלגלים לשלדה.
    wheelPositions.forEach(pos => {
        const bracket = new THREE.Mesh(
            createRoundedBoxGeometry(0.16, 0.52, 0.22, 0.05, 0.025, 2),
            darkMetalMat
        );

        bracket.position.set(
            pos[0] * 0.94,
            0.36,
            pos[2]
        );

        bracket.castShadow = true;
        cannonGroup.add(bracket);
    });

    cannonGroup.scale.setScalar(
        CANNON_SCALE
    );

    scene.add(
        cannonGroup
    );

    addCannonLighting(selectedMap);

    // צל רך מתחת לתותח - חלק מהדשא, לא פלטפורמה.
    const cannonShadow = new THREE.Mesh(
        new THREE.CircleGeometry(
            1.45,
            32
        ),
        new THREE.MeshBasicMaterial({
            color: 0x1f2937,
            transparent: true,
            opacity: 0.22,
            depthWrite: false
        })
    );

    cannonShadow.rotation.x =
        -Math.PI / 2;

    cannonShadow.position.y =
        0.015;

    cannonShadow.scale.set(
        1.18,
        0.76,
        1
    );

    scene.add(
        cannonShadow
    );

    const cannonShadowSoft = new THREE.Mesh(
        new THREE.CircleGeometry(
            1.0,
            26
        ),
        new THREE.MeshBasicMaterial({
            color: 0x0f172a,
            transparent: true,
            opacity: 0.10,
            depthWrite: false
        })
    );

    cannonShadowSoft.rotation.x =
        -Math.PI / 2;

    cannonShadowSoft.position.y =
        0.018;

    cannonShadowSoft.scale.set(
        1.10,
        0.58,
        1
    );

    scene.add(
        cannonShadowSoft
    );

    // ==========================================
    // 5. משתני משחק
    // ==========================================
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

    let lastShotTime = 0;
    let targetX = 0;

    let cannonRecoil = 0;
    const cannonBaseY = 0;
    const effects = [];
    const tempVec3 = new THREE.Vector3();

    // ==========================================
    // 6. אלמנטים של UI ועדכון החנות במסך הפתיחה
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
    mapButtons.forEach(btn => {
        if (btn.dataset.mapId !== 'forest') btn.remove();
    });
    const forestMapButtons = Array.from(document.querySelectorAll('[data-map-id="forest"]'));

    function updateUI() {
        if (coinsValEl) coinsValEl.innerText = coins;
        if (scoreValEl) scoreValEl.innerText = score;
        if (startCoinsEl) startCoinsEl.innerText = coins;
        if (startBestScoreEl) startBestScoreEl.innerText = bestScore;
        if (hpTextEl) hpTextEl.innerText = `${Math.max(0, playerHp)} / ${maxHp}`;
        if (hpBarEl) hpBarEl.style.width = `${Math.max(0, (playerHp / maxHp) * 100)}%`;
        if (levelTextEl) levelTextEl.innerText = `LEVEL ${level}`;

        // מחירים לשדרוגים
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

        forestMapButtons.forEach(btn => {
            const mapId = btn.dataset.mapId;
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

    // חנות מפות - הקנייה והשינוי נעשים במסך הפתיחה בלבד.
    forestMapButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const mapId = btn.dataset.mapId;
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
            buildMap('forest');
            updateUI();
        });
    });

    // חיבור כפתורי השדרוגים במסך הפתיחה
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
    // 7. סאונד
    // ==========================================
    let audioCtx = null;
    function getAudioCtx() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return null;
            audioCtx = new AudioContextClass();
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
            osc.start(); osc.stop(ctx.currentTime + 0.07);
        } else if (type === 'hit') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(120, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.06);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.06);
            osc.start(); osc.stop(ctx.currentTime + 0.06);
        } else if (type === 'coin') {
            osc.frequency.setValueAtTime(850, ctx.currentTime);
            osc.frequency.setValueAtTime(1250, ctx.currentTime + 0.05);
            gain.gain.setValueAtTime(0.07, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.12);
            osc.start(); osc.stop(ctx.currentTime + 0.12);
        }
    }

    // ==========================================
    // 8. יצירת סלעים, כדורים ומטבעות
    // ==========================================
    function spawnBullet(x, y, z) {
        const bullet = new THREE.Group();
        const glow = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };

        const core = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 12, 12),
            new THREE.MeshBasicMaterial({ color: 0xffd24a })
        );
        const shell = new THREE.Mesh(
            new THREE.SphereGeometry(0.24, 12, 12),
            new THREE.MeshBasicMaterial({ color: 0xff9a1a, opacity: 0.35, ...glow })
        );
        const halo = new THREE.Mesh(
            new THREE.SphereGeometry(0.36, 10, 10),
            new THREE.MeshBasicMaterial({ color: 0xff6a10, opacity: 0.07, ...glow })
        );
        // זנב להבה: חרוט מחודד שיורד מהכדור.
        const trail = new THREE.Mesh(
            new THREE.ConeGeometry(0.11, 0.75, 8, 1, true),
            new THREE.MeshBasicMaterial({ color: 0xff6a10, opacity: 0.32, side: THREE.DoubleSide, transparent: true, depthWrite: false })
        );
        trail.rotation.x = Math.PI;
        trail.position.y = -0.45;

        bullet.add(core, shell, halo, trail);
        bullet.position.set(x, y, z);
        bullet.userData = { core, trail };
        scene.add(bullet);
        bullets.push(bullet);
    }

    function createIrregularRockGeometry(size) {
        const geo = new THREE.IcosahedronGeometry(size, 1);
        const position = geo.attributes.position;
        const colors = [];

        for (let i = 0; i < position.count; i++) {
            const ox = position.getX(i);
            const oy = position.getY(i);
            const oz = position.getZ(i);

            const factorX = 0.82 + Math.random() * 0.32;
            const factorY = 0.72 + Math.random() * 0.34;
            const factorZ = 0.84 + Math.random() * 0.30;
            const jitter = 0.93 + Math.random() * 0.14;

            position.setXYZ(
                i,
                ox * factorX * jitter,
                oy * factorY,
                oz * factorZ * jitter
            );

            const shade = 0.72 +
                (position.getY(i) / Math.max(size, 0.001) + 1) * 0.11 +
                Math.random() * 0.08;

            colors.push(
                Math.min(1, shade),
                Math.min(1, shade * 0.94),
                Math.min(1, shade * 0.88)
            );
        }

        geo.setAttribute(
            'color',
            new THREE.Float32BufferAttribute(colors, 3)
        );
        geo.computeVertexNormals();
        return geo;
    }

    function getRockColor() {
        return 0x3f4545;
    }

    // צל מגע דינמי לסלעים.
    function createRockContactShadow(rockSize) {
        const shadow = new THREE.Mesh(
            new THREE.CircleGeometry(1.0, 20),
            new THREE.MeshBasicMaterial({
                color: 0x111827,
                transparent: true,
                opacity: 0.18,
                depthWrite: false
            })
        );

        shadow.rotation.x = -Math.PI / 2;
        shadow.position.y = 0.012;
        shadow.scale.set(
            rockSize * 0.90,
            rockSize * 0.42,
            1
        );

        scene.add(shadow);
        return shadow;
    }

    function spawnRock(x, y, hp, size, launchVx = null, launchVy = null) {
        const geo = createIrregularRockGeometry(size);
        const mat = new THREE.MeshStandardMaterial({
            color: getRockColor(),
            vertexColors: true,
            roughness: 0.92,
            metalness: 0.0,
            flatShading: false
        });

        const rock = new THREE.Mesh(geo, mat);
        rock.castShadow = true;
        rock.receiveShadow = true;
        rock.position.set(x, y, 0);
        rock.rotation.set(
            Math.random() * 0.6,
            Math.random() * 0.8,
            Math.random() * 0.6
        );

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

        const spriteMat = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            depthTest: true
        });
        const label = new THREE.Sprite(spriteMat);
        label.scale.set(size * 1.0, size * 1.0, 1);
        label.position.y = 0.08;
        rock.add(label);

        rock.userData = {
            hp,
            maxHp: hp,
            size,
            vx: launchVx !== null ? launchVx : (Math.random() - 0.5) * 0.055,
            vy: launchVy !== null ? launchVy : 0,
            rotX: (Math.random() - 0.5) * 0.032,
            rotY: (Math.random() - 0.5) * 0.038,
            rotZ: (Math.random() - 0.5) * 0.028,
            ctx,
            texture,
            hitCooldown: 0
        };

        rock.userData.contactShadow = createRockContactShadow(size);

        scene.add(rock);
        rocks.push(rock);
    }

    function spawnMuzzleFlash(x, y, z) {
        const flash = new THREE.Mesh(
            new THREE.SphereGeometry(0.24, 8, 8),
            new THREE.MeshBasicMaterial({
                color: 0xfff1a8,
                transparent: true,
                opacity: 0.95
            })
        );
        flash.position.set(x, y, z);
        flash.scale.set(0.75, 1.8, 0.75);
        flash.userData = {
            type: 'flash',
            life: 5,
            maxLife: 5,
            startScale: 1
        };
        scene.add(flash);
        effects.push(flash);
    }

    function spawnImpactBurst(x, y, z, color = 0xfde68a) {
        const count = 6;
        for (let i = 0; i < count; i++) {
            const particle = new THREE.Mesh(
                new THREE.TetrahedronGeometry(0.08 + Math.random() * 0.06, 0),
                new THREE.MeshBasicMaterial({
                    color,
                    transparent: true,
                    opacity: 1
                })
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
                new THREE.MeshBasicMaterial({
                    color: 0xd6b58a,
                    transparent: true,
                    opacity: 0.55
                })
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

        // הגנה על מובייל: לא יותר מדי אפקטים בבת אחת.
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
        if (rock.position.y < 2.2) {
            spawnDustBurst(rock.position.x, rock.position.y, rock.position.z);
        }

        if (rock.userData.contactShadow) {
            scene.remove(rock.userData.contactShadow);
            if (rock.userData.contactShadow.geometry) {
                rock.userData.contactShadow.geometry.dispose();
            }
            if (rock.userData.contactShadow.material) {
                rock.userData.contactShadow.material.dispose();
            }
            rock.userData.contactShadow = null;
        }

        if (rock.userData.texture) rock.userData.texture.dispose();
        if (rock.geometry) rock.geometry.dispose();
        if (rock.material) rock.material.dispose();
        scene.remove(rock);
        rocks.splice(index, 1);
    }

    let coinTexture = null;
    function getCoinTexture() {
        if (coinTexture) return coinTexture;
        const c = document.createElement('canvas');
        c.width = c.height = 128;
        const g = c.getContext('2d');
        const grad = g.createRadialGradient(46, 42, 6, 64, 64, 62);
        grad.addColorStop(0, '#ffe98a'); grad.addColorStop(0.6, '#f2b92a'); grad.addColorStop(1, '#a8680c');
        g.fillStyle = grad; g.beginPath(); g.arc(64, 64, 60, 0, Math.PI * 2); g.fill();
        g.lineWidth = 5; g.strokeStyle = '#8a5408'; g.beginPath(); g.arc(64, 64, 52, 0, Math.PI * 2); g.stroke();
        g.lineWidth = 3; g.strokeStyle = 'rgba(255,240,170,0.8)'; g.beginPath(); g.arc(64, 64, 57, 0, Math.PI * 2); g.stroke();
        g.fillStyle = '#9a5f0a'; g.font = '900 78px Rubik, Arial, sans-serif';
        g.textAlign = 'center'; g.textBaseline = 'middle';
        g.fillText('$', 64, 70);
        coinTexture = new THREE.CanvasTexture(c);
        coinTexture.encoding = THREE.sRGBEncoding;
        return coinTexture;
    }

    function spawnCoin(x, y) {
        const coin = new THREE.Sprite(new THREE.SpriteMaterial({ map: getCoinTexture(), fog: false }));
        coin.scale.set(0.95, 0.95, 1);
        coin.position.set(x, y, 0);
        coin.userData = { vy: -0.04, spin: Math.random() * 6 };
        scene.add(coin);
        droppedCoins.push(coin);
    }

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
        return window.innerWidth <= 768
            ? TOUCH_SENSITIVITY
            : DESKTOP_SENSITIVITY;
    }

    function moveCannonByPointer(clientX) {
        const deltaX = clientX - dragStartX;

        if (Math.abs(deltaX) < TOUCH_DEADZONE) {
            return;
        }

        const nextTarget =
            dragStartTargetX +
            deltaX *
            getPointerSensitivity();

        targetX = Math.max(
            -screenLimitX,
            Math.min(
                screenLimitX,
                nextTarget
            )
        );
    }

    const controlSurface = renderer.domElement;

    controlSurface.addEventListener('pointerdown', (e) => {
        if (!isGameStarted || isPaused || isGameOver) return;

        // רק אצבע אחת / מצביע אחד שולט בתותח.
        if (dragPointerId !== null) return;

        isDragging = true;
        dragPointerId = e.pointerId;
        dragStartX = e.clientX;
        lastPointerX = e.clientX;
        dragStartTargetX = targetX;

        try {
            controlSurface.setPointerCapture(e.pointerId);
        } catch (_) {}

        e.preventDefault();
    }, { passive: false });

    controlSurface.addEventListener('pointermove', (e) => {
        if (!isDragging || e.pointerId !== dragPointerId) return;

        const movementSinceLastFrame =
            e.clientX - lastPointerX;

        // מונע קפיצה במקרה של אירוע pointermove גדול.
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
        if (dragPointerId !== null && e.pointerId !== dragPointerId) {
            return;
        }

        isDragging = false;

        try {
            if (dragPointerId !== null) {
                controlSurface.releasePointerCapture(dragPointerId);
            }
        } catch (_) {}

        dragPointerId = null;
    }

    controlSurface.addEventListener('pointerup', endPointerControl);
    controlSurface.addEventListener('pointercancel', endPointerControl);
    controlSurface.addEventListener('lostpointercapture', () => {
        isDragging = false;
        dragPointerId = null;
    });

    // קו יישור קטן למניעת התנהגות לא צפויה ממגע במכשירים מסוימים.
    controlSurface.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    // ==========================================
    // 10. התחלת משחק והסרת מסך הפתיחה
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
        selectedMap = 'forest';
        buildMap('forest');
        updateUI();

        startNextWave();
    }

    if (startBtn) startBtn.addEventListener('click', startGame);

    // ==========================================
    // 11. לולאת המשחק
    // ==========================================
    function animate(time) {
        requestAnimationFrame(animate);

        if (!isGameStarted || isPaused || isGameOver) {
            renderer.render(scene, camera);
            return;
        }

        updateWeatherParticles();

        // ======================================
        // תנועת התותח + רתיעה קטנה בירי
        // ======================================
        cannonGroup.position.x += (targetX - cannonGroup.position.x) * 0.2;
        cannonShadow.position.x += (cannonGroup.position.x - cannonShadow.position.x) * 0.3;
        cannonShadowSoft.position.x += (cannonGroup.position.x - cannonShadowSoft.position.x) * 0.32;
        cannonRecoil *= 0.78;

        // רתיעה מכנית של מכלול הקנים - בנוסף לתנועת הגוף.
        barrelAssembly.position.z +=
            ((-cannonRecoil * 0.65) - barrelAssembly.position.z) * 0.35;

        cannonGroup.position.y += ((cannonBaseY + cannonRecoil) - cannonGroup.position.y) * 0.35;

        // ======================================
        // היגוי גלגלים - ימינה / שמאלה בלבד
        // ======================================
        const moveDelta = targetX - cannonGroup.position.x;
        const steerAngle = THREE.MathUtils.clamp(moveDelta * -0.26, -0.18, 0.18);

        cannonWheels.forEach(wheel => {
            const targetSteer = wheel.userData.steerable ? steerAngle : 0;
            wheel.rotation.y += (targetSteer - wheel.rotation.y) * 0.18;
        });

        // ======================================
        // ירי
        // ======================================
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

        // ======================================
        // כדורים
        // ======================================
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

        // ======================================
        // סלעים
        // ======================================
        for (let rIdx = rocks.length - 1; rIdx >= 0; rIdx--) {
            const r = rocks[rIdx];
            const data = r.userData;

            if (data.hitCooldown > 0) data.hitCooldown -= 1;

            data.vy -= 0.0025;
            r.position.x += data.vx;
            r.position.y += data.vy;
            r.rotation.x += data.rotX;
            r.rotation.y += data.rotY;
            r.rotation.z += data.rotZ;

            // צל מגע דינמי: כשהסלע עולה, הצל קטן ונחלש.
            if (data.contactShadow) {
                const shadow = data.contactShadow;
                const heightAboveGround = Math.max(0, r.position.y - data.size);
                const squash = THREE.MathUtils.clamp(
                    1.0 - heightAboveGround * 0.055,
                    0.34,
                    1.0
                );

                shadow.position.x = r.position.x;
                shadow.position.z = r.position.z;
                shadow.scale.set(
                    data.size * (0.90 + squash * 0.18),
                    data.size * (0.42 + squash * 0.10),
                    1
                );
                shadow.material.opacity = THREE.MathUtils.clamp(
                    0.20 - heightAboveGround * 0.010,
                    0.055,
                    0.20
                );
            }

            // ==================================
            // קפיצות מהקרקע
            // ==================================
            if (r.position.y - data.size < 0.2) {
                r.position.y = 0.2 + data.size;
                data.vy = Math.abs(data.vy) * 0.95;
                if (data.vy < 0.12) data.vy = 0.16;
                data.vx *= 0.985;
                spawnDustBurst(r.position.x, 0.25, r.position.z);
            }

            // ==================================
            // גבולות X
            // ==================================
            if (Math.abs(r.position.x) > screenLimitX) {
                data.vx *= -1;
                r.position.x = Math.sign(r.position.x) * screenLimitX;
            }

            // ==================================
            // פגיעה של כדור בסלע
            // ==================================
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

            // ==================================
            // פגיעה בתותח
            // ==================================
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

        // ==========================================
        // מטבעות
        // ==========================================
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

            c.userData.spin += 0.07;
            c.scale.x = 0.95 * (0.25 + 0.75 * Math.abs(Math.cos(c.userData.spin)));

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

        // מצלמת 3D דינמית: מעקב עדין אחרי התותח + תנועה קלה
        // בציר Y/Z כדי שהמרחק של הסביבה יורגש יותר.
        const cameraTargetX = cannonGroup.position.x * 0.16;
        const cameraTargetY = 7.5 + Math.abs(cannonGroup.position.x) * 0.035;
        const cameraTargetZ = 15.3 + Math.abs(cannonGroup.position.x) * 0.045;

        camera.position.x += (cameraTargetX - camera.position.x) * 0.045;
        camera.position.y += (cameraTargetY - camera.position.y) * 0.035;
        camera.position.z += (cameraTargetZ - camera.position.z) * 0.035;

        const lookX = cannonGroup.position.x * 0.08;
        const lookY = 2.45 + cannonRecoil * 0.15;
        const lookZ = -8.1;

        camera.lookAt(lookX, lookY, lookZ);

        renderer.render(scene, camera);
    }

    window.addEventListener('resize', () => {
        updateCameraForDevice();
        updateMobileViewportState();
    });

    window.addEventListener('orientationchange', () => {
        setTimeout(() => {
            updateCameraForDevice();
            updateMobileViewportState();
        }, 120);
    });

    animate(0);
});