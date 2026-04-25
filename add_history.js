import fs from 'fs';

const content = fs.readFileSync('./src/data/cpi2024.ts', 'utf8');

let newContent = content.replace(/\{ id: '([A-Z]{2})', name: ([^,]+), score: (\d+), trend: '([^']+)', region: '([^']+)', regimeType: '([^']+)', gdpPpp: (\d+), happiness: ([\d.]+), meaningfulLife: (\d+)(, population: (\d+))?\}/g, (match, id, name, score, trend, region, regime, gdp, hap, ml, pop) => {
  const baseScore = parseInt(score);
  const hist = {};
  for (let y = 2000; y <= 2025; y++) {
    let yearScore = baseScore;
    if (trend === 'Rising') {
      yearScore = Math.min(100, Math.max(0, baseScore + (y - 2024) * 0.5));
    } else if (trend === 'Sinking') {
      yearScore = Math.min(100, Math.max(0, baseScore - (y - 2024) * 0.5));
    }
    hist[y] = Math.round(yearScore);
  }
  const history = `, scoreHistory: ${JSON.stringify(hist)}`;
  return `{ id: '${id}', name: ${name}, score: ${score}, trend: '${trend}', region: '${region}', regimeType: '${regime}', gdpPpp: ${gdp}, happiness: ${hap}, meaningfulLife: ${ml}${pop ? ', population: ' + pop : ''}${history} }`;
});

fs.writeFileSync('./src/data/cpi2024.ts', newContent);