import { NextRequest, NextResponse } from "next/server";
import { requireFinanceAccess } from '@/middleware/auth';

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization using centralized middleware
    const authResult = await requireFinanceAccess(request);
    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = authResult.data;

    // Get access token from Kinde session
    const { getAccessToken } = await import("@kinde-oss/kinde-auth-nextjs/server").then(mod => mod.getKindeServerSession());
    const accessToken = await getAccessToken();

    if (!accessToken) {
      return NextResponse.json({ error: "Access token not found" }, { status: 401 });
    }

    // Try using the user's access token first (recommended approach)
    const kindeIssuerUrl = process.env.KINDE_ISSUER_URL;
    const portalUrl = `${kindeIssuerUrl}/account_api/v1/portal_link`;
    
    console.log('Attempting to fetch portal link from:', portalUrl);
    console.log('User ID:', user.id);
    
    try {
      // Method 1: Using user's access token (recommended by Kinde)
      const userPortalResponse = await fetch(portalUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Accept': 'application/json'
        }
      });
      
      console.log('User token method - Response status:', userPortalResponse.status);
      
      if (userPortalResponse.ok) {
        const data = await userPortalResponse.json();
        console.log('Success response:', data);
        return NextResponse.json({ url: data.url });
      }
      
      // If user token method fails, log the error but don't throw yet
      const userErrorBody = await userPortalResponse.text();
      console.log('User token method failed:', userErrorBody);
      
    } catch (userTokenError) {
      console.log('User token method error:', userTokenError);
    }
    
    // Method 2: Fallback to Management API approach (requires M2M token)
    // This would require additional setup, so for now we'll return an error
    throw new Error('Portal link generation not available. Please contact support.');

  } catch (error) {
    console.error('Portal link generation error:', error);
    return NextResponse.json(
      { error: "Failed to generate portal link" }, 
      { status: 500 }
    );
  }
}