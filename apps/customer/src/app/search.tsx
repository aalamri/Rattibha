'use client';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import {
  ArrowLeft,
  ClockCounterClockwise,
  MagnifyingGlass,
  SlidersHorizontal,
  XCircle,
} from 'phosphor-react-native';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlannerRow } from '@/components/discover/PlannerRow';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui/Text';
import { CATEGORY_KEYS, CITY_KEYS, type CategoryKey, type CityKey } from '@/data/planners';
import { useIsRTL } from '@/i18n/useIsRTL';
import { type DBPlannerRow, PLANNER_SELECT, toPlanner } from '@/lib/db';
import { formatNumber } from '@/lib/format';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/theme/ThemeContext';
import { fonts } from '@/theme/fonts';
import { radii, shadows } from '@/theme/tokens';

const RECENT_KEY = 'rtb_recent_searches';
const MAX_RECENT = 5;

type SortKey = 'rating' | 'price_asc' | 'price_desc';

interface Filters {
  city: CityKey | null;
  category: CategoryKey | null;
  maxBudget: number;
  sort: SortKey;
}

const DEFAULT_FILTERS: Filters = {
  city: null,
  category: null,
  maxBudget: 60000,
  sort: 'rating',
};

export default function SearchScreen() {
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const theme = useTheme();
  const router = useRouter();
  const inputRef = useRef<TextInput>(null);

  const row = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };
  const fontFamily = isRTL ? fonts.arSans.regular : fonts.sans.regular;
  const boldFont = isRTL ? fonts.arSans.bold : fonts.sans.bold;

  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>([]);
  const [results, setResults] = useState<ReturnType<typeof toPlanner>[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  // Load recent searches
  useEffect(() => {
    AsyncStorage.getItem(RECENT_KEY).then((val) => {
      if (val) setRecent(JSON.parse(val));
    });
    // Auto-focus input
    setTimeout(() => inputRef.current?.focus(), 150);
  }, []);

  // Search on query/filter change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => { doSearch(query, filters); }, 300);
    return () => clearTimeout(timer);
  }, [query, filters]);

  async function doSearch(q: string, f: Filters) {
    setLoading(true);
    let qb = supabase
      .from('planners')
      .select(PLANNER_SELECT)
      .eq('verified', true);

    if (q.trim()) {
      qb = qb.ilike('business_name', `%${q.trim()}%`);
    }
    if (f.city) {
      qb = qb.eq('city', f.city);
    }
    if (f.category) {
      qb = qb.contains('categories', [f.category]);
    }

    if (f.sort === 'rating') {
      qb = qb.order('rating', { ascending: false });
    }

    const { data } = await qb.limit(30);
    let planners = (data ?? []).map((r) => toPlanner(r as unknown as DBPlannerRow));

    // Client-side budget filter (no DB column for min price; filter after fetch)
    planners = planners.filter((p) => p.from <= f.maxBudget);

    if (f.sort === 'price_asc') planners.sort((a, b) => a.from - b.from);
    if (f.sort === 'price_desc') planners.sort((a, b) => b.from - a.from);

    setResults(planners);
    setLoading(false);
  }

  async function commitSearch(q: string) {
    if (!q.trim()) return;
    const updated = [q, ...recent.filter((r) => r !== q)].slice(0, MAX_RECENT);
    setRecent(updated);
    await AsyncStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  }

  const hasActiveFilters =
    filters.city !== null ||
    filters.category !== null ||
    filters.maxBudget < 60000 ||
    filters.sort !== 'rating';

  return (
    <View style={{ flex: 1, backgroundColor: theme.bgCanvas }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        {/* Search bar row */}
        <View style={[row, { alignItems: 'center', gap: 10, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 12 }]}>
          {/* Back */}
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t('common.back')}
            style={{
              width: 38, height: 38, borderRadius: radii.pill,
              borderWidth: 1.5, borderColor: theme.border,
              backgroundColor: theme.bgSurface,
              alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
            <ArrowLeft size={18} color={theme.fg1} style={isRTL ? { transform: [{ scaleX: -1 }] } : undefined} />
          </Pressable>

          {/* Input */}
          <View style={[
            row,
            {
              flex: 1, alignItems: 'center', gap: 9,
              backgroundColor: theme.bgSurface,
              borderWidth: 1.5, borderColor: query ? theme.brand : theme.borderStrong,
              borderRadius: radii.md, paddingHorizontal: 13, paddingVertical: 11,
              ...(query ? { shadowColor: theme.brand, shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 0 } } : {}),
            },
          ]}>
            <MagnifyingGlass size={18} color={query ? theme.brand : theme.fg3} />
            <TextInput
              ref={inputRef}
              value={query}
              onChangeText={setQuery}
              onSubmitEditing={() => commitSearch(query)}
              placeholder={t('discover.searchPlaceholder')}
              placeholderTextColor={theme.fg3}
              returnKeyType="search"
              style={{
                flex: 1, fontFamily, fontSize: 14, color: theme.fg1,
                textAlign: isRTL ? 'right' : 'left',
              }}
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <XCircle size={17} color={theme.fg3} weight="fill" />
              </Pressable>
            )}
          </View>

          {/* Filter button */}
          <Pressable
            onPress={() => setShowFilters(true)}
            style={[
              shadows.brand,
              {
                width: 44, height: 44, borderRadius: radii.md,
                backgroundColor: hasActiveFilters ? theme.accent : theme.brand,
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              },
            ]}>
            <SlidersHorizontal size={19} color={hasActiveFilters ? theme.fg1 : theme.fgOnBrand} weight="bold" />
          </Pressable>
        </View>

        {/* Body */}
        {!query && recent.length > 0 && (
          <View style={{ paddingHorizontal: 18, marginBottom: 16 }}>
            <Text style={{ fontFamily: boldFont, fontSize: 12, color: theme.fg3, letterSpacing: 0.8, marginBottom: 10 }}>
              {t('search.recent').toUpperCase()}
            </Text>
            <View style={[row, { flexWrap: 'wrap', gap: 8 }]}>
              {recent.map((r) => (
                <Pressable
                  key={r}
                  onPress={() => setQuery(r)}
                  style={[row, {
                    alignItems: 'center', gap: 6,
                    backgroundColor: theme.bgSurface,
                    borderWidth: 1, borderColor: theme.border,
                    borderRadius: radii.pill, paddingVertical: 8, paddingHorizontal: 13,
                  }]}>
                  <ClockCounterClockwise size={14} color={theme.fg3} />
                  <Text style={{ fontFamily, fontSize: 13, color: theme.fg1 }}>{r}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Results header */}
        <View style={[row, { justifyContent: 'space-between', alignItems: 'baseline', paddingHorizontal: 18, marginBottom: 10 }]}>
          <Text variant="h3">
            {query ? t('search.resultsFor', { q: query }) : t('search.allPlanners')}
          </Text>
          {!loading && (
            <Text style={{ fontFamily, fontSize: 12.5, color: theme.fg3 }}>
              {t('search.found', { count: results.length })}
            </Text>
          )}
        </View>

        {loading ? (
          <View style={{ flex: 1, alignItems: 'center', paddingTop: 60 }}>
            <ActivityIndicator color={theme.brand} />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(p) => p.id}
            contentContainerStyle={{ paddingHorizontal: 18, gap: 11, paddingBottom: 30 }}
            renderItem={({ item }) => (
              <PlannerRow
                planner={item}
                onPress={(p) => router.push({ pathname: '/planner/[id]', params: { id: p.id } })}
              />
            )}
            ListEmptyComponent={
              <View style={{ alignItems: 'center', paddingTop: 48, gap: 10 }}>
                <MagnifyingGlass size={34} color={theme.fg3} />
                <Text variant="small" color={theme.fg3}>{t('search.noResults')}</Text>
              </View>
            }
          />
        )}
      </SafeAreaView>

      {/* Filter sheet */}
      <FilterSheet
        visible={showFilters}
        filters={filters}
        onApply={(f) => { setFilters(f); setShowFilters(false); }}
        onClose={() => setShowFilters(false)}
      />
    </View>
  );
}

// ─── Filter Sheet ────────────────────────────────────────────────────────────

function FilterSheet({
  visible,
  filters,
  onApply,
  onClose,
}: {
  visible: boolean;
  filters: Filters;
  onApply: (f: Filters) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const isRTL = useIsRTL();
  const theme = useTheme();
  const row = { flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const) };
  const boldFont = isRTL ? fonts.arSans.bold : fonts.sans.bold;

  const [local, setLocal] = useState<Filters>(filters);
  // Sync when parent opens sheet with current filters
  useEffect(() => { if (visible) setLocal(filters); }, [visible]);

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: 'rating', label: t('search.sortRating') },
    { key: 'price_asc', label: t('search.sortPriceAsc') },
    { key: 'price_desc', label: t('search.sortPriceDesc') },
  ];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(43,34,51,0.45)' }} onPress={onClose} />
      <View style={{
        backgroundColor: theme.bgCanvas, borderTopLeftRadius: 24, borderTopRightRadius: 24,
        paddingHorizontal: 22, paddingBottom: 36, paddingTop: 14,
        shadowColor: '#2B2233', shadowOpacity: 0.3, shadowRadius: 44, shadowOffset: { width: 0, height: -18 },
      }}>
        {/* Handle */}
        <View style={{ width: 40, height: 5, borderRadius: radii.pill, backgroundColor: theme.borderStrong, alignSelf: 'center', marginBottom: 16 }} />

        {/* Header */}
        <View style={[row, { justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }]}>
          <Text variant="h2">{t('discover.filters')}</Text>
          <Pressable onPress={() => setLocal(DEFAULT_FILTERS)} hitSlop={8}>
            <Text style={{ fontFamily: boldFont, fontSize: 13, color: theme.brand }}>{t('search.reset')}</Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 20 }}>
          {/* City */}
          <FilterGroup label={t('discover.chooseCity')}>
            <View style={[row, { flexWrap: 'wrap', gap: 8 }]}>
              <Pill active={local.city === null} onPress={() => setLocal({ ...local, city: null })}>
                {t('cities.all')}
              </Pill>
              {CITY_KEYS.slice(0, 6).map((c) => (
                <Pill key={c} active={local.city === c} onPress={() => setLocal({ ...local, city: c })}>
                  {t(`cities.${c}`)}
                </Pill>
              ))}
            </View>
          </FilterGroup>

          {/* Category */}
          <FilterGroup label={t('search.eventType')}>
            <View style={[row, { flexWrap: 'wrap', gap: 8 }]}>
              <Pill active={local.category === null} onPress={() => setLocal({ ...local, category: null })}>
                {t('search.allTypes')}
              </Pill>
              {CATEGORY_KEYS.map((c) => (
                <Pill key={c} active={local.category === c} onPress={() => setLocal({ ...local, category: c })}>
                  {t(`categories.${c}`)}
                </Pill>
              ))}
            </View>
          </FilterGroup>

          {/* Budget */}
          <FilterGroup label={t('search.budgetUpTo', { amount: `${t('common.sar')} ${formatNumber(local.maxBudget, isRTL)}` })}>
            <View style={{ paddingHorizontal: 4 }}>
              {/* Simple step buttons as RN has no native range slider */}
              <View style={[row, { justifyContent: 'space-between', gap: 6 }]}>
                {[10000, 20000, 30000, 45000, 60000].map((v) => (
                  <Pill key={v} active={local.maxBudget === v} onPress={() => setLocal({ ...local, maxBudget: v })}>
                    {v >= 60000 ? `60K+` : `${v / 1000}K`}
                  </Pill>
                ))}
              </View>
            </View>
          </FilterGroup>

          {/* Sort */}
          <FilterGroup label={t('search.sortBy')}>
            <View style={[row, { flexWrap: 'wrap', gap: 8 }]}>
              {SORT_OPTIONS.map((s) => (
                <Pill key={s.key} active={local.sort === s.key} onPress={() => setLocal({ ...local, sort: s.key })}>
                  {s.label}
                </Pill>
              ))}
            </View>
          </FilterGroup>
        </ScrollView>

        <View style={{ marginTop: 24 }}>
          <Button full onPress={() => onApply(local)}>{t('search.showResults')}</Button>
        </View>
      </View>
    </Modal>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  const isRTL = useIsRTL();
  const theme = useTheme();
  const boldFont = isRTL ? fonts.arSans.bold : fonts.sans.bold;
  return (
    <View style={{ gap: 10 }}>
      <Text style={{ fontFamily: boldFont, fontSize: 13, color: theme.fg1 }}>{label}</Text>
      {children}
    </View>
  );
}

function Pill({ active, onPress, children }: { active: boolean; onPress: () => void; children: string }) {
  const isRTL = useIsRTL();
  const theme = useTheme();
  const boldFont = isRTL ? fonts.arSans.bold : fonts.sans.bold;
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 8, paddingHorizontal: 14, borderRadius: radii.pill,
        borderWidth: 1.5,
        borderColor: active ? theme.brand : theme.borderStrong,
        backgroundColor: active ? theme.bgBlush : theme.bgSurface,
      }}>
      <Text style={{ fontFamily: boldFont, fontSize: 13, color: active ? theme.brand : theme.fg1 }}>
        {children}
      </Text>
    </Pressable>
  );
}
