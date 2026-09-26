"use client";

import { useState, type KeyboardEvent } from "react";
import { PermessoTrainer } from "./PermessoTrainer";
import { EditablePermesso } from "./EditablePermesso";
import styles from "./permesso-editor.module.css";

type Mode = "original" | "editable";

export function PermessoModes() {
  const [mode,setMode] = useState<Mode>("original");
  const [editorOpened,setEditorOpened] = useState(false);
  function activate(next: Mode) {
    if(next === "editable") setEditorOpened(true);
    setMode(next);
  }
  function onKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowLeft","ArrowRight","Home","End"].includes(event.key)) return;
    event.preventDefault();
    const next: Mode = event.key === "Home" ? "original" : event.key === "End" ? "editable" : mode === "original" ? "editable" : "original";
    activate(next);
    document.getElementById("permesso-tab-"+next)?.focus();
  }
  return <>
    <div className={styles.modeRegion}>
      <div className={styles.modeBar}>
        <div role="tablist" aria-label="Версия Modulo 1" className={styles.modeTabs}>
          <button type="button" role="tab" id="permesso-tab-original" aria-selected={mode==="original"} aria-controls="permesso-panel-original" tabIndex={mode==="original"?0:-1} onKeyDown={onKey} onClick={() => activate("original")}>Оригинал</button>
          <button type="button" role="tab" id="permesso-tab-editable" aria-selected={mode==="editable"} aria-controls="permesso-panel-editable" tabIndex={mode==="editable"?0:-1} onKeyDown={onKey} onClick={() => activate("editable")}>Заполнить с подсказками</button>
        </div>
        <p>{mode==="original" ? "Исходный PDF для просмотра и сверки." : "Ввод прямо в поля того же бланка."}</p>
      </div>
    </div>
    <div id="permesso-panel-original" role="tabpanel" aria-labelledby="permesso-tab-original" hidden={mode!=="original"} className={styles.modePanel}>
      {mode === "original" && <PermessoTrainer />}
    </div>
    <div id="permesso-panel-editable" role="tabpanel" aria-labelledby="permesso-tab-editable" hidden={mode!=="editable"} className={styles.modePanel}>
      {/* Keep the draft and cursor mounted when the user checks the original. */}
      {editorOpened && <EditablePermesso />}
    </div>
  </>;
}
