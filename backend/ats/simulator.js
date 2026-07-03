function calculateATSScore(matchedCore, totalCore, matchedOptional, totalOptional) {
  const CORE_WEIGHT = 0.7;
  const OPTIONAL_WEIGHT = 0.3;

  const coreScore = totalCore > 0 ? (matchedCore / totalCore) * 100 : 100;
  const optionalScore = totalOptional > 0 ? (matchedOptional / totalOptional) * 100 : 100;

  const weightedScore = (coreScore * CORE_WEIGHT) + (optionalScore * OPTIONAL_WEIGHT);
  return Math.round(weightedScore * 100) / 100;
}

/**
 * Simulates ATS score improvements by adding missing skills
 * @param {Object} input - Input data containing skills analysis
 * @returns {Object} Simulation results with current score and improvements
 */
function simulateATSImprovements(input) {
  const {
    coreSkills = [],
    optionalSkills = [],
    matchedCoreSkills = [],
    missingCoreSkills = [],
    matchedOptionalSkills = [],
    missingOptionalSkills = []
  } = input;

  const totalCoreSkills = coreSkills.length;
  const totalOptionalSkills = optionalSkills.length;
  const currentMatchedCore = matchedCoreSkills.length;
  const currentMatchedOptional = matchedOptionalSkills.length;

  const currentScore = calculateATSScore(
    currentMatchedCore,
    totalCoreSkills,
    currentMatchedOptional,
    totalOptionalSkills
  );

  const improvements = [];

  missingCoreSkills.forEach(skill => {
    const newMatchedCore = currentMatchedCore + 1;
    const newScore = calculateATSScore(
      newMatchedCore,
      totalCoreSkills,
      currentMatchedOptional,
      totalOptionalSkills
    );
    const scoreGain = newScore - currentScore;

    improvements.push({
      skill,
      type: 'core',
      newScore: Math.round(newScore * 100) / 100,
      scoreGain: Math.round(scoreGain * 100) / 100
    });
  });

  missingOptionalSkills.forEach(skill => {
    const newMatchedOptional = currentMatchedOptional + 1;
    const newScore = calculateATSScore(
      currentMatchedCore,
      totalCoreSkills,
      newMatchedOptional,
      totalOptionalSkills
    );
    const scoreGain = newScore - currentScore;

    improvements.push({
      skill,
      type: 'optional',
      newScore: Math.round(newScore * 100) / 100,
      scoreGain: Math.round(scoreGain * 100) / 100
    });
  });

  improvements.sort((a, b) => {
    if (b.scoreGain !== a.scoreGain) {
      return b.scoreGain - a.scoreGain;
    }
    if (a.type === 'core' && b.type === 'optional') return -1;
    if (a.type === 'optional' && b.type === 'core') return 1;
    return 0;
  });

  return {
    currentScore: Math.round(currentScore * 100) / 100,
    improvements: improvements.map(({ skill, newScore }) => ({
      skill,
      newScore
    }))
  };
}

module.exports = {
  simulateATSImprovements
};
