import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import InlineDropdown from "./Components/InlineDropdown";

import {
  BASE_URL,
  globalCompanyID,
} from '../Staff/globalState';

const ProductForm = ({ route, navigation }) => {

  const { isNew, product } = route.params || { isNew: true };

  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(false);

   console.log(JSON.stringify(route.params, null, 2));
  // ---------- HELPERS ----------
  const getTypeFromProduct = (p) => {

    if (route.params?.type) {
      return route.params.type.toUpperCase();
    }

    if (p?.type) {
      return p.type.toUpperCase();
    }

    return 'FOOD';
  };

  // ---------- REMOVE DUPLICATES ----------
  const deduplicateRecommendations = (recs) => {

    if (!recs || recs.length === 0) {
      return [];
    }

    const seen = new Set();

    return recs.filter((item) => {

      const key = item.ItemRecommendationsId || item.id;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);

      return true;
    });
  };

  // ---------- STATE ----------
  const [formData, setFormData] = useState({

    itemId:
      product?.ItemId ||
      product?.itemid ||
      product?.Id ||
      product?.id ||
      '',

    name:
      product?.Name ||
      product?.name ||
      '',

    category:
      product?.CategoryId
        ? String(product.CategoryId)
        : (product?.categoryid
            ? String(product.categoryid)
            : ''),

    type: getTypeFromProduct(product),

    description:
      product?.ItemDescription ||
      product?.itemdescription ||
      '',

    price: String(product?.Price || product?.price || ''),

    notes:
      product?.Notes ||
      product?.notes ||
      '',

    value: String(product?.Value || product?.value || ''),

    recommendedSales: deduplicateRecommendations(
      product?.Recommendations ||
      product?.recommendations ||
      []
    ),
  });

  // ---------- LOAD CATEGORIES ----------
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {

    try {

      const response = await fetch(
        `${BASE_URL}/orderservice/GetCategories?companyid=${globalCompanyID}`
      );

      const data = await response.json();

      setCategories(data || []);

    } catch (error) {

      console.log('Error loading categories:', error);

    }
  };

  // ---------- FILTERED CATEGORIES ----------
  const typeId =
    formData.type === 'FOOD'
      ? '1'
      : '2';

  const filteredCategories =
    (categories || []).filter(
      (c) =>
        String(c.typeid) === String(typeId)
    );

  // ---------- INPUT ----------
  const handleInputChange = (field, value) => {

    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleTypeChange = (newType) => {

    handleInputChange('type', newType);

    handleInputChange('category', '');
  };

  // ---------- MODAL ----------
  const openEditModal = (item) => {

    setEditingItem({ ...item });

    setModalVisible(true);
  };

  const saveRecommendation = () => {

    if (
      !editingItem ||
      !editingItem.RecommendationDescription?.trim()
    ) {
      Alert.alert(
        'Σφάλμα',
        'Το όνομα είναι υποχρεωτικό'
      );

      return;
    }

    setFormData((prev) => {

      const exists =
        prev.recommendedSales.some(
          (r) =>
            (r.ItemRecommendationsId || r.id) ===
            (editingItem.ItemRecommendationsId || editingItem.id)
        );

      let updated;

      if (exists) {

        updated =
          prev.recommendedSales.map((r) =>
            (r.ItemRecommendationsId || r.id) ===
            (editingItem.ItemRecommendationsId || editingItem.id)
              ? editingItem
              : r
          );

      } else {

        updated = [
          ...prev.recommendedSales,
          {
            ...editingItem,
            ItemRecommendationsId:
              editingItem.ItemRecommendationsId ||
              `REC_${Date.now()}`,
          },
        ];
      }

      return {
        ...prev,
        recommendedSales: updated,
      };
    });

    setModalVisible(false);
  };

  // ---------- DELETE RECOMMENDATION ----------
  const deleteRecommendation = (id) => {

    setFormData((prev) => ({
      ...prev,
      recommendedSales:
        prev.recommendedSales.filter(
          (r) =>
            (r.ItemRecommendationsId || r.id) !== id
        ),
    }));
  };

  // ---------- SAVE ----------
  const handleSave = async () => {

    if (!formData.name.trim()) {

      Alert.alert(
        'Σφάλμα',
        'Το όνομα είναι υποχρεωτικό'
      );

      return;
    }

    if (!formData.category) {

      Alert.alert(
        'Σφάλμα',
        'Επιλέξτε κατηγορία'
      );

      return;
    }

    if (!formData.price.trim()) {

      Alert.alert(
        'Σφάλμα',
        'Η τιμή είναι υποχρεωτική'
      );

      return;
    }

    const payload = {

      itemId:
        formData.itemId &&
        formData.itemId.trim()
          ? formData.itemId
          : null,

      name: formData.name.trim(),

      category: String(formData.category),

      type: formData.type,

      description:
        formData.description.trim(),

      price:
        parseFloat(
          formData.price.replace(',', '.')
        ) || 0,

      notes:
        formData.notes.trim(),

      value:
        parseFloat(
          formData.value.replace(',', '.')
        ) || 0,

      companyId:
        String(globalCompanyID),

      recommendedSales:
        formData.recommendedSales.map((item) => ({

          categoryId:
            item.categoryId ||
            formData.category,

          companyId:
            String(globalCompanyID),

          itemId:
            item.itemId || '',

          itemRecommendationsId:
            item.ItemRecommendationsId ||
            item.id ||
            '',

          price:
            parseFloat(item.price) || 0,

          recommendationDescription:
            item.RecommendationDescription ||
            item.name ||
            '',
        })),
    };

    console.log(
      'SENDING:',
      JSON.stringify(payload, null, 2)
    );

    setLoading(true);

    try {

      const response = await fetch(
        `${BASE_URL}/ItemManagement/upsert`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (response.ok && result.success) {

        Alert.alert(
          'Επιτυχία',

          isNew
            ? 'Το προϊόν δημιουργήθηκε'
            : 'Το προϊόν ενημερώθηκε',

          [
            {
              text: 'OK',

              onPress: () =>
                navigation.navigate(
                  'ProductListScreen',
                  {
                    refresh: Date.now(),
                  }
                ),
            },
          ]
        );

      } else {

        Alert.alert(
          'Σφάλμα',
          result.message ||
          'Κάτι πήγε στραβά'
        );
      }

    } catch (error) {

      console.log(error);

      Alert.alert(
        'Σφάλμα',
        'Αποτυχία σύνδεσης'
      );

    } finally {

      setLoading(false);

    }
  };

  // ---------- DELETE ----------
  const handleDelete = async () => {

    Alert.alert(
      'Διαγραφή',
      'Θέλετε διαγραφή προϊόντος;',
      [
        {
          text: 'Ακύρωση',
          style: 'cancel',
        },

        {
          text: 'Διαγραφή',
          style: 'destructive',

          onPress: async () => {

            setLoading(true);

            try {

              const response =
                await fetch(
                  `${BASE_URL}/ItemManagement/delete/${formData.itemId}`,
                  {
                    method: 'DELETE',
                  }
                );

              const result =
                await response.json();

              if (
                response.ok &&
                result.success
              ) {

                Alert.alert(
                  'Επιτυχία',
                  'Το προϊόν διαγράφηκε',
                  [
                    {
                      text: 'OK',

                      onPress: () =>
                        navigation.navigate(
                          'ProductListScreen',
                          {
                            refresh: Date.now(),
                          }
                        ),
                    },
                  ]
                );

              } else {

                Alert.alert(
                  'Σφάλμα',
                  result.message
                );
              }

            } catch (error) {

              console.log(error);

            } finally {

              setLoading(false);

            }
          },
        },
      ]
    );
  };

  return (

    <>

      <ScrollView style={styles.container}>

        <View style={styles.content}>

          {/* HEADER */}
          <View style={styles.headerContainer}>

            <TouchableOpacity
              onPress={() => navigation.goBack()}
            >
              <Ionicons
                name="arrow-back"
                size={24}
                color="#5C5C5C"
              />
            </TouchableOpacity>

            <Text style={styles.headerTitle}>
              {isNew
                ? 'Νέο Προϊόν'
                : 'Επεξεργασία Προϊόντος'}
            </Text>

            <View style={{ width: 24 }} />

          </View>

          {/* NAME */}
          <View style={styles.fieldContainer}>

            <Text style={styles.label}>
              Όνομα
            </Text>

            <TextInput
              style={styles.textInput}
              placeholder="Όνομα προϊόντος"
              placeholderTextColor="#C9B8A3"
              value={formData.name}
              onChangeText={(v) =>
                handleInputChange('name', v)
              }
            />

          </View>

          {/* TYPE */}
          <View style={styles.fieldContainer}>

            <Text style={styles.label}>
              Είδος
            </Text>

            <InlineDropdown
              label="ΕΙΔΟΣ"
              data={[
                {
                  id: 'FOOD',
                  name: 'ΦΑΓΗΤΟ',
                },
                {
                  id: 'DRINK',
                  name: 'ΠΟΤΟ',
                },
              ]}
              value={formData.type}
              onSelect={handleTypeChange}
              labelKey="name"
              valueKey="id"
            />

          </View>

          {/* CATEGORY */}
          <View style={styles.fieldContainer}>

            <Text style={styles.label}>
              Κατηγορία
            </Text>

            <InlineDropdown
              label="ΚΑΤΗΓΟΡΙΑ"
              data={filteredCategories}
              value={formData.category}
              onSelect={(v) =>
                handleInputChange(
                  'category',
                  v
                )
              }
              labelKey="categoryname"
              valueKey="categoryid"
            />

          </View>

          {/* DESCRIPTION */}
          <View style={styles.fieldContainer}>

            <Text style={styles.label}>
              Περιγραφή
            </Text>

            <TextInput
              style={[
                styles.textInput,
                styles.multilineInput,
              ]}
              multiline
              numberOfLines={3}
              value={formData.description}
              onChangeText={(v) =>
                handleInputChange(
                  'description',
                  v
                )
              }
            />

          </View>

          {/* PRICE + VALUE */}
          <View style={styles.priceRow}>

            {/* PRICE */}
            <View style={styles.priceCard}>

              <Text style={styles.priceLabel}>
                Τιμή Πώλησης
              </Text>

              <View style={styles.priceInputWrapper}>

                <Text style={styles.euroSymbol}>
                  €
                </Text>

                <TextInput
                  style={styles.modernPriceInput}
                  placeholder="0.00"
                  placeholderTextColor="#B8A376"
                  value={formData.price}
                  onChangeText={(v) => {

                    const clean =
                      v.replace(',', '.');

                    if (
                      /^\d*\.?\d{0,2}$/.test(clean)
                    ) {

                      handleInputChange(
                        'price',
                        clean
                      );
                    }
                  }}
                  keyboardType="decimal-pad"
                />

              </View>

            </View>

            {/* VALUE */}
            <View style={styles.priceCard}>

              <Text style={styles.priceLabel}>
                Αξία
              </Text>

              <View style={styles.priceInputWrapper}>

                <Text style={styles.euroSymbol}>
                  €
                </Text>

                <TextInput
                  style={styles.modernPriceInput}
                  placeholder="0.00"
                  placeholderTextColor="#B8A376"
                  value={formData.value}
                  onChangeText={(v) => {

                    const clean =
                      v.replace(',', '.');

                    if (
                      /^\d*\.?\d{0,2}$/.test(clean)
                    ) {

                      handleInputChange(
                        'value',
                        clean
                      );
                    }
                  }}
                  keyboardType="decimal-pad"
                />

              </View>

            </View>

          </View>

          {/* RECOMMENDATIONS */}
          <View style={styles.fieldContainer}>

            <View style={styles.recHeader}>

              <Text style={styles.label}>
                Προτεινόμενες Επιλογές
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setEditingItem({});
                  setModalVisible(true);
                }}
              >
                <Ionicons
                  name="add-circle"
                  size={30}
                  color="#A3844D"
                />
              </TouchableOpacity>

            </View>

            <View style={styles.salesContainer}>

              {formData.recommendedSales.map(
                (item, index) => (

                  <View
                    key={`${item.ItemRecommendationsId || item.id}_${index}`}
                    style={styles.saleItem}
                  >

                    <Text style={styles.saleName}>
                      {item.RecommendationDescription || item.name}
                    </Text>

                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 10,
                      }}
                    >

                      <TouchableOpacity
                        onPress={() =>
                          openEditModal(item)
                        }
                      >
                        <Ionicons
                          name="pencil"
                          size={20}
                          color="#5C5C5C"
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() =>
                          deleteRecommendation(
                            item.ItemRecommendationsId ||
                            item.id
                          )
                        }
                      >
                        <Ionicons
                          name="trash"
                          size={20}
                          color="#B84C3C"
                        />
                      </TouchableOpacity>

                    </View>

                  </View>
                )
              )}

            </View>

          </View>

          <View style={{ height: 100 }} />

        </View>

      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footerButtons}>

        <TouchableOpacity
          style={[
            styles.footerButton,
            styles.cancelButton,
          ]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={20}
            color="#fff"
          />
        </TouchableOpacity>

        {!isNew && (
          <TouchableOpacity
            style={[
              styles.footerButton,
              styles.deleteButton,
            ]}
            onPress={handleDelete}
          >
            <Ionicons
              name="trash"
              size={20}
              color="#fff"
            />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.footerButton,
            styles.saveButton,
          ]}
          onPress={handleSave}
        >

          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons
              name="checkmark"
              size={24}
              color="#fff"
            />
          )}

        </TouchableOpacity>

      </View>

      {/* MODAL */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
      >

        <View style={styles.modalOverlay}>

          <View style={styles.modalContainer}>

            <Text style={styles.modalTitle}>
              Προτεινόμενη Επιλογή
            </Text>

            <TextInput
              style={styles.textInput}
              placeholder="Όνομα"
              value={
                editingItem?.RecommendationDescription ||
                ''
              }
              onChangeText={(v) =>
                setEditingItem((prev) => ({
                  ...prev,
                  RecommendationDescription: v,
                }))
              }
            />

            <TextInput
              style={styles.textInput}
              placeholder="Τιμή"
              keyboardType="decimal-pad"
              value={String(
  editingItem?.price ??
  editingItem?.Price ??
  ''
)}
              onChangeText={(value) =>
                setEditingItem((prev) => ({
                  ...prev,
                  price: value, // κρατά string όσο γράφεις
                }))
              }
            />

            <View style={styles.modalButtons}>

              <TouchableOpacity
                style={styles.cancelModalButton}
                onPress={() =>
                  setModalVisible(false)
                }
              >
                <Text style={styles.modalButtonText}>
                  Ακύρωση
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveModalButton}
                onPress={saveRecommendation}
              >
                <Text style={styles.modalButtonText}>
                  Αποθήκευση
                </Text>
              </TouchableOpacity>

            </View>

          </View>

        </View>

      </Modal>

    </>
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#E8DCC4',
  },

  content: {
    padding: 20,
    paddingBottom: 100,
  },

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5C5C5C',
  },

  fieldContainer: {
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B7D6B',
    marginBottom: 8,
  },

  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0D9CC',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#5C5C5C',
  },

  multilineInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },

  priceRow: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 24,
  },

  priceCard: {
    flex: 1,
    backgroundColor: '#F5F1E8',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E0D9CC',

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.08,
    shadowRadius: 4,

    elevation: 3,
  },

  priceLabel: {
    fontSize: 13,
    color: '#8B7D6B',
    fontWeight: '700',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  priceInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#E0D9CC',
  },

  euroSymbol: {
    fontSize: 20,
    color: '#A3844D',
    fontWeight: 'bold',
    marginRight: 8,
  },

  modernPriceInput: {
    flex: 1,
    height: 52,
    fontSize: 22,
    fontWeight: '600',
    color: '#5C5C5C',
  },

  recHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  salesContainer: {
    backgroundColor: '#F5F1E8',
    borderRadius: 12,
    padding: 12,
  },

  saleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0D9CC',
  },

  saleName: {
    flex: 1,
    fontSize: 14,
    color: '#5C5C5C',
  },

  footerButtons: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    flexDirection: 'row',
    gap: 14,
  },

  footerButton: {
    flex: 1,
    height: 55,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cancelButton: {
    backgroundColor: '#8B7D6B',
  },

  deleteButton: {
    backgroundColor: '#B84C3C',
  },

  saveButton: {
    backgroundColor: '#A3844D',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },

  modalContainer: {
    backgroundColor: '#E8DCC4',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5C5C5C',
    marginBottom: 20,
  },

  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 20,
  },

  cancelModalButton: {
    backgroundColor: '#8B7D6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },

  saveModalButton: {
    backgroundColor: '#A3844D',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },

  modalButtonText: {
    color: '#fff',
    fontWeight: '700',
  },

});

export default ProductForm;