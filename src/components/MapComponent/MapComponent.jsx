import React from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';

const MapComponent = () => {
  const mapStyles = {
    height: '400px',
    width: '100%',
  };

  const defaultCenter = {
    lat: 45.421532,
    lng: -75.697189,
  };

  return (
    <GoogleMap mapContainerStyle={mapStyles} zoom={13} center={defaultCenter}>
      <Marker position={defaultCenter} />
    </GoogleMap>
  );
};

export default MapComponent;
