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
    const encoded = encodeURIComponent(svgIcon)
        .replace(/'/g, "%27")
        .replace(/"/g, "%22");
    const iconUrl = `data:image/svg+xml,${encoded}`;

    return new L.Icon({
        iconUrl,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [0, -41],
        shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
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
                const { cluster: isCluster, point_count: pointCount } =
                    cluster.properties;

                if (isCluster) {
                    // Render cluster marker with a custom DivIcon
                    return (
                        <Marker
                            key={`cluster-${cluster.id}`}
                            position={[latitude, longitude]}
                            icon={
                                new L.DivIcon({
                                    html: `<div style="background: rgba(0, 123, 255, 0.7); border-radius: 50%; width: 30px; height: 30px; display: flex; justify-content: center; align-items: center; color: white; font-weight: bold;">${pointCount}</div>`,
                                    className: "cluster-marker",
                                    iconSize: [30, 30],
                                })
                            }
                            eventHandlers={{
                                click: () => {
                                    // Zoom in on cluster click
                                    map.setView(
                                        [latitude, longitude],
                                        Math.min(map.getZoom() + 2, 16)
                                    );
                                },
                            }}
                        >
                            <Popup className="bg-gray-900 text-white rounded">
                                <div className="bg-gray-900 text-white p-2 rounded">
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
                            <div className="bg-gray-900 text-white p-2 rounded">
                                <h3 className="font-bold">Location Info</h3>
                                <p>
                                    <strong>Date:</strong>{" "}
                                    {new Date(
                                        cluster.properties.date
                                    ).toLocaleDateString()}
                                </p>
                                <p>
                                    <strong>Time:</strong>{" "}
                                    {cluster.properties.time}
                                </p>
                                <p>
                                    <strong>Battery Voltage:</strong>{" "}
                                    {cluster.properties.batteryVoltage}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                );
            })}
        </>
    );
};

// 3) PLAYBACK MODE MARKERS
const PlaybackMarkers = ({
    locationHistory,
    currentIndex,
    nextIndex,
    onMarkerClick,
}) => {
    const map = useMap();

    // Pan to the current marker whenever currentIndex changes
    useEffect(() => {
        if (
            locationHistory.length > 0 &&
            currentIndex < locationHistory.length
        ) {
            const current = locationHistory[currentIndex];
            // Pan without changing the zoom level
            map.panTo([current.latitude, current.longitude]);
        }
    }, [currentIndex, locationHistory, map]);

    // Show two markers: current (blue) and next (red) if nextIndex is valid
    const markers = [];
    if (
        locationHistory.length > 0 &&
        currentIndex >= 0 &&
        currentIndex < locationHistory.length
    ) {
        const current = locationHistory[currentIndex];
        markers.push({
            position: [current.latitude, current.longitude],
            colorIcon: createColoredLocationIcon("blue"),
            data: current,
            key: "current",
        });
    }
    if (
        locationHistory.length > 0 &&
        nextIndex >= 0 &&
        nextIndex < locationHistory.length
    ) {
        const next = locationHistory[nextIndex];
        markers.push({
            position: [next.latitude, next.longitude],
            colorIcon: createColoredLocationIcon("red"),
            data: next,
            key: "next",
        });
    }

    return (
        <>
            {markers.map((marker) => (
                <Marker
                    key={marker.key}
                    position={marker.position}
                    icon={marker.colorIcon}
                    eventHandlers={{
                        click: () => onMarkerClick(marker.data),
                    }}
                >
                    <Popup>
                        <div className="bg-gray-900 text-white p-2 rounded">
                            {marker.key === "current" ? (
                                <h3 className="font-bold">Starting</h3>
                            ) : (
                                <h3 className="font-bold">Destination</h3>
                            )}
                            <p>
                                <strong>Date:</strong>{" "}
                                {new Date(marker.data.date).toLocaleDateString()}
                            </p>
                            <p>
                                <strong>Time:</strong> {marker.data.time}
                            </p>
                            <p>
                                <strong>Battery Voltage:</strong>{" "}
                                {marker.data.batteryVoltage}
                            </p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </>
    );
};

// 4) SIDEBAR / MENU
const HistorySidebar = ({
    isOpen,
    onClose,
    locationHistory,
    onSelectPoint,
}) => {
    // We want to list from latest to earliest
    const reversed = [...locationHistory].reverse();

    return (
        <div
            className={`fixed top-0 left-0 h-full w-64 bg-gray-900 bg-opacity-95 text-white transform ${
                isOpen ? "translate-x-0" : "-translate-x-full"
            } transition-transform duration-300 z-50`}
        >
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-bold">Location History</h2>
                <button
                    onClick={onClose}
                    className="text-gray-300 hover:text-white"
                >
                    ✕
                </button>
            </div>
            <div className="p-4 overflow-y-auto h-full">
                {reversed.map((loc, idx) => {
                    const actualIndex = locationHistory.length - 1 - idx;
                    return (
                        <div
                            key={actualIndex}
                            className="mb-3 p-2 bg-gray-700 hover:bg-gray-600 rounded cursor-pointer"
                            onClick={() => onSelectPoint(actualIndex)}
                        >
                            <p className="text-sm">
                                <strong>Lat:</strong> {loc.latitude.toFixed(5)}
                            </p>
                            <p className="text-sm">
                                <strong>Long:</strong>{" "}
                                {loc.longitude.toFixed(5)}
                            </p>
                            <p className="text-sm">
                                <strong>Date:</strong>{" "}
                                {new Date(loc.date).toLocaleDateString()}
                            </p>
                            <p className="text-sm">
                                <strong>Time:</strong> {loc.time}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// 5) MAIN MAP COMPONENT
const LocationHistoryMap = ({
    locationHistory = [],
    mode,
    currentIndex,
    nextIndex,
    handleMarkerClick,
}) => {
    // Set map center to first record or default to [0, 0]
    const center =
        locationHistory.length > 0
            ? [locationHistory[0].latitude, locationHistory[0].longitude]
            : [0, 0];

    return (
        <MapContainer
            center={center}
            zoom={13}
            style={{ height: "100vh", width: "100vw" }}
            className="z-0"
        >
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">
          OpenStreetMap
        </a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {mode === "history" ? (
                <ClusterMarkers points={locationHistory} />
            ) : (
                <PlaybackMarkers
                    locationHistory={locationHistory}
                    currentIndex={currentIndex}
                    nextIndex={nextIndex}
                    onMarkerClick={handleMarkerClick}
                />
            )}
        </MapContainer>
    );
};

// 6) ERROR BOUNDARY
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

// 7) MAIN PAGE COMPONENT
const LocationHistory = () => {
    const { deviceId } = useParams();
    const dispatch = useDispatch();
    const { currentDevice, loading, error } = useSelector(
        (state) => state.device
    );

    // Manage which mode we are in: "history" or "playback"
    const [mode, setMode] = useState("history");

    // For playback
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Fetch location history
    useEffect(() => {
        dispatch(fetchLocationHistory(deviceId));
    }, [dispatch, deviceId]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    const locationHistory = currentDevice?.locationHistory || [];

    // Next index is simply currentIndex + 1 if available
    const nextIndex =
        currentIndex + 1 < locationHistory.length ? currentIndex + 1 : -1;

    // Handler for the "Next" button in playback mode
    const handleNext = () => {
        if (nextIndex !== -1) {
            setCurrentIndex(nextIndex);
        }
    };

    // Handler when user picks a point from the sidebar
    const handleSelectPoint = (index) => {
        setCurrentIndex(index);
        setSidebarOpen(false); // close the sidebar
        setMode("playback"); // ensure we are in playback mode
    };

    // Optional: show a popup or console log on marker click
    const handleMarkerClick = (data) => {
        console.log("Marker clicked:", data);
    };

    return (
        <ErrorBoundary>
            {/* Overlay container */}
            <div className="relative w-full h-screen overflow-hidden">
                {/* SIDEBAR */}
                <HistorySidebar
                    isOpen={sidebarOpen}
                    onClose={() => setSidebarOpen(false)}
                    locationHistory={locationHistory}
                    onSelectPoint={handleSelectPoint}
                />

                {/* TOP BAR WITH BUTTONS */}
                <div className="absolute top-0 left-0 w-full z-40 p-4 flex items-center justify-between bg-transparent text-white">
                    <div className="flex items-center space-x-4">
                        {/* Menu Icon */}
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="bg-gray-700 px-3 py-2 rounded hover:bg-gray-600 ml-10"
                        >
                            ☰
                        </button>

                        {/* Mode Buttons */}
                        <button
                            onClick={() => setMode("history")}
                            className={`px-4 py-2 rounded ${
                                mode === "history"
                                    ? "bg-blue-600"
                                    : "bg-gray-700"
                            } hover:bg-blue-500`}
                        >
                            History
                        </button>
                        <button
                            onClick={() => setMode("playback")}
                            className={`px-4 py-2 rounded ${
                                mode === "playback"
                                    ? "bg-blue-600"
                                    : "bg-gray-700"
                            } hover:bg-blue-500`}
                        >
                            Playback
                        </button>
                    </div>

                    {/* "Next" Button for Playback */}
                    {mode === "playback" && (
                        <button
                            onClick={handleNext}
                            className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded"
                        >
                            Next
                        </button>
                    )}
                </div>

                {/* MAP */}
                <LocationHistoryMap
                    locationHistory={locationHistory}
                    mode={mode}
                    currentIndex={currentIndex}
                    nextIndex={nextIndex}
                    handleMarkerClick={handleMarkerClick}
                />
            </div>
        </ErrorBoundary>
    );
};

export default LocationHistory;
