import * as THREE from "three";
// import * as THREE from "https://cdnjs.cloudflare.com/ajax/libs/three.js/0.164.1/three.module.js";
import { GLTFLoader } from "./jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "./jsm/Addons.js";
// import earthTexture from "./assets/earth.jpg";
const earthTexture = new Image();
earthTexture.src = "./assets/earth.jpg";
const sunTexture = new Image();
sunTexture.src = "./assets/sun.jpg";

// import sunTexture from "./assets/sun.jpg";
import { FontLoader } from "./jsm/loaders/FontLoader.js";
import { TextGeometry } from "../jsm/geometries/TextGeometry.js";
import { EffectComposer } from "../jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "../jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "../jsm/postprocessing/UnrealBloomPass.js";
const container = document.createElement("div");
document.body.appendChild(container);
const earthGroup = new THREE.Group();
const rocketGroup = new THREE.Group();
const moonGroup = new THREE.Group();
const ufoGroup = new THREE.Group();
const scene2 = new THREE.Scene();
const fontLoader = new FontLoader();
const camera2 = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  1000
);

const canvas = document.querySelector(".webgl");
const renderer2 = new THREE.WebGLRenderer({ canvas });

renderer2.outputColorSpace = THREE.SRGBColorSpace;
renderer2.setSize(window.innerWidth, window.innerHeight);
renderer2.setClearColor(0x000000);
renderer2.setPixelRatio(window.devicePixelRatio);
renderer2.shadowMap.enabled = true; // 启用阴影映射
renderer2.shadowMap.type = THREE.PCFSoftShadowMap;

fontLoader.load(
  "../assets/Frutiger LT Pro 55 Roman_Italic.json",
  // onLoad回调
  (font) => {
    const textGeometry = new TextGeometry("NATIONAL" + " SPACE " + "DAY ", {
      font,
      size: 6,
      depth: 2,
      curveSegments: 20,
      bevelEnabled: true,
      bevelThickness: 0.03,
      bevelSize: 0.02,
      bevelOffset: 0,
      bevelSegments: 5,
    });
    textGeometry.center();

    const textMaterial = new THREE.MeshStandardMaterial({
      color: "#fc6703",
      emissive: "#fc6703",
      emissiveIntensity: 9,
      transparent: true, // Enable transparency
      opacity: 0, // Start with 0 opacity
    });

    const text = new THREE.Mesh(textGeometry, textMaterial);
    const cameraDirection = new THREE.Vector3();
    camera2.getWorldDirection(cameraDirection);
    text.position
      .copy(camera2.position)
      .add(cameraDirection.multiplyScalar(85));
    text.lookAt(camera2.position);
    const positionAttribute = textGeometry.attributes.position;
    const vertex = new THREE.Vector3();
    const curveAmount = 0.05;
    for (let i = 0; i < positionAttribute.count; i++) {
      vertex.fromBufferAttribute(positionAttribute, i);
      const x = vertex.x;
      const angle = x * curveAmount;
      vertex.z += Math.cos(angle) * 6;

      positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }

    textGeometry.attributes.position.needsUpdate = true;
    scene2.add(text);

    const renderScene = new RenderPass(scene2, camera2);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1,
      1,
      0.1
    );
    bloomPass.threshold = 1;
    bloomPass.strength = 0.165; //intensity of glow
    bloomPass.radius = 0.2;
    const bloomComposer = new EffectComposer(renderer2);

    bloomComposer.setSize(window.innerWidth, window.innerHeight);
    bloomComposer.renderToScreen = true;
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);

    let fadeInDuration = 3700; // Duration of fade-in in milliseconds
    let startTime = performance.now();

    function animate3() {
      requestAnimationFrame(animate3);
      bloomComposer.render();

      // Calculate elapsed time
      let elapsedTime = performance.now() - startTime;
      if (elapsedTime < fadeInDuration) {
        // Update opacity based on elapsed time
        textMaterial.opacity = elapsedTime / fadeInDuration;
      } else {
        textMaterial.opacity = 1; // Ensure opacity is set to 1 after fade-in
      }
    }
    animate3();
  }
);

window.addEventListener("resize", function () {
  camera2.aspect = window.innerWidth / window.innerHeight;
  camera2.updateProjectionMatrix();
  renderer2.setSize(window.innerWidth, window.innerHeight);
});

document.body.appendChild(renderer2.domElement);

const textureLoader = new THREE.TextureLoader();

const earthGeo = new THREE.SphereGeometry(18, 30, 30);
const earthMat = new THREE.MeshStandardMaterial({
  map: textureLoader.load("./assets/earth.jpg"),
});
const earth = new THREE.Mesh(earthGeo, earthMat);
earth.castShadow = true;
earthGroup.add(earth);
const sunGeo = new THREE.SphereGeometry(250, 30, 30);
const sunMat = new THREE.MeshStandardMaterial({
  map: textureLoader.load("./assets/sun.jpg"),
});
const sun = new THREE.Mesh(sunGeo, sunMat);
sun.castShadow = true;
sun.position.set(-400, 250, 250);
scene2.add(sun);

const loader = new GLTFLoader();
loader.load("../assets/ufo/scene.gltf", function (gltf) {
  let ufo = gltf.scene;
  ufo.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  ufo.position.set(100, 0, 0);

  const scale = 0.04; // 放大倍数
  ufo.scale.set(scale, scale, scale);
  ufoGroup.add(ufo);
});
loader.load("../assets/rocket/scene.gltf", function (gltf) {
  let rocket = gltf.scene;
  rocket.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  rocket.position.set(0, 46, 0);

  const scale = 5.8; // 放大倍数
  rocket.scale.set(scale, scale, scale);
  rocketGroup.add(rocket);
});

loader.load("../assets/meteorite/scene.gltf", function (gltf) {
  let meteorite = gltf.scene;
  meteorite.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  const scale = 60; // 放大倍数
  meteorite.scale.set(scale, scale, scale);

  const numberOfMeteorites = 6; // 需要的 meteorite 数量
  const positions = [
    { x: 0, y: 50, z: -200 },
    { x: 150, y: 90, z: 50 },
    { x: -100, y: 90, z: -50 },
    { x: 250, y: -200, z: -100 },
    { x: -70, y: -10, z: -10 },
    { x: -200, y: 60, z: -50 },
  ];

  const rotationSpeeds = [
    { x: 0.001, y: 0.002, z: 0.001 },
    { x: 0.002, y: 0.001, z: 0.002 },
    { x: 0.003, y: 0.003, z: 0.001 },
    { x: 0.001, y: 0.006, z: 0.002 },
    { x: 0.002, y: 0.002, z: 0.003 },
    { x: 0.003, y: 0.001, z: 0.004 },
  ];

  const scales = [150, 230, 140, 200, 45, 30]; // 每个 meteorite 的放大倍数

  for (let i = 0; i < numberOfMeteorites; i++) {
    let newMeteorite = meteorite.clone();
    newMeteorite.position.set(positions[i].x, positions[i].y, positions[i].z);
    newMeteorite.rotationSpeed = rotationSpeeds[i]; // 设置旋转速度

    const scale = scales[i]; // 取得相应的放大倍数
    newMeteorite.scale.set(scale, scale, scale); // 设置放大倍数

    newMeteorite.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    scene2.add(newMeteorite);
  }
});

loader.load("../assets/meteorite2/scene.gltf", function (gltf) {
  let meteorite2 = gltf.scene;
  meteorite2.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  const scale = 100; // 放大倍数
  meteorite2.scale.set(scale, scale, scale);

  const numberOfMeteorites = 8; // 需要的 meteorite 数量
  const positions = [
    { x: 50, y: 200, z: 120 },
    { x: 10, y: -100, z: 70 },
    { x: -70, y: -90, z: -50 },
    { x: 50, y: -50, z: -100 },
    { x: -70, y: -100, z: 70 },
    { x: 150, y: -50, z: 50 },
    { x: -100, y: 160, z: 50 },
    { x: 150, y: 200, z: -50 },
  ];

  const rotationSpeeds = [
    { x: 0.003, y: 0.002, z: 0.001 },
    { x: 0.002, y: 0.001, z: 0.002 },
    { x: 0.003, y: 0.003, z: 0.001 },
    { x: 0.001, y: 0.01, z: 0.005 },
    { x: 0.003, y: 0.003, z: 0.002 },
    { x: 0.0025, y: 0.002, z: 0.004 },
    { x: 0.001, y: 0.004, z: 0.001 },
    { x: 0.003, y: 0.006, z: 0.004 },
  ];

  const scales = [150, 130, 140, 50, 105, 165, 140, 20]; // 每个 meteorite 的放大倍数

  for (let i = 0; i < numberOfMeteorites; i++) {
    let newMeteorite = meteorite2.clone();
    newMeteorite.position.set(positions[i].x, positions[i].y, positions[i].z);
    newMeteorite.rotationSpeed = rotationSpeeds[i]; // 设置旋转速度

    const scale = scales[i]; // 取得相应的放大倍数
    newMeteorite.scale.set(scale, scale, scale); // 设置放大倍数

    newMeteorite.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    scene2.add(newMeteorite);
  }
});

function animate4() {
  requestAnimationFrame(animate4);

  scene2.traverse((object) => {
    if (object.isMesh || object.rotationSpeed) {
      if (object.rotationSpeed) {
        object.rotation.x += object.rotationSpeed.x;
        object.rotation.y += object.rotationSpeed.y;
        object.rotation.z += object.rotationSpeed.z;
      }
    }
  });

  renderer2.render(scene2, camera2);
}

animate4();

loader.load("../assets/moon/scene.gltf", function (gltf) {
  let moon = gltf.scene;
  moon.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  moon.position.set(80, 0, 0);
  const scale = 1.65; // 放大倍数
  moon.scale.set(scale, scale, scale);
  moonGroup.add(moon);
});

earthGroup.add(rocketGroup);
earthGroup.add(moonGroup);
scene2.add(ufoGroup);
scene2.add(earthGroup);

const controls = new OrbitControls(camera2, renderer2.domElement);
controls.enableZoom = false;
camera2.position.set(-45, 70, 70);

controls.update();

function animate() {
  rocketGroup.rotation.z += 0.0035; // 火箭绕地球旋转的速度
  moonGroup.rotation.x += 0.0005; // 月亮绕地球旋转的速度
  earthGroup.rotation.z += 0.001;
  sun.rotation.x -= 0.0006;
  ufoGroup.rotation.y -= 0.007;
  renderer2.render(scene2, camera2);
}
renderer2.setAnimationLoop(animate);

// 创建一个 BufferGeometry
let starGeo = new THREE.BufferGeometry();

// 定义顶点数组和属性
const vertices = [];
const velocities = [];
const accelerations = [];

for (let i = 0; i < 8000; i++) {
  // 随机生成星星的位置
  vertices.push(
    Math.random() * 600 - 300,
    Math.random() * 600 - 300,
    Math.random() * 600 - 300
  );

  // 设置初始速度和加速度
  velocities.push(0);
  accelerations.push(0.002);
}

// 将顶点数据设置到 BufferGeometry 中
starGeo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
starGeo.setAttribute(
  "velocity",
  new THREE.Float32BufferAttribute(velocities, 1)
);
starGeo.setAttribute(
  "acceleration",
  new THREE.Float32BufferAttribute(accelerations, 1)
);

// 创建星星系统的网格
let sprite = new THREE.TextureLoader().load("../assets/star.png");
let starMaterial = new THREE.PointsMaterial({
  color: 0xaaaaaa,
  size: 0.7,
  map: sprite,
});
let stars = new THREE.Points(starGeo, starMaterial);
scene2.add(stars);

const pointLight = new THREE.PointLight(0xffffff, 80000, 500000);
pointLight.position.set(-100, 70, 80);
scene2.add(pointLight);

const pointLight2 = new THREE.PointLight(0xffffff, 10000, 500000);

scene2.add(pointLight2);
sun.lookAt(earth.position);
function animate2() {
  const positions = starGeo.attributes.position.array;
  const velocities = starGeo.attributes.velocity.array;
  const accelerations = starGeo.attributes.acceleration.array;

  // 获取摄像机的位置向量和朝向
  const cameraPosition = new THREE.Vector3();
  const cameraDirection = new THREE.Vector3();
  camera2.getWorldPosition(cameraPosition);
  camera2.getWorldDirection(cameraDirection);

  for (let i = 0; i < positions.length; i += 3) {
    velocities[i / 3] += accelerations[i / 3];

    // 计算星星位置到摄像机位置的向量
    const directionToCamera = new THREE.Vector3(
      cameraPosition.x - positions[i],
      cameraPosition.y - positions[i + 1],
      cameraPosition.z - positions[i + 2]
    ).normalize();
  }
  starGeo.attributes.position.needsUpdate = true;
  stars.rotation.y -= 0.001;

  requestAnimationFrame(animate2);
  renderer2.render(scene2, camera2);
}

animate2();

// 圓形3d
// const scene = new THREE.Scene();
// const geometry = new THREE.SphereGeometry(3,64,64)
// const material = new THREE.MeshStandardMaterial({color:"#ff0000"})
// const mesh = new THREE.Mesh(geometry,material)
// scene.add(mesh)

// const light = new THREE.PointLight(0xffffff, 150, 150)
// light.position.set(0, 6, 6)
// scene.add(light)

// const sizes={
//     width:window.innerWidth,
//     height:window.innerHeight
// }

// const camera = new THREE.PerspectiveCamera(45,sizes.width/sizes.height, 800 / 600)
// camera.position.z = 20
// scene.add(camera)

// const canvas = document.querySelector('.webgl')
// const renderer = new THREE.WebGLRenderer({canvas})
// renderer.setSize(sizes.width,sizes.height)
// renderer.render(scene,camera)

// createApp(App).mount("#app");
