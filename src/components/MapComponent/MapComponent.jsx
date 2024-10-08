import React, { useState, useEffect } from 'react';
//eslint-disable-next-line
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

//eslint-disable-next-line
const MapComponent = (props) => {
  const { latitude, longitude, form, fieldName } = props;
  const [markerPosition, setMarkerPosition] = useState({
    lat: latitude ?? 54.35291352856401,
    lng: longitude ?? -110.072423828125,
  });

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
    console.log('New position:', newPosition);
  };
  useEffect(() => {
    if (latitude && longitude)
      setMarkerPosition({
        lat: latitude,
        lng: longitude,
      });
  }, [latitude, longitude]);

  return (
    <APIProvider apiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
      <Map
        defaultZoom={5}
        mapId={process.env.REACT_APP_GOOGLE_MAPS_ID}
        style={{
          height: '40vh',
          width: '100%',
        }}
        defaultCenter={markerPosition}
        onCameraChanged={(ev) => console.log('camera changed:', ev.detail.center, 'zoom:', ev.detail.zoom)}>
        <AdvancedMarker
          position={markerPosition}
          draggable={true} // Enable dragging
          onDragEnd={handleMarkerDragEnd} // Handle drag end event
        >
          <Pin />
        </AdvancedMarker>
      </Map>
    </APIProvider>
  );
};

export default MapComponent;
