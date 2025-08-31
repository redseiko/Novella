export interface Choice {
  id: string;
  text: string;
  nextSceneId: string;
  type?: 'action' | 'explore' | 'return';
  setState?: Record<string, any>;
  condition?: Record<string, any>;
}

export interface DialogueLine {
  speaker: 'Narrator' | 'You' | 'Princess' | '???' | '' | 'Consciousness' | 'The Archivist' | 'The Skeptic' | 'The Oracle' | 'The Echo';
  line: string;
  condition?: Record<string, any>;
}

export interface Scene {
  id:string;
  backgroundKey: string;
  dialogue: DialogueLine[];
  choices: Choice[];
}

export type GameData = Record<string, Scene>;

export interface StoryMetadata {
  title: string;
  chapter: string;
}

interface BackgroundColor {
    from: string;
    to: string;
}

export interface Story {
  id: string;
  metadata: StoryMetadata;
  speakerColors: Record<string, string>;
  gameData: GameData;
  backgroundsMap: Record<string, BackgroundColor>;
}

export interface StoryInfo {
    id: string;
    metadata: StoryMetadata;
}