import { parseStringPromise } from 'xml2js';
import type { GPXStats, GPXPoint } from '@/types/dashboard';

/**
 * Calculate distance between two points in km using Haversine formula
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}

/**
 * Parse GPX XML string and return stats
 */
export async function parseGpx(gpxContent: string): Promise<GPXStats> {
    const result = await parseStringPromise(gpxContent);

    const points: GPXPoint[] = [];

    // Navigate XML structure to find track points
    // Typical structure: gpx -> trk -> trkseg -> trkpt
    try {
        const trk = result.gpx.trk[0];
        const trkseg = trk.trkseg[0];

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        trkseg.trkpt.forEach((pt: any) => {
            points.push({
                lat: parseFloat(pt.$.lat),
                lon: parseFloat(pt.$.lon),
                elevation: pt.ele ? parseFloat(pt.ele[0]) : 0
            });
        });
    } catch (err) {
        console.error('Error parsing GPX structure:', err);
        throw new Error('Invalid GPX file format');
    }

    // Calculate statistics
    let distanceKm = 0;
    let elevationGainM = 0;
    let elevationLossM = 0;
    let minElevationM = points[0]?.elevation || 0;
    let maxElevationM = points[0]?.elevation || 0;

    for (let i = 0; i < points.length - 1; i++) {
        const p1 = points[i];
        const p2 = points[i + 1];

        // Distance
        distanceKm += calculateDistance(p1.lat, p1.lon, p2.lat, p2.lon);

        // Elevation
        if (p1.elevation !== undefined && p2.elevation !== undefined) {
            const diff = p2.elevation - p1.elevation;
            if (diff > 0) {
                elevationGainM += diff;
            } else {
                elevationLossM += Math.abs(diff);
            }

            minElevationM = Math.min(minElevationM, p2.elevation);
            maxElevationM = Math.max(maxElevationM, p2.elevation);
        }
    }

    return {
        distanceKm: Math.round(distanceKm * 100) / 100, // Round to 2 decimal places
        elevationGainM: Math.round(elevationGainM),
        elevationLossM: Math.round(elevationLossM),
        minElevationM: Math.round(minElevationM),
        maxElevationM: Math.round(maxElevationM),
        points
    };
}
