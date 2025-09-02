# Design Doc: Novella Story Builder

**Authors:** Novella Dev Team
**Status:** Draft
**Date:** 2024-07-26

---

## 1. Overview & Goals

The Novella Story Builder is a web-based, visual authoring tool designed to empower writers and narrative designers to create, edit, and visualize interactive stories for the Novella engine without directly editing JSON files.

The primary goals are:
- **Lower the barrier to entry:** Allow non-programmers to create complex narrative structures.
- **Improve workflow efficiency:** Drastically reduce the time it takes to write, connect, and debug story content.
- **Visualize story flow:** Provide a clear, node-based graph representation of scenes, choices, and state changes.
- **Ensure data integrity:** Prevent common errors like broken links between scenes, invalid state conditions, or malformed JSON.

## 2. Core Features

### Node-Based Graph Editor
The central component of the Story Builder will be a canvas where scenes are represented as nodes and choices are represented as edges connecting them.

- **Scene Nodes:** Draggable blocks on the canvas. Each node will contain the scene's ID, background key, dialogue, and choices.
- **Choice Edges:** Lines drawn from a scene node's choice output to another scene node's input.
- **Pan & Zoom:** The canvas will be infinitely pannable and zoomable to accommodate large, complex stories.

### Contextual Editing Panel
When a node or edge is selected, a contextual panel will appear, allowing the user to edit its properties.

- **Scene Editor:** Edit scene ID, select background key from a dropdown (populated from `story.json`), and edit dialogue lines with speaker and text fields.
- **Choice Editor:** Edit choice text, select the target scene, and define conditions or state changes using a user-friendly interface.

## 3. Technical Implementation (High-Level)

- **Frontend:** The tool will be a new view within the existing React application.
- **State Management:** It will read from and write to the same `story.json` and chapter files used by the game engine.
- **Canvas Library:** A library like `React Flow` or `D3.js` will be considered for the node graph implementation to handle rendering, dragging, and connections.

```json
{
  "example": "This is a code block example within the design document."
}
```
