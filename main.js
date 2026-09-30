window.addEventListener('DOMContentLoaded', () => {

    if (typeof THREE === 'undefined') {
        console.error('Three.js library is missing!');
        return;
    }

    // ==========================================
    // 1. הגדרת סצנה, מצלמה ורנדרר ריאליסטי
    // ==========================================
    const scene = new THREE.Scene();
    
    // אטמוספירה חמה ומזמינה
    const skyColor = new THREE.Color(0xd97706);
    scene.background = skyColor;
    scene.fog = new THREE.FogExp2(0xd97706, 0.015);

    const camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    
    let screenLimitX = 7.5;

    function updateCameraForDevice() {
        const aspect = window.innerWidth / window.innerHeight;
        camera.aspect = aspect;
        
        if (aspect < 1) {
            camera.position.set(0, 11, 24);
            camera.lookAt(0, 4.5, 0);
            screenLimitX = 4.8;
        } else {
            camera.position.set(0, 8.5, 18.5);
            camera.lookAt(0, 4.2, 0);
            screenLimitX = 5.8;
        }

        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance"
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;

    document.body.appendChild(renderer.domElement);
    updateCameraForDevice();

    // ==========================================
    // 2. מחולל טקסטורות דינמי (Procedural Bump Maps)
    // ==========================================
    function generateNoiseTexture(type = 'ground') {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        const imgData = ctx.createImageData(512, 512);
        
        for (let i = 0; i < imgData.data.length; i += 4) {
            const val = Math.floor(Math.random() * 255);
            imgData.data[i] = val;
            imgData.data[i+1] = val;
            imgData.data[i+2] = val;
            imgData.data[i+3] = type === 'ground' ? 180 : 255;
        }
        ctx.putImageData(imgData, 0, 0);
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(6, 6);
        return texture;
    }

    const bumpGround = generateNoiseTexture('ground');
    const bumpRock = generateNoiseTexture('rock');

    // ==========================================
    // 3. תאורה עשירה
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0xffedd5, 0.45);
    scene.add(ambientLight);

    const hemiLight = new THREE.HemisphereLight(0xffedd5, 0x451a03, 0.65);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 1.6);
    sunLight.position.set(15, 25, 18);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 60;
    sunLight.shadow.bias = -0.0002;
    sunLight.shadow.radius = 2.5;
    scene.add(sunLight);

    // ==========================================
    // 4. מערכת מפות מפורטת
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
        while (mapGroup.children.length > 0) {
            const obj = mapGroup.children.pop();
            obj.traverse(child => {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
                    else child.material.dispose();
                }
            });
            scene.remove(obj);
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

    function buildMap(mapId) {
        clearMapGroup();

        const groundGeo = new THREE.PlaneGeometry(50, 40, 64, 64);
        const pos = groundGeo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            const zVal = Math.sin(pos.getX(i) * 0.3) * Math.cos(pos.getY(i) * 0.3) * 0.25;
            pos.setZ(i, zVal);
        }
        groundGeo.computeVertexNormals();

        let groundColor = 0xc2410c;
        let roughness = 0.85;

        if (mapId === 'forest') groundColor = 0x15803d;
        if (mapId === 'ice') { groundColor = 0xbae6fd; roughness = 0.3; }
        if (mapId === 'volcano') { groundColor = 0x1c1917; roughness = 0.9; }

        const groundMat = new THREE.MeshStandardMaterial({
            color: groundColor,
            roughness: roughness,
            metalness: 0.05,
            bumpMap: bumpGround,
            bumpScale: 0.08
        });

        const ground = addMesh(groundGeo, groundMat, 0, 0, 0, false, true);
        ground.rotation.x = -Math.PI / 2;

        if (mapId === 'desert') {
            scene.background.set(0xd97706);
            scene.fog.color.set(0xd97706);

            const mountainMat = new THREE.MeshStandardMaterial({
                color: 0x9a3412,
                roughness: 0.9,
                bumpMap: bumpRock,
                bumpScale: 0.15
            });

            const p1 = addMesh(new THREE.ConeGeometry(12, 16, 8), mountainMat, -16, 6, -14);
            const p2 = addMesh(new THREE.ConeGeometry(15, 20, 8), mountainMat, 16, 8, -16);
            p1.rotation.y = 0.4; p2.rotation.y = 0.8;
        }
    }

    buildMap(selectedMap);

    // ==========================================
    // 5. תותח מתכתי ריאליסטי
    // ==========================================
    const cannonGroup = new THREE.Group();
    const CANNON_SCALE = 1.14;

    const metalMat = new THREE.MeshStandardMaterial({
        color: 0x334155,
        metalness: 0.85,
        roughness: 0.25
    });

    const darkMetalMat = new THREE.MeshStandardMaterial({
        color: 0x0f172a,
        metalness: 0.9,
        roughness: 0.2
    });

    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.55, 1.6), darkMetalMat);
    baseMesh.position.y = 0.3;
    baseMesh.castShadow = true;
    cannonGroup.add(baseMesh);

    const barrelGeo = new THREE.CylinderGeometry(0.14, 0.16, 1.1, 24);
    const leftBarrel = new THREE.Mesh(barrelGeo, metalMat);
    leftBarrel.position.set(-0.38, 1.0, 0);
    const rightBarrel = new THREE.Mesh(barrelGeo, metalMat);
    rightBarrel.position.set(0.38, 1.0, 0);

    leftBarrel.castShadow = true;
    rightBarrel.castShadow = true;
    cannonGroup.add(leftBarrel, rightBarrel);

    cannonGroup.scale.setScalar(CANNON_SCALE);
    scene.add(cannonGroup);

    // ==========================================
    // 6. משתנים ונתוני שחקן
    // ==========================================
    let isGameStarted = false;
    let isPaused = false;
    let isGameOver = false;

    let score = 0;
    let coins = parseInt(localStorage.getItem('bb3d_coins')) || 0;
    let bestScore = parseInt(localStorage.getItem('bb3d_best')) || 0;

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
    let recoilTimer = 0;

    let lastShotTime = 0;
    let targetX = 0;

    // UI elements
    const coinsValEl = document.getElementById('coins-val');
    const scoreValEl = document.getElementById('score-val');
    const splashScreen = document.getElementById('splash-screen');
    const startBtn = document.getElementById('start-btn');

    function updateUI() {
        if (coinsValEl) coinsValEl.innerText = coins;
        if (scoreValEl) scoreValEl.innerText = score;
    }

    updateUI();

    // Controls
    function handleMove(clientX) {
        if (!isGameStarted || isPaused || isGameOver) return;
        const normX = (clientX / window.innerWidth) * 2 - 1;
        targetX = THREE.MathUtils.clamp(normX * screenLimitX, -screenLimitX, screenLimitX);
    }

    window.addEventListener('mousemove', (e) => handleMove(e.clientX));
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) handleMove(e.touches[0].clientX);
    });

    // ==========================================
    // 7. יצירת אלמנטים במשחק
    // ==========================================
    function spawnBullet(x, y, z) {
        const bulletGroup = new THREE.Group();

        const coreMat = new THREE.MeshStandardMaterial({
            color: 0xfef08a,
            emissive: 0xfacc15,
            emissiveIntensity: 2.5,
            roughness: 0.1
        });

        const core = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), coreMat);
        bulletGroup.add(core);

        const bulletLight = new THREE.PointLight(0xfacc15, 1.2, 4);
        bulletGroup.add(bulletLight);

        bulletGroup.position.set(x, y, z);
        scene.add(bulletGroup);
        bullets.push(bulletGroup);
    }

    function spawnRock(x, y, hp, size) {
        const geo = new THREE.DodecahedronGeometry(size, 1);
        const pos = geo.attributes.position;
        for (let i = 0; i < pos.count; i++) {
            pos.setXYZ(
                i,
                pos.getX(i) * (0.85 + Math.random() * 0.3),
                pos.getY(i) * (0.85 + Math.random() * 0.3),
                pos.getZ(i) * (0.85 + Math.random() * 0.3)
            );
        }
        geo.computeVertexNormals();

        const rockMat = new THREE.MeshStandardMaterial({
            color: 0x78716c,
            roughness: 0.8,
            metalness: 0.05,
            bumpMap: bumpRock,
            bumpScale: 0.12
        });

        const rock = new THREE.Mesh(geo, rockMat);
        rock.castShadow = true;
        rock.receiveShadow = true;
        rock.position.set(x, y, 0);

        rock.userData = {
            hp, maxHp: hp, size,
            vx: (Math.random() - 0.5) * 0.05,
            vy: 0,
            rotX: Math.random() * 0.02,
            rotY: Math.random() * 0.02,
            baseScale: size
        };

        scene.add(rock);
        rocks.push(rock);
    }

    // ==========================================
    // 8. לולאת המשחק הראשית (Animate)
    // ==========================================
    function startGame() {
        if (isGameStarted) return;
        isGameStarted = true;
        if (splashScreen) splashScreen.classList.add('hidden');
        spawnRock(0, 10, 20, 1.2);
    }

    if (startBtn) startBtn.addEventListener('click', startGame);

    function triggerGameOver() {
        isGameOver = true;
        if (score > bestScore) {
            bestScore = score;
            localStorage.setItem('bb3d_best', bestScore);
        }
        localStorage.setItem('bb3d_coins', coins);
        alert(`Game Over!\nScore: ${score}`);
        location.reload();
    }

    function animate(time) {
        requestAnimationFrame(animate);

        if (!isGameStarted || isPaused || isGameOver) {
            renderer.render(scene, camera);
            return;
        }

        cannonGroup.position.x += (targetX - cannonGroup.position.x) * 0.2;

        // אנימציית רתיעה
        if (recoilTimer > 0) {
            leftBarrel.position.z = -0.15 * (recoilTimer / 5);
            rightBarrel.position.z = -0.15 * (recoilTimer / 5);
            recoilTimer--;
        } else {
            leftBarrel.position.z = 0;
            rightBarrel.position.z = 0;
        }

        // ירי רציף
        if (time - lastShotTime > 1000 / (fireRate * 4)) {
            const bY = cannonGroup.position.y + 1.4;
            spawnBullet(cannonGroup.position.x - 0.35, bY, 0);
            spawnBullet(cannonGroup.position.x + 0.35, bY, 0);
            recoilTimer = 5;
            lastShotTime = time;
        }

        // תנועת כדורים
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            b.position.y += 0.45;
            if (b.position.y > 18) {
                scene.remove(b);
                bullets.splice(i, 1);
            }
        }

        // תנועת סלעים והתנגשויות
        for (let i = rocks.length - 1; i >= 0; i--) {
            const r = rocks[i];
            const data = r.userData;

            data.vy -= 0.0025;
            r.position.x += data.vx;
            r.position.y += data.vy;
            r.rotation.x += data.rotX;

            if (r.position.y - data.size < 0.2) {
                r.position.y = 0.2 + data.size;
                data.vy = Math.abs(data.vy) * 0.92;
            }

            // קוליזיה עם התותח
            if (Math.abs(r.position.x - cannonGroup.position.x) < data.size + 0.8 && r.position.y < 1.5) {
                playerHp -= 200;
                scene.remove(r);
                rocks.splice(i, 1);
                if (playerHp <= 0) triggerGameOver();
                continue;
            }

            // פגיעת כדור בסלע
            for (let bIdx = bullets.length - 1; bIdx >= 0; bIdx--) {
                const b = bullets[bIdx];
                if (b.position.distanceTo(r.position) < data.size) {
                    scene.remove(b);
                    bullets.splice(bIdx, 1);
                    data.hp -= firePower;
                    if (data.hp <= 0) {
                        scene.remove(r);
                        rocks.splice(i, 1);
                        score += 10;
                        coins += 2;
                        updateUI();
                        // יצירת סלע חדש
                        spawnRock((Math.random() - 0.5) * 8, 12, 15 + score, 1.0 + Math.random() * 0.5);
                        break;
                    }
                }
            }
        }

        renderer.render(scene, camera);
    }

    animate(0);
});