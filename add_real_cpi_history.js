import fs from 'fs';

const iso3to2 = {
  'DNK': 'DK',
  'FIN': 'FI',
  'NZL': 'NZ',
  'NOR': 'NO',
  'SGP': 'SG',
  'SWE': 'SE',
  'CHE': 'CH',
  'NLD': 'NL',
  'DEU': 'DE',
  'LUX': 'LU',
  'IRL': 'IE',
  'CAN': 'CA',
  'EST': 'EE',
  'AUS': 'AU',
  'HKG': 'HK',
  'URY': 'UY',
  'BEL': 'BE',
  'JPN': 'JP',
  'ISL': 'IS',
  'GBR': 'GB',
  'FRA': 'FR',
  'USA': 'US',
  'ARE': 'AE',
  'TWN': 'TW',
  'CHL': 'CL',
  'KOR': 'KR',
  'ISR': 'IL',
  'ESP': 'ES',
  'QAT': 'QA',
  'ITA': 'IT',
  'POL': 'PL',
  'SAU': 'SA',
  'GRC': 'GR',
  'CHN': 'CN',
  'ZAF': 'ZA',
  'IND': 'IN',
  'ARG': 'AR',
  'BRA': 'BR',
  'TUR': 'TR',
  'IDN': 'ID',
  'PER': 'PE',
  'MEX': 'MX',
  'PAK': 'PK',
  'RUS': 'RU',
  'NGA': 'NG',
  'IRN': 'IR',
  'IRQ': 'IQ',
  'COD': 'CD',
  'AFG': 'AF',
  'VEN': 'VE',
  'SYR': 'SY',
  'SSD': 'SS',
  'SOM': 'SO',
  'VNM': 'VN',
  'CIV': 'CI',
  'TZA': 'TZ',
  'GHA': 'GH',
  'SEN': 'SN',
  'MAR': 'MA',
  'DZA': 'DZ',
  'THA': 'TH',
  'COL': 'CO',
  'EGY': 'EG',
  'PHL': 'PH',
  'LKA': 'LK',
  'JAM': 'JM',
  'OMN': 'OM',
  'SLV': 'SV',
  'PAN': 'PA',
  'ECU': 'EC',
  'DOM': 'DO',
  'BOL': 'BO',
  'KHM': 'KH',
  'LBN': 'LB',
  'ZWE': 'ZW',
  'UZB': 'UZ',
  'KAZ': 'KZ',
  'ARM': 'AM',
  'GEO': 'GE',
  'RWA': 'RW',
  'UGA': 'UG',
  'KEN': 'KE',
  'ZMB': 'ZM'
};

const cpiData = fs.readFileSync('cpi_historical.csv', 'utf8').split('\n').slice(1).filter(line => line.trim()).map(line => {
  const [country, code, year, cpi] = line.split(',');
  return { country, code, year: parseInt(year), cpi: parseFloat(cpi) };
}).filter(d => !isNaN(d.cpi) && d.year >= 2000 && d.year <= 2023);

const cpiByCountryYear = {};
cpiData.forEach(d => {
  const iso2 = iso3to2[d.code];
  if (iso2) {
    if (!cpiByCountryYear[iso2]) cpiByCountryYear[iso2] = {};
    cpiByCountryYear[iso2][d.year] = d.cpi;
  }
});

const content = fs.readFileSync('./src/data/cpi2024.ts', 'utf8');

let newContent = content.replace(/(\{ id: '(\w+)', .*? score: (\d+),)/g, (match, fullMatch, id, score) => {
  let scoreHistory = '';
  if (cpiByCountryYear[id]) {
    const hist = {};
    for (let y = 2000; y <= 2023; y++) {
      hist[y] = cpiByCountryYear[id][y] || parseInt(score);
    }
    scoreHistory = `, scoreHistory: ${JSON.stringify(hist)}`;
  }
  // Remove existing scoreHistory if present
  const cleaned = fullMatch.replace(/, scoreHistory: \{[^}]*\}/, '');
  return cleaned.replace(/score: (\d+),/, `score: $1${scoreHistory},`);
});

fs.writeFileSync('./src/data/cpi2024.ts', newContent);