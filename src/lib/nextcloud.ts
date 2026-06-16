import { XMLParser } from 'fast-xml-parser';
import sizeOf from 'image-size';

export interface NextcloudFile {
  name: string;
  url: string;
  lastModified: string;
  contentType: string;
  size: number;
  width: number;
  height: number;
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
    
    // Response can be a single object or an array
    const items = Array.isArray(responses) ? responses : [responses];

    // Process all images concurrently to speed up dimension fetching
    const filePromises = items.map(async (item: any) => {
      const href = item["d:href"];
      const propstat = item["d:propstat"];
      const props = propstat?.["d:prop"] || (Array.isArray(propstat) ? propstat[0]?.["d:prop"] : undefined);
      
      if (!props) return null;
      
      const contentType = props["d:getcontenttype"];
      
      // Only include images
      if (contentType && contentType.startsWith('image/')) {
        const name = href.split('/').pop() || href;
        const url = `/api/image?path=${encodeURIComponent(href)}`;
        
        let width = 600;
        let height = 400;

        try {
          // Fetch the first 64KB of the image to determine dimensions without downloading the whole file
          const dimResponse = await fetch(`https://nc.vrbl.win${href}`, {
            headers: {
              'Authorization': authHeader,
              'Range': 'bytes=0-262144'
            },
            // Cache these small chunk requests aggressively as well
            next: { revalidate: 3600 }
          });

          if (dimResponse.ok || dimResponse.status === 206) {
            const buffer = await dimResponse.arrayBuffer();
            try {
              const dimensions = sizeOf(Buffer.from(buffer));
              if (dimensions && dimensions.width && dimensions.height) {
                // If EXIF orientation is 5,6,7,8 then width and height might be swapped, but image-size
                // handles orientation in most cases. If it doesn't, this is a known limitation.
                width = dimensions.width;
                height = dimensions.height;
                
                // image-size provides orientation for JPEGs
                if (dimensions.orientation && dimensions.orientation >= 5) {
                   width = dimensions.height;
                   height = dimensions.width;
                }
              }
            } catch (e) {
              console.warn("Could not parse dimensions for", name, e);
            }
          }
        } catch (e) {
          console.warn("Failed to fetch range for dimensions", name, e);
        }

        return {
          name: decodeURIComponent(name),
          url: url,
          lastModified: props["d:getlastmodified"],
          contentType: contentType,
          size: parseInt(props["d:getcontentlength"] || "0", 10),
          width,
          height
        } as NextcloudFile;
      }
      return null;
    });

    const files = (await Promise.all(filePromises)).filter(Boolean) as NextcloudFile[];
    return files;
  } catch (error) {
    console.error("Error fetching photos:", error);
    return [];
  }
}
