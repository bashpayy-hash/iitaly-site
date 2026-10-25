import styles from "./portal-paper.module.css";
import "./zhol-fonts.css";

/* Бумага кабинета — кэшируемая текстура zhol (13 КБ), а не полноэкранный
   SVG-фильтр: на недорогих Android живой feTurbulence перерисовывается при
   каждой прокрутке. */
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <div className={styles.paper} data-portal-editorial>
    {children}
  </div>;
}
