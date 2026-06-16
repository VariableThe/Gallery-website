const { XMLParser } = require('fast-xml-parser');
const token = 'SANTa8JdAqgpjmn';
const authHeader = `Basic ${Buffer.from(`${token}:`).toString('base64')}`;

fetch('https://nc.vrbl.win/public.php/webdav/', {
  method: 'PROPFIND',
  headers: { 'Authorization': authHeader, 'Depth': '1' }
})
.then(res => res.text())
.then(xml => {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "@_" });
  const parsed = parser.parse(xml);
  const items = parsed["d:multistatus"]["d:response"];
  console.log(JSON.stringify(items[1]["d:propstat"]["d:prop"], null, 2));
});
