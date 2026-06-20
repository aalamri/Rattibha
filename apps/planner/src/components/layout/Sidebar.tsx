'use client';

import { CrownSimple, RocketLaunch } from 'phosphor-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { NAV } from '@/data/planner';

export function Sidebar() {
  const { t } = useTranslation();
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[252px] flex-shrink-0 flex-col border-e border-border bg-bg-surface p-4">
      <div className="flex items-center gap-2 px-2 pb-5">
        <span className="font-display text-xl font-semibold text-fg1">{t('common.appName')}</span>
        <Badge tone="gold" icon={CrownSimple}>
          {t('common.pro')}
        </Badge>
      </div>

      <nav aria-label={t('sidebar.navLabel')} className="flex flex-col gap-0.5">
        {NAV.map((item) => {
          const active = pathname === item.href;
          const ItemIcon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? 'bg-purple-50 text-brand font-semibold' : 'text-fg2 hover:bg-bg-app'
              }`}
            >
              <ItemIcon size={20} weight={active ? 'fill' : 'regular'} aria-hidden="true" />
              <span className="flex-1">{t(item.labelKey)}</span>
              {item.badge && (
                <span
                  className={`grid h-[19px] min-w-[19px] place-items-center rounded-full px-1 text-[11px] font-bold ${
                    active ? 'bg-brand text-white' : 'bg-lavender-100 text-brand'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <div className="relative overflow-hidden rounded-md bg-[linear-gradient(150deg,#5B2C83,#3A1B52)] p-4">
          <div className="relative">
            <div className="font-display text-base font-semibold text-white">{t('sidebar.boostTitle')}</div>
            <p className="my-1 mb-3 text-xs leading-relaxed text-white/80">{t('sidebar.boostBody')}</p>
            <Button size="sm" variant="gold" icon={RocketLaunch}>
              {t('sidebar.upgrade')}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  );
}
