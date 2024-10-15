import { useState } from 'react';
import './css/Landing.css';

const Landing = () => {
  const [useManualLocation, setUseManualLocation] = useState(false);
  const [userLocation, setUserLocation] = useState({ latitude: '', longitude: '' });
  const [nearestStations, setNearestStations] = useState([]);
  const [error, setError] = useState('');

  const handleManualInputChange = (e) => {
    const { name, value } = e.target;
    setUserLocation(prevLocation => ({ ...prevLocation, [name]: value }));
  };

  const toggleLocationInput = () => {
    setUseManualLocation(!useManualLocation);
    setError('');
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          fetchMetroData(latitude, longitude);
        },
        (err) => {
          setError('Error fetching location.');
        }
      );
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const handleSubmit = () => {
    const { latitude, longitude } = userLocation;
    
    if (!latitude || !longitude) {
      setError('Please provide valid latitude and longitude.');
      return;
    }
    
    fetchMetroData(latitude, longitude);
  };

  const fetchMetroData = async (latitude, longitude) => {
    try {
      const response = await fetch('http://localhost:4000/metroData');
      const data = await response.json();

      // Use Promise.all to wait for all distance fetches to complete
      const stationsWithDistance = await Promise.all(
        data.flatMap(line => 
          line.stations.map(async (station) => {
            const [stationLat, stationLng] = station.coordinates;

            // Fetch road route distance from GraphHopper API
            const distance = await fetchGraphHopperDistance(latitude, longitude, stationLat, stationLng);

            return { ...station, distance };
          })
        )
      );

      // Sort stations by distance
      const sortedStations = stationsWithDistance.sort((a, b) => a.distance - b.distance);
      
      // Get the nearest stations and set the state
      setNearestStations(sortedStations.slice(0, 1));
    } catch (error) {
      setError('Error fetching metro data: ' + error.message);
    }
  };

  const fetchGraphHopperDistance = async (lat1, lon1, lat2, lon2) => {
    const url = `https://graphhopper.com/api/1/route?point=${lat1},${lon1}&point=${lat2},${lon2}&vehicle=car&key=0ea851b9-b13d-4ffe-88e0-3a3bbfa347cb`;
    
    try {
      const response = await fetch(url);
      
      if (response.status === 401) {
        setError('Error: Unauthorized. Please check your API key.');
        return Infinity;  // Fallback to avoid failure
      }

      if (response.status === 429) {
        setError('Too many requests. Please try again later.');
        return Infinity;  // Fallback to avoid failure
      }
      
      const data = await response.json();
      if (data.paths && data.paths.length > 0) {
        return data.paths[0].distance;  // Distance in meters
      } else {
        throw new Error('No paths found in GraphHopper response');
      }
    } catch (error) {
      setError('Error fetching distance: ' + error.message);
      return Infinity;  // Fallback to avoid failure
    }
  };

  return (
    <div>
      <h1>Find Nearest Metro</h1>
      
      <div>
        <label>
          <input
            type="checkbox"
            checked={useManualLocation}
            onChange={toggleLocationInput}
          />
          Use manual location input
        </label>
      </div>
      
      {useManualLocation ? (
        <div>
          <label>
            Latitude: 
            <input
              type="number"
              name="latitude"
              value={userLocation.latitude}
              onChange={handleManualInputChange}
            />
          </label>
          <br />
          <label>
            Longitude: 
            <input
              type="number"
              name="longitude"
              value={userLocation.longitude}
              onChange={handleManualInputChange}
            />
          </label>
          <br />
          <button onClick={handleSubmit}>Find Metro Stations</button>
        </div>
      ) : (
        <p className='submit' onClick={getLocation}>Get My Location</p>
      )}

      {error && <p>{error}</p>}
      
      <h2>Nearest Metro Stations</h2>
      <ul>
        {nearestStations.map((station, index) => {
          const distanceInKm = station.distance / 1000; // Convert distance to kilometers

          return (
            <li key={index}>
              {station.station_name} - {distanceInKm < 1 ? 
                `${station.distance.toFixed(2)} meters away` : 
                `${distanceInKm.toFixed(2)} km away`}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Landing;
