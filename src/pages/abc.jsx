import React, { useEffect, useState } from 'react';
import './css/MetroRoutePlanner.css'; // Import your CSS file

const MetroRoutePlanner = () => {
    const [startStation, setStartStation] = useState('');
    const [endStation, setEndStation] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [route, setRoute] = useState([]);
    const [metroData, setMetroData] = useState([]);

    useEffect(() => {
        const fetchMetroData = async () => {
            try {
                const response = await fetch('http://localhost:4000/metroData');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setMetroData(data);
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
            }
        };

        fetchMetroData();
    }, []);

    const allStations = metroData.flatMap(line => line.stations.map(station => ({
        name: station.station_name,
        line: line.line,
        number: station.station_number,
    })));

    const handleInputChange = (e, type) => {
        const value = e.target.value;
        if (type === 'start') {
            setStartStation(value);
        } else {
            setEndStation(value);
        }
        const filteredStations = allStations.filter(station => 
            station.name.toLowerCase().includes(value.toLowerCase())
        );
        setSuggestions(filteredStations);
    };

    const handleStationSelect = (station, type) => {
        if (type === 'start') {
            setStartStation(station.name);
        } else {
            setEndStation(station.name);
        }
        setSuggestions([]);
    };

    const findRoute = () => {
        const start = allStations.find(station => station.name === startStation);
        const end = allStations.find(station => station.name === endStation);

        if (!start || !end) {
            alert("Please select valid stations");
            return;
        }

        // Find the route logic
        const routeSteps = calculateRoute(start, end);
        setRoute(routeSteps);
    };

    const calculateRoute = (start, end) => {
        const steps = []; // This will store the step-by-step instructions

        // Start at the starting station
        steps.push(`Start at ${start.name} on line ${start.line}.`);

        // If start and end stations are on the same line
        if (start.line === end.line) {
            steps.push(`Take ${start.line} line towards ${end.name}.`);
            steps.push(`Arrive at ${end.name}.`);
            return steps;
        }

        // If start and end stations are on different lines
        const transferStation = findTransferStation(start, end);
        if (transferStation) {
            steps.push(`Take ${start.line} line towards ${transferStation.name}.`);
            steps.push(`Change at ${transferStation.name} to ${end.line}.`);
            steps.push(`Now on the ${end.line}, head towards ${end.name}.`);
            steps.push(`Arrive at ${end.name}.`);
        } else {
            steps.push(`No valid transfer station found. Please check the metro map for available transfers.`);
        }

        return steps;
    };

    const findTransferStation = (start, end) => {
        // Look for a station that is on both the start line and end line
        const possibleTransfers = metroData.flatMap(line => {
            if (line.line === start.line) {
                return line.stations.filter(station => {
                    return metroData.some(otherLine => 
                        otherLine.line === end.line && 
                        otherLine.stations.some(otherStation => otherStation.station_name === station.station_name)
                    );
                });
            }
            return [];
        });

        // Return the first valid transfer candidate if exists
        return possibleTransfers[0] ? { name: possibleTransfers[0].station_name, line: start.line } : null;
    };

    return (
        <div>
            <h1>Metro Route Planner</h1>
            <div>
                <input
                    type="text"
                    placeholder="From Station"
                    value={startStation}
                    onChange={(e) => handleInputChange(e, 'start')}
                />
                {suggestions.length > 0 && (
                    <ul>
                        {suggestions.map((station, index) => (
                            <li key={index} onClick={() => handleStationSelect(station, 'start')}>
                                {station.name} ({station.line})
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <div>
                <input
                    type="text"
                    placeholder="To Station"
                    value={endStation}
                    onChange={(e) => handleInputChange(e, 'end')}
                />
                {suggestions.length > 0 && (
                    <ul>
                        {suggestions.map((station, index) => (
                            <li key={index} onClick={() => handleStationSelect(station, 'end')}>
                                {station.name} ({station.line})
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <button onClick={findRoute}>Find Route</button>
            <div>
                <h2>Route Steps:</h2>
                <ul>
                    {route.map((step, index) => (
                        <li key={index}>{step}</li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default MetroRoutePlanner;
