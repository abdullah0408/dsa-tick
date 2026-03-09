export type Difficulty = "Easy" | "Medium" | "Hard";
export type HintFormat = "Text" | "Markdown";
export type Understanding = "None" | "Weak" | "Fair" | "Good" | "Strong";

export interface Code {
  id: string;
  title?: string | null;
  language: string;
  code: string;
  questionId: string;
}

export interface Question {
  id: string;
  title: string;
  level: Difficulty;
  link?: string | null;
  solvedCount: number;
  hint?: string | null;
  hintFormat?: HintFormat | null;
  understanding?: Understanding | null;
  codes: Code[];
  topicId?: string | null;
  subtopicId?: string | null;
}

export interface Subtopic {
  id: string;
  title: string;
  topicId: string;
  questions: Question[];
}

export interface Topic {
  id: string;
  title: string;
  userId: string;
  questions: Question[];
  subtopics: Subtopic[];
}
