let particles = [];
let fontGraphics;
let word1 = "los angeles"; // line 1
let word2 = "solar"; // line 2
let fontSize = 250;
let myFont;

function preload() {
    myFont = loadFont('misc/Ailerons-Typeface.otf');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    background(206, 255, 175); // STRUGGLING WITH COLORS I SHOULD HAVE TAKEN COLOR THEORY 
    noStroke();

    fontGraphics = createGraphics(width, height);
    fontGraphics.pixelDensity(1);
    fontGraphics.background(0);
    fontGraphics.textAlign(CENTER, CENTER);
    fontGraphics.textFont(myFont);
    fontGraphics.textSize(fontSize);
    fontGraphics.fill(255);

    // Draw first line con adjusted spacing
    let firstLineY = height / 2 - fontSize / 3; // spacing
    // Draw each character separately con custom spacing
    let firstLineX = width / 2 - (word1.length * fontSize * 0.2); // Start position for first line
    for (let i = 0; i < word1.length; i++) {
        fontGraphics.text(word1[i], firstLineX + (i * fontSize * 0.25), firstLineY);
    }

    //  second line con adjusted spacing
    let secondLineY = height / 2 + fontSize / 3; // spacing

    let secondLineX = width / 2 - (word2.length * fontSize * 0.2); // Start pos for second line
    for (let i = 0; i < word2.length; i++) {
        fontGraphics.text(word2[i], secondLineX + (i * fontSize * 0.25), secondLineY);
    }

    fontGraphics.loadPixels();

    for (let x = 0; x < width; x += 3) {
        for (let y = 0; y < height; y += 3) {
            let index = (x + y * width) * 4;
            let brightness = fontGraphics.pixels[index];
            if (brightness > 128) {
                particles.push(new Particle(x, y));
            }
        }
    }
}

function draw() {
    background(153, 204, 255, 80);
    blendMode(ADD);

    for (let p of particles) {
        p.update();
        p.showGlow();
    }

    for (let p of particles) {
        p.showCore();
    }

    blendMode(BLEND);
}

class Particle {
    constructor(x, y) {
        this.home = createVector(x, y);
        this.pos = createVector(x + random(-50, 50), y + random(-50, 50));
        this.vel = createVector();
        this.acc = createVector();
        this.colorShift = random(1000);
        this.wiggleOffset = random(1000);
    }

    update() {
        let mouse = createVector(mouseX, mouseY);
        let dir = p5.Vector.sub(this.pos, mouse);
        let d = dir.mag();
        if (d < 50) { // radius of effect
            dir.setMag(200 / d); // force strength
            this.acc.add(dir);
        }

        let homeForce = p5.Vector.sub(this.home, this.pos);
        homeForce.mult(0.03); // return force
        this.acc.add(homeForce);

        let wiggleStrength = 0.3; // wiggle for organism-y-ness
        this.acc.x += (noise(this.wiggleOffset + frameCount * 0.01) - 0.5) * wiggleStrength;
        this.acc.y += (noise(this.wiggleOffset + frameCount * 0.01 + 1000) - 0.5) * wiggleStrength;

        this.vel.add(this.acc);
        this.vel.mult(0.95); // Reduced damping, faster movement
        this.pos.add(this.vel);
        this.acc.mult(0);
    }

    showGlow() {
        fill(30, 120, 50, 20); // Dark green transparent
        ellipse(this.pos.x, this.pos.y, 3); // Reduced from 10 to 5
    }

    showCore() {
        //blendMode(NORMAL);
        fill(0, 51, 51, 200); // Darker green
        ellipse(this.pos.x, this.pos.y, 1);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}