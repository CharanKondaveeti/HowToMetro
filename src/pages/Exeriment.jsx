import { useEffect, useState } from "react";
import "./css/MetroRoutePlanner.css";
import { TbCurrentLocation } from "react-icons/tb";
import { ImLocation } from "react-icons/im";
import Select from "react-select";
import GotoMetro from "../features/GotoMetro";
import ConnectCurrLoc from "../features/ConnectCurrLoc";
import ConnectTrain from "../features/ConnectTrain";
import COnnectWalk from "../features/COnnectWalk";

const MetroRoutePlanner = () => {
  const [metroData, setMetroData] = useState([]);
  const [startStation, setStartStation] = useState("");
  const [endStation, setEndStation] = useState("");
  const [routeData, setRouteData] = useState([]);
  const [startLine, setStartLine] = useState(null);
  const [endLine, setEndLine] = useState(null);

  console.log(startLine, endLine);

  useEffect(() => {
    const fetchStationLines = async () => {
      const startLineData = await getLineAndStation(startStation);
      const endLineData = await getLineAndStation(endStation);
      setStartLine(startLineData ? startLineData.line : null);
      setEndLine(endLineData ? endLineData.line : null);
    };

    fetchStationLines();
  }, [startStation, endStation]);

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
    const start = allStations.find((station) => station.value === startStation);
    const end = allStations.find((station) => station.value === endStation);

    if (!start || !end) {
      alert("Please select valid stations");
      return;
    }

    // Find the route using BFS
    const routeSteps = bfsRoute(start, end);
    setRouteData(routeSteps);
  };

  const bfsRoute = (start, end) => {
    const queue = [{ station: start, path: [], stops: 0 }];
    const visited = new Set();

    while (queue.length) {
      const { station, path, stops } = queue.shift();

      if (visited.has(station.value)) continue;
      visited.add(station.value);

      const currentPath = [...path, station];

      if (station.value === end.value) {
        return currentPath.map((s, index) => {
          const nextStation =
            index < currentPath.length - 1 ? currentPath[index + 1] : null;

          // Only call getIntermediateStationsUntilTransfer if nextStation is defined
          const intermediateStations =
            nextStation !== null
              ? getIntermediateStationsUntilTransfer(s, nextStation)
              : [];

          return {
            step: index + 1,
            station: s.value,
            totalStops: stops,
            nextStation: nextStation ? nextStation.value : null,
            intermediateStations,
          };
        });
      }

      const neighbors = getNeighbors(station);
      for (const neighbor of neighbors) {
        queue.push({ station: neighbor, path: currentPath, stops: stops + 1 });
      }
    }

    return []; // Return empty if no path found
  };

  const getIntermediateStationsUntilTransfer = (
    currentStation,
    nextStation
  ) => {
    const intermediate = [];

    // Get the current line data for the current station
    const currentLineData = metroData.find(
      (line) => line.line === currentStation.line
    );

    // Get the next line data for the next station
    const nextLineData = metroData.find(
      (line) => line.line === nextStation.line
    );

    // Collect intermediate stations on the current line
    if (currentLineData) {
      const startIdx = currentLineData.stations.findIndex(
        (s) => s.station_name === currentStation.value
      );
      const endIdx = currentLineData.stations.findIndex(
        (s) => s.station_name === nextStation.value
      );

      if (startIdx !== -1 && endIdx !== -1) {
        const [minIdx, maxIdx] = [
          Math.min(startIdx, endIdx),
          Math.max(startIdx, endIdx),
        ];

        // Add intermediate stations in the correct order based on direction
        for (let i = minIdx + 1; i < maxIdx; i++) {
          intermediate.push(currentLineData.stations[i].station_name);
        }
      }
    }

    // If there's a transfer to a different line
    if (nextLineData && currentLineData !== nextLineData) {
      const nextStationIdx = nextLineData.stations.findIndex(
        (s) => s.station_name === nextStation.value
      );
      const currentStationIdx = nextLineData.stations.findIndex(
        (s) => s.station_name === currentStation.value
      );

      if (currentStationIdx !== -1 && nextStationIdx !== -1) {
        // Gather intermediate stations correctly based on direction
        const startIndex = Math.min(currentStationIdx, nextStationIdx) + 1;
        const endIndex = Math.max(currentStationIdx, nextStationIdx);

        for (let i = startIndex; i < endIndex; i++) {
          intermediate.push(nextLineData.stations[i].station_name);
        }
      }
    }

    return intermediate;
  };

  const getNeighbors = (station) => {
    const neighbors = [];
    const currentLine = metroData.find((line) => line.line === station.line);

    // Check all stations on the same line
    if (currentLine) {
      currentLine.stations.forEach((s) => {
        if (s.station_name !== station.value) {
          neighbors.push({
            value: s.station_name,
            line: currentLine.line,
          });
        }
      });
    }

    // Check for transfer stations
    metroData.forEach((line) => {
      if (line.line !== station.line) {
        line.stations.forEach((s) => {
          if (s.station_name === station.value) {
            line.stations.forEach((transferStation) => {
              if (transferStation.station_name !== station.value) {
                neighbors.push({
                  value: transferStation.station_name,
                  line: line.line,
                });
              }
            });
          }
        });
      }
    });

    return neighbors;
  };

  async function getLineAndStation(stationName) {
    return new Promise((resolve) => {
      for (const line of metroData) {
        const station = line.stations.find(
          (s) => s.station_name.toLowerCase() === stationName.toLowerCase()
        );
        if (station) {
          resolve({
            line: line.line,
          });
          return; // Exit the function after resolving
        }
      }
      resolve(null); // Resolve with null if station is not found
    });
  }

  console.log(getLineAndStation(startStation).line);

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
        {console.log(startStation, endStation)}
        <GotoMetro>
          {console.log(routeData)}{" "}
          {/* This will log the routeData to the console for debugging */}
          {routeData.length > 0 ? (
            <ul>
              {routeData.map((step) => (
                <li key={step.step}>
                  {step.step === 1 ? (
                    <>
                      <ConnectCurrLoc />
                      <ConnectTrain
                        to={step.station}
                        from={step.nextStation}
                        instructions={"sfv d dj"}
                      />
                    </>
                  ) : null}

                  {step.step === 2 ? (
                    <>
                      <COnnectWalk to={startLine} from={endLine} />
                      <ConnectTrain
                        to={step.station}
                        from={step.nextStation}
                        instructions={"sfv d dj"}
                      />
                    </>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <li>No route found</li> // This will display if no routes are available
          )}
        </GotoMetro>
      </div>
    </div>
  );
};

export default MetroRoutePlanner;
