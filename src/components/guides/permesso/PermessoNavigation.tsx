"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { PermessoScenario } from "./permessoData";
import { ORIGINAL_PAGES } from "./permessoOriginalGeometry";
import c from "./permesso-compact.module.css";

type MenuProps = { label: ReactNode; name: string; children: ReactNode; side?: "left" | "right" };
/** Native disclosure: tab, controls and labels retain their normal semantics. */
function Menu({ label, name, children, side = "left" }: MenuProps) {
  const ref = useRef<HTMLDetailsElement>(null);
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (ref.current?.open && event.target instanceof Node && !ref.current.contains(event.target)) ref.current.open = false;
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  return <details ref={ref} className={c.menu} data-compact-menu={name} data-side={side} onKeyDown={event => {
    if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); if (ref.current) { ref.current.open = false; ref.current.querySelector("summary")?.focus(); } }
  }}>
    <summary>{label}<span aria-hidden="true">⌄</span></summary>
    <div className={c.menuBody} onClick={event => {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest("button[data-close-menu]") && ref.current) {
        ref.current.open = false;
        ref.current.querySelector("summary")?.focus({ preventScroll: true });
      }
    }}>{children}</div>
  </details>;
}

type Props = {
  scenario: PermessoScenario; page: number; hints: boolean; zoom: number; showExample: boolean;
  transferOpen: boolean; entered: number; saved: boolean;
  onScenario: (scenario: PermessoScenario) => void; onPage: (page: number) => void;
  onSave: () => void; onRestore: () => void; onClear: () => void;
  onExample: () => void; onMyData: () => void; onHints: (next: boolean) => void;
  onZoom: () => void; onTransfer: () => void; onReview: () => void;
};

export function PermessoNavigation(p: Props) {
  return <>
    <div className={c.toolbar} data-compact-toolbar>
      <Menu name="scenario" label={<><span className={c.controlCaption}>Сценарий</span><b>{p.scenario === "rilascio" ? "Первое ВНЖ" : "Продление"}</b></>}>
        <p className={c.menuTitle}>Что подаёшь?</p>
        <div role="group" aria-label="Сценарий электронного бланка" className={c.scenarioChoices}>
          <button type="button" data-close-menu aria-pressed={p.scenario === "rilascio"} onClick={() => p.onScenario("rilascio")}>Первое ВНЖ <small>Rilascio · только приехал</small></button>
          <button type="button" data-close-menu aria-pressed={p.scenario === "rinnovo"} onClick={() => p.onScenario("rinnovo")}>Продление <small>Rinnovo · карточка уже есть</small></button>
        </div>
      </Menu>
      <nav aria-label="Страницы электронного бланка" className={c.pages}>
        {ORIGINAL_PAGES.slice(0, 3).map(item => <button type="button" key={item.page} aria-label={`Страница ${item.page}: ${item.title}`} aria-current={p.page === item.page ? "page" : undefined} onClick={() => p.onPage(item.page)}><b>{item.page}</b><span>{item.page === 2 ? "О себе" : item.page === 3 ? "Адрес" : "Заявление"}</span></button>)}
      </nav>
      <Menu name="tools" side="right" label="Ещё">
        <section className={c.menuSection}><h3>Черновик</h3>
          <p>Сохраняется только на этом устройстве. Не используй общий компьютер.</p>
          <div className={c.actions}><button type="button" data-close-menu onClick={p.onSave}>Сохранить</button><button type="button" data-close-menu onClick={p.onRestore}>Восстановить</button><button type="button" data-close-menu className={c.destructive} onClick={p.onClear}>Стереть</button></div>
        </section>
        <section className={c.menuSection}><h3>Вид бланка</h3><div className={c.actions}>
          <button type="button" data-close-menu aria-pressed={p.showExample} onClick={p.onExample}>{p.showExample ? "Скрыть пример" : "Показать пример"}</button>
          <button type="button" data-close-menu aria-pressed={!p.showExample} onClick={p.onMyData}>Мои данные</button>
          <button type="button" data-close-menu aria-pressed={p.zoom > 1} onClick={p.onZoom}>{p.zoom === 1 ? "Увеличить лист" : "Вместить лист"}</button>
        </div><label className={c.check}><input type="checkbox" checked={p.hints} onChange={e => p.onHints(e.target.checked)} />Подсказки на листе</label></section>
        <section className={c.menuSection}><h3>Страницы 4–8</h3><p>Пояснения к пропускам для студента без семьи.</p><div className={c.extraPages}>{ORIGINAL_PAGES.slice(3).map(item => <button type="button" data-close-menu key={item.page} aria-current={p.page === item.page ? "page" : undefined} onClick={() => p.onPage(item.page)}>Стр. {item.page}</button>)}</div></section>
        <section className={c.menuSection}><h3>Перед почтой</h3><p>Приготовь kit, чёрную ручку, паспорт, codice fiscale и марку{p.scenario === "rinnovo" ? ", текущую карточку ВНЖ" : ""}.</p><div className={c.actions}>
          <button type="button" data-close-menu disabled={p.transferOpen} onClick={p.onTransfer}>Переносим на бумагу</button><button type="button" data-close-menu onClick={p.onReview}>Проверить черновик</button>
        </div></section>
        <details className={c.about}><summary>Как читать подсказки</summary><p>Заполняй · Пропусти · Только на почте · Если есть · Уточни. Правило меняется только по данным выбранного сценария.</p><p>Это учебный помощник. Спорные правила сверь с инструкцией своего kit. Страницы 4–8 доступны для пояснений, не для семейного заявления.</p></details>
      </Menu>
    </div>
    <div className={c.contextLine}><span>{p.showExample ? "Показан вымышленный пример — не твои данные" : "Данные не отправляются на сервер"}</span><span data-draft-status>{p.entered ? `${p.entered} полей · ${p.saved ? "сохранено на устройстве" : "есть несохранённые изменения"}` : "Черновик пуст"}</span></div>
  </>;
}
