# Professional keyword taxonomy organised by domain.
# Each entry is a lowercase phrase (1-, 2-, or 3-word) that will be matched
# against text using n-gram extraction after normalisation.

DOMAIN_KEYWORDS = {

    # ── Software Engineering ─────────────────────────────────────────────────
    'software_engineering': {
        # Languages
        'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'go',
        'golang', 'rust', 'kotlin', 'swift', 'ruby', 'php', 'scala', 'perl',
        'elixir', 'haskell', 'lua', 'dart', 'flutter', 'bash', 'shell scripting',
        'powershell', 'groovy', 'objective-c', 'assembly',

        # Frontend
        'react', 'react.js', 'vue', 'vue.js', 'angular', 'next.js', 'nuxt.js',
        'svelte', 'html', 'css', 'sass', 'less', 'webpack', 'vite', 'babel',
        'tailwind css', 'bootstrap', 'material ui', 'chakra ui', 'styled components',
        'web components', 'progressive web app', 'pwa', 'responsive design',
        'cross browser compatibility', 'storybook', 'shadcn',

        # Backend
        'node.js', 'express', 'express.js', 'django', 'flask', 'fastapi',
        'spring boot', 'spring framework', 'rails', 'ruby on rails', 'laravel',
        'asp.net', '.net core', 'nestjs', 'graphql', 'rest api', 'restful api',
        'soap', 'grpc', 'websocket', 'oauth', 'jwt', 'api development',

        # Architecture
        'microservices', 'serverless', 'event driven architecture',
        'domain driven design', 'clean architecture', 'mvc', 'api gateway',
        'service mesh', 'message queue', 'kafka', 'rabbitmq', 'celery',

        # Cloud / DevOps
        'aws', 'amazon web services', 'azure', 'microsoft azure', 'gcp',
        'google cloud', 'google cloud platform', 'docker', 'kubernetes', 'k8s',
        'terraform', 'ansible', 'puppet', 'vagrant',
        'ci/cd', 'continuous integration', 'continuous deployment',
        'github actions', 'gitlab ci', 'jenkins', 'circleci', 'travis ci',
        'devops', 'devsecops', 'site reliability engineering', 'sre',
        'infrastructure as code', 'helm', 'istio', 'prometheus', 'grafana',
        'datadog', 'new relic', 'splunk', 'elk stack', 'cloudwatch',

        # Databases
        'sql', 'postgresql', 'mysql', 'sqlite', 'oracle', 'sql server',
        'mongodb', 'redis', 'elasticsearch', 'dynamodb', 'cassandra',
        'nosql', 'firebase', 'supabase', 'neo4j', 'graph database',
        'database design', 'query optimization', 'orm', 'prisma',

        # Testing & Quality
        'unit testing', 'integration testing', 'end to end testing',
        'test driven development', 'tdd', 'behavior driven development', 'bdd',
        'jest', 'pytest', 'selenium', 'cypress', 'playwright', 'mocha',
        'code review', 'static analysis', 'sonarqube',

        # Practices
        'agile', 'scrum', 'kanban', 'sprint', 'git', 'github', 'gitlab',
        'version control', 'pair programming', 'refactoring', 'design patterns',
        'solid principles', 'object oriented programming', 'functional programming',
        'system design', 'software architecture', 'api design',
        'technical documentation', 'performance optimization', 'scalability',
        'high availability', 'load balancing', 'caching',

        # Security
        'cybersecurity', 'penetration testing', 'vulnerability assessment',
        'owasp', 'encryption', 'ssl/tls', 'identity management',
        'zero trust', 'siem', 'soc', 'devsecops',

        # Certifications
        'aws certified', 'azure certified', 'gcp certified', 'cissp',
        'cism', 'ceh', 'comptia security+',
    },

    # ── Data Science / Analytics ─────────────────────────────────────────────
    'data_analytics': {
        # Core
        'data analysis', 'data analytics', 'data science', 'data engineering',
        'business intelligence', 'statistical analysis', 'data visualization',
        'reporting', 'kpi', 'metrics', 'a/b testing', 'hypothesis testing',
        'regression analysis', 'predictive modeling', 'exploratory data analysis',

        # Machine Learning / AI
        'machine learning', 'deep learning', 'natural language processing',
        'nlp', 'computer vision', 'reinforcement learning', 'neural networks',
        'tensorflow', 'pytorch', 'scikit-learn', 'keras', 'hugging face',
        'large language models', 'llm', 'generative ai', 'prompt engineering',
        'feature engineering', 'model training', 'model deployment',
        'mlops', 'model evaluation', 'xgboost', 'lightgbm', 'random forest',
        'time series analysis', 'recommendation systems',

        # Tools / Platforms
        'python', 'r', 'sql', 'apache spark', 'spark', 'hadoop', 'hive',
        'tableau', 'power bi', 'looker', 'qlik', 'metabase', 'dbt',
        'apache airflow', 'airflow', 'prefect', 'luigi',
        'snowflake', 'bigquery', 'redshift', 'databricks', 'azure synapse',
        'pandas', 'numpy', 'matplotlib', 'seaborn', 'plotly',
        'jupyter notebook', 'jupyter',

        # Concepts
        'etl', 'elt', 'data pipeline', 'data warehouse', 'data lake',
        'data lakehouse', 'data governance', 'data quality', 'data catalog',
        'data modeling', 'dimensional modeling', 'star schema', 'data mesh',
        'real time analytics', 'streaming data', 'batch processing',
        'feature store', 'experiment tracking', 'data lineage',
    },

    # ── Product / UX / Design ─────────────────────────────────────────────────
    'product_design': {
        # Product Management
        'product management', 'product strategy', 'product roadmap',
        'product development', 'go to market', 'product launch',
        'market research', 'competitive analysis', 'user research',
        'customer discovery', 'product led growth', 'growth hacking',
        'okrs', 'north star metric', 'product requirements',
        'feature prioritization', 'backlog management', 'sprint planning',
        'stakeholder management', 'product analytics',

        # UX / Design
        'user experience', 'ux design', 'ui design', 'ux research',
        'usability testing', 'user interviews', 'user personas',
        'wireframing', 'prototyping', 'information architecture',
        'interaction design', 'visual design', 'design systems',
        'figma', 'sketch', 'adobe xd', 'invision', 'zeplin',
        'adobe creative suite', 'photoshop', 'illustrator', 'after effects',
        'accessibility', 'wcag', 'responsive design',

        # Methods
        'design thinking', 'lean ux', 'human centered design',
        'design sprint', 'a/b testing', 'multivariate testing',
        'conversion rate optimization', 'funnel analysis', 'cohort analysis',
        'jobs to be done', 'customer journey mapping',
    },

    # ── Finance / Accounting ──────────────────────────────────────────────────
    'finance_accounting': {
        # Accounting
        'financial reporting', 'financial analysis', 'financial modeling',
        'budget management', 'forecasting', 'variance analysis',
        'gaap', 'ifrs', 'accounts payable', 'accounts receivable',
        'general ledger', 'reconciliation', 'internal audit', 'external audit',
        'tax planning', 'tax preparation', 'payroll', 'bookkeeping',
        'cost accounting', 'management accounting', 'revenue recognition',
        'fixed assets', 'month end close', 'year end close',

        # Corporate Finance
        'financial planning', 'fp&a', 'corporate finance', 'investment analysis',
        'portfolio management', 'risk management', 'credit analysis',
        'equity research', 'valuation', 'dcf', 'mergers and acquisitions',
        'm&a', 'due diligence', 'private equity', 'venture capital',
        'asset management', 'fixed income', 'derivatives', 'capital markets',
        'treasury', 'cash flow management', 'working capital',

        # Tools
        'excel', 'advanced excel', 'vba', 'sap', 'oracle financials',
        'quickbooks', 'netsuite', 'hyperion', 'anaplan', 'adaptive insights',
        'power bi', 'tableau', 'sql', 'bloomberg', 'pitchbook',

        # Certifications / Credentials
        'cpa', 'cfa', 'cma', 'frm', 'series 7', 'series 63', 'series 65',
        'acca', 'aca', 'mba',
    },

    # ── Marketing / Growth ────────────────────────────────────────────────────
    'marketing': {
        # Digital Channels
        'digital marketing', 'content marketing', 'email marketing',
        'social media marketing', 'search engine optimization', 'seo',
        'search engine marketing', 'sem', 'pay per click', 'ppc',
        'google ads', 'facebook ads', 'meta ads', 'tiktok ads',
        'programmatic advertising', 'display advertising',
        'influencer marketing', 'affiliate marketing', 'performance marketing',
        'video marketing', 'podcast marketing',

        # Tools & Platforms
        'google analytics', 'ga4', 'adobe analytics', 'mixpanel', 'amplitude',
        'hubspot', 'marketo', 'salesforce marketing cloud', 'mailchimp',
        'hootsuite', 'sprout social', 'semrush', 'ahrefs', 'moz',
        'google tag manager', 'hotjar', 'optimizely',

        # Strategy
        'brand management', 'brand strategy', 'go to market strategy',
        'customer acquisition', 'customer retention', 'lifecycle marketing',
        'marketing automation', 'lead generation', 'demand generation',
        'account based marketing', 'abm', 'product marketing',
        'market segmentation', 'customer journey', 'buyer persona',
        'campaign management', 'editorial calendar', 'content strategy',

        # Metrics
        'roi', 'roas', 'cpc', 'ctr', 'cpa', 'customer lifetime value', 'ltv',
        'conversion rate', 'engagement rate', 'net promoter score', 'nps',
        'marketing qualified lead', 'mql', 'sales qualified lead',
    },

    # ── Human Resources / People Ops ──────────────────────────────────────────
    'human_resources': {
        # Core HR
        'talent acquisition', 'recruitment', 'talent management',
        'performance management', 'compensation and benefits',
        'total rewards', 'employee relations', 'learning and development', 'l&d',
        'organizational development', 'succession planning',
        'workforce planning', 'hr strategy', 'people operations',
        'employee engagement', 'culture building', 'diversity and inclusion',
        'dei', 'equity and inclusion', 'employee experience',
        'hris', 'hr information system', 'people analytics',

        # Tools / ATS
        'workday', 'successfactors', 'bamboohr', 'greenhouse', 'lever',
        'icims', 'taleo', 'linkedin recruiter', 'applicant tracking system',
        'adp', 'paylocity', 'gusto', 'rippling',

        # Skills & Practices
        'behavioral interviewing', 'competency framework', 'job analysis',
        'salary benchmarking', 'benefits administration', 'onboarding',
        'offboarding', 'employment law', 'labor relations', 'cobra',
        'fmla', 'conflict resolution', 'coaching', 'mentoring',

        # Certifications
        'shrm-cp', 'shrm-scp', 'phr', 'sphr', 'shrm',
    },

    # ── Sales / Business Development ─────────────────────────────────────────
    'sales_business_dev': {
        # Sales
        'sales strategy', 'business development', 'account management',
        'enterprise sales', 'b2b sales', 'b2c sales', 'saas sales',
        'inside sales', 'field sales', 'channel sales', 'partner sales',
        'solution selling', 'consultative selling', 'value selling',
        'sales cycle', 'pipeline management', 'sales forecasting',
        'territory management', 'quota attainment', 'revenue growth',
        'cold calling', 'cold outreach', 'prospecting', 'lead qualification',
        'contract negotiation', 'closing deals', 'upselling', 'cross selling',

        # Tools
        'salesforce', 'hubspot crm', 'outreach', 'salesloft', 'gong',
        'chorus', 'zoominfo', 'linkedin sales navigator', 'apollo',
        'crm', 'customer relationship management',

        # Metrics
        'annual recurring revenue', 'arr', 'monthly recurring revenue', 'mrr',
        'net revenue retention', 'nrr', 'customer acquisition cost', 'cac',
        'customer lifetime value', 'churn rate', 'win rate',

        # BD
        'strategic partnerships', 'strategic alliances', 'rfp',
        'proposal writing', 'account expansion', 'customer success',
    },

    # ── Operations / Supply Chain / Project Management ─────────────────────────
    'operations': {
        # Operations
        'operations management', 'process improvement', 'lean', 'six sigma',
        'lean six sigma', 'kaizen', 'supply chain management', 'logistics',
        'procurement', 'strategic sourcing', 'vendor management',
        'inventory management', 'warehouse management', 'demand planning',
        'capacity planning', 'production planning', 'quality management',
        'quality assurance', 'iso 9001', 'iso 27001', 'continuous improvement',

        # Project Management
        'project management', 'program management', 'portfolio management',
        'agile', 'scrum', 'kanban', 'waterfall', 'pmp', 'prince2',
        'risk management', 'change management', 'stakeholder management',
        'resource planning', 'budget management', 'cross functional',
        'executive communication', 'project planning', 'milestone tracking',

        # Tools
        'sap', 'oracle erp', 'erp', 'jira', 'asana', 'monday.com',
        'ms project', 'smartsheet', 'confluence', 'notion',
        'wms', 'tms', 'ariba',

        # Certifications
        'pmp', 'prince2', 'csm', 'certified scrum master', 'safe',
        'lean six sigma green belt', 'lean six sigma black belt',
    },

    # ── Healthcare / Life Sciences ────────────────────────────────────────────
    'healthcare': {
        # Clinical / Medical
        'clinical research', 'clinical trials', 'patient care',
        'healthcare management', 'electronic health records', 'ehr', 'emr',
        'hipaa', 'regulatory compliance', 'medical coding', 'icd-10',
        'cpt codes', 'healthcare analytics', 'population health',
        'care coordination', 'case management', 'telemedicine',
        'medical writing', 'pharmacovigilance', 'biostatistics',
        'good clinical practice', 'gcp', 'gmp', 'fda regulations',

        # Systems & Standards
        'epic', 'cerner', 'meditech', 'athenahealth', 'fhir', 'hl7',
        'clinical data management', 'clinical data management system', 'cdms',
        'drug safety', 'adverse event reporting', 'clinical operations',

        # Certifications
        'rhia', 'rhit', 'cphq', 'cdip', 'cpc',
    },

    # ── Legal / Compliance ────────────────────────────────────────────────────
    'legal': {
        'contract law', 'contract drafting', 'contract review',
        'corporate law', 'mergers and acquisitions', 'intellectual property',
        'patent law', 'trademark law', 'employment law', 'labor law',
        'regulatory compliance', 'compliance management', 'risk and compliance',
        'litigation', 'dispute resolution', 'arbitration', 'mediation',
        'legal research', 'legal writing', 'due diligence',
        'corporate governance', 'privacy law', 'gdpr', 'ccpa',
        'antitrust', 'securities law', 'financial regulations', 'aml',
        'know your customer', 'kyc', 'legal operations', 'e-discovery',
    },

    # ── Education / Training ──────────────────────────────────────────────────
    'education': {
        'curriculum development', 'instructional design', 'e-learning',
        'learning management system', 'lms', 'training and development',
        'learning and development', 'adult learning', 'blended learning',
        'assessments', 'student outcomes', 'educational technology',
        'special education', 'differentiated instruction',
        'articulate storyline', 'captivate', 'canvas', 'blackboard',
        'moodle', 'google classroom',
    },

    # ── General / Cross-domain ────────────────────────────────────────────────
    'general': {
        # Universal soft skills (appear in almost every JD)
        'leadership', 'team leadership', 'people leadership',
        'communication', 'written communication', 'verbal communication',
        'interpersonal skills', 'presentation skills', 'public speaking',
        'problem solving', 'critical thinking', 'analytical thinking',
        'creative thinking', 'systems thinking',
        'time management', 'prioritization', 'multitasking',
        'adaptability', 'flexibility', 'resilience',
        'attention to detail', 'detail oriented', 'accuracy',
        'organizational skills', 'self management', 'self motivated',
        'collaboration', 'teamwork', 'team player',
        'cross functional collaboration', 'cross functional teams',
        'stakeholder communication', 'stakeholder engagement',
        'decision making', 'strategic thinking', 'strategic planning',
        'innovation', 'creativity', 'continuous learning',
        'conflict resolution', 'negotiation', 'influence',
        'customer focus', 'customer service', 'client management',
        'relationship building', 'networking',
        'mentoring', 'coaching', 'knowledge transfer',
        'results driven', 'goal oriented', 'accountability',
        'initiative', 'proactive', 'fast paced environment',
        'deadline driven', 'high pressure environment',

        # Universal productivity / collaboration tools
        'microsoft office', 'microsoft 365', 'office 365',
        'google workspace', 'google suite', 'g suite',
        'microsoft teams', 'ms teams', 'slack', 'zoom', 'webex', 'google meet',
        'microsoft outlook', 'gmail',
        'sharepoint', 'sharepoint online', 'onedrive', 'google drive', 'dropbox', 'box',
        'microsoft excel', 'excel', 'google sheets', 'spreadsheets',
        'microsoft word', 'google docs',
        'microsoft powerpoint', 'powerpoint', 'google slides',
        'power automate', 'power apps', 'microsoft power platform', 'power platform',
        'active directory', 'azure active directory', 'azure ad', 'ldap',
        'servicenow', 'zendesk', 'freshdesk', 'intercom', 'hubspot',
        'trello', 'basecamp', 'clickup', 'linear', 'wrike',
        'miro', 'lucidchart', 'draw.io', 'figma',
        'loom', 'notion', 'coda',
        'windows server', 'linux server', 'macos',
        'microsoft azure', 'azure devops',

        # Cross-domain professional skills
        'data driven', 'data driven decision making', 'evidence based',
        'process improvement', 'continuous improvement', 'kaizen',
        'best practices', 'standard operating procedures', 'sop',
        'documentation', 'knowledge management',
        'workflow automation', 'workflow optimization',
        'remote work', 'distributed teams', 'hybrid work', 'virtual teams',
        'change management', 'organizational change',
        'budget management', 'cost management', 'financial oversight',
        'resource allocation', 'resource management',
        'vendor management', 'contract management', 'procurement',
        'compliance', 'regulatory compliance', 'audit',
        'quality assurance', 'quality control', 'qa qc',
        'reporting', 'executive reporting', 'board reporting',
        'metrics', 'kpi', 'okr', 'performance metrics', 'dashboards',
        'training', 'onboarding', 'enablement',
        'api integration', 'system integration', 'erp implementation',

        # Professional credentials (generic)
        'mba', 'masters degree', 'bachelor degree',
        'pmp certified', 'six sigma', 'lean six sigma',
    },
}

# Flat set of all keywords for fast O(1) lookup during n-gram matching.
ALL_PROFESSIONAL_KEYWORDS: set = {
    kw for domain_kws in DOMAIN_KEYWORDS.values() for kw in domain_kws
}
