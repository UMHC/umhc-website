'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { parseGpx } from '@/lib/gpxParser'; // We might need a client-side version of this or import logic
import { DOMParser } from '@xmldom/xmldom'; // or just use browser DOMParser
// Actually default browser DOMParser is available on window

interface MapProps {
    gpxUrl?: string;
    meetingLocation?: { lat?: number, lon?: number, name: string };
    interactive?: boolean;
}

// Helper to convert GPX to GeoJSON for Mapbox
// Since we don't have 'togeojson' available on client easily without bundling issues sometimes, 
// we'll fetch the GPX and parse it manually into coordinates for a LineString.

export default function HikeMap({ gpxUrl, meetingLocation, interactive = true }: MapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!mapContainer.current) return;

        const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        if (!accessToken) {
            setError("Mapbox access token missing");
            return;
        }

        mapboxgl.accessToken = accessToken;

        if (map.current) return; // initialize map only once

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/outdoors-v12', // Good for hiking
            center: [-1.5, 54.0], // UK center approx
            zoom: 5,
            interactive: interactive
        });

        map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

        const loadData = async () => {
            if (!map.current) return;

            // Add meeting location marker
            if (meetingLocation && meetingLocation.lat && meetingLocation.lon) {
                new mapboxgl.Marker({ color: '#2C5E2E' }) // UMHC Green
                    .setLngLat([meetingLocation.lon, meetingLocation.lat])
                    .setPopup(new mapboxgl.Popup().setHTML(`<h3>${meetingLocation.name}</h3>`))
                    .addTo(map.current);

                // If no GPX, center on meeting location
                if (!gpxUrl) {
                    map.current.flyTo({ center: [meetingLocation.lon, meetingLocation.lat], zoom: 12 });
                }
            }

            if (gpxUrl) {
                try {
                    const response = await fetch(gpxUrl);
                    const gpxText = await response.text();

                    // Parse GPX XML
                    const parser = new window.DOMParser();
                    const xmlDoc = parser.parseFromString(gpxText, "text/xml");
                    const trkpts = xmlDoc.getElementsByTagName("trkpt");

                    const coordinates: [number, number][] = [];
                    for (let i = 0; i < trkpts.length; i++) {
                        const lat = parseFloat(trkpts[i].getAttribute("lat")!);
                        const lon = parseFloat(trkpts[i].getAttribute("lon")!);
                        coordinates.push([lon, lat]);
                    }

                    if (coordinates.length > 0) {
                        map.current.on('load', () => {
                            if (!map.current) return;

                            map.current.addSource('route', {
                                'type': 'geojson',
                                'data': {
                                    'type': 'Feature',
                                    'properties': {},
                                    'geometry': {
                                        'type': 'LineString',
                                        'coordinates': coordinates
                                    }
                                }
                            });

                            map.current.addLayer({
                                'id': 'route',
                                'type': 'line',
                                'source': 'route',
                                'layout': {
                                    'line-join': 'round',
                                    'line-cap': 'round'
                                },
                                'paint': {
                                    'line-color': '#e11d48', // Red route
                                    'line-width': 4
                                }
                            });

                            // Fit bounds
                            const bounds = new mapboxgl.LngLatBounds(
                                coordinates[0],
                                coordinates[0]
                            );

                            for (const coord of coordinates) {
                                bounds.extend(coord as [number, number]);
                            }

                            map.current.fitBounds(bounds, {
                                padding: 50
                            });
                        });
                        // If map already loaded (rare race condition handled by 'load' check or just checking isStyleLoaded)
                        if (map.current.isStyleLoaded()) {
                            // Add immediately
                            map.current.addSource('route', {
                                'type': 'geojson',
                                'data': {
                                    'type': 'Feature',
                                    'properties': {},
                                    'geometry': {
                                        'type': 'LineString',
                                        'coordinates': coordinates
                                    }
                                }
                            });
                            map.current.addLayer({
                                'id': 'route',
                                'type': 'line',
                                'source': 'route',
                                'layout': {
                                    'line-join': 'round',
                                    'line-cap': 'round'
                                },
                                'paint': {
                                    'line-color': '#e11d48',
                                    'line-width': 4
                                }
                            });
                            const bounds = new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]);
                            coordinates.forEach(coord => bounds.extend(coord as [number, number]));
                            map.current.fitBounds(bounds, { padding: 50 });
                        }
                    }

                } catch (err) {
                    console.error("Error loading GPX:", err);
                    setError("Failed to load map route");
                }
            }
        };

        loadData();

        return () => {
            if (map.current) map.current.remove();
            map.current = null;
        };
    }, [gpxUrl, meetingLocation, interactive]);

    if (error) return <div className="bg-gray-100 p-4 text-red-500 rounded">{error}</div>;

    return <div ref={mapContainer} className="w-full h-full rounded-lg" />;
}
