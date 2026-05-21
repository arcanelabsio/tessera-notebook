import { useEffect, useRef, useState } from "react";
import { useKeyboardShortcuts } from "../hooks/useKeyboardShortcuts";

type Binding = { keys: string[]; label: string };

const BINDINGS: Binding[] = [
  { keys: ["J", "→"], label: "Next episode" },
  { keys: ["K", "←"], label: "Previous episode" },
  { keys: ["G"], label: "Go to home" },
  { keys: ["?"], label: "Show this dialog" },
  { keys: ["Esc"], label: "Close dialog" },
];

// Global keyboard-shortcut dialog. Bound to "?" — opens a native
// <dialog> (showModal) which gives focus trap, ESC, and backdrop click
// for free. The shortcuts themselves are wired in their respective
// routes; this component documents them.
export function ShortcutsDialog() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDialogElement>(null);

  useKeyboardShortcuts({
    "?": (e) => {
      e.preventDefault();
      setOpen((o) => !o);
    },
  });

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      className="shortcuts-dialog"
      onClose={() => setOpen(false)}
      onClick={(e) => {
        // backdrop-click to dismiss: native <dialog> reports the dialog
        // element itself as the event target when the click landed on
        // the backdrop rather than any child.
        if (e.target === ref.current) setOpen(false);
      }}
    >
      <div className="shortcuts-dialog__inner">
        <h2 className="shortcuts-dialog__title"># Keyboard shortcuts</h2>
        <dl className="shortcuts-dialog__list">
          {BINDINGS.map((b) => (
            <div className="shortcuts-dialog__row" key={b.label}>
              <dt>
                {b.keys.map((k, i) => (
                  <span key={k}>
                    {i > 0 ? <span className="shortcuts-dialog__or">or</span> : null}
                    <kbd>{k}</kbd>
                  </span>
                ))}
              </dt>
              <dd>{b.label}</dd>
            </div>
          ))}
        </dl>
        <button
          type="button"
          className="shortcuts-dialog__close"
          onClick={() => setOpen(false)}
          autoFocus
        >
          close
        </button>
      </div>
    </dialog>
  );
}
