import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path");

  if (!path) {
    return new NextResponse("Missing path", { status: 400 });
  }

  const token = process.env.NEXTCLOUD_SHARE_TOKEN;

  if (!token) {
    return new NextResponse("Server configuration error", { status: 500 });
  }

  // Ensure path doesn't point somewhere dangerous
  if (!path.startsWith("/public.php/webdav/")) {
    return new NextResponse("Invalid path", { status: 400 });
  }

  const NEXTCLOUD_URL = `https://nc.vrbl.win${path}`;
  const authHeader = `Basic ${Buffer.from(`${token}:`).toString('base64')}`;

  try {
    const response = await fetch(NEXTCLOUD_URL, {
      headers: {
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      return new NextResponse(`Upstream error: ${response.status}`, { status: response.status });
    }

    // Stream the image directly to the client
    const headers = new Headers();
    const contentType = response.headers.get("content-type");
    const contentLength = response.headers.get("content-length");
    
    if (contentType) headers.set("Content-Type", contentType);
    if (contentLength) headers.set("Content-Length", contentLength);
    
    // Add aggressive caching headers since the proxy will be called often
    headers.set("Cache-Control", "public, max-age=31536000, immutable");

    return new NextResponse(response.body, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error proxying image:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
