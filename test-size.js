const sizeOf = require('image-size');
const token = 'SANTa8JdAqgpjmn';
const authHeader = `Basic ${Buffer.from(`${token}:`).toString('base64')}`;
const url = 'https://nc.vrbl.win/public.php/webdav/DSC00027.JPG'; // assuming this exists based on the previous task logs

fetch(url, {
  headers: { 'Authorization': authHeader, 'Range': 'bytes=0-65536' }
})
.then(res => res.arrayBuffer())
.then(buffer => {
  const dimensions = sizeOf(Buffer.from(buffer));
  console.log('Dimensions:', dimensions);
})
.catch(err => console.error('Error:', err));
