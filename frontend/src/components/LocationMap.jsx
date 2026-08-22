import { useEffect } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const DEFAULT_CENTER = [9.56, 44.065];

function Recenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, map.getZoom(), { duration: 0.6 });
  }, [center, map]);
  return null;
}

function ClickPicker({ onSelect }) {
  useMapEvents({ click: ({ latlng }) => onSelect?.({ latitude: latlng.lat, longitude: latlng.lng }) });
  return null;
}

export default function LocationMap({ center, markers = [], onSelect, height = 320 }) {
  const mapCenter = center || (markers[0] ? [markers[0].latitude, markers[0].longitude] : DEFAULT_CENTER);
  return (
    <MapContainer center={mapCenter} zoom={13} scrollWheelZoom style={{ height, width: '100%', borderRadius: 12 }}>
      <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Recenter center={center} />
      {onSelect && <ClickPicker onSelect={onSelect} />}
      {markers.map((marker) => (
        <CircleMarker
          key={marker.id}
          center={[marker.latitude, marker.longitude]}
          radius={marker.isUser ? 9 : marker.isNearest || marker.isCheapest ? 11 : 8}
          pathOptions={{
            color: marker.isUser ? '#2563eb' : marker.isNearest ? '#0d9488' : marker.isCheapest ? '#d97706' : '#475569',
            fillOpacity: 0.9,
            weight: 3,
          }}
        >
          <Popup><strong>{marker.label}</strong>{marker.detail && <><br />{marker.detail}</>}</Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
