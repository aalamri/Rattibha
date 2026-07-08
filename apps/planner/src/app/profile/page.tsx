'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle, CrownSimple, MapPin, NotePencil, Plus, Star, Storefront as StorefrontIcon, Trash, X } from 'phosphor-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

import { Avatar, GRADIENTS } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Section } from '@/components/ui/Section';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { CITY_KEYS, type CityKey } from '@/data/categories';
import { useAuth } from '@/lib/AuthContext';
import { formatNumber } from '@/lib/format';
import { deletePortfolioImage, uploadPortfolioImage } from '@/lib/portfolioStorage';
import { supabase } from '@/lib/supabase';
import { subscribeToWebPush, unsubscribeFromWebPush } from '@/lib/webPush';
import type { Database } from '@/lib/database.types';

type PlannerService = Database['public']['Tables']['planner_services']['Row'];

const PORTFOLIO_SEEDS = [0, 1, 2, 3, 4, 5];
const MAX_PORTFOLIO_PHOTOS = 8;

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

function NotificationsSection() {
  const { t } = useTranslation();
  const { session, profile } = useAuth();
  const subscriptionFromProfile = !!profile?.web_push_subscription;
  const [trackedSubscription, setTrackedSubscription] = useState(subscriptionFromProfile);
  const [enabled, setEnabled] = useState(subscriptionFromProfile);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<'denied' | 'unsupported' | null>(null);

  // Adjust local state during render (instead of an effect) whenever the
  // profile's subscription flag changes underneath us.
  if (subscriptionFromProfile !== trackedSubscription) {
    setTrackedSubscription(subscriptionFromProfile);
    setEnabled(subscriptionFromProfile);
  }

  async function handleToggle() {
    if (!session) return;
    setWorking(true);
    setError(null);

    try {
      if (enabled) {
        await unsubscribeFromWebPush(session.user.id);
        setEnabled(false);
      } else {
        const result = await subscribeToWebPush(session.user.id);
        if (result === 'subscribed') {
          setEnabled(true);
        } else {
          setError(result);
        }
      }
    } finally {
      setWorking(false);
    }
  }

  return (
    <Section title={t('profile.notifications.title')}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[13.5px] font-semibold text-fg1">{t('profile.notifications.toggleLabel')}</div>
          <div className="mt-0.5 text-xs text-fg3">{t('profile.notifications.toggleDescription')}</div>
          {error === 'denied' && (
            <div className="mt-1.5 text-xs font-semibold text-danger">{t('profile.notifications.permissionDenied')}</div>
          )}
          {error === 'unsupported' && (
            <div className="mt-1.5 text-xs font-semibold text-danger">{t('profile.notifications.unsupported')}</div>
          )}
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={t('profile.notifications.toggleLabel')}
          disabled={working}
          onClick={handleToggle}
          className={`flex h-6 w-11 flex-shrink-0 items-center rounded-full p-0.5 transition-colors ${
            enabled ? 'justify-end bg-brand' : 'justify-start bg-border'
          }`}
        >
          <span className="h-5 w-5 rounded-full bg-white" />
        </button>
      </div>
    </Section>
  );
}

interface EditableService {
  tempId: string;
  id: string | null;
  name: string;
  description: string;
  fromPrice: string;
  seed: number;
  imageUrl: string | null;
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
  const [portfolioUrls, setPortfolioUrls] = useState<string[]>([]);
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
        imageUrl: s.image_url,
      }))
    );
    setDeletedServiceIds([]);
    setPortfolioUrls(planner.portfolio_urls ?? []);
    setEditing(true);
  }

  function updateServiceField(
    tempId: string,
    field: 'name' | 'description' | 'fromPrice' | 'seed' | 'imageUrl',
    value: string | number | null
  ) {
    setEditableServices((prev) => prev.map((s) => (s.tempId === tempId ? { ...s, [field]: value } : s)));
  }

  function addServiceRow() {
    setEditableServices((prev) => [
      ...prev,
      { tempId: `new-${Date.now()}`, id: null, name: '', description: '', fromPrice: '', seed: prev.length, imageUrl: null },
    ]);
  }

  async function handlePortfolioFilesSelected(fileList: FileList | null) {
    if (!fileList || !session) return;
    const room = MAX_PORTFOLIO_PHOTOS - portfolioUrls.length;
    if (room <= 0) return;
    const files = Array.from(fileList)
      .filter((file) => file.type.startsWith('image/'))
      .slice(0, room);
    const uploaded = await Promise.all(files.map((file) => uploadPortfolioImage(session.user.id, file)));
    const urls = uploaded.filter((url): url is string => url !== null);
    setPortfolioUrls((prev) => [...prev, ...urls]);
  }

  function removePortfolioImage(url: string) {
    setPortfolioUrls((prev) => prev.filter((u) => u !== url));
    void deletePortfolioImage(url);
  }

  async function handleServiceFileSelected(tempId: string, file: File) {
    if (!session) return;
    const url = await uploadPortfolioImage(session.user.id, file, 'services');
    if (url) updateServiceField(tempId, 'imageUrl', url);
  }

  function removeServiceImage(tempId: string) {
    const target = editableServices.find((s) => s.tempId === tempId);
    if (target?.imageUrl) void deletePortfolioImage(target.imageUrl);
    updateServiceField(tempId, 'imageUrl', null);
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

    const { error: plannerError } = await supabase
      .from('planners')
      .update({
        business_name: businessName.trim() || planner.business_name,
        bio: bio.trim() || null,
        instagram: instagram.trim() || null,
        website: website.trim() || null,
        city,
        portfolio_urls: portfolioUrls,
      })
      .eq('user_id', session.user.id);

    if (plannerError) {
      setSaving(false);
      toast.error(t('toast.error'));
      return;
    }

    if (deletedServiceIds.length > 0) {
      const { error } = await supabase.from('planner_services').delete().in('id', deletedServiceIds);
      if (error) {
        setSaving(false);
        toast.error(t('toast.error'));
        return;
      }
    }

    for (const s of editableServices) {
      const payload = {
        planner_id: session.user.id,
        name: s.name.trim(),
        description: s.description.trim() || null,
        from_price: Number(s.fromPrice) || 0,
        seed: s.seed,
        image_url: s.imageUrl,
      };
      if (!s.name.trim()) continue;
      const { error } = s.id
        ? await supabase.from('planner_services').update(payload).eq('id', s.id)
        : await supabase.from('planner_services').insert(payload);
      if (error) {
        setSaving(false);
        toast.error(t('toast.error'));
        return;
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
    setPortfolioUrls(planner.portfolio_urls ?? []);
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
                  initials={(businessName || planner.business_name).charAt(0)}
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
                  {/* Editable fields read from local form state rather than
                      `planner` directly — AuthContext's copy doesn't refresh
                      after a save, so reading it here would show stale data
                      until the next full reload. Form state is already kept
                      in sync with `planner` on load/cancel, and now also
                      holds the just-saved values after a successful save. */}
                  <h2 className="font-display text-2xl font-semibold text-fg1">{businessName}</h2>
                  <div className="mt-1 flex items-center gap-3 text-[13px] text-fg3">
                    <span className="inline-flex items-center gap-1">
                      <MapPin size={15} />
                      {t(`cities.${city}`)}
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

                  {bio && (
                    <p className="mt-3.5 text-[13.5px] leading-relaxed text-fg2">{bio}</p>
                  )}

                  {(instagram || website) && (
                    <div className="mt-3 flex gap-4 text-[12.5px] text-fg3">
                      {instagram && <span>{instagram}</span>}
                      {website && <span>{website}</span>}
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
                        className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-sm"
                        style={s.imageUrl ? undefined : { background: GRADIENTS[s.seed % GRADIENTS.length] }}
                      >
                        {s.imageUrl && (
                          // eslint-disable-next-line @next/next/no-img-element -- small storefront thumbnail, not worth next/image's overhead here
                          <img src={s.imageUrl} alt="" className="h-full w-full object-cover" />
                        )}
                      </div>
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
                      {s.imageUrl ? (
                        <div className="flex flex-col gap-1.5">
                          <span className="text-[12px] font-semibold text-fg2">{t('profile.servicesManager.image')}</span>
                          <button
                            type="button"
                            onClick={() => removeServiceImage(s.tempId)}
                            className="self-start text-[11.5px] font-semibold text-danger"
                          >
                            {t('profile.servicesManager.removePhoto')}
                          </button>
                        </div>
                      ) : (
                        <>
                          <SeedSwatchPicker
                            value={s.seed}
                            onChange={(seed) => updateServiceField(s.tempId, 'seed', seed)}
                            label={t('profile.servicesManager.image')}
                          />
                          <input
                            id={`service-photo-${s.tempId}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleServiceFileSelected(s.tempId, file);
                              e.target.value = '';
                            }}
                          />
                          <label
                            htmlFor={`service-photo-${s.tempId}`}
                            className="cursor-pointer self-end rounded-full border-[1.5px] border-border-strong px-2.5 py-2 text-[11.5px] font-semibold text-fg1"
                          >
                            {t('profile.servicesManager.uploadPhoto')}
                          </label>
                        </>
                      )}
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
                      className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-sm"
                      style={service.image_url ? undefined : { background: GRADIENTS[service.seed % GRADIENTS.length] }}
                    >
                      {service.image_url && (
                        // eslint-disable-next-line @next/next/no-img-element -- small storefront thumbnail, not worth next/image's overhead here
                        <img src={service.image_url} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
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
            {editing ? (
              <>
                <input
                  id="portfolio-upload-input"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    handlePortfolioFilesSelected(e.target.files);
                    e.target.value = '';
                  }}
                />
                <div className="grid grid-cols-3 gap-2">
                  {portfolioUrls.map((url) => (
                    <div key={url} className="relative aspect-square overflow-hidden rounded-sm">
                      {/* eslint-disable-next-line @next/next/no-img-element -- small gallery thumbnail, not worth next/image's overhead here */}
                      <img src={url} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePortfolioImage(url)}
                        aria-label={t('profile.portfolioManager.remove')}
                        className="absolute end-1 top-1 grid h-5.5 w-5.5 place-items-center rounded-full bg-fg1/70 text-white"
                      >
                        <X size={12} weight="bold" />
                      </button>
                    </div>
                  ))}
                  {portfolioUrls.length < MAX_PORTFOLIO_PHOTOS && (
                    <label
                      htmlFor="portfolio-upload-input"
                      className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-sm border-[1.5px] border-dashed border-border-strong bg-purple-50"
                    >
                      <Plus size={18} className="text-brand" />
                    </label>
                  )}
                </div>
                <div className="mt-2 text-[11.5px] text-fg3">
                  {t('profile.portfolioManager.count', { current: portfolioUrls.length, max: MAX_PORTFOLIO_PHOTOS })}
                </div>
              </>
            ) : portfolioUrls.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {portfolioUrls.map((url) => (
                  <div key={url} className="aspect-square overflow-hidden rounded-sm">
                    {/* eslint-disable-next-line @next/next/no-img-element -- small gallery thumbnail, not worth next/image's overhead here */}
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {PORTFOLIO_SEEDS.map((seed) => (
                  <div
                    key={seed}
                    className="aspect-square rounded-sm"
                    style={{ background: GRADIENTS[seed % GRADIENTS.length] }}
                  />
                ))}
              </div>
            )}
          </Section>

          <NotificationsSection />

          <Button variant="secondary" icon={StorefrontIcon} className="w-full">
            {t('profile.view')}
          </Button>
        </div>
      </div>
    </DashboardShell>
  );
}
