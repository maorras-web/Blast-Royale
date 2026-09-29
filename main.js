window.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. הגדרת THREE.JS (סצנה, מצלמה, רינדור)
    // ==========================================
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd97706); // אווירת שקיעה כתומה-זהובה
    scene.fog = new THREE.FogExp2(0xd97706, 0.015);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 7, 16);
    camera.lookAt(0, 6, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    // ==========================================
    // 2. תאורה (Shading & Atmosphere)
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0xffedd5, 0.8);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffedd5, 1.2);
    sunLight.position.set(10, 20, 15);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    scene.add(sunLight);

    // ==========================================
    // 3. בניה תלת-ממדית (דשא, תותח, רקע פירמידות)
    // ==========================================
    
    // רצפת דשא
    const grassGeo = new THREE.BoxGeometry(30, 1, 10);
    const grassMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.position.set(0, -0.5, 0);
    grass.receiveShadow = true;
    scene.add(grass);

    // פירמידות ענקיות ברקע
    function createBackgroundPyramid(x, z, scale) {
        const geo = new THREE.ConeGeometry(8 * scale, 12 * scale, 4);
        const mat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.9, flatShading: true });
        const pyr = new THREE.Mesh(geo, mat);
        pyr.position.set(x, 5 * scale, z);
        pyr.rotation.y = Math.PI / 4;
        scene.add(pyr);
    }
    createBackgroundPyramid(-15, -10, 1.5);
    createBackgroundPyramid(15, -12, 1.8);
    createBackgroundPyramid(0, -20, 2.5);

    // --- בניית התותח ---
    const cannonGroup = new THREE.Group();

    // בסיס התותח
    const baseGeo = new THREE.BoxGeometry(2.2, 0.6, 1.8);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
    const base = new THREE.Mesh(baseGeo, baseMat);
    base.position.y = 0.3;
    base.castShadow = true;
    cannonGroup.add(base);

    // כיפה כחולה זוהרת
    const domeGeo = new THREE.SphereGeometry(1.0, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const domeMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, metalness: 0.2, roughness: 0.1, transparent: true, opacity: 0.85 });
    const dome = new THREE.Mesh(domeGeo, domeMat);
    dome.position.y = 0.6;
    cannonGroup.add(dome);

    // גלגלים
    const wheelGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 16);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9 });
    const wheelPositions = [[-1.1, 0.2, 0.8], [1.1, 0.2, 0.8], [-1.1, 0.2, -0.8], [1.1, 0.2, -0.8]];
    wheelPositions.forEach(pos => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(...pos);
        wheel.castShadow = true;
        cannonGroup.add(wheel);
    });

    // קני ירי
    const barrelGeo = new THREE.CylinderGeometry(0.12, 0.12, 1.0, 16);
    const barrelMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9 });
    const leftBarrel = new THREE.Mesh(barrelGeo, barrelMat);
    leftBarrel.position.set(-0.4, 1.2, 0);
    const rightBarrel = new THREE.Mesh(barrelGeo, barrelMat);
    rightBarrel.position.set(0.4, 1.2, 0);
    cannonGroup.add(leftBarrel);
    cannonGroup.add(rightBarrel);

    cannonGroup.position.set(0, 0, 0);
    scene.add(cannonGroup);

    // ==========================================
    // 4. משתני המשחק והסטטיסטיקות
    // ==========================================
    let score = 0;
    let coins = 0;
    let level = 1;
    let firePower = 1;
    let fireRate = 1; // קצב ירי (יריות בשניה)
    let isGameOver = false;

    let bullets = [];
    let rocks = [];
    let droppedCoins = [];
    let particles = [];

    let lastShotTime = 0;

    // ==========================================
    // 5. מערכת סאונד (Web Audio API)
    // ==========================================
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function playSound(type) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);

        if (type === 'shoot') {
            osc.frequency.setValueAtTime(400, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.08);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.08);
        } else if (type === 'hit') {
            osc.type = 'square';
            osc.frequency.setValueAtTime(120, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.05);
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.05);
        } else if (type === 'coin') {
            osc.frequency.setValueAtTime(800, audioCtx.currentTime);
            osc.frequency.setValueAtTime(1200, audioCtx.currentTime + 0.05);
            gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.12);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.12);
        }
    }

    // ==========================================
    // 6. אלמנטים במשחק (יריות, סלעים, מטבעות)
    // ==========================================

    // יצירת ירייה
    function spawnBullet(x, y, z) {
        const geo = new THREE.SphereGeometry(0.2, 16, 16);
        const mat = new THREE.MeshBasicMaterial({ color: 0xfacc15 });
        const bullet = new THREE.Mesh(geo, mat);
        bullet.position.set(x, y, z);
        scene.add(bullet);
        bullets.push(bullet);
    }

    // יצירת סלע-פירמידה
    function spawnRock(x, y, hp, size) {
        const geo = new THREE.ConeGeometry(size, size * 1.4, 4);
        const mat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.8, flatShading: true });
        const rock = new THREE.Mesh(geo, mat);
        rock.castShadow = true;
        rock.position.set(x, y, 0);
        
        // טקסט תלת ממדי של ה-HP
        const canvas = document.createElement('canvas');
        canvas.width = 128; canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.font = 'Bold 70px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(hp, 64, 64);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMat = new THREE.SpriteMaterial({ map: texture });
        const label = new THREE.Sprite(spriteMat);
        label.scale.set(size * 1.2, size * 1.2, 1);
        rock.add(label);

        rock.userData = {
            hp: hp,
            maxHp: hp,
            size: size,
            vx: (Math.random() - 0.5) * 0.08,
            vy: 0,
            label: label,
            canvas: canvas,
            ctx: ctx,
            texture: texture
        };

        scene.add(rock);
        rocks.push(rock);
    }

    function updateRockLabel(rock) {
        const ctx = rock.userData.ctx;
        ctx.clearRect(0, 0, 128, 128);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'Bold 70px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(rock.userData.hp, 64, 64);
        rock.userData.texture.needsUpdate = true;
    }

    // יצירת מטבע תלת-ממדי
    function spawnCoin(x, y) {
        const geo = new THREE.CylinderGeometry(0.35, 0.35, 0.1, 16);
        const mat = new THREE.MeshStandardMaterial({ color: 0xeab308, metalness: 0.9, roughness: 0.2 });
        const coin = new THREE.Mesh(geo, mat);
        coin.rotation.x = Math.PI / 2;
        coin.position.set(x, y, 0);
        coin.userData = { vy: -0.05 };
        scene.add(coin);
        droppedCoins.push(coin);
    }

    // ==========================================
    // 7. בקרת מגע/עכבר (Touch & Drag)
    // ==========================================
    let isDragging = false;
    let targetX = 0;

    function handleMove(clientX) {
        const normalizedX = (clientX / window.innerWidth) * 2 - 1;
        targetX = normalizedX * 7.5; // הגבלת גבולות המסך
    }

    window.addEventListener('pointerdown', (e) => { isDragging = true; handleMove(e.clientX); });
    window.addEventListener('pointermove', (e) => { if (isDragging) handleMove(e.clientX); });
    window.addEventListener('pointerup', () => { isDragging = false; });

    // ==========================================
    // 8. לולאת המשחק הראשת (Game Loop)
    // ==========================================
    function startNextWave() {
        if (rocks.length === 0) {
            level++;
            const count = Math.min(2 + Math.floor(level / 2), 6);
            for (let i = 0; i < count; i++) {
                const size = 1.2 + Math.random() * 1.0;
                const hp = Math.floor((10 + level * 8) * (size / 1.5));
                spawnRock((Math.random() - 0.5) * 12, 12 + i * 3, hp, size);
            }
        }
    }

    // התחלת גל ראשון
    startNextWave();

    function animate(time) {
        requestAnimationFrame(animate);

        if (isGameOver) return;

        // --- 1. תנועת התותח ---
        cannonGroup.position.x += (targetX - cannonGroup.position.x) * 0.25;

        // --- 2. מנגנון ירי ---
        if (time - lastShotTime > 1000 / (fireRate * 5)) {
            spawnBullet(cannonGroup.position.x - 0.4, 1.8, 0);
            spawnBullet(cannonGroup.position.x + 0.4, 1.8, 0);
            playSound('shoot');
            lastShotTime = time;
        }

        // --- 3. עדכון יריות ---
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            b.position.y += 0.4;
            if (b.position.y > 18) {
                scene.remove(b);
                bullets.splice(i, 1);
            }
        }

        // --- 4. עדכון סלעים פיזיקה והתנגשויות ---
        for (let rIdx = rocks.length - 1; rIdx >= 0; rIdx--) {
            const r = rocks[rIdx];
            
            // פיזיקה
            r.userData.vy -= 0.003; // כוח משיכה
            r.position.x += r.userData.vx;
            r.position.y += r.userData.vy;

            // פגיעה ברצפה (קפיצה)
            if (r.position.y - r.userData.size < 0.2) {
                r.position.y = 0.2 + r.userData.size;
                r.userData.vy = Math.abs(r.userData.vy) * 0.95;
                if (r.userData.vy < 0.12) r.userData.vy = 0.18; // גובה קפיצה מינימלי
            }

            // פגיעה בקירות
            if (Math.abs(r.position.x) > 8) {
                r.userData.vx *= -1;
            }

            // התנגשות עם יריות
            for (let bIdx = bullets.length - 1; bIdx >= 0; bIdx--) {
                const b = bullets[bIdx];
                const dist = b.position.distanceTo(r.position);
                
                if (dist < r.userData.size * 0.9) {
                    // פגיעה!
                    scene.remove(b);
                    bullets.splice(bIdx, 1);
                    
                    r.userData.hp -= firePower;
                    score += firePower;
                    playSound('hit');

                    if (r.userData.hp <= 0) {
                        // הפלת מטבע
                        if (Math.random() > 0.3) spawnCoin(r.position.x, r.position.y);

                        // התפצלות
                        if (r.userData.size > 1.1) {
                            spawnRock(r.position.x - 0.5, r.position.y, Math.floor(r.userData.maxHp / 2), r.userData.size * 0.7);
                            spawnRock(r.position.x + 0.5, r.position.y, Math.floor(r.userData.maxHp / 2), r.userData.size * 0.7);
                        }

                        scene.remove(r);
                        rocks.splice(rIdx, 1);
                        break;
                    } else {
                        updateRockLabel(r);
                    }
                }
            }

            // התנגשות סלע בתותח (Game Over)
            const distToCannon = Math.hypot(r.position.x - cannonGroup.position.x, r.position.y - 0.5);
            if (distToCannon < r.userData.size + 0.8) {
                isGameOver = true;
                alert(`Game Over! ניקוד סופי: ${score}`);
                location.reload();
            }
        }

        // --- 5. עדכון מטבעות ---
        for (let cIdx = droppedCoins.length - 1; cIdx >= 0; cIdx--) {
            const c = droppedCoins[cIdx];
            c.position.y += c.userData.vy;
            c.rotation.z += 0.05;

            // איסוף על ידי התותח
            if (Math.hypot(c.position.x - cannonGroup.position.x, c.position.y - 0.5) < 1.5) {
                coins += 5;
                playSound('coin');
                scene.remove(c);
                droppedCoins.splice(cIdx, 1);
            } else if (c.position.y < 0.2) {
                // המטבע נשאר על הרצפה
                c.userData.vy = 0;
            }
        }

        // בדיקה אם השלב הסתיים
        startNextWave();

        renderer.render(scene, camera);
    }

    // התאמת גודל חלון
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    animate(0);
});