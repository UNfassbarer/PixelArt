// All changeable Keys in game
import { AssignmentKeys } from "./assets.js";

// Manage played games & deaths
const Infobox = document.getElementById("Game_Info");
function updateGameStats(Category, Value) {
    const el = Infobox.querySelector(`${Category}`);
    if (el) el.innerHTML = Value;
}

// Get canvas and context
const canvas = document.getElementById("Game_Container");
const ctx = canvas.getContext("2d");

// Get CSS canvas for sizing background
// const HtmlVideos = document.querySelectorAll(".gameVideo");

// Sync canvas internal resolution & make it adoptive to CSS size
function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
}

// Load new game and reset background and old values
let ImgCounter = 0;
let GamesPlayed = 0;
let GameOver = true;
let DeathCounter = 0;
let PausedGame = false;

// Generate "images for game objects"
let playerImage = new Image();
const ObstacleImage_S = new Image();
const ObstacleImage_M = new Image();
const ObstacleImage_L = new Image();
const icelandImage_S = new Image();
const icelandImage_M = new Image();
const icelandImage_L = new Image();
const portalImage = new Image();
const spikeImage = new Image();
const orbImage = new Image();

// List of "Images for game objects"
const images = [
    playerImage,
    ObstacleImage_S,
    ObstacleImage_M,
    ObstacleImage_L,
    icelandImage_S,
    icelandImage_M,
    icelandImage_L,
    portalImage,
    spikeImage,
    orbImage,
];

// List of image surces for "Images for game objects"
const IMGsources = [
    "img/player_capibara_astronaut.png",
    "img/obstacle_small.png",
    "img/obstacle_medium.png",
    "img/obstacle_large.png",
    "img/iceland_small.png",
    "img/iceland_medium.png",
    "img/iceland_large.png",
    "img/portal.png",
    "img/spike.png",
    "img/orb.png"
];

// List of image surces for "player images"
const PlayerGroundImgSources = [
    "img/player_capibara_astronaut.png",
    "img/player_capibara_astronaut_run1.png"
];

// List of image surces for "playerJumpImages"
const PlayerJumpImgSources = [
    "img/player_capibara_astronaut_jump1.png",
    "img/player_capibara_astronaut_jump2.png",
    "img/player_capibara_astronaut_jump3.png",
    "img/player_capibara_astronaut_jump4.png"
];

// Assign "IMGsources" to "Images for game objects" and count loaded images
images.forEach((img, i) => {
    img.onload = () => ImgCounter++;
    img.src = IMGsources[i];
});

// List of "Images for game objects"
const playerGroundImages = [];

// Create player images
PlayerGroundImgSources.forEach(ImgLink => {
    const img = new Image();
    img.src = ImgLink;
    playerGroundImages.push(img);
});

// Create player jump images
const playerJumpImages = [];
PlayerJumpImgSources.forEach(ImgLink => {
    const img = new Image();
    img.src = ImgLink;
    playerJumpImages.push(img);
});

// Manage game time display
let survivedTime = 0;
let TimingInterval = null;
function SetTimingInterval(previousTime) {
    const startTime = Date.now();
    TimingInterval = setInterval(function () {
        if (GameOver) clearInterval(TimingInterval);
        let elapsedTime = Date.now() - startTime;
        survivedTime = (previousTime + elapsedTime / 1000).toFixed(2);
        updateGameStats("#Survived_Time >h5", `${survivedTime}s`);
    }, 100);
}

const GameOverDiv = document.getElementById("Game_Over");

function toggleGameOverDiv() {
    GameOverDiv.classList.toggle("HiddenContent");
    GameOverDiv.classList.toggle("ToggleAnimationState");
}

export function newGame() {
    if (GameOver) {
        GameOver = false;
        SetTimingInterval(0);
        !GameOverDiv.classList.contains("HiddenContent") ? toggleGameOverDiv() : null;
        GamesPlayed++;
        updateGameStats("#Games_Played >h5", GamesPlayed);

        createStars = false;
        canvas.classList.remove("HiddenContent");

        if (ImgCounter === images.length) {
            requestAnimationFrame(gameLoop);
            spawnObstacle();
        } else console.log("Error in assining image sources to image objects.");
    }
}

const player = {
    x: 50, // position X
    y: canvas.height - 12, // position Y
    width: 64, // size
    height: 96, // size
    dx: 0, // horizontal velocity "deltaX"
    dy: 0, // vertical velocity "deltaY"
    speed: 2, // how fast player moves left/right
    jumpPower: -16, // how strong the jump is
    gravity: 0.5, // gravity force
    onGround: true,
};

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Base class for all obstacles with main properties 
const Obstacle = class {
    constructor(x, y, width, height, dx, image, id, angle) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.dx = dx;
        this.image = image;
        this.id = id;
        this.angle = angle;
    }
};

// Object pooling to reduce GC overhead & improve performance
class ObjectPool {
    constructor(createFunc, initialSize = 10) {
        this.createFunc = createFunc;
        this.pool = [];
        for (let i = 0; i < initialSize; i++) this.pool.push(createFunc());
    }
    // Return object from pool || create new one if empty
    get() {
        return this.pool.length > 0 ? this.pool.pop() : this.createFunc();
    }
    // Reset object properties
    release(obj) {
        obj.x = 0;
        obj.y = 0;
        obj.width = 0;
        obj.height = 0;
        obj.dx = 0;
        obj.id = undefined;
        obj.angle = 0;
        this.pool.push(obj);
    }
}

const obstacle_small_Pool = new ObjectPool(() => new Obstacle(0, 0, 0, 0, 0, images[1], 0, 0), 10);
const obstacle_medium_Pool = new ObjectPool(() => new Obstacle(0, 0, 0, 0, 0, images[2], 0, 0), 10);
const obstacle_large_Pool = new ObjectPool(() => new Obstacle(0, 0, 0, 0, 0, images[3], 0, 0), 10);
const iceland_small_Pool = new ObjectPool(() => new Obstacle(0, 0, 0, 0, 0, images[4], 0, 0), 10);
const iceland_medium_Pool = new ObjectPool(() => new Obstacle(0, 0, 0, 0, 0, images[5], 0, 0), 10);
const iceland_large_Pool = new ObjectPool(() => new Obstacle(0, 0, 0, 0, 0, images[6], 0, 0), 10);
const portal_Pool = new ObjectPool(() => new Obstacle(0, 0, 0, 0, 0, images[7], 0, 0), 2);
const spike_Pool = new ObjectPool(() => new Obstacle(0, 0, 0, 0, 0, images[8], 0, 0), 18);
const orb_Pool = new ObjectPool(() => new Obstacle(0, 0, 0, 0, 0, images[9], 0, 0), 6);

// Keys
let keys = {};
let keysPrev = {};
document.addEventListener("keydown", (e) => (keys[e.code] = true));
document.addEventListener("keyup", (e) => (keys[e.code] = false));

function gameLoop() {
    // Pause functionality
    if (
        keys[AssignmentKeys.PauseGame[0]] &&
        !keysPrev[AssignmentKeys.PauseGame[0]]
    ) PausedGame ? StartAnimation(3, TogglePausedGame) : TogglePausedGame();

    keysPrev = { ...keys };
    if (!PausedGame) {
        updateLogic();
        renderLogic();
    }
    if (!GameOver) requestAnimationFrame(gameLoop);
}

function TogglePausedGame() {
    PausedGame = !PausedGame;
    clearInterval(TimingInterval);
    if (!PausedGame) SetTimingInterval(Number(survivedTime));
}

// Arrays for each object type
let obstacles_small = [],
    obstacles_medium = [],
    obstacles_large = [],
    icelands_small = [],
    icelands_medium = [],
    icelands_large = [],
    spikes = [],
    portals = [],
    orbs = [];

// List for iteration in updateLogic
const ObstacleArrays = [
    obstacles_small,
    obstacles_medium,
    obstacles_large,
    icelands_small,
    icelands_medium,
    icelands_large,
    spikes,
    portals,
    orbs
];

function renderLogic() {
    ctx.imageSmoothingEnabled = false;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Draw obstacles
    ObstacleArrays.forEach((array) => drawObjects(array));
    // Draw player
    ctx.drawImage(currentPlayerImage, player.x, player.y, player.width, player.height);
}

const widthSpike = player.width / 2; //32
const heightSpike = widthSpike; //32
const widthOrb = player.width / 4; //16
const heightOrb = player.width / 4; //16
// --> Width calculated in chooseRandomObstacle based on random size category
// widthSmallObstacle = player.width * 1.5 (96)
// widthMediumObstacle = player.width * 2 (128)
// widthLargeObstacle = player.width * 2.5 (160)
const heightObstacle = player.width * (3 / 16); //12

const widthPortal = player.height * (3 / 4); //64
const heightPortal = player.height; //96

const objectSpeed = 3;

const groundSpike = () => {
    const s_P = spike_Pool.get();
    s_P.x = canvas.width;
    s_P.y = canvas.height - heightSpike;
    s_P.width = widthSpike;
    s_P.height = heightSpike;
    s_P.dx = objectSpeed;
    spikes.push(s_P);

    return s_P;
};

const temporatyOrbs = (oX, oY, oWidth) => {
    const i = getRandomInt(1, 3);
    const o_P = orb_Pool.get();
    o_P.x = oX + oWidth / 2 - widthOrb / 2;
    o_P.y = oY - heightOrb;
    o_P.width = widthOrb;
    o_P.height = heightOrb;
    o_P.dx = objectSpeed;
    o_P.id = i;
    orbs.push(o_P);

    return o_P;
};

const groundObstacle = () => {

    const { Pool, widthObstacle } = chooseRandomObstacle("groundObstacle");

    const x = canvas.width;
    const y = canvas.height - heightObstacle;

    Pool.x = x;
    Pool.y = y;
    Pool.width = widthObstacle;
    Pool.height = heightObstacle;
    Pool.dx = objectSpeed;

    let spawnOrb = true;
    if (spawnOrb && getRandomInt(0, 2) === 2) {
        temporatyOrbs(x, y, widthObstacle);
        spawnOrb = false;
    }

    return Pool;
};

const flyingIsland = () => {

    const { Pool, widthObstacle } = chooseRandomObstacle("flyingIsland");

    const x = canvas.width;
    const y = canvas.height - getRandomInt(player.height * 2, player.height * 3) - heightObstacle;

    Pool.x = x;
    Pool.y = y;
    Pool.width = widthObstacle;
    Pool.height = heightObstacle;
    Pool.dx = objectSpeed;

    // Spawn rotated spikes on the flying island
    if (getRandomInt(0, 1) === 1) {
        const counterSpikes = Math.floor(widthObstacle / widthSpike);
        if (getRandomInt(1, 2) === 2) {
            const s_P = spike_Pool.get();
            s_P.x = x + getRandomInt(0, widthObstacle - widthSpike);
            s_P.y = y + heightObstacle;
            s_P.width = widthSpike;
            s_P.height = heightSpike;
            s_P.dx = objectSpeed;
            s_P.angle = 180;
            spikes.push(s_P);
        } else {
            let deltaX = 0;
            let xSpikes = x + getRandomInt(0, widthObstacle - widthSpike * counterSpikes);
            const count = getRandomInt(2, counterSpikes);
            for (let i = 0; i < count; i++) {
                const s_P = spike_Pool.get();
                s_P.x = xSpikes + deltaX;
                s_P.y = y + heightObstacle;
                s_P.width = widthSpike;
                s_P.height = heightSpike;
                s_P.dx = objectSpeed;
                s_P.angle = 180;
                spikes.push(s_P);

                deltaX += (widthSpike * counterSpikes) / count;
            }
        }
    }
    return Pool;
};

function chooseRandomObstacle(type) {

    const RandomInt = getRandomInt(3, 5);

    const assignPoolValues = (sizeChategory, PoolArray) => {
        Pool = sizeChategory.get();
        PoolArray.push(Pool);
        widthObstacle = RandomInt * 32; // 3=>96, 4=>128, 5=>160
    };

    if (type === "groundObstacle") {
        RandomInt === 3 ? assignPoolValues(obstacle_small_Pool, obstacles_small) : null;
        RandomInt === 4 ? assignPoolValues(obstacle_medium_Pool, obstacles_medium) : null;
        RandomInt === 5 ? assignPoolValues(obstacle_large_Pool, obstacles_large) : null;
    }
    if (type === "flyingIsland") {
        RandomInt === 3 ? assignPoolValues(iceland_small_Pool, icelands_small) : null;
        RandomInt === 4 ? assignPoolValues(iceland_medium_Pool, icelands_medium) : null;
        RandomInt === 5 ? assignPoolValues(iceland_large_Pool, icelands_large) : null;
    }
    return { Pool, widthObstacle };
}


const portalMap_NEW = new Map();
const groundPortal = (index) => {

    const x = canvas.width;
    const y = canvas.height - heightPortal;

    const p_P = portal_Pool.get();

    p_P.x = x;
    p_P.y = y;
    p_P.width = widthPortal;
    p_P.height = heightPortal;
    p_P.dx = objectSpeed;

    p_P.id = index;
    portals.push(p_P);

    portalMap_NEW.set(index, p_P);

    return p_P;
};

let spawnedObject = null;
let nextOb = 2; //Start with obstacle

let ProtalDelay = undefined; // Distance of portals assigned with other obstacles
let ProtalIndex = 0; //1st portal with id 0
function spawnObstacle() {

    const Next = () => nextOb = getRandomInt(1, 4);

    const NoPortal = () => {
        do Next()
        while (nextOb === 3);
    };

    // no Portal doubling, unless PortalDelay is reached
    if (ProtalDelay !== undefined) {
        if (nextOb === 3) NoPortal();
        ProtalDelay--;
        if (ProtalDelay === 0) {
            nextOb = 3;
            ProtalIndex++;
        }
    }

    switch (nextOb) {
        case 1:
            spawnedObject = groundSpike();
            Next();
            break;

        case 2:
            spawnedObject = groundObstacle();
            Next();
            break;

        case 3:
            spawnedObject = groundPortal(ProtalIndex);
            ProtalDelay = getRandomInt(1, 2);
            if (ProtalIndex === 1) {
                ProtalDelay = undefined;
                ProtalIndex = 0;
            };
            NoPortal();
            break;

        case 4:
            spawnedObject = flyingIsland();
            Next();
            break;

        default:
            console.error("Invalid object type");
            break;
    }
}

// Lightweight distance check spawn only when there is enaught space
function checkSpawnDistance() {
    const distanceToRight = canvas.width - (spawnedObject.x + spawnedObject.width);
    const spawnThreshold = 120; // 120px
    if (distanceToRight >= spawnThreshold) spawnObstacle();
}

// Manage collisions & movements
function updateLogic() {
    updatePlayer();

    ObstacleArrays.forEach(array => array ? updateObjects(array) : console.log("ERROR!"));

    checkSpawnDistance();
}

function drawRotatedImage(img, x, y, width, height, angle) {
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);    // Move to center of object
    ctx.rotate(angle * Math.PI / 180);
    ctx.drawImage(img, -width / 2, -height / 2, width, height);   // Draw centered
    ctx.restore();
}

function drawObjects(array) {
    for (const o of array) {

        o.angle > 0 ?
            drawRotatedImage(o.image, o.x, o.y, o.width, o.height, o.angle)
            : ctx.drawImage(o.image, o.x, o.y, o.width, o.height);

        // ctx.strokeStyle = "red";
        // ctx.strokeRect(o.x, o.y, o.width, o.height);

        // ctx.strokeStyle = "blue";
        // ctx.strokeRect(player.x, player.y, player.width, player.height);

    }
}

let boosterDelay = 3000; //3s
let playerProtection = false;
function applyBooster(id) {

    // Double speed
    if (id === 1) {
        const speed = player.speed;
        player.speed = speed * 2;
        setTimeout(() => player.speed = speed, boosterDelay);
    }

    // Jump power
    if (id === 2) {
        const jumpPower = player.jumpPower;
        player.jumpPower = jumpPower * 1.25;
        setTimeout(() => player.jumpPower = jumpPower, boosterDelay);
    }

    // Spike protection
    if (id === 3) {
        playerProtection = true;
        setTimeout(() => playerProtection = false, boosterDelay);
    }
}

// In UpdatePlayerImg, use preloaded images instead of changing src
let currentAnim = null;
let playerImgDelay = 0; // frames between image changes
function AnimatePlayerImg(ImgSources, Delay) {

    // Reset state if different animation
    if (currentAnim !== ImgSources) {
        currentAnim = ImgSources;
        playerImgState = 0;
        playerImgDelay = 0;
    }

    // Call image animation based on delay
    playerImgDelay++;
    if (playerImgDelay >= Delay) {
        UpdatePlayerImg(ImgSources);
        playerImgDelay = 0;
    }
}

// Update player image based on state
let playerImgState = 0;
let currentPlayerImage = playerGroundImages[0]; // default
function UpdatePlayerImg(ImgSources) {
    playerImgState = (playerImgState + 1) % ImgSources.length;
    currentPlayerImage = ImgSources[playerImgState];
}

const GoRight = keys[AssignmentKeys.GoRight[0]] || keys[AssignmentKeys.GoRight[1]];// Right arrow OR D
const GoLeft = keys[AssignmentKeys.GoLeft[0]] || keys[AssignmentKeys.GoLeft[1]];// Left arrow OR A
const Jump = (keys[AssignmentKeys.Jump[0]] || keys[AssignmentKeys.Jump[1]]) && player.onGround; // Top arrow OR Space

function updatePlayer() {

    // Move backwards
    if (GoRight) {
        player.dx = player.speed;
        if (player.onGround) AnimatePlayerImg(playerGroundImages, 10);
    }

    // Move forwards
    if (GoLeft) {
        player.dx = -player.speed;
        if (player.onGround) AnimatePlayerImg(playerGroundImages, 5);
    }

    // Jump
    if (Jump) {
        JumpAnimation(player.x, player.y);
        player.dy = player.jumpPower;
        player.onGround = false;
    }

    // No Movement
    if (!GoRight && !GoLeft && !Jump) {
        player.dx = 0;
        if (player.onGround) {
            currentPlayerImage = playerGroundImages[0];
            playerImgDelay = 0;
            playerImgState = 0;
        }
    }

    if (!player.onGround) AnimatePlayerImg(playerJumpImages, 6);

    player.dy += player.gravity;

    player.x += player.dx;

    // Prevent tunneling -> break movement into smaller steps
    // Create new step every '5' pixels of movement
    const PixelsPerStep = 10;
    const steps = Math.ceil(Math.abs(player.dy) / PixelsPerStep);

    for (let i = 0; i < steps; i++) {
        player.y += player.dy / steps;

        if (player.y + player.height >= canvas.height) {
            player.y = canvas.height - player.height;
            player.dy = 0;
            player.onGround = true;
            break;
        }

        // Ground obstacle OR iceland collision
        for (const array of ObstacleArrays) {
            for (let j = 0; j < array.length; j++) {
                const o = array[j];

                const No_Player_Obstacle_Collision =
                    player.x > o.x + o.width ||
                    player.x + player.width < o.x ||
                    player.y > o.y + o.height ||
                    player.y + player.height < o.y;

                if (
                    (array === obstacles_small || array === obstacles_medium || array === obstacles_large || array === icelands_small || array === icelands_medium || array === icelands_large) &&
                    !No_Player_Obstacle_Collision
                ) {
                    const prevBottom = player.y + player.height - (player.dy / steps);
                    const currBottom = player.y + player.height;
                    if (player.dy > 0 && prevBottom <= o.y && currBottom >= o.y) {
                        player.y = o.y - player.height;
                        player.dy = 0;
                        player.onGround = true;
                        break;
                    }
                }
            }
        }
    }

    // floor collision player
    if (player.y + player.height >= canvas.height) {
        player.y = canvas.height - player.height;
        player.dy = 0;
        player.onGround = true;
    }

    // Collision right wall
    if (player.x + player.width >= canvas.width) {
        player.x = canvas.width - player.width - 1;
        player.dx = 0;
    }

    // Collision left wall
    if (player.x <= 0) {
        player.x = 1;
        player.dx = 0;
    }
}


// Update, movement & remove of objects      
function updateObjects(object) {
    for (let i = object.length - 1; i >= 0; i--) {
        const o = object[i];
        o.x -= o.dx; // Movement

        if (o.x + o.width < 0) {
            // off‑screen: swap‑and‑pop then release to the correct pool
            const last = object[object.length - 1];
            object[i] = last;
            object.pop();

            if (object === spikes) spike_Pool.release(o);
            else if (object === portals) portal_Pool.release(o);
            else if (object === orbs) orb_Pool.release(o);
            else if (object === obstacles_small) obstacle_small_Pool.release(o);
            else if (object === obstacles_medium) obstacle_medium_Pool.release(o);
            else if (object === obstacles_large) obstacle_large_Pool.release(o);
            else if (object === icelands_small) iceland_small_Pool.release(o);
            else if (object === icelands_medium) iceland_medium_Pool.release(o);
            else if (object === icelands_large) iceland_large_Pool.release(o);
            continue;
        }
        const No_Player_Obstacle_Collision =
            player.x > o.x + o.width ||
            player.x + player.width < o.x ||
            player.y > o.y + o.height ||
            player.y + player.height < o.y;

        if (!No_Player_Obstacle_Collision) checkPlayerCollision(object, o, i);
    }
}

function checkPlayerCollision(object, o, i) {

    // Orbs and effects
    if (object === orbs) {
        const last = object[object.length - 1];
        object[i] = last;
        object.pop();
        orb_Pool.release(o);
        applyBooster(o.id);
    }

    // Collision with portals
    if (object === portals) {

        const portal1 = portalMap_NEW.get(0);
        const portal2 = portalMap_NEW.get(1);

        if (portal1 && portal2) {

            if (player.y + player.height > portal1.y &&
                portal2.x + portal2.width < canvas.width - 10) {
                const PortalEntrance_Left =
                    player.x + player.width > o.x &&
                    player.x + player.width < o.x + o.width &&
                    player.x < o.x;
                const PortalEntrance_Right =
                    player.x > o.x &&
                    player.x < o.x + o.width &&
                    player.x + player.width > o.x + o.width;
                const otherPortal = o.id === 0 ? portal2 : portal1;
                if (PortalEntrance_Left) player.x = otherPortal.x + otherPortal.width + 1;
                if (PortalEntrance_Right) player.x = otherPortal.x - player.width - 1;
            }
        }
    }

    // Collision with spikes
    if (object === spikes) {
        playerProtection ?
            console.log("Protected!")
            : console.log("Game-Over"); /* resetGame(); */
    }
}

function resetGame() {
    DeathCounter++;
    updateGameStats("#Deaths >h5", DeathCounter);
    GameOver = true;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    toggleGameOverDiv();

    // return every pooled object
    obstacles_small.forEach((o) => obstacle_small_Pool.release(o));
    obstacles_medium.forEach((o) => obstacle_medium_Pool.release(o));
    obstacles_large.forEach((o) => obstacle_large_Pool.release(o));
    spikes.forEach((o) => spike_Pool.release(o));
    icelands_small.forEach((o) => iceland_small_Pool.release(o));
    icelands_medium.forEach((o) => iceland_medium_Pool.release(o));
    icelands_large.forEach((o) => iceland_large_Pool.release(o));
    orbs.forEach((o) => orb_Pool.release(o));
    portals.forEach((o) => portal_Pool.release(o));


    // clear lists
    ObstacleArrays.forEach(array => array.length = 0);

    portalMap_NEW.clear();
    player.dx = 0;
    player.dy = 0;
    player.x = 50;
    player.y = canvas.height - player.height;
    player.onGround = true;
}

// Create a jump animation effect
const Effects = [];// Store active effects for short jump delay
const JumpEffectAmount = 3;
let effectCounter;
function JumpAnimation(x, y) {
    const rect = canvas.getBoundingClientRect();
    const particleDiv = document.createElement("div");
    particleDiv.className = "CenterContent";

    // Position relative to canvas
    particleDiv.style.position = "absolute";
    particleDiv.style.left = rect.left + x + "px"; // x in canvas pixels
    particleDiv.style.top = rect.top + y + "px";  // y in canvas pixels
    particleDiv.style.width = player.width + "px";
    particleDiv.style.height = player.height / 6 + "px"; // particle height
    document.body.appendChild(particleDiv);

    let effectCounter = JumpEffectAmount; // local counter
    const interval = setInterval(() => {
        if (effectCounter <= 0) {
            setTimeout(() => {
                clearInterval(interval);
                particleDiv.remove();
            }, 1000);
            return;
        }
        const particle = document.createElement("div");
        particle.className = "JumpParticle";
        particle.style.width = (player.width + effectCounter * 10) + "px";
        particle.style.height = player.height / 6 + "px";
        particleDiv.appendChild(particle);
        effectCounter--;
    }, 50);
}

// Create start animation
export default function StartAnimation(StartTime, action) {
    const ParentDiv = document.createElement("div");
    const CounterBoard = document.createElement("div");
    const AnimationList = [];

    ParentDiv.className = "StartAnimationBox CenterContent CenterObject";
    AnimationList.push(ParentDiv);
    document.body.appendChild(ParentDiv);

    CounterBoard.className = "StartAnimationText";
    AnimationList.push(CounterBoard);
    ParentDiv.appendChild(CounterBoard);

    let Intervall = null;
    Intervall = setInterval(function () {
        CounterBoard.innerText = StartTime;
        StartTime--;
        if (StartTime < 0) {
            clearInterval(Intervall);
            AnimationList.forEach((element) => { element.remove() })
            if (action) action();
        };
    }, 1500)
}