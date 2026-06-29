'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle, GlobeSimple, InstagramLogo, MapPin, XCircle } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Section } from '@/components/ui/Section';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { DashboardShell } from '@/components/layout/DashboardShell';
import type { CategoryKey, CityKey } from '@/data/categories';
import { formatDate, formatNumber } from '@/lib/format';
import { supabase } from '@/lib/supabase';

interface ServiceRow {
  id: string;
  name: string;
  description: string | null;
  fromPrice: number;
  imageUrl: string | null;
}

interface PlannerDetail {
  userId: string;
  businessName: string;
  bio: string | null;
  city: CityKey;
  categories: CategoryKey[];
  verified: boolean;
  yearsInBusiness: string | null;
  teamSize: string | null;
  budgetTier: string | null;
  startingPrice: number | null;
  crNumber: string | null;
  portfolioUrls: string[];
  instagram: string | null;
  website: string | null;
  createdAt: Date;
  fullName: string;
  phone: string | null;
  seed: number;
  services: ServiceRow[];
}

export default function AdminPlannerDetailPage() {
  const { t, i18n } = useTranslation();
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [planner, setPlanner] = useState<PlannerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase
      .from('planners')
      .select(
        'user_id, business_name, bio, city, categories, verified, years_in_business, team_size, budget_tier, starting_price, cr_number, portfolio_urls, instagram, website, created_at, profiles(full_name, phone, avatar_seed), planner_services(id, name, description, from_price, image_url)'
      )
      .eq('user_id', params.id)
      .single()
      .then(({ data }) => {
        if (!data) {
          setLoading(false);
          return;
        }
        const row = data as unknown as {
          user_id: string;
          business_name: string;
          bio: string | null;
          city: CityKey;
          categories: CategoryKey[];
          verified: boolean;
          years_in_business: string | null;
          team_size: string | null;
          budget_tier: string | null;
          starting_price: number | null;
          cr_number: string | null;
          portfolio_urls: string[];
          instagram: string | null;
          website: string | null;
          created_at: string;
          profiles: { full_name: string; phone: string | null; avatar_seed: number } | null;
          planner_services: Array<{ id: string; name: string; description: string | null; from_price: number; image_url: string | null }>;
        };
        setPlanner({
          userId: row.user_id,
          businessName: row.business_name,
          bio: row.bio,
          city: row.city,
          categories: row.categories,
          verified: row.verified,
          yearsInBusiness: row.years_in_business,
          teamSize: row.team_size,
          budgetTier: row.budget_tier,
          startingPrice: row.starting_price,
          crNumber: row.cr_number,
          portfolioUrls: row.portfolio_urls ?? [],
          instagram: row.instagram,
          website: row.website,
          createdAt: new Date(row.created_at),
          fullName: row.profiles?.full_name ?? '—',
          phone: row.profiles?.phone ?? null,
          seed: row.profiles?.avatar_seed ?? 0,
          services: row.planner_services.map((s) => ({
            id: s.id,
            name: s.name,
            description: s.description,
            fromPrice: s.from_price,
            imageUrl: s.image_url,
          })),
        });
        setLoading(false);
      });
  }, [params.id]);

  async function setVerified(verified: boolean) {
    if (!planner) return;
    setBusy(true);
    await supabase.from('planners').update({ verified }).eq('user_id', planner.userId);
    setPlanner((p) => (p ? { ...p, verified } : p));
    setBusy(false);
  }

  return (
    <DashboardShell requireAdmin title={t('admin.detail.title')} subtitle={t('admin.detail.subtitle')}>
      <div className="p-7">
        <button
          type="button"
          onClick={() => router.push('/admin')}
          className="mb-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-fg2"
        >
          <ArrowLeft size={15} />
          {t('admin.detail.back')}
        </button>

        {loading ? (
          <SkeletonCard>
            <Skeleton className="h-40 w-full" />
          </SkeletonCard>
        ) : !planner ? (
          <p className="text-[13px] text-fg3">{t('admin.detail.notFound')}</p>
        ) : (
          <div className="grid grid-cols-[1.4fr_1fr] gap-5">
            <div className="flex flex-col gap-5">
              <Section>
                <div className="flex items-start gap-4">
                  <Avatar seed={planner.seed} size={56} initials={planner.businessName.charAt(0)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h1 className="font-display text-xl font-semibold text-fg1">{planner.businessName}</h1>
                      <Badge tone={planner.verified ? 'green' : 'amber'}>
                        {t(planner.verified ? 'admin.approvals.verified' : 'admin.approvals.pending')}
                      </Badge>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[12.5px] text-fg3">
                      <span>{planner.fullName}</span>
                      {planner.phone && <span>{planner.phone}</span>}
                      <span className="inline-flex items-center gap-1">
                        <MapPin size={13} />
                        {t(`cities.${planner.city}`)}
                      </span>
                    </div>
                    <div className="mt-2 flex gap-1.5">
                      {planner.categories.map((c) => (
                        <Badge key={c} tone="purple">
                          {t(`categories.${c}`)}
                        </Badge>
                      ))}
                    </div>
                    {(planner.instagram || planner.website) && (
                      <div className="mt-2.5 flex gap-4 text-[12.5px] text-fg2">
                        {planner.instagram && (
                          <span className="inline-flex items-center gap-1">
                            <InstagramLogo size={14} />
                            {planner.instagram}
                          </span>
                        )}
                        {planner.website && (
                          <span className="inline-flex items-center gap-1">
                            <GlobeSimple size={14} />
                            {planner.website}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {planner.bio && <p className="mt-4 text-[13.5px] leading-relaxed text-fg2">{planner.bio}</p>}

                <div className="mt-4 grid grid-cols-4 gap-3 border-t border-border pt-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase text-fg3">{t('admin.detail.teamSize')}</div>
                    <div className="text-[13px] font-semibold text-fg1">{planner.teamSize ?? '—'}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase text-fg3">{t('admin.detail.yearsInBusiness')}</div>
                    <div className="text-[13px] font-semibold text-fg1">{planner.yearsInBusiness ?? '—'}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase text-fg3">{t('admin.detail.budgetTier')}</div>
                    <div className="text-[13px] font-semibold text-fg1">{planner.budgetTier ?? '—'}</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold uppercase text-fg3">{t('admin.detail.startingPrice')}</div>
                    <div className="text-[13px] font-semibold text-fg1">
                      {planner.startingPrice != null
                        ? `${t('common.sar')} ${formatNumber(planner.startingPrice, i18n.language)}`
                        : '—'}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <div>
                    <div className="text-[11px] font-semibold uppercase text-fg3">{t('admin.detail.crNumber')}</div>
                    <div className="text-[13px] font-semibold text-fg1">{planner.crNumber ?? '—'}</div>
                  </div>
                  <div className="text-[12px] text-fg3">
                    {t('admin.detail.appliedOn')}: {formatDate(planner.createdAt, i18n.language, { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </Section>

              {planner.services.length > 0 && (
                <Section title={t('admin.detail.services')}>
                  <div className="flex flex-col gap-3">
                    {planner.services.map((s) => (
                      <div key={s.id} className="flex items-center gap-3.5 rounded-md border border-border p-3">
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-sm bg-purple-50">
                          {s.imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element -- small admin-review thumbnail
                            <img src={s.imageUrl} alt="" className="h-full w-full object-cover" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[13.5px] font-semibold text-fg1">{s.name}</div>
                          {s.description && <div className="text-[12px] text-fg3">{s.description}</div>}
                        </div>
                        <div className="text-[12.5px] font-semibold text-brand">
                          {t('common.sar')} {formatNumber(s.fromPrice, i18n.language)}
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}
            </div>

            <div className="flex flex-col gap-5">
              <Section title={t('admin.detail.actions')}>
                <div className="flex flex-col gap-2.5">
                  {planner.verified ? (
                    <Button variant="secondary" icon={XCircle} disabled={busy} onClick={() => setVerified(false)} className="justify-center">
                      {t('admin.approvals.reject')}
                    </Button>
                  ) : (
                    <Button icon={CheckCircle} disabled={busy} onClick={() => setVerified(true)} className="justify-center">
                      {t('admin.approvals.approve')}
                    </Button>
                  )}
                </div>
              </Section>

              <Section title={t('admin.detail.portfolio')}>
                {planner.portfolioUrls.length === 0 ? (
                  <p className="text-[12.5px] text-fg3">{t('admin.detail.noPortfolio')}</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {planner.portfolioUrls.map((url) => (
                      <div key={url} className="aspect-square overflow-hidden rounded-sm bg-purple-50">
                        {/* eslint-disable-next-line @next/next/no-img-element -- small admin-review thumbnail */}
                        <img src={url} alt="" className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
