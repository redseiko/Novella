
export interface Choice {
  id: string;
  text: string;
  nextSceneId: string; // Can be "sceneId" or "chapterId:sceneId"
  type?: 'action' | 'explore' | 'return';
  setState?: Record<string, any>;
  condition?: Record<string, any>;
  preserveBackground?: boolean;
}

export interface DialogueLine {
  speaker: string;
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
}

export interface ChapterMetadata {
    chapter: string;
}

interface BackgroundColor {
    from: string;
    to: string;
}

export interface StoryChapter {
    id: string;
    metadata: ChapterMetadata;
    gameData: GameData;
}

export interface StoryManifest {
  id: string;
  metadata: StoryMetadata;
  speakerColors: Record<string, string>;
  backgroundsMap: Record<string, BackgroundColor>;
  entryChapter: string;
  chapters: Record<string, string>; // chapterId -> path
}

export interface StoryManifestInfo {
    id: string;
    metadata: StoryMetadata;
}