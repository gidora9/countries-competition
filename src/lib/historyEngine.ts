import { CountryCPI } from '../data/cpi2024';

export function generateDecade(baseData: CountryCPI[]): Record<number, CountryCPI[]> {
  const history: Record<number, CountryCPI[]> = {};
  history[2024] = JSON.parse(JSON.stringify(baseData)); // Base truth

  for (let year = 2023; year >= 2000; year--) {
    history[year] = history[year + 1].map(country => {
      // Create the past state from the future state (year + 1)
      let scoreChange = 0;
      
      // If trend is rising in 2024, it means it was lower in the past.
      if (country.trend === 'Rising') {
        scoreChange = -(Math.random() * 2.5); // Dropping as we go back
      } else if (country.trend === 'Sinking') {
        scoreChange = (Math.random() * 2.5); // It was higher in the past
      } else {
        scoreChange = (Math.random() * 2) - 1; // Stable drift
      }

      let newScore = Math.max(0, Math.min(100, Math.round(country.score + scoreChange)));

      // GDP usually grows over time, so backwards it shrinks by 1-4% per year
      const deflationFactor = 1 - (Math.random() * 0.03 + 0.01);
      let newGdp = country.gdpPpp * deflationFactor;

      // Happiness and Meaning drift slightly
      let newHappiness = Math.max(0, Math.min(10, country.happiness + (Math.random() * 0.2 - 0.1)));
      let newMeaning = Math.max(0, Math.min(100, country.meaningfulLife + (Math.random() * 2 - 1)));

      const randInflation = Math.random() * 2 - 0.5;
      const randUnemp = Math.random() * 1.5 - 0.5;
      const randEdu = Math.random() - 0.5;
      const randLife = Math.random() * 0.4 - 0.2;
      const randPress = Math.random() * 4 - 2;

      return {
        ...country,
        score: newScore,
        gdpPpp: newGdp,
        happiness: newHappiness,
        meaningfulLife: newMeaning,
        inflation: Math.max(0, (country.inflation || 5) + randInflation),
        unemployment: Math.max(0, (country.unemployment || 5) + randUnemp),
        education: Math.max(0, Math.min(100, (country.education || 50) + randEdu)),
        lifeExpectancy: Math.max(30, Math.min(90, (country.lifeExpectancy || 70) + randLife)),
        pressFreedom: Math.max(0, Math.min(100, (country.pressFreedom || 50) + randPress))
      };
    });
  }

  // Calculate Prosperity Score and Rank for each year
  for (let year = 2000; year <= 2024; year++) {
    const yearData = history[year];
    
    yearData.forEach(country => {
      // Normalization (0-100)
      const gdpNorm = Math.min(100, Math.max(0, (Math.log10(Math.max(1, country.gdpPpp)) - 3) / 2 * 100)); // Logarithmic scaling
      const cpiNorm = country.score;
      const lifeNorm = Math.min(100, Math.max(0, ((country.lifeExpectancy || 60) - 50) / 35 * 100)); 
      const eduNorm = Math.min(100, Math.max(0, (country.education || 5) * 10)); 
      const pressNorm = country.pressFreedom || 50; 
      const hapNorm = (country.happiness || 5) * 10;
      const meanNorm = country.meaningfulLife || 50;
      const infNorm = Math.max(0, 100 - (country.inflation || 0) * 3);
      const unempNorm = Math.max(0, 100 - (country.unemployment || 0) * 5);
      
      const prosperityScore = (
        gdpNorm * 0.15 +
        cpiNorm * 0.15 +
        lifeNorm * 0.15 +
        eduNorm * 0.15 +
        pressNorm * 0.10 +
        hapNorm * 0.10 +
        meanNorm * 0.10 +
        infNorm * 0.05 +
        unempNorm * 0.05
      );
      
      country.prosperityScore = Number(prosperityScore.toFixed(1));
    });

    // Rank countries
    yearData.sort((a, b) => (b.prosperityScore || 0) - (a.prosperityScore || 0));
    yearData.forEach((country, index) => {
      country.prosperityRank = index + 1;
    });
  }

  return history;
}
