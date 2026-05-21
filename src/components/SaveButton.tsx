import { useReadingProgress } from "../state/ReadingProgress";

// Save-for-later toggle. A quiet mono affordance below the read-time
// footer — editorial restraint over a floating star icon. Reads as a
// receipt-style action, not a primary CTA.
export function SaveButton({ url }: { url: string }) {
  const { isSaved, toggleSaved } = useReadingProgress();
  const saved = isSaved(url);
  return (
    <button
      type="button"
      className={`save-btn${saved ? " save-btn--saved" : ""}`}
      onClick={() => toggleSaved(url)}
      aria-pressed={saved}
      aria-label={saved ? "Remove from saved" : "Save for later"}
    >
      <span className="save-btn__glyph" aria-hidden="true">
        {saved ? "★" : "☆"}
      </span>
      {saved ? "Saved" : "Save for later"}
    </button>
  );
}
