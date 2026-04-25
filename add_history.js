import fs from 'fs';

const timeSeries = JSON.parse(fs.readFileSync('cpi_time_series.json', 'utf8'));

const content = fs.readFileSync('./src/data/cpi2024.ts', 'utf8');

let newContent = content.replace(/\{ id: '([A-Z]{2})', name: ([^,]+), score: (\d+), trend: '([^']+)', region: '([^']+)', regimeType: '([^']+)', gdpPpp: (\d+), happiness: ([\d.]+), meaningfulLife: (\d+)(, population: (\d+))?\}/g, (match, id, name, score, trend, region, regime, gdp, hap, ml, pop) => {
  // Add static history for now
  const hist = {};
  for (let y = 2000; y <= 2025; y++) {
    hist[y] = parseInt(score);
  }
  const history = `, scoreHistory: ${JSON.stringify(hist)}`;
  return `{ id: '${id}', name: ${name}, score: ${score}, trend: '${trend}', region: '${region}', regimeType: '${regime}', gdpPpp: ${gdp}, happiness: ${hap}, meaningfulLife: ${ml}${pop ? ', population: ' + pop : ''}${history} }`;
});

fs.writeFileSync('./src/data/cpi2024.ts', newContent);