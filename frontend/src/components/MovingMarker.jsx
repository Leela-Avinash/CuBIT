// MovingMarker.jsx
import React from "react";
import { Marker, Popup, useMapEvents } from "react-leaflet";
import { useSelector } from "react-redux";

const MovingMarker = ({ position, onMarkerClick }) => {
  const {currentDevice } = useSelector((state) => state.device); // Assuming you have a Redux store
  // Capture map clicks for "hide" logic in the parent
  useMapEvents({
    click: () => {
      // Let the parent know the map was clicked
      onMarkerClick(false);
    },
  });

  // When marker is clicked, show the bottom sheet in mobile
  const handleMarkerClick = (e) => {
    e.originalEvent.cancelBubble = true; // Prevent map click from also firing
    onMarkerClick(true);
  };

  return (
    <Marker position={position} eventHandlers={{ click: handleMarkerClick }}>
      <Popup>{currentDevice.deviceName}</Popup>
    </Marker>
  );
};

export default MovingMarker;
