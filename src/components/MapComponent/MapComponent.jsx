import React, { useState, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const MapComponent = (props) => {
  const { latitude, longitude, form, fieldName, handleGeocode } = props;
  const [markerPosition, setMarkerPosition] = useState({
    lat: latitude ?? 54.35291352856401,
    lng: longitude ?? -110.072423828125,
  });
  const [center, setCenter] = useState({
    lat: latitude ?? 54.35291352856401,
    lng: longitude ?? -110.072423828125,
  });

  const [zoom, setZoom] = useState(20);
  // const geocoder = new google.maps.Geocoder();

  const handleMarkerDragEnd = (event) => {
    const { latLng } = event;
    const newPosition = {
      lat: latLng.lat(),
      lng: latLng.lng(),
    };

    setMarkerPosition(newPosition);
    form.setFieldsValue({
      [fieldName]: `${newPosition.lat},${newPosition.lng}`,
      latitude: newPosition.lat,
      longitude: newPosition.lng,
    });
    handleGeocode([newPosition.lat, newPosition.lng]);
  };
  useEffect(() => {
    if (latitude && longitude) {
      setMarkerPosition({
        lat: latitude,
        lng: longitude,
      });
      setCenter({
        lat: latitude,
        lng: longitude,
      });
      if (zoom !== 20) setZoom(20);
    }
  }, [latitude, longitude]);

  return (
    <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <Map
        mapId={process.env.REACT_APP_GOOGLE_MAPS_ID}
        style={{
          height: '40vh',
          width: '100%',
        }}
        zoom={zoom}
        defaultCenter={center}
        center={center}
        onCameraChanged={(ev) => {
          setZoom(ev.detail.zoom);
          setCenter(ev.detail.center);
        }}>
        <AdvancedMarker position={markerPosition} draggable={true} onDragEnd={handleMarkerDragEnd}>
          <Pin />
        </AdvancedMarker>
      </Map>
    </APIProvider>
  );
};

export default MapComponent;
