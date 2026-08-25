import React,{useState,useEffect,useRef,useCallback} from 'react';

import {
  useFocusEffect
} from '@react-navigation/native';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Platform,
  Modal,
  ScrollView,
  TextInput,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useNavigation } from '@react-navigation/native';
import { globalCompanyID, setGloabalTableid, BASE_URL } from '../Staff/globalState';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';


// ─── Constants ───────────────────────────────────────────────────────────────

const images = [require('../assets/table.png')];
const SIGNALR_URL = `${BASE_URL}/orderservice/tableHub`;

const COLORS = {
  bg:          '#F5F1E8',
  surface:     '#E8DCC4',
  card:        '#FFFFFF',
  accent:      '#A47C46',
  accentLight: '#B8A376',
  border:      '#E0D9CC',
  text:        '#3D2E1A',
  textMuted:   '#7A6848',
  empty:       '#C0392B',
  occupied:    '#27AE60',
  reserved:    '#E67E22',
};

const getStatusColor = (status) => {
  switch (status) {
    case 0:  return COLORS.empty;
    case 1:  return COLORS.occupied;
    case 2:  return COLORS.reserved;
    default: return '#999';
  }
};

const chunkArray = (arr, size) => {
  const pages = [];
  for (let i = 0; i < arr.length; i += size) pages.push(arr.slice(i, i + size));
  return pages;
};

// ─── BackIcon ─────────────────────────────────────────────────────────────────

const BackIcon = () => (
  <View style={backIconStyles.container}>
    <View style={backIconStyles.arrow} />
  </View>
);
const backIconStyles = StyleSheet.create({
  container: { width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  arrow: {
    width: 10, height: 10,
    borderLeftWidth: 2.5, borderBottomWidth: 2.5,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
    marginLeft: 4,
  },
});

// ─── ReservationModal ────────────────────────────────────────────────────────

const EMPTY_FORM = {
  tableId: '',
  fullName: '',
  guests: '',
  notes: '',
};

function ReservationModal({ visible, onClose, tables }) {
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [tableOpen,  setTableOpen]  = useState(false);
  const [reservationDate, setReservationDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const availableTables = tables.filter((t) => t.status === 0 || t.status === 2);

  const handleSubmit = async () => {
    if (!form.tableId  || !form.fullName || !form.guests) {
      Alert.alert('Σφάλμα', 'Συμπληρώστε όλα τα υποχρεωτικά πεδία.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        tableId:         Number(form.tableId),
        reservationDate: reservationDate.toISOString(),
        customerName:    form.fullName.trim(),
        numberOfGuests:  Number(form.guests),
        notes:           form.notes.trim(),
        companyId:       globalCompanyID,
      };
      const res = await fetch(`${BASE_URL}/Reservations`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      Alert.alert('Επιτυχία', 'Η κράτηση καταχωρήθηκε!');
      setForm(EMPTY_FORM);
      onClose();
    } catch (e) {
      Alert.alert('Σφάλμα', 'Δεν ήταν δυνατή η αποθήκευση. Δοκιμάστε ξανά.');
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={resStyles.overlay}>
            <TouchableWithoutFeedback>
              <View style={resStyles.sheet}>

                {/* Header */}
                <View style={resStyles.sheetHeader}>
                  <View style={resStyles.sheetHandle} />
                  <Text style={resStyles.sheetTitle}>Νέα Κράτηση</Text>
                  <TouchableOpacity style={resStyles.closeBtn} onPress={onClose}>
                    <Text style={resStyles.closeBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView
                  contentContainerStyle={resStyles.body}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                >
                  {/* TABLE */}
                  <Text style={resStyles.label}>Τραπέζι <Text style={resStyles.req}>*</Text></Text>
                  <TouchableOpacity style={resStyles.selectBtn} onPress={() => setTableOpen(true)}>
                    <Text style={[resStyles.selectText, !form.tableId && { color: '#aaa' }]}>
                      {form.tableId ? `Τραπέζι ${form.tableId}` : 'Επιλέξτε τραπέζι'}
                    </Text>
                    <Text style={{ color: COLORS.accent }}>▾</Text>
                  </TouchableOpacity>

                  {/* Table dropdown */}
                  <Modal visible={tableOpen} transparent animationType="fade">
                    <TouchableWithoutFeedback onPress={() => setTableOpen(false)}>
                      <View style={resStyles.dropOverlay}>
                        <TouchableWithoutFeedback>
                          <View style={resStyles.dropBox}>
                            <Text style={resStyles.dropTitle}>Επιλογή τραπεζιού</Text>
                            <ScrollView style={{ maxHeight: 300 }}>
                              {availableTables.length === 0 && (
                                <Text style={{ textAlign: 'center', color: '#aaa', padding: 16 }}>
                                  Δεν υπάρχουν διαθέσιμα τραπέζια
                                </Text>
                              )}
                              {availableTables.map((t) => (
                                <TouchableOpacity
                                  key={t.id}
                                  style={[
                                    resStyles.dropItem,
                                    form.tableId === t.id && resStyles.dropItemActive,
                                  ]}
                                  onPress={() => { set('tableId', t.id); setTableOpen(false); }}
                                >
                                  <View style={[resStyles.dropDot, { backgroundColor: getStatusColor(t.status) }]} />
                                  <Text style={[
                                    resStyles.dropItemText,
                                    form.tableId === t.id && resStyles.dropItemTextActive,
                                  ]}>
                                    Τραπέζι {t.id}
                                  </Text>
                                  {form.tableId === t.id && (
                                    <Text style={{ color: COLORS.accent, marginLeft: 'auto' }}>✓</Text>
                                  )}
                                </TouchableOpacity>
                              ))}
                            </ScrollView>
                          </View>
                        </TouchableWithoutFeedback>
                      </View>
                    </TouchableWithoutFeedback>
                  </Modal>

                <Text style={resStyles.label}>
  Ημερομηνία <Text style={resStyles.req}>*</Text>
</Text>

<TouchableOpacity
  style={resStyles.selectBtn}
  onPress={() => setShowDatePicker(true)}
>
  <Text style={resStyles.selectText}>
    {reservationDate.toLocaleDateString('el-GR')}
  </Text>
</TouchableOpacity>

<Text style={resStyles.label}>
  Ώρα <Text style={resStyles.req}>*</Text>
</Text>

<TouchableOpacity
  style={resStyles.selectBtn}
  onPress={() => setShowTimePicker(true)}
>
  <Text style={resStyles.selectText}>
    {reservationDate.toLocaleTimeString('el-GR', {
      hour: '2-digit',
      minute: '2-digit',
    })}
  </Text>
</TouchableOpacity>

                  {/* FULL NAME */}
                  <Text style={resStyles.label}>Ονοματεπώνυμο <Text style={resStyles.req}>*</Text></Text>
                  <TextInput
                    style={resStyles.input}
                    placeholder="π.χ. Γιώργος Παπαδόπουλος"
                    placeholderTextColor="#aaa"
                    value={form.fullName}
                    onChangeText={(v) => set('fullName', v)}
                  />

                  {/* GUESTS */}
                  <Text style={resStyles.label}>Αριθμός ατόμων <Text style={resStyles.req}>*</Text></Text>
                  <TextInput
                    style={resStyles.input}
                    placeholder="π.χ. 4"
                    placeholderTextColor="#aaa"
                    keyboardType="number-pad"
                    value={form.guests}
                    onChangeText={(v) => set('guests', v.replace(/[^0-9]/g, ''))}
                  />

                  {/* NOTES */}
                  <Text style={resStyles.label}>Σχόλια</Text>
                  <TextInput
                    style={[resStyles.input, resStyles.textarea]}
                    placeholder="Προαιρετικά σχόλια…"
                    placeholderTextColor="#aaa"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    value={form.notes}
                    onChangeText={(v) => set('notes', v)}
                  />
{showDatePicker && (
  <DateTimePicker
    value={reservationDate}
    mode="date"
    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
    minimumDate={new Date()}
    onChange={(event, selectedDate) => {
      setShowDatePicker(false);

      if (selectedDate) {
        const updated = new Date(reservationDate);

        updated.setFullYear(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate()
        );

        setReservationDate(updated);
      }
    }}
  />
)}

{showTimePicker && (
  <DateTimePicker
    value={reservationDate}
    mode="time"
    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
    is24Hour
    onChange={(event, selectedTime) => {
      setShowTimePicker(false);

      if (selectedTime) {
        const updated = new Date(reservationDate);

        updated.setHours(
          selectedTime.getHours(),
          selectedTime.getMinutes(),
          0,
          0
        );

        setReservationDate(updated);
      }
    }}
  />
)}
                  {/* SUBMIT */}
                  <TouchableOpacity
                    style={[resStyles.submitBtn, submitting && { opacity: 0.6 }]}
                    onPress={handleSubmit}
                    disabled={submitting}
                    activeOpacity={0.8}
                  >
                    {submitting
                      ? <ActivityIndicator color="#fff" />
                      : <Text style={resStyles.submitText}>Καταχώρηση Κράτησης</Text>
                    }
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const resStyles = StyleSheet.create({
  overlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  sheetHeader: {
    alignItems: 'center',
    paddingTop: 14, paddingHorizontal: 20, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#F0EBE0',
  },
  sheetHandle:     { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E0D9CC', marginBottom: 12 },
  sheetTitle:      { fontSize: 18, fontWeight: '800', color: COLORS.text, letterSpacing: 0.5 },
  closeBtn:        { position: 'absolute', right: 16, top: 14, padding: 6 },
  closeBtnText:    { fontSize: 18, color: COLORS.textMuted },
  body:            { padding: 20, gap: 6 },
  label:           { fontSize: 13, fontWeight: '600', color: COLORS.textMuted, marginTop: 12, marginBottom: 4 },
  req:             { color: '#C0392B' },
  input: {
    backgroundColor: '#F5F1E8',
    borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 11,
    fontSize: 14, color: COLORS.text,
    borderWidth: 1, borderColor: '#E0D9CC',
  },
  textarea:        { minHeight: 76, paddingTop: 11 },
  selectBtn: {
    backgroundColor: '#F5F1E8',
    borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 11,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderWidth: 1, borderColor: '#E0D9CC',
  },
  selectText:          { fontSize: 14, color: COLORS.text },
  dropOverlay:         { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  dropBox:             { backgroundColor: '#fff', borderRadius: 16, padding: 16, width: '80%' },
  dropTitle:           { fontSize: 15, fontWeight: '700', color: COLORS.text, textAlign: 'center', marginBottom: 12 },
  dropItem:            { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderRadius: 8, gap: 10 },
  dropItemActive:      { backgroundColor: '#F5F1E8' },
  dropDot:             { width: 10, height: 10, borderRadius: 5 },
  dropItemText:        { fontSize: 14, color: COLORS.text },
  dropItemTextActive:  { fontWeight: '700', color: COLORS.accent },
  submitBtn: {
    marginTop: 20,
    backgroundColor: COLORS.accent,
    borderRadius: 12, paddingVertical: 15, alignItems: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35, shadowRadius: 8, elevation: 5,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
});

// ─── TableScreen ─────────────────────────────────────────────────────────────

const TableScreen = () => {
  const navigation    = useNavigation();
  const connectionRef = useRef(null);

  const [tables,       setTables]       = useState([]);
  const [pages,        setPages]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [currentPage,  setCurrentPage]  = useState(0);
  const [resModalOpen, setResModalOpen] = useState(false);

  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

  const numColumns =
    screenWidth > 1200 ? 8 :
    screenWidth > 900  ? 6 :
    screenWidth > 700  ? 5 :
    screenWidth > 500  ? 4 : 3;

  const cardWidth    = Math.floor(screenWidth / numColumns);
  const cardHeight   = 140;
  const numRows      = Math.max(1, Math.floor((screenHeight - 160) / cardHeight));
  const itemsPerPage = numRows * numColumns;

  const buildPages = (data) => {
    setTables(data);
    setPages(chunkArray(data, itemsPerPage));
  };

const fetchTables = useCallback(async () => {
  try {
    const res = await fetch(`${BASE_URL}/orderservice/Tables`);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();

    const formatted = data.map((t) => ({
      id: String(t.tableid),
      image: images[0],
      status: Number(t.status),
    }));

    setTables(formatted);
    setPages(chunkArray(formatted, itemsPerPage));
    setLoading(false);

  } catch (e) {
    console.error('Error fetching tables:', e);
    setLoading(false);
  }
}, [itemsPerPage]);

useFocusEffect(
  useCallback(() => {
    console.log('🔄 Returned to Tables -> refresh');

    fetchTables();
  }, [fetchTables])
);


useEffect(() => {
  let isMounted = true;

  const init = async () => {
    await fetchTables();

    const connection = new HubConnectionBuilder()
      .withUrl(SIGNALR_URL)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Debug)
      .build();

    connection.on('TableStatusChanged', (id, status) => {
      console.log('📡 TableStatusChanged:', id, status);
      setTables((prev) => {
        const updated = prev.map((t) =>
          t.id === String(id) ? { ...t, status: Number(status) } : t
        );
        setPages(chunkArray(updated, itemsPerPage));
        return updated;
      });
    });

    connection.on('ReceiveOrderNewTable', () => {
      console.log('📡 ReceiveOrderNewTable');
      fetchTables();
    });

    connection.on('ReceiveOrdersDeleteOrder', () => {
      console.log('📡 ReceiveOrdersDeleteOrder');
      fetchTables();
    });

    connection.onreconnecting((error) => console.log('🔄 SignalR reconnecting', error));
    connection.onreconnected((connectionId) => console.log('✅ SignalR reconnected:', connectionId));
    connection.onclose((error) => console.log('❌ SignalR closed:', error));

    try {
      console.log('🔌 Connecting to:', SIGNALR_URL);
      await connection.start();
      console.log('✅ SignalR CONNECTED');

      await connection.invoke('JoinCompanyGroup', String(globalCompanyID));
      console.log('✅ Joined company group:', String(globalCompanyID));

      if (isMounted) connectionRef.current = connection;
    } catch (error) {
      console.error('❌ SIGNALR ERROR:', error);
    }
  };

  init();

  return () => {
    isMounted = false;
    connectionRef.current?.stop().catch(() => {});
  };
}, [itemsPerPage]);
  const renderTable = (item) => {
    const color = getStatusColor(item.status);
    return (
      <TouchableOpacity
        key={item.id}
        style={[styles.tableCard, { width: cardWidth, height: cardHeight }]}
        activeOpacity={0.75}
        onPress={() => {
          setGloabalTableid(item.id);
          navigation.navigate('OrderInfo', { tableNumber: item.id });
        }}
      >
        <View style={[styles.colorStrip, { backgroundColor: color }]} />
        <Image source={item.image} style={styles.tableImage} />
        <Text style={styles.tableNumber}>{item.id}</Text>
        <View style={[styles.statusDot, { backgroundColor: color }]} />
      </TouchableOpacity>
    );
  };

  const renderPage = ({ item }) => (
    <View style={{ width: screenWidth, flex: 1 }}>
      <View style={styles.grid}>{item.map(renderTable)}</View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor={COLORS.bg} />
        <ActivityIndicator size="large" color={COLORS.accent} />
        <Text style={styles.loadingText}>Φόρτωση τραπεζιών...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.accent} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.75}
          onPress={() => navigation.navigate('Home')}
        >
          <BackIcon />
          <Text style={styles.backText}>Πίσω</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>ΤΡΑΠΕΖΙΑ</Text>

        <View style={styles.pageDotsWrapper}>
          {pages.map((_, i) => (
            <View key={i} style={[styles.pageDot, i === currentPage && styles.pageDotActive]} />
          ))}
        </View>
      </View>

      {/* TABLE GRID */}
      <FlatList
        data={pages}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderPage}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
          setCurrentPage(idx);
        }}
        style={{ flex: 1 }}
      />

      {/* LEGEND */}
      <View style={styles.legend}>
        {[
          { color: COLORS.empty,    label: 'Κενό' },
          { color: COLORS.occupied, label: 'Κατειλημμένο' },
          { color: COLORS.reserved, label: 'Κρατημένο' },
        ].map(({ color, label }) => (
          <View key={label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: color }]} />
            <Text style={styles.legendText}>{label}</Text>
          </View>
        ))}
      </View>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => setResModalOpen(true)}
      >
        <Text style={styles.fabIcon}>+</Text>
        <Text style={styles.fabLabel}>Κράτηση</Text>
      </TouchableOpacity>

      {/* RESERVATION MODAL */}
      <ReservationModal
        visible={resModalOpen}
        onClose={() => setResModalOpen(false)}
        tables={tables}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: COLORS.bg },
  loadingContainer: { flex: 1, backgroundColor: COLORS.bg, justifyContent: 'center', alignItems: 'center', gap: 14 },
  loadingText:      { color: COLORS.textMuted, fontSize: 15, fontWeight: '500', marginTop: 6 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: Platform.OS === 'android' ? 14 : 10,
    paddingBottom: 12,
    backgroundColor: COLORS.accent,
  },
  backButton: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 5, paddingHorizontal: 10,
    borderRadius: 8, backgroundColor: 'rgba(0,0,0,0.15)', minWidth: 80,
  },
  backText:        { color: '#FFFFFF', fontSize: 14, fontWeight: '600' },
  headerTitle:     { color: '#FFFFFF', fontSize: 18, fontWeight: '800', letterSpacing: 4, flex: 1, textAlign: 'center' },
  pageDotsWrapper: { flexDirection: 'row', alignItems: 'center', gap: 5, minWidth: 80, justifyContent: 'flex-end' },
  pageDot:         { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.35)' },
  pageDotActive:   { backgroundColor: '#FFFFFF', width: 14 },

  grid:        { flexDirection: 'row', flexWrap: 'wrap' },
  tableCard: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.card,
    borderBottomWidth: 1, borderRightWidth: 1, borderColor: COLORS.border,
    overflow: 'hidden',
  },
  colorStrip:  { position: 'absolute', top: 0, left: 0, right: 0, height: 5 },
  tableImage:  { width: '65%', height: '58%', resizeMode: 'contain', tintColor: COLORS.accentLight, marginTop: 6 },
  tableNumber: { color: COLORS.text, fontSize: 18, fontWeight: '800', marginTop: 4, letterSpacing: 0.5 },
  statusDot: {
    position: 'absolute', top: 10, right: 10,
    width: 10, height: 10, borderRadius: 5,
    borderWidth: 1.5, borderColor: '#fff',
  },

  legend: {
    flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center',
    paddingVertical: 11, paddingHorizontal: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1, borderTopColor: COLORS.border,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  legendDot:  { width: 10, height: 10, borderRadius: 5 },
  legendText: { color: COLORS.textMuted, fontSize: 13, fontWeight: '500' },

  fab: {
    position: 'absolute',
    bottom: 72, right: 18,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.accent,
    borderRadius: 28,
    paddingVertical: 12, paddingHorizontal: 18,
    shadowColor: '#3D2E1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
  fabIcon:  { color: '#fff', fontSize: 22, fontWeight: '300', lineHeight: 24 },
  fabLabel: { color: '#fff', fontSize: 15, fontWeight: '700', letterSpacing: 0.5 },
});

export default TableScreen;