import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet,ScrollView } from "react-native";
import {gloabalTableid,setGloabalTableid,BASE_URL,globalUsername,globalUserID,globalPersons, setGlobalPersons, globalCompanyID} from '../Staff/globalState';
import { Picker } from "@react-native-picker/picker";
import InlineDropdown from "./Components/InlineDropdown";
import DatePickerField from "./Components/DatePickerField";

export default function AccountSettingsScreen({ route, navigation }) {
  const { mode, userId } = route.params;

  const [user, setUser] = useState({});
  const [roles, setRoles] = useState([]);
  const [positions, setPositions] = useState([]);
const [showPassword, setShowPassword] = useState(false);

useEffect(() => {
  loadDropdowns();

  if (mode === 0 && userId) {
    loadUser(userId);
  }
}, [mode, userId]);


  const loadData = async () => {
    try {
      const [userRes, rolesRes, posRes] = await Promise.all([
        fetch(`${BASE_URL}/orderservice/GetUserInfo?companyid=${globalCompanyID}&userid=${globalUserID}`),
        fetch(`${BASE_URL}/orderservice/GetRoles`),
        fetch(`${BASE_URL}/orderservice/GetPosition`)
      ]);

      const userJson = await userRes.json();
      const rolesJson = await rolesRes.json();
      const posJson = await posRes.json();

            const u = json[0];
      setUser({
        ...u,
        birthday: normalizeToISO(u.birthday),
      });
      setRoles(rolesJson);
      setPositions(posJson);
    } catch (e) {
      console.log(e);
    }
  };

const normalizeToISO = (value) => {
  if (!value) return "";

  let cleaned = value;
 
  cleaned = cleaned.split(" ")[0];

  if (cleaned.includes("/")) {
    const [d, m, y] = cleaned.split("/").map(Number);

    if (!d || !m || !y) return "";

    return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  }

  return cleaned;
};

const loadUser = async (id) => {
  try {
    const res = await fetch(
      `${BASE_URL}/orderservice/GetUserInfo?companyid=${globalCompanyID}&userid=${id}`
    );

    const json = await res.json();
    const u = json[0];

    setUser({
      ...u,
      birthday: normalizeToISO(u.birthday),
    });

           console.log(json);
  } catch (e) {
    console.log(e);
  }
};

const loadDropdowns = async () => {
  try {
    const [rolesRes, posRes] = await Promise.all([
      fetch(`${BASE_URL}/orderservice/GetRoles`),
      fetch(`${BASE_URL}/orderservice/GetPosition`)
    ]);

    const rolesJson = await rolesRes.json();
    const posJson = await posRes.json();

    setRoles(rolesJson);
    setPositions(posJson);
  } catch (e) {
    console.log(e);
  }
};

  const updateField = (key, value) => {
    setUser(prev => ({ ...prev, [key]: value }));
  };
  
const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (isNaN(date.getTime())) return "";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

const parseDMY = (value) => {
  if (!value) return null;

  const parts = value.split("/");
  if (parts.length !== 3) return null;

  const [d, m, y] = parts.map(Number);

  if (isNaN(d) || isNaN(m) || isNaN(y)) return null;

  return { day: d, month: m, year: y };
};

const toBackendDate = (iso) => {
  if (!iso) return "";

  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}/${month}/${year}`;
};

const handleSave = async () => {
  try {
    const url =
      mode === 1
        ? `${BASE_URL}/orderservice/PostUserInfo/${globalUserID}`
        : `${BASE_URL}/orderservice/PostUserInfo/${globalCompanyID}/${globalUserID}`;

    const method = mode === 0 ? "PUT" : "POST";


const payload = {
  id: mode === 1 ? "" : String(user?.id ?? ""),
  username: user?.username ?? "",
  password: user?.password ?? "",
  userrole: user?.userrole ?? 0,
  active: user?.active ?? 0,
  status: user?.status ?? 0,
  companyid: Number(globalCompanyID),
  substore: user?.substore ?? 0,
  positionid: user?.positionid ?? 0,
  firstname: user?.firstname ?? "",
  lastname: user?.lastname ?? "",
  birthday: user?.birthday ? toBackendDate(user.birthday) : "",
  gender: user?.gender ?? 0,
  phone: user?.phone ?? "",
};

const res = await fetch(url, {
  method,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(payload),
});
    const text = await res.text();

    if (text === "true") {
      alert("Αποθηκεύτηκε επιτυχώς");
      navigation.goBack();
    } else {
        console.log(url);
        console.log("HMEROMHNIAAA:"+payload.birthday);
        console.log( JSON.stringify(payload));
      alert("Σφάλμα αποθήκευσης");
      console.log(text);
    }
  } catch (err) {
    console.log(err);
    alert("Σφάλμα δικτύου");
  }
};


  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        {mode === 0 ? "ΕΠΕΞΕΡΓΑΣΙΑ ΧΡΗΣΤΗ" : "ΝΕΟΣ ΧΡΗΣΤΗΣ"}
      </Text>

      {/* ID */}
      <View style={styles.row}>
        <Text style={styles.label}>ID:</Text>
        <TextInput
          value={user?.id?.toString()}
          style={styles.input}
          editable={false}
        />
      </View>

      {/* ROLE */}
      <View style={styles.row}>
        <Text style={styles.label}>ΡΟΛΟΣ:</Text>
        <View style={styles.pickerBox}>
                <InlineDropdown
                label="ΡΟΛΟΣ"
                data={roles}
                value={user.userrole}
                onSelect={(v) => updateField("userrole", v)}
                labelKey="role_name"
                valueKey="id"
                />
        </View>
      </View>

      {/* POSITION */}
<View style={styles.row}>
  <Text style={styles.label}>ΘΕΣΗ:</Text>

  <View style={styles.pickerBox}>
    <InlineDropdown
      label="Επιλογή θέσης"
      data={positions} 
      value={user?.positionid}
      onSelect={(v) => updateField("positionid", v)} 
      labelKey="potitionname"
      valueKey="positionid"
    />
  </View>
</View>

      {/* USERNAME */}
      <View style={styles.row}>
        <Text style={styles.label}>USERNAME:</Text>
        <TextInput
          value={user?.username}
          style={styles.input}
          onChangeText={(t) => updateField("username", t)}
        />
      </View>

            {/* PASSWORD */}
            <View style={styles.row}>
            <Text style={styles.label}>PASSWORD:</Text>
            <View style={styles.passwordBox}>
                <TextInput
                value={user?.password}
                style={styles.passwordInput}
                secureTextEntry={!showPassword}
                onChangeText={(t) => updateField("password", t)}
                />
                <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(prev => !prev)}
                >
                <Text style={styles.eyeIcon}>{showPassword ? "👁‍🗨" : "👁‍🗨" }</Text>
                </TouchableOpacity>
            </View>
            </View>

      {/* FIRSTNAME */}
      <View style={styles.row}>
        <Text style={styles.label}>ΟΝΟΜΑ:</Text>
        <TextInput
          value={user?.firstname}
          style={styles.input}
          onChangeText={(t) => updateField("firstname", t)}
        />
      </View>

      {/* LASTNAME */}
      <View style={styles.row}>
        <Text style={styles.label}>ΕΠΩΝΥΜΟ:</Text>
        <TextInput
          value={user?.lastname}
          style={styles.input}
          onChangeText={(t) => updateField("lastname", t)}
        />
      </View>

{/* BIRTHDAY */}
    <View style={styles.row}>
    <Text style={styles.label}>ΗΜ. ΓΕΝ:</Text>
    <DatePickerField
        value={user?.birthday}
        onChange={(date) => updateField("birthday", date)}
    />
            </View>

        {/* GENDER */}
        <View style={styles.row}>
        <Text style={styles.label}>ΦΥΛΟ:</Text>
        <View style={styles.pickerBox}>
            <InlineDropdown
            label="Επιλογή φύλου"
            data={[
                { id: 1, name: "Άνδρας" },
                { id: 2, name: "Γυναίκα" },
            ]}
            value={user?.gender}
            onSelect={(v) => updateField("gender", v)}
            labelKey="name"
            valueKey="id"
            />
        </View>
        </View>
      {/* PHONE */}
      <View style={styles.row}>
        <Text style={styles.label}>ΤΗΛΕΦΩΝΟ:</Text>
        <TextInput
          value={user?.phone}
          style={styles.input}
          onChangeText={(t) => updateField("phone", t)}
        />
      </View>

            <View style={styles.bottomBar}>

            <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.cancelText}>Άκυρο</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.saveButton, !user?.username && { opacity: 0.5 }]}
                onPress={handleSave}
                disabled={!user?.username}
            >
                <Text style={styles.saveText}>
                {mode === 0 ? "ΑΠΟΘΗΚΕΥΣΗ" : "ΔΗΜΙΟΥΡΓΙΑ"}
                </Text>
            </TouchableOpacity>

            </View>
    </View>

    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#e9e7da",
    padding: 15,
  },

  title: {
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 20,
    color: "#6b6b4a",
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 5,
  },

  label: {
    width: 100,
    fontWeight: "bold",
    color: "#444",
  },

  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  pickerBox: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 10,
  },

  backButton: {
    marginTop: 20,
    backgroundColor: "#a8874a",
    width: 50,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  backText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  passwordBox: {
  flex: 1,
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#fff",
  borderRadius: 10,
},

passwordInput: {
  flex: 1,
  paddingHorizontal: 10,
  paddingVertical: 8,
},

eyeButton: {
  paddingHorizontal: 10,
  paddingVertical: 8,
},

eyeIcon: {
  fontSize: 18,
},

buttonRow: {
  flexDirection: "row",
  marginTop: 20,
  gap: 10,
},

cancelButton: {
  flex: 1,
  backgroundColor: "#999",
  padding: 14,
  borderRadius: 10,
  alignItems: "center",
},

cancelText: {
  color: "#fff",
  fontWeight: "700",
},

saveButton: {
  flex: 1,
  backgroundColor: "#4CAF50",
  padding: 14,
  borderRadius: 10,
  alignItems: "center",
},

saveText: {
  color: "#fff",
  fontWeight: "700",
},
bottomBar: {
  flexDirection: "row",
  bottom: 0,
  left: 0,
  right: 0,
  padding: 15,
  backgroundColor: "#e9e7da",
  gap: 10,
  borderTopWidth: 1,
  borderTopColor: "#ddd",
},
});
