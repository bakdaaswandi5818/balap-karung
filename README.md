# Balap Karung - Sack Race

A fun and interactive sack race web application built with PixiJS and Tailwind CSS. Watch up to 200 participants compete in a virtual sack race with realistic village field background and sound effects!

## Features

- 🎮 Support for up to 200 participants
- 🎨 Beautiful village field background with clouds, hills, trees, and houses
- 🔊 Procedural sound effects (start whistle, jumping sounds, winner celebration)
- ⚡ Smooth 60fps animation using PixiJS
- 📊 Three race duration modes: Fast (15s), Medium (30s), Slow (60s)
- 🎯 Automatic winner detection with celebratory modal

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)

## Installation

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/bakdaaswandi5818/balap-karung.git
   cd balap-karung
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

## How to Run

### Development Mode

To run the application in development mode with hot reload:

```bash
npm run dev
```

The application will start on `http://localhost:5173/` (or another port if 5173 is busy). Open this URL in your web browser.

### Build for Production

To build the application for production:

```bash
npm run build
```

The built files will be generated in the `dist/` directory.

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

## Usage

1. **Add Participants**: 
   - Enter participant names in the textarea (one name per line)
   - Or click "Generate 200 Names" to auto-populate with sample names

2. **Configure Race**:
   - Select race duration from the dropdown (Fast/Medium/Slow)
   - Toggle sound effects ON/OFF using the sound button

3. **Start Race**:
   - Click "🏁 Start Race!" button
   - Watch participants jump across the village field
   - Listen to fun sound effects (if enabled)

4. **View Winner**:
   - The first participant to cross the finish line wins
   - Winner modal appears with celebration sounds
   - Click "Reset Race" to start a new race

## Technologies Used

- **PixiJS 7.3.3** - WebGL rendering engine for smooth animations
- **Tailwind CSS 3.4.1** - Utility-first CSS framework
- **Vite 5.0.12** - Fast build tool and development server
- **Web Audio API** - Procedural sound effects generation

## Project Structure

```
balap-karung/
├── index.html              # Main HTML file
├── src/
│   ├── main.js            # Main application logic
│   ├── soundEffects.js    # Sound effects module
│   └── style.css          # Tailwind CSS imports
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind configuration
└── postcss.config.js      # PostCSS configuration
```

## Browser Compatibility

This application works best on modern browsers with WebGL support:
- Chrome/Edge (recommended)
- Firefox
- Safari

## License

ISC