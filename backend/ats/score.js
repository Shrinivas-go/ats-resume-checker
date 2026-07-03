/**
 * Calculate ATS score based on matched skills vs required skills (unweighted)
 * @param {Array<string>} jdSkills - Skills required by job description
 * @param {Array<string>} matchedSkills - Skills matched between resume and JD
 * @returns {Object} - Object containing atsScore (number) and explanation (string)
 */
function calculateATSScore(jdSkills, matchedSkills) {
  if (!Array.isArray(jdSkills)) jdSkills = [];
  if (!Array.isArray(matchedSkills)) matchedSkills = [];

  if (jdSkills.length === 0) {
    return {
      atsScore: 0,
      explanation: 'No skills found in the job description to compare against.'
    };
  }

  const atsScore = Math.round((matchedSkills.length / jdSkills.length) * 100);
  let explanation = '';

  if (atsScore >= 80) {
    explanation = `Excellent match! Your resume matches ${matchedSkills.length} out of ${jdSkills.length} required skills (${atsScore}%). You are a strong candidate for this position.`;
  } else if (atsScore >= 60) {
    explanation = `Good match! Your resume matches ${matchedSkills.length} out of ${jdSkills.length} required skills (${atsScore}%). Consider adding the missing skills if you have them.`;
  } else if (atsScore >= 40) {
    explanation = `Moderate match. Your resume matches ${matchedSkills.length} out of ${jdSkills.length} required skills (${atsScore}%). You may need to develop additional skills for this role.`;
  } else if (atsScore > 0) {
    explanation = `Low match. Your resume matches only ${matchedSkills.length} out of ${jdSkills.length} required skills (${atsScore}%). This position may not be the best fit.`;
  } else {
    explanation = `No match found. Your resume does not contain any of the ${jdSkills.length} required skills for this position.`;
  }

  return { atsScore, explanation };
}

/**
 * Calculate weighted ATS score based on core and optional skill matching
 * @param {Object} weightedComparison - Object containing skill matching results
 * @returns {Object} - Object containing atsScore (number) and explanation (string)
 */
function calculateWeightedATSScore(weightedComparison) {
  if (!weightedComparison || typeof weightedComparison !== 'object') {
    return { atsScore: 0, explanation: 'Invalid comparison data.' };
  }

  const matchedCore = Array.isArray(weightedComparison.matchedCoreSkills) ? weightedComparison.matchedCoreSkills : [];
  const missingCore = Array.isArray(weightedComparison.missingCoreSkills) ? weightedComparison.missingCoreSkills : [];
  const matchedOptional = Array.isArray(weightedComparison.matchedOptionalSkills) ? weightedComparison.matchedOptionalSkills : [];
  const missingOptional = Array.isArray(weightedComparison.missingOptionalSkills) ? weightedComparison.missingOptionalSkills : [];

  const totalCore = matchedCore.length + missingCore.length;
  const totalOptional = matchedOptional.length + missingOptional.length;

  let coreScore = totalCore > 0 ? (matchedCore.length / totalCore) * 100 : 0;
  let optionalScore = totalOptional > 0 ? (matchedOptional.length / totalOptional) * 100 : 0;

  // Weight constants
  let coreWeight = 0.7;
  let optionalWeight = 0.3;

  if (totalCore === 0 && totalOptional === 0) {
    return { atsScore: 0, explanation: 'No skills found in the job description to evaluate against.' };
  } else if (totalCore === 0) {
    coreWeight = 0;
    optionalWeight = 1.0;
  } else if (totalOptional === 0) {
    coreWeight = 1.0;
    optionalWeight = 0;
  }

  const atsScore = Math.round((coreScore * coreWeight) + (optionalScore * optionalWeight));

  // Generate explanation
  let explanation = '';
  if (atsScore >= 80) {
    explanation = 'Excellent match! ';
  } else if (atsScore >= 60) {
    explanation = 'Good match! ';
  } else if (atsScore >= 40) {
    explanation = 'Moderate match. ';
  } else if (atsScore > 0) {
    explanation = 'Low match. ';
  } else {
    explanation = 'No match found. ';
  }

  if (totalCore > 0) {
    explanation += `You matched ${matchedCore.length} out of ${totalCore} core/required skills (${Math.round(coreScore)}%). `;
    if (coreScore >= 80) {
      explanation += 'Your core skills are very strong. ';
    } else if (coreScore >= 60) {
      explanation += 'Your core skills are good but could be improved. ';
    } else {
      explanation += 'You are missing critical core skills. ';
    }
  }

  if (totalOptional > 0) {
    explanation += `You matched ${matchedOptional.length} out of ${totalOptional} optional/preferred skills (${Math.round(optionalScore)}%). `;
  }

  if (atsScore >= 70) {
    explanation += 'You are a strong candidate for this position.';
  } else if (atsScore >= 50) {
    explanation += 'Consider highlighting relevant experience or acquiring missing skills.';
  } else {
    explanation += 'Significant skill development may be needed for this role.';
  }

  return { atsScore, explanation };
}

module.exports = {
  calculateATSScore,
  calculateWeightedATSScore
};
