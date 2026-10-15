"use client";

import dynamic from "next/dynamic";
import styles from "./portal-permesso.module.css";

// Reuse the public trainer unchanged. Its route hook updates only scenario,
// page and field on the current pathname, keeping the portal task in the URL.
// The parent owns task eligibility and the existing self-report action.
const EditablePermesso = dynamic(() => import("@/components/guides/permesso/EditablePermesso").then(module => module.EditablePermesso), {
  loading: () => <p className={styles.loading} role="status">Загружаю бланк и подсказки…</p>,
});
const PermessoHelpers = dynamic(() => import("@/components/guides/permesso/PermessoHelpers").then(module => module.PermessoHelpers));

export function PortalPermessoStep() {
  return <div className={styles.embedded} data-portal-permesso>
    <EditablePermesso />
    <PermessoHelpers />
  </div>;
}
