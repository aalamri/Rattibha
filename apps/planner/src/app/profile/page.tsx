'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle, CrownSimple, MapPin, NotePencil, Plus, Star, Storefront as StorefrontIcon, Trash, X } from 'phosphor-react';
import { useTranslation } from 'react-i18next';

import { Avatar, GRADIENTS } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { CITY_KEYS, type CityKey } from '@/data/categories';
import { useAuth } from '@/lib/AuthContext';
import { formatNumber } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

type PlannerService = Database['public']['Tables']['planner_services']['Row'];

const PORTFOLIO_SEEDS = [0, 1, 2, 3, 4, 5];

function Field({
  label,
  value,
  onChange,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const cls =
    'w-full rounded-md border border-border bg-bg-app px-3.5 py-2.5 text-[13.5px] text-fg1 outline-none focus:border-brand';
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold text-fg2">{label}</span>
      {multiline ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls + ' resize-none leading-relaxed'}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cls}
        />
      )}
    </label>
  );
}

function CitySelect({ value, onChange, label }: { value: string; onChange: (v: CityKey) => void; label: string }) {
  const { t } = useTranslation();
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12.5px] font-semibold text-fg2">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as CityKey)}
        className="rounded-md border border-border bg-bg-app px-3.5 py-2.5 text-[13.5px] text-fg1 outline-none focus:border-brand"
      >
        {CITY_KEYS.map((city) => (
          <option key={city} value={city}>
            {t(`cities.${city}`)}
          </option>
        ))}
      </select>
    </label>
  );
}

function SeedSwatchPicker({ value, onChange, label }: { value: number; onChange: (seed: number) => void; label: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[12px] font-semibold text-fg2">{label}</span>
      <div className="flex gap-1.5">
        {GRADIENTS.map((gradient, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            aria-label={`${label} ${i + 1}`}
            aria-pressed={value % GRADIENTS.length === i}
            className={`h-7 w-7 flex-shrink-0 rounded-full ${
              value % GRADIENTS.length === i ? 'ring-2 ring-brand ring-offset-2 ring-offset-bg-surface' : ''
            }`}
            style={{ background: gradient }}
          />
        ))}
      </div>
    </div>
  );
}

interface EditableService {
  tempId: string;
  id: string | null;
  name: string;
  description: string;
  fromPrice: string;
  seed: number;
}

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const { session, profile, planner } = useAuth();
  const [services, setServices] = useState<PlannerService[]>([]);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Edit form state — initialised from planner row
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [instagram, setInstagram] = useState('');
  const [website, setWebsite] = useState('');
  const [city, setCity] = useState<CityKey>('riyadh');
  const [editableServices, setEditableServices] = useState<EditableService[]>([]);
  const [deletedServiceIds, setDeletedServiceIds] = useState<string[]>([]);
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const refetchServices = useCallback(() => {
    if (!session) return;
    supabase
      .from('planner_services')
      .select('*')
      .eq('planner_id', session.user.id)
      .then(({ data }) => setServices(data ?? []));
  }, [session]);

  useEffect(() => {
    refetchServices();
  }, [refetchServices]);

  function startEditing() {
    if (!planner) return;
    setBusinessName(planner.business_name ?? '');
    setBio(planner.bio ?? '');
    setInstagram(planner.instagram ?? '');
    setWebsite(planner.website ?? '');
    setCity((planner.city as CityKey) ?? 'riyadh');
    setEditableServices(
      services.map((s) => ({
        tempId: s.id,
        id: s.id,
        name: s.name,
        description: s.description ?? '',
        fromPrice: String(s.from_price),
        seed: s.seed,
      }))
    );
    setDeletedServiceIds([]);
    setEditing(true);
  }

  function updateServiceField(tempId: string, field: 'name' | 'description' | 'fromPrice' | 'seed', value: string | number) {
    setEditableServices((prev) => prev.map((s) => (s.tempId === tempId ? { ...s, [field]: value } : s)));
  }

  function addServiceRow() {
    setEditableServices((prev) => [
      ...prev,
      { tempId: `new-${Date.now()}`, id: null, name: '', description: '', fromPrice: '', seed: prev.length },
    ]);
  }

  function removeServiceRow(tempId: string) {
    const target = editableServices.find((s) => s.tempId === tempId);
    if (target?.id) setDeletedServiceIds((prev) => [...prev, target.id as string]);
    setEditableServices((prev) => prev.filter((s) => s.tempId !== tempId));
  }

  if (!planner || !profile) {
    return (
      <DashboardShell title={t('profile.title')} subtitle={t('profile.subtitle')}>
        <div className="p-7" />
      </DashboardShell>
    );
  }

  async function handleSave() {
    if (!session || !planner) return;
    setSaving(true);

    await supabase
      .from('planners')
      .update({
        business_name: businessName.trim() || planner.business_name,
        bio: bio.trim() || null,
        instagram: instagram.trim() || null,
        website: website.trim() || null,
        city,
      })
      .eq('user_id', session.user.id);

    if (deletedServiceIds.length > 0) {
      await supabase.from('planner_services').delete().in('id', deletedServiceIds);
    }

    for (const s of editableServices) {
      const payload = {
        planner_id: session.user.id,
        name: s.name.trim(),
        description: s.description.trim() || null,
        from_price: Number(s.fromPrice) || 0,
        seed: s.seed,
      };
      if (!s.name.trim()) continue;
      if (s.id) {
        await supabase.from('planner_services').update(payload).eq('id', s.id);
      } else {
        await supabase.from('planner_services').insert(payload);
      }
    }

    refetchServices();
    setSaving(false);
    setEditing(false);
    setSaved(true);
    if (savedTimer.current) clearTimeout(savedTimer.current);
    savedTimer.current = setTimeout(() => setSaved(false), 3000);
  }

  function handleCancel() {
    if (!planner) return;
    setBusinessName(planner.business_name ?? '');
    setBio(planner.bio ?? '');
    setInstagram(planner.instagram ?? '');
    setWebsite(planner.website ?? '');
    setCity((planner.city as CityKey) ?? 'riyadh');
    setEditing(false);
  }

  return (
    <DashboardShell title={t('profile.title')} subtitle={t('profile.subtitle')}>
      <div className="grid grid-cols-[1.5fr_1fr] gap-5 p-7">
        <div className="flex flex-col gap-5">
          {/* cover + identity */}
          <Card pad={0} className="overflow-hidden">
            <div className="h-[140px] bg-[linear-gradient(135deg,#6E3A9C,#3A1B52)]" />
            <div className="px-5.5 pb-5.5">
              <div className="-mt-9.5 flex items-end gap-4">
                <Avatar
                  seed={profile.avatar_seed}
                  size={88}
                  initials={planner.business_name.charAt(0)}
                  className="border-4 border-bg-surface !rounded-[22px] text-3xl"
                />
                <div className="flex-1 pb-1.5">
                  <Badge tone="gold" icon={CrownSimple}>
                    {planner.tier}
                  </Badge>
                </div>
                <div className="flex gap-2 pb-1.5">
                  {saved && (
                    <span className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-emerald-600">
                      <CheckCircle size={15} weight="fill" />
                      {t('profile.saved')}
                    </span>
                  )}
                  {editing ? (
                    <>
                      <Button variant="secondary" size="sm" icon={X} onClick={handleCancel}>
                        {t('profile.cancel')}
                      </Button>
                      <Button size="sm" icon={CheckCircle} disabled={saving} onClick={handleSave}>
                        {t('profile.save')}
                      </Button>
                    </>
                  ) : (
                    <Button variant="secondary" size="sm" icon={NotePencil} onClick={startEditing}>
                      {t('profile.edit')}
                    </Button>
                  )}
                </div>
              </div>

              {editing ? (
                <div className="mt-4.5 flex flex-col gap-3.5">
                  <Field
                    label={t('profile.fields.businessName')}
                    value={businessName}
                    onChange={setBusinessName}
                  />
                  <Field
                    label={t('profile.fields.bio')}
                    value={bio}
                    onChange={setBio}
                    placeholder={t('profile.fields.bioPlaceholder')}
                    multiline
                  />
                  <div className="grid grid-cols-2 gap-3.5">
                    <Field
                      label={t('profile.fields.instagram')}
                      value={instagram}
                      onChange={setInstagram}
                      placeholder={t('profile.fields.instagramPlaceholder')}
                    />
                    <Field
                      label={t('profile.fields.website')}
                      value={website}
                      onChange={setWebsite}
                      placeholder={t('profile.fields.websitePlaceholder')}
                    />
                  </div>
                  <CitySelect value={city} onChange={setCity} label={t('profile.fields.city')} />
                </div>
              ) : (
                <div className="mt-4.5">
                  <h2 className="font-display text-2xl font-semibold text-fg1">{planner.business_name}</h2>
                  <div className="mt-1 flex items-center gap-3 text-[13px] text-fg3">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={15} />
                      {t(`cities.${planner.city}`)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Star size={15} weight="fill" className="text-gold-500" />
                      {planner.rating} · {t('profile.reviews', { count: planner.reviews_count })}
                    </span>
                  </div>

                  <div className="mt-3 flex gap-1.5">
                    {planner.categories.map((category) => (
                      <Badge key={category} tone="purple">
                        {t(`categories.${category}`)}
                      </Badge>
                    ))}
                  </div>

                  {planner.bio && (
                    <p className="mt-3.5 text-[13.5px] leading-relaxed text-fg2">{planner.bio}</p>
                  )}

                  {(planner.instagram || planner.website) && (
                    <div className="mt-3 flex gap-4 text-[12.5px] text-fg3">
                      {planner.instagram && <span>{planner.instagram}</span>}
                      {planner.website && <span>{planner.website}</span>}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* services */}
          <Section title={t('profile.services')}>
            {editing ? (
              <div className="flex flex-col gap-3">
                {editableServices.length === 0 && (
                  <p className="text-[13px] text-fg3">{t('profile.servicesManager.empty')}</p>
                )}
                {editableServices.map((s) => (
                  <div key={s.tempId} className="flex flex-col gap-3 rounded-md border border-border p-3">
                    <div className="flex items-start gap-3.5">
                      <div
                        className="h-16 w-16 flex-shrink-0 rounded-sm"
                        style={{ background: GRADIENTS[s.seed % GRADIENTS.length] }}
                      />
                      <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <input
                          type="text"
                          value={s.name}
                          onChange={(e) => updateServiceField(s.tempId, 'name', e.target.value)}
                          placeholder={t('profile.servicesManager.namePlaceholder')}
                          className="w-full rounded-sm border border-border bg-bg-app px-3 py-2 text-[13px] font-semibold text-fg1 outline-none focus:border-brand"
                        />
                        <input
                          type="text"
                          value={s.description}
                          onChange={(e) => updateServiceField(s.tempId, 'description', e.target.value)}
                          placeholder={t('profile.servicesManager.descriptionPlaceholder')}
                          className="w-full rounded-sm border border-border bg-bg-app px-3 py-2 text-[12.5px] text-fg2 outline-none focus:border-brand"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeServiceRow(s.tempId)}
                        aria-label={t('profile.servicesManager.delete')}
                        className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-sm bg-danger-bg text-danger"
                      >
                        <Trash size={15} />
                      </button>
                    </div>
                    <div className="flex flex-wrap items-end gap-4">
                      <label className="flex flex-col gap-1.5">
                        <span className="text-[12px] font-semibold text-fg2">{t('profile.servicesManager.priceLabel')}</span>
                        <input
                          type="number"
                          min={0}
                          value={s.fromPrice}
                          onChange={(e) => updateServiceField(s.tempId, 'fromPrice', e.target.value)}
                          className="w-32 rounded-sm border border-border bg-bg-app px-3 py-2 text-[13px] text-fg1 outline-none focus:border-brand"
                        />
                      </label>
                      <SeedSwatchPicker
                        value={s.seed}
                        onChange={(seed) => updateServiceField(s.tempId, 'seed', seed)}
                        label={t('profile.servicesManager.image')}
                      />
                    </div>
                  </div>
                ))}
                <Button variant="secondary" size="sm" icon={Plus} onClick={addServiceRow} className="self-start">
                  {t('profile.servicesManager.addService')}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {services.map((service) => (
                  <div key={service.id} className="flex items-center gap-3.5 rounded-md border border-border p-3">
                    <div
                      className="h-16 w-16 flex-shrink-0 rounded-sm"
                      style={{ background: GRADIENTS[service.seed % GRADIENTS.length] }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-bold text-fg1">{service.name}</div>
                      {service.description && (
                        <div className="mt-0.5 text-[12.5px] text-fg3">{service.description}</div>
                      )}
                      <div className="mt-1 text-[12.5px] font-semibold text-brand">
                        {t('profile.from')} {t('common.sar')} {formatNumber(service.from_price, i18n.language)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* right rail */}
        <div className="flex flex-col gap-5">
          <Section title={t('profile.portfolio')}>
            <div className="grid grid-cols-3 gap-2">
              {PORTFOLIO_SEEDS.map((seed) => (
                <div
                  key={seed}
                  className="aspect-square rounded-sm"
                  style={{ background: GRADIENTS[seed % GRADIENTS.length] }}
                />
              ))}
            </div>
          </Section>

          <Button variant="secondary" icon={StorefrontIcon} className="w-full">
            {t('profile.view')}
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}
