window.addEventListener('DOMContentLoaded',()=>{
'use strict';
if(typeof THREE==='undefined') return console.error('Three.js is missing');
const $=id=>document.getElementById(id), clamp=(v,a,b)=>Math.max(a,Math.min(b,v)), rand=(a,b)=>a+Math.random()*(b-a);

const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(52,1,.1,300);
const renderer=new THREE.WebGLRenderer({antialias:innerWidth>650,powerPreference:'high-performance'});
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.08;
renderer.outputEncoding=THREE.sRGBEncoding;
renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
renderer.setSize(innerWidth,innerHeight,false);
document.body.appendChild(renderer.domElement);

let limitX=7.5,baseY=9,baseZ=21,lookY=5.1;

function resize(){
    const a=innerWidth/Math.max(1,innerHeight);
    camera.aspect=a;
    if(a<.76){
        limitX=4.7;baseY=12.4;baseZ=25.5;lookY=5.4;
    }else if(a<1.05){
        limitX=5.4;baseY=11;baseZ=23.2;lookY=5.1;
    }else{
        limitX=7.7;baseY=8.9;baseZ=20.5;lookY=5;
    }
    camera.position.set(0,baseY,baseZ);
    camera.lookAt(0,lookY,0);
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth,innerHeight,false);
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<600?1.2:1.5));
}
resize();
addEventListener('resize',resize,{passive:true});

function sky(){
    const c=document.createElement('canvas');
    c.width=2;
    c.height=512;
    const x=c.getContext('2d');
    const g=x.createLinearGradient(0,0,0,512);
    g.addColorStop(0,'#040918');
    g.addColorStop(.4,'#10344d');
    g.addColorStop(.72,'#1d6076');
    g.addColorStop(1,'#d88048');
    x.fillStyle=g;
    x.fillRect(0,0,2,512);
    const t=new THREE.CanvasTexture(c);
    t.encoding=THREE.sRGBEncoding;
    return t;
}

scene.background=sky();
scene.fog=new THREE.FogExp2(0x17435b,.017);

scene.add(new THREE.HemisphereLight(0xa8eaff,0x32180c,.9));

const sun=new THREE.DirectionalLight(0xfff0d1,1.55);
sun.position.set(12,24,14);
sun.castShadow=true;
const sm=innerWidth<650?768:1024;
sun.shadow.mapSize.set(sm,sm);
sun.shadow.camera.left=-18;
sun.shadow.camera.right=18;
sun.shadow.camera.top=22;
sun.shadow.camera.bottom=-5;
sun.shadow.camera.far=70;
sun.shadow.bias=-.0004;
scene.add(sun);

const fill=new THREE.DirectionalLight(0x5bd6ff,.42);
fill.position.set(-14,10,8);
scene.add(fill);

const arenaLight=new THREE.PointLight(0x22d3ee,2,12,2);
arenaLight.position.set(0,2.2,2.5);
scene.add(arenaLight);

const world=new THREE.Group();
scene.add(world);

const ground=new THREE.Mesh(
    new THREE.PlaneGeometry(58,44),
    new THREE.MeshStandardMaterial({
        color:0x18322f,
        roughness:.96,
        metalness:.02,
        flatShading:true
    })
);
ground.rotation.x=-Math.PI/2;
ground.position.set(0,-.2,-7);
ground.receiveShadow=true;
world.add(ground);

const platform=new THREE.Mesh(
    new THREE.CylinderGeometry(5.7,6.3,.48,56),
    new THREE.MeshStandardMaterial({
        color:0x17263a,
        roughness:.48,
        metalness:.3,
        flatShading:true
    })
);
platform.position.set(0,.05,.1);
platform.scale.z=.68;
platform.castShadow=true;
platform.receiveShadow=true;
world.add(platform);

const inner=new THREE.Mesh(
    new THREE.CylinderGeometry(4.8,5.05,.13,56),
    new THREE.MeshStandardMaterial({
        color:0x0d1a2b,
        roughness:.7,
        metalness:.18
    })
);
inner.position.set(0,.34,.1);
inner.scale.z=.67;
world.add(inner);

const ringMat=new THREE.MeshBasicMaterial({
    color:0x38bdf8,
    transparent:true,
    opacity:.75
});

for(let i=0;i<2;i++){
    const r=new THREE.Mesh(
        new THREE.TorusGeometry(
            3.8+i*.72,
            i?.03:.045,
            8,
            56
        ),
        ringMat
    );
    r.rotation.x=Math.PI/2;
    r.position.set(0,.38+i*.01,.1);
    r.scale.z=.66;
    world.add(r);
}

function cluster(x,z,s,c){
    const g=new THREE.Group();
    const m=new THREE.MeshStandardMaterial({
        color:c,
        roughness:.92,
        flatShading:true
    });

    for(let i=0;i<3;i++){
        const q=new THREE.IcosahedronGeometry(1,1);
        const p=q.attributes.position;

        for(let j=0;j<p.count;j++){
            const f=.78+(j*7%10)/28;
            p.setXYZ(
                j,
                p.getX(j)*f,
                p.getY(j)*(.88+(j%5)/26),
                p.getZ(j)*f
            );
        }

        p.needsUpdate=true;
        q.computeVertexNormals();

        const o=new THREE.Mesh(q,m);
        o.position.set(
            rand(-2.4,2.4),
            rand(.3,.9),
            rand(-.2,1.4)
        );
        o.scale.setScalar(s*rand(.65,1.08));
        o.rotation.set(
            rand(-.25,.25),
            rand(0,Math.PI),
            rand(-.25,.25)
        );
        o.castShadow=true;
        o.receiveShadow=true;
        g.add(o);
    }

    g.position.set(x,0,z);
    world.add(g);
}

cluster(-14,-10,2.25,0x573a24);
cluster(14,-11,2.55,0x573a24);
cluster(-9,-17,1.7,0x3b2a20);
cluster(9,-18,1.9,0x3b2a20);

const crystalMat=new THREE.MeshStandardMaterial({
    color:0x22d3ee,
    emissive:0x075985,
    emissiveIntensity:.9,
    roughness:.2,
    metalness:.35,
    flatShading:true
});

function crystal(x,y,z,s){
    const g=new THREE.Group();
    const q=new THREE.OctahedronGeometry(1,0);

    for(let i=0;i<2;i++){
        const m=new THREE.Mesh(q,crystalMat);
        m.position.set((i-.5)*.45,i*.14,0);
        m.scale.set(
            s*(i?.58:.82),
            s*(i?1.35:1.7),
            s*(i?.58:.82)
        );
        m.rotation.z=i*.35;
        m.castShadow=true;
        g.add(m);
    }

    g.position.set(x,y,z);
    world.add(g);
}

crystal(-5.7,.4,-4.8,.55);
crystal(6,.4,-4.8,.58);
crystal(-10,.1,-13,.82);
crystal(10.5,.1,-14,.9);

const cannon=new THREE.Group();
cannon.position.z=1;
scene.add(cannon);

const darkMat=new THREE.MeshStandardMaterial({
    color:0x0b1220,
    roughness:.3,
    metalness:.82
});

const blueMat=new THREE.MeshStandardMaterial({
    color:0x0d6e9e,
    roughness:.24,
    metalness:.5
});

const edgeMat=new THREE.MeshStandardMaterial({
    color:0x67e8f9,
    emissive:0x0a4b60,
    emissiveIntensity:.9,
    roughness:.22,
    metalness:.3
});

function add(g){
    g.castShadow=true;
    g.receiveShadow=true;
    cannon.add(g);
    return g;
}

add(
    new THREE.Mesh(
        new THREE.BoxGeometry(2.5,.55,1.8),
        darkMat
    )
).position.y=.36;

add(
    new THREE.Mesh(
        new THREE.BoxGeometry(2.08,.15,1.95),
        blueMat
    )
).position.y=.63;

add(
    new THREE.Mesh(
        new THREE.CylinderGeometry(1.05,1.15,.24,24),
        edgeMat
    )
).position.y=.79;

const dome=add(
    new THREE.Mesh(
        new THREE.SphereGeometry(
            .9,
            24,
            16,
            0,
            Math.PI*2,
            0,
            Math.PI/2
        ),
        new THREE.MeshStandardMaterial({
            color:0x0ea5e9,
            emissive:0x075985,
            emissiveIntensity:.7,
            metalness:.32,
            roughness:.18,
            transparent:true,
            opacity:.94
        })
    )
);

dome.position.y=.74;

const axle=add(
    new THREE.Mesh(
        new THREE.CylinderGeometry(.18,.18,2.45,16),
        darkMat
    )
);
axle.rotation.z=Math.PI/2;
axle.position.y=.28;

const wheelGeo=new THREE.CylinderGeometry(.38,.38,.22,18);

for(const z of[-.72,.72]){
    const w=add(new THREE.Mesh(wheelGeo,darkMat));
    w.rotation.z=Math.PI/2;
    w.position.set(0,.29,z);
}

const barrels=new THREE.Group();
barrels.position.y=.79;
cannon.add(barrels);

const barrelGeo=new THREE.CylinderGeometry(.16,.21,1.36,16);
const muzzleGeo=new THREE.CylinderGeometry(.2,.2,.23,16);
const collarGeo=new THREE.TorusGeometry(.23,.045,8,18);
const flashes=[];

for(const x of[-.39,.39]){
    const b=new THREE.Mesh(barrelGeo,darkMat);
    b.position.set(x,.86,.02);
    b.castShadow=true;
    barrels.add(b);

    const m=new THREE.Mesh(muzzleGeo,blueMat);
    m.position.set(x,1.57,.02);
    m.castShadow=true;
    barrels.add(m);

    const c=new THREE.Mesh(collarGeo,edgeMat);
    c.rotation.x=Math.PI/2;
    c.position.set(x,1.45,.02);
    barrels.add(c);

    const f=new THREE.Mesh(
        new THREE.IcosahedronGeometry(.34,0),
        new THREE.MeshBasicMaterial({
            color:0xfff4b2,
            transparent:true,
            opacity:0,
            depthWrite:false
        })
    );
    f.position.set(x,1.74,.02);
    f.visible=false;
    barrels.add(f);
    flashes.push(f);
}

const cannonGlow=new THREE.PointLight(0x22d3ee,1.2,5,2);
cannonGlow.position.set(0,1,.7);
cannon.add(cannonGlow);

const ui={
    score:$('score-val'),
    coins:$('coins-val'),
    hp:$('hp-text'),
    bar:$('hp-bar'),
    level:$('level-text'),
    start:$('splash-screen'),
    startBtn:$('start-btn'),
    startCoins:$('start-coins'),
    best:$('start-best-score'),
    powerBtn:$('buy-power-btn'),
    rateBtn:$('buy-rate-btn'),
    magnetBtn:$('buy-magnet-btn'),
    powerLvl:$('power-lvl-text'),
    rateLvl:$('rate-lvl-text'),
    magnetLvl:$('magnet-lvl-text'),
    combat:$('combat-ui'),
    combo:$('combo-badge'),
    wave:$('wave-badge'),
    pauseBtn:$('pause-btn'),
    pause:$('pause-screen'),
    resume:$('resume-btn'),
    over:$('game-over-screen'),
    restart:$('restart-btn'),
    finalScore:$('final-score'),
    finalLevel:$('final-level'),
    finalCoins:$('final-coins'),
    damage:$('damage-flash')
};

let score=0;
let coins=parseInt(localStorage.getItem('bb3d_coins')||'0',10)||0;
let best=parseInt(localStorage.getItem('bb3d_best')||'0',10)||0;
let level=1;
let hp=1000;
let saveTimer=0;

let powerLvl=parseInt(localStorage.getItem('bb3d_upg_power')||'1',10)||1;
let rateLvl=parseInt(localStorage.getItem('bb3d_upg_rate')||'1',10)||1;
let magnetLvl=parseInt(localStorage.getItem('bb3d_upg_magnet')||'0',10)||0;

let power=powerLvl;
let rate=1+(rateLvl-1)*.25;

let bullets=[];
let rocks=[];
let coinsDrop=[];

let started=false;
let paused=false;
let gameOver=false;
let targetX=0;
let lastShot=0;
let combo=0;
let comboTime=0;
let waveTime=0;
let recoil=0;
let shake=0;
let elapsed=0;
let lastFrame=performance.now();

function save(){
    localStorage.setItem('bb3d_coins',coins);
    localStorage.setItem('bb3d_best',best);
    localStorage.setItem('bb3d_upg_power',powerLvl);
    localStorage.setItem('bb3d_upg_rate',rateLvl);
    localStorage.setItem('bb3d_upg_magnet',magnetLvl);
}

function updateUI(){
    ui.score.textContent=score;
    ui.coins.textContent=coins;
    ui.hp.textContent=`${Math.max(0,Math.round(hp))} / 1000`;
    ui.bar.style.width=`${clamp(hp/10,0,100)}%`;
    ui.level.textContent=`LEVEL ${level}`;
    ui.startCoins.textContent=coins;
    ui.best.textContent=best;

    ui.powerLvl.textContent=`Lvl ${powerLvl}`;
    ui.rateLvl.textContent=`Lvl ${rateLvl}`;
    ui.magnetLvl.textContent=`Lvl ${magnetLvl}`;

    ui.powerBtn.textContent=`${powerLvl*50} C`;
    ui.rateBtn.textContent=`${rateLvl*60} C`;
    ui.magnetBtn.textContent=`${(magnetLvl+1)*100} C`;

    ui.powerBtn.disabled=coins<powerLvl*50;
    ui.rateBtn.disabled=coins<rateLvl*60;
    ui.magnetBtn.disabled=coins<(magnetLvl+1)*100;

    ui.combo.textContent=`COMBO x${Math.max(1,combo)}`;
    ui.wave.textContent=`WAVE ${level}`;
}

updateUI();

let audio=null;

function sound(t){
    if(!audio){
        const A=window.AudioContext||window.webkitAudioContext;
        if(!A) return;
        try{audio=new A()}catch(e){return}
    }

    if(audio.state==='suspended') audio.resume();

    const o=audio.createOscillator();
    const g=audio.createGain();
    const n=audio.currentTime;

    o.connect(g);
    g.connect(audio.destination);

    if(t==='shoot'){
        o.type='sawtooth';
        o.frequency.setValueAtTime(380,n);
        o.frequency.exponentialRampToValueAtTime(95,n+.07);
        g.gain.setValueAtTime(.045,n);
        g.gain.exponentialRampToValueAtTime(.001,n+.08);
        o.start(n);
        o.stop(n+.08);
    }else if(t==='hit'){
        o.type='triangle';
        o.frequency.setValueAtTime(160,n);
        o.frequency.exponentialRampToValueAtTime(45,n+.08);
        g.gain.setValueAtTime(.07,n);
        g.gain.exponentialRampToValueAtTime(.001,n+.09);
        o.start(n);
        o.stop(n+.09);
    }else if(t==='coin'){
        o.type='sine';
        o.frequency.setValueAtTime(900,n);
        o.frequency.setValueAtTime(1320,n+.06);
        g.gain.setValueAtTime(.06,n);
        g.gain.exponentialRampToValueAtTime(.001,n+.14);
        o.start(n);
        o.stop(n+.14);
    }else{
        o.type='sine';
        o.frequency.setValueAtTime(520,n);
        o.frequency.setValueAtTime(780,n+.08);
        o.frequency.setValueAtTime(1040,n+.16);
        g.gain.setValueAtTime(.06,n);
        g.gain.exponentialRampToValueAtTime(.001,n+.3);
        o.start(n);
        o.stop(n+.3);
    }
}

const bulletGeo=new THREE.SphereGeometry(.16,10,10);
const bulletMat=new THREE.MeshBasicMaterial({color:0xfff1a8});
const bulletGlowGeo=new THREE.SphereGeometry(.3,8,8);
const bulletGlowMat=new THREE.MeshBasicMaterial({
    color:0x38bdf8,
    transparent:true,
    opacity:.32,
    depthWrite:false
});

const coinGeo=new THREE.CylinderGeometry(.28,.28,.09,14);

const coinMat=new THREE.MeshStandardMaterial({
    color:0xfacc15,
    metalness:.86,
    roughness:.18,
    emissive:0x6b4a00,
    emissiveIntensity:.18
});

const rockGeo=new THREE.IcosahedronGeometry(1,1);
const pos=rockGeo.attributes.position;

for(let i=0;i<pos.count;i++){
    const f=.8+(i*9%11)/30;
    pos.setXYZ(
        i,
        pos.getX(i)*f,
        pos.getY(i)*(.9+(i%5)/24),
        pos.getZ(i)*f
    );
}

pos.needsUpdate=true;
rockGeo.computeVertexNormals();

const rockMats=[
    new THREE.MeshStandardMaterial({
        color:0x728398,
        roughness:.8,
        flatShading:true
    }),
    new THREE.MeshStandardMaterial({
        color:0x8c5f45,
        roughness:.86,
        flatShading:true
    }),
    new THREE.MeshStandardMaterial({
        color:0x53677d,
        roughness:.76,
        metalness:.08,
        flatShading:true
    })
];

const hpCache=new Map();

function hpTex(v){
    v=String(Math.max(0,Math.ceil(v)));

    if(hpCache.has(v)) return hpCache.get(v);

    const c=document.createElement('canvas');
    c.width=128;
    c.height=64;

    const x=c.getContext('2d');
    x.font='900 42px Rubik,Arial';
    x.textAlign='center';
    x.textBaseline='middle';
    x.shadowColor='rgba(0,0,0,.75)';
    x.shadowBlur=7;
    x.fillStyle='#fff';
    x.fillText(v,64,32);

    const t=new THREE.CanvasTexture(c);
    t.minFilter=THREE.LinearFilter;
    t.magFilter=THREE.LinearFilter;
    t.encoding=THREE.sRGBEncoding;

    hpCache.set(v,t);
    return t;
}

function spawnBullet(x){
    const g=new THREE.Group();
    g.add(
        new THREE.Mesh(bulletGeo,bulletMat),
        new THREE.Mesh(bulletGlowGeo,bulletGlowMat)
    );
    g.position.set(x,2.45,1.05);
    g.userData.life=2;
    scene.add(g);
    bullets.push(g);
}

function spawnRock(x,y,h,s,t=0){
    const r=new THREE.Mesh(
        rockGeo,
        rockMats[t%3]
    );

    r.position.set(
        x,
        y,
        rand(-.22,.22)
    );

    r.scale.set(
        s,
        s*1.12,
        s
    );

    r.rotation.set(
        rand(-1,1),
        rand(0,6.28),
        rand(-1,1)
    );

    r.castShadow=true;
    r.receiveShadow=true;

    const lab=new THREE.Sprite(
        new THREE.SpriteMaterial({
            map:hpTex(h),
            transparent:true,
            depthWrite:false
        })
    );

    lab.scale.set(
        1.3*s,
        .65*s,
        1
    );

    lab.position.z=.78*s;
    r.add(lab);

    r.userData={
        hp:h,
        maxHp:h,
        size:s,
        vx:rand(-1.1,1.1),
        vy:rand(-1.5,-.2),
        cool:0,
        sx:rand(-1.2,1.2),
        sy:rand(-1.5,1.5),
        lab
    };

    scene.add(r);
    rocks.push(r);
}

function spawnCoin(x,y){
    const c=new THREE.Mesh(
        coinGeo,
        coinMat
    );

    c.position.set(x,y,1);
    c.rotation.x=Math.PI/2;
    c.userData={
        vy:rand(1.5,2.4),
        spin:rand(4,6)
    };

    scene.add(c);
    coinsDrop.push(c);
}

const particleCount=120;
const particlePos=new Float32Array(particleCount*3);
const particleLife=new Float32Array(particleCount);
const particleVX=new Float32Array(particleCount);
const particleVY=new Float32Array(particleCount);
const particleVZ=new Float32Array(particleCount);

const pGeo=new THREE.BufferGeometry();

pGeo.setAttribute(
    'position',
    new THREE.BufferAttribute(particlePos,3)
);

const particles=new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({
        color:0x7dd3fc,
        size:.14,
        transparent:true,
        opacity:.9,
        depthWrite:false
    })
);

scene.add(particles);

function burst(x,y,n=10){
    for(let i=0;i<n;i++){
        let k=-1;

        for(let j=0;j<particleCount;j++){
            if(particleLife[j]<=0){
                k=j;
                break;
            }
        }

        if(k<0) break;

        const a=Math.random()*6.28;
        const s=rand(1.5,5);

        particlePos[k*3]=x;
        particlePos[k*3+1]=y;
        particlePos[k*3+2]=rand(.55,1.1);

        particleLife[k]=rand(.25,.55);
        particleVX[k]=Math.cos(a)*s;
        particleVY[k]=rand(1.4,4.2);
        particleVZ[k]=Math.sin(a)*s*.3;
    }

    pGeo.attributes.position.needsUpdate=true;
}

const shockPool=[];
const shockGeo=new THREE.TorusGeometry(.48,.05,8,28);

for(let i=0;i<7;i++){
    const q=new THREE.Mesh(
        shockGeo,
        new THREE.MeshBasicMaterial({
            color:0x67e8f9,
            transparent:true,
            opacity:0,
            depthWrite:false
        })
    );

    q.rotation.x=Math.PI/2;
    q.visible=false;
    scene.add(q);
    shockPool.push(q);
}

function shock(x,y,s=1){
    const q=shockPool.find(o=>!o.visible);
    if(!q) return;

    q.visible=true;
    q.position.set(x,y,.92);
    q.scale.setScalar(.2*s);
    q.material.opacity=.85;
    q.userData={
        life:.28,
        grow:3.2*s
    };
}

function updateFx(dt){
    for(let i=0;i<particleCount;i++){
        if(particleLife[i]>0){
            particleLife[i]-=dt;
            particlePos[i*3]+=particleVX[i]*dt;
            particlePos[i*3+1]+=particleVY[i]*dt;
            particlePos[i*3+2]+=particleVZ[i]*dt;
            particleVY[i]-=8*dt;
        }
    }

    pGeo.attributes.position.needsUpdate=true;

    for(const q of shockPool){
        if(q.visible){
            q.userData.life-=dt;

            const t=1-q.userData.life/.28;

            q.scale.setScalar(
                .2+t*q.userData.grow
            );

            q.material.opacity=Math.max(
                0,
                .85*(1-t)
            );

            if(q.userData.life<=0){
                q.visible=false;
                q.material.opacity=0;
            }
        }
    }
}

function clearGame(){
    for(const b of bullets) scene.remove(b);
    for(const r of rocks) scene.remove(r);
    for(const c of coinsDrop) scene.remove(c);

    bullets=[];
    rocks=[];
    coinsDrop=[];

    particleLife.fill(0);

    for(const q of shockPool){
        q.visible=false;
        q.material.opacity=0;
    }
}

function waveSpawn(){
    const count=Math.min(
        3+Math.floor((level-1)*.65),
        7
    );

    const base=18+level*8;

    for(let i=0;i<count;i++){
        const s=rand(.8,1.18)+Math.min(.35,level*.02);

        spawnRock(
            rand(-limitX*.85,limitX*.85),
            11.5+i*rand(1.45,2),
            Math.floor(
                base*s*rand(.9,1.12)
            ),
            s,
            Math.random()<
            Math.min(.38,.2+level*.012)
            ?1:0
        );
    }

    if(level%5===0){
        spawnRock(
            0,
            15.5,
            Math.floor(base*2.8),
            1.5,
            2
        );
    }

    waveTime=0;
    sound('level');
    updateUI();
}

function gameStart(){
    clearGame();

    started=true;
    paused=false;
    gameOver=false;

    score=0;
    level=1;
    hp=1000;
    combo=0;
    comboTime=0;
    targetX=0;
    cannon.position.x=0;

    ui.start.classList.add('hidden');
    ui.pause.classList.add('hidden');
    ui.over.classList.add('hidden');

    ui.pauseBtn.classList.remove('hidden');
    ui.combat.classList.remove('hidden');

    updateUI();
    waveSpawn();
}

function finish(){
    gameOver=true;
    paused=false;

    if(score>best) best=score;

    save();

    ui.finalScore.textContent=score;
    ui.finalLevel.textContent=level;
    ui.finalCoins.textContent=coins;

    ui.pauseBtn.classList.add('hidden');
    ui.combat.classList.add('hidden');
    ui.over.classList.remove('hidden');

    updateUI();
}

ui.startBtn.onclick=gameStart;
ui.restart.onclick=gameStart;

ui.pauseBtn.onclick=()=>{
    if(!started||gameOver) return;

    paused=!paused;

    ui.pause.classList.toggle(
        'hidden',
        !paused
    );

    ui.pauseBtn.classList.toggle(
        'hidden',
        paused
    );
};

ui.resume.onclick=ui.pauseBtn.onclick;

ui.powerBtn.onclick=()=>{
    const c=powerLvl*50;
    if(coins<c) return;

    coins-=c;
    power=++powerLvl;

    save();
    updateUI();
};

ui.rateBtn.onclick=()=>{
    const c=rateLvl*60;
    if(coins<c) return;

    coins-=c;
    rateLvl++;
    rate=1+(rateLvl-1)*.25;

    save();
    updateUI();
};

ui.magnetBtn.onclick=()=>{
    const c=(magnetLvl+1)*100;
    if(coins<c) return;

    coins-=c;
    magnetLvl++;

    save();
    updateUI();
};

let drag=false;

renderer.domElement.addEventListener(
    'pointerdown',
    e=>{
        if(!started||paused||gameOver) return;

        drag=true;

        renderer.domElement.setPointerCapture?.(
            e.pointerId
        );

        move(e.clientX);
    }
);

renderer.domElement.addEventListener(
    'pointermove',
    e=>{
        if(drag) move(e.clientX);
    }
);

renderer.domElement.addEventListener(
    'pointerup',
    ()=>drag=false
);

renderer.domElement.addEventListener(
    'pointercancel',
    ()=>drag=false
);

function move(x){
    const n=x/Math.max(
        1,
        innerWidth
    )*2-1;

    targetX=clamp(
        n*limitX*1.15,
        -limitX,
        limitX
    );
}

addEventListener(
    'keydown',
    e=>{
        if(
            ['Space','Escape','KeyP']
            .includes(e.code)
        ){
            e.preventDefault();
            ui.pauseBtn.click();
        }
    }
);

document.addEventListener(
    'contextmenu',
    e=>e.preventDefault()
);

function shoot(){
    spawnBullet(
        cannon.position.x-.39
    );

    spawnBullet(
        cannon.position.x+.39
    );

    for(const f of flashes){
        f.visible=true;
        f.material.opacity=1;
        f.scale.setScalar(
            rand(.8,1.2)
        );
    }

    recoil=.14;
    cannonGlow.intensity=4;
    shake=Math.min(
        .18,
        shake+.025
    );

    sound('shoot');
}

function update(dt,time){
    cannon.position.x+=(
        targetX-cannon.position.x
    )*Math.min(
        1,
        dt*15
    );

    recoil=Math.max(
        0,
        recoil-dt*3
    );

    barrels.position.y=.79-recoil;

    for(const f of flashes){
        if(!f.visible) continue;

        f.material.opacity-=dt*18;
        f.scale.multiplyScalar(.88);

        if(f.material.opacity<=0){
            f.visible=false;
            f.material.opacity=0;
        }
    }

    cannonGlow.intensity+=(
        1.2-cannonGlow.intensity
    )*Math.min(
        1,
        dt*9
    );

    for(let i=bullets.length-1;i>=0;i--){
        const b=bullets[i];

        b.position.y+=24*dt;
        b.userData.life-=dt;

        if(
            b.userData.life<=0 ||
            b.position.y>24
        ){
            scene.remove(b);
            bullets.splice(i,1);
            continue;
        }

        let hit=false;

        for(let j=rocks.length-1;j>=0;j--){
            const r=rocks[j];

            const dx=
                b.position.x-
                r.position.x;

            const dy=
                b.position.y-
                r.position.y;

            const rad=
                r.userData.size*.9;

            if(
                dx*dx+
                dy*dy<=
                rad*rad
            ){
                scene.remove(b);
                bullets.splice(i,1);

                hit=true;

                r.userData.hp-=power;

                score+=
                    power*
                    Math.max(
                        1,
                        combo
                    );

                combo=Math.min(
                    99,
                    combo+1
                );

                comboTime=1.15;

                shake=Math.min(
                    .28,
                    shake+.045
                );

                burst(
                    b.position.x,
                    b.position.y,
                    5
                );

                shock(
                    b.position.x,
                    b.position.y,
                    .55
                );

                sound('hit');

                if(r.userData.hp<=0){
                    coins+=
                        5+
                        Math.min(
                            level,
                            20
                        );

                    if(
                        r.userData.size>1 &&
                        level<18
                    ){
                        const s=
                            r.userData.size*.58;

                        const h=
                            Math.max(
                                6,
                                Math.floor(
                                    r.userData.maxHp*.36
                                )
                            );

                        spawnRock(
                            r.position.x-.42,
                            r.position.y+.15,
                            h,
                            s
                        );

                        spawnRock(
                            r.position.x+.42,
                            r.position.y+.15,
                            h,
                            s
                        );
                    }

                    spawnCoin(
                        r.position.x,
                        r.position.y+.15
                    );

                    burst(
                        r.position.x,
                        r.position.y,
                        14
                    );

                    shock(
                        r.position.x,
                        r.position.y,
                        1.2+
                        r.userData.size*.25
                    );

                    sound('coin');

                    scene.remove(r);
                    rocks.splice(j,1);
                }else{
                    r.userData.lab.material.map=
                        hpTex(r.userData.hp);

                    r.userData.lab.material.needsUpdate=true;
                }

                updateUI();
                break;
            }
        }

        if(hit) continue;
    }

    for(let i=rocks.length-1;i>=0;i--){
        const r=rocks[i];
        const d=r.userData;

        d.cool=Math.max(
            0,
            d.cool-dt
        );

        d.vy-=
            (16.5+level*.1)*
            dt;

        r.position.x+=
            d.vx*dt;

        r.position.y+=
            d.vy*dt;

        r.rotation.x+=
            d.sx*dt;

        r.rotation.y+=
            d.sy*dt;

        if(
            r.position.y-
            d.size<
            .43
        ){
            r.position.y=
                .43+
                d.size;

            d.vy=Math.max(
                4.2+
                Math.min(
                    1,
                    level*.04
                ),
                Math.abs(d.vy)*.66
            );

            d.vx*=.97;
        }

        if(
            Math.abs(
                r.position.x
            )>limitX
        ){
            r.position.x=
                Math.sign(
                    r.position.x
                )*
                limitX;

            d.vx*=-1;
        }

        const dx=
            r.position.x-
            cannon.position.x;

        const dy=
            r.position.y-
            .95;

        const rad=
            d.size+.72;

        if(
            dx*dx+
            dy*dy<
            rad*rad &&
            d.cool<=0
        ){
            d.cool=.78;

            hp-=20;
            combo=0;
            comboTime=0;

            d.vy=Math.max(
                d.vy,
                4.5
            );

            d.vx+=
                Math.sign(
                    dx||
                    rand(-1,1)
                )*
                1.8;

            shake=Math.min(
                .5,
                shake+.2
            );

            ui.damage.style.opacity=.55;

            setTimeout(
                ()=>ui.damage.style.opacity=0,
                80
            );

            sound('hit');
            updateUI();

            if(hp<=0)
                return finish();
        }
    }

    for(let i=coinsDrop.length-1;i>=0;i--){
        const c=coinsDrop[i];
        const d=c.userData;

        const dx=
            cannon.position.x-
            c.position.x;

        const dy=
            .95-
            c.position.y;

        const ds=
            dx*dx+
            dy*dy;

        const mr=
            1.8+
            magnetLvl*1.4;

        if(
            magnetLvl &&
            ds<mr*mr
        ){
            const p=
                Math.min(
                    1,
                    dt*
                    (8+
                    magnetLvl*1.4)
                );

            c.position.x+=
                dx*p;

            c.position.y+=
                dy*p;
        }else{
            d.vy-=
                9.5*
                dt;

            c.position.y+=
                d.vy*
                dt;

            if(
                c.position.y<
                .5
            ){
                c.position.y=.5;
                d.vy=0;
            }
        }

        c.rotation.z+=
            d.spin*dt;

        c.rotation.y+=
            d.spin*.42*dt;

        if(ds<1.25){
            coins+=5;
            score+=12;

            sound('coin');

            burst(
                c.position.x,
                c.position.y,
                6
            );

            scene.remove(c);
            coinsDrop.splice(i,1);

            updateUI();
        }
    }

    updateFx(dt);

    comboTime-=dt;

    if(
        comboTime<=0 &&
        combo
    ){
        combo=0;
        updateUI();
    }

    if(!rocks.length){
        waveTime+=dt;

        if(waveTime>.55){
            level++;
            waveSpawn();
        }
    }else{
        waveTime=0;
    }

    elapsed+=dt;
    saveTimer+=dt;

    if(saveTimer>2){
        save();
        saveTimer=0;
    }

    shake*=Math.max(
        0,
        1-dt*7
    );

    camera.position.x+=(
        cannon.position.x*.075+
        rand(-shake,shake)-
        camera.position.x
    )*
    Math.min(
        1,
        dt*5
    );

    camera.position.y+=(
        baseY+
        Math.sin(elapsed*.6)*.03+
        rand(
            -shake*.4,
            shake*.4
        )-
        camera.position.y
    )*
    Math.min(
        1,
        dt*3
    );

    camera.position.z+=(
        baseZ-
        camera.position.z
    )*
    Math.min(
        1,
        dt*3
    );

    camera.lookAt(
        cannon.position.x*.025,
        lookY,
        0
    );

    arenaLight.intensity=
        1.9+
        Math.sin(elapsed*2)*.25;

    if(
        time-lastShot>=
        1000/(rate*4)
    ){
        shoot();
        lastShot=time;
    }
}

function loop(time){
    requestAnimationFrame(loop);

    const dt=Math.min(
        .033,
        (time-lastFrame)/1000||0
    );

    lastFrame=time;

    if(
        started &&
        !paused &&
        !gameOver
    ){
        update(dt,time);
    }else{
        updateFx(dt);
    }

    renderer.render(
        scene,
        camera
    );
}

loop(performance.now());
});