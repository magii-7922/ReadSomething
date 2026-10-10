import type { ReactNode } from "react";

export function WritingShell({
  children,
  title,
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <div className="writing-shell">
      <div className="journal-page">
        <h1>{title}</h1>
        {children}
      </div>
    </div>
  );
}
