// Dashboard and Hike Registration System Types

// ============================================
// Meeting Locations
// ============================================

export interface MeetingLocation {
  id: string;
  name: string;
  address?: string;
  what3words?: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
}

export interface CreateMeetingLocationData {
  name: string;
  address?: string;
  what3words?: string;
  displayOrder?: number;
}

// ============================================
// Member Profiles
// ============================================

export interface MemberProfile {
  id: string;
  kindeUserId: string;
  email: string;
  fullName: string;
  phoneNumber?: string;  // E.164 international format
  emergencyContactName: string;
  emergencyContactPhone: string;  // E.164 international format
  dietaryRequirements?: string;
  healthConditions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMemberProfileData {
  kindeUserId: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  dietaryRequirements?: string;
  healthConditions?: string;
}

export interface UpdateMemberProfileData {
  fullName?: string;
  phoneNumber?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  dietaryRequirements?: string;
  healthConditions?: string;
}

// ============================================
// Hikes
// ============================================

export type HikeStatus = 'draft' | 'ready' | 'open' | 'closed';

export interface Hike {
  id: string;
  title: string;
  description?: string;
  hikeDate: string;
  meetingTime?: string;
  meetingLocationId?: string;
  meetingLocation?: MeetingLocation;
  status: HikeStatus;
  registrationToken?: string;
  maxParticipants?: number;
  registrationCount?: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  routes?: HikeRoute[];
}

export interface CreateHikeData {
  title: string;
  description?: string;
  hikeDate: string;
  meetingTime?: string;
  meetingLocationId?: string;
  maxParticipants?: number;
}

export interface UpdateHikeData {
  title?: string;
  description?: string;
  hikeDate?: string;
  meetingTime?: string;
  meetingLocationId?: string;
  status?: HikeStatus;
  maxParticipants?: number;
}

// ============================================
// Hike Routes
// ============================================

export type RouteDifficulty = 'easy' | 'moderate' | 'challenging' | 'difficult';

export interface HikeRoute {
  id: string;
  hikeId: string;
  name: string;
  description?: string;
  distanceKm?: number;
  elevationGainM?: number;
  estimatedDuration?: string;
  difficulty: RouteDifficulty;
  gpxFileUrl?: string;
  routePreviewUrl?: string;
  maxParticipants?: number;
  registrationCount?: number;
  createdAt: string;
}

export interface CreateHikeRouteData {
  hikeId: string;
  name: string;
  description?: string;
  distanceKm?: number;
  elevationGainM?: number;
  estimatedDuration?: string;
  difficulty: RouteDifficulty;
  gpxFileUrl?: string;
  maxParticipants?: number;
}

export interface UpdateHikeRouteData {
  name?: string;
  description?: string;
  distanceKm?: number;
  elevationGainM?: number;
  estimatedDuration?: string;
  difficulty?: RouteDifficulty;
  gpxFileUrl?: string;
  maxParticipants?: number;
}

// ============================================
// Hike Registrations
// ============================================

export type RegistrationStatus = 'registered' | 'confirmed' | 'cancelled' | 'no_show';

export interface HikeRegistration {
  id: string;
  hikeId: string;
  routeId?: string;
  memberId: string;
  memberProfile?: MemberProfile;
  route?: HikeRoute;
  registrationStatus: RegistrationStatus;
  coachCheckin: boolean;
  notes?: string;
  leaderNotes?: string;
  registeredAt: string;
  updatedAt: string;
}

export interface CreateRegistrationData {
  hikeId: string;
  routeId: string;
  notes?: string;
}

export interface UpdateRegistrationData {
  routeId?: string;
  registrationStatus?: RegistrationStatus;
  coachCheckin?: boolean;
  notes?: string;
  leaderNotes?: string;
}

// ============================================
// GPX Data
// ============================================

export interface GPXPoint {
  lat: number;
  lon: number;
  elevation?: number;
}

export interface GPXStats {
  distanceKm: number;
  elevationGainM: number;
  elevationLossM: number;
  minElevationM: number;
  maxElevationM: number;
  points: GPXPoint[];
}

// ============================================
// Dashboard UI Types
// ============================================

export interface DashboardUser {
  id: string;
  email: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  isCommittee: boolean;
  isHikeManager: boolean;
  isTreasurer: boolean;
}

export interface HikeWithRegistrationCount extends Hike {
  registrationCount: number;
}

export interface RouteWithRegistrationCount extends HikeRoute {
  registrationCount: number;
}
