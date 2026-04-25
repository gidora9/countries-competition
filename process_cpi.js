import fs from 'fs';

const csv = fs.readFileSync('cpi_historical.csv', 'utf8');
const lines = csv.split('\n').slice(1); // skip header

const data = {};

lines.forEach(line => {
  if (!line.trim()) return;
  const [country, code, year, cpi] = line.split(',');
  const y = parseInt(year);
  if (y >= 2000 && y <= 2025) {
    if (!data[y]) data[y] = {};
    data[y][code] = parseFloat(cpi);
  }
});

fs.writeFileSync('cpi_time_series.json', JSON.stringify(data, null, 2));