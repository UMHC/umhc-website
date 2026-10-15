import { supabaseAdmin } from './supabase-admin';

export interface MemberProfile {
    id: string;
    kindeUserId: string;
    email: string;
    fullName: string;
    phoneNumber?: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    dietaryRequirements?: string;
    healthConditions?: string;
    createdAt: string;
    updatedAt: string;
}

export type CreateMemberProfileData = Omit<MemberProfile, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateMemberProfileData = Partial<Omit<MemberProfile, 'id' | 'kindeUserId' | 'email' | 'createdAt' | 'updatedAt'>>;

export class MemberProfileService {
    /**
     * Get a member profile by Kinde User ID
     */
    static async getByKindeUserId(kindeUserId: string): Promise<MemberProfile | null> {
        const { data, error } = await supabaseAdmin
            .from('member_profiles')
            .select('*')
            .eq('kinde_user_id', kindeUserId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }

        return this.transformProfile(data);
    }

    /**
     * Create a new member profile
     */
    static async createProfile(profileData: CreateMemberProfileData): Promise<MemberProfile> {
        const { data, error } = await supabaseAdmin
            .from('member_profiles')
            .insert({
                kinde_user_id: profileData.kindeUserId,
                email: profileData.email,
                full_name: profileData.fullName,
                phone_number: profileData.phoneNumber,
                emergency_contact_name: profileData.emergencyContactName,
                emergency_contact_phone: profileData.emergencyContactPhone,
                dietary_requirements: profileData.dietaryRequirements,
                health_conditions: profileData.healthConditions
            })
            .select()
            .single();

        if (error) throw error;

        return this.transformProfile(data);
    }



    /**
     * Upsert a member profile (create or update)
     */
    static async upsert(profileData: CreateMemberProfileData): Promise<MemberProfile> {
        const { data, error } = await supabaseAdmin
            .from('member_profiles')
            .upsert({
                kinde_user_id: profileData.kindeUserId,
                email: profileData.email,
                full_name: profileData.fullName,
                phone_number: profileData.phoneNumber,
                emergency_contact_name: profileData.emergencyContactName,
                emergency_contact_phone: profileData.emergencyContactPhone,
                dietary_requirements: profileData.dietaryRequirements,
                health_conditions: profileData.healthConditions,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'kinde_user_id'
            })
            .select()
            .single();

        if (error) throw error;

        return this.transformProfile(data);
    }

    /**
     * Update an existing member profile
     */
    static async updateProfile(kindeUserId: string, updates: UpdateMemberProfileData): Promise<MemberProfile> {
        const { data, error } = await supabaseAdmin
            .from('member_profiles')
            .update({
                full_name: updates.fullName,
                phone_number: updates.phoneNumber,
                emergency_contact_name: updates.emergencyContactName,
                emergency_contact_phone: updates.emergencyContactPhone,
                dietary_requirements: updates.dietaryRequirements,
                health_conditions: updates.healthConditions,
                updated_at: new Date().toISOString()
            })
            .eq('kinde_user_id', kindeUserId)
            .select()
            .single();

        if (error) throw error;

        return this.transformProfile(data);
    }

    /**
     * Helper to transform DB casing to camelCase
     */
    private static transformProfile(dbProfile: any): MemberProfile {
        return {
            id: dbProfile.id,
            kindeUserId: dbProfile.kinde_user_id,
            email: dbProfile.email,
            fullName: dbProfile.full_name,
            phoneNumber: dbProfile.phone_number,
            emergencyContactName: dbProfile.emergency_contact_name,
            emergencyContactPhone: dbProfile.emergency_contact_phone,
            dietaryRequirements: dbProfile.dietary_requirements,
            healthConditions: dbProfile.health_conditions,
            createdAt: dbProfile.created_at,
            updatedAt: dbProfile.updated_at
        };
    }
}
