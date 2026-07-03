const { normalizeSkills } = require('./normalize');

/**
 * Normalizes a skill string for case-insensitive matching
 */
function normalizeSkill(skill) {
  if (typeof skill !== 'string') return '';
  return skill.toLowerCase().trim();
}

/**
 * Compare resume skills with job description skills (unweighted)
 * @param {Array<string>} resumeSkills - Skills extracted from resume
 * @param {Array<string>} jdSkills - Skills extracted from job description
 * @returns {Object} - Object containing matchedSkills and missingSkills arrays
 */
function compareSkills(resumeSkills, jdSkills) {
  if (!Array.isArray(resumeSkills)) resumeSkills = [];
  if (!Array.isArray(jdSkills)) jdSkills = [];

  const normalizedResumeSkills = normalizeSkills(resumeSkills);
  const normalizedJDSkills = normalizeSkills(jdSkills);

  const resumeSkillSet = new Set(normalizedResumeSkills.map(normalizeSkill));
  const matchedSkillsSet = new Set();
  const missingSkillsSet = new Set();

  normalizedJDSkills.forEach(skill => {
    const norm = normalizeSkill(skill);
    if (resumeSkillSet.has(norm)) {
      matchedSkillsSet.add(skill);
    } else {
      missingSkillsSet.add(skill);
    }
  });

  return {
    matchedSkills: Array.from(matchedSkillsSet),
    missingSkills: Array.from(missingSkillsSet)
  };
}

/**
 * Compare resume skills with weighted job description skills
 * @param {Array<string>} resumeSkills - Skills extracted from resume
 * @param {Array<string>} coreSkills - Core/required skills from JD
 * @param {Array<string>} optionalSkills - Optional/nice-to-have skills from JD
 * @returns {Object} - Object containing matched and missing skills for both core and optional
 */
function compareWeightedSkills(resumeSkills, coreSkills, optionalSkills) {
  if (!Array.isArray(resumeSkills)) resumeSkills = [];
  if (!Array.isArray(coreSkills)) coreSkills = [];
  if (!Array.isArray(optionalSkills)) optionalSkills = [];

  const normalizedResume = normalizeSkills(resumeSkills);
  const normalizedCore = normalizeSkills(coreSkills);
  const normalizedOptional = normalizeSkills(optionalSkills);

  const resumeSkillSet = new Set(normalizedResume.map(normalizeSkill));

  const compareSets = (requiredSkills) => {
    const matched = [];
    const missing = [];
    const added = new Set();

    requiredSkills.forEach(skill => {
      const norm = normalizeSkill(skill);
      if (added.has(norm)) return;
      added.add(norm);

      if (resumeSkillSet.has(norm)) {
        matched.push(skill);
      } else {
        missing.push(skill);
      }
    });

    return { matched, missing };
  };

  const coreComparison = compareSets(normalizedCore);
  const optionalComparison = compareSets(normalizedOptional);

  // Compute percentages
  const totalCore = normalizedCore.length;
  const totalOptional = normalizedOptional.length;

  const coreMatchPercentage = totalCore > 0 ? Math.round((coreComparison.matched.length / totalCore) * 100) : 0;
  const optionalMatchPercentage = totalOptional > 0 ? Math.round((optionalComparison.matched.length / totalOptional) * 100) : 0;

  return {
    matchedCoreSkills: coreComparison.matched,
    missingCoreSkills: coreComparison.missing,
    matchedOptionalSkills: optionalComparison.matched,
    missingOptionalSkills: optionalComparison.missing,
    coreMatchPercentage,
    optionalMatchPercentage
  };
}

module.exports = {
  compareSkills,
  compareWeightedSkills
};
