# Tams Stat Calculator

A standalone desktop application for managing characters and NPCs in the Tams TTRPG system. Built with TypeScript and Electron.

## Features
- **Smart Resource Tracking**: Live calculation of Stat UPs, Skill UPs, and Major Skill Points.
- **Interactive Editors**: Easy-to-use interfaces for Stats and Skills with real-time cost feedback.
- **Major Skill Points (MSP)**: Correctly implement the 1-3 MSP floor rules per skill.
- **Automated GM Notes**: Automatic detection of "Talk to GM" scenarios (Elder phase, refunds, custom skill names, overspending).
- **Save/Load System**: Dedicated `characters/` and `npcs/` folders created next to the application for easy sharing.
- **Portable**: Run the single `.exe` file from any folder without installation.

## For Players & GMs (How to use)
1. **Download**: Go to the [Releases](https://github.com/TodoHamwich/TamsStatCalc/releases) page and download the latest `TamsStatCalculator.exe`.
2. **Run**: Place the `.exe` in its own folder (e.g., `Documents/Tams/`) and double-click to start.
3. **Save/Load**: The app will automatically create folders for your characters next to the `.exe`.
4. **Sharing**: To share a character with the GM, simply send the `.json` file from your `characters/` folder.

## For Developers (How to build)
1. Clone the repository.
2. Install dependencies: `npm install`
3. Build the project: `npm run build`
4. Run in development: `npm run start`
5. Package for distribution: `npm run dist`
