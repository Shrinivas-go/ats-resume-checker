const SKILL_ALIASES = {
  'js': 'JavaScript',
  'javascript': 'JavaScript',
  'ecmascript': 'JavaScript',
  'ts': 'TypeScript',
  'typescript': 'TypeScript',
  'node': 'Node.js',
  'nodejs': 'Node.js',
  'node.js': 'Node.js',
  'react': 'React',
  'reactjs': 'React',
  'react.js': 'React',
  'vue': 'Vue.js',
  'vuejs': 'Vue.js',
  'vue.js': 'Vue.js',
  'angular': 'Angular',
  'angularjs': 'Angular',
  'angular.js': 'Angular',
  'express': 'Express.js',
  'expressjs': 'Express.js',
  'express.js': 'Express.js',
  'next': 'Next.js',
  'nextjs': 'Next.js',
  'next.js': 'Next.js',
  'mongo': 'MongoDB',
  'mongodb': 'MongoDB',
  'mongo db': 'MongoDB',
  'postgres': 'PostgreSQL',
  'postgresql': 'PostgreSQL',
  'psql': 'PostgreSQL',
  'mysql': 'MySQL',
  'my sql': 'MySQL',
  'python': 'Python',
  'py': 'Python',
  'java': 'Java',
  'c++': 'C++',
  'cpp': 'C++',
  'cplusplus': 'C++',
  'c#': 'C#',
  'csharp': 'C#',
  'c sharp': 'C#',
  'docker': 'Docker',
  'dockerfile': 'Docker',
  'kubernetes': 'Kubernetes',
  'k8s': 'Kubernetes',
  'kube': 'Kubernetes',
  'aws': 'AWS',
  'amazon web services': 'AWS',
  'azure': 'Azure',
  'microsoft azure': 'Azure',
  'gcp': 'Google Cloud',
  'google cloud': 'Google Cloud',
  'google cloud platform': 'Google Cloud',
  'git': 'Git',
  'github': 'GitHub',
  'gitlab': 'GitLab',
  'html': 'HTML',
  'html5': 'HTML',
  'css': 'CSS',
  'css3': 'CSS',
  'sql': 'SQL',
  'structured query language': 'SQL',
  'nosql': 'NoSQL',
  'no sql': 'NoSQL',
  'rest': 'REST API',
  'rest api': 'REST API',
  'restful': 'REST API',
  'restful api': 'REST API',
  'graphql': 'GraphQL',
  'graph ql': 'GraphQL',
  'ci/cd': 'CI/CD',
  'cicd': 'CI/CD',
  'continuous integration': 'CI/CD',
  'ml': 'Machine Learning',
  'machine learning': 'Machine Learning',
  'ai': 'AI',
  'artificial intelligence': 'Artificial Intelligence',
  'redux': 'Redux',
  'redux toolkit': 'Redux',
  'tailwind': 'Tailwind CSS',
  'tailwindcss': 'Tailwind CSS',
  'tailwind css': 'Tailwind CSS'
};

/**
 * Normalizes an array of skills to lowercase and maps aliases to canonical names
 * @param {Array<string>} skillsArray - Skills array to normalize
 * @returns {Array<string>} - Unique normalized skills
 */
function normalizeSkills(skillsArray) {
  if (!Array.isArray(skillsArray)) return [];

  const normalizedSet = new Set();
  const normalizedSkills = [];

  skillsArray
    .filter(skill => typeof skill === 'string' && skill.trim() !== '')
    .forEach(skill => {
      const trimmed = skill.trim();
      const lower = trimmed.toLowerCase();
      const canonical = SKILL_ALIASES[lower] || trimmed;
      const canonicalLower = canonical.toLowerCase();

      if (!normalizedSet.has(canonicalLower)) {
        normalizedSet.add(canonicalLower);
        normalizedSkills.push(canonical);
      }
    });

  return normalizedSkills;
}

module.exports = {
  normalizeSkills,
  SKILL_ALIASES
};
