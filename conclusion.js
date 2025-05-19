let img;
let particles = [];

function preload() {
    img = loadImage('solarimgs/earth.png');

    clickSound = [
        loadSound('sound/click2.mp3'),
        loadSound('sound/click3.mp3'),
        loadSound('sound/click4.mp3')
    ];

    ambienceConcl = loadSound('tracks/conclusionvarb.mp3');
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
    img.resize(windowWidth, windowHeight); // resize img to match canvas
    img.loadPixels();

    for (let y = 0; y < img.height; y += 5) {
        for (let x = 0; x < img.width; x += 5) {
            let index = (x + y * img.width) * 4;
            let r = img.pixels[index];
            let g = img.pixels[index + 1];
            let b = img.pixels[index + 2];
            let brightness = (r + g + b) / 3;

            // Skip super light areas
            if (brightness < 200) {
                let elevation = map(brightness, 0, 255, 1, 0); // dark = higher elevation``
                particles.push({
                    baseX: x,
                    baseY: y,
                    elevation: elevation,
                    size: map(elevation, 0, 1, 0.5, 7.5),
                    color: [r, g, b, 200] // store original pixel color
                });
            }
        }
    }

    if (ambienceConcl) {
        ambienceConcl.setVolume(0.5); // adjust if needed
        ambienceConcl.loop(); //loop is not perfect, I can hear a sound break
    }
}

function draw() {
    background(0, 250);
    fill(255);
    circle(windowWidth / 2.1, windowHeight / 2, windowWidth * 0.54);
    noStroke();

    for (let p of particles) {
        // Offset on mouse position
        let dx = map(mouseX, 0, width, -9, 9) * p.elevation;
        let dy = map(mouseY, 0, height, -9, 9) * p.elevation;

        fill(p.color);
        ellipse(p.baseX + dx, p.baseY + dy, p.size, p.size);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const conclusionText = document.getElementById("conclusion-text");
    const pollContainer = document.getElementById("poll-container");
    const resultsContainer = document.getElementById("results-container");
    const resultsText = document.getElementById("results-text");
    const yesButton = document.getElementById("yes-button");
    const noButton = document.getElementById("no-button");
    const spinner = document.getElementById("loading-spinner");
    const restartLink = document.getElementById("restart");
    const pollDocRef = window.firebaseUtils.doc(window.firebaseUtils.db, "pollResponses", "global");

    async function updateVote(option) {
        const docSnap = await window.firebaseUtils.getDoc(pollDocRef);
        let data = { yes: 0, no: 0 }; // Default in case doc doesn't exist yet
        if (docSnap.exists()) {
            data = docSnap.data();
        }
        data[option] = (data[option] || 0) + 1; // increment the selected option
        await window.firebaseUtils.setDoc(pollDocRef, data); // update Firestore
        return data;
    }

    function showLoading() {

        spinner.style.display = "block"; // show spinner
        resultsText.textContent = ""; // clear text
        resultsContainer.style.display = "block"; // display results container
        pollContainer.style.display = "none"; // hide poll buttons

        const externalLink = document.getElementById("external-link");
        externalLink.style.pointerEvents = "none"; // Disable link & clicks
        externalLink.style.opacity = "0.0";
    };


    function showResults(data) {

        const totalResponses = data.yes + data.no;
        const yesPercentage = ((data.yes / totalResponses) * 100).toFixed(1);
        const noPercentage = ((data.no / totalResponses) * 100).toFixed(1);

        resultsText.innerHTML = `
        <div class="poll-result-item">
            <div class="poll-result-label">Yes</div>
            <div class="poll-result-percentage">${yesPercentage}%</div>
        </div>
        <div class="poll-result-item">
            <div class="poll-result-label">No</div>
            <div class="poll-result-percentage">${noPercentage}%</div>
        </div>
    `;

        //hide poll and spinner, show results
        pollContainer.style.display = "none";
        spinner.style.display = "none";
        resultsContainer.style.display = "block";
        restartLink.style.display = "block";

        const externalLink = document.getElementById("external-link");
        externalLink.style.pointerEvents = "auto"; // enable link again
        externalLink.style.opacity = "1";
    }

    function handleVote(option) {
        yesButton.disabled = true;
        noButton.disabled = true;

        conclusionText.style.display = "none";
        showLoading();

        const sound = playRandomSound();
        if (sound) {
            sound.onended = () => {
                updateVote(option)
                    .then((data) => showResults(data))
                    .catch((error) => {
                        console.error("Error updating vote:", error);
                        resultsText.textContent = "An error occurred. Please try again.";
                        spinner.style.display = "none";
                    });
            };
        } else {
            updateVote(option)
                .then((data) => showResults(data))
                .catch((error) => {
                    console.error("Error updating vote:", error);
                    resultsText.textContent = "An error occurred. Please try again.";
                    spinner.style.display = "none";
                });
        }
    }

    yesButton.addEventListener("click", () => handleVote("yes"));
    noButton.addEventListener("click", () => handleVote("no"));

    conclusionText.addEventListener("click", () => {
        const sound = playRandomSound();
        if (sound) {
            sound.onended = () => {
                conclusionText.textContent = "Is such a world possible?";
                conclusionText.style.cursor = "default";
                pollContainer.style.display = "block";
            };
        } else {
            conclusionText.textContent = "Is such a world possible?";
            conclusionText.style.cursor = "default";
            pollContainer.style.display = "block";
        }
    });
});