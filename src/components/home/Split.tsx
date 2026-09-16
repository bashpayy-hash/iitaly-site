import { AppleHeadingLg, AppleBody, AppleCaption } from "@/components/apple/Typography";
import { AppleButtonLink } from "@/components/apple/Button";

/**
 * Вход на карту, а не превью-перерисовка: на главной только приглашение,
 * карта (её канвас, фильтры, сравнение) живёт целиком на /universities и
 * не трогается этим редизайном.
 */
export function Split() {
  return (
    <section className="bg-carbon px-5 py-16 text-center sm:py-24">
      <AppleCaption as="p" className="text-ash">Интерактивная карта</AppleCaption>
      <AppleHeadingLg as="h2" className="mx-auto mt-3 max-w-2xl text-[32px] text-frost sm:text-apple-heading-lg">
        Найди свой университет
      </AppleHeadingLg>
      <AppleBody as="p" className="mx-auto mt-4 max-w-md text-ash">
        30 городов и 43 вуза: цены по ISEE, тесты, дедлайны и стипендия региона.
      </AppleBody>
      <AppleButtonLink href="/universities" variant="filled" className="mt-7">
        Смотреть карту
      </AppleButtonLink>
    </section>
  );
}
