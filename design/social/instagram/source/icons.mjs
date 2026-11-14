import { createRequire } from 'node:module';
const r = createRequire(new URL('../../../../package.json', import.meta.url));
const React = r('react'); const { renderToStaticMarkup } = r('react-dom/server'); const L = r('lucide-react');
const out = {};
for (const [k, name] of Object.entries({ unis:'MapPinned', docs:'FileCheck2', dsu:'HandCoins', visa:'Stamp', guides:'BookOpenText' })) {
  const C = L[name]; if (!C) throw new Error('no icon ' + name);
  out[k] = renderToStaticMarkup(React.createElement(C, { size: 300, strokeWidth: 1.5, color: '#FAF6EE' }));
}
process.stdout.write(JSON.stringify(out));
