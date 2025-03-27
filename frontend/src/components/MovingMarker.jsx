// MovingMarker.jsx
import React from "react";
import { Marker, Popup, useMapEvents } from "react-leaflet";

const MovingMarker = ({ position, onMarkerClick }) => {
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
      <Popup>Device Marker</Popup>
    </Marker>
  );
};

export default MovingMarker;
