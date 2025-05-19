let showTitle = true;
let exploreButton;
let particles = [];
let fontGraphics;
let word1 = "los angeles"; // line 1
let word2 = "solar"; // line 2
let fontSize = 225;
let myFont;
let click1;
let ambienceIntro;

function preload() {
    myFont = loadFont('fonts/Azedo-Bold.otf');
    click1 = loadSound('sound/click1.mp3');
    ambienceIntro = loadSound('tracks/introvarb.mp3');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    textAlign(CENTER, CENTER);
    textSize(32);
    noStroke();

    if (ambienceIntro) {
        ambienceIntro.setVolume(0.5);
        ambienceIntro.loop();
    }

    fontGraphics = createGraphics(1500, height);
    fontGraphics.pixelDensity(1);
    fontGraphics.background(0);
    fontGraphics.textAlign(CENTER, CENTER);
    fontGraphics.textFont(myFont);
    fontGraphics.textSize(fontSize);
    fontGraphics.fill(255);

    // first line + adjusted spacing
    let firstLineY = height / 2 - fontSize / 3;
    let firstLineX = 750 - (word1.length * fontSize * 0.25); // positioning
    for (let i = 0; i < word1.length; i++) {
        fontGraphics.text(word1[i], firstLineX + (i * fontSize * 0.43), firstLineY);
    }

    // second line + adjusted spacing
    let secondLineY = height / 2 + fontSize / 3.8;
    let secondLineX = 750 - (word2.length * fontSize * 0.12); //positioning
    for (let i = 0; i < word2.length; i++) {
        fontGraphics.text(word2[i], secondLineX + (i * fontSize * 0.43), secondLineY);
    }

    fontGraphics.loadPixels();

    for (let x = 0; x < 1500; x += 2) {
        for (let y = 0; y < height; y += 3) {
            let index = (x + y * 1500) * 4;
            let brightness = fontGraphics.pixels[index];
            if (brightness > 128) {
                particles.push(new Particle(x, y));
            }
        }
    }

    // Nav to map
    exploreButton = createButton("explore");
    exploreButton.id('start-button');
    exploreButton.style('font-family', 'Azedo-Bold');
    exploreButton.mousePressed(() => {
        click1.play();
        click1.onended(() => {
            window.location.href = "solarMAP.html"; // finish nav after clickie sound is done
        });
    });
    exploreButton.position(width * 0.8, height / 2);

}

function draw() {

    let r = map(mouseX, 0, width, 0, 13);
    let g = map(mouseY, 0, height, 80, 99);
    let b = map(mouseX, 0, width, 65, 90);

    if (showTitle) {
        background(r, g, b);
        for (let p of particles) {
            p.update();
        }
        for (let p of particles) {
            p.showCore();
        }
        blendMode(BLEND);
    } else {
        background(0);
    }
}

class Particle {
    constructor(x, y) {
        this.home = createVector(x, y);
        this.pos = createVector(x + random(-50, 50), y + random(-50, 50));
        this.vel = createVector();
        this.acc = createVector();
        this.wiggleOffset = random(1000);
        this.dia = random(1, 2.5);
    }

    update() {
        let mouse = createVector(mouseX, mouseY);
        let dir = p5.Vector.sub(this.pos, mouse);
        let d = dir.mag();
        if (d < 50) {
            dir.setMag(200 / d);
            this.acc.add(dir);
        }

        let homeForce = p5.Vector.sub(this.home, this.pos);
        homeForce.mult(0.03);
        this.acc.add(homeForce);

        let wiggleStrength = 0.3;
        this.acc.x += (noise(this.wiggleOffset + frameCount * 0.01) - 0.5) * wiggleStrength;
        this.acc.y += (noise(this.wiggleOffset + frameCount * 0.01 + 1000) - 0.5) * wiggleStrength;

        this.vel.add(this.acc);
        this.vel.mult(0.95);
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    showCore() {
        fill(178, 255, 102);
        ellipse(this.pos.x, this.pos.y, this.dia);
    }
}

function windowResized() {
    resizeCanvas(4000, windowHeight);
}