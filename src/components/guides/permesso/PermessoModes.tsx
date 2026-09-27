"use client";

import { useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { PermessoTrainer } from "./PermessoTrainer";
import { EditablePermesso } from "./EditablePermesso";
import { usePermessoRoute } from "./usePermessoRoute";
import styles from "./permesso-editor.module.css";

type Mode = "original" | "editable";
const subscribeReady = () => () => {};
const clientReady = () => true;
const serverReady = () => false;

export function PermessoModes() {
  const ready=useSyncExternalStore(subscribeReady,clientReady,serverReady);
  const route=usePermessoRoute();
  const [chosenMode,setMode] = useState<Mode|null>(null);
  const mode:Mode=chosenMode || (route.explicit?"editable":"original");
  const [editorOpened,setEditorOpened] = useState(false);
  function activate(next: Mode) {
    if(next === "editable" || mode === "editable") setEditorOpened(true);
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
        <p>{mode==="original" ? "Исходный PDF для просмотра и сверки." : "Наведи на поле — увидишь крупную подсказку. На телефоне — коснись."}</p>
      </div>
    </div>
    <div id="permesso-panel-original" role="tabpanel" aria-labelledby="permesso-tab-original" hidden={mode!=="original"} className={styles.modePanel}>
      {mode === "original" && ready && <PermessoTrainer />}
    </div>
    <div id="permesso-panel-editable" role="tabpanel" aria-labelledby="permesso-tab-editable" hidden={mode!=="editable"} className={styles.modePanel}>
      {/* Keep values mounted across modes, but unmount the reading layer when hidden. */}
      {(editorOpened || mode === "editable") && <EditablePermesso active={mode === "editable"}/>}
    </div>
  </>;
}
