import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, StyleSheet } from 'react-native';
import { initializeApp } from 'firebase/app';
import { getFirestore, onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import Icon from 'react-native-vector-icons/FontAwesome';
import { doc, deleteDoc } from 'firebase/firestore';
const firebaseConfig = {
  apiKey: "AIzaSyCYiVYps34JN6oS3l93_JQWjCuAMXiG-48",
  authDomain: "inzynierka-90015.firebaseapp.com",
  projectId: "inzynierka-90015",
  storageBucket: "inzynierka-90015.appspot.com",
  messagingSenderId: "525006852034",
  appId: "1:525006852034:web:edad1ee71de528cf40d05b",
  measurementId: "G-41BG9GE6JL"
};
const getGlucoseLevelColor = (glucoseLevel) => {
  if (glucoseLevel < 70) {
    return '#B9Bfff';
  } else if (glucoseLevel < 130) {
    return '#67ba6a';
  } else if (glucoseLevel < 180) {
    return '#f7a446';
  } else {
    return '#f7a446';
  }
}
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
 
const LogScreen = () => {
  const [entries, setEntries] = useState([]);
  const deleteEntry = async (id) => {
    const entryRef = doc(db, 'entries', id);
    await deleteDoc(entryRef);
  };

  useEffect(() => {
    const entriesCollection = collection(db, 'entries');
    const q = query(entriesCollection, orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newEntries = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));

      setEntries(newEntries);
    });

    return () => unsubscribe(); // cleanup function
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View>
            <View style={styles.dateBar}>
              <Text style={styles.dateText}>{new Date(item.date.seconds * 1000).toLocaleDateString('pl-PL')}</Text>
              <Icon name="trash" size={30} color="#fff" onPress={() => deleteEntry(item.id)} />
            </View>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{item.timeOfDay}</Text>
              <View style={styles.entry}>
                <Icon name="clock-o" size={20} color="#000" />
                <Text style={styles.entryText}>Godzina: <Text style={styles.metric}>{item.time}</Text></Text>
              </View>
              {item.glucoseLevel && (
                <View style={styles.entry}>
                  <Icon name="tint" size={20} color="#000" />
                  <Text style={styles.entryText}>
                     Glukoza:  <Text style={{ ...styles.metric, color: getGlucoseLevelColor(item.glucoseLevel) }}>
                      {item.glucoseLevel} mg/dL
                    </Text>
                  </Text>
                </View>
              )}
              {item.insulin && (
                <View style={styles.entry}>
                  <Icon name="eyedropper" size={20} color="#000" />
                  <Text style={styles.entryText}>Insulina: <Text style={styles.metric}>{item.insulin} IU</Text></Text>
                </View>
              )}
              {item.carbohydrates && (
                <View style={styles.entry}>
                  <Icon name="cube" size={20} color="#000" />
                  <Text style={styles.entryText}>Węglowodany: <Text style={styles.metric}>{item.carbohydrates} g</Text></Text>
                </View>
              )}
             {item.activity && (
                <View style={styles.entry}>
                  <Icon name="bicycle" size={20} color="#000" />
                  <Text style={styles.entryText}>Aktywność: <Text style={styles.metric}>{item.activity } minut</Text></Text>
                </View>
              )}
              {item.wieght && (
                <View style={styles.entry}>
                  <Icon name="balance-scale" size={20} color="#000" />
                  <Text style={styles.entryText}>Masa Ciała: <Text style={styles.metric}>{item.wieght} kg</Text></Text>
                </View>
              )}
              {item.systolicPressure && (
                <View style={styles.entry}>
                  <Icon name="heartbeat" size={20} color="#000" />
                  <Text style={styles.entryText}>Ciśnienie Skurczowe: <Text style={styles.metric}>{item.systolicPressure} mmHg</Text></Text>
                </View>
              )}
              {item.diastolicPressure && (
                <View style={styles.entry}>
                  <Icon name="heartbeat" size={20} color="#000" />
                  <Text style={styles.entryText}>Ciśnienie Rozskurczowe: <Text style={styles.metric}>{item.diastolicPressure} mmHg</Text></Text>
                </View>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f2f2f2',
  },
  dateBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#25a3c2',
    alignItems: 'center',
    borderRadius: 5,
    borderTopRightRadius: 4,
    borderBottomLeftRadius: 4,
  },
  dateText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    marginHorizontal: 20,
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
    color: 'grey',
    fontSize: 18,
    fontWeight: 'bold',
    
  },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  entryText: {
    marginLeft: 10,
    color: 'black',
    fontSize: 16,
  },
  metric: {
    color: 'grey',
  },
});

export default LogScreen;