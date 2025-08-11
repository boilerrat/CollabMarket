"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./NavLinks.module.css";

const links = [
  { href: "/", label: "Home" },
  { href: "/feed", label: "Feed" },
  { href: "/projects", label: "Projects" },
  { href: "/projects/new", label: "New" },
  { href: "/collaborators/me", label: "My Profile" },
];

export function NavLinks({ showInbox, showAdmin }: { showInbox: boolean; showAdmin: boolean }) {
  const pathname = usePathname();
  return (
    <div className={styles.navRow}>
      {links.map((l) => {
        const isActive = pathname?.startsWith(l.href);
        return (
          <Link key={l.href} href={l.href} className={`${styles.btn} ${isActive ? styles.btnActive : ""}`}>{l.label}</Link>
        );
      })}
      {showInbox && (
        <Link href="/inbox" className={styles.btn}>Inbox</Link>
      )}
      {showAdmin && (
        <Link href="/admin/reports" className={styles.btn}>Admin</Link>
      )}
    </div>
  );
}


