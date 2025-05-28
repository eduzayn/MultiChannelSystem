import React, { useEffect, useRef } from 'react';
import { DashboardWidget } from '@/types/dashboard';
import { WidgetHeader } from './WidgetHeader';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapWidgetProps {
  widget: DashboardWidget;
  isEditing?: boolean;
  onRefresh?: () => void;
}

interface MapConfig {
  center?: [number, number];
  zoom?: number;
  style?: string;
  markers?: Array<{
    position: [number, number];
    label?: string;
    color?: string;
  }>;
  regions?: Array<{
    coordinates: Array<[number, number]>;
    color?: string;
    label?: string;
  }>;
}

interface MapData {
  points?: Array<{
    lat: number;
    lng: number;
    value?: number;
    color?: string;
    label?: string;
  }>;
}

export const MapWidget: React.FC<MapWidgetProps> = ({
  widget,
  isEditing,
  onRefresh
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const { mapConfig = {} as MapConfig } = widget.configuration;
  const data = widget.data as MapData || {};

  useEffect(() => {
    if (!mapRef.current) return;

    // Inicializa o mapa se ainda não existir
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        mapConfig.center || [-14.235, -51.925], // Centro do Brasil como padrão
        mapConfig.zoom || 4
      );

      // Adiciona o tile layer (mapa base)
      L.tileLayer(
        mapConfig.style || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '© OpenStreetMap contributors'
        }
      ).addTo(mapInstanceRef.current);
    }

    // Limpa marcadores e regiões existentes
    mapInstanceRef.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Polygon) {
        layer.remove();
      }
    });

    // Adiciona novos marcadores
    if (mapConfig.markers) {
      mapConfig.markers.forEach(marker => {
        L.marker(marker.position)
          .bindTooltip(marker.label || '')
          .setIcon(
            L.divIcon({
              className: 'bg-blue-500 rounded-full w-3 h-3',
              iconSize: [12, 12],
              iconAnchor: [6, 6]
            })
          )
          .addTo(mapInstanceRef.current!);
      });
    }

    // Adiciona regiões (polígonos)
    if (mapConfig.regions) {
      mapConfig.regions.forEach(region => {
        L.polygon(region.coordinates, {
          color: region.color || '#3b82f6',
          fillOpacity: 0.2,
          weight: 2
        })
          .bindTooltip(region.label || '')
          .addTo(mapInstanceRef.current!);
      });
    }

    // Adiciona dados dinâmicos (exemplo: heat points)
    if (data.points) {
      data.points.forEach(point => {
        L.circleMarker([point.lat, point.lng], {
          radius: point.value || 5,
          color: point.color || '#3b82f6',
          fillOpacity: 0.6
        })
          .bindTooltip(point.label || '')
          .addTo(mapInstanceRef.current!);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [widget, mapConfig, data]);

  return (
    <div className="h-full w-full p-4">
      <WidgetHeader
        title={widget.title}
        isEditing={isEditing}
        onRefresh={onRefresh}
      />
      <div className="h-[calc(100%-40px)] relative">
        <div ref={mapRef} className="absolute inset-0" />
      </div>
    </div>
  );
}; 