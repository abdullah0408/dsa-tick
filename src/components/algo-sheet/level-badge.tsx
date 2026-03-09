import { Difficulty } from "./types";

interface LevelBadgeProps {
  level: Difficulty;
}

export function LevelBadge({ level }: LevelBadgeProps) {
  const styles: Record<Difficulty, string> = {
    Easy: "text-emerald-600 dark:text-emerald-400",
    Medium: "text-amber-600 dark:text-amber-400",
    Hard: "text-destructive",
  };

  return (
    <span className={`text-xs font-semibold ${styles[level]}`}>{level}</span>
  );
}
