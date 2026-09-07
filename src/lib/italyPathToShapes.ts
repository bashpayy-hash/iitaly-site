import * as THREE from "three";

// Превращает ITALY_PATH (один SVG-path со связкой M...Z подпутей — материк,
// Сардиния, Сицилия и несколько микро-островов-артефактов оцифровки) в
// набор THREE.Shape для экструзии. Меряем геометрию через реальный
// SVGPathElement (getPointAtLength) — это единственный надёжный способ
// без сторонней SVG-парсер-библиотеки. Работает только в браузере.
const MIN_SUBPATH_LENGTH = 40;

export function italyPathToShapes(pathD: string): THREE.Shape[] {
  if (typeof document === "undefined") return [];

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("style", "position:absolute;width:0;height:0;overflow:hidden;visibility:hidden;");
  document.body.appendChild(svg);

  const subpaths = pathD.match(/M[^M]+/g) ?? [];
  const shapes: THREE.Shape[] = [];

  for (const d of subpaths) {
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    svg.appendChild(path);
    const length = path.getTotalLength();
    if (length < MIN_SUBPATH_LENGTH) {
      svg.removeChild(path);
      continue;
    }
    const steps = Math.max(24, Math.round(length / 4));
    const points: THREE.Vector2[] = [];
    for (let i = 0; i <= steps; i++) {
      const p = path.getPointAtLength((i / steps) * length);
      points.push(new THREE.Vector2(p.x, p.y));
    }
    shapes.push(new THREE.Shape(points));
    svg.removeChild(path);
  }

  document.body.removeChild(svg);
  return shapes;
}
