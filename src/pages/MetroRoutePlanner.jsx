import { useEffect, useState } from "react";
import "./css/MetroRoutePlanner.css";
import { TbCurrentLocation } from "react-icons/tb";
import { ImLocation } from "react-icons/im";
import Select from "react-select";
import GotoMetro from "../features/GotoMetro";
// import ConnectCurrLoc from "../features/ConnectCurrLoc";
// import ConnectTrain from "../features/ConnectTrain";
// import ConnectWalk from "../features/COnnectWalk";

const MetroRoutePlanner = () => {
  const [metroData, setMetroData] = useState([]);
  const [startStation, setStartStation] = useState("");
  const [endStation, setEndStation] = useState("");
  const [routeData, setRouteData] = useState([]);
  const [routeData1, setRouteData1] = useState([]);

  // Fetch metro data
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

  // For dropdown suggestions
  const allStations = metroData.flatMap((line) =>
    line.stations.map((station) => ({
      label: station.station_name,
      value: station.station_name,
      line: line.line,
    }))
  );

  const handleStationSelect = (selectedOption, type) => {
    if (type === "start") {
      setStartStation(selectedOption.value);
    } else {
      setEndStation(selectedOption.value);
    }
  };

  const findRoute = () => {
    setRouteData([]);
    setRouteData1([]);
    const start = metroData
      .flatMap((line) => line.stations)
      .find((station) => station.station_name === startStation);
    const end = metroData
      .flatMap((line) => line.stations)
      .find((station) => station.station_name === endStation);

    if (!start || !end) {
      alert("Please select valid stations");
      return;
    }

    giveway(start, end, [], []);
  };

  function giveway(start, end, currentPath = [], currentPath1 = []) {
    const newPath = [...currentPath, start.station_name];

    // If it's the first step, add the walk action from the current location to the first station
    if (currentPath1.length === 0) {
      currentPath1.push({
        step: currentPath1.length + 1,
        action: "walk",
        from: "Current Location",
        to: start.station_name,
        instructions: `Walk to ${start.station_name}.`,
      });
    }

    // If the start and end stations are on different lines
    if (start.line !== end.line) {
      const transferStations = findTransferStations(start);

      transferStations.forEach((transferStation) => {
        // Create a fresh copy of currentPath1 to avoid modifying the same array across iterations
        const newCurrentPath1 = [...currentPath1];

        newCurrentPath1.push({
          step: newCurrentPath1.length + 1,
          action: "metro",
          from: start.station_name,
          to: transferStation.station_name,
          line: start.line,
          instructions: `Take the ${start.line} to ${transferStation.station_name}.`,
        });

        newCurrentPath1.push({
          step: newCurrentPath1.length + 1,
          action: "change",
          from: start.line,
          to: transferStation.line,
          instructions: `Change from ${start.line} to ${transferStation.line} at ${transferStation.station_name}.`,
        });

        // Recursive call with a fresh path array for this iteration
        giveway(transferStation, end, newPath, newCurrentPath1);
      });
    } else {
      // When the start and end are on the same line
      const finalRoute = {
        path: [...newPath, end.station_name],
      };

      // Add the final metro ride
      currentPath1.push({
        step: currentPath1.length + 1,
        action: "metro",
        from: start.station_name,
        to: end.station_name,
        line: start.line,
        instructions: `Take the ${start.line} to ${end.station_name}.`,
      });

      // Add final walk action
      currentPath1.push({
        step: currentPath1.length + 1,
        action: "walk",
        from: end.station_name,
        to: "Final destination",
        instructions: `Walk to your final destination from ${end.station_name}.`,
      });

      // Save the complete path as a new object
      setRouteData1((prevRoutes) => [...prevRoutes, { path: currentPath1 }]);

      // Save the route summary
      setRouteData((prevRoutes) => [...prevRoutes, finalRoute]);
      return;
    }
  }

  function findTransferStations(station) {
    const nextConnectStations = [];
    const transferStations = [];

    const line = metroData.find((line) => line.line === station.line);
    if (line) {
      for (const s of line.stations) {
        if (
          s.station_name !== station.station_name &&
          s.connections.length > 0
        ) {
          nextConnectStations.push(s);
        }
      }
    }

    nextConnectStations.forEach((eachStation) => {
      const stationInterchange = metroData
        .find((line) => line.line === eachStation.connections[0])
        .stations.find(
          (station) => station.station_name === eachStation.station_name
        );
      transferStations.push(stationInterchange);
    });

    return transferStations;
  }

  console.log(routeData);
  console.log("------------------");
  console.log(routeData1);

  return (
    <div>
      <div className="metro--planner-inputs">
        <div className="inputs--container">
          <div className="station--icons">
            <div>
              <TbCurrentLocation size={22} color="#1a449a" />
            </div>
            <div className="dotted-line"></div>
            <div>
              <ImLocation size={22} color="#1a449a" />
            </div>
          </div>

          <div className="station--inputs">
            <div>
              <Select
                options={allStations}
                value={allStations.find(
                  (option) => option.value === startStation
                )}
                onChange={(selectedOption) =>
                  handleStationSelect(selectedOption, "start")
                }
                placeholder="From Station"
              />
            </div>
            <div>
              <Select
                options={allStations}
                value={allStations.find(
                  (option) => option.value === endStation
                )}
                onChange={(selectedOption) =>
                  handleStationSelect(selectedOption, "end")
                }
                placeholder="To Station"
              />
            </div>
          </div>
        </div>
        <button onClick={findRoute}>Find Route</button>
      </div>

      <div className="route--data">
        <h2>Route Data:</h2>
        <GotoMetro>
          {/* {routeData.length > 0 ? (
            <ul>
              {routeData.map((route, index) => (
                <li key={index}>
                  <h3>Route {index + 1}</h3>
                  <ul>
                    {route.path.map((station, idx) => (
                      <li key={idx}>{station}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <li>No route found</li>
          )} */}
        </GotoMetro>
      </div>
    </div>
  );
};

export default MetroRoutePlanner;
