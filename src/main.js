import './style.css';
import * as PIXI from 'pixi.js';

// Race configuration
const RACE_CONFIG = {
    fast: { duration: 15000, baseSpeed: 1.0 },
    medium: { duration: 30000, baseSpeed: 0.5 },
    slow: { duration: 60000, baseSpeed: 0.25 }
};

// Animation constants
const FPS_60_FRAME_TIME = 16.67; // milliseconds per frame at 60fps
const JUMP_SPEED = 0.15;
const JUMP_HEIGHT = 15;

// Global state
let app = null;
let participants = [];
let raceStarted = false;
let raceFinished = false;
let winner = null;
let animationTicker = null;

// DOM elements
const participantsTextarea = document.getElementById('participants');
const durationSelect = document.getElementById('duration');
const startRaceBtn = document.getElementById('startRace');
const resetRaceBtn = document.getElementById('resetRace');
const generateNamesBtn = document.getElementById('generateNames');
const participantCount = document.getElementById('participantCount');
const winnerModal = document.getElementById('winnerModal');
const winnerNameEl = document.getElementById('winnerName');
const closeModalBtn = document.getElementById('closeModal');
const raceContainer = document.getElementById('raceContainer');

// Initialize PixiJS Application
function initPixiApp() {
    if (app) {
        app.destroy(true);
    }
    
    const width = raceContainer.offsetWidth || 1200;
    const height = 600;
    
    app = new PIXI.Application({
        width,
        height,
        backgroundColor: 0x87CEEB, // Sky blue
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
    });
    
    raceContainer.innerHTML = '';
    raceContainer.appendChild(app.view);
    
    // Draw race track
    drawRaceTrack(width, height);
}

// Draw the race track with start and finish lines
function drawRaceTrack(width, height) {
    const graphics = new PIXI.Graphics();
    
    // Ground/track
    graphics.beginFill(0x90EE90); // Light green
    graphics.drawRect(0, height * 0.6, width, height * 0.4);
    graphics.endFill();
    
    // Start line (red)
    graphics.beginFill(0xFF0000);
    graphics.drawRect(50, height * 0.5, 5, height * 0.5);
    graphics.endFill();
    
    const startText = new PIXI.Text('START', {
        fontSize: 20,
        fill: 0xFF0000,
        fontWeight: 'bold'
    });
    startText.x = 10;
    startText.y = height * 0.45;
    app.stage.addChild(startText);
    
    // Finish line (checkered pattern simulation)
    graphics.beginFill(0x000000);
    graphics.drawRect(width - 55, height * 0.5, 5, height * 0.5);
    graphics.endFill();
    
    const finishText = new PIXI.Text('FINISH', {
        fontSize: 20,
        fill: 0x000000,
        fontWeight: 'bold'
    });
    finishText.x = width - 90;
    finishText.y = height * 0.45;
    app.stage.addChild(finishText);
    
    app.stage.addChild(graphics);
}

// Create a sack icon using PIXI Graphics
function createSackIcon(color = 0x8B4513) {
    const container = new PIXI.Container();
    const graphics = new PIXI.Graphics();
    
    // Draw sack body
    graphics.beginFill(color);
    graphics.drawRoundedRect(-10, -15, 20, 30, 5);
    graphics.endFill();
    
    // Draw sack opening
    graphics.beginFill(0x654321);
    graphics.drawEllipse(0, -15, 10, 4);
    graphics.endFill();
    
    // Draw tie
    graphics.lineStyle(2, 0x000000);
    graphics.moveTo(-8, -12);
    graphics.lineTo(8, -12);
    
    container.addChild(graphics);
    return container;
}

// Create participant sprite with sack and name
function createParticipant(name, index, totalParticipants) {
    const container = new PIXI.Container();
    
    // Random color for variety
    const colors = [0x8B4513, 0xA0522D, 0xD2691E, 0xCD853F, 0xDEB887];
    const color = colors[index % colors.length];
    
    const sack = createSackIcon(color);
    container.addChild(sack);
    
    // Add name label
    const nameText = new PIXI.Text(name, {
        fontSize: 10,
        fill: 0x000000,
        fontWeight: 'bold'
    });
    nameText.anchor.set(0.5);
    nameText.y = 20;
    container.addChild(nameText);
    
    // Store participant data
    container.participantData = {
        name,
        baseY: 0,
        jumpOffset: 0,
        speed: 0,
        progress: 0,
        finished: false
    };
    
    return container;
}

// Position participants in a grid
function positionParticipants(participantSprites) {
    const width = app.view.width;
    const height = app.view.height;
    const count = participantSprites.length;
    
    // Calculate rows and columns to fit all participants
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    
    const startX = 80;
    const verticalSpace = (height * 0.5) / rows;
    const horizontalSpacing = 30;
    
    participantSprites.forEach((sprite, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        
        sprite.x = startX + (col * horizontalSpacing);
        sprite.y = (height * 0.55) + (row * verticalSpace);
        sprite.participantData.baseY = sprite.y;
        
        // Scale down if too many participants
        if (count > 50) {
            const scale = Math.max(0.3, 1 - (count - 50) / 200);
            sprite.scale.set(scale);
        }
    });
}

// Start the race animation
function startRace() {
    if (participants.length === 0) {
        alert('Please add participant names first!');
        return;
    }
    
    raceStarted = true;
    raceFinished = false;
    winner = null;
    startRaceBtn.disabled = true;
    
    const config = RACE_CONFIG[durationSelect.value];
    const width = app.view.width;
    const finishLineX = width - 60;
    const startX = 80;
    const raceDistance = finishLineX - startX;
    
    // Assign random speeds to participants
    participants.forEach(sprite => {
        // Random speed variation (±30%)
        const speedVariation = 0.7 + Math.random() * 0.6;
        const targetSpeed = config.baseSpeed * speedVariation;
        sprite.participantData.speed = (raceDistance / config.duration) * targetSpeed * FPS_60_FRAME_TIME;
        sprite.participantData.progress = 0;
        sprite.participantData.jumpOffset = Math.random() * Math.PI * 2; // Random jump phase
        sprite.participantData.finished = false;
    });
    
    // Animation ticker
    let frameCount = 0;
    animationTicker = function animate() {
        if (!raceStarted || raceFinished) return;
        
        frameCount++;
        
        participants.forEach(sprite => {
            const data = sprite.participantData;
            
            if (!data.finished) {
                // Update horizontal position
                sprite.x += data.speed;
                data.progress = sprite.x - startX;
                
                // Jumping animation (sine wave on Y-axis)
                const jumpY = Math.sin(frameCount * JUMP_SPEED + data.jumpOffset) * JUMP_HEIGHT;
                sprite.y = data.baseY + jumpY;
                
                // Check if crossed finish line
                if (sprite.x >= finishLineX && !winner) {
                    data.finished = true;
                    winner = data.name;
                    raceFinished = true;
                    showWinner(winner);
                }
            }
        });
    };
    app.ticker.add(animationTicker);
}

// Reset the race
function resetRace() {
    raceStarted = false;
    raceFinished = false;
    winner = null;
    startRaceBtn.disabled = false;
    
    if (app && app.ticker) {
        if (animationTicker) {
            app.ticker.remove(animationTicker);
            animationTicker = null;
        }
        app.ticker.stop();
        app.ticker.start();
    }
    
    // Re-initialize
    initPixiApp();
    
    const names = getParticipantNames();
    if (names.length > 0) {
        createParticipants(names);
    }
}

// Show winner modal
function showWinner(name) {
    winnerNameEl.textContent = name;
    winnerModal.classList.remove('hidden');
}

// Close winner modal
function closeWinnerModal() {
    winnerModal.classList.add('hidden');
}

// Get participant names from textarea
function getParticipantNames() {
    const text = participantsTextarea.value.trim();
    if (!text) return [];
    
    const names = text.split('\n')
        .map(name => name.trim())
        .filter(name => name.length > 0)
        .slice(0, 200); // Limit to 200
    
    return names;
}

// Create participant sprites
function createParticipants(names) {
    // Clear existing participants
    participants.forEach(sprite => {
        if (sprite.parent) {
            sprite.parent.removeChild(sprite);
        }
    });
    participants = [];
    
    // Create new participants
    names.forEach((name, index) => {
        const sprite = createParticipant(name, index, names.length);
        participants.push(sprite);
        app.stage.addChild(sprite);
    });
    
    // Position them
    positionParticipants(participants);
}

// Generate 200 sample names
function generateSampleNames() {
    const firstNames = [
        'Ali', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fitri', 'Gita', 'Hadi', 'Indah', 'Joko',
        'Kartika', 'Lutfi', 'Maya', 'Nando', 'Olivia', 'Putra', 'Qori', 'Rina', 'Siti', 'Tono',
        'Umar', 'Vina', 'Wawan', 'Xavier', 'Yuni', 'Zaki', 'Amir', 'Bella', 'Chandra', 'Dina'
    ];
    
    const lastNames = [
        'Santoso', 'Wijaya', 'Pratama', 'Kusuma', 'Saputra', 'Permana', 'Nugroho', 'Hidayat',
        'Rahman', 'Setiawan', 'Gunawan', 'Firmansyah', 'Kurniawan', 'Susanto', 'Lestari',
        'Wibowo', 'Hermawan', 'Widodo', 'Hakim', 'Putra', 'Sari', 'Ramadhan', 'Arifin', 'Hasan'
    ];
    
    const names = [];
    for (let i = 0; i < 200; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const number = (i + 1).toString().padStart(3, '0');
        names.push(`${firstName} ${lastName} ${number}`);
    }
    
    participantsTextarea.value = names.join('\n');
    updateParticipantCount();
}

// Update participant count display
function updateParticipantCount() {
    const names = getParticipantNames();
    participantCount.textContent = `${names.length} participant${names.length !== 1 ? 's' : ''}`;
    
    // Update race visualization if not started
    if (!raceStarted && app) {
        createParticipants(names);
    }
}

// Event listeners
startRaceBtn.addEventListener('click', startRace);
resetRaceBtn.addEventListener('click', resetRace);
generateNamesBtn.addEventListener('click', generateSampleNames);
participantsTextarea.addEventListener('input', updateParticipantCount);
closeModalBtn.addEventListener('click', closeWinnerModal);

// Close modal when clicking outside
winnerModal.addEventListener('click', (e) => {
    if (e.target === winnerModal) {
        closeWinnerModal();
    }
});

// Initialize on load
window.addEventListener('load', () => {
    initPixiApp();
    updateParticipantCount();
});

// Handle window resize
window.addEventListener('resize', () => {
    if (!raceStarted) {
        resetRace();
    }
});
