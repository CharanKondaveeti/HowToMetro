import { useEffect, useState } from 'react';
import './css/MetroRoutePlanner.css';
import { TbCurrentLocation } from "react-icons/tb";
import { ImLocation } from "react-icons/im";
import Select from 'react-select';

const MetroRoutePlanner = () => {
    const [metroData, setMetroData] = useState([]);
    const [startStation, setStartStation] = useState('');
    const [endStation, setEndStation] = useState('');
    const [route, setRoute] = useState([]);

    // fetch metro data
    useEffect(() => {
        const fetchMetroData = async () => {
            try {
                const response = await fetch('https://howtometro-be.onrender.com/api/metrodata');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setMetroData(data.data);
            } catch (error) {
                console.error('There was a problem with the fetch operation:', error);
            }
        };

        fetchMetroData();
    }, []);

    // for drop down suggestions
    const allStations = metroData.flatMap(line => line.stations.map(station => ({
        label: station.station_name, // react-select expects label and value
        value: station.station_name,
        line: line.line,
        number: station.station_number,
        connection: station.connections
    })));

    const handleStationSelect = (selectedOption, type) => {
        if (type === 'start') {
            setStartStation(selectedOption.value);
        } else {
            setEndStation(selectedOption.value);
        }
    };

    const findRoute = () => {
        const start = allStations.find(station => station.value === startStation);
        const end = allStations.find(station => station.value === endStation);

        if (!start || !end) {
            alert("Please select valid stations");
            return;
        }

        // Find the route logic
        const routeSteps = calculateRoute(start, end);
        console.log(start, end);
        setRoute(routeSteps);
    };

    const calculateRoute = (start, end) => {
        const steps = []; // This will store the step-by-step instructions

        // Start at the starting station
        steps.push(`Start at ${start.value} Metro Station on ${start.line} line.`);

        // If start and end stations are on the same line
        if (start.line === end.line) {
            steps.push(`Your destination is on the same ${end.line} line`);
            steps.push(`Take ${start.line} line towards ${end.value}.`);
            steps.push(`Arrive at ${end.value}.`);
            return steps;
        } else {
            steps.push(`Your destination is on the ${end.line} line`);
        }

        // If start and end stations are on different lines
        const transferStation = findTransferStation(start, end);
        if (transferStation) {
            steps.push(`Take ${start.line} line towards ${transferStation.name}.`);
            steps.push(`Change at ${transferStation.name} to ${end.line}.`);
            steps.push(`Now on the ${end.line}, head towards ${end.value}.`);
            steps.push(`Arrive at ${end.value}.`);
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
        <div className='metro--planner-inputs'>
            <div className='inputs--container'>
                <div className='station--icons'>
                    <div><TbCurrentLocation size={22} color='#1a449a' /></div>
                    <div className="dotted-line"></div>  {/* Dotted Line */}
                    <div><ImLocation size={22} color='#1a449a' /></div>
                </div>

                <div className='station--inputs'>
                    <div>
                        {/* From Station dropdown */}
                        <Select
                            options={allStations}
                            value={allStations.find(option => option.value === startStation)}
                            onChange={(selectedOption) => handleStationSelect(selectedOption, 'start')}
                            placeholder="From Station"
                        />
                    </div>
                    <div>
                        {/* To Station dropdown */}
                        <Select
                            options={allStations}
                            value={allStations.find(option => option.value === endStation)}
                            onChange={(selectedOption) => handleStationSelect(selectedOption, 'end')}
                            placeholder="To Station"
                        />
                    </div>
                </div>
            </div>
            <button onClick={findRoute}>Find Route</button>

            {/* Route Steps */}
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
