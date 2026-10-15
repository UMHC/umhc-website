import { supabaseAdmin } from './supabase-admin';
import type {
    HikeRegistration,
    CreateRegistrationData,
    UpdateRegistrationData,
    RegistrationStatus
} from '@/types/dashboard';

// Helper to convert DB rows to HikeRegistration objects
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toRegistration(row: any): HikeRegistration {
    return {
        id: row.id,
        hikeId: row.hike_id,
        routeId: row.route_id,
        memberId: row.member_id,
        memberProfile: row.member_profiles ? {
            id: row.member_profiles.id,
            kindeUserId: row.member_profiles.kinde_user_id,
            email: row.member_profiles.email,
            fullName: row.member_profiles.full_name,
            phoneNumber: row.member_profiles.phone_number,
            emergencyContactName: row.member_profiles.emergency_contact_name,
            emergencyContactPhone: row.member_profiles.emergency_contact_phone,
            dietaryRequirements: row.member_profiles.dietary_requirements,
            healthConditions: row.member_profiles.health_conditions,
            createdAt: row.member_profiles.created_at,
            updatedAt: row.member_profiles.updated_at
        } : undefined,
        route: row.hike_routes ? {
            id: row.hike_routes.id,
            hikeId: row.hike_routes.hike_id,
            name: row.hike_routes.name,
            description: row.hike_routes.description,
            distanceKm: row.hike_routes.distance_km,
            elevationGainM: row.hike_routes.elevation_gain_m,
            estimatedDuration: row.hike_routes.estimated_duration,
            difficulty: row.hike_routes.difficulty,
            gpxFileUrl: row.hike_routes.gpx_file_url,
            routePreviewUrl: row.hike_routes.route_preview_url,
            maxParticipants: row.hike_routes.max_participants,
            createdAt: row.hike_routes.created_at
        } : undefined,
        registrationStatus: row.registration_status,
        coachCheckin: row.coach_checkin,
        notes: row.notes,
        leaderNotes: row.leader_notes,
        registeredAt: row.registered_at,
        updatedAt: row.updated_at
    };
}

export class RegistrationService {
    /**
     * Check if member is already registered for a hike
     */
    static async getRegistration(hikeId: string, memberId: string): Promise<HikeRegistration | null> {
        const { data, error } = await supabaseAdmin
            .from('hike_registrations')
            .select(`
        *,
        member_profiles (*),
        hike_routes (*)
      `)
            .eq('hike_id', hikeId)
            .eq('member_id', memberId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null;
            throw error;
        }

        return toRegistration(data);
    }

    /**
     * Get all registrations for a member
     */
    static async getMemberRegistrations(memberId: string): Promise<HikeRegistration[]> {
        const { data, error } = await supabaseAdmin
            .from('hike_registrations')
            .select(`
        *,
        member_profiles (*),
        hike_routes (*)
      `)
            .eq('member_id', memberId)
            .order('registered_at', { ascending: false });

        if (error) throw error;
        return data.map(toRegistration);
    }

    /**
     * Get all registrations for a hike (for hike leaders)
     */
    static async getHikeRegistrations(hikeId: string): Promise<HikeRegistration[]> {
        const { data, error } = await supabaseAdmin
            .from('hike_registrations')
            .select(`
        *,
        member_profiles (*),
        hike_routes (*)
      `)
            .eq('hike_id', hikeId)
            .order('registered_at', { ascending: true });

        if (error) throw error;
        return data.map(toRegistration);
    }

    /**
     * Register a member for a hike
     */
    static async register(memberId: string, data: CreateRegistrationData): Promise<HikeRegistration> {
        // 1. Check if already registered
        const existing = await this.getRegistration(data.hikeId, memberId);
        if (existing) {
            throw new Error('Member already registered for this hike');
        }

        // 2. Check capacity (optional logic here, or assume UI checks it)
        // We could check max_participants on hike and route here

        // 3. Create registration
        const { data: newReg, error } = await supabaseAdmin
            .from('hike_registrations')
            .insert([{
                hike_id: data.hikeId,
                route_id: data.routeId,
                member_id: memberId,
                notes: data.notes || null,
                registration_status: 'registered'
            }])
            .select()
            .single();

        if (error) throw error;

        // Return full object with relations
        return (await this.getRegistration(data.hikeId, memberId))!;
    }

    /**
     * Update a registration
     */
    static async update(
        hikeId: string,
        memberId: string,
        updateData: UpdateRegistrationData
    ): Promise<HikeRegistration> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updates: Record<string, any> = {};

        if (updateData.routeId !== undefined) updates.route_id = updateData.routeId;
        if (updateData.registrationStatus !== undefined) updates.registration_status = updateData.registrationStatus;
        if (updateData.coachCheckin !== undefined) updates.coach_checkin = updateData.coachCheckin;
        if (updateData.notes !== undefined) updates.notes = updateData.notes || null;
        if (updateData.leaderNotes !== undefined) updates.leader_notes = updateData.leaderNotes || null;

        const { error } = await supabaseAdmin
            .from('hike_registrations')
            .update(updates)
            .eq('hike_id', hikeId)
            .eq('member_id', memberId);

        if (error) throw error;

        return (await this.getRegistration(hikeId, memberId))!;
    }

    /**
     * Cancel a registration
     */
    static async cancel(hikeId: string, memberId: string): Promise<void> {
        const { error } = await supabaseAdmin
            .from('hike_registrations')
            .update({ registration_status: 'cancelled' })
            .eq('hike_id', hikeId)
            .eq('member_id', memberId);

        if (error) throw error;
    }
}
