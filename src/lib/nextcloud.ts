import { XMLParser } from 'fast-xml-parser';

export interface NextcloudFile {
  name: string;
  url: string;
  lastModified: string;
  contentType: string;
  size: number;
}

export async function fetchPhotos(): Promise<NextcloudFile[]> {
  const NEXTCLOUD_URL = "https://nc.vrbl.win/public.php/webdav/";
  const token = process.env.NEXTCLOUD_SHARE_TOKEN;

  if (!token) {
    console.warn("No NEXTCLOUD_SHARE_TOKEN provided.");
    return [];
  }

  const authHeader = `Basic ${Buffer.from(`${token}:`).toString('base64')}`;

  try {
    const response = await fetch(NEXTCLOUD_URL, {
      method: 'PROPFIND',
      headers: {
        'Authorization': authHeader,
        'Depth': '1',
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      console.error("Failed to fetch Nextcloud photos", response.status, await response.text());
      return [];
    }

    const xmlData = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: "@_"
    });
    const parsed = parser.parse(xmlData);

    const responses = parsed["d:multistatus"]?.["d:response"] || [];
    const files: NextcloudFile[] = [];

    // Response can be a single object or an array
    const items = Array.isArray(responses) ? responses : [responses];

    for (const item of items) {
      const href = item["d:href"];
      const propstat = item["d:propstat"];
      const props = propstat?.["d:prop"] || (Array.isArray(propstat) ? propstat[0]?.["d:prop"] : undefined);
      
      if (!props) continue;
      
      const contentType = props["d:getcontenttype"];
      
      // Only include images
      if (contentType && contentType.startsWith('image/')) {
        const name = href.split('/').pop() || href;
        
        // Return proxy URL to securely fetch images without exposing token
        const url = `/api/image?path=${encodeURIComponent(href)}`;

        files.push({
          name: decodeURIComponent(name),
          url: url,
          lastModified: props["d:getlastmodified"],
          contentType: contentType,
          size: parseInt(props["d:getcontentlength"] || "0", 10)
        });
      }
    }

    return files;
  } catch (error) {
    console.error("Error fetching photos:", error);
    return [];
  }
}
