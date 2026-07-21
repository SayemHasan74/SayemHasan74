const fs = require('fs');

const USERNAME = 'SayemHasan74';
const TEMPLATE_PATH = 'main.mustache';
const OUTPUT_PATH = 'README.md';

const pinnedProjects = [
  'Video-Player-',
  'SoundSip',
  'rentnest-server',
  'Portfolio',
  'Stats-Checker',
  'devpulse',
  'typescript-assignment',
  'GameProject',
  'football-ticket-booking',
];

const fallbackDescriptions = {
  'Video-Player-': 'My personal video player built with Python.',
  SoundSip: 'My personal music player built with TypeScript.',
  'rentnest-server': 'Rental marketplace backend with tenant, landlord, admin roles, reviews, and Stripe payments.',
  Portfolio: 'Personal portfolio website.',
  'Stats-Checker': 'Stats checking project built with C#.',
  devpulse: 'Developer-focused TypeScript project.',
  'typescript-assignment': 'TypeScript assignment solutions and blogs.',
  GameProject: '3D tree watering game built with Python.',
  'football-ticket-booking': 'Football ticket booking project.',
};

const badge = (label, color, logo, logoColor = 'white') =>
  `<img alt="${label}" src="https://img.shields.io/badge/-${encodeURIComponent(label).replace(/%20/g, '_')}-${color}?style=flat-square&logo=${logo}&logoColor=${logoColor}" />`;

const projectRow = repo => {
  const name = repo.name;
  const description = repo.description || fallbackDescriptions[name] || 'Open source project.';
  return `    <tr>
      <td><a href="${repo.html_url}"><b>${name}</b></a><br/><sub>${description}</sub></td>
      <td><img alt="Stars" src="https://img.shields.io/github/stars/${USERNAME}/${name}?style=flat-square&labelColor=343b41"/></td>
      <td><img alt="Forks" src="https://img.shields.io/github/forks/${USERNAME}/${name}?style=flat-square&labelColor=343b41"/></td>
      <td><img alt="Issues" src="https://img.shields.io/github/issues/${USERNAME}/${name}?style=flat-square&labelColor=343b41"/></td>
      <td><img alt="Pull Requests" src="https://img.shields.io/github/issues-pr/${USERNAME}/${name}?style=flat-square&labelColor=343b41"/></td>
    </tr>`;
};

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

async function getRepos() {
  const repos = await fetchJson(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=updated`);
  const byName = new Map(repos.map(repo => [repo.name, repo]));

  return pinnedProjects
    .filter(name => byName.has(name))
    .map(name => byName.get(name));
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
  const repos = await getRepos();
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
    badges: [
      badge('TypeScript', '007ACC', 'typescript'),
      badge('JavaScript', 'F7DF1E', 'javascript', 'black'),
      badge('Python', '3776AB', 'python'),
      badge('AI/ML', 'FF6F00', 'tensorflow'),
      badge('NLP', '412991', 'huggingface'),
      badge('LLM Probing', '10A37F', 'openai'),
      badge('C Sharp', '239120', 'csharp'),
      badge('React', '45b8d8', 'react'),
      badge('Node.js', '43853d', 'node.js'),
      badge('Express', '000000', 'express'),
      badge('MongoDB', '13aa52', 'mongodb'),
      badge('Stripe', '635BFF', 'stripe'),
      badge('HTML5', 'E34F26', 'html5'),
      badge('CSS3', '1572B6', 'css3'),
      badge('Git', 'F05032', 'git'),
      badge('GitHub Actions', '2088FF', 'github-actions'),
      badge('VS Code', '007ACC', 'visualstudiocode'),
      badge('Vercel', '000000', 'vercel'),
    ].join('\n  '),
    project_rows: repos.map(projectRow).join('\n'),
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
