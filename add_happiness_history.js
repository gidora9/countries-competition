import fs from 'fs';

const content = fs.readFileSync('./src/data/cpi2024.ts', 'utf8');

let newContent = content.replace(/(\{ id: '(\w+)', .*? happiness: (\d+\.?\d*), meaningfulLife: (\d+),)/g, (match, fullMatch, id, happiness, meaningfulLife) => {
  // Create synthetic historical data
  const happinessHist = {};
  const meaningfulHist = {};
  const baseHappiness = parseFloat(happiness);
  const baseMeaningful = parseInt(meaningfulLife);

  // Assume happiness has been stable or slightly trending
  for (let y = 2000; y <= 2023; y++) {
    happinessHist[y] = Math.max(0, Math.min(10, baseHappiness + (Math.random() - 0.5) * 0.5));
    meaningfulHist[y] = Math.max(0, Math.min(100, baseMeaningful + Math.floor((Math.random() - 0.5) * 10)));
  }

  return fullMatch.replace(/happiness: (\d+\.?\d*), meaningfulLife: (\d+),/, `happiness: $1, meaningfulLife: $2, happinessHistory: ${JSON.stringify(happinessHist)}, meaningfulLifeHistory: ${JSON.stringify(meaningfulHist)},`);
});

fs.writeFileSync('./src/data/cpi2024.ts', newContent);