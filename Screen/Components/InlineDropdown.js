import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";

export default function InlineDropdown({
  label,
  data,
  value,
  onSelect,
  labelKey,
  valueKey,
}) {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const headerRef = useRef(null);

  const selected = data.find((x) => x[valueKey] === value);

  const ITEM_HEIGHT = 44;
  const MAX_VISIBLE = 5;
  const dropdownHeight = Math.min(data.length, MAX_VISIBLE) * ITEM_HEIGHT;
  const hasMore = data.length > MAX_VISIBLE;

  const openDropdown = () => {
    headerRef.current.measureInWindow((x, y, width, height) => {
      setDropdownPos({ top: y + height + 4, left: x, width });
      setOpen(true);
    });
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        ref={headerRef}
        style={styles.header}
        onPress={openDropdown}
        activeOpacity={0.8}
      >
        <Text style={styles.headerText}>
          {selected ? selected[labelKey] : label}
        </Text>
        <Text style={styles.arrow}>{open ? "▲" : "▼"}</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="none">
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.dropdown,
                  {
                    top: dropdownPos.top,
                    left: dropdownPos.left,
                    width: dropdownPos.width,
                  },
                ]}
              >
                {/* Scroll area */}
                <ScrollView
                  style={{ height: dropdownHeight }}
                  nestedScrollEnabled
                  bounces={false}
                  showsVerticalScrollIndicator={true}
                  persistentScrollbar={true}
                  keyboardShouldPersistTaps="handled"
                >
                  {data.map((item, index) => {
                    const isSelected = item[valueKey] === value;
                    return (
                      <TouchableOpacity
                        key={item[valueKey]}
                        style={[
                          styles.item,
                          { height: ITEM_HEIGHT },
                          index % 2 === 0 ? styles.itemEven : styles.itemOdd,
                          isSelected && styles.selectedItem,
                        ]}
                        onPress={() => {
                          onSelect(item[valueKey]);
                          setOpen(false);
                        }}
                      >
                        <Text style={styles.itemText}>{item[labelKey]}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView> 
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 5,
  },

  header: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  headerText: {
    fontSize: 14,
    color: "#222",
  },

  arrow: {
    fontSize: 12,
    color: "#666",
  },

  modalOverlay: {
    flex: 1,
  },

  dropdown: {
    position: "absolute",
    backgroundColor: "#fff",
    borderRadius: 10,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },

  item: {
    paddingHorizontal: 12,
    justifyContent: "center",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },

  itemEven: {
    backgroundColor: "#f5f5f5",
  },

  itemOdd: {
    backgroundColor: "#ececec",
  },

  selectedItem: {
    backgroundColor: "#d9e8ff",
  },

  itemText: {
    fontSize: 14,
    color: "#222",
  },

  moreHint: {
    paddingVertical: 5,
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderTopWidth: 1,
    borderColor: "#ddd",
  },

  moreHintText: {
    fontSize: 11,
    color: "#888",
  },
});