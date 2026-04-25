import { CountryCPI } from '../data/cpi2024';

export function generateDecade(baseData: CountryCPI[]): Record<number, CountryCPI[]> {
  const history: Record<number, CountryCPI[]> = {};
  history[2024] = JSON.parse(JSON.stringify(baseData)); // Base truth

  for (let year = 2023; year >= 2014; year--) {
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

      return {
        ...country,
        score: newScore,
        gdpPpp: newGdp,
        happiness: newHappiness,
        meaningfulLife: newMeaning
      };
    });
  }
  return history;
}
