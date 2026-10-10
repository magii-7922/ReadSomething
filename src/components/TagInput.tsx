"use client";

import { useState } from "react";

type Props = {
  value: string[];
  onChange: (tags: string[]) => void;
};

export function TagInput({ value, onChange }: Props) {
  const [draft, setDraft] = useState("");

  function addTag() {
    const tag = draft.trim();
    if (!tag || value.includes(tag)) {
      setDraft("");
      return;
    }
    onChange([...value, tag]);
    setDraft("");
  }

  return (
    <div className="tag-input">
      <div className="tag-row">
        {value.map((tag) => (
          <button
            key={tag}
            type="button"
            className="tag"
            onClick={() => onChange(value.filter((t) => t !== tag))}
          >
            {tag} ×
          </button>
        ))}
      </div>
      <div className="tag-add">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder="自訂標籤，按 Enter 新增"
        />
        <button type="button" className="ghost-btn" onClick={addTag}>
          新增
        </button>
      </div>
    </div>
  );
}
