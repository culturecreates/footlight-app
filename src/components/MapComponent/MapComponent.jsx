import React, { useState, useEffect } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';

const MapComponent = (props) => {
  const { latitude, longitude } = props;

  const mapStyles = {
    height: '400px',
    width: '100%',
  };

  // Provide default values if latitude and longitude props are not passed
  const defaultCenter = {
    lat: !isNaN(parseFloat(latitude)) ? parseFloat(latitude) : 45.421532,
    lng: !isNaN(parseFloat(longitude)) ? parseFloat(longitude) : -75.697189,
  };

  const [selectedPosition, setSelectedPosition] = useState(defaultCenter);

  useEffect(() => {
    // Update selectedPosition if props change
    setSelectedPosition({
      lat: !isNaN(parseFloat(latitude)) ? parseFloat(latitude) : 45.421532,
      lng: !isNaN(parseFloat(longitude)) ? parseFloat(longitude) : -75.697189,
    });
  }, [latitude, longitude]);

  const onMapClick = (e) => {
    const newPosition = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    };
    setSelectedPosition(newPosition);
  };

  return (
    <GoogleMap mapContainerStyle={mapStyles} zoom={13} center={selectedPosition} onClick={onMapClick}>
      {/* Render the marker when selectedPosition is valid */}
      {selectedPosition && <Marker position={selectedPosition} draggable={true} />}
    </GoogleMap>
  );
};

export default MapComponent;
