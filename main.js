/******************************************************
 **************    IMPORTS & MODULES    ***************
 ******************************************************/
 import * as THREE from "three";
 import WebGL from "three/addons/capabilities/WebGL.js";
 import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
 import { FontLoader } from "three/addons/loaders/FontLoader.js";
 import { TextGeometry } from "three/addons/geometries/TextGeometry.js";
 import { SVGLoader } from "three/addons/loaders/SVGLoader.js";
 import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
 import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
 import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
 import { RGBShiftShader } from "three/addons/shaders/RGBShiftShader.js";
 import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
 import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
 import { FXAAShader } from "three/addons/shaders/FXAAShader.js";
 import { gsap } from "gsap";
 import { Howl } from "howler";
 import createAboutSection from "./htmlHandler"; // Custom import to create an "About" section
 
 /******************************************************
  **************       PARAMETERS         ***************
  ******************************************************/
 /**
  * This object contains most (if not all) of the dynamic parameters
  * that control aspects of the scene, camera, lights, etc.
  */
 const parameters = {
   // Document Sizing
   documentAspect: window.innerWidth / window.innerHeight,
 
   // Camera
   fov: 60,
   cameraX: 0,
   cameraY: 0,
   cameraZ: 15,
 
   // Bloom Pass
   bloomStrength: 0.32,
   bloomRadius: 2,
   bloomThreshold: 0,
 
   // Lighting
   ambientLightColor: 0x828282,
   ambientLightIntensity: 0.38,
 
   pointLight1Color: 0xffffff,
   pointLight1Intensity: 2.4,
   pointLight1X: 4.81,
   pointLight1Y: 0.95,
   pointLight1Z: 10,
 
   // Earth
   earthRadius: 1,
   earthX: 0,
   earthY: 0,
   earthZ: 0,
   earthRotationSpeed: 0.0015,
   earthCloudsDeltaRotationSpeed: 0.0002,
 
   // Moon
   moonRadius: 0.2725,
 
   // Sound Icon
   soundIconScale: 0.06,
   soundIconX: -0.21,
   soundIconY: -1.65,
   soundIconZ: 0,
 
   // Sound Settings
   soundActive: false,
 
   // Hover States
   anythingCanBeHovered: false,
   earthHovered: false,
   earthCanBeHovered: true,
   soundHovered: false,
   stockFeelerHovered: false,
   projectBeastHovered: false,
   hosHovered: false,
 
   // "Entered" Flags
   earthEntered: false,
   muteEntered: false,
   soundEntered: false,
   planetEntered: false,
 
   // Scene State
   scene1: true,
   scene2: false,
   scene3: false,
   scene4: false,
 };
 
 /******************************************************
  ************    LOADING MANAGER SETUP   **************
  ******************************************************/
 /**
  * The THREE.LoadingManager helps track loading progress
  * of all textures/models before showing the main scene.
  */
 const manager = new THREE.LoadingManager();
 const loadingScreen = document.getElementById("loading-screen");
 const perText = document.getElementById("loading-percentage");
 
 // When everything finishes loading, hide the loading screen
 manager.onLoad = function () {
   loadingScreen.style.display = "none";
   parameters.anythingCanBeHovered = true;
 };
 
 // Track progress and update a "loading %" text
 manager.onProgress = function (url, itemsLoaded, itemsTotal) {
   perText.innerText = ((itemsLoaded / itemsTotal) * 100).toFixed(0);
 };
 
 /******************************************************
  ************  SCENE, CAMERA, RENDERER  ***************
  ******************************************************/
 // Create Scene
 const scene = new THREE.Scene();
 
 // Create Camera
 const camera = new THREE.PerspectiveCamera(
   parameters.fov,
   window.innerWidth / window.innerHeight,
   0.1,
   1000
 );
 camera.layers.enable(0);
 camera.layers.enable(1);
 
 // Create Renderer
 const renderer = new THREE.WebGLRenderer({ antialias: true });
 renderer.setSize(window.innerWidth, window.innerHeight);
 document.body.appendChild(renderer.domElement);
 
 // Set initial camera position
 camera.position.set(parameters.cameraX, parameters.cameraY, parameters.cameraZ);
 
 // Raycaster Setup
 const mouse = new THREE.Vector2();
 const raycaster = new THREE.Raycaster();
 raycaster.layers.set(0);
 
 /******************************************************
  **************   LOADERS & HOWLER SFX   **************
  ******************************************************/
 // GLTF & SVG Loaders
 const gltfLoader = new GLTFLoader(manager).setPath("/assets/models/");
 const svgLoader = new SVGLoader(manager).setPath("/assets/svgs/");
 
 // Background Music & Sound Effects
 const ambientMusic = new Howl({
   src: ["/assets/sounds/Letting_Go_of_the_Day_Hanna_Lindgren.mp3"],
   autoplay: parameters.soundActive,
   loop: true,
   volume: 0.05,
 });
 
 const hoverBlip = new Howl({
   src: ["/assets/sounds/blipSelect.wav"],
   autoplay: false,
   loop: false,
   volume: 0.08,
 });
 
 const zoomGust = new Howl({
   src: ["/assets/sounds/zoomGust.mp3"],
   autoplay: false,
   loop: false,
 });
 
 const openInfo = new Howl({
   src: ["/assets/sounds/openInfo.wav"],
   autoplay: false,
   loop: false,
   volume: 0.2,
 });
 
 /******************************************************
  *************  POST-PROCESSING (EFFECTS)  ************
  ******************************************************/
 const composer = new EffectComposer(renderer);
 
 // Render Pass
 const renderPass = new RenderPass(scene, camera);
 composer.addPass(renderPass);
 
 // Bloom Pass
 const bloomPass = new UnrealBloomPass(
   new THREE.Vector2(window.innerWidth, window.innerHeight),
   parameters.bloomStrength,
   parameters.bloomRadius,
   parameters.bloomThreshold
 );
 composer.addPass(bloomPass);
 
 // Outline Pass
 const outlinePass = new OutlinePass(
   new THREE.Vector2(window.innerWidth, window.innerHeight),
   scene,
   camera
 );
 outlinePass.edgeStrength = 2;
 outlinePass.edgeGlow = 2;
 outlinePass.edgeThickness = 4;
 outlinePass.visibleEdgeColor.set("#ffffff");
 composer.addPass(outlinePass);
 
 // FXAA Pass
 const effectFXAA = new ShaderPass(FXAAShader);
 effectFXAA.uniforms["resolution"].value.set(
   1 / window.innerWidth,
   1 / window.innerHeight
 );
 composer.addPass(effectFXAA);
 
 // RGB Shift Pass
 const rgbShiftShader = new ShaderPass(RGBShiftShader);
 rgbShiftShader.uniforms["amount"].value = 0.0005;
 composer.addPass(rgbShiftShader);
 
 /******************************************************
  *************     SKYBOX & BACKGROUND     ************
  ******************************************************/
 /**
  * Simple function to create a large spherical "Milky Way"
  * background around the scene.
  */
 function createMilkyWay() {
   new THREE.TextureLoader(manager).load(
     "/assets/skybox/8k_stars_milky_way.jpg",
     function (texture) {
       texture.mapping = THREE.EquirectangularReflectionMapping;
 
       // Sphere geometry for the skybox
       const skyboxGeometry = new THREE.SphereGeometry(400, 32, 32);
       const skyboxMaterial = new THREE.MeshBasicMaterial({
         map: texture,
         side: THREE.BackSide,
       });
 
       const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
       skybox.rotation.y = -10.3;
       skybox.layers.set(1);
       scene.add(skybox);
     }
   );
 }
 createMilkyWay();
 
 /**
  * Optionally, you could create a star field by positioning
  * 10k points randomly in space, giving a star effect.
  */
 function createStars() {
   const geometry = new THREE.BufferGeometry();
   const vertices = [];
 
   for (let i = 0; i < 10000; i++) {
     const x = THREE.MathUtils.randFloatSpread(2000);
     const y = THREE.MathUtils.randFloatSpread(2000);
     const z = THREE.MathUtils.randFloatSpread(2000);
     vertices.push(x, y, z);
   }
 
   geometry.setAttribute(
     "position",
     new THREE.Float32BufferAttribute(vertices, 3)
   );
 
   const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });
   const stars = new THREE.Points(geometry, material);
   scene.add(stars);
 }
 createStars();
 
 /******************************************************
  **********   CREATE EARTH, MOON, & PLANETS   *********
  ******************************************************/
 /**
  * createEarth
  * -----------
  * Creates an Earth sphere with diffuse, specular, and normal maps,
  * plus a secondary "cloud" sphere mesh that rotates slightly faster.
  */
 function createEarth(
   radius = 1,
   widthSegments = 64,
   heightSegments = 64,
   x = 0,
   y = 0,
   z = 0
 ) {
   const earthGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
   const earthMaterial = new THREE.MeshPhongMaterial({
     map: new THREE.TextureLoader(manager).load("/assets/earth-textures/earth_diffuse.jpg"),
     specularMap: new THREE.TextureLoader(manager).load("/assets/earth-textures/earth_specular.tif"),
     normalMap: new THREE.TextureLoader(manager).load("/assets/earth-textures/earth_normal.tif"),
   });
 
   const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
   earthMesh.position.set(x, y, z);
   scene.add(earthMesh);
 
   // Clouds layer
   const cloudsGeometry = new THREE.SphereGeometry(radius + 0.02, widthSegments, heightSegments);
   const cloudsTexture = new THREE.TextureLoader(manager).load("/assets/earth-textures/earth_clouds.jpg");
   const cloudsMaterial = new THREE.MeshPhongMaterial({
     map: cloudsTexture,
     alphaMap: cloudsTexture,
     transparent: true,
   });
 
   const cloudsMesh = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
   earthMesh.add(cloudsMesh);
 
   return earthMesh;
 }
 const earth = createEarth(
   parameters.earthRadius,
   64,
   64,
   parameters.earthX,
   parameters.earthY,
   parameters.earthZ
 );
 // Tilt Earth slightly
 earth.rotation.x += 0.2;
 
 /**
  * createMoon
  * ----------
  * Creates a Moon sphere, positions it, and places it inside
  * a parent Object3D so that we can rotate the parent to simulate orbit.
  */
 function createMoon() {
   const moonGeometry = new THREE.SphereGeometry(parameters.moonRadius, 32, 32);
   const moonMaterial = new THREE.MeshBasicMaterial({
     map: new THREE.TextureLoader(manager).load("/assets/moon-textures/moon_diffuse.jpg"),
   });
 
   const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
   moonMesh.position.set(10, 0.4, 0);
   moonMesh.rotation.y += Math.PI; // Flip the moon if you like
 
   // Parent group for orbital rotation
   const moonParent = new THREE.Object3D();
   moonParent.add(moonMesh);
   scene.add(moonParent);
 
   return { mesh: moonMesh, parent: moonParent };
 }
 const moon = createMoon();
 
 /**
  * createPlanet
  * ------------
  * Generic function that creates a planet with a custom texture.
  */
 function createPlanet(
   texture,
   radius = 1,
   widthSegments = 64,
   heightSegments = 64,
   x = 0,
   y = 5,
   z = -10
 ) {
   const planetGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
   const planetMaterial = new THREE.MeshBasicMaterial({
     map: new THREE.TextureLoader(manager).load(texture),
   });
 
   const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
   planetMesh.position.set(x, y, z);
 
   return planetMesh;
 }
 
 // Sample project planets
 const planetStockFeeler = createPlanet("/assets/planet-textures/ceres.jpg", 1, 32, 32, -12, 10, 15);
 const planetProjectBeast = createPlanet("/assets/planet-textures/makemake.jpg", 1, 32, 32, -14, 8, 20);
 const planetHos = createPlanet("/assets/planet-textures/eris.jpg", 1, 32, 32, -13, 9, 17);
 
 /******************************************************
  **************         TEXT CREATION       ************
  ******************************************************/
 const currentTexts = [];
 
 /**
  * createText
  * ----------
  * Loads a specified font, then creates a 3D text mesh.
  * Once created, we position it and add it to the scene.
  */
 function createText(
   text,
   fontName,
   color,
   size,
   height,
   cSeg,
   bOn,
   bThickness,
   bSize,
   bOs,
   bSeg,
   posX,
   posY,
   posZ
 ) {
   const fontLoader = new FontLoader(manager);
 
   fontLoader.load(`/fonts/${fontName}.json`, function (font) {
     const textGeometry = new TextGeometry(text, {
       font,
       size,
       height,
       curveSegments: cSeg,
       bevelEnabled: bOn,
       bevelThickness: bThickness,
       bevelSize: bSize,
       bevelOffset: bOs,
       bevelSegments: bSeg,
     });
     textGeometry.computeBoundingBox();
 
     const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
     const textMaterial = new THREE.MeshBasicMaterial({ color });
     const textMesh = new THREE.Mesh(textGeometry, textMaterial);
 
     // Center text horizontally by offsetting half its bounding box width
     textMesh.position.set(posX - 0.5 * textWidth, posY, posZ);
 
     currentTexts.push(textMesh);
     scene.add(textMesh);
   });
 }
 
 /**
  * removeTexts
  * -----------
  * Removes all current text meshes from the scene and disposes of their geometry/material.
  */
 function removeTexts() {
   for (let t of currentTexts) {
     scene.remove(t);
     t.geometry.dispose();
     t.material.dispose();
     t = null;
   }
   currentTexts.length = 0;
 }
 
 // Create initial text if we are in scene1
 if (parameters.scene1) {
   createText("Greetings!", "JetBrains", 0xffffff, 0.5, 0.01, 12, false, 0, 0, 0, 0, 0, 2, 0.5);
   createText("↓ Click to visit ↓", "JetBrains", 0xbbccdd, 0.3, 0.01, 12, false, 0, 0, 0, 0, 0, 1.5, 0.5);
   createText("↑", "JetBrains", 0xbbccdd, 0.25, 0.01, 12, false, 0, 0, 0, 0, 0, -1.95, 0.5);
   createText("Turn on sound", "JetBrains", 0xbbccdd, 0.25, 0.01, 12, false, 0, 0, 0, 0, 0, -2.35, 0.5);
   console.log(currentTexts);
 }
 
 /******************************************************
  **************         SVG ICONS          ************
  ******************************************************/
 /**
  * createIconPlane
  * ---------------
  * Creates an invisible plane near the sound icon so we can detect
  * raycaster hits more reliably (using a geometry plane).
  */
 function createIconPlane() {
   const geometry = new THREE.PlaneGeometry(0.5, 0.5);
   const material = new THREE.MeshStandardMaterial({
     color: 0x000000,
     side: THREE.FrontSide,
     transparent: true,
     opacity: 0,
   });
   const plane = new THREE.Mesh(geometry, material);
 
   plane.position.set(0.01, -1.4, 0.2);
   scene.add(plane);
 
   return plane;
 }
 const iconPlane = createIconPlane();
 
 // Global references for Mute and Sound icons
 let muteIcon;
 let soundIcon;
 
 /**
  * Load "mute" SVG
  */
 svgLoader.load(
   "mute.svg",
   function (data) {
     const group = new THREE.Group();
     const paths = data.paths;
 
     for (let i = 0; i < paths.length; i++) {
       const path = paths[i];
       const material = new THREE.MeshBasicMaterial({
         color: "#223344",
         side: THREE.DoubleSide,
         depthWrite: false,
       });
       const shapes = SVGLoader.createShapes(path);
 
       for (let j = 0; j < shapes.length; j++) {
         const shape = shapes[j];
         const geometry = new THREE.ShapeGeometry(shape);
         const mesh = new THREE.Mesh(geometry, material);
         group.add(mesh);
       }
     }
     group.scale.set(
       parameters.soundIconScale,
       parameters.soundIconScale,
       parameters.soundIconScale
     );
     group.position.set(
       parameters.soundIconX,
       parameters.soundIconY,
       parameters.soundIconZ
     );
 
     muteIcon = group;
     scene.add(group);
   },
   function (xhr) {
     // onProgress
   },
   function (error) {
     console.log("Error", error);
   }
 );
 
 /**
  * Load "sound" SVG
  */
 svgLoader.load(
   "sound.svg",
   function (data) {
     const group = new THREE.Group();
     const paths = data.paths;
 
     for (let i = 0; i < paths.length; i++) {
       const path = paths[i];
       const material = new THREE.MeshBasicMaterial({
         color: "#888888",
         side: THREE.DoubleSide,
         depthWrite: false,
       });
       const shapes = SVGLoader.createShapes(path);
 
       for (let j = 0; j < shapes.length; j++) {
         const shape = shapes[j];
         const geometry = new THREE.ShapeGeometry(shape);
         const mesh = new THREE.Mesh(geometry, material);
         group.add(mesh);
       }
     }
     group.scale.set(
       parameters.soundIconScale,
       parameters.soundIconScale,
       parameters.soundIconScale
     );
     group.position.set(
       parameters.soundIconX,
       parameters.soundIconY,
       parameters.soundIconZ
     );
 
     soundIcon = group;
   },
   function (xhr) {
     // onProgress
   },
   function (error) {
     console.log("Error", error);
   }
 );
 
 /******************************************************
  **************        LIGHTING          **************
  ******************************************************/
 /**
  * createAmbientLight
  * ------------------
  * Basic ambient light to illuminate everything slightly.
  */
 function createAmbientLight() {
   const ambientLight = new THREE.AmbientLight(
     new THREE.Color(parameters.ambientLightColor),
     parameters.ambientLightIntensity
   );
   scene.add(ambientLight);
   return ambientLight;
 }
 const ambientLight = createAmbientLight();
 
 /**
  * createPointLight
  * ----------------
  * Brighter light from a specific point, can cast shadows if desired.
  */
 function createPointLight(color, intensity, x, y, z) {
   const pointLight = new THREE.PointLight(new THREE.Color(color), intensity);
   pointLight.position.set(x, y, z);
   scene.add(pointLight);
   return pointLight;
 }
 const pointLight1 = createPointLight(
   parameters.pointLight1Color,
   parameters.pointLight1Intensity,
   parameters.pointLight1X,
   parameters.pointLight1Y,
   parameters.pointLight1Z
 );
 
 const pointLight2 = createPointLight(0xffffff, 0.5, -5, 0, -3);
 
 /******************************************************
  **************       ANIMATION LOOP      *************
  ******************************************************/
 let floatTime = 0;
 
 /**
  * animate
  * -------
  * The main render/animation loop. Runs ~60 times per second,
  * updating object rotations, positions, and then rendering
  * via the composer (for post-processing effects).
  */
 function animate() {
   requestAnimationFrame(animate);
 
   // Camera Lerp Setup
   const cameraLerpFactor = 0.01;
   const target = new THREE.Vector3(mouse.x, mouse.y, 0);
   camera.target = camera.target || new THREE.Vector3();
   camera.target.lerp(target, cameraLerpFactor);
   camera.lookAt(camera.target);
 
   // Earth & Clouds Rotation
   earth.rotation.y += parameters.earthRotationSpeed;
   earth.children[0].rotation.y -= parameters.earthCloudsDeltaRotationSpeed;
 
   // Moon "Orbit"
   moon.parent.rotation.y += parameters.earthRotationSpeed / 4;
 
   // Float the project planets
   planetStockFeeler.rotation.y += 0.002;
   planetStockFeeler.position.y += Math.sin(floatTime) * 0.001;
 
   planetProjectBeast.rotation.y += 0.002;
   planetProjectBeast.position.y += Math.sin(floatTime + 2.8) * 0.001;
 
   planetHos.rotation.y += 0.002;
   planetHos.position.y += Math.sin(floatTime + 1.6) * 0.001;
 
   // Oscillator for float
   floatTime += 0.01;
   if (floatTime > 2 * Math.PI) {
     floatTime -= 2 * Math.PI;
   }
 
   // Render the entire scene with post-processing
   composer.render();
 }
 
 // Check for WebGL Support, then start animation
 if (WebGL.isWebGLAvailable()) {
   animate();
 } else {
   const warning = WebGL.getWebGLErrorMessage();
   document.getElementById("container").appendChild(warning);
 }
 
 /******************************************************
  ***************       RAYCASTING        **************
  ******************************************************/
 /**
  * updateHoverStates
  * -----------------
  * Update booleans that track which object is being hovered,
  * and update the icons' scale when hovered.
  */
 function updateHoverStates({
   earthHovered = false,
   muteHovered = false,
   soundHovered = false,
   stockFeelerHovered = false,
   projectBeastHovered = false,
   hosHovered = false,
 }) {
   Object.assign(parameters, {
     earthHovered,
     muteHovered,
     soundHovered,
     stockFeelerHovered,
     projectBeastHovered,
     hosHovered,
   });
 
   // Scale icons if hovered
   updateIconScale(muteIcon, muteHovered);
   updateIconScale(soundIcon, soundHovered);
 }
 
 /**
  * updateIconScale
  * ---------------
  * Increase or reset the icon's scale based on hover state.
  */
 function updateIconScale(icon, isHovered) {
   const scale = isHovered
     ? parameters.soundIconScale + 0.002
     : parameters.soundIconScale;
   icon?.scale.set(scale, scale, scale);
 }
 
 /**
  * updateSceneOnHover
  * ------------------
  * Sets cursor styling, OutlinePass selection, and triggers
  * a hover-blip sound if we haven't hovered over that item yet.
  */
 function updateSceneOnHover({ cursor = "pointer", outlined, entered }) {
   document.body.style.cursor = cursor;
   outlinePass.selectedObjects = outlined;
   playHoverBlip(entered);
 }
 
 /**
  * playHoverBlip
  * -------------
  * If the object hasn't been hovered before, play a sound effect
  * (only if sound is active).
  */
 function playHoverBlip(enteredFlag) {
   if (!enteredFlag && parameters.soundActive) {
     hoverBlip.play();
   }
 }
 
 /**
  * checkIntersection
  * -----------------
  * Casts a ray from the mouse coords into the scene, checks if we
  * intersect any 3D objects, and updates state accordingly.
  */
 function checkIntersection() {
   raycaster.setFromCamera(mouse, camera);
   const intersects = raycaster.intersectObjects(scene.children);
   let newState = {};
 
   if (intersects.length > 0) {
     const selectedObject = intersects[0].object;
 
     if (parameters.anythingCanBeHovered) {
       // Earth (with clouds as children[0])
       if (selectedObject === earth.children[0] && parameters.earthCanBeHovered) {
         updateSceneOnHover({
           outlined: [earth],
           entered: parameters.earthEntered,
         });
         newState = { earthHovered: true };
         parameters.earthEntered = true;
       }
       // Sound Toggle Plane
       else if (selectedObject === iconPlane) {
         updateSceneOnHover({
           outlined: [],
           entered: parameters.soundEntered,
         });
         const hoverState = parameters.soundActive
           ? { soundHovered: true }
           : { muteHovered: true };
         newState = hoverState;
         parameters.soundEntered = true;
       }
       // Project Planets
       else if (selectedObject === planetStockFeeler) {
         updateSceneOnHover({
           outlined: [planetStockFeeler],
           entered: parameters.planetEntered,
         });
         newState = { stockFeelerHovered: true };
         parameters.planetEntered = true;
       } else if (selectedObject === planetProjectBeast) {
         updateSceneOnHover({
           outlined: [planetProjectBeast],
           entered: parameters.planetEntered,
         });
         newState = { projectBeastHovered: true };
         parameters.planetEntered = true;
       } else if (selectedObject === planetHos) {
         updateSceneOnHover({
           outlined: [planetHos],
           entered: parameters.planetEntered,
         });
         newState = { hosHovered: true };
         parameters.planetEntered = true;
       }
     }
   } else {
     // Reset hover if no intersections
     outlinePass.selectedObjects = [];
     document.body.style.cursor = "default";
     resetHoverStates();
   }
 
   updateHoverStates(newState);
 }
 
 /**
  * resetHoverStates
  * ----------------
  * Reset all hovered states to false and "entered" flags.
  */
 function resetHoverStates() {
   updateHoverStates({});
   parameters.earthEntered = false;
   parameters.soundEntered = false;
   parameters.planetEntered = false;
 }
 
 /******************************************************
  **************   WINDOW EVENT LISTENERS   ************
  ******************************************************/
 // Resize Handler
 window.addEventListener("resize", () => {
   const width = window.innerWidth;
   const height = window.innerHeight;
 
   renderer.setSize(width, height);
   composer.setSize(width, height);
 
   camera.aspect = width / height;
   camera.updateProjectionMatrix();
 
   const previousAspect = parameters.documentAspect;
   parameters.documentAspect = width / height;
 
   // If in scene4, reposition planets based on aspect ratio
   if (parameters.scene4 === true) {
     if (parameters.documentAspect >= 1.25 && previousAspect < 1.25) {
       movePlanets("wide");
     } else if (parameters.documentAspect < 0.5 && previousAspect >= 0.5) {
       movePlanets("thin");
     } else if (
       parameters.documentAspect >= 0.5 &&
       parameters.documentAspect < 1.25 &&
       (previousAspect < 0.5 || previousAspect >= 1.25)
     ) {
       movePlanets("tall");
     }
   }
 });
 
 /**
  * onMouseMove
  * -----------
  * Listen for mouse movement, update our "mouse" vector,
  * and check for intersections each time.
  */
 function onMouseMove(event) {
   mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
   mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
   checkIntersection();
 }
 window.addEventListener("mousemove", onMouseMove, false);
 
 /**
  * onTouchMove
  * -----------
  * Touch equivalent of mouse move (for mobile).
  */
 function onTouchMove(event) {
   mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
   mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
 }
 window.addEventListener("touchmove", onTouchMove, false);
 
 /**
  * onClick
  * -------
  * Main click handler for interactions like toggling sound,
  * zooming in on Earth, and opening "About" or project modals.
  */
 window.addEventListener("click", function () {
   // Sound icon click: If sound is on, we show Mute next; if mute is on, we enable sound
   if (parameters.soundHovered && parameters.soundActive) {
     parameters.soundActive = false;
     ambientMusic.pause();
     scene.remove(soundIcon);
     scene.add(muteIcon);
   }
 
   if (parameters.muteHovered && !parameters.soundActive) {
     parameters.soundActive = true;
     ambientMusic.play();
     scene.add(soundIcon);
     scene.remove(muteIcon);
   }
 
   // Earth clicked in Scene1 => Zoom in, remove text, set up Scene2
   if (parameters.earthHovered && parameters.scene1) {
     parameters.earthCanBeHovered = false;
     outlinePass.selectedObjects = [];
     document.body.style.cursor = "default";
     removeTexts();
 
     if (parameters.soundActive) {
       zoomGust.play();
     }
 
     gsap.to(camera.position, {
       duration: 2,
       z: 6.5,
       ease: "power4.out",
       onComplete() {
         parameters.scene1 = false;
         parameters.scene2 = true;
         parameters.earthCanBeHovered = true;
         checkIntersection();
         createText(
           "↓ Click to learn more! ↓",
           "JetBrains",
           0xbbccdd,
           0.15,
           0.01,
           12,
           false,
           0,
           0,
           0,
           0,
           0,
           1.25,
           0
         );
       },
     });
   }
 
   // Earth clicked in Scene2 => Open About Section
   if (parameters.earthHovered && parameters.scene2) {
     removeTexts();
     createAboutSection();
     const aboutInfo = document.getElementById("about-wrapper");
 
     if (parameters.soundActive) {
       openInfo.play();
     }
 
     // Desktop vs Mobile/Tall approach
     if (parameters.documentAspect >= 1.25) {
       gsap.fromTo(
         aboutInfo,
         { x: -600, filter: "opacity(0%)", scale: 0 },
         {
           x: 0,
           filter: "opacity(100%)",
           scale: 1,
           duration: 0.5,
           onComplete() {
             parameters.scene2 = false;
             parameters.scene3 = true;
             createText(
               "Want to see my projects?",
               "JetBrains",
               0xbbccdd,
               0.15,
               0.01,
               12,
               false,
               0,
               0,
               0,
               0,
               0,
               1.45,
               0
             );
             createText("↓", "JetBrains", 0xbbccdd, 0.15, 0.01, 12, false, 0, 0, 0, 0, 0, 1.15, 0);
           },
         }
       );
     } else {
       gsap.fromTo(
         aboutInfo,
         { y: -600, filter: "opacity(0%)", scale: 0 },
         {
           y: 0,
           filter: "opacity(100%)",
           scale: 1,
           duration: 0.5,
           onComplete() {
             parameters.scene2 = false;
             parameters.scene3 = true;
             createText(
               "Want to see my projects?",
               "JetBrains",
               0xbbccdd,
               0.15,
               0.01,
               12,
               false,
               0,
               0,
               0,
               0,
               0,
               1.45,
               0
             );
             createText("↓", "JetBrains", 0xbbccdd, 0.15, 0.01, 12, false, 0, 0, 0, 0, 0, 1.15, 0);
           },
         }
       );
     }
   }
 
   // Earth clicked in Scene3 => Show Project Planets
   if (parameters.earthHovered && parameters.scene3) {
     removeTexts();
     scene.add(planetProjectBeast);
     scene.add(planetStockFeeler);
     scene.add(planetHos);
 
     parameters.earthCanBeHovered = false;
     if (outlinePass.selectedObjects[0] === earth) {
       outlinePass.selectedObjects = [];
       document.body.style.cursor = "default";
     }
     checkIntersection();
 
     // Position the planets based on aspect ratio
     if (parameters.documentAspect >= 1.25) {
       movePlanets("wide", true);
     } else if (parameters.documentAspect < 0.5) {
       movePlanets("thin", true);
     } else {
       movePlanets("tall", true);
     }
   }
 
   // Planet modals if we are in scene4
   if (parameters.stockFeelerHovered && parameters.scene4) {
     const modal = document.getElementById("stockFeelerModal");
     const span = document.getElementsByClassName("close")[0];
     modal.style.display = "block";
     parameters.anythingCanBeHovered = false;
     outlinePass.selectedObjects = [];
     document.body.style.cursor = "default";
     resetHoverStates();
 
     modal.addEventListener("click", function (e) {
       if (e.target == modal) {
         modal.style.display = "none";
         parameters.anythingCanBeHovered = true;
       }
     });
 
     span.addEventListener("click", function () {
       modal.style.display = "none";
       parameters.anythingCanBeHovered = true;
     });
   }
 
   if (parameters.projectBeastHovered && parameters.scene4) {
     const modal = document.getElementById("projectBeastModal");
     const span = document.getElementsByClassName("close")[1];
     modal.style.display = "block";
     parameters.anythingCanBeHovered = false;
     outlinePass.selectedObjects = [];
     document.body.style.cursor = "default";
     resetHoverStates();
 
     modal.addEventListener("click", function (e) {
       if (e.target == modal) {
         modal.style.display = "none";
         parameters.anythingCanBeHovered = true;
       }
     });
 
     span.addEventListener("click", function () {
       modal.style.display = "none";
       parameters.anythingCanBeHovered = true;
     });
   }
 
   if (parameters.hosHovered && parameters.scene4) {
     const modal = document.getElementById("hosModal");
     const span = document.getElementsByClassName("close")[2];
     modal.style.display = "block";
     parameters.anythingCanBeHovered = false;
     outlinePass.selectedObjects = [];
     document.body.style.cursor = "default";
     resetHoverStates();
 
     modal.addEventListener("click", function (e) {
       if (e.target == modal) {
         modal.style.display = "none";
         parameters.anythingCanBeHovered = true;
       }
     });
 
     span.addEventListener("click", function () {
       modal.style.display = "none";
       parameters.anythingCanBeHovered = true;
     });
   }
 
   checkIntersection();
 });
 
 /******************************************************
  **********   HELPER FUNCTION: movePlanets   **********
  ******************************************************/
 /**
  * movePlanets
  * -----------
  * Uses GSAP to transition the x/y/z positions of planets
  * based on screen size "mode" (wide, tall, thin), optionally
  * switching from scene3 to scene4 once the movement is complete.
  */
 function movePlanets(size, changeScenes = false) {
   if (parameters.soundActive) {
     zoomGust.play();
   }
 
   // Reposition each planet with a 2-second animation
   if (size === "wide") {
     gsap.to(planetStockFeeler.position, {
       duration: 2,
       x: -6,
       y: 5,
       z: -10,
       ease: "power4.out",
     });
     gsap.to(planetProjectBeast.position, {
       duration: 2,
       x: -8,
       y: 1,
       z: -10,
       ease: "power4.out",
     });
     gsap.to(planetHos.position, {
       duration: 2,
       x: -6,
       y: -3,
       z: -10,
       ease: "power4.out",
       onComplete() {
         if (changeScenes) {
           parameters.scene3 = false;
           parameters.scene4 = true;
         }
       },
     });
   } else if (size === "tall") {
     gsap.to(planetStockFeeler.position, {
       duration: 2,
       x: -3.5,
       y: 4,
       z: -10,
       ease: "power4.out",
     });
     gsap.to(planetProjectBeast.position, {
       duration: 2,
       x: 0.2,
       y: 5.5,
       z: -10,
       ease: "power4.out",
     });
     gsap.to(planetHos.position, {
       duration: 2,
       x: 3.6,
       y: 4,
       z: -10,
       ease: "power4.out",
       onComplete() {
         if (changeScenes) {
           parameters.scene3 = false;
           parameters.scene4 = true;
         }
       },
     });
   } else if (size === "thin") {
     gsap.to(planetStockFeeler.position, {
       duration: 2,
       x: -3.5,
       y: 6,
       z: -15,
       ease: "power4.out",
     });
     gsap.to(planetProjectBeast.position, {
       duration: 2,
       x: 0.2,
       y: 7.5,
       z: -15,
       ease: "power4.out",
     });
     gsap.to(planetHos.position, {
       duration: 2,
       x: 3.6,
       y: 6,
       z: -15,
       ease: "power4.out",
       onComplete() {
         if (changeScenes) {
           parameters.scene3 = false;
           parameters.scene4 = true;
         }
       },
     });
   }
 }
 