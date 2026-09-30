window.addEventListener('DOMContentLoaded', () => {

    if (typeof THREE === 'undefined') {
        console.error('Three.js library is missing!');
        return;
    }

    // ==========================================
    // 1. סצנה ומצלמה מותאמות למובייל
    // ==========================================
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd97706);
    scene.fog = new THREE.FogExp2(0xd97706, 0.015);

    const camera = new THREE.PerspectiveCamera(
        50,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    
    let screenLimitX = 4.8; // גבול תנועה מותאם למסכי מובייל

    function updateCameraForDevice() {
        const aspect = window.innerWidth / window.innerHeight;
        camera.aspect = aspect;
        camera.position.set(0, 11, 24);
        camera.lookAt(0, 4.5, 0);
        screenLimitX = aspect < 1 ? 4.8 : 5.8;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    const renderer = new THREE.WebGLRenderer({
        antialias: true,
        powerPreference: "high-performance"
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // הגבלה לחיסכון בסוללה ומשאבים
    
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(renderer.domElement);
    updateCameraForDevice();

    // ==========================================
    // 2. תאורה אופטימלית למובייל
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0xffedd5, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 1.4);
    sunLight.position.set(10, 20, 15);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 512; // רזולוציה קלה למובייל
    sunLight.shadow.mapSize.height = 512;
    scene.add(sunLight);

    // ==========================================
    // 3. שימוש חוזר בגיאומטריות (Performance Boost)
    // ==========================================
    const bulletGeo = new THREE.SphereGeometry(0.18, 8, 8);
    const bulletMat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });

    const rockGeo = new THREE.DodecahedronGeometry(1, 0);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x78716c, roughness: 0.8 });

    const cannonGroup = new THREE.Group();
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });

    const baseMesh = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.5, 1.4), metalMat);
    baseMesh.position.y = 0.3;
    cannonGroup.add(baseMesh);

    const barrelGeo = new THREE.CylinderGeometry(0.14, 0.16, 1.0, 12);
    const leftBarrel = new THREE.Mesh(barrelGeo, metalMat);
    leftBarrel.position.set(-0.35, 0.9, 0);
    const rightBarrel = new THREE.Mesh(barrelGeo, metalMat);
    rightBarrel.position.set(0.35, 0.9, 0);

    cannonGroup.add(leftBarrel, rightBarrel);
    cannonGroup.scale.setScalar(1.1);
    scene.add(cannonGroup);

    // הקרקע
    const groundGeo = new THREE.PlaneGeometry(30, 40);
    const groundMat = new THREE.MeshStandardMaterial({ color: 0xc2410c, roughness: 0.9 });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    // ==========================================
    // 4. משתני משחק
    // ==========================================
    let isGameStarted = false;
    let isGameOver = false;

    let score = 0;
    let coins = parseInt(localStorage.getItem('bb3d_coins')) || 0;

    let firePower = parseInt(localStorage.getItem('bb3d_upg_power')) || 1;
    let fireRate = 1 + ((parseInt(localStorage.getItem('bb3d_upg_rate')) || 1) - 1) * 0.25;

    const bullets = [];
    const rocks = [];

    let lastShotTime = 0;
    let targetX = 0;

    const coinsValEl = document.getElementById('coins-val');
    const scoreValEl = document.getElementById('score-val');
    const splashScreen = document.getElementById('splash-screen');
    const startBtn = document.getElementById('start-btn');

    function updateUI() {
        if (coinsValEl) coinsValEl.innerText = coins;
        if (scoreValEl) scoreValEl.innerText = score;
    }
    updateUI();

    // ==========================================
    // 5. שליטה מותאמת למסכי מגע (Mobile Touch)
    // ==========================================
    function handleTouchMove(e) {
        if (!isGameStarted || isGameOver) return;
        if (e.touches && e.touches.length > 0) {
            const touchX = e.touches[0].clientX;
            const normX = (touchX / window.innerWidth) * 2 - 1;
            targetX = THREE.MathUtils.clamp(normX * screenLimitX, -screenLimitX, screenLimitX);
        }
    }

    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('mousemove', (e) => {
        if (!isGameStarted || isGameOver) return;
        const normX = (e.clientX / window.innerWidth) * 2 - 1;
        targetX = THREE.MathUtils.clamp(normX * screenLimitX, -screenLimitX, screenLimitX);
    });

    window.addEventListener('resize', updateCameraForDevice);

    // ==========================================
    // 6. יצירת אלמנטים
    // ==========================================
    function spawnBullet(x, y) {
        const bullet = new THREE.Mesh(bulletGeo, bulletMat);
        bullet.position.set(x, y, 0);
        scene.add(bullet);
        bullets.push(bullet);
    }

    function spawnRock(x, y, hp, size) {
        const rock = new THREE.Mesh(rockGeo, rockMat);
        rock.scale.setScalar(size);
        rock.castShadow = true;
        rock.position.set(x, y, 0);

        rock.userData = {
            hp, size,
            vx: (Math.random() - 0.5) * 0.04,
            vy: 0
        };

        scene.add(rock);
        rocks.push(rock);
    }

    // ==========================================
    // 7. לולאת המשחק (Game Loop)
    // ==========================================
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            isGameStarted = true;
            if (splashScreen) splashScreen.classList.add('hidden');
            spawnRock(0, 10, 15, 1.2);
        });
    }

    function animate(time) {
        requestAnimationFrame(animate);

        if (!isGameStarted || isGameOver) {
            renderer.render(scene, camera);
            return;
        }

        // תנועה חלקה של התותח
        cannonGroup.position.x += (targetX - cannonGroup.position.x) * 0.25;

        // ירי רציף
        if (time - lastShotTime > 1000 / (fireRate * 4)) {
            const bY = cannonGroup.position.y + 1.2;
            spawnBullet(cannonGroup.position.x - 0.35, bY);
            spawnBullet(cannonGroup.position.x + 0.35, bY);
            lastShotTime = time;
        }

        // תנועת כדורים
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            b.position.y += 0.4;
            if (b.position.y > 16) {
                scene.remove(b);
                bullets.splice(i, 1);
            }
        }

        // תנועת סלעים והתנגשויות
        for (let i = rocks.length - 1; i >= 0; i--) {
            const r = rocks[i];
            const data = r.userData;

            data.vy -= 0.002;
            r.position.x += data.vx;
            r.position.y += data.vy;

            if (r.position.y - data.size < 0.2) {
                r.position.y = 0.2 + data.size;
                data.vy = Math.abs(data.vy) * 0.9;
            }

            // פגיעה בסלע
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
                        localStorage.setItem('bb3d_coins', coins);
                        updateUI();
                        spawnRock((Math.random() - 0.5) * 6, 11, 10 + score, 1.0 + Math.random() * 0.4);
                        break;
                    }
                }
            }
        }

        renderer.render(scene, camera);
    }

    animate(0);
});