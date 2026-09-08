import { Vespa } from "@/components/Vespa";

/**
 * Один спокойный акцент вместо декоративного шума: Веспа в полный рост
 * со своей штатной анимацией (покачивание + флаттер ленты), без карточек
 * и градиентов вокруг.
 */
export function VespaMoment() {
  return (
    <section className="border-b-2 border-ink bg-paper px-5 py-16 text-center sm:py-20">
      <Vespa pose="master" className="mx-auto h-40 w-auto sm:h-52" />
      <p className="mx-auto mt-6 max-w-md text-lg text-ink-soft">
        Едет тем же маршрутом, что и ты — от первого вопроса до permesso di
        soggiorno.
      </p>
    </section>
  );
}
