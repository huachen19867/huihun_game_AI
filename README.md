# 回煞 / Return of the Soul

回煞是一款基于 Phaser 3 的民俗恐怖网页游戏原型，主题围绕雨夜、灵堂、纸人、供品和民间禁忌展开。项目目标是做一个可在浏览器中直接运行、便于学习和扩展的 2D 叙事探索游戏。

This is an early-stage open-source browser game prototype built with Phaser 3. It explores Chinese folk horror storytelling through a lightweight, static web game architecture.

## Features

- Phaser 3 browser game with no build step.
- Keyboard controls for desktop and virtual joystick controls for mobile.
- Scene-based structure with title, intro, boot, and game scenes.
- Data-driven map definitions in `src/data/Maps.js`.
- Inventory, interaction, sound, texture generation, and map management systems.
- Local static deployment support through GitHub Pages, Vercel, Netlify, or any static file server.

## Play Locally

### Windows quick start

Double-click:

```txt
StartGame.bat
```

The script starts a local server and opens the game in your browser.

### Manual start

Run the PowerShell server:

```powershell
.\server.ps1
```

Then open:

```txt
http://localhost:8000
```

You can also serve the repository with any static web server.

## Controls

### Desktop

- Move: `WASD` or arrow keys
- Interact / investigate: `Space` or `E`
- Mouse: click UI buttons

### Mobile

- Move: virtual joystick in the lower-left corner
- Interact: action button in the lower-right corner
- Landscape mode is recommended.

## Project Structure

```txt
.
├── index.html
├── phaser.min.js
├── StartGame.bat
├── server.ps1
├── src
│   ├── data
│   ├── entities
│   ├── scenes
│   └── systems
├── STORY.md
├── ROADMAP.md
└── DEV_LOG.md
```

## Documentation

- [Story draft](STORY.md)
- [Roadmap](ROADMAP.md)
- [Development log](DEV_LOG.md)

## Roadmap

The current roadmap focuses on:

- Refactoring the scene and map systems.
- Expanding explorable rooms and story events.
- Adding save/load support.
- Improving enemy behavior, hiding, puzzles, lighting, and sound.
- Publishing a stable playable demo through GitHub Pages.

## Open Source Maintenance

This repository is maintained as a solo open-source game project and learning example for indie browser game development. Contributions, issues, and suggestions are welcome, especially around:

- Phaser architecture cleanup
- Mobile controls
- Dialogue and narrative tooling
- Accessibility and UI polish
- Static deployment
- Bug reports and regression checks

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
