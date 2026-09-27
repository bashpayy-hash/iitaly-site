"use client";

import { useEffect, useRef } from "react";
import type { PermessoScenario } from "./permessoData";
import { ORIGINAL_PAGES } from "./permessoOriginalGeometry";
import styles from "./permesso-light.module.css";

type Props = {
  scenario: PermessoScenario; page: number; entered: number; zoom: number;
  hints: boolean; showExample: boolean; transferOpen: boolean;
  onScenario: (scenario: PermessoScenario) => void;
  onPage: (page: number) => void;
  onSave: () => void; onRestore: () => void; onClear: () => void;
  onExample: () => void; onPersonal: () => void;
  onZoom: () => void; onHints: (value: boolean) => void;
};

/** Secondary actions stay available, but never compete with the paper task. */
export function PermessoWorkbenchControls(p: Props) {
  const tools = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !tools.current?.contains(event.target) && tools.current) tools.current.open = false;
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || !tools.current?.open) return;
      tools.current.open = false;
      tools.current.querySelector("summary")?.focus({ preventScroll: true });
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    return () => { document.removeEventListener("pointerdown", outside); document.removeEventListener("keydown", escape); };
  }, []);
  function run(action: () => void, returnFocus = true) {
    if (tools.current) tools.current.open = false;
    if (returnFocus) tools.current?.querySelector("summary")?.focus({ preventScroll: true });
    action();
  }
  return <>
    <div className={styles.workbar} data-workbench-bar>
      <div className={styles.scenarios} role="group" aria-label="Сценарий электронного бланка">
        <button type="button" aria-pressed={p.scenario === "rilascio"} aria-label="Первое ВНЖ Rilascio · только приехал" onClick={() => p.onScenario("rilascio")}>Первое ВНЖ</button>
        <button type="button" aria-pressed={p.scenario === "rinnovo"} aria-label="Продление Rinnovo · карточка уже есть" onClick={() => p.onScenario("rinnovo")}>Продление</button>
      </div>
      {!p.transferOpen && <nav className={styles.pages} aria-label="Страницы электронного бланка">
        {ORIGINAL_PAGES.slice(0, 3).map(item => <button type="button" key={item.page} aria-label={`Страница ${item.page}: ${item.title}`} aria-current={p.page === item.page ? "page" : undefined} onClick={() => p.onPage(item.page)}><b>{item.page}</b><span>{["Заявление", "Данные", "Адрес"][item.page - 1]}</span></button>)}
        {p.page > 3 && <span className={styles.extraPage}>Стр. {p.page} · пропуск</span>}
      </nav>}
      <details ref={tools} className={styles.tools} data-workbench-tools>
        <summary>Инструменты <span aria-hidden="true">⌄</span></summary>
        <div className={styles.toolPanel}>
          <section><h2>Черновик</h2><p>Сохраняется только по кнопке, на этом устройстве. Не сохраняй на общем компьютере.</p>
            <div className={styles.toolActions}><button type="button" onClick={() => run(p.onSave)}>Сохранить</button><button type="button" onClick={() => run(p.onRestore)}>Восстановить</button><button type="button" data-destructive onClick={() => run(p.onClear)}>Стереть</button></div>
          </section>
          {!p.transferOpen && <>
            <section><h2>Вид бланка</h2><div className={styles.toolActions}>
              <button type="button" aria-pressed={p.showExample} onClick={() => run(p.onExample)}>{p.showExample ? "Скрыть пример" : "Показать пример"}</button>
              {!p.showExample && <button type="button" onClick={() => run(p.onPersonal, false)}>Мои данные</button>}
              <button type="button" aria-pressed={p.zoom > 1} onClick={() => run(p.onZoom)}>{p.zoom === 1 ? "Увеличить лист" : "Вместить лист"}</button>
            </div><label className={styles.hintToggle}><input type="checkbox" checked={p.hints} onChange={e => p.onHints(e.target.checked)} />Подсказки на листе</label></section>
            <section><h2>Страницы 4–8</h2><p>Пояснения к пропускам в сценарии без семьи. Листы остаются в kit.</p><div className={styles.toolActions}>{ORIGINAL_PAGES.slice(3).map(item => <button type="button" key={item.page} aria-current={p.page === item.page ? "page" : undefined} onClick={() => run(() => p.onPage(item.page))}>Стр. {item.page}</button>)}</div></section>
          </>}
          <details className={styles.about}><summary>Что подготовить и что означают отметки</summary>
            <p>Бумажный kit, чёрная ручка, паспорт, codice fiscale, марка{p.scenario === "rinnovo" ? " и текущая карточка ВНЖ" : ""}.</p>
            <dl><div><dt>Заполняй</dt><dd>Внеси свои данные из документа.</dd></div><div><dt>Пропусти</dt><dd>Оставь поле пустым в этом сценарии.</dd></div><div><dt>Если есть</dt><dd>Заполняй только если это относится к тебе.</dd></div><div><dt>На почте</dt><dd>Самостоятельный ввод отключён.</dd></div><div><dt>Уточни</dt><dd>Сверь правило по kit перед переносом.</dd></div></dl>
            <p>Учебный черновик, не подача заявления. Страницы 1–3 — для первого студенческого ВНЖ или продления. Страницы 4–8 — только пояснения для сценария без семьи.</p>
          </details>
        </div>
      </details>
    </div>
    <div className={styles.contextLine}><span>{p.scenario === "rilascio" ? "Rilascio · только приехал" : "Rinnovo · карточка уже есть"}</span><span>Только в браузере · введено полей: {p.entered}</span></div>
    {p.showExample && !p.transferOpen && <div className={styles.exampleNotice} role="status"><span>Показан вымышленный пример, не твои данные.</span><button type="button" onClick={p.onPersonal}>Мои данные</button></div>}
  </>;
}
