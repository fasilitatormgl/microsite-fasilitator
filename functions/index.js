const functions = require('firebase-functions');
const admin = require('firebase-admin');
const express = require('express');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

admin.initializeApp();
const db = admin.firestore();

const app = express();

// Fungsi untuk mendeteksi apakah user-agent adalah bot media sosial
function isBot(userAgent) {
  const botPatterns = [
    'facebookexternalhit', 'Facebot', 'Twitterbot', 'WhatsApp',
    'TelegramBot', 'Slackbot', 'Discordbot', 'Googlebot',
    'Bingbot', 'DuckDuckBot', 'Baiduspider', 'YandexBot',
    'LinkedInBot', 'Pinterest', 'RedditBot', 'Tumblr'
  ];
  if (!userAgent) return false;
  userAgent = userAgent.toLowerCase();
  return botPatterns.some(pattern => userAgent.includes(pattern.toLowerCase()));
}

// Membaca file index.html build React dari folder hosting
const getIndexHtml = () => {
  // Saat di-deploy, file ini berada di folder fungsi
  const htmlPath = path.join(__dirname, 'hosting', 'index.html');
  return fs.readFileSync(htmlPath, 'utf8');
};

// Endpoint untuk menangani rute microsite
app.get('/:slug', async (req, res) => {
  const slug = req.params.slug;
  const userAgent = req.headers['user-agent'] || '';

  // Jika bukan bot, kembalikan index.html React seperti biasa
  if (!isBot(userAgent)) {
    try {
      const indexHtml = getIndexHtml();
      return res.send(indexHtml);
    } catch (err) {
      console.error('Error reading index.html:', err);
      return res.status(500).send('Server error');
    }
  }

  // Jika bot, ambil data dari Firestore
  try {
    const docRef = db.collection('microsites').doc(slug);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      // Jika microsite tidak ditemukan, tampilkan halaman 404 khusus
      return res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Halaman Tidak Ditemukan</title>
          <meta property="og:title" content="404 - Halaman Tidak Ditemukan">
          <meta property="og:description" content="Microsite tidak tersedia">
        </head>
        <body>
          <h1>404 - Microsite tidak ditemukan</h1>
        </body>
        </html>
      `);
    }

    const data = docSnap.data();
    const title = data.title || 'Shortlink by Fasilitator MGL';
    const description = `Microsite dari ${data.title}. Kunjungi tautan-tautan penting di sini.`;
    const url = `https://shortlink-mgl.web.app/${slug}`;
    // Gambar default untuk Open Graph (bisa diganti dengan logo Anda)
    const imageUrl = 'https://shortlink-mgl.web.app/logo-og.png'; // Buat gambar 1200x630 px

    // Baca template HTML dan suntikkan meta tag
    const indexHtml = getIndexHtml();
    const $ = cheerio.load(indexHtml);

    // Tambahkan atau perbarui meta tag
    $('head').append(`
      <meta property="og:type" content="website">
      <meta property="og:title" content="${title}">
      <meta property="og:description" content="${description}">
      <meta property="og:url" content="${url}">
      <meta property="og:image" content="${imageUrl}">
      <meta property="og:image:width" content="1200">
      <meta property="og:image:height" content="630">
      <meta name="twitter:card" content="summary_large_image">
      <meta name="twitter:title" content="${title}">
      <meta name="twitter:description" content="${description}">
      <meta name="twitter:image" content="${imageUrl}">
    `);

    // Kirim HTML yang sudah dimodifikasi ke bot
    return res.send($.html());
  } catch (error) {
    console.error('Error generating meta tags:', error);
    return res.status(500).send('Internal Server Error');
  }
});

// Ekspor sebagai Cloud Function
exports.micrositeHandler = functions.https.onRequest(app);