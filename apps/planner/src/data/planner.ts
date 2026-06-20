import {
  CalendarCheck,
  ChatCircle,
  Megaphone,
  SquaresFour,
  Storefront,
  Tray,
  Wallet,
  type Icon,
} from 'phosphor-react';

export interface NavItem {
  key: string;
  labelKey: string;
  href: string;
  icon: Icon;
  badge?: number;
}

/** Sidebar navigation — matches NAV in dash.jsx. */
export const NAV: NavItem[] = [
  { key: 'overview', labelKey: 'nav.overview', href: '/', icon: SquaresFour },
  { key: 'browse', labelKey: 'nav.openRequests', href: '/open-requests', icon: Megaphone, badge: 6 },
  { key: 'leads', labelKey: 'nav.myOffers', href: '/offers', icon: Tray, badge: 4 },
  { key: 'bookings', labelKey: 'nav.bookings', href: '/bookings', icon: CalendarCheck },
  { key: 'calendar', labelKey: 'nav.calendar', href: '/calendar', icon: CalendarCheck },
  { key: 'messages', labelKey: 'nav.messages', href: '/messages', icon: ChatCircle, badge: 2 },
  { key: 'earnings', labelKey: 'nav.earnings', href: '/earnings', icon: Wallet },
  { key: 'profile', labelKey: 'nav.profile', href: '/profile', icon: Storefront },
];
