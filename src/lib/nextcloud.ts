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

    // Add local JSON caching to speed up local dev and build times
    const fs = require('fs');
    const path = require('path');
    const cacheDir = path.join(process.cwd(), '.next');
    const cachePath = path.join(cacheDir, 'dimensions-cache.json');
    
    let dimensionsCache: Record<string, {width: number, height: number}> = {};
    try {
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
      }
      if (fs.existsSync(cachePath)) {
        dimensionsCache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
      }
    } catch (e) {
      console.warn("Could not read dimension cache", e);
    }

    const processedFiles: NextcloudFile[] = [];

    // Process images in small batches to avoid overwhelming Nextcloud
    const batchSize = 5;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      
      const filePromises = batch.map(async (item: any) => {
        const href = item["d:href"];
        const propstat = item["d:propstat"];
        const props = propstat?.["d:prop"] || (Array.isArray(propstat) ? propstat[0]?.["d:prop"] : undefined);
        
        if (!props) return null;
        
        const contentType = props["d:getcontenttype"];
        
        // Only include images
        if (contentType && contentType.startsWith('image/')) {
          const name = href.split('/').pop() || href;
          const decodedName = decodeURIComponent(name);
          const url = `/api/image?path=${encodeURIComponent(href)}`;
          
          let width = 600;
          let height = 400;

          // Check Cache
          if (dimensionsCache[decodedName]) {
            width = dimensionsCache[decodedName].width;
            height = dimensionsCache[decodedName].height;
          } else {
            // Fetch if not cached
            try {
              const dimResponse = await fetch(`https://nc.vrbl.win${href}`, {
                headers: {
                  'Authorization': authHeader,
                  'Range': 'bytes=0-262144'
                },
                next: { revalidate: 3600 }
              });

              if (dimResponse.ok || dimResponse.status === 206) {
                const buffer = await dimResponse.arrayBuffer();
                try {
                  const dimensions = sizeOf(Buffer.from(buffer));
                  if (dimensions && dimensions.width && dimensions.height) {
                    width = dimensions.width;
                    height = dimensions.height;
                    
                    if (dimensions.orientation && dimensions.orientation >= 5) {
                       width = dimensions.height;
                       height = dimensions.width;
                    }
                    // Save to cache
                    dimensionsCache[decodedName] = { width, height };
                  }
                } catch (e) {
                  // Silent fail for corrupt JPGs
                }
              }
            } catch (e) {
              console.warn("Failed to fetch range for dimensions", decodedName);
            }
          }

          return {
            name: decodedName,
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

      const results = await Promise.all(filePromises);
      processedFiles.push(...(results.filter(Boolean) as NextcloudFile[]));
    }

    // Save updated cache
    try {
      fs.writeFileSync(cachePath, JSON.stringify(dimensionsCache, null, 2));
    } catch (e) {
      console.warn("Could not write dimension cache", e);
    }

    return processedFiles;
  } catch (error) {
    console.error("Error fetching photos:", error);
    return [];
  }
}
