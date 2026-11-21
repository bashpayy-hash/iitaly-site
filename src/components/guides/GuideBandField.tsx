import ui from "./guide-pages.module.css";

/* Живой фон полосы на страницах темы, визы и шага гайда.

   Owner, 21 Nov, со снимком ролика про библиотеки, пункт 5 — ShaderGradient,
   «grainy moving gradients»: «примени этот плагин где полезно будет».
   Сама библиотека сюда не идёт: это 114 КБ сжатого кода плюс three.js и
   @react-three/fiber, которых на сайте нет, и постоянная работа WebGL. Её
   эффект — зернистый градиент, который медленно течёт — сделан здесь без
   неё: три цветовых поля ездят по замкнутым путям одной трансформацией
   (её считает видеокарта, страница не перерисовывается), зерно лежит сверху
   и стоит на месте. С «меньше движения» поля стоят — это прежняя полоса
   (guide-pages.module.css, .bandField). */
export function GuideBandField() {
  return <span className={ui.bandField} aria-hidden="true" data-guide-band-field>
    <span /><span /><span />
  </span>;
}
