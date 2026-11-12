/* Адрес сервера.

   На основном домене (iitaly.net, www.iitaly.net) сайт ходит на сервер через
   свой же адрес /backend — его пересылает Netlify (netlify.toml). Сервер на
   Railway не отдаёт этому домену заголовки CORS, и браузер прятал от сайта
   все ответы: проверку документа, вход в кабинет, чат и оплату (owner,
   12 Nov: «Сделай обход»). Запрос на свой адрес браузеру не нужно разрешать.

   Везде ещё — прямой адрес из NEXT_PUBLIC_BACKEND_URL: превью и локальные
   проверки (там прокси нет), а iitaly.netlify.app теперь переадресуется на
   iitaly.net. Прокси Netlify ждёт ответа не дольше 26 секунд (проверка фото
   идёт 11 с, текста 7 с, замер 12 Nov). Когда на Railway в ALLOWED_ORIGINS
   добавят https://iitaly.net, обход можно снять: вернуть здесь прямой адрес. */
const DIRECT = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
const PROXIED_HOSTS = new Set(["iitaly.net", "www.iitaly.net"]);

export const BACKEND_URL = DIRECT && typeof window !== "undefined" && PROXIED_HOSTS.has(window.location.hostname) ? "/backend" : DIRECT;
