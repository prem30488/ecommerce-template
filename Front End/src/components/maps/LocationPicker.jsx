import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LocationPicker.css';

const LocationPicker = ({ onLocationSelect, initialAddress }) => {
    const mapContainerRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markerRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const DEFAULT_CENTER = [20.5937, 78.9629]; // India center

    // Fix for Leaflet default icon issues in React/Vite
    const customIcon = L.icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    useEffect(() => {
        if (!mapInstanceRef.current && mapContainerRef.current) {
            const map = L.map(mapContainerRef.current).setView(DEFAULT_CENTER, 5);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            }).addTo(map);

            mapInstanceRef.current = map;

            // Handle map click
            map.on('click', (e) => {
                updateMarker(e.latlng.lat, e.latlng.lng);
            });

            // Try to get user's current location
            map.locate({ setView: true, maxZoom: 16 });
            map.on('locationfound', (e) => {
                updateMarker(e.latlng.lat, e.latlng.lng);
            });
        }

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    const updateMarker = async (lat, lng) => {
        if (!mapInstanceRef.current) return;

        if (markerRef.current) {
            markerRef.current.setLatLng([lat, lng]);
        } else {
            markerRef.current = L.marker([lat, lng], { 
                icon: customIcon,
                draggable: true 
            }).addTo(mapInstanceRef.current);

            markerRef.current.on('dragend', (e) => {
                const position = e.target.getLatLng();
                updateMarker(position.lat, position.lng);
            });
        }

        mapInstanceRef.current.panTo([lat, lng]);
        await reverseGeocode(lat, lng);
    };

    const reverseGeocode = async (lat, lng) => {
        setLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
                { headers: { 'Accept-Language': 'en' } }
            );
            const data = await response.json();
            
            if (data && data.address) {
                const addr = data.address;
                const result = {
                    lat,
                    lng,
                    street: addr.road || addr.suburb || addr.neighbourhood || '',
                    city: addr.city || addr.town || addr.village || addr.county || '',
                    state: addr.state || '',
                    zipcode: addr.postcode || '',
                    country: addr.country || 'India',
                    formatted: data.display_name
                };
                onLocationSelect(result);
            }
        } catch (error) {
            console.error("Reverse geocoding error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setLoading(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', India')}&limit=1`,
                { headers: { 'Accept-Language': 'en' } }
            );
            const data = await response.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                const newLat = parseFloat(lat);
                const newLng = parseFloat(lon);
                mapInstanceRef.current.setView([newLat, newLng], 16);
                updateMarker(newLat, newLng);
            }
        } catch (error) {
            console.error("Search error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="location-picker-container">
            <div className="location-search-box">
                <form onSubmit={handleSearch}>
                    <input 
                        type="text" 
                        placeholder="Search for your area, colony, or landmark..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="lp-search-input"
                    />
                    <button type="submit" className="lp-search-btn" disabled={loading}>
                        {loading ? '...' : 'Search'}
                    </button>
                </form>
            </div>
            
            <div className="map-wrapper">
                <div ref={mapContainerRef} className="map-view"></div>
                {loading && (
                    <div className="map-mini-loader">
                        <div className="lp-mini-spinner"></div>
                        <span>Getting address details...</span>
                    </div>
                )}
            </div>
            <div className="location-hint">
                <p>Click on the map or drag the marker to set your precise delivery location.</p>
            </div>
        </div>
    );
};

export default LocationPicker;
