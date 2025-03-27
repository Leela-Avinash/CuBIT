// LocationHistory.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchLocationHistory } from "../store/slices/deviceSlice";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import supercluster from "supercluster";
import "leaflet/dist/leaflet.css";

// Utility: Convert location records to GeoJSON features for supercluster
const recordsToFeatures = (records) =>
  records.map((record, index) => ({
    type: "Feature",
    properties: {
      id: index,
      date: record.date,
      time: record.time,
      batteryVoltage: record.batteryVoltage,
      cluster: false,
    },
    geometry: {
      type: "Point",
      // GeoJSON coordinates: [longitude, latitude]
      coordinates: [record.longitude, record.latitude],
    },
  }));

// Helper: Generate a unique HSL color based on the marker id and total markers
const getColorForMarker = (id, totalMarkers) => {
  const hue = (id / totalMarkers) * 360; // Spread hues evenly
  return `hsl(${hue}, 70%, 50%)`;
};

// Helper: Create a custom location (pin) icon using inline SVG with the specified color
const createColoredLocationIcon = (color) => {
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 22.2 12.5 41 12.5 41S25 22.2 25 12.5C25 5.6 19.4 0 12.5 0zM12.5 18.8c-3.3 0-6-2.7-6-6s2.7-6 6-6 6 2.7 6 6-2.7 6-6 6z" fill="${color}"/>
    </svg>
  `;
  const encoded = encodeURIComponent(svgIcon).replace(/'/g, "%27").replace(/"/g, "%22");
  const iconUrl = `data:image/svg+xml,${encoded}`;

  return new L.Icon({
    iconUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    shadowSize: [41, 41],
  });
};

// Component that uses supercluster to create clusters and renders markers accordingly
const ClusterMarkers = ({ points }) => {
  const map = useMap();
  const [clusters, setClusters] = useState([]);
  const indexRef = React.useRef();

  // Total number of points (used for generating colors)
  const totalPoints = points.length;

  useEffect(() => {
    // Initialize supercluster index
    indexRef.current = new supercluster({
      radius: 60, // Cluster radius in pixels
      maxZoom: 16,
    });
    indexRef.current.load(recordsToFeatures(points));
    updateClusters();

    // Update clusters on map movement
    map.on("moveend", updateClusters);
    return () => {
      map.off("moveend", updateClusters);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, map]);

  const updateClusters = () => {
    const bounds = map.getBounds();
    const bbox = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ];
    const zoom = map.getZoom();
    const clusters = indexRef.current.getClusters(bbox, Math.round(zoom));
    setClusters(clusters);
  };

  return (
    <>
      {clusters.map((cluster) => {
        const [longitude, latitude] = cluster.geometry.coordinates;
        const { cluster: isCluster, point_count: pointCount } = cluster.properties;

        if (isCluster) {
          // Render cluster marker with a custom DivIcon
          return (
            <Marker
              key={`cluster-${cluster.id}`}
              position={[latitude, longitude]}
              icon={new L.DivIcon({
                html: `<div style="background: rgba(0, 123, 255, 0.7); border-radius: 50%; width: 30px; height: 30px; display: flex; justify-content: center; align-items: center; color: white; font-weight: bold;">${pointCount}</div>`,
                className: "cluster-marker",
                iconSize: [30, 30],
              })}
              eventHandlers={{
                click: () => {
                  // Zoom in on cluster click
                  map.setView([latitude, longitude], Math.min(map.getZoom() + 2, 16));
                },
              }}
            >
              <Popup>
                <div>
                  <p>{pointCount} points</p>
                </div>
              </Popup>
            </Marker>
          );
        }

        // For individual markers, generate a unique colored location icon
        const markerId = cluster.properties.id;
        const color = getColorForMarker(markerId, totalPoints);
        const icon = createColoredLocationIcon(color);

        return (
          <Marker
            key={`point-${markerId}`}
            position={[latitude, longitude]}
            icon={icon}
          >
            <Popup>
              <div>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(cluster.properties.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Time:</strong> {cluster.properties.time}
                </p>
                <p>
                  <strong>Battery Voltage:</strong> {cluster.properties.batteryVoltage}
                </p>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

// Full-screen map component that accepts a locationHistory array prop
const LocationHistoryMap = ({ locationHistory = [] }) => {
  // Set map center to first record or default to [0, 0]
  const center =
    locationHistory.length > 0
      ? [locationHistory[0].latitude, locationHistory[0].longitude]
      : [0, 0];

  return (
    <MapContainer center={center} zoom={13} style={{ height: "100vh", width: "100vw" }}>
      <TileLayer
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClusterMarkers points={locationHistory} />
    </MapContainer>
  );
};

// Simple error boundary component for catching errors in the tree
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("Error caught in ErrorBoundary: ", error, info);
  }
  render() {
    if (this.state.hasError) {
      return <div>An error occurred: {this.state.error.toString()}</div>;
    }
    return this.props.children;
  }
}

// Main component that fetches location history and renders the map
const LocationHistory = () => {
  const { deviceId } = useParams();
  const dispatch = useDispatch();
  const { currentDevice, loading, error } = useSelector((state) => state.device);

  useEffect(() => {
    dispatch(fetchLocationHistory(deviceId));
  }, [dispatch, deviceId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  // Ensure locationHistory defaults to an empty array if undefined
  const locationHistory = currentDevice?.locationHistory || [];

  return (
    <ErrorBoundary>
      <LocationHistoryMap locationHistory={locationHistory} />
    </ErrorBoundary>
  );
};

export default LocationHistory;
