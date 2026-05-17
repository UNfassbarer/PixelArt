// All changeable Keys in game
import { AssignmentKeys } from "./assets.js";
import { StartAnimation, newGame } from './game.js';

// Utility functions
// Fast, seedable random generator
const rand = (() => {
  let seed = Date.now();
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }; assignPoolValues
})();

// Delay function for async operations
const DLY = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// function TimeOut(ms, handler) { setTimeout(() => { handler }, ms) };


// Random integer between min and max (inclusive)
export const getRandomInt = (min, max) => Math.floor(rand() * (max - min + 1)) + min;

// Universal event handler function
HTMLElement.prototype.handleEvent = function (action, event, callback) {
  this[`${action}EventListener`](event, callback)
};
// Clickevents for menu buttons
document.querySelectorAll(".MenuButton").forEach((button) => {
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
  New_Game: (el) => {
    console.log(el.id);
    StartAnimation(3, newGame);
    CloseMenu();
  },
  IDK: (el) => {
    console.log(el.id);
  },
  Graphics: (el) => {
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

// Button actions & Particle creation
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

// Manage Particle animation for button click
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
    animation: `Particle ${getRandomInt(0.75, 2)}s forwards`,
  });
  particle.className = "Particle";
  document.body.appendChild(particle);

  // Delay & Particle clear
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
    MenuContent.classList.add("HiddenContent");
    MenuCaptionText.classList.remove("HiddenContent");
    MenuCaptionBackground.classList.remove("BiggerPosterCanvas");
  } else { //Reveal menu
    Menu.classList.add("OpenMenu");
    MenuContent.classList.remove("HiddenContent");
    MenuCaptionText.classList.add("HiddenContent");
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
    Menu.classList.remove("HiddenContent");
    Menu.classList.add("MenuBefore", "MenuAfter");
    document.querySelector(".StartButton").classList.add("HiddenContent");
    setTimeout(() => document.querySelector(".StartButton").remove(), 1000);
    document.body.classList.add("DarkBody");
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
  if (condition === undefined) return settingsMenu.classList.contains("VanishedContent");
  condition ?
    settingsMenu.classList.add("VanishedContent") :
    settingsMenu.classList.remove("VanishedContent");

  // document.addEventListener("click", (e) => {
  //   console.log("click")
  //   settingsMenu.querySelectorAll('[data-group="GeneratedSettingsElement"]').forEach((el) => {
  //     el.classList.add("HiddenContent");
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

const GameInfoBox = document.getElementById("Game_Info");

const ToggleGameStats = (element) => {
  GameInfoBox.classList.toggle("VanishedContent")
  GameInfoBox.classList.toggle("GameInfoFade");
  ToggleInnerSettings(element.id);
};

const SoundIcon = document.getElementById("Mute_Symbol");
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
  ToggleInnerSettings("Game_Sounds");
  ButtonClick(SoundIcon);
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
const KA_Button = document.getElementById("Settings_Key_Assignment");

// When clicked, show/hide key assignment options
const ToggleKeys = () => {
  KA_Button.classList.contains("Settings_Category") ?
    document.addEventListener("click", GlobalClickControll) :
    document.removeEventListener("click", GlobalClickControll);

  KA_Button.querySelectorAll(".KA_Category").forEach((el) => { el.classList.toggle("HiddenContent") });
  KA_Button.classList.toggle("Toggle_KA");
  //adjusted height & padding
  settingsMenu.classList.toggle("ToggleMenuSettings"); //for settings menu
  KA_Button.classList.toggle("Settings_Category"); //for KA button's
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
  NewButton.className = "KA_Category HiddenContent CenterContent";

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
export const Settings = {
  createStars: true
};

function createStar() {
  // const Left = getRandomInt(0, window.innerWidth);
  // const Top = getRandomInt(0, window.innerHeight);
  // console.log(`Creating star at (${Left}, ${Top})`);
  const star = document.createElement("canvas");
  star.className = "star CenterObject";
  const size = getRandomInt(1, 2);
  star.editStyle({
    width: `${size}px`,
    height: `${size}px`,
    left: `${getRandomInt(0, window.innerWidth)}px`,
    top: `${getRandomInt(0, window.innerHeight)}px`,
  });
  document.body.appendChild(star);
  setTimeout(() => star.remove(), 2500);
  if (Settings.createStars) setTimeout(createStar, 75);
}



let AnimationDLY = 0;

const VisibillityOptions = {
  ImpressumWrapper: ImpressumAddition,
  Game_Info: GameInfoAddition,
  Game_Over: () => console.log("Game Over")
};

function ToggleElementVisibillity(elName) {
  const el = document.getElementById(elName);

  // Execute additional function
  VisibillityOptions[elName]?.(el);

  // Toggle visibillity
  if (AnimationDLY > 0) setTimeout(() => {
    el.classList.toggle("VanishedContent");
    AnimationDLY = 0;
  }, AnimationDLY);
  else el.classList.toggle("VanishedContent");
}

function ImpressumAddition(el) {

  checkRightSideLayout(el);
  updateRightSideLayout();

  if (AnimationDLY > 0) setTimeout(() => {
    el.inert = !el.inert;
    el.classList.toggle("ImpressumFadeOut");
    AnimationDLY = 0;
  }, AnimationDLY);
  else {
    el.inert = !el.inert;
    el.classList.toggle("ImpressumFadeOut");
  };
}

function GameInfoAddition(el) {

  el.classList.add("GameInfoTransition");

  checkRightSideLayout(el);
  updateRightSideLayout();

  if (AnimationDLY > 0) {
    setTimeout(() => {
      el.classList.toggle("GameInfoFadeOut");
      AnimationDLY = 0;
    }, AnimationDLY)
  }
  else el.classList.toggle("GameInfoFadeOut");

}

const Right_Side_Layout = [];

function checkRightSideLayout(el) {

  const i = Right_Side_Layout.indexOf(el)

  if (i > -1) Right_Side_Layout.splice(i, 1) // Remove
  else Right_Side_Layout.push(el); //Add

}

function updateRightSideLayout() {
  if (Right_Side_Layout.length === 0) return;

  const el1 = Right_Side_Layout[0];
  const el2 = Right_Side_Layout[1];

  if (el1.id === "Game_Info" && el2 === undefined) {
    setTimeout(() => {
      el1.classList.remove("GameInfoTop");
    }, 600);

  }

  if (el1.id === "Game_Info" && el2 && el2.id === "ImpressumWrapper") {
    el1.classList.add("GameInfoTop");
    AnimationDLY = 600;
  }

  if (el1.id === "ImpressumWrapper" && el2 && el2.id === "Game_Info") {
    console.log("test_2");
    el2.style.bottom = "100%";
    // el2.classList.add("GameInfoTop");
    // AnimationDLY = 1750;
    // setTimeout(() => AnimationDLY = 0, 1750);
  };
}











// Events 
window.addEventListener("DOMContentLoaded", loadEvents);

class Event {
  constructor(el, func) {
    this.el = el;
    this.func = func;
  }

  register() {
    if (!this.el) return;
    this.el.addEventListener("click", this.func);
  }
};

function loadEvents() {
  // const StartButton = new Event(document.querySelector(".StartButton"), () => setTimeout(OpenMenu, 1250));
  const StartButton = new Event(document.getElementById("Start_Button"), () => setTimeout(OpenMenu, 1250));
  const GameStatsButton = new Event(document.getElementById("Game_Stats"), () => ToggleElementVisibillity("Game_Info"));
  const GameSoundsButton = new Event(document.getElementById("Game_Sounds"), () => ToggleGameSounds());
  const KeyAssignmentButton = new Event(document.getElementById("Settings_Key_Assignment"), () => ToggleKeys());
  const GameInstructionsButton = new Event(document.getElementById("Game_Instructions"), () => alert("Not ready yet!"));
  const MuteElement = new Event(document.getElementById("Mute_Symbol"), () => ToggleGameSounds());
  const ImpressumButton = new Event(document.getElementById("InpressumButton"), () => ToggleElementVisibillity("ImpressumWrapper"));
  const ReloadButton = new Event(document.getElementById("ReloadButton"), () => setTimeout(() => { location.reload() }, 650));

  StartButton.register();
  GameStatsButton.register();
  GameSoundsButton.register();
  KeyAssignmentButton.register();
  GameInstructionsButton.register();
  MuteElement.register();
  ImpressumButton.register();
  ReloadButton.register();
}