// Import necessary modules
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
// import { GUI } from "dat.gui";
import { gsap } from "gsap";
import { Howl } from "howler";
import createAboutSection from "./htmlHandler";

/********************************************************************************************************
 ****************************************** ENVIRONMENT SETUP *******************************************
 ********************************************************************************************************/
// Parameters *******************************************************************************************
const parameters = {};
parameters.documentAspect = window.innerWidth / window.innerHeight;

parameters.fov = 60;
parameters.cameraX = 0;
parameters.cameraY = 0;
parameters.cameraZ = 15;

parameters.bloomStrength = 0.32;
parameters.bloomRadius = 2;
parameters.bloomThreshold = 0;

parameters.ambientLightColor = 0x828282;
parameters.ambientLightIntensity = 0.38;

parameters.pointLight1Color = 0xffffff;
parameters.pointLight1Intensity = 2.4;
parameters.pointLight1X = 4.81;
parameters.pointLight1Y = 0.95;
parameters.pointLight1Z = 10;

parameters.earthRadius = 1;
parameters.earthX = 0;
parameters.earthY = 0;
parameters.earthZ = 0;
parameters.earthRotationSpeed = 0.0015;
parameters.earthCloudsDeltaRotationSpeed = 0.0002;

parameters.moonRadius = 0.2725;

parameters.soundIconScale = 0.06;
parameters.soundIconX = -0.21;
parameters.soundIconY = -1.65;
parameters.soundIconZ = 0;

parameters.soundActive = false;

parameters.anythingCanBeHovered = false;
parameters.earthHovered = false;
parameters.earthCanBeHovered = true;
parameters.soundHovered = false;
parameters.stockFeelerHovered = false;
parameters.projectBeastHovered = false;
parameters.hosHovered = false;

parameters.earthEntered = false;
parameters.muteEntered = false;
parameters.soundEntered = false;
parameters.planetEntered = false;

parameters.scene1 = true;
parameters.scene2 = false;
parameters.scene3 = false;
parameters.scene4 = false;

const manager = new THREE.LoadingManager();
const loadingScreen = document.getElementById('loading-screen');
const perText = document.getElementById('loading-percentage');

manager.onLoad = function () {
    loadingScreen.style.display = 'none';
    parameters.anythingCanBeHovered = true;
};

manager.onProgress = function (url, itemsLoaded, itemsTotal) {
    perText.innerText = ((itemsLoaded / itemsTotal) * 100).toFixed(0);
};

// Initialize scene, camera, and renderer ***************************************************************
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(parameters.fov, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.layers.enable(0);
camera.layers.enable(1);
const renderer = new THREE.WebGLRenderer({ antialias: true });
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
raycaster.layers.set(0);

const gltfLoader = new GLTFLoader(manager).setPath("/assets/models/");
const svgLoader = new SVGLoader(manager).setPath("/assets/svgs/");

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

// Set renderer size and append to html document ********************************************************
renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

// Create RenderPass and add it to the composer
const composer = new EffectComposer(renderer);
const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

// Create UnrealBloomPass for a bloom effect
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    parameters.bloomStrength,
    parameters.bloomRadius,
    parameters.bloomThreshold
);
composer.addPass(bloomPass);

// Create OutlinePass and add it to the composer
const outlinePass = new OutlinePass(new THREE.Vector2(window.innerWidth, window.innerHeight), scene, camera);
outlinePass.edgeStrength = 2;
outlinePass.edgeGlow = 2;
outlinePass.edgeThickness = 4;
outlinePass.visibleEdgeColor.set("#ffffff");
composer.addPass(outlinePass);

const effectFXAA = new ShaderPass(FXAAShader);
effectFXAA.uniforms["resolution"].value.set(1 / window.innerWidth, 1 / window.innerHeight);
composer.addPass(effectFXAA);

const rgbShiftShader = new ShaderPass(RGBShiftShader);
rgbShiftShader.uniforms["amount"].value = 0.0005;
composer.addPass(rgbShiftShader);

// Set camera start position ****************************************************************************
camera.position.z = parameters.cameraZ;

/********************************************************************************************************
 ****************************************** MODELS & ASSETS *********************************************
 ********************************************************************************************************/
// Create Skybox ****************************************************************************************
// function createSkybox() {
//     const loader = new THREE.CubeTextureLoader();
//     const texture = loader.load([
//         "/assets/skybox/intro-scene/right.png",
//         "/assets/skybox/intro-scene/left.png",
//         "/assets/skybox/intro-scene/top.png",
//         "/assets/skybox/intro-scene/bottom.png",
//         "/assets/skybox/intro-scene/front.png",
//         "/assets/skybox/intro-scene/back.png",
//     ]);
//     scene.background = texture;
// }
// createSkybox();
function createMilkyWay() {
    new THREE.TextureLoader(manager).load("/assets/skybox/8k_stars_milky_way.jpg", function (texture) {
        texture.mapping = THREE.EquirectangularReflectionMapping;
        // Set the initial rotation of the texture
        // texture.repeat.set(1, 1);
        // texture.offset.set(0, 0); // Adjust these values to change the starting point
        // Create a sphere geometry for the skybox
        const skyboxGeometry = new THREE.SphereGeometry(400, 32, 32);
        // Create a material with the texture
        const skyboxMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            side: THREE.BackSide,
        });
        // Create the skybox mesh and add it to the scene
        const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
        skybox.rotation.y = -10.3;
        skybox.layers.set(1);
        scene.add(skybox);
    });
}
createMilkyWay();

// Create Stars
function createStars() {
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    for (let i = 0; i < 10000; i++) {
        const x = THREE.MathUtils.randFloatSpread(2000);
        const y = THREE.MathUtils.randFloatSpread(2000);
        const z = THREE.MathUtils.randFloatSpread(2000);
        vertices.push(x, y, z);
    }

    geometry.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));

    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 0.5 });

    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
}
createStars();

// Create Earth ****************************************************************************************
function createEarth(radius = 1, widthSegments = 64, heightSegments = 64, x = 0, y = 0, z = 0) {
    const earthGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    const earthMaterial = new THREE.MeshPhongMaterial();

    earthMaterial.map = new THREE.TextureLoader(manager).load("/assets/earth-textures/earth_diffuse.jpg");
    earthMaterial.specularMap = new THREE.TextureLoader(manager).load("/assets/earth-textures/earth_specular.tif");
    earthMaterial.normalMap = new THREE.TextureLoader(manager).load("/assets/earth-textures/earth_normal.tif");

    const earthMesh = new THREE.Mesh(earthGeometry, earthMaterial);
    earthMesh.position.set(x, y, z);
    scene.add(earthMesh);

    const cloudsGeometry = new THREE.SphereGeometry(radius + 0.02, widthSegments, heightSegments);
    const cloudsTexture = new THREE.TextureLoader(manager).load("/assets/earth-textures/earth_clouds.jpg");
    const cloudsMaterial = new THREE.MeshPhongMaterial({
        map: cloudsTexture,
        alphaMap: cloudsTexture,
        transparent: true,
    });

    const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial);
    earthMesh.add(clouds);

    return earthMesh;
}
const earth = createEarth(parameters.earthRadius, 64, 64, parameters.earthX, parameters.earthY, parameters.earthZ);
earth.rotation.x += 0.2;

// Create Moon
function createMoon() {
    const moonGeometry = new THREE.SphereGeometry(parameters.moonRadius, 32, 32);
    const moonMaterial = new THREE.MeshBasicMaterial();
    moonMaterial.map = new THREE.TextureLoader(manager).load("/assets/moon-textures/moon_diffuse.jpg");

    const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);
    moonMesh.position.set(10, 0.4, 0);
    moonMesh.rotation.y += 3.14;

    const moonParent = new THREE.Object3D();
    moonParent.add(moonMesh);

    scene.add(moonParent);

    return {
        mesh: moonMesh,
        parent: moonParent,
    };
}
const moon = createMoon();

// CREATE TEXTS

const currentTexts = [];
function createText(text, font, color, size, height, cSeg, bOn, bThickness, bSize, bOs, bSeg, posX, posY, posZ) {
    const fontLoader = new FontLoader(manager);

    fontLoader.load(`/fonts/${font}.json`, function (font) {
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
        textMesh.position.set(posX + -0.5 * textWidth, posY, posZ);

        currentTexts.push(textMesh);

        scene.add(textMesh);
    });
}
if (parameters.scene1) {
    createText("Greetings!", "JetBrains", 0xffffff, 0.5, 0.01, 12, false, 0, 0, 0, 0, 0, 2, 0.5);
    createText("↓ Click to visit ↓", "JetBrains", 0xbbccdd, 0.3, 0.01, 12, false, 0, 0, 0, 0, 0, 1.5, 0.5);
    createText("↑", "JetBrains", 0xbbccdd, 0.25, 0.01, 12, false, 0, 0, 0, 0, 0, -1.95, 0.5);
    createText("Turn on sound", "JetBrains", 0xbbccdd, 0.25, 0.01, 12, false, 0, 0, 0, 0, 0, -2.35, 0.5);
    console.log(currentTexts);
}

function removeTexts() {
    for (let t of currentTexts) {
        scene.remove(t);
        t.geometry.dispose();
        t.material.dispose();
        t = null;
    }

    currentTexts.length = 0;
}

// CREATE PROJECT PLANET
function createPlanet(texture, radius = 1, widthSegments = 64, heightSegments = 64, x = 0, y = 5, z = -10) {
    const planetGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
    const planetMaterial = new THREE.MeshBasicMaterial();

    planetMaterial.map = new THREE.TextureLoader(manager).load(texture);

    const planetMesh = new THREE.Mesh(planetGeometry, planetMaterial);
    planetMesh.position.set(x, y, z);

    return planetMesh;
}
const planetStockFeeler = createPlanet("/assets/planet-textures/ceres.jpg", 1, 32, 32, -12, 10, 15);
const planetProjectBeast = createPlanet("/assets/planet-textures/makemake.jpg", 1, 32, 32, -14, 8, 20);
const planetHos = createPlanet("/assets/planet-textures/eris.jpg", 1, 32, 32, -13, 9, 17);

// Create ISS ******************************************************************************************
// let ISS;
// gltfLoader.load("iss.gltf", function (gltf) {
//     gltf.scene.scale.set(0.05, 0.05, 0.05);
//     gltf.scene.position.x = 2;
//     gltf.scene.position.z = 2;

//     ISS = gltf.scene.children[0];
//     scene.add(gltf.scene);
// });

// Create SVGs ******************************************************************************************
function createIconPlane() {
    const geometry = new THREE.PlaneGeometry(0.5, 0.5);
    const material = new THREE.MeshStandardMaterial({ color: 0x000000, side: THREE.FrontSide, transparent: true, opacity: 0 });
    const plane = new THREE.Mesh(geometry, material);
    plane.position.x = 0.01;
    plane.position.y = -1.4;
    plane.position.z = 0.2;
    scene.add(plane);

    return plane;
}
const iconPlane = createIconPlane();

let muteIcon;
svgLoader.load(
    "mute.svg",
    function (data) {
        const paths = data.paths;
        const group = new THREE.Group();

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
        group.scale.set(...Array(3).fill(parameters.soundIconScale));
        group.position.x = parameters.soundIconX;
        group.position.y = parameters.soundIconY;
        group.position.z = parameters.soundIconZ;

        muteIcon = group;

        scene.add(group);
        
    },
    function (xhr) {

    },
    function (error) {
        console.log("Error", error);
    }
);

let soundIcon;
svgLoader.load(
    "sound.svg",
    function (data) {
        const paths = data.paths;
        const group = new THREE.Group();

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
        group.scale.set(...Array(3).fill(parameters.soundIconScale));
        group.position.x = parameters.soundIconX;
        group.position.y = parameters.soundIconY;
        group.position.z = parameters.soundIconZ;

        soundIcon = group;

    },
    function (xhr) {

    },
    function (error) {
        console.log("Error", error);
    }
);

/********************************************************************************************************
 ****************************************** LIGHTING ****************************************************
 ********************************************************************************************************/
// Ambient Lighting *************************************************************************************
function createAmbientLight() {
    const ambientLight = new THREE.AmbientLight(new THREE.Color(parameters.ambientLightColor), parameters.ambientLightIntensity);
    scene.add(ambientLight);

    return ambientLight;
}
const ambientLight = createAmbientLight();

// Point Lighting ***************************************************************************************
function createPointLight(color, intensity, x, y, z) {
    const pointLight = new THREE.PointLight(new THREE.Color(color), intensity);

    pointLight.position.x = x;
    pointLight.position.y = y;
    pointLight.position.z = z;

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

/********************************************************************************************************
 ****************************************** GUI DEBUG ***************************************************
 ********************************************************************************************************/
// const gui = new GUI();

// const cameraFolder = gui.addFolder("Camera");
// cameraFolder.add(camera.position, "x", -10, 10, 0.1);
// cameraFolder.add(camera.position, "y", -10, 10, 0.1);
// cameraFolder.add(camera.position, "z", -10, 10, 0.1);

// const bloomFolder = gui.addFolder("Bloom");
// bloomFolder.add(parameters, "bloomStrength", 0, 2, 0.01).onChange((value) => {
//     bloomPass.strength = value;
// });
// bloomFolder.add(parameters, "bloomRadius", 0, 2, 0.01).onChange((value) => {
//     bloomPass.radius = value;
// });
// bloomFolder.add(parameters, "bloomThreshold", 0, 2, 0.001).onChange((value) => {
//     bloomPass.threshold = value;
// });

// const lightingFolder = gui.addFolder("Lighting");
// lightingFolder.addColor(parameters, "ambientLightColor").onChange((value) => {
//     ambientLight.color.set(value);
// });
// lightingFolder.add(parameters, "ambientLightIntensity", 0, 3, 0.01).onChange((value) => {
//     ambientLight.intensity = value;
// });
// lightingFolder.addColor(parameters, "pointLight1Color").onChange((value) => {
//     pointLight1.color.set(value);
// });
// lightingFolder.add(parameters, "pointLight1Intensity", 0, 3, 0.01).onChange((value) => {
//     pointLight1.intensity = value;
// });
// lightingFolder.add(parameters, "pointLight1X", -10, 10, 0.01).onChange((value) => {
//     pointLight1.position.x = value;
// });
// lightingFolder.add(parameters, "pointLight1Y", -10, 10, 0.01).onChange((value) => {
//     pointLight1.position.y = value;
// });
// lightingFolder.add(parameters, "pointLight1Z", -10, 10, 0.01).onChange((value) => {
//     pointLight1.position.z = value;
// });

// const earthFolder = gui.addFolder("Earth");
// earthFolder.add(earth.position, "x", -10, 10, 0.1);
// earthFolder.add(earth.position, "y", -10, 10, 0.1);
// earthFolder.add(earth.position, "z", -10, 10, 0.1);
// earthFolder.add(parameters, "earthRadius", 0.01, 5, 0.01).onChange((value) => {
//     earth.scale.x = value;
//     earth.scale.y = value;
//     earth.scale.z = value;
// });
// earthFolder.add(parameters, "earthRotationSpeed", -1, 1, 0.001);

/********************************************************************************************************
 ****************************************** HELPERS *****************************************************
 ********************************************************************************************************/
// const pointLight1Helper = new THREE.PointLightHelper(pointLight1, 0.25);
// scene.add(pointLight1Helper);

/********************************************************************************************************
 ****************************************** ANIMATION ***************************************************
 ********************************************************************************************************/
const target = new THREE.Vector3();
const cameraLerpFactor = 0.01;
camera.target = new THREE.Vector3();

// Render scene to screen *******************************************************************************
let floatTime = 0;
function animate() {
    requestAnimationFrame(animate);
    // Begin animation code

    const mouseX = mouse.x;
    const mouseY = mouse.y;

    target.set(mouseX, mouseY, 0);
    camera.target = camera.target.lerp(target, cameraLerpFactor);
    camera.lookAt(camera.target);

    earth.rotation.y += parameters.earthRotationSpeed;
    earth.children[0].rotation.y -= parameters.earthCloudsDeltaRotationSpeed;

    moon.parent.rotation.y += parameters.earthRotationSpeed / 4;

    planetStockFeeler.rotation.y += 0.002;
    planetStockFeeler.position.y += Math.sin(floatTime) * 0.001;

    planetProjectBeast.rotation.y += 0.002;
    planetProjectBeast.position.y += Math.sin(floatTime + 2.8) * 0.001;

    planetHos.rotation.y += 0.002;
    planetHos.position.y += Math.sin(floatTime + 1.6) * 0.001;

    floatTime += 0.01;
    if (floatTime > 2 * Math.PI) {
        floatTime -= 2 * Math.PI;
    }

    // End animation code
    composer.render();
}
if (WebGL.isWebGLAvailable()) {
    animate();
} else {
    const warning = WebGL.getWebGLErrorMessage();
    document.getElementById("container").appendChild(warning);
}

/********************************************************************************************************
 ****************************************** RAYCASTER ***************************************************
 ********************************************************************************************************/
function updateHoverStates({
    earthHovered = false,
    muteHovered = false,
    soundHovered = false,
    stockFeelerHovered = false,
    projectBeastHovered = false,
    hosHovered = false,
}) {
    Object.assign(parameters, { earthHovered, muteHovered, soundHovered, stockFeelerHovered, projectBeastHovered, hosHovered });

    updateIconScale(muteIcon, muteHovered);
    updateIconScale(soundIcon, soundHovered);
}

function updateIconScale(icon, isHovered) {
    const scale = isHovered ? parameters.soundIconScale + 0.002 : parameters.soundIconScale;
    icon?.scale.set(scale, scale, scale);
}

function updateSceneOnHover({ cursor = "pointer", outlined, entered }) {
    document.body.style.cursor = cursor;
    outlinePass.selectedObjects = outlined;
    playHoverBlip(entered);
}

function checkIntersection() {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    let newState = {};

    if (intersects.length > 0) {
        const selectedObject = intersects[0].object;

        if (parameters.anythingCanBeHovered) {
            if (selectedObject === earth.children[0] && parameters.earthCanBeHovered) {
                updateSceneOnHover({ outlined: [earth], entered: parameters.earthEntered });
                newState = { earthHovered: true };
                parameters.earthEntered = true;
            } else if (selectedObject === iconPlane) {
                updateSceneOnHover({ outlined: [], entered: parameters.soundEntered });
                const hoverState = parameters.soundActive ? { soundHovered: true } : { muteHovered: true };
                newState = hoverState;
                parameters.soundEntered = true;
            } else if (selectedObject === planetStockFeeler) {
                updateSceneOnHover({ outlined: [planetStockFeeler], entered: parameters.planetEntered });
                newState = { stockFeelerHovered: true };
                parameters.planetEntered = true;
            } else if (selectedObject === planetProjectBeast) {
                updateSceneOnHover({ outlined: [planetProjectBeast], entered: parameters.planetEntered });
                newState = { projectBeastHovered: true };
                parameters.planetEntered = true;
            } else if (selectedObject === planetHos) {
                updateSceneOnHover({ outlined: [planetHos], entered: parameters.planetEntered });
                newState = { hosHovered: true };
                parameters.planetEntered = true;
            }
        }
    } else {
        outlinePass.selectedObjects = [];
        document.body.style.cursor = "default";
        resetHoverStates();
    }

    updateHoverStates(newState);
}

function playHoverBlip(enteredFlag) {
    if (!enteredFlag && parameters.soundActive) {
        hoverBlip.play();
    }
}

function resetHoverStates() {
    updateHoverStates({});
    parameters.earthEntered = false;
    parameters.soundEntered = false;
    parameters.planetEntered = false;
}

/********************************************************************************************************
 *************************************** WINDOW EVENT LISTENERS *****************************************
 ********************************************************************************************************/
// Handle window resize *********************************************************************************
window.addEventListener("resize", () => {
    const width = window.innerWidth;
    const height = window.innerHeight;

    renderer.setSize(width, height);

    composer.setSize(width, height);

    camera.aspect = width / height;
    camera.updateProjectionMatrix();

    const previousAspect = parameters.documentAspect;
    parameters.documentAspect = width / height;

    if (parameters.scene4 === true) {
        if (parameters.documentAspect >= 1.25 && previousAspect < 1.25) {
            movePlanets("wide");
        } else if (parameters.documentAspect < 0.5 && previousAspect >= 0.5) {
            movePlanets("thin");
        } else if (parameters.documentAspect >= 0.5 && parameters.documentAspect < 1.25 && (previousAspect < 0.5 || previousAspect >= 1.25)) {
            movePlanets("tall");
        }
    }
});

function onMouseMove(event) {
    // normalize mouse position (-1 to 1) for both x and y coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    checkIntersection();
}
window.addEventListener("mousemove", onMouseMove, false);

function onTouchMove(event) {
    // normalize touch position (-1 to 1) for both x and y coordinates
    mouse.x = (event.touches[0].clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.touches[0].clientY / window.innerHeight) * 2 + 1;
}
window.addEventListener("touchmove", onTouchMove, false);

window.addEventListener("click", function (e) {

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
                createText("↓ Click to learn more! ↓", "JetBrains", 0xbbccdd, 0.15, 0.01, 12, false, 0, 0, 0, 0, 0, 1.25, 0);
            },
        });
    }

    if (parameters.earthHovered && parameters.scene2) {
        removeTexts();
        createAboutSection();
        const aboutInfo = this.document.getElementById("about-wrapper");

        if (parameters.soundActive) {
            openInfo.play();
        }

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
                        createText("Want to see my projects?", "JetBrains", 0xbbccdd, 0.15, 0.01, 12, false, 0, 0, 0, 0, 0, 1.45, 0);
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
                        createText("Want to see my projects?", "JetBrains", 0xbbccdd, 0.15, 0.01, 12, false, 0, 0, 0, 0, 0, 1.45, 0);
                        createText("↓", "JetBrains", 0xbbccdd, 0.15, 0.01, 12, false, 0, 0, 0, 0, 0, 1.15, 0);
                    },
                }
            );
        }
    }

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

        if (parameters.documentAspect >= 1.25) {
            movePlanets("wide", true);
        } else if (parameters.documentAspect < 0.5) {
            movePlanets("thin", true);
        } else {
            movePlanets("tall", true);
        }
    }

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

        span.addEventListener("click", function (e) {
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

        span.addEventListener("click", function (e) {
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

        span.addEventListener("click", function (e) {
            modal.style.display = "none";
            parameters.anythingCanBeHovered = true;
        });
    }
    checkIntersection();
});

function movePlanets(size, changeScenes = false) {
    if (parameters.soundActive) {
        zoomGust.play();
    }

    if (size === "wide") {
        gsap.to(planetStockFeeler.position, {
            duration: 2,
            x: -6,
            y: 5,
            z: -10,
            ease: "power4.out",
            onComplete() {},
        });
        gsap.to(planetProjectBeast.position, {
            duration: 2,
            x: -8,
            y: 1,
            z: -10,
            ease: "power4.out",
            onComplete() {},
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
            onComplete() {},
        });
        gsap.to(planetProjectBeast.position, {
            duration: 2,
            x: 0.2,
            y: 5.5,
            z: -10,
            ease: "power4.out",
            onComplete() {},
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
            onComplete() {},
        });
        gsap.to(planetProjectBeast.position, {
            duration: 2,
            x: 0.2,
            y: 7.5,
            z: -15,
            ease: "power4.out",
            onComplete() {},
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
