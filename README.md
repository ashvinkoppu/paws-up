# Paws Up

A cozy virtual pet care game where you adopt a furry friend and learn to manage your budget while keeping your pet happy and healthy.

## Prerequisites

Before you begin, you need to install Node.js on your computer.

### Installing Node.js

**On Mac:**
1. Open Terminal (press Cmd + Space, type "Terminal", press Enter)
2. Install Homebrew (if you don't have it) by pasting this command and pressing Enter:
   ```sh
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```
3. Install Node.js:
   ```sh
   brew install node
   ```

**On Windows:**
1. Go to https://nodejs.org/
2. Download the LTS (Long Term Support) version
3. Run the installer and follow the prompts (keep all default options)
4. Restart your computer after installation

**Verify Installation:**
Open Terminal (Mac) or Command Prompt (Windows) and run:
```sh
node --version
npm --version
```
You should see version numbers for both. If you see errors, restart your computer and try again.

## Running the Project

1. **Open Terminal/Command Prompt**
   - Mac: Press Cmd + Space, type "Terminal", press Enter
   - Windows: Press Windows key, type "cmd", press Enter

2. **Navigate to the project folder**
   ```sh
   cd /path/to/paws-prosper
   ```
   Replace `/path/to/paws-prosper` with the actual path to the project folder.

   Tip: You can drag the folder into the terminal to paste its path.

3. **Install dependencies**
   Run this command (only needed the first time, or after pulling new changes):
   ```sh
   npm install
   ```
   Wait for it to complete. This may take a few minutes.

4. **Start the development server**
   ```sh
   npm run dev
   ```

5. **Open the game in your browser**
   After running the command above, you'll see a message like:
   ```
   Local: http://localhost:5173/
   ```
   Open your web browser and go to that URL (usually http://localhost:5173/)

6. **Stop the server**
   When you're done, press `Ctrl + C` in the terminal to stop the server.

## Troubleshooting

**"npm: command not found"**
- Node.js isn't installed properly. Follow the installation steps above again.

**"EACCES permission denied"**
- On Mac, try running with sudo: `sudo npm install`

**"Cannot find module" errors**
- Delete the `node_modules` folder and `package-lock.json` file, then run `npm install` again.

**Page won't load in browser**
- Make sure the terminal shows the server is running
- Try http://localhost:5173/ (not https)
- Try a different browser

## Game Features

- Adopt and name your virtual pet (dog, cat, rabbit, or hamster)
- Keep your pet happy by feeding, playing, and caring for them
- Manage your budget wisely
- Play mini-games to earn extra money
- Unlock achievements as you progress

## Technologies Used

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
