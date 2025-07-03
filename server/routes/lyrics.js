import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();
const GENIUS_TOKEN = process.env.GENIUS_ACCESS_TOKEN;

if (!GENIUS_TOKEN) {
  console.warn('⚠️ GENIUS_ACCESS_TOKEN is not set. Check your .env file.');
}

const scrapeLyricsWithCheerio = async (url) => {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const lyrics = $('div[data-lyrics-container="true"]')
    .map((i, el) => $(el).text().trim())
    .get()
    .join('\n\n');
  return lyrics || null;
};

const scrapeLyricsWithPuppeteer = async (url) => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const lyrics = await page.evaluate(() => {
    const containers = document.querySelectorAll('[data-lyrics-container]');
    return Array.from(containers).map(c => c.innerText.trim()).join('\n\n');
  });

  await browser.close();
  return lyrics || null;
};

router.get('/', async (req, res) => {
  const { song, artist } = req.query;

  if (!song || !artist) {
    return res.status(400).json({ error: 'Missing song or artist' });
  }

  try {
    console.log(`🔍 Searching lyrics for "${song}" by "${artist}"`);

    const searchRes = await axios.get('https://api.genius.com/search', {
      headers: {
        Authorization: `Bearer ${GENIUS_TOKEN}`,
      },
      params: { q: `${song} ${artist}` },
    });

    const hits = searchRes.data.response.hits;
    console.log(`🔎 Genius returned ${hits.length} result(s).`);

    let hit =
      hits.find(h =>
        h.result.primary_artist.name.toLowerCase().includes(artist.toLowerCase())
      ) ||
      hits.find(h =>
        h.result.title.toLowerCase().includes(song.toLowerCase())
      );

    if (!hit) {
      return res.status(404).json({ error: `Lyrics not found for ${song} by ${artist}` });
    }

    const lyricsUrl = hit.result.url;
    console.log(`🎯 Scraping lyrics from: ${lyricsUrl}`);

    // Step 1: Try with Cheerio
    let lyrics = await scrapeLyricsWithCheerio(lyricsUrl);

    // Step 2: Fallback to Puppeteer if lyrics not found
    if (!lyrics) {
      console.warn('⚠️ Cheerio failed. Trying Puppeteer...');
      lyrics = await scrapeLyricsWithPuppeteer(lyricsUrl);
    }

    if (!lyrics) {
      return res.status(500).json({ error: 'Lyrics found but could not be scraped.' });
    }

    res.json({ lyrics, url: lyricsUrl });
  } catch (err) {
    console.error('❌ Genius fetch error:', err.response?.data || err.message);
    res.status(500).json({ error: 'Lyrics fetch failed' });
  }
});

export default router;
