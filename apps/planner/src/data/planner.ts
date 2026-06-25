import {
  CalendarCheck,
  ChatCircle,
  Megaphone,
  ShieldCheck,
  SquaresFour,
  Storefront,
  Tray,
  UserGear,
  Wallet,
  type Icon,
} from 'phosphor-react';

export interface NavItem {
  key: string;
  labelKey: string;
  href: string;
  icon: Icon;
  /** Only shown to profiles with is_admin = true — see Sidebar.tsx. */
  adminOnly?: boolean;
}

/** Sidebar navigation — matches NAV in dash.jsx. Badge counts are computed
 * live from Supabase in Sidebar.tsx (keyed by `key`), not hardcoded here. */
export const NAV: NavItem[] = [
  { key: 'overview', labelKey: 'nav.overview', href: '/', icon: SquaresFour },
  { key: 'browse', labelKey: 'nav.openRequests', href: '/open-requests', icon: Megaphone },
  { key: 'leads', labelKey: 'nav.myOffers', href: '/offers', icon: Tray },
  { key: 'bookings', labelKey: 'nav.bookings', href: '/bookings', icon: CalendarCheck },
  { key: 'calendar', labelKey: 'nav.calendar', href: '/calendar', icon: CalendarCheck },
  { key: 'messages', labelKey: 'nav.messages', href: '/messages', icon: ChatCircle },
  { key: 'earnings', labelKey: 'nav.earnings', href: '/earnings', icon: Wallet },
  { key: 'profile', labelKey: 'nav.profile', href: '/profile', icon: Storefront },
  { key: 'adminApprovals', labelKey: 'nav.adminApprovals', href: '/admin', icon: ShieldCheck, adminOnly: true },
  { key: 'adminUsers', labelKey: 'nav.adminUsers', href: '/admin/users', icon: UserGear, adminOnly: true },
];
