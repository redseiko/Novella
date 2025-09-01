# Story Generation Guidelines for Novella

This document outlines the best practices and structural conventions for creating new story content for the "Novella" game engine. Following these guidelines ensures consistency, quality, and compatibility with the game's systems.

## 1. Core Principles

- **Player Agency is Key**: Choices should feel meaningful. Even small "explore" options should provide context or flavor that enriches the world.
- **Show, Don't Tell**: Use the Narrator and character dialogue to build the world organically. Avoid long, dry exposition dumps.
- **Atmosphere is Everything**: The dialogue, descriptions, and choices should all contribute to the game's dark, mysterious, and slightly surreal tone.
- **Embrace the Meta-Narrative**: The game is aware that it is a story. The Narrator is a character. Use this to create unique and unsettling player experiences.

## 2. Story File Structure (`public/stories/{story-name}/story.json`)

Each story is a single JSON file located in the `public/stories` directory. The main JSON object has several top-level keys: `id`, `metadata`, `speakerColors`, `gameData`, and `backgroundsMap`.

### Scene Structure (within `gameData`)

Each scene is an object inside the `gameData` object. It must adhere to the following structure:

```json
"scene-id": {
  "id": "scene-id",
  "backgroundKey": "background-name",
  "dialogue": [
    { "speaker": "SpeakerName", "line": "Dialogue text goes here." }
  ],
  "choices": [
    { "id": "unique-choice-id", "text": "[A player action.]", "nextSceneId": "next-scene-id", "type": "action" }
  ]
}
```

- **`id`**: A unique, kebab-case identifier for the scene. This must match the key of the scene object.
- **`backgroundKey`**: A string that maps to a key within the story's `backgroundsMap` object.
- **`dialogue`**: An array of `DialogueLine` objects.
  - **`speaker`**: The name of the character speaking. Valid speakers are defined in the story's `speakerColors` map.
  - **`line`**: The line of dialogue. Keep it reasonably short to fit within the dialogue box and feel natural with the typing animation.
- **`choices`**: An array of `Choice` objects presented after the dialogue finishes.

## 3. Designing Choices

Choices are the primary way the player interacts with the story. Each choice must have a `type` and its `text` must be formatted from the player's first-person perspective.

### Choice Text Formatting

All choice text must be from the player's first-person perspective. The format depends on the nature of the choice.

-   **Actions:** Direct physical actions or decisions that advance the plot.
    -   **Format:** Enclosed in `[]` square brackets. Keep the text concise and direct.
    -   **Good:** `text: "[Grip the blade.]"`
    -   **Good:** `text: "[Look closer at the path.]"`
    -   **Avoid:** `text: "[Grip my blade. This changes nothing.]"` (Don't add commentary inside the brackets).
    -   **Avoid:** `text: "I should take a closer look at this path."` (This is an action, it should be in brackets).

-   **Dialogue/Thoughts:** Internal monologue or lines spoken aloud to other characters.
    -   **Format:** Plain text, without brackets.
    -   **Good:** `text: "Why am I doing this?"`
    -   **Good:** `text: "Who are you? What is this voice in my head?"`

### Choice Types

### `type: 'action'`
- **Purpose**: To advance the plot. These are the main decisions that move the player from one story beat to the next.
- **Example**: `{ "text": "[Grip the hilt of my blade and approach the cabin.]", ... }`
- **Effect**: Typically clears any `exploredChoices` history and moves to a new, distinct scene.

### `type: 'explore'`
- **Purpose**: To provide lore, context, or character insight without immediately advancing the main plot.
- **Example**: `{ "text": "[Look closer at the path.]", ... }`
- **Effect**: Leads to a temporary scene that provides information. This scene should ideally have a single `type: 'return'` choice to bring the player back to the original decision point. The game engine automatically grays out explored options.

### `type: 'return'`
- **Purpose**: To exit an "explore" scene and go back to the previous choice hub.
- **Example**: `{ "text": "[Return to the door.]", ... }`
- **Effect**: Returns the player to the scene defined in `nextSceneId`, restoring the previous choices. **The `nextSceneId` must be the ID of the scene the player just came from.**

## 4. Writing Style

- **Narrator**: The Narrator's voice is directive, slightly condescending, and omniscient. It speaks directly to the player character ("You"). It knows it is telling a story and becomes agitated when the player deviates from the expected path.
- **Princess**: Her dialogue is often cryptic, intelligent, and calm, even in the face of danger. She hints at a deeper understanding of her reality.
- **Player Character ("You")**: The player's choices are their dialogue and actions. The text for choices should always be written from the player's first-person perspective, following the formatting rules in Section 3.

## 5. Dialogue and Narration Rules

**This is a critical rule.** The game's narrative relies on the distinction between what a character says and what the biased Narrator *tells* the player is happening.

-   **The Narrator is the ONLY one who describes actions.** Tones of voice, physical gestures, character expressions, and environmental descriptions *must* come from the `Narrator`.
-   **All other characters ONLY speak.** Their `"line"` property should contain *only* spoken dialogue.
-   **Pacing and Readability**: For a more cinematic and readable experience, avoid long paragraphs in a single `"line"` property. Split dialogue that contains multiple distinct sentences or ideas into separate dialogue objects. This gives each line more impact and allows the player to absorb the story at a natural pace.
    -   **Avoid:** `{"speaker": "Narrator", "line": "The path is cold and the air is still. Ahead, a cabin sits waiting."}`
    -   **Good:** `{"speaker": "Narrator", "line": "The path is cold and the air is still."},{"speaker": "Narrator", "line": "Ahead, a cabin sits waiting."}`

### Good Example:

This is the correct way to structure dialogue and action. The action is narrated, and the character speaks.

```json
"dialogue": [
  { "speaker": "Narrator", "line": "She turns to face you, her eyes full of a weary intelligence." },
  { "speaker": "Princess", "line": "'I am a prisoner here. And so are you.'" }
]
```

### Avoid:

This is incorrect. The Princess's line contains descriptive action ("She turns to face you...") that should be narrated separately. This breaks the narrative convention of the game.

```json
"dialogue": [
  { "speaker": "Princess", "line": "She turns to face you, her eyes full of weary intelligence, and says, 'I am a prisoner here. And so are you.'" }
]
```

---
*This document should be updated as the story and game mechanics evolve.*