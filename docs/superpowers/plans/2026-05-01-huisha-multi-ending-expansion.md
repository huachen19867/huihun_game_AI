# Huisha Multi Ending Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand 《回煞》 into a 20-30 minute multi-ending experience with school, hospital, and crash-site memory maps.

**Architecture:** Keep the existing Phaser 3 scene structure and `window.globalGameState`, adding a small `storyFlags` state object plus data-driven interaction fields on map objects. New maps remain in `src/data/Maps.js`, while `MapManager.js` gets generic object support so new narrative objects do not require a custom branch each time.

**Tech Stack:** Phaser 3, ES modules, static HTML, PowerShell/Node smoke checks, in-app browser verification.

---

### Task 1: State And Ending Helpers

**Files:**

- Modify: `src/scenes/TitleScene.js`
- Modify: `src/scenes/GameScene.js`
- Modify: `src/systems/InteractionManager.js`

- [ ] **Step 1: Add a reusable default state shape**

Add the same `storyFlags` shape wherever `window.globalGameState` is initialized:

```js
storyFlags: {
    clues: { control: 0, illness: 0, death: 0 },
    collectedClues: [],
    memories: { school: false, hospital: false, crash: false },
    endingChoice: null
},
sanity: 100,
```

- [ ] **Step 2: Add compatibility normalization in `GameScene.create`**

After `this.gameState = window.globalGameState;`, call a new method:

```js
this.normalizeGameState();
```

Add the method to `GameScene`:

```js
normalizeGameState() {
    if (!this.gameState.storyFlags) {
        this.gameState.storyFlags = {};
    }
    if (!this.gameState.storyFlags.clues) {
        this.gameState.storyFlags.clues = { control: 0, illness: 0, death: 0 };
    }
    if (!this.gameState.storyFlags.collectedClues) {
        this.gameState.storyFlags.collectedClues = [];
    }
    if (!this.gameState.storyFlags.memories) {
        this.gameState.storyFlags.memories = { school: false, hospital: false, crash: false };
    }
    if (this.gameState.storyFlags.endingChoice === undefined) {
        this.gameState.storyFlags.endingChoice = null;
    }
    if (typeof this.gameState.sanity !== 'number' || Number.isNaN(this.gameState.sanity)) {
        this.gameState.sanity = 100;
    }
}
```

- [ ] **Step 3: Add clue and ending helpers to `InteractionManager`**

Add helper methods on the class:

```js
ensureStoryFlags() {
    if (!this.gameState.storyFlags) {
        this.gameState.storyFlags = {
            clues: { control: 0, illness: 0, death: 0 },
            collectedClues: [],
            memories: { school: false, hospital: false, crash: false },
            endingChoice: null
        };
    }
    return this.gameState.storyFlags;
}

collectClue(clueId, clueType) {
    const flags = this.ensureStoryFlags();
    if (!clueId || !clueType || flags.collectedClues.includes(clueId)) return false;
    flags.collectedClues.push(clueId);
    flags.clues[clueType] = (flags.clues[clueType] || 0) + 1;
    return true;
}

getTruthLevel() {
    const flags = this.ensureStoryFlags();
    const clues = flags.clues;
    if ((clues.control || 0) >= 2 && (clues.illness || 0) >= 2 && (clues.death || 0) >= 2) return 'complete';
    if ((clues.control || 0) >= 1 && (clues.illness || 0) >= 1) return 'family';
    return 'surface';
}
```

- [ ] **Step 4: Run syntax smoke check**

Run:

```powershell
node --check src\scenes\GameScene.js
node --check src\scenes\TitleScene.js
node --check src\systems\InteractionManager.js
```

Expected: all commands return exit code 0.

### Task 2: Generic Narrative Object Support

**Files:**

- Modify: `src/systems/MapManager.js`
- Modify: `src/systems/InteractionManager.js`

- [ ] **Step 1: Add generic narrative object creation**

In `MapManager.createObjects`, add a branch for `objs.interactables` before doors are created:

```js
if (objs.interactables) {
    objs.interactables.forEach(data => {
        const texture = data.texture || 'trash_paper';
        const item = this.scene.add.image(data.x, data.y, texture);
        if (data.tint !== undefined) item.setTint(data.tint);
        if (data.alpha !== undefined) item.setAlpha(data.alpha);
        if (isHorror && !scene.isMobile) item.setPipeline('Light2D');
        scene.physics.add.existing(item, true);
        item.objId = data.id;
        item.dialog = data.dialog;
        item.documentTitle = data.documentTitle;
        item.documentText = data.documentText;
        item.clueId = data.clueId;
        item.clueType = data.clueType;
        item.memoryTrigger = data.memoryTrigger;
        item.memoryReturn = data.memoryReturn;
        item.memoryComplete = data.memoryComplete;
        item.endingChoice = data.endingChoice;
        item.endingWeight = data.endingWeight;
        this.scene.interactables.add(item);
    });
}
```

- [ ] **Step 2: Teach `InteractionManager` to classify generic narrative objects**

In the type detection section, add:

```js
else if (obj.memoryTrigger || obj.clueType || obj.documentText || obj.endingChoice) type = 'story_object';
```

- [ ] **Step 3: Implement `story_object` behavior**

Inside `executeLogic`, before older hard-coded object branches:

```js
if (type === 'story_object') {
    const afterClue = () => {
        if (obj.memoryComplete) {
            const flags = this.ensureStoryFlags();
            flags.memories[obj.memoryComplete] = true;
        }
        if (obj.memoryTrigger) {
            scene.switchScene(obj.memoryTrigger.mapId, obj.memoryTrigger.x, obj.memoryTrigger.y);
            return;
        }
        if (obj.memoryReturn) {
            scene.switchScene(obj.memoryReturn.mapId, obj.memoryReturn.x, obj.memoryReturn.y);
            return;
        }
        if (obj.endingChoice) {
            this.handleEndingChoice(obj.endingChoice);
        }
    };
    if (obj.clueId && obj.clueType) this.collectClue(obj.clueId, obj.clueType);
    if (obj.documentText) {
        window.showDocument(obj.documentTitle || '线索', obj.documentText);
        afterClue();
    } else {
        afterClue();
    }
    return;
}
```

- [ ] **Step 4: Add `handleEndingChoice` method**

Add:

```js
handleEndingChoice(choice) {
    const scene = this.scene;
    const flags = this.ensureStoryFlags();
    flags.endingChoice = choice;
    if (choice === 'leave') {
        window.showDialog('主角', '我不再回头了。雨声还在，可那座宅子终于离我越来越远。', () => {
            scene.cameras.main.fadeOut(2500, 255, 255, 255);
            scene.time.delayedCall(2500, () => {
                window.showEndingScreen('结局：归路', '你承认了死亡，也承认了自己曾经拼命想离开。路的尽头没有家，只有终于安静下来的雨。', () => {
                    scene.scene.start('TitleScene');
                    window.globalGameState = null;
                });
            });
        });
        return;
    }
    if (choice === 'return') {
        window.showDialog('主角', '如果这就是我最后一次回家，那至少让我亲手推开那扇门。', () => {
            scene.switchScene('room_memory', 320, 400);
        });
    }
}
```

- [ ] **Step 5: Run syntax smoke check**

Run:

```powershell
node --check src\systems\MapManager.js
node --check src\systems\InteractionManager.js
```

Expected: both commands return exit code 0.

### Task 3: Add New Maps And Old-House Anchors

**Files:**

- Modify: `src/data/Maps.js`

- [ ] **Step 1: Add old-house links**

Add doors from `room_corridor` to `room_study` and `room_medicine`:

```js
{ x: 0, y: 11, w: 1, h: 2, targetMap: 'room_study', targetX: 448, targetY: 208 },
{ x: 0, y: 8, w: 1, h: 2, targetMap: 'room_medicine', targetX: 448, targetY: 208 },
```

- [ ] **Step 2: Add `room_study`**

Create a 16x12 room with a desk, award note, father note, and school memory trigger. Use `interactables` with `clueType: 'control'` and `memoryTrigger: { mapId: 'memory_school', x: 240, y: 320 }`.

- [ ] **Step 3: Add `room_medicine`**

Create a 16x12 room with medicine cabinet, prescription, payment slip, and hospital memory trigger. Use `interactables` with `clueType: 'illness'` and `memoryTrigger: { mapId: 'memory_hospital', x: 80, y: 240 }`.

- [ ] **Step 4: Add `memory_school`**

Create a classroom/corridor map with blackboard, desk, report cards, a final paper stack, and a return object with `memoryComplete: 'school'`.

- [ ] **Step 5: Add `memory_hospital`**

Create a hospital corridor map with consultation window, torn prescription, unpaid bill, ward door, and a return object with `memoryComplete: 'hospital'`.

- [ ] **Step 6: Add `memory_crash`**

Create a crash-site map with broken car, guardrail, toy plane, two final choice objects, and death clues. Choice objects use `endingChoice: 'leave'` and `endingChoice: 'return'`.

- [ ] **Step 7: Run module import smoke check**

Run:

```powershell
node -e "import('./src/data/Maps.js').then(m=>console.log(Object.keys(m.Maps).filter(k=>k.includes('memory')||k.includes('study')||k.includes('medicine')).join(',')))"
```

Expected output includes `room_study`, `room_medicine`, `memory_school`, `memory_hospital`, and `memory_crash`.

### Task 4: Route Existing Story Into New Endings

**Files:**

- Modify: `src/systems/InteractionManager.js`
- Modify: `src/scenes/GameScene.js`

- [ ] **Step 1: Award clue types from existing interactions**

Add `collectClue` calls to existing family rules, medical record, diary, toy plane, locked window, well/red key, coffin, and basement notes interactions. Use these IDs:

```js
this.collectClue('family_rules', 'control');
this.collectClue('medical_record', 'illness');
this.collectClue('diary_mother', 'illness');
this.collectClue('toy_plane', 'death');
this.collectClue('locked_window', 'control');
this.collectClue('well_red_key', 'death');
this.collectClue('coffin_truth', 'death');
```

- [ ] **Step 2: Replace exit-door ending gate**

Change `exit_door` logic so `surface` truth level gives “破茧”, `family` truth level gives “回煞”, and `complete` truth level opens `memory_crash` instead of immediately ending.

- [ ] **Step 3: Add crash route after real ending trigger**

When `triggerRealEnding()` completes, if `storyFlags` has complete truth, route to `memory_crash`; otherwise keep the existing `room_memory` route.

- [ ] **Step 4: Add memory-return atmosphere hook**

In `GameScene.create`, after room intro dialogs, show a one-time dialogue when returning from completed school or hospital memory and entering `room_corridor`.

- [ ] **Step 5: Run syntax smoke check**

Run:

```powershell
node --check src\systems\InteractionManager.js
node --check src\scenes\GameScene.js
```

Expected: both commands return exit code 0.

### Task 5: Verification, Logs, And Playable Check

**Files:**

- Create: `tools/verify_maps.mjs`
- Modify: `DEV_LOG.md`

- [ ] **Step 1: Add map verification script**

Create `tools/verify_maps.mjs` that imports `Maps`, checks every door target exists, checks each map has `objects.playerStart`, and checks each `interactables` entry with `clueType` has a `clueId`.

- [ ] **Step 2: Run verification script**

Run:

```powershell
node tools\verify_maps.mjs
```

Expected: `Map verification passed`.

- [ ] **Step 3: Run syntax checks**

Run:

```powershell
node --check src\scenes\GameScene.js
node --check src\scenes\TitleScene.js
node --check src\systems\InteractionManager.js
node --check src\systems\MapManager.js
node --check src\data\Maps.js
```

Expected: all commands return exit code 0.

- [ ] **Step 4: Verify in browser**

Run or reuse a local static server, open `http://127.0.0.1:8000/`, confirm title screen renders, start the game, and confirm console has no errors.

- [ ] **Step 5: Update technical log**

Add a new top entry in `DEV_LOG.md` dated `2026-05-01`, summarizing implemented maps, story flags, ending routing, and verification results.

### Task 6: Optional Generated Asset Pass

**Files:**

- Create: `assets/generated/`
- Modify: `src/systems/TextureGenerator.js`
- Modify: `src/systems/MapManager.js`

- [ ] **Step 1: Decide whether generated art is needed after the gameplay path works**

Only generate assets if the procedural textures make the new memory maps too visually samey. Priority candidates are a classroom blackboard, hospital corridor backdrop, and crash-site key visual.

- [ ] **Step 2: Generate and wire one asset at a time**

Save generated images under `assets/generated/`, load them in `TextureGenerator` or `BootScene`, and place them as non-blocking background images in `MapManager`.

- [ ] **Step 3: Verify rendering**

Open each new memory map and confirm the generated image renders without obscuring player, doors, or interactable prompts.

---

## Self-Review Notes

The plan covers the confirmed spec: memory maps, old-house anchors, three clue types, four endings, mobile/collision constraints, and verification. The only optional scope is generated art, intentionally deferred until the playable path works so the project becomes complete before it becomes prettier. This project is not a git repository, so commit steps are omitted.
