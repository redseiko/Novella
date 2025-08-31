/**
 * =============================================================================
 * APP CONFIGURATION
 * =============================================================================
 *
 * This file centralizes all the configurable variables for the application.
 * Tweak these values to easily adjust the game's appearance and behavior.
 *
 */

// --- UI SETTINGS ---
// Controls the visual aspects of the game interface.
export const UI = {
  // An array of Tailwind CSS classes for dynamic font sizing.
  // The order is from smallest to largest.
  FONT_SIZES: {
    dialog: ['text-3xl', 'text-4xl', 'text-5xl'],
    choices: ['text-3xl', 'text-4xl', 'text-5xl'],
  },
  
  // A CSS `text-shadow` value for creating a crisp outline on text.
  // This makes text readable against any background.
  TEXT_OUTLINE_STYLE: '-1.5px -1.5px 0 rgba(0,0,0,0.95), 1.5px -1.5px 0 rgba(0,0,0,0.95), -1.5px 1.5px 0 rgba(0,0,0,0.95), 1.5px 1.5px 0 rgba(0,0,0,0.75), -2px 2px 6px rgba(0,0,0,0.75)',

  // The minimum height of the dialog box. Adjust to prevent layout shifts.
  // Use Tailwind CSS `min-h` classes.
  DIALOG_BOX_MIN_HEIGHT: 'min-h-[220px]',

  // The background color of the dialog box.
  DIALOG_BOX_BG_COLOR: 'bg-transparent',
  
  // Margin below the speaker's name in the dialog box.
  DIALOG_BOX_SPEAKER_MARGIN: 'mb-1',

  // The minimum height of the choices panel placeholder.
  CHOICES_PANEL_MIN_HEIGHT: 'min-h-[60px]',

  // The width of the choice buttons relative to their container.
  CHOICES_BUTTON_WIDTH: 'w-[100%]',

  // Background color for choice buttons.
  CHOICES_BUTTON_BG_COLOR: 'bg-transparent',

  // Hover background color for choice buttons.
  CHOICES_BUTTON_HOVER_BG_COLOR: 'hover:bg-gray-200/10',

  // Vertical spacing between choice buttons.
  CHOICES_PANEL_SPACING: 'space-y-2',

  // The styling for a choice button that has been explored and is disabled.
  // We use a text-shadow to create a subtle outline for readability.
  CHOICES_BUTTON_DISABLED_STYLE: 'text-gray-400/90 cursor-not-allowed font-medium',
  
  // The size of the icons (chevron, book) next to a choice.
  // Use Tailwind CSS `h-` and `w-` classes.
  CHOICES_ICON_SIZE: 'h-6 w-6',
};

// --- STORY SELECTION ---
// Determines which story is loaded by the application.
export const STORY = {
    // The ID of the story to load. This must match a key in the
    // `stories` registry in `services/gameService.ts`.
    ACTIVE_STORY_ID: 'the-princess',
};

// --- GAMEPLAY SETTINGS ---
// Controls the core mechanics and feel of the narrative experience.
export const GAMEPLAY = {
  // The speed of the text typing animation in milliseconds.
  // Lower is faster.
  TYPING_SPEED_MS: 20,

  // The simulated network delay in milliseconds when loading a new scene.
  // This helps create a smoother transition.
  SCENE_LOAD_DELAY_MS: 300,
};

// --- DEBUG SETTINGS ---
// Controls debugging features for development.
export const DEBUG = {
    // Toggles the visibility of the on-screen debug panel.
    SHOW_PANEL: true,

    // The horizontal gap between labels and values in the debug panel.
    // Use Tailwind CSS `gap-x-` classes.
    PANEL_GRID_GUTTER: 'gap-x-4',
};