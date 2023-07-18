import React, { useEffect, useState } from 'react';
import { ScrollView, Dimensions, Text, View, StyleSheet } from 'react-native';
import { BarChart, LineChart, PieChart} from 'react-native-chart-kit';
import { collection, onSnapshot } from "firebase/firestore";
import { getFirestore } from "firebase/firestore";

const screenWidth = Dimensions.get("window").width;
//kolory wykresów
const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(25, 163, 194, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  propsForDots: {
    r: "6",
    strokeWidth: "2",
    stroke: "#ffa726"
  },
  decimalPlaces: 0,
};

//w bazie jest timestamp->na date
const formatDate = (date) => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}.${month}`;
};

const formatTime = (date) => {
  const hour = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hour}:${minutes}`;
};


const CustomAlert = ({ message }) => {
  return (
    <View style={styles.alertContainer}>
      <Text style={styles.alertText}>{message}</Text>
    </View>
  );
};

const GraphScreen = () => {
  const getPieChartLegend = () => {
    return pieData.map((data, index) => (
      <View key={index} style={styles.legendContainer}>
        <View style={[styles.legendIndicator, { backgroundColor: data.color }]} />
        <Text style={styles.legendLabel}>{getLegendLabel(index)}</Text>
      </View>
    ));
  };
//kolory glukozy zalezne od poziomu
  const getLegendLabel = (index) => {
    switch (index) {
      case 0:
        return "Niski";
      case 1:
        return "Normalny";
      case 2:
        return "Wysoki";
      default:
        return "";
    }
  };

  const [barData, setBarData] = useState({
    labels: ["Brak danych"],
    datasets: [
      {
        data: [0],
      },
    ],
  });

  const [newData, setNewData] = useState([]);
  const [data, setData] = useState({
    labels: ["Brak danych"],
    datasets: [{ data: [0] }],
    legend: ["Poziom glukozy"]
  });
  const [pieData, setPieData] = useState([]);

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  useEffect(() => {
    const db = getFirestore();
    const unsubscribe = onSnapshot(collection(db, "entries"), (snapshot) => {
      if (!snapshot.empty) {
        let localNewData = snapshot.docs.map((doc) => ({
          glucoseLevel: doc.data().glucoseLevel,
          date: doc.data().date.toDate(),
          insulin: parseFloat(doc.data().insulin),

        }));

        localNewData.sort((a, b) => a.date - b.date);

        setData({
          labels: localNewData.map((item) => formatDate(item.date)),
          datasets: [{ data: localNewData.map((item) => item.glucoseLevel) }],
        });

        // grupowanie wartosci razem z data
        let insulinData = localNewData.reduce((acc, current) => {
          let formattedDate = formatDate(current.date);
          if (!acc[formattedDate]) {
            acc[formattedDate] = {
              date: formattedDate,
              totalInsulin: current.insulin
            };
          } else {
            acc[formattedDate].totalInsulin += current.insulin;
          }
          return acc;
        }, {});

        let sortedInsulinData = Object.values(insulinData).sort((a, b) => new Date(a.date) - new Date(b.date));

        setBarData({
          labels: sortedInsulinData.map((item) => item.date),
          datasets: [{ data: sortedInsulinData.map((item) => (parseFloat(item.totalInsulin))) }],
        });
        

        // procenty
        let lowCount = 0;
        let normalCount = 0;
        let highCount = 0;
        localNewData.forEach((item) => {
          if (item.glucoseLevel < 70) {
            lowCount++;
          } else if (item.glucoseLevel >= 70 && item.glucoseLevel <= 180) {
            normalCount++;
          } else if (item.glucoseLevel > 180) {
            highCount++;
          }
        });

        const total = lowCount + normalCount + highCount;

        const pieChartData = [
          {
            name: "%",
            value: Math.round((lowCount / total) * 100),
            color: '#B9Bfff',
            legendFontColor: "#7F7F7F",
            legendFontSize: 15
          },
          {
            name: "%",
            value: Math.round((normalCount / total) * 100),
            color: '#67ba6a',
            legendFontColor: "#7F7F7F",
            legendFontSize: 15
          },
          {
            name: "%",
            value: Math.round((highCount / total) * 100),
            color: '#f7a446',
            legendFontColor: "#7F7F7F",
            legendFontSize: 15
          }
        ];

        setPieData(pieChartData);
        setNewData(localNewData);
      }
    });

    return () => unsubscribe();
  }, []);
  const handleDataPointClick = ({ value, index }) => {
    if (newData[index]) {
      const correspondingTime = formatTime(newData[index].date);
      const message = `Poziom glukozy: ${value}, Czas: ${correspondingTime}`;
      setAlertMessage(message);
    } else {
      setAlertMessage("Brak danych");
    }
    setShowAlert(true);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.chartContainer}>
        <View style={styles.alertContainer}>
          <Text style={styles.TitleText}>POZIOM GLUKOZY</Text>
        </View>
        <LineChart
          data={data}
          width={screenWidth - 70} 
          height={220}
          chartConfig={chartConfig}
          bezier
          withDashedLine
          segments={4}
          onDataPointClick={(dataObject) => handleDataPointClick(dataObject)}
        />
        {showAlert && <CustomAlert message={alertMessage} />}
      </View>
      <View style={styles.chartContainer}>
        <View style={styles.alertContainer}>
          <Text style={styles.TitleText}> DYSTRYBUCJA POZIOMU GLUKOZY</Text>
        </View>
        <PieChart
          data={pieData}
          width={screenWidth - 70}
          height={220}
          chartConfig={chartConfig}
          accessor={"value"}
          backgroundColor={"transparent"}
          paddingLeft={"15"}
          absolute
          hasLegend={true} 
        />
        {getPieChartLegend()}
      </View>
      <View style={styles.chartContainer}>
        <View style={styles.alertContainer}>
          <Text style={styles.TitleText}>DAWKA INSULINY</Text>
        </View>
        <BarChart
          data={barData}
          width={screenWidth - 70} //marginesy
          height={220}
          chartConfig={chartConfig}
          fromZero={true}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f2f2f2',
  },
  chartContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 10,
    textAlign: 'center', 
  },
  alertContainer: {
    marginTop: 10,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#66bfd4',
    borderColor: '#25a3c2',
  },
  alertContainer1: {
    marginTop: 10,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#66bfd4',
    borderColor: '#66bfd4',
  },
  alertText: {
    color: '#fff',
    textAlign: 'center',  
  },
  TitleText: {
    color: '#fff',
    textAlign: 'center',  
    fontSize: 18,
    fontWeight: 'bold',
  },
  pieChart: {
    marginTop: 20,
    height: 200,
  },
  legendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  legendIndicator: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
  legendLabel: {
    fontSize: 16,
    color: 'gray'
  },

});

export default GraphScreen;
