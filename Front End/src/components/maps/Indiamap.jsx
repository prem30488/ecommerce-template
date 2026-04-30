import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchOrderLocationsAll } from '../../util/APIUtils';
import './Indiamap.css';

const Indiamap = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const isMounted = useRef(true);
  
  const [locations, setLocations] = useState([]);
  const [geocodedCount, setGeocodedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Constants
  const INDIA_CENTER = [20.5937, 78.9629];
  const INDIA_BOUNDS = [
    [6.5, 68.0], // Southwest
    [38.0, 98.0] // Northeast
  ];

  // Initialize Map
  useEffect(() => {
    isMounted.current = true;

    if (!mapInstanceRef.current && mapContainerRef.current) {
      // Create Map
      const map = L.map(mapContainerRef.current, {
        center: INDIA_CENTER,
        zoom: 5,
        minZoom: 4,
        maxZoom: 10,
        scrollWheelZoom: false,
        maxBounds: INDIA_BOUNDS
      });

      // Add Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      }).addTo(map);

      // Add Layer Group for markers
      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    // Cleanup
    return () => {
      isMounted.current = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Fetch and Geocode Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchOrderLocationsAll();
        if (!isMounted.current) return;
        
        setLocations(data);
        setIsLoading(false);

        const customIcon = L.icon({
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        // Geocode one by one
        let processed = 0;
        for (const loc of data) {
          if (!isMounted.current) break;
          if (loc.name === 'Other' || !loc.name) continue;

          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(loc.name + ', India')}&limit=1`,
              { headers: { 'Accept-Language': 'en' } }
            );
            
            const json = await response.json();
            if (json && json.length > 0 && isMounted.current) {
              const lat = parseFloat(json[0].lat);
              const lng = parseFloat(json[0].lon);

              // Check bounds
              if (lat >= 6.0 && lat <= 38.0 && lng >= 68.0 && lng <= 98.0) {
                if (markersLayerRef.current) {
                  L.marker([lat, lng], { icon: customIcon })
                    .bindPopup(`<strong>${loc.name}</strong><br/>${loc.count} Orders`)
                    .addTo(markersLayerRef.current);
                }
              }
              processed++;
              setGeocodedCount(processed);
            }
            await new Promise(r => setTimeout(r, 1100)); // Respect policy
          } catch (e) {
            console.warn("Geocoding failed for:", loc.name, e);
          }
        }
      } catch (err) {
        console.error("Map Data Fetch Error:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="india-map-wrapper section-card">
      <div className="section-header">
        <div>
          <h3 className="section-title">Order Distribution</h3>
          <p className="text-muted">Customer hotspots across India (Native Leaflet)</p>
        </div>
        <div className="map-legend">
          <div className="legend-item">
            <span className="dot"></span>
            <span>Delivery Cities</span>
          </div>
        </div>
      </div>
      
      <div className="map-container" style={{ position: 'relative', height: '450px' }}>
        <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }}></div>
        
        {isLoading && (
          <div className="map-loading-overlay">
            <div className="spinner"></div>
            <span>Analyzing geography...</span>
          </div>
        )}

        {!isLoading && geocodedCount < locations.filter(l => l.name !== 'Other' && l.name).length && (
          <div className="map-status-overlay">
            <div className="mini-spinner"></div>
            <span>Mapping: {geocodedCount} cities resolved...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Indiamap;
