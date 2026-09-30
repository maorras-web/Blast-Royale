window.addEventListener('DOMContentLoaded', () => {

    if (typeof THREE === 'undefined') {
        console.error('Three.js library is missing!');
        return;
    }

    // ==========================================
    // 1. הגדרת סצנה, מצלמה ורנדרר (תיקון 1 + 3)
    // ==========================================
    const scene = new THREE.Scene();
    
    // תיקון 1: שמיים וערפל בכתום-זהוב עמוק ודרמטי
    scene.background = new THREE.Color(0xd15b18); 
    scene.fog = new THREE.FogExp2(0xc44e11, 0.015);

    const GRASS_GREEN = 0x1a330e;

    const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    let screenLimitX = 4.8;

    function updateCameraForDevice() {
        const width = window.innerWidth;
        const height = Math.max(window.innerHeight, 1);

        camera.aspect = width / height;
        camera.position.set(0, 7.45, 14.6);
        camera.lookAt(0, 2.65, -8.4);

        screenLimitX = Math.max(4.25, Math.min(4.9, width / 78));

        camera.updateProjectionMatrix();

        renderer.setSize(width, height, false);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
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
    renderer.toneMappingExposure = 1.15;
    document.body.appendChild(renderer.domElement);

    function updateMobileViewportState() {
        const desktopBlocker = document.getElementById('desktop-blocker');
        const landscapeBlocker = document.getElementById('landscape-blocker');

        const isDesktopViewport = window.innerWidth > 768;
        const isLandscapePhone = window.innerWidth <= 768 && window.innerWidth > window.innerHeight;

        if (desktopBlocker) desktopBlocker.style.display = isDesktopViewport ? 'flex' : 'none';
        if (landscapeBlocker) landscapeBlocker.style.display = isLandscapePhone ? 'flex' : 'none';
    }

    updateCameraForDevice();
    updateMobileViewportState();

    // ==========================================
    // 2. תאורה נמוכה ודרמטית (תיקון 3)
    // ==========================================
    const hemiLight = new THREE.HemisphereLight(0xffb07c, 0x1b2414, 0.35);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xffaa44, 2.2);
    sunLight.position.set(-15, 12, -30);
    sunLight.castShadow = true;

    const isStrongPhone = (navigator.hardwareConcurrency || 4) >= 6 && (navigator.deviceMemory || 4) >= 4;
    const SHADOW_MAP_SIZE = isStrongPhone ? 2048 : 1024;
    sunLight.shadow.mapSize.width = SHADOW_MAP_SIZE;
    sunLight.shadow.mapSize.height = SHADOW_MAP_SIZE;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 80;
    sunLight.shadow.camera.left = -25;
    sunLight.shadow.camera.right = 25;
    sunLight.shadow.camera.top = 30;
    sunLight.shadow.camera.bottom = -15;
    sunLight.shadow.bias = -0.00035;
    sunLight.shadow.normalBias = 0.018;
    scene.add(sunLight);

    const lowWarmLight = new THREE.DirectionalLight(0xff6a00, 0.6);
    lowWarmLight.position.set(0, 1, 15);
    scene.add(lowWarmLight);

    // ==========================================
    // 3. בנאי הסביבה והאלמנטים הוויזואליים
    // ==========================================
    const mapGroup = new THREE.Group();
    scene.add(mapGroup);

    function addMesh(geo, mat, x = 0, y = 0, z = 0, cast = true, receive = true) {
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(x, y, z);
        mesh.castShadow = cast;
        mesh.receiveShadow = receive;
        mapGroup.add(mesh);
        return mesh;
    }

    // תיקון 1: מרקם שמיים עם עננים כהים בשוליים מוזהבים
    function createSkyTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        const gradient = ctx.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#3a1306');
        gradient.addColorStop(0.4, '#8a2b06');
        gradient.addColorStop(0.75, '#e06812');
        gradient.addColorStop(1.0, '#f29627');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 512, 512);

        for (let i = 0; i < 18; i++) {
            const x = Math.random() * 512;
            const y = 80 + Math.random() * 250;
            const rx = 60 + Math.random() * 110;
            const ry = 12 + Math.random() * 25;

            const cloudGlow = ctx.createRadialGradient(x, y + 5, 0, x, y + 5, rx);
            cloudGlow.addColorStop(0, 'rgba(255, 180, 60, 0.35)');
            cloudGlow.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.fillStyle = cloudGlow;
            ctx.beginPath();
            ctx.ellipse(x, y + 5, rx * 1.1, ry * 1.3, 0, 0, Math.PI * 2);
            ctx.fill();

            const cloudDark = ctx.createRadialGradient(x, y, 0, x, y, rx);
            cloudDark.addColorStop(0, 'rgba(35, 20, 25, 0.75)');
            cloudDark.addColorStop(0.8, 'rgba(20, 10, 15, 0.5)');
            cloudDark.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = cloudDark;
            ctx.beginPath();
            ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.encoding = THREE.sRGBEncoding;
        return texture;
    }

    function addSkyDome() {
        const skyMat = new THREE.MeshBasicMaterial({
            map: createSkyTexture(),
            side: THREE.BackSide,
            depthWrite: false,
            fog: false
        });
        const sky = new THREE.Mesh(new THREE.SphereGeometry(180, 24, 14), skyMat);
        sky.position.set(0, 12, 0);
        sky.renderOrder = -100;
        mapGroup.add(sky);
    }

    // תיקון 2: הילת זוהר מאחורי הפירמידה המרכזית (ללא שמש לבנה מלאכותית)
    function addPyramidGlow() {
        const haloMat = new THREE.MeshBasicMaterial({
            color: 0xffaa33,
            transparent: true,
            opacity: 0.35,
            depthWrite: false,
            fog: false,
            blending: THREE.AdditiveBlending
        });
        
        const halo = new THREE.Mesh(new THREE.SphereGeometry(12, 16, 12), haloMat);
        halo.position.set(0, 6, -42);
        halo.scale.set(1.8, 0.9, 1);
        halo.renderOrder = -50;
        mapGroup.add(halo);

        const coreGlow = new THREE.Mesh(
            new THREE.SphereGeometry(6, 16, 12),
            new THREE.MeshBasicMaterial({
                color: 0xffd577,
                transparent: true,
                opacity: 0.5,
                depthWrite: false,
                fog: false,
                blending: THREE.AdditiveBlending
            })
        );
        coreGlow.position.copy(halo.position);
        coreGlow.renderOrder = -49;
        mapGroup.add(coreGlow);
    }

    // תיקון 3 ו-4: פירמידות כהות וניגודיות יותר עם מראה סלעי
    function addPyramids() {
        const rockMaterial = new THREE.MeshStandardMaterial({
            color: 0x6e523b,
            roughness: 0.85,
            metalness: 0.05,
            flatShading: true
        });

        const centerPyramid = addMesh(new THREE.ConeGeometry(12, 16, 4), rockMaterial, 0, 7.5, -40);
        centerPyramid.rotation.y = Math.PI / 4;

        const leftPyramid = addMesh(new THREE.ConeGeometry(10, 13, 4), rockMaterial, -18, 6, -35);
        leftPyramid.rotation.y = Math.PI / 4;

        const rightPyramid = addMesh(new THREE.ConeGeometry(11, 14, 4), rockMaterial, 18, 6.5, -37);
        rightPyramid.rotation.y = Math.PI / 4;
    }

    // תיקון 5: דילול והנמכה של הדשא בצדי השביל
    function addPathBorders() {
        const grassMat = new THREE.MeshStandardMaterial({
            color: GRASS_GREEN,
            roughness: 0.9,
            flatShading: true
        });

        for (let i = 0; i < 12; i++) {
            const side = i % 2 === 0 ? -1 : 1;
            const x = side * (5.5 + Math.random() * 1.5);
            const z = -2.0 - i * 3.0;
            
            const grassBlade = addMesh(new THREE.ConeGeometry(0.12, 0.35, 4), grassMat, x, 0.18, z);
            grassBlade.rotation.z = side * 0.15;
        }
    }

    // תיקון 7: קרני אור דרמטיות (God Rays)
    function addGodRays() {
        const rayGroup = new THREE.Group();
        const rayMat = new THREE.MeshBasicMaterial({
            color: 0xffc87c,
            transparent: true,
            opacity: 0.12,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        });

        for (let i = 0; i < 5; i++) {
            const angle = -0.3 + i * 0.15;
            const rayGeo = new THREE.CylinderGeometry(0.2, 3.5 + Math.random() * 2, 45, 8, 1, true);
            const ray = new THREE.Mesh(rayGeo, rayMat);
            ray.position.set(0, 10, -40);
            ray.rotation.z = angle;
            ray.rotation.x = 0.2;
            rayGroup.add(ray);
        }
        mapGroup.add(rayGroup);
    }

    // קרקע השביל
    const groundGeo = new THREE.PlaneGeometry(12, 60);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xc2a378, roughness: 0.8 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.z = -15;
    ground.receiveShadow = true;
    mapGroup.add(ground);

    // אתחול האלמנטים הוויזואליים
    addSkyDome();
    addPyramidGlow();
    addPyramids();
    addPathBorders();
    addGodRays();

    // ==========================================
    // 4. לוגיקת המשחק, השחקן והיריות
    // ==========================================
    const playerGroup = new THREE.Group();
    playerGroup.position.set(0, 0, 5);
    scene.add(playerGroup);

    // יצירת תותח השחקן
    const cannonMat = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.2 });
    const cannonGeo = new THREE.CylinderGeometry(0.4, 0.5, 1.8, 16);
    const cannonMesh = new THREE.Mesh(cannonGeo, cannonMat);
    cannonMesh.rotation.x = Math.PI / 3;
    cannonMesh.position.y = 0.6;
    cannonMesh.castShadow = true;
    playerGroup.add(cannonMesh);

    const baseMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.4, 1.4), baseMat);
    baseMesh.position.y = 0.2;
    baseMesh.castShadow = true;
    playerGroup.add(baseMesh);

    // ניהול יריות
    const projectiles = [];

    // תיקון 6: יצירת כדור משודרג עם הילה כהה/זהובה שמבליטה אותו על הרקע
    function createProjectileMesh() {
        const group = new THREE.Group();
        
        const coreMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const core = new THREE.Mesh(new THREE.SphereGeometry(0.32, 12, 12), coreMat);
        group.add(core);

        const outlineMat = new THREE.MeshBasicMaterial({
            color: 0xff8c00,
            side: THREE.BackSide,
            transparent: true,
            opacity: 0.85
        });
        const outline = new THREE.Mesh(new THREE.SphereGeometry(0.42, 12, 12), outlineMat);
        group.add(outline);

        return group;
    }

    function shoot() {
        if (!gameActive) return;

        const proj = createProjectileMesh();
        proj.position.set(playerGroup.position.x, 0.8, playerGroup.position.z - 0.8);
        scene.add(proj);

        projectiles.push({
            mesh: proj,
            speed: 0.65
        });
    }

    // טיימר ירי אוטומטי
    let shootInterval = setInterval(shoot, 220);

    // ==========================================
    // 5. ניהול אויבים / שערים / משחק
    // ==========================================
    let gameActive = true;
    let score = 0;
    const scoreElement = document.getElementById('score-display');

    const targets = [];

    function spawnTarget() {
        if (!gameActive) return;

        const isGate = Math.random() > 0.5;
        const xPos = (Math.random() - 0.5) * (screenLimitX * 1.5);
        
        if (isGate) {
            const gateGroup = new THREE.Group();
            const gateGeo = new THREE.BoxGeometry(2.2, 2.8, 0.2);
            const gateMat = new THREE.MeshStandardMaterial({
                color: 0x2196f3,
                transparent: true,
                opacity: 0.75
            });
            const gateMesh = new THREE.Mesh(gateGeo, gateMat);
            gateMesh.position.y = 1.4;
            gateGroup.add(gateMesh);

            gateGroup.position.set(xPos, 0, -35);
            scene.add(gateGroup);

            targets.push({
                mesh: gateGroup,
                type: 'gate',
                value: Math.floor(Math.random() * 5) + 2,
                radius: 1.2
            });
        } else {
            const enemyMat = new THREE.MeshStandardMaterial({ color: 0xe91e63, roughness: 0.4 });
            const enemyMesh = new THREE.Mesh(new THREE.SphereGeometry(0.7, 16, 16), enemyMat);
            enemyMesh.position.set(xPos, 0.7, -35);
            enemyMesh.castShadow = true;
            scene.add(enemyMesh);

            targets.push({
                mesh: enemyMesh,
                type: 'enemy',
                hp: 3,
                radius: 0.7
            });
        }
    }

    let spawnInterval = setInterval(spawnTarget, 1400);

    // ==========================================
    // 6. שליטה בשחקן (מגע / עכבר)
    // ==========================================
    let isDragging = false;
    let previousTouchX = 0;

    function onPointerDown(e) {
        isDragging = true;
        previousTouchX = e.touches ? e.touches[0].clientX : e.clientX;
    }

    function onPointerMove(e) {
        if (!isDragging || !gameActive) return;
        const currentX = e.touches ? e.touches[0].clientX : e.clientX;
        const deltaX = currentX - previousTouchX;
        previousTouchX = currentX;

        playerGroup.position.x += deltaX * 0.018;
        playerGroup.position.x = Math.max(-screenLimitX, Math.min(screenLimitX, playerGroup.position.x));
    }

    function onPointerUp() {
        isDragging = false;
    }

    window.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    window.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // ==========================================
    // 7. לולאת עדכון ורינדור ראשית
    // ==========================================
    function animate() {
        requestAnimationFrame(animate);

        if (gameActive) {
            // עדכון קליעים
            for (let i = projectiles.length - 1; i >= 0; i--) {
                const p = projectiles[i];
                p.mesh.position.z -= p.speed;

                // הסרה מחוץ למסך
                if (p.mesh.position.z < -45) {
                    scene.remove(p.mesh);
                    projectiles.splice(i, 1);
                    continue;
                }

                // בדיקת פגיעות במטרות
                for (let j = targets.length - 1; j >= 0; j--) {
                    const t = targets[j];
                    const dist = p.mesh.position.distanceTo(t.mesh.position);

                    if (dist < t.radius) {
                        // פגיעה!
                        scene.remove(p.mesh);
                        projectiles.splice(i, 1);

                        if (t.type === 'enemy') {
                            t.hp--;
                            if (t.hp <= 0) {
                                scene.remove(t.mesh);
                                targets.splice(j, 1);
                                score += 10;
                                if (scoreElement) scoreElement.innerText = score;
                            }
                        } else if (t.type === 'gate') {
                            score += t.value;
                            if (scoreElement) scoreElement.innerText = score;
                        }
                        break;
                    }
                }
            }

            // עדכון מטרות (תנועה קדימה toward השחקן)
            for (let i = targets.length - 1; i >= 0; i--) {
                const t = targets[i];
                t.mesh.position.z += 0.12;

                // בדיקת הפסד (מטרה הגיעה לשחקן)
                if (t.mesh.position.z > 4.5) {
                    if (t.type === 'enemy') {
                        // Game Over
                        gameActive = false;
                        alert('Game Over! הניקוד שלך: ' + score);
                        location.reload();
                    } else {
                        scene.remove(t.mesh);
                        targets.splice(i, 1);
                    }
                }
            }
        }

        renderer.render(scene, camera);
    }

    animate();

    // התאמה לשינויי גודל מסך
    window.addEventListener('resize', () => {
        updateCameraForDevice();
        updateMobileViewportState();
    });
});