import fs from 'fs';

const iso2to3 = {
  'DK': 'DNK',
  'FI': 'FIN',
  'NZ': 'NZL',
  'NO': 'NOR',
  'SG': 'SGP',
  'SE': 'SWE',
  'CH': 'CHE',
  'NL': 'NLD',
  'DE': 'DEU',
  'LU': 'LUX',
  'IE': 'IRL',
  'CA': 'CAN',
  'EE': 'EST',
  'AU': 'AUS',
  'HK': 'HKG',
  'UY': 'URY',
  'BE': 'BEL',
  'JP': 'JPN',
  'IS': 'ISL',
  'GB': 'GBR',
  'FR': 'FRA',
  'US': 'USA',
  'AE': 'ARE',
  'TW': 'TWN',
  'CL': 'CHL',
  'KR': 'KOR',
  'IL': 'ISR',
  'ES': 'ESP',
  'QA': 'QAT',
  'IT': 'ITA',
  'PL': 'POL',
  'SA': 'SAU',
  'GR': 'GRC',
  'CN': 'CHN',
  'ZA': 'ZAF',
  'IN': 'IND',
  'AR': 'ARG',
  'BR': 'BRA',
  'TR': 'TUR',
  'ID': 'IDN',
  'PE': 'PER',
  'MX': 'MEX',
  'PK': 'PAK',
  'RU': 'RUS',
  'NG': 'NGA',
  'IR': 'IRN',
  'IQ': 'IRQ',
  'CD': 'COD',
  'AF': 'AFG',
  'VE': 'VEN',
  'SY': 'SYR',
  'SS': 'SSD',
  'SO': 'SOM',
  'VN': 'VNM',
  'CI': 'CIV',
  'TZ': 'TZA',
  'GH': 'GHA',
  'SN': 'SEN',
  'MA': 'MAR',
  'DZ': 'DZA',
  'TH': 'THA',
  'CO': 'COL',
  'EG': 'EGY',
  'PH': 'PHL',
  'LK': 'LKA',
  'JM': 'JAM',
  'OM': 'OMN',
  'SV': 'SLV',
  'PA': 'PAN',
  'EC': 'ECU',
  'DO': 'DOM',
  'BO': 'BOL',
  'KH': 'KHM',
  'LB': 'LBN',
  'ZW': 'ZWE',
  'UZ': 'UZB',
  'KZ': 'KAZ',
  'AM': 'ARM',
  'GE': 'GEO',
  'RW': 'RWA',
  'UG': 'UGA',
  'KE': 'KEN',
  'ZM': 'ZMB'
};

const gdpData = JSON.parse(fs.readFileSync('gdp_ppp.json'))[1];

const gdpByCountryYear = {};

gdpData.forEach(d => {
  const iso3 = d.countryiso3code;
  const year = parseInt(d.date);
  const value = parseFloat(d.value);
  if (!isNaN(value) && year >= 2000 && year <= 2023) {
    if (!gdpByCountryYear[iso3]) gdpByCountryYear[iso3] = {};
    gdpByCountryYear[iso3][year] = value;
  }
});

const content = fs.readFileSync('./src/data/cpi2024.ts', 'utf8');

let newContent = content.replace(/gdpPpp: (\d+),/g, (match, gdp) => {
  const id = match.split("'")[1]; // extract id from the line
  const iso3 = iso2to3[id];
  let gdpHistory = '';
  if (iso3 && gdpByCountryYear[iso3]) {
    const hist = {};
    for (let y = 2000; y <= 2023; y++) {
      hist[y] = gdpByCountryYear[iso3][y] || parseInt(gdp);
    }
    gdpHistory = `, gdpHistory: ${JSON.stringify(hist)}`;
  }
  return `gdpPpp: ${gdp}${gdpHistory},`;
});

fs.writeFileSync('./src/data/cpi2024.ts', newContent);