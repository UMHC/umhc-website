import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { NextResponse } from "next/server";
import { hasFinancePermission } from "@/lib/permissions";

export async function POST() {
  try {
    const { getUser, getAccessToken, isAuthenticated, getRoles } = getKindeServerSession();
    
    if (!isAuthenticated()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await getUser();
    const accessToken = await getAccessToken();
    const roles = await getRoles();

    if (!user || !accessToken) {
      return NextResponse.json({ error: "User or token not found" }, { status: 401 });
    }

    // Verify user has committee or treasurer permissions
    if (!hasFinancePermission(roles)) {
      return NextResponse.json({ error: "Access denied: Committee member privileges required" }, { status: 403 });
    }

    // Generate portal link using user's access token
    // The correct endpoint is based on Kinde's issuer URL structure
    const kindeIssuerUrl = process.env.KINDE_ISSUER_URL;
    const portalUrl = `${kindeIssuerUrl}/account_api/v1/portal_link`;
    
    console.log('Attempting to fetch portal link from:', portalUrl);
    console.log('Using access token:', accessToken ? 'Token present' : 'No token');
    
    const response = await fetch(portalUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      throw new Error(`Failed to generate portal link: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({ url: data.url });

  } catch (error) {
    console.error('Portal link generation error:', error);
    return NextResponse.json(
      { error: "Failed to generate portal link" }, 
      { status: 500 }
    );
  }
}