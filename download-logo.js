const fs = require('fs');
const https = require('https');
const path = require('path');

// Daftar pusaka digital Paduka
const logos = {
  'nextjs.svg': 'nextdotjs/white',
  'react.svg': 'react/white',
  'typescript.svg': 'typescript/white',
  'tailwind.svg': 'tailwindcss/white',
  'supabase.svg': 'supabase/white',
  'gsap.svg': 'greensock/white',
  'threejs.svg': 'threedotjs/white',
  'opencv.svg': 'opencv/white',
  'python.svg': 'python/white',
  'nodejs.svg': 'nodedotjs/white',
  'postgresql.svg': 'postgresql/white',
  'framer.svg': 'framer/white'
};

// Memastikan ruang penyimpanan senjata tersedia
const dir = path.join(__dirname, 'public', 'logos');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
  console.log('🏰 Membangun ruangan /public/logos/ ...');
}

console.log('⚔️ Memanggil pusaka digital dari langit...');

// Proses pemanggilan
Object.entries(logos).forEach(([filename, icon]) => {
  const url = `https://cdn.simpleicons.org/${icon}`;
  const dest = path.join(dir, filename);
  
  https.get(url, (res) => {
    if (res.statusCode === 200) {
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✔️  Pusaka mendarat: ${filename}`);
      });
    } else {
      console.log(`❌ Gagal memanggil: ${filename} (Status: ${res.statusCode})`);
    }
  }).on('error', (err) => {
    console.log(`❌ Error jaringan saat memanggil ${filename}:`, err.message);
  });
});