import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, getDocs, collection, Timestamp, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { ScrollView } from 'react-native-gesture-handler';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const firebaseConfig = {
  apiKey: "AIzaSyCYiVYps34JN6oS3l93_JQWjCuAMXiG-48",
  authDomain: "inzynierka-90015.firebaseapp.com",
  projectId: "inzynierka-90015",
  storageBucket: "inzynierka-90015.appspot.com",
  messagingSenderId: "525006852034",
  appId: "1:525006852034:web:edad1ee71de528cf40d05b",
  measurementId: "G-41BG9GE6JL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


const MoreScreen = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [diabetesType, setDiabetesType] = useState('');
  const [insulinType, setInsulinType] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [showData, setShowData] = useState(false);
  const [medicineList, setMedicineList] = useState([]);
  const [entriesData, setEntriesData] = useState([]);
  const [newMedicineName, setNewMedicineName] = useState('');
  const [newMedicineAmount, setNewMedicineAmount] = useState('');

  useEffect(() => {
    getData();
    getDatas();
    getMedicine();
  }, []);

  const getData = async () => {
    try {
      const docRef = doc(db, "personal_information", "unique_user_id");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.name);
        setAge(data.age);
        setWeight(data.weight);
        setDiabetesType(data.diabetesType);
        setInsulinType(data.insulinType);
        setEmergencyContact(data.emergencyContact);
      } else {
        console.log("No such document! Creating...");
        await setDoc(docRef, {
          name: '',
          age: '',
          weight: '',
          diabetesType: '',
          insulinType: '',
          emergencyContact: ''
        });
      }
    } catch (e) {
      console.log(e);
    }
  };

  const saveData = async () => {
    try {
      await setDoc(doc(db, "personal_information", "unique_user_id"), {
        name: name,
        age: age,
        weight: weight,
        diabetesType: diabetesType,
        insulinType: insulinType,
        emergencyContact: emergencyContact
      });
      alert('Dane zapisane pomyślnie!');
      setShowData(true);
    } catch (error) {
      alert('Nie udało się zapisać danych do pamięci');
    }
  };

  const editData = () => {
    setShowData(false);
  };

  const medicineRef = collection(db, "medicine_cabinet");

  const addMedicine = async () => {
    const newMedicine = {
      name: newMedicineName,
      amount: newMedicineAmount,
    };

    await addDoc(medicineRef, newMedicine);

    // Odśwież listę po dodaniu
    getMedicine();
    alert('Lek został dodany pomyślnie!');

    // Wyczyść pola po dodaniu leku
    setNewMedicineName('');
    setNewMedicineAmount('');
  };

  const deleteMedicine = async (medicineId) => {
    const docRef = doc(db, "medicine_cabinet", medicineId);

    await deleteDoc(docRef);
    

    // Odśwież listę po usunięciu
    getMedicine();
  };

  const editMedicine = async (medicineId, newName, newAmount) => {
    const docRef = doc(db, "medicine_cabinet", medicineId);

    await updateDoc(docRef, {
      name: newName,
      amount: newAmount,
    });

    // Odśwież listę po edycji
    getMedicine();
  };

  const getMedicine = async () => {
    try {
      const medicineSnap = await getDocs(medicineRef);

      const medicines = medicineSnap.docs.map(doc => {
        let data = doc.data();
        data.id = doc.id; // Musimy dołączyć ID do późniejszego usunięcia lub edycji
        return data;
      });

      setMedicineList(medicines);
    } catch (e) {
      console.log('Error fetching medicine data: ', e);
    }
  };

  const getDatas = async () => {
    try {
      const entriesRef = collection(db, "entries");
      const entriesSnap = await getDocs(entriesRef);

      const entries = entriesSnap.docs.map(doc => {
        let data = doc.data();
        // Jeśli 'date' istnieje i jest obiektem Firestore Timestamp
        if (data.date && data.date instanceof Timestamp) { // Używamy zaimportowanego Timestamp
          data.date = data.date.toDate(); // Konwertujemy na obiekt JavaScript Date
        }
        return data;
      });

      setEntriesData(entries);
    } catch (e) {
      console.log('Error fetching entries data: ', e);
    }
  };

  const exportData = async () => {
    // Tworzenie nagłówka CSV z nazwami kolumn
    const csvContent = 'Aktywność,Węglowodany,Data,Ciśnienie rozkurczowe,Poziom glukozy,Insulina,Ciśnienie skurczowe,Czas,Pora dnia,Waga\n';

    // Dodawanie danych do CSV
    const csvData = entriesData.map(entry =>
      `${entry.activity},${entry.carbohydrates},${entry.date},${entry.diastolicPressure},${entry.glucoseLevel},${entry.insulin},${entry.systolicPressure},${entry.time},${entry.timeOfDay},${entry.weight}`
    ).join('\n');

    const filename = 'dane.csv';
    const path = FileSystem.documentDirectory + filename;

    try {
      await FileSystem.writeAsStringAsync(path, csvContent + csvData, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(path);
    } catch (error) {
      alert('Nie udało się wyeksportować danych do pliku CSV');
      console.log(error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {!showData &&
        <View style={styles.card}>
          <Text style={styles.cardTitle}>PODAJ SWOJE INFORMACJE:</Text>
          <Text style={styles.label}>Imię:</Text>
          <TextInput style={styles.input} onChangeText={setName} value={name} />
          <Text style={styles.label}>Wiek:</Text>
          <TextInput style={styles.input} onChangeText={setAge} value={age} keyboardType="numeric" />
          <Text style={styles.label}>Waga:</Text>
          <TextInput style={styles.input} onChangeText={setWeight} value={weight} keyboardType="numeric" />
          <Text style={styles.label}>Typy insuliny:</Text>
          <TextInput style={styles.input} onChangeText={setInsulinType} value={insulinType} />
          <Text style={styles.label}>Kontakt awaryjny:</Text>
          <TextInput style={styles.input} onChangeText={setEmergencyContact} value={emergencyContact} keyboardType="numeric" />
          <Text style={styles.label}>Typ cukrzycy:</Text>
          <Picker selectedValue={diabetesType} onValueChange={setDiabetesType} style={styles.pickerStyle}>
            <Picker.Item label="Typ 1" value="Typ 1" />
            <Picker.Item label="Typ 2" value="Typ 2" />
          </Picker>
          <TouchableOpacity style={styles.button} onPress={saveData}>
            <Text style={styles.buttonText}>ZATWIERDŹ</Text>
          </TouchableOpacity>
        </View>}

      {showData &&
        <View style={styles.card}>
          <Text style={styles.cardTitle}>INFORMACJE OSOBISTE:</Text>
          <Text style={styles.label}>Imię: {name}</Text>
          <Text style={styles.label}>Wiek: {age} lat</Text>
          <Text style={styles.label}>Waga: {weight} kg</Text>
          <Text style={styles.label}>Typy insuliny: {insulinType}</Text>
          <Text style={styles.labele}>Kontakt awaryjny: {emergencyContact}</Text>
          <Text style={styles.label}>Typ cukrzycy: {diabetesType}</Text>
          <TouchableOpacity style={styles.button} onPress={editData}>
            <Text style={styles.buttonText}>ZMIEŃ DANE</Text>
          </TouchableOpacity>
        </View>}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>APTECZKA</Text>
        {medicineList.map(medicine => (
          <View key={medicine.id} style={styles.medicineItem}>
            <TextInput
              style={styles.medicineName}
              placeholder="Nazwa leku"
              value={medicine.name}
              onChangeText={newName => editMedicine(medicine.id, newName, medicine.amount)}
              placeholderTextColor="#888"
            />
            <TextInput
              style={styles.medicineAmount}
              placeholder="Ilość"
              value={medicine.amount}
              onChangeText={newAmount => editMedicine(medicine.id, medicine.name, newAmount)}
              placeholderTextColor="#888"
            />
            <TouchableOpacity onPress={() => deleteMedicine(medicine.id)} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>Usuń</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.newMedicineContainer}>
          <TextInput
            style={styles.newMedicineInput}
            placeholder="Nazwa leku"
            onChangeText={setNewMedicineName}
            value={newMedicineName}
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.newMedicineInput}
            placeholder="Ilość"
            onChangeText={setNewMedicineAmount}
            value={newMedicineAmount}
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.addButton} onPress={addMedicine}>
            <Text style={styles.buttonText}>DODAJ</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.card}>
        <TouchableOpacity style={styles.button} onPress={exportData}>
          <Text style={styles.buttonText}>EKSPORTUJ DANE DO PLIKU .CSV</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    padding: 13,
  },
  label: {
    marginBottom: 5,
    color: 'grey',
    fontSize: 16,
  },
  labele: {
    marginBottom: 5,
    color: 'red',
    fontSize: 16,
  },
  card: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    position: 'relative',
  },
  cardTitle: {
    marginBottom: 10,
    color: '#25a3c2',
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    height: 40,
    borderColor: '#25a3c2',
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 5,
    paddingLeft: 10,
  },
  pickerStyle: {
    height: '28%',
  },
  button: {
    backgroundColor: '#25a3c2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  medicineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  medicineAmount: {
    fontSize: 16,
    flex: 1,
  },
  deleteButton: {
    backgroundColor: '#ff4040',
    padding: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
  },
  newMedicineContainer: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  newMedicineInput: {
    flex: 1,
    height: 40,
    borderColor: '#25a3c2',
    borderWidth: 1,
    borderRadius: 5,
    paddingLeft: 10,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#25a3c2',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
});

export default MoreScreen;