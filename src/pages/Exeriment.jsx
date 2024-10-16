import { useEffect, useState } from "react";

export default function Exeriment() {
  const [metroData, setMetroData] = useState([]);
  const [startStation, setStartStation] = useState("Bharat Nagar");
  const [endStation, setEndStation] = useState("RTC Cross Road");

  useEffect(() => {
    const fetchMetroData = async () => {
      try {
        const response = await fetch(
          "https://howtometro-be.onrender.com/api/metrodata"
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setMetroData(data.data);
      } catch (error) {
        console.error("There was a problem with the fetch operation:", error);
      }
    };

    fetchMetroData();
  }, []);

  function findStation(stationName) {
    for (let line of metroData) {
      const station = line.stations.find(
        (station) => station.station_name === stationName
      );
      if (station) {
        return station;
      }
    }
    return null;
  }

  // Example usage
  setStartStation(findStation("uppal"));
  setEndStation(findStation("uppal"));

  return (
    <div>
      <p>{startStation.station_name}</p>
      <p>{endStation.station_name}</p>
    </div>
  );
}
