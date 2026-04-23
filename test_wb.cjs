const https = require('https');

async function fetchWB() {
  return new Promise((resolve, reject) => {
    https.get('https://api.worldbank.org/v2/country/all/indicator/NY.GDP.PCAP.PP.CD?format=json&date=2022&per_page=300', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

fetchWB().then(d => {
  const records = d[1];
  console.log("Total wb records:", records.length);
  console.log("Sample:", records.find(r => r.countryiso3code === 'USA'));
}).catch(console.error);
