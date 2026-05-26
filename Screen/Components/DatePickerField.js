import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableWithoutFeedback,
} from "react-native";

const MONTHS = [
  "Ιανουάριος","Φεβρουάριος","Μάρτιος","Απρίλιος",
  "Μάιος","Ιούνιος","Ιούλιος","Αύγουστος",
  "Σεπτέμβριος","Οκτώβριος","Νοέμβριος","Δεκέμβριος",
];

const ITEM_H = 44;
const VISIBLE = 5;
const PAD = Math.floor(VISIBLE / 2);

function getDaysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

function Column({ items, selectedIndex, onSelect }) {
  const scrollRef = React.useRef(null);

  React.useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollTo({
        y: selectedIndex * ITEM_H,
        animated: false,
      });
    }, 50);
  }, []);

  const padded = [
    ...Array(PAD).fill(null),
    ...items,
    ...Array(PAD).fill(null),
  ];

  return (
    <View style={col.wrapper}>
      {/* highlight bar */}
      <View style={col.highlight} pointerEvents="none" />

      <ScrollView
        ref={scrollRef}
        style={{ height: ITEM_H * VISIBLE }}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_H}
        decelerationRate="fast"
        bounces={false}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
          onSelect(idx);
        }}
      >
        {padded.map((item, i) => {
          const realIdx = i - PAD;
          const isSelected = realIdx === selectedIndex;
          return (
            <TouchableOpacity
              key={i}
              style={[col.item, isSelected && col.selectedItem]}
              onPress={() => {
                onSelect(realIdx);
                scrollRef.current?.scrollTo({ y: realIdx * ITEM_H, animated: true });
              }}
            >
              <Text style={[col.itemText, isSelected && col.selectedText]}>
                {item !== null ? item : ""}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const col = StyleSheet.create({
  wrapper: {
    flex: 1,
    position: "relative",
  },
  highlight: {
    position: "absolute",
    top: ITEM_H * PAD,
    left: 4,
    right: 4,
    height: ITEM_H,
    backgroundColor: "#d9e8ff",
    borderRadius: 8,
    zIndex: 0,
  },
  item: {
    height: ITEM_H,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedItem: {},
  itemText: {
    fontSize: 14,
    color: "#aaa",
  },
  selectedText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a4a90",
  },
});

export default function DatePickerField({ value, onChange }) {
  const [open, setOpen] = useState(false);

  const today = new Date();

const parseValue = () => {
  if (!value || typeof value !== "string") return null;

  let cleaned = value;

  // κόψε ώρα αν υπάρχει
  if (cleaned.includes(" ")) {
    cleaned = cleaned.split(" ")[0];
  }

  // περίπτωση dd/MM/yyyy
  if (cleaned.includes("/")) {
    const [d, m, y] = cleaned.split("/").map(Number);

    if (!d || !m || !y) return null;

    return {
      day: d,
      month: m,
      year: y,
    };
  }

  // περίπτωση ISO yyyy-MM-dd
  if (cleaned.includes("-")) {
    const [y, m, d] = cleaned.split("-").map(Number);

    if (!d || !m || !y) return null;

    return {
      day: d,
      month: m,
      year: y,
    };
  }

  return null;
};

const formatDisplayDate = (iso) => {
  if (!iso) return "";

  const [y, m, d] = iso.split("-");

  if (!y || !m || !d) return "";

  return `${d}/${m}/${y}`;
};
const parsed = parseValue();

const day = parsed?.day;
const month = parsed?.month;
const year = parsed?.year;

const [selDay, setSelDay] = useState(day ? day - 1 : 0);
const [selMonth, setSelMonth] = useState(month ? month - 1 : 0);
const [selYear, setSelYear] = useState(0);

  const currentYear = today.getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => String(currentYear - i));

React.useEffect(() => {
  if (!parsed) return;

  setSelDay(parsed.day ? parsed.day - 1 : 0);
  setSelMonth(parsed.month ? parsed.month - 1 : 0);

  const idx = years.indexOf(String(parsed.year));
  setSelYear(idx >= 0 ? idx : 0);
}, [value]);
  const daysInMonth = getDaysInMonth(selMonth + 1, years[selYear]);
  const days = Array.from({ length: daysInMonth }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  const months = MONTHS.map((m, i) => m);

const confirm = () => {
  const d = String(selDay + 1).padStart(2, "0");
  const m = String(selMonth + 1).padStart(2, "0");
  const y = years[selYear];

  const iso = `${y}-${m}-${d}`; // YYYY-MM-DD
  onChange(iso);
  setOpen(false);
};

  return (
    <>
      <TouchableOpacity style={styles.dateButton} onPress={() => setOpen(true)}>
        <Text style={styles.dateText}>
 {value ? formatDisplayDate(value) : "ΗΗ/ΜΜ/ΕΕΕΕ"}
</Text>
        <Text style={styles.dateIcon}></Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modal}>

                <Text style={styles.modalTitle}>Επιλογή ημερομηνίας</Text>

                <View style={styles.columnsRow}>
                  {/* ΗΜΕΡΑ */}
                  <Column
                    items={days}
                    selectedIndex={Math.min(selDay, days.length - 1)}
                    onSelect={(i) => setSelDay(Math.max(0, Math.min(i, days.length - 1)))}
                  />
                  {/* ΜΗΝΑΣ */}
                  <Column
                    items={months}
                    selectedIndex={selMonth}
                    onSelect={(i) => setSelMonth(Math.max(0, Math.min(i, 11)))}
                  />
                  {/* ΧΡΟΝΙΑ */}
                  <Column
                    items={years}
                    selectedIndex={selYear}
                    onSelect={(i) => setSelYear(Math.max(0, Math.min(i, years.length - 1)))}
                  />
                </View>

                <View style={styles.buttons}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setOpen(false)}>
                    <Text style={styles.cancelText}>Ακύρωση</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.confirmBtn} onPress={confirm}>
                    <Text style={styles.confirmText}>Επιβεβαίωση</Text>
                  </TouchableOpacity>
                </View>

              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  dateButton: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dateText: {
    fontSize: 14,
    color: "#222",
  },
  dateIcon: {
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "88%",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#444",
    textAlign: "center",
    marginBottom: 16,
  },
  columnsRow: {
    flexDirection: "row",
    gap: 8,
  },
  buttons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  cancelBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
  },
  cancelText: {
    color: "#666",
    fontWeight: "600",
  },
  confirmBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#a8874a",
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontWeight: "700",
  },
});