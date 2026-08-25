import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ActivityIndicator,
  SafeAreaView, StatusBar, Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DatePickerField from './Components/DatePickerField';
import { BASE_URL,globalCompanyID,globalUserID} from '../Staff/globalState';
// ── helpers ─────────────────────────────────────────────────────────────────

const today = () => new Date().toISOString().split('T')[0];

const fmt = (n) =>
  Number(n ?? 0).toLocaleString('el-GR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// ── API ─────────────────────────────────────────────────────────────────────

const fetchAnalytics = async (companyId, user, dateFrom, dateTo) => {
  const url =
    `https://orderb.hopto.org/orderservice/Analytics` +
    `?companyid=${encodeURIComponent(companyId)}` +
    `&user=${encodeURIComponent(user)}` +
    `&datetimefrom=${encodeURIComponent(dateFrom)}` +
    `&datetimeto=${encodeURIComponent(dateTo)}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const j = await res.json();

  return {
    cash:     j.cash     ?? 0,
    card:     j.card     ?? 0,
    balance:  j.balance  ?? 0,
    total:    j.total    ?? 0,
    register: j.register ?? '—',
  };
};

const fetchUsers = async (companyId) => {
  const res = await fetch(
     `${BASE_URL}/orderservice/GetUserInfo/all?companyid=${companyId}`
  );
  const j = await res.json();
  return [
    { id: '', username: 'Όλοι' },
    ...j.map((u) => ({ id: String(u.id), username: u.username })),
  ];
};

// ── StatRow ──────────────────────────────────────────────────────────────────

const StatRow = ({ label, value }) => (
  <View style={styles.statRow}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

// ── Screen ───────────────────────────────────────────────────────────────────

const AnalyticsScreen = ({ companyId = '1', onBack }) => {
  const [users,        setUsers]        = useState([{ id: '', username: 'Όλοι' }]);
  const [selectedUser, setSelectedUser] = useState(String(globalUserID ?? ''));
  const [dateFrom,     setDateFrom]     = useState(today());
  const [dateTo,       setDateTo]       = useState(today());
  const [data,         setData]         = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  // load user list once
  useEffect(() => {
    fetchUsers(companyId).then(setUsers).catch(() => {});
  }, [companyId]);

  // reload analytics whenever filters change
  useEffect(() => {
    let alive = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchAnalytics(companyId, selectedUser, dateFrom, dateTo);
        if (alive) setData(result);
      } catch (e) {
        if (alive) setError(e.message);
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => { alive = false; };
  }, [companyId, selectedUser, dateFrom, dateTo]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />

      {/* ── HEADER ── */}
      <View style={styles.header}>
        <Text style={styles.title}>ΣΤΑΤΙΣΤΙΚΑ</Text>
      </View>

      {/* ── FILTERS CARD ── */}
      <View style={styles.filtersCard}>

        {/* User picker row */}
        <View style={styles.filterRow}>
          <View style={styles.filterLabelWrap}>
            <Text style={styles.filterIcon}>👤</Text>
            <Text style={styles.filterLabel}>ΧΡΗΣΤΗΣ</Text>
          </View>
          <View style={styles.pickerWrap}>
            <Picker
              selectedValue={selectedUser}
              onValueChange={setSelectedUser}
              style={styles.picker}
              dropdownIconColor={C.gold}
            >
              {users.map((u) => (
                <Picker.Item key={u.id} label={u.username} value={u.id} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Date row */}
        <View style={styles.filterRow}>
          <View style={styles.filterLabelWrap}>
            <Text style={styles.filterIcon}>📅</Text>
            <Text style={styles.filterLabel}>ΗΜ/ΝΙΑ</Text>
          </View>
          <View style={styles.dateFields}>
            <View style={styles.dateFieldWrap}>
              <Text style={styles.dateSubLabel}>Από</Text>
              <DatePickerField value={dateFrom} onChange={setDateFrom} />
            </View>
            <View style={styles.dateSep} />
            <View style={styles.dateFieldWrap}>
              <Text style={styles.dateSubLabel}>Έως</Text>
              <DatePickerField value={dateTo} onChange={setDateTo} />
            </View>
          </View>
        </View>
      </View>

      {/* ── STATS CARD ── */}
      <View style={styles.statsCard}>
        {loading && (
          <ActivityIndicator size="large" color={C.gold} style={styles.loader} />
        )}

        {error && !loading && (
          <View style={styles.errorWrap}>
            <Text style={styles.errorText}>⚠ {error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => setDateFrom(dateFrom)}>
              <Text style={styles.retryText}>Επανάληψη</Text>
            </TouchableOpacity>
          </View>
        )}

        {!loading && !error && data && (
          <>
            <StatRow label="ΜΕΤΡΗΤΑ:"  value={`${fmt(data.cash)}€`} />
            <View style={styles.statDivider} />
            <StatRow label="ΚΑΡΤΑ:"    value={`${fmt(data.card)}€`} />
            <View style={styles.statDivider} />
            <StatRow label="ΥΠΟΛΟΙΠΟ:" value={`${fmt(data.balance)}€`} />
            <View style={styles.statDivider} />
            <StatRow label="ΣΥΝΟΛΟ:"   value={`${fmt(data.total)}€`} />
          </>
        )}
      </View>

      {/* ── FOOTER ── */}
      <View style={styles.footer}>
        <View style={styles.registerWrap}>
          <Text style={styles.registerLabel}>ΤΑΜΕΙΟ:</Text>
          <Text style={styles.registerValue}>{data?.register ?? '—'}</Text>
        </View>

        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.75}>
          <Text style={styles.backArrow}>◀</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ── Design tokens ────────────────────────────────────────────────────────────

const C = {
  bg:          '#EAE7DE',
  card:        '#F2EFE6',
  border:      '#C8BD9A',
  gold:        '#9C8B5A',
  goldLight:   '#D4C99A',
  titleDark:   '#2E2A1C',
  valueDark:   '#1A1810',
  muted:       '#7A7156',
  white:       '#FFFFFF',
  backBtn:     '#A89460',
  error:       '#B03030',
};

const SERIF = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });

// ── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: C.bg,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
  },

  // Header
  header: { paddingHorizontal: 22, paddingTop: 20, paddingBottom: 8 },
  title: {
    fontFamily: SERIF,
    fontSize: 38,
    fontWeight: '900',
    color: C.titleDark,
    letterSpacing: 3,
  },

  // Filters card
  filtersCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    overflow: 'hidden',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  filterLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 90,
    gap: 6,
  },
  filterIcon: { fontSize: 16 },
  filterLabel: {
    fontFamily: SERIF,
    fontSize: 12,
    fontWeight: '700',
    color: C.gold,
    letterSpacing: 1,
  },
  pickerWrap: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    backgroundColor: C.white,
    overflow: 'hidden',
  },
  picker: {
    height: 44,
    color: C.titleDark,
  },
  divider: { height: 1, backgroundColor: C.border, marginHorizontal: 14 },

  // Date fields
  dateFields: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateFieldWrap: { flex: 1 },
  dateSubLabel: {
    fontSize: 11,
    color: C.muted,
    marginBottom: 2,
    fontWeight: '500',
  },
  dateSep: {
    width: 1,
    height: 36,
    backgroundColor: C.border,
    alignSelf: 'center',
  },

  // Stats card
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    paddingVertical: 6,
    paddingHorizontal: 18,
    minHeight: 180,
    justifyContent: 'center',
  },
  loader: { marginVertical: 30 },

  // Stat row
  statRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingVertical: 10,
    gap: 8,
  },
  statLabel: {
    fontFamily: SERIF,
    fontSize: 22,
    fontWeight: '700',
    color: C.gold,
    letterSpacing: 1,
    minWidth: 140,
  },
  statValue: {
    fontFamily: SERIF,
    fontSize: 22,
    fontWeight: '900',
    color: C.valueDark,
    letterSpacing: 0.5,
  },
  statDivider: { height: 1, backgroundColor: C.border, opacity: 0.5 },

  // Error
  errorWrap: { alignItems: 'center', paddingVertical: 20 },
  errorText: {
    color: C.error,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 12,
  },
  retryBtn: {
    borderWidth: 1,
    borderColor: C.gold,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  retryText: { color: C.gold, fontWeight: '700', fontSize: 13 },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 20,
    marginTop: 'auto',
  },
  registerWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  registerLabel: {
    fontFamily: SERIF,
    fontSize: 24,
    fontWeight: '700',
    color: C.gold,
    letterSpacing: 1,
  },
  registerValue: {
    fontFamily: SERIF,
    fontSize: 24,
    fontWeight: '900',
    color: C.valueDark,
    letterSpacing: 1,
  },
  backBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: C.backBtn,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  backArrow: { color: C.white, fontSize: 22 },
});

export default AnalyticsScreen;