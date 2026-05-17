export const assets = {
    images: {},
    playerGround: [],
    playerJump: [],
    loaded: 0,
    total: 0
};

function loadImage(src) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            assets.loaded++;
            resolve(img);
        };
        img.src = src;
    });
}

export async function loadAssets() {
    const sources = {
        player: "img/player_capibara_astronaut.png",
        obstacleS: "img/obstacle_small.png",
        obstacleM: "img/obstacle_medium.png",
        obstacleL: "img/obstacle_large.png",
        icelandS: "img/iceland_small.png",
        icelandM: "img/iceland_medium.png",
        icelandL: "img/iceland_large.png",
        portal: "img/portal.png",
        spike: "img/spike.png",
        spikeR: "img/R_spike.png",
        orb: "img/orb.png"
    };

    assets.total = Object.keys(sources).length;

    // Load main images
    for (const key in sources) {
        assets.images[key] = await loadImage(sources[key]);
    }

    // Player animations
    const groundSources = [
        "img/player_capibara_astronaut.png",
        "img/player_capibara_astronaut_run1.png"
    ];

    const jumpSources = [
        "img/player_capibara_astronaut_jump1.png",
        "img/player_capibara_astronaut_jump2.png",
        "img/player_capibara_astronaut_jump3.png",
        "img/player_capibara_astronaut_jump4.png"
    ];

    assets.playerGround = await Promise.all(groundSources.map(loadImage));
    assets.playerJump = await Promise.all(jumpSources.map(loadImage));
}

// All changeable Keys in game
const AssignmentKeys = {
  GoRight: ["ArrowRight", "KeyD"],
  GoLeft: ["ArrowLeft", "KeyA"],
  Jump: ["ArrowUp", "Space"],
  PauseGame: ["Escape"],
};
export { AssignmentKeys };