import './style.css';
import * as PIXI from 'pixi.js';
import SoundEffects from './soundEffects.js';

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
let soundEffects = new SoundEffects();
let jumpSoundFrameCounter = 0;
let backgroundContainer = null;
let participantsContainer = null;

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
const toggleSoundBtn = document.getElementById('toggleSound');

// Initialize PixiJS Application
function initPixiApp() {
    if (app) {
        app.destroy(true);
    }
    
    const width = raceContainer.offsetWidth || 1200;
    const height = 600;
    
    // Create PixiJS application with settings for better browser compatibility
    app = new PIXI.Application({
        width,
        height,
        backgroundColor: 0x87CEEB, // Sky blue - brighter for outdoor village
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        backgroundAlpha: 1,
        preserveDrawingBuffer: false,
        clearBeforeRender: true,
    });
    
    raceContainer.innerHTML = '';
    raceContainer.appendChild(app.view);
    
    // Log renderer info for debugging
    console.log('PixiJS Renderer:', app.renderer.type === PIXI.RENDERER_TYPE.WEBGL ? 'WebGL' : 'Canvas');
    
    // Create layer containers for proper z-ordering
    backgroundContainer = new PIXI.Container();
    participantsContainer = new PIXI.Container();
    
    // Add containers to stage in correct order (background first, then participants on top)
    app.stage.addChild(backgroundContainer);
    app.stage.addChild(participantsContainer);
    
    // Draw village field background
    drawVillageBackground(width, height);
    // Draw race track
    drawRaceTrack(width, height);
    // Draw village elements
    drawVillageElements(width, height);
}

// Draw village field background
function drawVillageBackground(width, height) {
    const graphics = new PIXI.Graphics();
    
    // Sky gradient effect (lighter at top, darker at horizon)
    const skyTop = 0x87CEEB;
    const skyHorizon = 0xB0E0E6;
    
    // Draw sky with gradient simulation
    for (let i = 0; i < height * 0.5; i++) {
        const ratio = i / (height * 0.5);
        const r = Math.floor(135 + (176 - 135) * ratio);
        const g = Math.floor(206 + (224 - 206) * ratio);
        const b = Math.floor(235 + (230 - 235) * ratio);
        const color = (r << 16) + (g << 8) + b;
        
        graphics.beginFill(color);
        graphics.drawRect(0, i, width, 1);
        graphics.endFill();
    }
    
    // Add some clouds
    graphics.beginFill(0xFFFFFF, 0.6);
    // Cloud 1
    graphics.drawCircle(width * 0.2, height * 0.15, 30);
    graphics.drawCircle(width * 0.2 + 25, height * 0.15, 25);
    graphics.drawCircle(width * 0.2 + 45, height * 0.15, 20);
    // Cloud 2
    graphics.drawCircle(width * 0.6, height * 0.1, 35);
    graphics.drawCircle(width * 0.6 + 30, height * 0.1, 30);
    graphics.drawCircle(width * 0.6 + 55, height * 0.1, 25);
    // Cloud 3
    graphics.drawCircle(width * 0.85, height * 0.2, 25);
    graphics.drawCircle(width * 0.85 + 20, height * 0.2, 20);
    graphics.endFill();
    
    backgroundContainer.addChild(graphics);
}

// Draw village elements (trees, houses, fences)
function drawVillageElements(width, height) {
    const graphics = new PIXI.Graphics();
    
    // Draw distant mountains/hills
    graphics.beginFill(0x228B22, 0.3);
    graphics.moveTo(0, height * 0.5);
    graphics.lineTo(width * 0.3, height * 0.35);
    graphics.lineTo(width * 0.5, height * 0.4);
    graphics.lineTo(width * 0.7, height * 0.3);
    graphics.lineTo(width, height * 0.45);
    graphics.lineTo(width, height * 0.5);
    graphics.closePath();
    graphics.endFill();
    
    // Draw simple trees in background
    const treePositions = [
        { x: width * 0.1, y: height * 0.45 },
        { x: width * 0.25, y: height * 0.48 },
        { x: width * 0.88, y: height * 0.46 },
        { x: width * 0.95, y: height * 0.47 }
    ];
    
    treePositions.forEach(pos => {
        // Tree trunk
        graphics.beginFill(0x8B4513);
        graphics.drawRect(pos.x - 3, pos.y, 6, 25);
        graphics.endFill();
        
        // Tree foliage
        graphics.beginFill(0x228B22);
        graphics.drawCircle(pos.x, pos.y - 5, 12);
        graphics.drawCircle(pos.x - 8, pos.y + 5, 10);
        graphics.drawCircle(pos.x + 8, pos.y + 5, 10);
        graphics.endFill();
    });
    
    // Draw simple village house on the side
    const houseX = width * 0.05;
    const houseY = height * 0.48;
    
    // House body
    graphics.beginFill(0xD2691E);
    graphics.drawRect(houseX, houseY, 40, 30);
    graphics.endFill();
    
    // House roof
    graphics.beginFill(0x8B4513);
    graphics.moveTo(houseX - 5, houseY);
    graphics.lineTo(houseX + 20, houseY - 15);
    graphics.lineTo(houseX + 45, houseY);
    graphics.closePath();
    graphics.endFill();
    
    // Window
    graphics.beginFill(0x87CEEB);
    graphics.drawRect(houseX + 10, houseY + 10, 8, 8);
    graphics.drawRect(houseX + 22, houseY + 10, 8, 8);
    graphics.endFill();
    
    // Draw wooden fence posts
    for (let i = 0; i < 10; i++) {
        const fenceX = 100 + i * 30;
        if (fenceX < width - 100) {
            graphics.beginFill(0x8B4513);
            graphics.drawRect(fenceX, height * 0.52, 4, 15);
            graphics.endFill();
            
            // Horizontal fence rail
            graphics.beginFill(0x8B4513);
            graphics.drawRect(fenceX, height * 0.54, 28, 2);
            graphics.endFill();
        }
    }
    
    backgroundContainer.addChild(graphics);
}

// Draw the race track with start and finish lines
function drawRaceTrack(width, height) {
    const graphics = new PIXI.Graphics();
    
    // Ground/track - village field (more brownish-green)
    graphics.beginFill(0x9ACD32); // Yellow-green grass
    graphics.drawRect(0, height * 0.6, width, height * 0.4);
    graphics.endFill();
    
    // Add some grass texture with darker green patches
    graphics.beginFill(0x6B8E23, 0.3);
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * width;
        const y = height * 0.6 + Math.random() * (height * 0.4);
        graphics.drawCircle(x, y, 10 + Math.random() * 10);
    }
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
    backgroundContainer.addChild(startText);
    
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
    backgroundContainer.addChild(finishText);
    
    backgroundContainer.addChild(graphics);
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
    console.log('startRace called, participants:', participants.length);
    
    if (participants.length === 0) {
        alert('Please add participant names first!');
        return;
    }
    
    // Initialize sound effects
    soundEffects.init();
    
    // Play start sound (whistle)
    soundEffects.playStartSound();
    
    raceStarted = true;
    raceFinished = false;
    winner = null;
    startRaceBtn.disabled = true;
    jumpSoundFrameCounter = 0;
    
    const config = RACE_CONFIG[durationSelect.value];
    const width = app.view.width;
    const finishLineX = width - 60;
    const startX = 80;
    const raceDistance = finishLineX - startX;
    
    console.log('Race config:', {
        duration: config.duration,
        width,
        finishLineX,
        startX,
        raceDistance
    });
    
    // Assign random speeds to participants
    participants.forEach(sprite => {
        // Random speed variation (±30%)
        const speedVariation = 0.7 + Math.random() * 0.6;
        const targetSpeed = config.baseSpeed * speedVariation;
        sprite.participantData.speed = (raceDistance / config.duration) * targetSpeed * FPS_60_FRAME_TIME;
        sprite.participantData.progress = 0;
        sprite.participantData.jumpOffset = Math.random() * Math.PI * 2; // Random jump phase
        sprite.participantData.finished = false;
        sprite.participantData.lastJumpPhase = 0; // Track jump phase for sound
    });
    
    // Animation ticker
    let frameCount = 0;
    let loggedStart = false;
    animationTicker = function animate() {
        if (!raceStarted || raceFinished) return;
        
        frameCount++;
        jumpSoundFrameCounter++;
        
        // Log once to confirm animation is running
        if (!loggedStart) {
            console.log('Animation ticker started, participants:', participants.length);
            loggedStart = true;
        }
        
        // Play jump sound periodically (not every frame, to avoid audio overload)
        // Play approximately every 20 frames (about 3 jumps per second)
        if (jumpSoundFrameCounter % 20 === 0) {
            soundEffects.playJumpSound();
        }
        
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
                    console.log('Winner detected:', winner);
                    showWinner(winner);
                    // Play finish sound and crowd cheer
                    soundEffects.playFinishSound();
                    setTimeout(() => soundEffects.playCrowdCheer(), 300);
                }
            }
        });
    };
    app.ticker.add(animationTicker);
    console.log('Animation ticker added to PixiJS app, ticker running:', app.ticker.started);
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
    
    if (!app || !participantsContainer) {
        console.error('PixiJS app or participants container not initialized');
        return;
    }
    
    console.log(`Creating ${names.length} participants`);
    
    // Create new participants
    names.forEach((name, index) => {
        const sprite = createParticipant(name, index, names.length);
        participants.push(sprite);
        participantsContainer.addChild(sprite);
    });
    
    // Position them
    positionParticipants(participants);
    
    console.log(`${participants.length} participants created and positioned`);
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

// Toggle sound effects
toggleSoundBtn.addEventListener('click', () => {
    const enabled = soundEffects.toggleSound();
    toggleSoundBtn.textContent = enabled ? '🔊 Sound ON' : '🔇 Sound OFF';
    toggleSoundBtn.className = enabled 
        ? 'px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition'
        : 'px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition';
});

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
