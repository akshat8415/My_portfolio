import './style.css';
import * as THREE from 'three';
import gsap from 'gsap';
import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';


//particals 
// --- PARTICLE CANVAS SETUP ---
const PARTICLE_CANVAS_SIZE = 1024;
const particleCanvas = document.createElement('canvas');
particleCanvas.width = PARTICLE_CANVAS_SIZE;
particleCanvas.height = PARTICLE_CANVAS_SIZE;
const particleCtx = particleCanvas.getContext('2d');

const NUM_PARTICLES = 200;
const particles = [];
for (let i = 0; i < NUM_PARTICLES; i++) {
  particles.push({
    x: Math.random() * PARTICLE_CANVAS_SIZE,
    y: Math.random() * PARTICLE_CANVAS_SIZE,
    vx: (Math.random() - 0.5) * 1.2,
    vy: (Math.random() - 0.5) * 1.2,
    radius: 0.6 + Math.random() * 0.6,
  });
}

function drawParticles() {
  particleCtx.clearRect(0, 0, PARTICLE_CANVAS_SIZE, PARTICLE_CANVAS_SIZE);
  // Add this for a nice gradient background
  let grad = particleCtx.createLinearGradient(0, 0, 0, PARTICLE_CANVAS_SIZE);
  grad.addColorStop(0, "#001f3f");   // Navy blue
  grad.addColorStop(0.5, "#0074D9"); // Bright blue
  grad.addColorStop(1, "#00c0ff");
  particleCtx.fillStyle = grad;
  particleCtx.fillRect(0, 0, PARTICLE_CANVAS_SIZE, PARTICLE_CANVAS_SIZE)
  // Draw particles
  for (const p of particles) {
    particleCtx.beginPath();
    particleCtx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI);
    particleCtx.fillStyle = '#ffffff';
    particleCtx.globalAlpha = 0.7;
    particleCtx.fill();
    particleCtx.globalAlpha = 1.0;
  }

  // Draw lines between close particles
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const dx = particles[i].x - particles[j].x;
      const dy = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) {
        particleCtx.beginPath();
        particleCtx.moveTo(particles[i].x, particles[i].y);
        particleCtx.lineTo(particles[j].x, particles[j].y);
        particleCtx.strokeStyle = 'rgba(255,255,255,0.2)';
        particleCtx.stroke();
      }
    }
  }

  // Move particles
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    if (p.x < 0 || p.x > PARTICLE_CANVAS_SIZE) p.vx *= -1;
    if (p.y < 0 || p.y > PARTICLE_CANVAS_SIZE) p.vy *= -1;
  }
}

const wallParticleTexture = new THREE.CanvasTexture(particleCanvas);
wallParticleTexture.wrapS = THREE.ClampToEdgeWrapping;
wallParticleTexture.wrapT = THREE.ClampToEdgeWrapping;
wallParticleTexture.minFilter = THREE.LinearFilter;
// --- END PARTICLE CANVAS SETUP ---

// VARIABLES
let theme = 'light';
let bookCover = null;
let lightSwitch = null;
let titleText = null;
let subtitleText = null;
let mixer;
let isMobile = window.matchMedia('(max-width: 992px)').matches;
let canvas = document.querySelector('.experience-canvas');
const loaderWrapper = document.getElementById('loader-wrapper');
let clipNames = [
  'fan_rotation',
  'fan_rotation.001',
  'fan_rotation.002',
  'fan_rotation.003',
  'fan_rotation.004',
];
let projects = [
  {
    image: 'textures/CPDA-CERTIFICATE.png',
    url : 'https://drive.google.com/file/d/1u3bKzoCHs79pRz9iZ2yhqLICt_B4f6Bv/view?usp=drive_link',
    description: 'CPDA-CERTIFICATE',
  },
  {
    image : 'textures/real_time_object_detection.png',
    url : 'https://github.com/akshat8415/real_time_object_detection_using_python'
    ,description : 'Real Time Object Detection ',
  },
  {
    image : 'textures/socialmedia_engagement_tool.png',
    url : 'https://github.com/akshat8415/socialmedia_analyzer/tree/main'
    ,description : 'Social Media Engagement Tool ',
  },
  {
    image : 'textures/AdptiveEcho_voiceClone_agent.png',
    url : 'https://github.com/akshat8415/voiceclone-gpt-agent'
    ,description : 'Voice Clone intelligent Agent ',
  },
  {
    image: 'textures/cargoViz-website.png',
    description : 'CargoViz Website',
    
  
  },
  
  
];
let aboutCameraPos = {
  x: 0.12,
  y: 0.2,
  z: 0.55,
};
let aboutCameraRot = {
  x: -1.54,
  y: 0.13,
  z: 1.41,
};
let projectsCameraPos = {
  x: 1,
  y: 0.45,
  z: 0.01,
};
let projectsCameraRot = {
  x: 0.05,
  y: 0.05,
  z: 0,
};

// SCENE & CAMERA
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.01,
  1000
);
let defaultCameraPos = {
  x: 1.009028643133046,
  y: 0.5463638814987481,
  z: 0.4983449671971262,
};
let defaultCamerRot = {
  x: -0.8313297556598935,
  y: 0.9383399492446749,
  z: 0.7240714481613063,
};
camera.position.set(defaultCameraPos.x, defaultCameraPos.y, defaultCameraPos.z);

// RENDERER
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
// controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 0.9;
controls.maxDistance = 1.6;
controls.minAzimuthAngle = 0.2;
controls.maxAzimuthAngle = Math.PI * 0.78;
controls.minPolarAngle = 0.3;
controls.maxPolarAngle = Math.PI / 2;
controls.update();

// LOAD MODEL & ASSET
// const loadingManager = new THREE.LoadingManager();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('draco/');
const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);
gltfLoader.load(
  'models/room.glb',
  function (room) {
    // set up room
    room.scene.children.forEach((child) => {
      if (child.name === 'Wall') {
        // Use animated particle texture instead of static image
        child.material = new THREE.MeshStandardMaterial({
          map: wallParticleTexture,
          side: THREE.DoubleSide,
        });
      }
    
      // ... your existing code for shadows, etc ...
      if (child.name !== 'Wall') {
        child.castShadow = true;
      }
      child.receiveShadow = true;
    });
    // hide loader on loade
    loaderWrapper.style.display = 'none';
    gltfLoader.load(
      'models/low_poly_rigid_chair.glb',
      function (gltf) {
        const chair = gltf.scene;
    
        // Debug-friendly scale and position
        chair.scale.set(0.20, 0.20, 0.20); // Adjusted from 0.08

        // Place it just in front of the table
        chair.position.set(0.55, -0.260 , 0.75);    // center of the room (adjust if needed)
        chair.rotation.y = Math.PI + 7;     // face forward (you can tweak as needed)
    
        chair.traverse((node) => {
          if (node.isMesh) {
            node.castShadow = true;
            node.receiveShadow = true;
          }
        });
    
        scene.add(chair);
      },
      undefined,
      function (error) {
        console.error('Error loading chair model:', error);
      }
    );
        // load video
    const video = document.createElement('video');
    video.src = 'textures/zoro.mp4';
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.loop = true;

    // create video texture
    const videoTexture = new THREE.VideoTexture(video);
    videoTexture.minFilter = THREE.NearestFilter;
    videoTexture.magFilter = THREE.NearestFilter;
    videoTexture.generateMipmaps = false;
    videoTexture.encoding = THREE.sRGBEncoding;

    room.scene.children.forEach((child) => {
      // disable shadow by wall
      if (child.name !== 'Wall') {
        child.castShadow = true;
      }
      child.receiveShadow = true;

      if (child.children) {
        child.children.forEach((innerChild) => {
          // disable shadow by book cover & switch btn
          if (innerChild.name !== 'Book001' && innerChild.name !== 'Switch') {
            innerChild.castShadow = true;
          }

          // add texture to book cover
          if(innerChild.name === 'Book001') {
            const bookCoverTexture = new THREE.TextureLoader().load(
              'textures/book-cover.jpg'
            );
            bookCoverTexture.flipY = false;
            innerChild.material = new THREE.MeshStandardMaterial({
              side: THREE.DoubleSide,
              color: 0xffffff,
              map: bookCoverTexture,
            });
          }

          innerChild.receiveShadow = true;
        });
      }

      if (child.name === 'Stand') {
        child.children[0].material = new THREE.MeshBasicMaterial({
          map: videoTexture,
        });
        video.play();
      }

      // transparent texture for glass
      if (child.name === 'CPU') {
        child.children[0].material = new THREE.MeshPhysicalMaterial();
        child.children[0].material.roughness = 0;
        child.children[0].material.color.set(0x999999);
        child.children[0].material.ior = 3;
        child.children[0].material.transmission = 2;
        child.children[0].material.opacity = 0.8;
        child.children[0].material.depthWrite = false;
        child.children[0].material.depthTest = false;
        child.children[1].material = new THREE.MeshPhysicalMaterial();
        child.children[1].material.roughness = 0;
        child.children[1].material.color.set(0x999999);
        child.children[1].material.ior = 3;
        child.children[1].material.transmission = 1;
        child.children[1].material.opacity = 0.8;
        child.children[1].material.depthWrite = false;
        child.children[1].material.depthTest = false;
      }

      if (child.name === 'Book') {
        bookCover = child.children[0];

        // adding texture to book
        const bookTexture = new THREE.TextureLoader().load(
          'textures/book-inner.png'
        );
        bookTexture.flipY = false;
        child.material = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          map: bookTexture,
        });
      }

      if (child.name === 'SwitchBoard') {
        lightSwitch = child.children[0];
      }
    });
    scene.add(room.scene);
    animate();

    // add animation
    mixer = new THREE.AnimationMixer(room.scene);
    const clips = room.animations;
    clipNames.forEach((clipName) => {
      const clip = THREE.AnimationClip.findByName(clips, clipName);
      if (clip) {
        const action = mixer.clipAction(clip);
        action.play();
      }
    });

    loadIntroText();

    // add event listeners
    logoListener();
    aboutMenuListener();
    projectsMenuListener();
    init3DWorldClickListeners();
    initResponsive(room.scene);
  },
  function (error) {
    console.error(error);
  }
);

// ADD LIGHT
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);
const roomLight = new THREE.PointLight(0xffffff, 2.5, 10);
roomLight.position.set(0.3, 2, 0.5);
roomLight.castShadow = true;
roomLight.shadow.radius = 5;
roomLight.shadow.mapSize.width = 2048;
roomLight.shadow.mapSize.height = 2048;
roomLight.shadow.camera.far = 2.5;
// roomLight.shadow.camera.fov = 100;
roomLight.shadow.bias = -0.002;
scene.add(roomLight);
// add light for pc fans
const fanLight1 = new THREE.PointLight(0xff0000, 30, 0.2);
const fanLight2 = new THREE.PointLight(0x00ff00, 30, 0.12);
const fanLight3 = new THREE.PointLight(0x00ff00, 30, 0.2);
const fanLight4 = new THREE.PointLight(0x00ff00, 30, 0.2);
const fanLight5 = new THREE.PointLight(0x00ff00, 30, 0.05);
fanLight1.position.set(0, 0.29, -0.29);
fanLight2.position.set(-0.15, 0.29, -0.29);
fanLight3.position.set(0.21, 0.29, -0.29);
fanLight4.position.set(0.21, 0.19, -0.29);
fanLight5.position.set(0.21, 0.08, -0.29);
scene.add(fanLight1);
scene.add(fanLight2);
scene.add(fanLight3);
scene.add(fanLight4);
scene.add(fanLight5);
// add point light for text on wall
const pointLight1 = new THREE.PointLight(0xff0000, 0, 1.1);
const pointLight2 = new THREE.PointLight(0xff0000, 0, 1.1);
const pointLight3 = new THREE.PointLight(0xff0000, 0, 1.1);
const pointLight4 = new THREE.PointLight(0xff0000, 0, 1.1);
pointLight1.position.set(-0.2, 0.6, 0.24);
pointLight2.position.set(-0.2, 0.6, 0.42);
pointLight3.position.set(-0.2, 0.6, 0.01);
pointLight4.position.set(-0.2, 0.6, -0.14);
scene.add(pointLight1);
scene.add(pointLight2);
scene.add(pointLight3);
scene.add(pointLight4);
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);

  // --- PARTICLE ANIMATION UPDATE ---
  drawParticles();
  wallParticleTexture.needsUpdate = true;
  // --- END PARTICLE ANIMATION UPDATE ---

  // controls.update();
  if (mixer) {
    mixer.update(clock.getDelta());
  }
  renderer.render(scene, camera);
  // stats.update();
}

function loadIntroText() {
  const loader = new FontLoader();
  loader.load('fonts/unione.json', function (font) {
    const textMaterials = [
      new THREE.MeshPhongMaterial({ color: 0x171f27, flatShading: true }),
      new THREE.MeshPhongMaterial({ color: 0xffffff }),
    ];
    const titleGeo = new TextGeometry('Akshat Mathur', {
      font: font,
      size: 0.08,
      height: 0.01,
    });
    titleText = new THREE.Mesh(titleGeo, textMaterials);
    titleText.rotation.y = Math.PI * 0.5;
    titleText.position.set(-0.27, 0.55, 0.5);
    scene.add(titleText);
  });

  loader.load('fonts/helvatica.json', function (font) {
    const textMaterials = [
      new THREE.MeshPhongMaterial({ color: 0x171f27, flatShading: true }),
      new THREE.MeshPhongMaterial({ color: 0xffffff }),
    ];
    const subTitleGeo = new TextGeometry(
      'python developer , full stack developer , ai/ml developer',
      {
        font: font,
        size: 0.018,
        height: 0,
      }
    );
    subtitleText = new THREE.Mesh(subTitleGeo, textMaterials);
    subtitleText.rotation.y = Math.PI * 0.5;
    subtitleText.position.set(-0.255, 0.5, 0.5);
    scene.add(subtitleText);
  });

  loader.load('fonts/helvatica.json', function (font) {
    const textMaterials = [
      new THREE.MeshPhongMaterial({ color: 0x171f27, flatShading: true }),
      new THREE.MeshPhongMaterial({ color: 0xffffff }),
    ];
    const emailGeo = new TextGeometry(
      'akshatmathur99@gmail.com',
      {
        font: font,
        size: 0.018,
        height: 0,
      }
    );
    const emailText = new THREE.Mesh(emailGeo, textMaterials);
    emailText.rotation.y = Math.PI * 0.5;
    emailText.position.set(-0.255, 0.46, 0.5);
    scene.add(emailText);
  });
}

function switchTheme(themeType) {
  const DURATION = 0.8; // seconds, adjust for faster/slower transition

  if (themeType === 'dark') {
    lightSwitch.rotation.z = Math.PI / 7;
    document.body.classList.remove('light-theme');
    document.body.classList.add('dark-theme');

    // main lights
    gsap.to(roomLight.color, {
      r: 0.2725,
      g: 0.2314,
      b: 0.6863,
      duration: DURATION,
      overwrite: true
    });
    gsap.to(ambientLight.color, {
      r: 0.1725,
      g: 0.2314,
      b: 0.6863,
      duration: DURATION,
      overwrite: true
    });
    gsap.to(roomLight, {
      intensity: 0.6,
      duration: DURATION,
      overwrite: true
    });
    gsap.to(ambientLight, {
      intensity: 0.05,
      duration: DURATION,
      overwrite: true
    });

    // fan lights
    gsap.to(fanLight5, {
      distance: 1.0,
      duration: DURATION,
      overwrite: true
    });

    // text color (use values in [0,1] for Three.js)
    gsap.to(titleText.material[0].color, {
      r: 1, g: 1, b: 1, duration: DURATION, overwrite: true
    });
    gsap.to(titleText.material[1].color, {
      r: 0.6, g: 0.6, b: 0.6, duration: DURATION, overwrite: true
    });
    gsap.to(subtitleText.material[0].color, {
      r: 0.8, g: 0.8, b: 0.8, duration: DURATION, overwrite: true
    });
    gsap.to(subtitleText.material[1].color, {
      r: 0.8, g: 0.8, b: 0.8, duration: DURATION, overwrite: true
    });

    // text light
    [pointLight1, pointLight2, pointLight3, pointLight4].forEach(light => {
      gsap.to(light, { intensity: 0.6, duration: DURATION, overwrite: true });
    });

  } else {
    lightSwitch.rotation.z = 0;
    document.body.classList.remove('dark-theme');
    document.body.classList.add('light-theme');

    // main lights
    gsap.to(roomLight.color, {
      r: 1, g: 1, b: 1,
      duration: DURATION,
      overwrite: true
    });
    gsap.to(ambientLight.color, {
      r: 1, g: 1, b: 1,
      duration: DURATION,
      overwrite: true
    });
    gsap.to(roomLight, {
      intensity: 2.5,
      duration: DURATION,
      overwrite: true
    });
    gsap.to(ambientLight, {
      intensity: 0.6,
      duration: DURATION,
      overwrite: true
    });

    // fan light
    gsap.to(fanLight5, {
      distance: 0.05,
      duration: DURATION,
      overwrite: true
    });

    // text color (use values in [0,1] for Three.js)
    gsap.to(titleText.material[0].color, {
      r: 0.09, g: 0.12, b: 0.15, duration: DURATION, overwrite: true
    });
    gsap.to(titleText.material[1].color, {
      r: 1, g: 1, b: 1, duration: DURATION, overwrite: true
    });
    gsap.to(subtitleText.material[0].color, {
      r: 0.09, g: 0.12, b: 0.15, duration: DURATION, overwrite: true
    });
    gsap.to(subtitleText.material[1].color, {
      r: 1, g: 1, b: 1, duration: DURATION, overwrite: true
    });

    // text light
    [pointLight1, pointLight2, pointLight3, pointLight4].forEach(light => {
      gsap.to(light, { intensity: 0, duration: DURATION, overwrite: true });
    });
  }
}


function enableOrbitControls() {
  controls.enabled = true;
}

function disableOrbitControls() {
  controls.enabled = false;
}

function enableCloseBtn() {
  document.getElementById('close-btn').style.display = 'block';
}

function disableCloseBtn() {
  document.getElementById('close-btn').style.display = 'none';
}

function resetBookCover() {
  if (!bookCover) return;

  gsap.to(bookCover.rotation, {
    x: 0,
    duration: 1.5,
  });
}

function resetProjects() {
  if (projects.length === 0) return;

  projects.forEach((project, i) => {
    gsap.to(project.mesh.material, {
      opacity: 0,
      duration: 1,
    });
    gsap.to(project.mesh.position, {
      y: project.y,
      duration: 1,
    });
    gsap.to(project.mesh.scale, {
      x: 0,
      y: 0,
      z: 0,
      duration: 0,
      delay: 1,
    });
  });
}

function resetCamera() {
  resetBookCover();
  resetProjects();
  disableCloseBtn();
  gsap.to(camera.position, {
    ...defaultCameraPos,
    duration: 1.5,
  });
  gsap.to(camera.rotation, {
    ...defaultCamerRot,
    duration: 1.5,
  });
  gsap.delayedCall(1.5, enableOrbitControls);

  // reset dimmed light for about display
  if (theme !== 'dark') {
    gsap.to(roomLight, {
      intensity: 1.6,
      duration: 1.5,
    });
  }
}

function logoListener() {
  document.getElementById('logo').addEventListener('click', function (e) {
    e.preventDefault();
    resetCamera();
  });
}

function cameraToAbout() {
  if (!bookCover) return;

  gsap.to(camera.position, {
    ...aboutCameraPos,
    duration: 1.5,
  });
  gsap.to(camera.rotation, {
    ...aboutCameraRot,
    duration: 1.5,
  });
  gsap.to(bookCover.rotation, {
    x: Math.PI,
    duration: 1.5,
    delay: 1.5,
  });

  // prevent about text clutter due to bright light
  if (theme !== 'dark') {
    gsap.to(roomLight, {
      intensity: 1,
      duration: 1.5,
    });
  }
}

function aboutMenuListener() {
  document.getElementById('about-menu').addEventListener('click', function (e) {
    e.preventDefault();
    disableOrbitControls();
    resetProjects();
    cameraToAbout();
    gsap.delayedCall(1.5, enableCloseBtn);
  });
}

function projectsMenuListener() {
  // Remove old project planes and descriptions if needed
  projects.forEach((project) => {
    if (project.mesh) {
      scene.remove(project.mesh);
    }
    if (project.descMesh) {
      scene.remove(project.descMesh);
    }
  });

  // Grid layout
  const numCols = 3; // Change to 4 if you want more columns
  const xStart = 0.3; // X offset start
  const yStart = 1;   // Y offset start
  const xSpacing = 0.8;
  const ySpacing = 0.55;

  // Load font for descriptions ONCE
  const fontLoader = new FontLoader();
  fontLoader.load('fonts/helvatica.json', function (font) {
    projects.forEach((project, i) => {
      // --- Project Plane ---
      const colIndex = i % numCols;
      const rowIndex = Math.floor(i / numCols);
      const geometry = new THREE.PlaneGeometry(0.71, 0.4);
      const material = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        map: new THREE.TextureLoader().load(project.image),
        transparent: true,
        opacity: 0.0,
      });
      const projectPlane = new THREE.Mesh(geometry, material);
      projectPlane.name = 'project';
      projectPlane.userData = { url: project.url };
      projectPlane.position.set(
        xStart + colIndex * xSpacing,
        yStart - rowIndex * ySpacing,
        -1.15
      );
      projectPlane.scale.set(0, 0, 0);
      projects[i].mesh = projectPlane;
      projects[i].y = yStart - rowIndex * ySpacing;
      scene.add(projectPlane);

      // --- Description Text ---
      if (project.description) {
        const descGeo = new TextGeometry(project.description, {
          font: font,
          size: 0.035,
          height: 0.001,
        });
        const descMaterial = new THREE.MeshBasicMaterial({ color: 0x333333 });
        const descMesh = new THREE.Mesh(descGeo, descMaterial);
        // Position below the project plane
        descMesh.position.set(
          projectPlane.position.x - 0.32, // Adjust for centering
          projectPlane.position.y - 0.27, // Below the image
          projectPlane.position.z
        );
        descMesh.scale.set(1, 1, 1);
        projects[i].descMesh = descMesh;
        scene.add(descMesh);
      }
    });
  });

  // Projects menu click event
  document
    .getElementById('projects-menu')
    .addEventListener('click', function (e) {
      e.preventDefault();
      disableOrbitControls();
      resetBookCover();
      gsap.to(camera.position, {
        ...projectsCameraPos,
        duration: 1.5,
      });
      gsap.to(camera.rotation, {
        ...projectsCameraRot,
        duration: 1.5,
      });
      gsap.delayedCall(1.5, enableCloseBtn);

      // Animate & show project items
      projects.forEach((project, i) => {
        if (project.mesh) {
          project.mesh.scale.set(1, 1, 1);
          gsap.to(project.mesh.material, {
            opacity: 1,
            duration: 1.5,
            delay: 1.5 + i * 0.1,
          });
          gsap.to(project.mesh.position, {
            y: project.y + 0.05,
            duration: 1,
            delay: 1.5 + i * 0.1,
          });
        }
        if (project.descMesh) {
          project.descMesh.visible = true;
        }
      });
    });
}

function init3DWorldClickListeners() {
  const mousePosition = new THREE.Vector2();
  const raycaster = new THREE.Raycaster();
  let intersects;

  window.addEventListener('click', function (e) {
    // store value set to prevent multi time update in foreach loop
    const newTheme = theme === 'light' ? 'dark' : 'light';

    // prevent about focus on button click which are positioned above book in mobile view
    const closeBtn = document.getElementById('close-btn');
    const projectsBtn = document.getElementById('projects-menu');
    if (
      e.target === closeBtn ||
      closeBtn.contains(e.target) ||
      e.target === projectsBtn ||
      projectsBtn.contains(e.target)
    ) {
      return false;
    }

    mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
    mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mousePosition, camera);
    intersects = raycaster.intersectObjects(scene.children);
    intersects.forEach((intersect) => {
      if (intersect.object.name === 'project') {
        intersect.object.userData.url &&
          window.open(intersect.object.userData.url);
      }

      if (
        intersect.object.name === 'Book' ||
        intersect.object.name === 'Book001'
      ) {
        disableOrbitControls();
        cameraToAbout();
        gsap.delayedCall(1.5, enableCloseBtn);
      }

      if (
        intersect.object.name === 'SwitchBoard' ||
        intersect.object.name === 'Switch'
      ) {
        theme = newTheme;
        switchTheme(theme);
      }
    });
  });
}

// RESPONSIVE
function initResponsive(roomScene) {
  if (isMobile) {
    roomScene.scale.set(0.95, 0.95, 0.95);
    aboutCameraPos = {
      x: 0.09,
      y: 0.23,
      z: 0.51,
    };
    aboutCameraRot = {
      x: -1.57,
      y: 0,
      z: 1.57,
    };

 
    // project
    projectsCameraPos = {
      x: 1.1,
      y: 0.82,
      z: 0.5,
    };
    projectsCameraRot = {
      x: 0,
      y: 0,
      z: 1.55,
    };
    projects.forEach((project, i) => {
      project.mesh.position.z = -1.13;
    });

    controls.maxDistance = 1.5;
    controls.maxAzimuthAngle = Math.PI * 0.75;
  }
}

// close button
document.getElementById('close-btn').addEventListener('click', (e) => {
  e.preventDefault();
  resetCamera();
});

// contact menu
document.getElementById('contact-btn').addEventListener('click', (e) => {
  e.preventDefault();
  document
    .querySelector('.contact-menu__dropdown')
    .classList.toggle('contact-menu__dropdown--open');
});

document.addEventListener('mouseup', (e) => {
  const container = document.querySelector('.contact-menu');
  if (!container.contains(e.target)) {
    container
      .querySelector('.contact-menu__dropdown')
      .classList.remove('contact-menu__dropdown--open');
  }
});

// update camera, renderer on resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
