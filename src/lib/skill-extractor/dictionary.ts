/**
 * Curated skills dictionary with canonical names and aliases.
 * Easy to expand: add entries to SKILL_DICTIONARY or merge custom maps.
 */
/** Canonical name -> entry. Built from flat list for easier maintenance. */
const ENTRIES = [
  // Frontend
  {
      canonical: "JavaScript",
      aliases: ["javascript", "js", "ecmascript"],
      category: "hardSkills"
  },
  {
      canonical: "TypeScript",
      aliases: ["typescript", "ts"],
      category: "hardSkills"
  },
  {
      canonical: "React",
      aliases: ["react", "react.js", "reactjs"],
      category: "hardSkills"
  },
  {
      canonical: "Vue.js",
      aliases: ["vue", "vue.js", "vuejs"],
      category: "hardSkills"
  },
  {
      canonical: "Angular",
      aliases: ["angular", "angularjs"],
      category: "hardSkills"
  },
  {
      canonical: "Next.js",
      aliases: ["next.js", "nextjs", "next"],
      category: "hardSkills"
  },
  { canonical: "HTML", aliases: ["html", "html5"], category: "hardSkills" },
  {
      canonical: "CSS",
      aliases: ["css", "css3", "scss", "sass", "less"],
      category: "hardSkills"
  },
  {
      canonical: "UI/UX Design",
      aliases: ["ui/ux design", "ui design", "ux design", "ui/ux", "ui", "ux"],
      category: "softSkills"
  },
  { canonical: "Redux", aliases: ["redux"], category: "hardSkills" },
  { canonical: "Webpack", aliases: ["webpack"], category: "tools" },
  {
      canonical: "Tailwind CSS",
      aliases: ["tailwind", "tailwind css", "tailwindcss"],
      category: "hardSkills"
  },
  { canonical: "Bootstrap", aliases: ["bootstrap"], category: "tools" },
  {
      canonical: "Material UI",
      aliases: ["material ui", "material-ui"],
      category: "tools"
  },
  {
      canonical: "Ant Design",
      aliases: ["ant design", "ant-design"],
      category: "tools"
  },
  {
      canonical: "Chakra UI",
      aliases: ["chakra ui", "chakra-ui"],
      category: "tools"
  },
  {
      canonical: "Styled Components",
      aliases: ["styled components", "styled-components"],
      category: "tools"
  },
  {
      canonical: "Tailwind CSS",
      aliases: ["tailwind", "tailwind css", "tailwindcss"],
      category: "tools"
  },
  { canonical: "Vuetify", aliases: ["vuetify"], category: "tools" },
  {
      canonical: "Nuxt.js",
      aliases: ["nuxt.js", "nuxtjs", "nuxt"],
      category: "tools"
  },
  {
      canonical: "Next.js",
      aliases: ["next.js", "nextjs", "next"],
      category: "tools"
  },
  { canonical: "Gatsby", aliases: ["gatsby"], category: "tools" },
  { canonical: "Jest", aliases: ["jest"], category: "tools" },
  { canonical: "Mocha", aliases: ["mocha"], category: "tools" },
  { canonical: "Cypress", aliases: ["cypress"], category: "tools" },
  { canonical: "Playwright", aliases: ["playwright"], category: "tools" },
  { canonical: "Selenium", aliases: ["selenium"], category: "tools" },
  // Backend / runtimes
  {
      canonical: "Node.js",
      aliases: ["node", "node.js", "nodejs"],
      category: "hardSkills"
  },
  { canonical: "Python", aliases: ["python", "py"], category: "hardSkills" },
  { canonical: "Java", aliases: ["java"], category: "hardSkills" },
  {
      canonical: "C#",
      aliases: ["c#", "csharp", "c sharp"],
      category: "hardSkills"
  },
  {
      canonical: ".NET",
      aliases: [".net", "dotnet", "dot net"],
      category: "hardSkills"
  },
  { canonical: "Go", aliases: ["go", "golang"], category: "hardSkills" },
  { canonical: "Rust", aliases: ["rust"], category: "hardSkills" },
  { canonical: "Ruby", aliases: ["ruby"], category: "hardSkills" },
  { canonical: "PHP", aliases: ["php"], category: "hardSkills" },
  { canonical: "Kotlin", aliases: ["kotlin"], category: "hardSkills" },
  { canonical: "Swift", aliases: ["swift"], category: "hardSkills" },
  { canonical: "Scala", aliases: ["scala"], category: "hardSkills" },
  {
      canonical: "C++",
      aliases: ["c++", "cpp", "c plus plus"],
      category: "hardSkills"
  },
  // APIs & data formats
  {
      canonical: "REST APIs",
      aliases: ["rest", "rest api", "restful", "rest apis"],
      category: "hardSkills"
  },
  {
      canonical: "GraphQL",
      aliases: ["graphql", "graph ql"],
      category: "hardSkills"
  },
  { canonical: "gRPC", aliases: ["grpc", "g rpc"], category: "hardSkills" },
  { canonical: "JSON", aliases: ["json"], category: "hardSkills" },
  // Databases
  {
      canonical: "PostgreSQL",
      aliases: ["postgresql", "postgres", "psql"],
      category: "tools"
  },
  { canonical: "MySQL", aliases: ["mysql"], category: "tools" },
  { canonical: "MongoDB", aliases: ["mongodb", "mongo"], category: "tools" },
  { canonical: "Redis", aliases: ["redis"], category: "tools" },
  {
      canonical: "Elasticsearch",
      aliases: ["elasticsearch", "elastic search", "elk"],
      category: "tools"
  },
  { canonical: "NoSQL", aliases: ["nosql", "no sql"], category: "hardSkills" },
  // Cloud & infra
  {
      canonical: "AWS",
      aliases: ["aws", "amazon web services", "amazon cloud"],
      category: "tools"
  },
  {
      canonical: "Google Cloud",
      aliases: ["gcp", "google cloud", "google cloud platform"],
      category: "tools"
  },
  {
      canonical: "Azure",
      aliases: ["azure", "microsoft azure"],
      category: "tools"
  },
  { canonical: "Docker", aliases: ["docker", "containers"], category: "tools" },
  {
      canonical: "Kubernetes",
      aliases: ["kubernetes", "k8s", "kube"],
      category: "tools"
  },
  { canonical: "Terraform", aliases: ["terraform", "iac"], category: "tools" },
  { canonical: "Vercel", aliases: ["vercel"], category: "tools" },
  { canonical: "Netlify", aliases: ["netlify"], category: "tools" },
  {
      canonical: "CI/CD",
      aliases: [
          "ci/cd",
          "cicd",
          "continuous integration",
          "continuous deployment"
      ],
      category: "tools"
  },
  { canonical: "Jenkins", aliases: ["jenkins"], category: "tools" },
  {
      canonical: "GitHub Actions",
      aliases: ["github actions", "github actions ci"],
      category: "tools"
  },
  { canonical: "Linux", aliases: ["linux", "unix"], category: "tools" },
  // Data & ML
  {
      canonical: "Data Analysis",
      aliases: ["data analysis", "analyzing data", "analytics"],
      category: "hardSkills"
  },
  {
      canonical: "Machine Learning",
      aliases: ["machine learning", "ml", "deep learning", "dl"],
      category: "hardSkills"
  },
  { canonical: "Pandas", aliases: ["pandas"], category: "tools" },
  { canonical: "NumPy", aliases: ["numpy", "np"], category: "tools" },
  {
      canonical: "Scikit-learn",
      aliases: ["scikit-learn", "scikit learn", "sklearn"],
      category: "tools"
  },
  {
      canonical: "SQL",
      aliases: ["sql", "sql queries", "querying", "write sql"],
      category: "hardSkills"
  },
  { canonical: "Tableau", aliases: ["tableau"], category: "tools" },
  { canonical: "Looker", aliases: ["looker"], category: "tools" },
  { canonical: "Snowflake", aliases: ["snowflake"], category: "tools" },
  { canonical: "Databricks", aliases: ["databricks"], category: "tools" },
  // Product / business
  {
      canonical: "Product Management",
      aliases: ["product management", "product manager", "pm"],
      category: "qualifications"
  },
  {
      canonical: "Agile",
      aliases: ["agile", "scrum", "sprint"],
      category: "tools"
  },
  { canonical: "Jira", aliases: ["jira"], category: "tools" },
  {
      canonical: "Roadmap",
      aliases: ["roadmap", "product roadmap"],
      category: "keywords"
  },
  {
      canonical: "Stakeholder Management",
      aliases: [
          "stakeholder management",
          "stakeholders",
          "manage stakeholders",
          "cross-functional stakeholder"
      ],
      category: "softSkills"
  },
  // Soft skills
  {
      canonical: "Communication",
      aliases: [
          "communication",
          "written communication",
          "verbal communication",
          "communicate"
      ],
      category: "softSkills"
  },
  {
      canonical: "Leadership",
      aliases: ["leadership", "lead", "leading teams"],
      category: "softSkills"
  },
  {
      canonical: "Problem Solving",
      aliases: ["problem solving", "problem-solving", "problem solving skills"],
      category: "softSkills"
  },
  {
      canonical: "Collaboration",
      aliases: [
          "collaboration",
          "collaborate",
          "cross-functional",
          "cross functional"
      ],
      category: "softSkills"
  },
  {
      canonical: "Time Management",
      aliases: ["time management", "prioritization", "prioritize"],
      category: "softSkills"
  },
  {
      canonical: "Critical Thinking",
      aliases: ["critical thinking", "analytical thinking"],
      category: "softSkills"
  },
  {
      canonical: "Attention to Detail",
      aliases: ["attention to detail", "detail oriented", "detail-oriented"],
      category: "softSkills"
  },
  {
      canonical: "Adaptability",
      aliases: ["adaptability", "adaptable", "flexible"],
      category: "softSkills"
  },
  {
      canonical: "Mentorship",
      aliases: ["mentorship", "mentoring", "mentor"],
      category: "softSkills"
  },
  // Common tools
  {
      canonical: "Git",
      aliases: ["git", "version control", "github", "gitlab", "bitbucket"],
      category: "tools"
  },
  { canonical: "Figma", aliases: ["figma", "figma design"], category: "tools" },
  { canonical: "Slack", aliases: ["slack"], category: "tools" },
  {
      canonical: "Salesforce",
      aliases: ["salesforce", "sfdc", "crm"],
      category: "tools"
  },
  {
      canonical: "SaaS",
      aliases: ["saas", "software as a service"],
      category: "keywords"
  },
  {
      canonical: "API",
      aliases: ["api", "apis", "api development"],
      category: "hardSkills"
  },
  {
      canonical: "Microservices",
      aliases: ["microservices", "micro services", "microservice architecture"],
      category: "hardSkills"
  },
  {
      canonical: "System Design",
      aliases: ["system design", "systems design", "distributed systems"],
      category: "hardSkills"
  },
  {
      canonical: "Solution Architecture",
      aliases: ["solution architecture", "solution architect", "solution design"],
      category: "hardSkills"
  },
  {
      canonical: "Testing",
      aliases: [
          "testing",
          "unit testing",
          "integration testing",
          "jest",
          "pytest"
      ],
      category: "hardSkills"
  },
  {
      canonical: "End-to-End",
      aliases: ["end-to-end", "end to end", "e2e"],
      category: "keywords"
  },
  {
      canonical: "Vitest",
      aliases: ["vitest"],
      category: "tools"
  },
  {
      canonical: "Jest",
      aliases: ["jest"],
      category: "tools"
  },
  {
      canonical: "Mocha",
      aliases: ["mocha"],
      category: "tools"
  },
  {
      canonical: "Cypress",
      aliases: ["cypress"],
      category: "tools"
  },
  // Healthcare
  {
      canonical: "Patient Care",
      aliases: ["patient care", "patient support", "direct patient care"],
      category: "hardSkills"
  },
  {
      canonical: "Electronic Health Records",
      aliases: ["ehr", "electronic health records", "medical records"],
      category: "tools"
  },
  {
      canonical: "Vital Signs Monitoring",
      aliases: ["vital signs", "monitoring vitals", "blood pressure monitoring"],
      category: "hardSkills"
  },
  {
      canonical: "Medication Administration",
      aliases: ["medication administration", "administer medication"],
      category: "hardSkills"
  },
  {
      canonical: "Clinical Documentation",
      aliases: ["clinical documentation", "medical charting"],
      category: "hardSkills"
  },
  {
      canonical: "HIPAA Compliance",
      aliases: ["hipaa", "hipaa compliance"],
      category: "qualifications"
  },
  {
      canonical: "First Aid",
      aliases: ["first aid", "first aid certified"],
      category: "qualifications"
  },
  {
      canonical: "CPR",
      aliases: ["cpr", "cpr certification"],
      category: "qualifications"
  },
  // Customer Service
  {
      canonical: "Customer Service",
      aliases: ["customer service", "customer support", "client support"],
      category: "softSkills"
  },
  {
      canonical: "Customer Satisfaction",
      aliases: ["customer satisfaction", "customer experience", "cx"],
      category: "keywords"
  },
  {
      canonical: "Complaint Resolution",
      aliases: [
          "complaint resolution",
          "handle complaints",
          "resolve customer issues"
      ],
      category: "softSkills"
  },
  {
      canonical: "Call Handling",
      aliases: ["call handling", "call center", "phone support"],
      category: "hardSkills"
  },
  {
      canonical: "Live Chat Support",
      aliases: ["live chat", "chat support"],
      category: "hardSkills"
  },
  {
      canonical: "Customer Retention",
      aliases: ["customer retention", "retain customers"],
      category: "keywords"
  },
  // Sales
  {
      canonical: "Sales",
      aliases: ["sales", "selling", "sales experience"],
      category: "hardSkills"
  },
  {
      canonical: "Lead Generation",
      aliases: ["lead generation", "generate leads", "prospecting"],
      category: "hardSkills"
  },
  {
      canonical: "Cold Calling",
      aliases: ["cold calling", "cold outreach"],
      category: "hardSkills"
  },
  {
      canonical: "Negotiation",
      aliases: ["negotiation", "negotiating deals"],
      category: "softSkills"
  },
  {
      canonical: "Closing Deals",
      aliases: ["closing deals", "close sales"],
      category: "hardSkills"
  },
  {
      canonical: "Sales Pipeline",
      aliases: ["sales pipeline", "pipeline management"],
      category: "keywords"
  },
  {
      canonical: "Account Management",
      aliases: ["account management", "manage accounts"],
      category: "hardSkills"
  },
  {
      canonical: "Upselling",
      aliases: ["upselling", "cross-selling", "cross selling"],
      category: "hardSkills"
  },
  // Hospitality / Service Industry
  {
      canonical: "Food Service",
      aliases: ["food service", "serve food", "food handling"],
      category: "hardSkills"
  },
  {
      canonical: "POS Systems",
      aliases: ["pos system", "point of sale", "cash register"],
      category: "tools"
  },
  {
      canonical: "Order Taking",
      aliases: ["order taking", "take orders"],
      category: "hardSkills"
  },
  {
      canonical: "Table Service",
      aliases: ["table service", "serve tables"],
      category: "hardSkills"
  },
  {
      canonical: "Cash Handling",
      aliases: ["cash handling", "handle cash"],
      category: "hardSkills"
  },
  {
      canonical: "Food Safety",
      aliases: ["food safety", "food safety standards"],
      category: "qualifications"
  },
  {
      canonical: "Food Preparation",
      aliases: ["food preparation", "prep food"],
      category: "hardSkills"
  },
  {
      canonical: "Bartending",
      aliases: ["bartending", "bartender"],
      category: "hardSkills"
  },
  // Operations / Logistics
  {
      canonical: "Inventory Management",
      aliases: ["inventory management", "inventory control"],
      category: "hardSkills"
  },
  {
      canonical: "Supply Chain",
      aliases: ["supply chain", "supply chain management"],
      category: "hardSkills"
  },
  {
      canonical: "Logistics",
      aliases: ["logistics", "logistics coordination"],
      category: "hardSkills"
  },
  {
      canonical: "Warehouse Operations",
      aliases: ["warehouse operations", "warehouse work"],
      category: "hardSkills"
  },
  {
      canonical: "Shipping and Receiving",
      aliases: ["shipping and receiving", "receiving shipments"],
      category: "hardSkills"
  },
  {
      canonical: "Quality Control",
      aliases: ["quality control", "quality assurance"],
      category: "hardSkills"
  },
  // Marketing
  {
      canonical: "Digital Marketing",
      aliases: ["digital marketing", "online marketing"],
      category: "hardSkills"
  },
  {
      canonical: "SEO",
      aliases: ["seo", "search engine optimization"],
      category: "hardSkills"
  },
  {
      canonical: "Content Marketing",
      aliases: ["content marketing", "content strategy"],
      category: "hardSkills"
  },
  {
      canonical: "Social Media Marketing",
      aliases: ["social media marketing", "social media management"],
      category: "hardSkills"
  },
  {
      canonical: "Email Marketing",
      aliases: ["email marketing", "email campaigns"],
      category: "hardSkills"
  },
  {
      canonical: "Google Analytics",
      aliases: ["google analytics", "ga4"],
      category: "tools"
  },
  {
      canonical: "Advertising",
      aliases: ["advertising", "paid ads", "paid media"],
      category: "hardSkills"
  },
  // Finance / Accounting
  {
      canonical: "Accounting",
      aliases: ["accounting", "financial accounting"],
      category: "hardSkills"
  },
  {
      canonical: "Bookkeeping",
      aliases: ["bookkeeping", "bookkeeper"],
      category: "hardSkills"
  },
  {
      canonical: "Financial Analysis",
      aliases: ["financial analysis", "analyze financial data"],
      category: "hardSkills"
  },
  {
      canonical: "Budgeting",
      aliases: ["budgeting", "budget planning"],
      category: "hardSkills"
  },
  {
      canonical: "Accounts Payable",
      aliases: ["accounts payable", "ap"],
      category: "hardSkills"
  },
  {
      canonical: "Accounts Receivable",
      aliases: ["accounts receivable", "ar"],
      category: "hardSkills"
  },
  {
      canonical: "QuickBooks",
      aliases: ["quickbooks", "intuit quickbooks"],
      category: "tools"
  },
  {
      canonical: "Excel",
      aliases: ["excel", "microsoft excel", "spreadsheet"],
      category: "tools"
  },
  // HR / Recruiting
  {
      canonical: "Recruiting",
      aliases: ["recruiting", "talent acquisition"],
      category: "hardSkills"
  },
  {
      canonical: "Interviewing",
      aliases: ["interviewing", "conduct interviews"],
      category: "hardSkills"
  },
  {
      canonical: "Onboarding",
      aliases: ["onboarding", "employee onboarding"],
      category: "hardSkills"
  },
  {
      canonical: "HR Policies",
      aliases: ["hr policies", "human resources policies"],
      category: "keywords"
  },
  {
      canonical: "Performance Management",
      aliases: ["performance management", "employee evaluation"],
      category: "hardSkills"
  },
  {
      canonical: "Employee Relations",
      aliases: ["employee relations", "workplace relations"],
      category: "hardSkills"
  },
  {
      canonical: "Diploma",
      aliases: [
          "diploma",
          "diploma certified",
          "associate degree",
          "associate's degree",
          "associate degree certified"
      ],
      category: "qualifications"
  },
  {
      canonical: "Bachelor's Degree",
      aliases: [
          "bachelor's degree",
          "bachelors degree",
          "bsc",
          "bachelor's degree certified",
          "bachelors degree certified",
          "bsc certified"
      ],
      category: "qualifications"
  },
  {
      canonical: "Master's Degree",
      aliases: [
          "master's degree",
          "masters degree",
          "msc",
          "master's degree certified",
          "masters degree certified",
          "msc certified"
      ],
      category: "qualifications"
  },
  {
      canonical: "Doctorate",
      aliases: [
          "doctorate",
          "phd",
          "doctor's degree",
          "doctorate certified",
          "phd certified",
          "doctor's degree certified"
      ],
      category: "qualifications"
  },
  {
      canonical: "License",
      aliases: ["license", "license certified", "license certified"],
      category: "qualifications"
  },
  {
      canonical: "Certification",
      aliases: ["certification", "certified", "certification certified"],
      category: "qualifications"
  },
  {
      canonical: "Registration",
      aliases: ["registration", "registered", "registration certified"],
      category: "qualifications"
  },
  {
      canonical: "Accreditation",
      aliases: ["accreditation", "accredited", "accreditation certified"],
      category: "qualifications"
  },
  {
      canonical: "Bootcamp",
      aliases: ["bootcamp", "bootcamp certified"],
      category: "qualifications"
  },
  {
      canonical: "Coding Bootcamp",
      aliases: ["coding bootcamp", "coding bootcamp certified"],
      category: "qualifications"
  },
  {
      canonical: "Full Stack Development",
      aliases: ["full stack development", "full stack development certified"],
      category: "qualifications"
  },
  {
      canonical: "Frontend Development",
      aliases: ["frontend development", "frontend development certified"],
      category: "qualifications"
  },
  {
      canonical: "Backend Development",
      aliases: ["backend development", "backend development certified"],
      category: "qualifications"
  },
  {
      canonical: "DevOps",
      aliases: ["devops", "devops certified"],
      category: "qualifications"
  },
  {
      canonical: "Cloud Computing",
      aliases: ["cloud computing", "cloud computing certified"],
      category: "qualifications"
  },
  {
      canonical: "Data Science",
      aliases: ["data science", "data science certified"],
      category: "qualifications"
  },
  {
      canonical: "Machine Learning",
      aliases: ["machine learning", "machine learning certified"],
      category: "qualifications"
  }
];
/** Map: lowercase alias -> { canonical, category }. */
let aliasMap = null;
/** Map: lowercase canonical -> category. */
let canonicalCategoryMap = null;
function buildMaps() {
  if (aliasMap !== null)
      return;
  aliasMap = new Map();
  canonicalCategoryMap = new Map();
  for (const entry of ENTRIES) {
      canonicalCategoryMap.set(entry.canonical.toLowerCase(), entry.category);
      aliasMap.set(entry.canonical.toLowerCase(), {
          canonical: entry.canonical,
          category: entry.category
      });
      for (const a of entry.aliases) {
          const key = a.toLowerCase().trim();
          if (!aliasMap.has(key)) {
              aliasMap.set(key, {
                  canonical: entry.canonical,
                  category: entry.category
              });
          }
      }
  }
}
/**
* Look up a phrase in the dictionary. Returns canonical + category if found.
*/
export function lookupSkill(phrase) {
  buildMaps();
  const key = phrase.toLowerCase().trim();
  return aliasMap.get(key) ?? null;
}
/**
* Get category for a canonical skill name.
*/
export function getCategoryForCanonical(canonical) {
  buildMaps();
  return canonicalCategoryMap.get(canonical.toLowerCase());
}
/**
* Return all dictionary entries (for expansion / testing).
*/
export function getSkillDictionary() {
  return [...ENTRIES];
}
/**
* Add or merge custom entries. Call before first extraction.
*/
export function extendDictionary(entries) {
  ENTRIES.push(...entries);
  aliasMap = null;
  canonicalCategoryMap = null;
}