// MapComponent.jsx
import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import MovingMarker from "./MovingMarker";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapComponent = ({ latitude, longitude, onMarkerClick }) => {
  const position = [latitude, longitude];

  return (
    <MapContainer center={position} zoom={13} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MovingMarker position={position} onMarkerClick={onMarkerClick} />
    </MapContainer>
  );
};

export default React.memo(MapComponent, (prevProps, nextProps) => {
    return (
        prevProps.latitude === nextProps.latitude &&
        prevProps.longitude === nextProps.longitude &&
        prevProps.popupText === nextProps.popupText
    );
});
