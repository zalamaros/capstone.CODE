let img;
let particles = [];
let clickSound = [];
let ambienceMap;

function preload() {
  img = loadImage('solarimgs/LAtopography.jpg');

  clickSound = [
    loadSound('sound/click1.mp3'),
    loadSound('sound/click2.mp3'),
    loadSound('sound/click3.mp3'),
    loadSound('sound/click4.mp3'),
    loadSound('sound/click5.mp3'),
    loadSound('sound/click6.mp3'),
  ];

  ambienceMap = loadSound('tracks/mapvarb.mp3');
}

function playRandomSound() {
  if (clickSound.length > 0) {
    const randomIndex = Math.floor(Math.random() * clickSound.length);
    clickSound[randomIndex].play();
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  image(img, 0, 0, windowWidth, windowHeight);
  img.resize(windowWidth, windowHeight); // resize image to match canvas
  img.loadPixels();


  for (let y = 0; y < img.height; y += 5) {
    for (let x = 0; x < img.width; x += 5) {
      let index = (x + y * img.width) * 4;
      let r = img.pixels[index];
      let g = img.pixels[index + 1];
      let b = img.pixels[index + 2];
      let brightness = (r + g + b) / 3;

      if (brightness < 200) {
        let elevation = map(brightness, 0, 255, 1, 0); // dark = higher elevation
        particles.push({
          baseX: x,
          baseY: y,
          elevation: elevation,
          size: map(elevation, 0, 1, 0.5, 7.5)
        });
      }
    }
  }
  if (ambienceMap) {
    ambienceMap.setVolume(0.5);
    ambienceMap.loop();
  }

}

function draw() {
  //background(232, 252, 255);
  background(13, 94, 78);
  noStroke();
  //fill(0, 102, 0, 100);
  fill(178, 255, 102, 255);

  for (let p of particles) {
    let dx = map(mouseX, 0, width, -9, 9) * p.elevation;
    let dy = map(mouseY, 0, height, -9, 9) * p.elevation;

    ellipse(p.baseX + dx, p.baseY + dy, p.size, p.size);
  }
}

const introTexts = [
  "The year is 2095.",
  "Welcome to the West Coast of the USA.",
  "As the Climate Crisis came to a tipping point in the year 2025,",
  "residents united and brought a total shift in infrastructure,",
  "in culture,",
  "in paradigm.",
  "Perfection is unattainable, indeed,",
  "but ceaselessly, we strive for the pursuit of it."
];

let textIndex = 0;
const overlay = document.getElementById("intro-overlay");
const introText = document.getElementById("intro-text");

// CHECK if previous page was intro.html (so introTexts does not play unnecessarily)
if (document.referrer && document.referrer.includes("intro.html")) {
  introText.textContent = introTexts[textIndex];

  overlay.addEventListener("click", () => {
    textIndex++;
    if (textIndex < introTexts.length) {
      playRandomSound();
      introText.textContent = introTexts[textIndex];
    } else {
      playRandomSound();
      overlay.style.display = "none"; // Hide text after done
    }
  });
} else {
  // hide intro if not coming from intro.html
  overlay.style.display = "none";
}


// Click sounds for location buttons
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".map-button, #conclusion-button");

  buttons.forEach(button => {
    button.addEventListener("click", (event) => {
      event.preventDefault(); // Prevent immediate nav
      const targetUrl = button.href;

      const sound = playRandomSound();
      if (sound) {
        sound.onended = () => {
          window.location.href = targetUrl; // Nav after the sound finishes
        };
      } else {
        window.location.href = targetUrl;
      }
    });
  });
});