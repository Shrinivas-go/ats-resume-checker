/**
 * Curated list of professional skills for ATS matching.
 */
const SKILL_LIST = [
  // Programming Languages
  'JavaScript', 'Python', 'Java', 'C++', 'C#', 'TypeScript', 'PHP', 'Ruby', 
  'Go', 'Rust', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl', 'Dart',
  
  // Frontend Technologies
  'React', 'Angular', 'Vue', 'Vue.js', 'Svelte', 'Next.js', 'Nuxt.js', 
  'HTML', 'CSS', 'SASS', 'SCSS', 'Tailwind CSS', 'Bootstrap', 'jQuery',
  'Webpack', 'Vite', 'Redux', 'MobX', 'Gatsby',
  
  // Backend Technologies
  'Node.js', 'Express', 'Express.js', 'Django', 'Flask', 'FastAPI', 
  'Spring Boot', 'Spring', 'ASP.NET', '.NET', 'Laravel', 'Rails', 
  'Ruby on Rails', 'NestJS', 'Fastify', 'Koa',
  
  // Databases
  'MongoDB', 'MySQL', 'PostgreSQL', 'SQL', 'NoSQL', 'SQLite', 'Redis', 
  'Cassandra', 'DynamoDB', 'Firebase', 'Firestore', 'Oracle', 'SQL Server',
  'MariaDB', 'Elasticsearch', 'CouchDB',
  
  // Cloud & DevOps
  'AWS', 'Azure', 'Google Cloud', 'GCP', 'Docker', 'Kubernetes', 'Jenkins', 
  'CI/CD', 'Terraform', 'Ansible', 'Chef', 'Puppet', 'CircleCI', 'Travis CI',
  'GitLab CI', 'Heroku', 'Vercel', 'Netlify', 'DigitalOcean',
  
  // Version Control & Tools
  'Git', 'GitHub', 'GitLab', 'Bitbucket', 'SVN', 'Mercurial',
  
  // Testing
  'Jest', 'Mocha', 'Chai', 'Jasmine', 'Cypress', 'Selenium', 'Playwright',
  'JUnit', 'PyTest', 'unittest', 'Postman', 'TestNG',
  
  // Mobile Development
  'React Native', 'Flutter', 'Android', 'iOS', 'Xamarin', 'Ionic',
  
  // Data Science & ML
  'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Keras',
  'Scikit-learn', 'Pandas', 'NumPy', 'Data Analysis', 'Data Science',
  'AI', 'Artificial Intelligence', 'NLP', 'Computer Vision', 'OpenCV',
  
  // Other Technologies
  'GraphQL', 'REST API', 'RESTful', 'Microservices', 'Agile', 'Scrum',
  'JIRA', 'Confluence', 'Linux', 'Unix', 'Bash', 'Shell Scripting',
  'OAuth', 'JWT', 'WebSockets', 'Socket.io', 'RabbitMQ', 'Kafka',
  'API', 'JSON', 'XML', 'YAML', 'Nginx', 'Apache'
];

const CORE_KEYWORDS = [
  'must have', 'required', 'essential', 'mandatory', 'necessary', 'critical',
  'need to have', 'must know', 'expertise in', 'proficiency in', 'experience with',
  'strong knowledge', 'required skills', 'requirements', 'qualifications'
];

const OPTIONAL_KEYWORDS = [
  'good to have', 'nice to have', 'optional', 'plus', 'bonus', 'preferred',
  'desirable', 'advantage', 'beneficial', 'would be a plus', 'nice if you have',
  'additional skills', 'preferred qualifications'
];

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract unweighted flat list of skills from job description text
 * @param {string} text - Job description text
 * @returns {Array<string>} - Array of matched skills
 */
function extractJDSkills(text) {
  if (!text || typeof text !== 'string') return [];
  const lowerText = text.toLowerCase();
  const matched = [];
  const added = new Set();

  SKILL_LIST.forEach(skill => {
    const lowerSkill = skill.toLowerCase();
    if (lowerSkill.length < 3) return;

    const regex = new RegExp(`\\b${escapeRegex(lowerSkill)}\\b`, 'i');
    if (regex.test(lowerText)) {
      if (!added.has(lowerSkill)) {
        matched.push(skill);
        added.add(lowerSkill);
      }
    }
  });

  return matched;
}

/**
 * Extract weighted skills (core vs optional) from job description text
 * @param {string} text - Job description text
 * @returns {Object} - Object containing coreSkills and optionalSkills arrays
 */
function extractWeightedJDSkills(text) {
  if (!text || typeof text !== 'string') {
    return { coreSkills: [], optionalSkills: [] };
  }

  const lines = text.split(/\n|\./).map(line => line.trim()).filter(Boolean);
  const coreSet = new Set();
  const optionalSet = new Set();
  const allSet = new Set();

  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    const isCore = CORE_KEYWORDS.some(kw => lowerLine.includes(kw));
    const isOptional = OPTIONAL_KEYWORDS.some(kw => lowerLine.includes(kw));

    SKILL_LIST.forEach(skill => {
      const lowerSkill = skill.toLowerCase();
      if (lowerSkill.length < 3) return;

      const regex = new RegExp(`\\b${escapeRegex(lowerSkill)}\\b`, 'i');
      if (regex.test(line)) {
        allSet.add(skill);
        if (isCore) {
          coreSet.add(skill);
        } else if (isOptional) {
          optionalSet.add(skill);
        }
      }
    });
  });

  let coreSkills = Array.from(coreSet);
  let optionalSkills = Array.from(optionalSet);

  // If no contextual keyword signals found, default all detected skills to core
  if (coreSkills.length === 0 && optionalSkills.length === 0 && allSet.size > 0) {
    coreSkills = Array.from(allSet);
  }

  // Ensure a skill doesn't exist in both lists; core wins
  optionalSkills = optionalSkills.filter(s => !coreSet.has(s));

  return { coreSkills, optionalSkills };
}

module.exports = {
  SKILL_LIST,
  extractJDSkills,
  extractWeightedJDSkills
};
