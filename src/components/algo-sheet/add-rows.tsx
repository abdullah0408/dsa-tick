"use client";

import { RiAddLine } from "@remixicon/react";
import { useState } from "react";

// --- Inline text row (for topics / subtopics) ---
interface AddTextRowProps {
  placeholder: string;
  depth: 0 | 1 | 2;
  onAdd: (title: string) => void;
}

export function AddTextRow({ placeholder, depth, onAdd }: AddTextRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");

  const paddingLeft = depth === 0 ? "pl-4" : depth === 1 ? "pl-4" : "pl-10";

  const handleSave = () => {
    if (value.trim()) onAdd(value.trim());
    setValue("");
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div
        onClick={() => setIsEditing(true)}
        className={`flex items-center py-2 pr-4 border-b border-border hover:bg-accent/40 transition-colors text-muted-foreground cursor-pointer ${paddingLeft} bg-card`}
      >
        <div className="w-10 shrink-0 flex items-center justify-center">
          <RiAddLine className="size-3.5" />
        </div>
        <span className="text-sm italic font-medium">{placeholder}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center py-1.5 pr-4 border-b border-border bg-card ${paddingLeft}`}
    >
      <div className="w-10 shrink-0 flex items-center justify-center">
        <RiAddLine className="size-3.5 text-muted-foreground" />
      </div>
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSave();
          if (e.key === "Escape") {
            setIsEditing(false);
            setValue("");
          }
        }}
        onBlur={handleSave}
        placeholder={placeholder}
        className="flex-1 text-sm bg-transparent outline-none border-none text-foreground placeholder-muted-foreground font-medium"
      />
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">
        Press Enter
      </span>
    </div>
  );
}

// --- Button row (triggers dialog for questions) ---
interface AddButtonRowProps {
  placeholder: string;
  depth: 1 | 2;
  onClick: () => void;
}

export function AddButtonRow({
  placeholder,
  depth,
  onClick,
}: AddButtonRowProps) {
  const paddingLeft = depth === 1 ? "pl-4" : "pl-10";
  return (
    <div
      onClick={onClick}
      className={`flex items-center py-2 pr-4 border-b border-border hover:bg-accent/40 transition-colors text-muted-foreground cursor-pointer ${paddingLeft} bg-card`}
    >
      <div className="w-10 shrink-0 flex items-center justify-center">
        <RiAddLine className="size-3.5" />
      </div>
      <span className="text-sm italic font-medium">{placeholder}</span>
    </div>
  );
}

// --- Big centered row for adding a main topic ---
interface AddBigTopicRowProps {
  onAdd: (title: string) => void;
}

export function AddBigTopicRow({ onAdd }: AddBigTopicRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState("");

  if (!isEditing) {
    return (
      <div
        onClick={() => setIsEditing(true)}
        className="py-10 flex flex-col items-center justify-center border-t border-border bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer text-muted-foreground hover:text-foreground group"
      >
        <div className="bg-card p-2.5 border border-border group-hover:border-ring mb-3 shadow-sm transition-all group-hover:scale-110">
          <RiAddLine className="size-6" />
        </div>
        <span className="text-sm font-bold uppercase tracking-widest">
          Add New Topic
        </span>
      </div>
    );
  }

  return (
    <div className="py-8 px-6 flex justify-center border-t border-border bg-muted/30">
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (value.trim()) onAdd(value.trim());
            setIsEditing(false);
            setValue("");
          }
          if (e.key === "Escape") {
            setIsEditing(false);
            setValue("");
          }
        }}
        onBlur={() => {
          if (value.trim()) onAdd(value.trim());
          setIsEditing(false);
          setValue("");
        }}
        placeholder="Enter main topic name..."
        className="w-full max-w-lg text-center text-lg bg-card border border-input px-4 py-3 outline-none focus:ring-2 focus:ring-ring text-foreground placeholder:text-muted-foreground font-bold shadow-sm"
      />
    </div>
  );
}
