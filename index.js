const fs = require('fs');

const USERNAME = 'SayemHasan74';
const TEMPLATE_PATH = 'main.mustache';
const OUTPUT_PATH = 'README.md';

const badge = (label, color, logo, logoColor = 'white') =>
  `<img alt="${label}" src="https://img.shields.io/badge/-${encodeURIComponent(label).replace(/%20/g, '_')}-${color}?style=flat-square&logo=${logo}&logoColor=${logoColor}" />`;

const profileBadge = (src, alt) => `<img alt="${alt}" src="${src}" />`;

async function fetchJson(url) {
  const headers = {
    'User-Agent': `${USERNAME}-profile-readme`,
    Accept: 'application/vnd.github+json',
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(url, {
    headers,
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Request failed: ${response.status} ${url}\n${body}`);
  }

  return response.json();
}

async function getDhakaWeather() {
  try {
    const url =
      'https://api.open-meteo.com/v1/forecast?latitude=23.7104&longitude=90.4074&current=temperature_2m,weather_code&daily=sunrise,sunset&timezone=Asia%2FDhaka';
    const data = await fetchJson(url);

    return {
      temperature: Math.round(data.current.temperature_2m),
      sunrise: String(data.daily.sunrise[0]).slice(11, 16),
      sunset: String(data.daily.sunset[0]).slice(11, 16),
      weather: weatherCodeToText(data.current.weather_code),
    };
  } catch (error) {
    return {
      temperature: '--',
      sunrise: '--:--',
      sunset: '--:--',
      weather: 'weather data unavailable',
    };
  }
}

function weatherCodeToText(code) {
  const map = {
    0: 'clear sky',
    1: 'mainly clear',
    2: 'partly cloudy',
    3: 'overcast',
    45: 'fog',
    48: 'depositing rime fog',
    51: 'light drizzle',
    53: 'moderate drizzle',
    55: 'dense drizzle',
    61: 'slight rain',
    63: 'moderate rain',
    65: 'heavy rain',
    71: 'slight snow',
    73: 'moderate snow',
    75: 'heavy snow',
    80: 'slight rain showers',
    81: 'moderate rain showers',
    82: 'violent rain showers',
    95: 'thunderstorm',
  };

  return map[code] || 'mixed weather';
}

function render(template, data) {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? '');
}

async function main() {
  const weather = await getDhakaWeather();
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const refreshDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
    timeZone: 'Asia/Dhaka',
  }).format(new Date());

  const data = {
    profile_badges: [
      profileBadge(`https://komarev.com/ghpvc/?username=${USERNAME}&label=Profile%20views&color=0e75b6&style=flat-square`, 'Profile views'),
      profileBadge('https://img.shields.io/website?url=https%3A%2F%2Fportfolio-rose-sigma-60.vercel.app%2F&style=flat-square&label=website', 'Website status'),
      profileBadge(`https://img.shields.io/github/followers/${USERNAME}?style=flat-square&label=followers&color=0e75b6`, 'GitHub followers'),
      profileBadge(`https://img.shields.io/github/stars/${USERNAME}?affiliations=OWNER&style=flat-square&label=total%20stars&color=343b41`, 'GitHub stars'),
      profileBadge('https://img.shields.io/badge/BRAC%20University-CSE-7A1FA2?style=flat-square', 'BRAC University CSE'),
    ].join('\n  '),
    skill_icons:
      '<img src="https://skillicons.dev/icons?i=ts,js,python,cs,nodejs,express,react,mongodb,postgres,prisma,git,github,linux,postman,vscode,vercel" alt="TypeScript, JavaScript, Python, C#, Node.js, Express, React, MongoDB, PostgreSQL, Prisma, Git, GitHub, Linux, Postman, VS Code, Vercel" />',
    ai_badges: [
      badge('AI/ML', 'FF6F00', 'tensorflow'),
      badge('NLP', '412991', 'huggingface'),
      badge('LLM Probing', '10A37F', 'openai'),
      badge('Backend Engineering', '111827', 'nodedotjs'),
      badge('API Design', '005571', 'fastapi'),
      badge('REST APIs', '02569B', 'swagger'),
      badge('Authentication', '000000', 'auth0'),
      badge('Schema Design', '336791', 'postgresql'),
      badge('Full Stack', '61DAFB', 'react', 'black'),
    ].join('\n  '),
    temperature: weather.temperature,
    weather: weather.weather,
    sunrise: weather.sunrise,
    sunset: weather.sunset,
    refresh_date: refreshDate,
  };

  fs.writeFileSync(OUTPUT_PATH, render(template, data));
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
