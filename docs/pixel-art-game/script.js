// Utility functions
// Fast, seedable random generator
const rand = (() => {
  let seed = Date.now();
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
})();

// Delay function for async operations
const DLY = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// function TimeOut(ms, handler) { setTimeout(() => { handler }, ms) };


// Random integer between min and max (inclusive)
const getRandomInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;

// Universal event handler function
HTMLElement.prototype.handleEvent = function (action, event, callback) {
  this[`${action}EventListener`](event, callback)
};
// Clickevents for menu buttons
document.querySelectorAll(".button").forEach((button) => {
  button.handleEvent("add", "click", () => ButtonClick(button));
});

// Function to edit multible styles of one element at once
HTMLElement.prototype.editStyle =
  function (styles) {
    Object.assign(this.style, styles)
  };

// Buttonclick toggle
const MenuContent = document.getElementById("Menu_Content");
const MenuCaption = document.getElementById("Menu_Poster");
const MenuCaptionBackground = MenuCaption.querySelector("canvas");
const MenuCaptionText = document.getElementById("Poster_Caption");
function toggleButtonPress(status) {
  MenuContent
    .querySelectorAll("button")
    .forEach((button) => {
      button.style.pointerEvents = status;
    });
}

// Menu button actions
const menu_actions = {
  NewGame: (el) => {
    console.log(el.id);
    StartAnimation(3, newGame);
    CloseMenu();
  },
  LoadGame: (el) => {
    console.log(el.id);
  },
  SaveGame: (el) => {
    console.log(el.id);
  },
  Settings: (el) => {
    console.log(el.id);
    SettingsHidden() ? SettingsHidden(false) : SettingsHidden(true);
  },
  Exit: (el) => {
    console.log(el.id), CloseMenu();
  },
};

// Button actions & particle creation
let counter = 0;
let particleIntervalId = null;
function ButtonClick(el) {
  //Every Click creates particles
  if (counter === 0) {
    toggleButtonPress("none");
    setTimeout(() => {
      toggleButtonPress("auto");
    }, 750);
    menu_actions[el.id]?.(el);

    // Create particles with interval instead of recursion
    particleIntervalId = setInterval(() => {
      if (counter >= 15) {
        clearInterval(particleIntervalId);
        counter = 0;
        return;
      }
      LoadAnimation(el);
      counter++;
    }, 16); // ~60fps
  }
}

// Manage particle animation for button click
function LoadAnimation(el) {

  // Generate coler between two defined colors
  const RGB = (x, y) => `rgb(${x}, ${y - x}, ${y})`;

  // Get exact button position
  let x = 0;
  let y = 0;
  const rect = el.getBoundingClientRect();
  x = Math.round(rect.left + window.scrollX);
  y = Math.round(rect.top + window.scrollY);

  // Create particles with random pos, color, animationspeed and size
  const particle = document.createElement("div");
  const size = Math.floor(Math.random() * 20 + 5);
  particle.editStyle({
    width: `${size}px`,
    height: `${size}px`,
    background: `${RGB(getRandomInt(0, 255), 255)}`,
    left: `${x + el.offsetWidth / 2 + getRandomInt(-el.offsetWidth / 2, el.offsetWidth / 2)}px`,
    top: `${y + el.offsetHeight / 2 + getRandomInt(-el.offsetHeight / 2, el.offsetHeight / 2)}px`,
    animation: `particle ${getRandomInt(0.75, 2)}s forwards`,
  });
  particle.className = "particle";
  document.body.appendChild(particle);

  // Delay & particle clear
  setTimeout(() => {
    particle.remove();
  }, 2000);
}

// Menu
const Menu = document.getElementById("Game_Menu");

// Resize animation for spining circles
//  & copilot support to avoir rounding errors that caused a rapid and slow growth of the canvas size
let originalCanvasSizes = null;
let resizeStep = 0;


// Toggle hidden menu content
const MenuHidden = (condition) => {
  if (condition === undefined)
    return Menu.classList.contains("OpenMenu");

  if (condition) {//Hide menu
    Menu.classList.remove("OpenMenu");
    MenuContent.classList.add("hiddenContent");
    MenuCaptionText.classList.remove("hiddenContent");
    MenuCaptionBackground.classList.remove("BiggerPosterCanvas");
  } else { //Reveal menu
    Menu.classList.add("OpenMenu");
    MenuContent.classList.remove("hiddenContent");
    MenuCaptionText.classList.add("hiddenContent");
    MenuCaptionBackground.classList.add("BiggerPosterCanvas");
  }
};

// Open and close menu, under observation of userdevice
let menuEvent = null;
window.matchMedia("(pointer: coarse)").matches ?
  menuEvent = "click"
  : menuEvent = "mouseenter";
Menu.handleEvent("add", menuEvent, OpenMenu);

// Open menu
let menuStart = false;
function OpenMenu() {

  // Executed every time menu is closed
  if (!MenuHidden()) MenuHidden(false);

  // First menu open
  if (!menuStart) {
    menuStart = true;
    Menu.classList.remove("hiddenContent");
    Menu.classList.add("MenuBefore", "MenuAfter");
    document.querySelector(".TooltipWrapper").classList.add("hiddenContent");
    document.body.style.backgroundColor = "black";
    ToggleGameSounds(true);
    createStar();
  }
}

// Close menu on exit click
function CloseMenu() {
  Menu.handleEvent("remove", menuEvent, OpenMenu);
  setTimeout(() => { Menu.handleEvent("add", menuEvent, OpenMenu) }, 1500);
  setTimeout(() => { MenuHidden(true) }, 500);
  if (!SettingsHidden()) SettingsHidden(true);
}

// Settings menu
const settingsMenu = document.getElementById("Menu_Settings");

function SettingsHidden(condition) {
  if (condition === undefined) return settingsMenu.classList.contains("new_hiddenContent");
  condition ?
    settingsMenu.classList.add("new_hiddenContent") :
    settingsMenu.classList.remove("new_hiddenContent");

  // document.addEventListener("click", (e) => {
  //   console.log("click")
  //   settingsMenu.querySelectorAll('[data-group="GeneratedSettingsElement"]').forEach((el) => {
  //     el.classList.add("hiddenContent");
  //   });
  // });
}

// Scroll bar for settings menu
settingsMenu.addEventListener("wheel", (e) => {
  let delta = settingsMenu.offsetWidth / 2;
  e.preventDefault(); // prevent vertical page scroll

  e.deltaY > 0
    ? settingsMenu.scrollLeft += delta
    : settingsMenu.scrollLeft -= delta;
});

const GameInfoBox = document.getElementById("gameInfo");

const ToggleGameStats = (element) => {
  GameInfoBox.classList.toggle("new_hiddenContent");
  GameInfoBox.classList.toggle("GameInfoFade");
  ToggleInnerSettings(element.id);
};

const SoundIcon = document.getElementById("mute_Symbol");
const ToggleGameSounds = (DayToNight) => {

  if (DayToNight) { // First time menu open
    SoundIcon.src.includes("img/mute_Icon_off_day.png") ?
      SoundIcon.src = "img/mute_Icon_off_night.png"
      : SoundIcon.src = "img/mute_Icon_on_night.png";
    return;
  }
  if (menuStart) { // Switch when day
    SoundIcon.src.includes("img/mute_Icon_off_night.png") ?
      SoundIcon.src = "img/mute_Icon_on_night.png" :
      SoundIcon.src = "img/mute_Icon_off_night.png";
  } else { // Switch when night
    SoundIcon.src.includes("img/mute_Icon_off_day.png") ?
      SoundIcon.src = "img/mute_Icon_on_day.png" :
      SoundIcon.src = "img/mute_Icon_off_day.png";
  }
  ToggleInnerSettings("Toggle_GameSounds");
};

function ToggleInnerSettings(el) {
  const Button = document.getElementById(el);
  const Bool = Button.querySelector("span");
  !Button.classList.contains("ToggleActiveColor")
    ? Bool.innerText = "on"
    : Bool.innerText = "off";
  Button.classList.toggle("ToggleActiveColor");
}

// Game key assignment toggle (KA)
const KA_Button = document.getElementById("Settings_KeyAssignment");

// When clicked, show/hide key assignment options
const ToggleKeys = () => {
  KA_Button.classList.contains("Settings_Category") ?
    document.addEventListener("click", GlobalClickControll) :
    document.removeEventListener("click", GlobalClickControll);

  KA_Button.querySelectorAll(".KA_Category").forEach((el) => { el.classList.toggle("hiddenContent") });
  KA_Button.classList.toggle("Toggle_KA");
  //adjusted height & padding
  settingsMenu.classList.toggle("ToggleMenuSettings"); //for settings menu
  KA_Button.classList.toggle("Settings_Category"); //for KA button's
};

// All changeable Keys in game
const AssignmentKeys = {
  GoRight: ["ArrowRight", "KeyD"],
  GoLeft: ["ArrowLeft", "KeyA"],
  Jump: ["ArrowUp", "Space"],
  PauseGame: ["Escape"],
};

function GlobalClickControll() {

  KA_Button.querySelectorAll("button.KA_Category").forEach(button => {
    if (button.classList.contains("ToggleActiveColor")) button.classList.remove("ToggleActiveColor");
    button.querySelectorAll(".KA_Button_Key").forEach(element => {
      if (element.classList.contains("HilightetElement")) element.classList.remove("HilightetElement");
    });
    if (button._handleKey) document.removeEventListener("keyup", button._handleKey);
  });
}

// Generate buttons for all actions access- & changable with a key's
for (const [action, keys] of Object.entries(AssignmentKeys)) {
  const NewButton = document.createElement("button");
  NewButton.dataset.group = "GeneratedSettingsElement";
  NewButton.className = "KA_Category hiddenContent centerContent";

  // Create action catagory
  const Action_Div = document.createElement("div");
  Action_Div.dataset.group = "GeneratedSettingsElement";
  Action_Div.innerText = action;
  NewButton.appendChild(Action_Div)

  // Create keys for category
  for (let i = 0; i < keys.length; i++) {
    const keyDiv = document.createElement("div");
    keyDiv.dataset.group = "GeneratedSettingsElement";
    keyDiv.innerText = keys[i];
    keyDiv.className = "KA_Button_Key"
    NewButton.dataset.action = action;

    NewButton.appendChild(keyDiv);
  }
  KA_Button.appendChild(NewButton);

  // Event for generated button
  NewButton.addEventListener("click", HandleButtonClick);
}

// AI Implementation for cleaner code
function HandleButtonClick(e) {
  const button = e.currentTarget;
  const action = button.dataset.action;
  e.stopPropagation();
  const KeyList = button.querySelectorAll(".KA_Button_Key");
  let inputCounter = 0;

  // Check for button click: 1st or 2end
  if (!button.classList.toggle("ToggleActiveColor")) {
    // cancel mode
    if (button._handleKey) document.removeEventListener("keyup", button._handleKey);

    KeyList.forEach(k => k.classList.remove("HilightetElement"));
    return;
  }

  // activate mode
  KeyList[0].classList.add("HilightetElement");
  KeyList[0].innerText = "Press any key";

  button._handleKey = function handleKey(event) {
    KeyList[inputCounter].innerText = event.code;
    KeyList[inputCounter].classList.remove("HilightetElement");
    inputCounter++;

    // Update the actual AssignmentKeys object
    if (inputCounter >= KeyList.length) AssignmentKeys[action] = Array.from(KeyList).map(k => k.innerText);

    // Reset key buttons
    if (inputCounter < KeyList.length) KeyList[inputCounter].classList.add("HilightetElement")
    else {
      button.classList.remove("ToggleActiveColor");
      document.removeEventListener("keyup", button._handleKey);
    }
  };
  document.addEventListener("keyup", button._handleKey);
}

// Create star background with canvas
let createStars = true;
function createStar() {
  // const Left = getRandomInt(0, window.innerWidth);
  // const Top = getRandomInt(0, window.innerHeight);
  // console.log(`Creating star at (${Left}, ${Top})`);
  const star = document.createElement("canvas");
  star.className = "star centeredObject";
  const size = getRandomInt(1, 2);
  star.editStyle({
    width: `${size}px`,
    height: `${size}px`,
    left: `${getRandomInt(0, window.innerWidth)}px`,
    top: `${getRandomInt(0, window.innerHeight)}px`,
  });
  document.body.appendChild(star);
  setTimeout(() => star.remove(), 2500);
  if (createStars) setTimeout(createStar, 75);
}

// 17:06:16.192 Menu opened script.js:166:11
// 17:06:23.224 Creating star at (483, 374) script.js:364:11
// 17:06:23.309 Creating star at (312, 442) script.js:364:11
// 17:06:23.392 Creating star at (18, 342) script.js:364:11
// 17:06:23.474 Creating star at (169, 177) script.js:364:11
// 17:06:23.550 Creating star at (496, 320) script.js:364:11
// 17:06:23.626 Creating star at (184, 334) script.js:364:11
// 17:06:23.704 Creating star at (555, 315) script.js:364:11
// 17:06:23.789 Creating star at (13, 412) script.js:364:11
// 17:06:23.874 Creating star at (464, 378) script.js:364:11
// 17:06:23.957 Creating star at (360, 319) script.js:364:11
// 17:06:24.044 Creating star at (374, 272) script.js:364:11
// 17:06:24.122 Creating star at (276, 83) script.js:364:11
// 17:06:24.209 Creating star at (576, 340) script.js:364:11
// 17:06:24.289 Creating star at (635, 150) script.js:364:11
// 17:06:24.376 Creating star at (675, 223) script.js:364:11
// 17:06:24.458 Creating star at (169, 285) script.js:364:11
// 17:06:24.542 Creating star at (214, 218) script.js:364:11
// 17:06:24.623 Creating star at (228, 427) script.js:364:11
// 17:06:24.705 Creating star at (565, 207) script.js:364:11
// 17:06:24.782 Creating star at (637, 416) script.js:364:11
// 17:06:24.862 Creating star at (518, 47) script.js:364:11
// 17:06:24.940 Creating star at (460, 249) script.js:364:11
// 17:06:25.025 Creating star at (296, 52) script.js:364:11
// 17:06:25.109 Creating star at (60, 138) script.js:364:11
// 17:06:25.192 Creating star at (310, 103) script.js:364:11
// 17:06:25.274 Creating star at (491, 386) script.js:364:11
// 17:06:25.359 Creating star at (34, 129) script.js:364:11
// 17:06:25.442 Creating star at (221, 45) script.js:364:11
// 17:06:25.525 Creating star at (390, 431) script.js:364:11
// 17:06:25.607 Creating star at (11, 154) script.js:364:11
// 17:06:25.692 Creating star at (519, 392) script.js:364:11
// 17:06:25.783 Creating star at (129, 75) script.js:364:11
// 17:06:25.873 Creating star at (648, 52) script.js:364:11
// 17:06:25.959 Creating star at (331, 8) script.js:364:11
// 17:06:26.045 Creating star at (167, 52) script.js:364:11
// 17:06:26.124 Creating star at (46, 260) script.js:364:11
// 17:06:26.203 Creating star at (248, 308) script.js:364:11
// 17:06:26.288 Creating star at (509, 99) script.js:364:11
// 17:06:26.378 Creating star at (678, 334) script.js:364:11
// 17:06:26.457 Creating star at (481, 362) script.js:364:11
// 17:06:26.542 Creating star at (144, 8) script.js:364:11
// 17:06:26.625 Creating star at (89, 58) script.js:364:11
// 17:06:26.709 Creating star at (256, 361) script.js:364:11
// 17:06:26.800 Creating star at (134, 105) script.js:364:11
// 17:06:26.892 Creating star at (287, 29) script.js:364:11
// 17:06:26.974 Creating star at (388, 333) script.js:364:11
// 17:06:27.059 Creating star at (614, 71) script.js:364:11
// 17:06:27.142 Creating star at (178, 239) script.js:364:11
// 17:06:27.226 Creating star at (527, 347) script.js:364:11
// 17:06:27.307 Creating star at (201, 403) script.js:364:11
