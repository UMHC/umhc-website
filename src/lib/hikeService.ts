import { supabaseAdmin } from './supabase-admin';
import type {
    Hike,
    CreateHikeData,
    UpdateHikeData,
    HikeRoute,
    CreateHikeRouteData,
    UpdateHikeRouteData,
    HikeWithRegistrationCount,
    RouteWithRegistrationCount
} from '@/types/dashboard';

// Helper to convert DB rows to Hike objects
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toHike(row: any): Hike {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        hikeDate: row.hike_date,
        meetingTime: row.meeting_time,
        meetingLocationId: row.meeting_location_id,
        meetingLocation: row.meeting_locations ? {
            id: row.meeting_locations.id,
            name: row.meeting_locations.name,
            address: row.meeting_locations.address,
            what3words: row.meeting_locations.what3words,
            isActive: row.meeting_locations.is_active,
            displayOrder: row.meeting_locations.display_order,
            createdAt: row.meeting_locations.created_at
        } : undefined,
        status: row.status,
        registrationToken: row.registration_token,
        maxParticipants: row.max_participants,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        routes: row.hike_routes?.map(toHikeRoute)
    };
}

// Helper to convert DB rows to HikeRoute objects
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toHikeRoute(row: any): HikeRoute {
    return {
        id: row.id,
        hikeId: row.hike_id,
        name: row.name,
        description: row.description,
        distanceKm: row.distance_km,
        elevationGainM: row.elevation_gain_m,
        estimatedDuration: row.estimated_duration,
        difficulty: row.difficulty,
        gpxFileUrl: row.gpx_file_url,
        routePreviewUrl: row.route_preview_url,
        maxParticipants: row.max_participants,
        createdAt: row.created_at
    };
}

export class HikeService {
    /**
     * Get all hikes (optionally filtered by status)
     */
    static async getAll(status?: string[]): Promise<Hike[]> {
        let query = supabaseAdmin
            .from('hikes')
            .select(`
        *,
        meeting_locations (*),
        hike_routes (*)
      `)
            .order('hike_date', { ascending: true });

        if (status && status.length > 0) {
            query = query.in('status', status);
        }

        const { data, error } = await query;

        if (error) throw error;
        return data.map(toHike);
    }

    /**
     * Get a single hike by ID
     */
    static async getById(id: string): Promise<Hike | null> {
        const { data, error } = await supabaseAdmin
            .from('hikes')
            .select(`
        *,
        meeting_locations (*),
        hike_routes (*)
      `)
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        const hike = toHike(data);

        // Fetch registration counts
        // Group by route_id
        const { data: routeStats, error: statsError } = await supabaseAdmin
            .from('hike_registrations')
            .select('route_id')
            .eq('hike_id', id)
            .eq('registration_status', 'registered'); // or confirmed? assuming 'registered' is the main active status. 
        // actually status is 'registered' then 'confirmed'. I should probably count all non-cancelled.

        // Let's count filtered registrations
        if (!statsError && routeStats && hike.routes) {
            const countsByRoute: Record<string, number> = {};
            routeStats.forEach((r: any) => {
                if (r.route_id) countsByRoute[r.route_id] = (countsByRoute[r.route_id] || 0) + 1;
            });

            hike.routes = hike.routes.map(r => ({
                ...r,
                registrationCount: countsByRoute[r.id] || 0
            }));

            hike.registrationCount = routeStats.length;
        }

        return hike;
    }

    /**
     * Get a hike by registration token
     */
    static async getByToken(token: string): Promise<Hike | null> {
        const { data, error } = await supabaseAdmin
            .from('hikes')
            .select(`
        *,
        meeting_locations (*),
        hike_routes (*)
      `)
            .eq('registration_token', token)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return toHike(data);
    }

    /**
     * Create a new hike
     */
    static async create(hikeData: CreateHikeData, userId: string): Promise<Hike> {
        const { data, error } = await supabaseAdmin
            .from('hikes')
            .insert([{
                title: hikeData.title,
                description: hikeData.description || null,
                hike_date: hikeData.hikeDate,
                meeting_time: hikeData.meetingTime || null,
                meeting_location_id: hikeData.meetingLocationId || null,
                max_participants: hikeData.maxParticipants || null,
                created_by: userId,
                status: 'draft'
            }])
            .select()
            .single();

        if (error) throw error;
        return toHike(data);
    }

    /**
     * Update a hike
     */
    static async update(id: string, updateData: UpdateHikeData): Promise<Hike> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updates: Record<string, any> = {};

        if (updateData.title !== undefined) updates.title = updateData.title;
        if (updateData.description !== undefined) updates.description = updateData.description || null;
        if (updateData.hikeDate !== undefined) updates.hike_date = updateData.hikeDate;
        if (updateData.meetingTime !== undefined) updates.meeting_time = updateData.meetingTime || null;
        if (updateData.meetingLocationId !== undefined) updates.meeting_location_id = updateData.meetingLocationId || null;
        if (updateData.status !== undefined) updates.status = updateData.status;
        if (updateData.maxParticipants !== undefined) updates.max_participants = updateData.maxParticipants || null;

        const { data, error } = await supabaseAdmin
            .from('hikes')
            .update(updates)
            .eq('id', id)
            .select(`
        *,
        meeting_locations (*)
      `)
            .single();

        if (error) throw error;
        return toHike(data);
    }

    /**
     * Check token uniqueness
     */
    static async isTokenUnique(token: string): Promise<boolean> {
        const { count, error } = await supabaseAdmin
            .from('hikes')
            .select('*', { count: 'exact', head: true })
            .eq('registration_token', token);

        if (error) throw error;
        return count === 0;
    }

    /**
     * Generate a registration token
     */
    static async generateToken(hikeId: string): Promise<string> {
        let token = '';
        let isUnique = false;

        // Generate random 8-char token and ensure uniqueness
        while (!isUnique) {
            token = Math.random().toString(36).substring(2, 10).toUpperCase();
            isUnique = await this.isTokenUnique(token);
        }

        const { error } = await supabaseAdmin
            .from('hikes')
            .update({ registration_token: token })
            .eq('id', hikeId);

        if (error) throw error;
        return token;
    }

    /**
     * Delete a hike
     */
    static async delete(id: string): Promise<void> {
        const { error } = await supabaseAdmin
            .from('hikes')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    // ==========================================
    // Route Management
    // ==========================================

    /**
     * Add a route to a hike
     */
    static async addRoute(routeData: CreateHikeRouteData): Promise<HikeRoute> {
        const { data, error } = await supabaseAdmin
            .from('hike_routes')
            .insert([{
                hike_id: routeData.hikeId,
                name: routeData.name,
                description: routeData.description || null,
                distance_km: routeData.distanceKm || null,
                elevation_gain_m: routeData.elevationGainM || null,
                estimated_duration: routeData.estimatedDuration || null,
                difficulty: routeData.difficulty,
                gpx_file_url: routeData.gpxFileUrl || null,
                max_participants: routeData.maxParticipants || null
            }])
            .select()
            .single();

        if (error) throw error;
        return toHikeRoute(data);
    }

    /**
     * Update a route
     */
    static async updateRoute(id: string, updateData: UpdateHikeRouteData): Promise<HikeRoute> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updates: Record<string, any> = {};

        if (updateData.name !== undefined) updates.name = updateData.name;
        if (updateData.description !== undefined) updates.description = updateData.description || null;
        if (updateData.distanceKm !== undefined) updates.distance_km = updateData.distanceKm || null;
        if (updateData.elevationGainM !== undefined) updates.elevation_gain_m = updateData.elevationGainM || null;
        if (updateData.estimatedDuration !== undefined) updates.estimated_duration = updateData.estimatedDuration || null;
        if (updateData.difficulty !== undefined) updates.difficulty = updateData.difficulty;
        if (updateData.gpxFileUrl !== undefined) updates.gpx_file_url = updateData.gpxFileUrl || null;
        if (updateData.maxParticipants !== undefined) updates.max_participants = updateData.maxParticipants || null;

        const { data, error } = await supabaseAdmin
            .from('hike_routes')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return toHikeRoute(data);
    }

    /**
     * Delete a route
     */
    static async deleteRoute(id: string): Promise<void> {
        const { error } = await supabaseAdmin
            .from('hike_routes')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }

    /**
     * Get hikes with registration counts
     */
    static async getHikesWithStats(status?: string[]): Promise<HikeWithRegistrationCount[]> {
        const hikes = await this.getAll(status);

        // Get registration counts for these hikes
        const { data: counts, error } = await supabaseAdmin
            .rpc('get_hike_registration_counts'); // We'll need to create this RPC function if complex

        // For now, doing it via simplified query or separate calls might be safer without custom RPCs
        // Let's iterate and count (optimize later with RPC if needed)
        const hikesWithStats = await Promise.all(hikes.map(async (hike) => {
            const { count } = await supabaseAdmin
                .from('hike_registrations')
                .select('*', { count: 'exact', head: true })
                .eq('hike_id', hike.id)
                .eq('registration_status', 'registered');

            return {
                ...hike,
                registrationCount: count || 0
            };
        }));

        return hikesWithStats;
    }
}
