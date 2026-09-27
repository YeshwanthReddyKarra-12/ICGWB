const db = require('./config/database');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  console.log('Seeding Indian Education System data into ICGWB database...');

  // Ensure tables exist
  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(120) NOT NULL,
      email VARCHAR(160) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'student' CHECK(role IN ('student', 'admin')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name VARCHAR(100) NOT NULL UNIQUE,
      icon VARCHAR(50) DEFAULT 'bi-briefcase',
      description TEXT
    );
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS careers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      title VARCHAR(150) NOT NULL,
      stream VARCHAR(120) NOT NULL,
      overview TEXT NOT NULL,
      required_skills TEXT,
      job_roles TEXT,
      salary_range VARCHAR(100),
      job_growth_outlook VARCHAR(100),
      education_path TEXT,
      image_url VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      career_id INTEGER,
      category_id INTEGER NOT NULL,
      name VARCHAR(150) NOT NULL,
      degree_level VARCHAR(80) NOT NULL,
      duration VARCHAR(50) NOT NULL,
      eligibility TEXT NOT NULL,
      required_subjects TEXT NOT NULL,
      top_colleges TEXT NOT NULL,
      admission_process TEXT,
      avg_fee VARCHAR(100),
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (career_id) REFERENCES careers(id) ON DELETE SET NULL,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      item_type VARCHAR(20) NOT NULL CHECK(item_type IN ('career', 'course')),
      item_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, item_type, item_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await db.runAsync(`
    CREATE TABLE IF NOT EXISTS guidance_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      student_name VARCHAR(120) NOT NULL,
      student_email VARCHAR(160) NOT NULL,
      student_phone VARCHAR(40),
      current_education VARCHAR(100),
      interested_stream VARCHAR(100),
      message TEXT NOT NULL,
      status VARCHAR(30) DEFAULT 'Pending' CHECK(status IN ('Pending', 'In Review', 'Resolved')),
      counsellor_reply TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // Clear existing content to refresh with Indian Education System data
  await db.runAsync('DELETE FROM courses');
  await db.runAsync('DELETE FROM careers');
  await db.runAsync('DELETE FROM categories');
  await db.runAsync('DELETE FROM sqlite_sequence WHERE name IN ("categories", "careers", "courses")');

  // Check / seed default users
  const existingAdmin = await db.getAsync('SELECT id FROM users WHERE email = ?', ['admin@icgwb.edu']);
  if (!existingAdmin) {
    const adminHash = bcrypt.hashSync('admin123', 10);
    const studentHash = bcrypt.hashSync('student123', 10);

    await db.runAsync(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Portal Administrator', 'admin@icgwb.edu', adminHash, 'admin']
    );

    await db.runAsync(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      ['Aarav Sharma', 'student@example.com', studentHash, 'student']
    );
    console.log('Default Indian student and admin users created.');
  }

  // 1. INDIAN EDUCATION SYSTEM CATEGORIES
  const categories = [
    {
      name: 'Engineering & Technology',
      icon: 'bi-gear-wide-connected',
      description: 'B.Tech / B.E degrees via JEE Main & Advanced, GATE, State Engineering CETs for IT, core & emerging tech.'
    },
    {
      name: 'Medical & Healthcare (NEET UG/PG)',
      icon: 'bi-heart-pulse',
      description: 'MBBS, BDS, BAMS, BHMS, B.Pharm, and Allied Healthcare programs via NEET UG and state counseling.'
    },
    {
      name: 'Commerce, Accounting & Finance',
      icon: 'bi-graph-up-arrow',
      description: 'Chartered Accountancy (ICAI CA), Company Secretary (CS), B.Com (Hons), BBA, and MBA via CAT.'
    },
    {
      name: 'Civil Services & Defence (UPSC / NDA)',
      icon: 'bi-shield-shaded',
      description: 'National Defence Academy (NDA), Combined Defence Services (CDS), and UPSC Civil Services (IAS/IPS/IFS).'
    },
    {
      name: 'Law & Judicial Services (CLAT / AILET)',
      icon: 'bi-bank2',
      description: '5-Year Integrated B.A. LL.B / B.B.A. LL.B through CLAT into National Law Universities (NLUs).'
    },
    {
      name: 'Design, Architecture & Media',
      icon: 'bi-palette',
      description: 'B.Arch via NATA/JEE Paper 2, B.Des via UCEED/NID DAT, and Media/Journalism via CUET.'
    },
    {
      name: 'Pure Sciences, Research & Agriculture',
      icon: 'bi-radioactive',
      description: 'B.Sc (Hons), BS-MS Dual Degrees at IISc/IISERs via IAT/JEE, and ICAR Agricultural Sciences.'
    }
  ];

  for (const cat of categories) {
    await db.runAsync(
      'INSERT INTO categories (name, icon, description) VALUES (?, ?, ?)',
      [cat.name, cat.icon, cat.description]
    );
  }
  console.log('Indian academic categories seeded.');

  const catRows = await db.allAsync('SELECT id, name FROM categories');
  const catMap = {};
  catRows.forEach(c => { catMap[c.name] = c.id; });

  // 2. INDIAN CAREER PATHWAYS
  const careers = [
    {
      title: 'Software Development Engineer (SDE)',
      category_id: catMap['Engineering & Technology'],
      stream: 'Science (PCM / MPC)',
      overview: 'Develop scalable web platforms, operating systems, mobile applications, and enterprise software for top tech giants, Indian IT MNCs, and high-growth unicorns.',
      required_skills: 'Data Structures & Algorithms (DSA), Java/C++, Python, React, System Design, SQL, Git',
      job_roles: 'SDE-1, Full Stack Developer, Backend Architect, DevOps Engineer, Engineering Manager',
      salary_range: '₹6 LPA - ₹45 LPA (Avg: ₹12 LPA)',
      job_growth_outlook: '24% annual growth (Top employer across Bengaluru, Hyderabad, Pune, Gurugram)',
      education_path: '10+2 with PCM -> Clear JEE Main / JEE Advanced / BITSAT / State CET -> 4-Year B.Tech in CSE / IT -> Campus Placements / Off-campus hiring',
      image_url: '/images/sde_india.svg'
    },
    {
      title: 'Medical Doctor & Specialist Physician (MBBS)',
      category_id: catMap['Medical & Healthcare (NEET UG/PG)'],
      stream: 'Science (PCB / BiPC)',
      overview: 'Diagnose illnesses, perform life-saving treatments, prescribe pharmaceutical remedies, and practice medicine in premier government and private multi-specialty hospitals.',
      required_skills: 'Human Anatomy, Clinical Diagnostics, Pharmacology, Emergency Trauma Care, Empathy, Surgical Dexterity',
      job_roles: 'Junior Resident, Medical Officer, General Physician, Cardiologist, Orthopedic Surgeon',
      salary_range: '₹8 LPA - ₹35 LPA + Private Practice (MD/MS Specialists ₹25-60 LPA)',
      job_growth_outlook: 'Recession-proof, high social respect and nationwide demand across Tier 1 to Tier 3 cities',
      education_path: '10+2 with PCB (min 50% aggregate) -> Qualify NEET UG Exam -> 4.5 Yrs MBBS + 1 Yr Compulsory Rotating Medical Internship (CRMI) -> NEET PG for MD/MS specialization',
      image_url: '/images/doctor_india.svg'
    },
    {
      title: 'Indian Civil Services Officer (IAS / IPS / IFS)',
      category_id: catMap['Civil Services & Defence (UPSC / NDA)'],
      stream: 'Any Stream (Arts / Commerce / Science)',
      overview: 'Administer government departments, formulate national policies, maintain public law and order, head district collectorates, and represent India on international diplomatic missions.',
      required_skills: 'Public Administration, Indian Polity & Constitution, Analytical Decision Making, Leadership under Pressure, Crisis Response',
      job_roles: 'Sub-Divisional Magistrate (SDM), District Magistrate (DM/Collector), Superintendent of Police (SP), Joint Secretary, Ambassador',
      salary_range: 'Level 10 Pay Matrix (₹56,100 basic + DA, HRA, Official Residence, Vehicle, Z+ Security, Pension)',
      job_growth_outlook: 'Highest administrative authority, governance decision-making power, and prestigious status in India',
      education_path: '10+2 in Any Stream -> Complete any recognized 3- or 4-Year Bachelor Degree (BA, B.Sc, B.Com, B.Tech, MBBS) -> Age 21+ -> Clear UPSC Civil Services Examination (Prelims + Mains + Personality Test Interview)',
      image_url: '/images/ias_india.svg'
    },
    {
      title: 'Chartered Accountant (ICAI CA)',
      category_id: catMap['Commerce, Accounting & Finance'],
      stream: 'Commerce / Any Stream',
      overview: 'Statutory audit of corporate balance sheets, Goods & Services Tax (GST) advisory, corporate tax planning, risk management, and strategic financial restructuring.',
      required_skills: 'Financial Accounting, Auditing Standards (SA), Corporate & Economic Laws, Direct & Indirect Tax (GST), Financial Management',
      job_roles: 'Statutory Auditor, Tax Consultant, Forensic Auditor, Chief Financial Officer (CFO), Partner in Big 4 / Practicing Firm',
      salary_range: '₹8.5 LPA - ₹30 LPA (Average starting package in ICAI campus placements: ₹11.5 LPA)',
      job_growth_outlook: 'Mandatory statutory requirement under Companies Act for every registered Indian corporate firm',
      education_path: '10+2 Any Stream (Commerce preferred) -> Register with ICAI -> Clear CA Foundation -> Clear CA Intermediate -> 2-3 Years Mandatory Practical Articleship Training -> Clear CA Final Exam',
      image_url: '/images/ca_india.svg'
    },
    {
      title: 'National Defence Services Officer (Army / Navy / Air Force)',
      category_id: catMap['Civil Services & Defence (UPSC / NDA)'],
      stream: 'Science (PCM) for Navy/Air Force; Any Stream for Army',
      overview: 'Lead combat troops, command naval battleships, fly supersonic fighter jets (Su-30, Rafale), and defend Indian territorial integrity in the Armed Forces.',
      required_skills: 'Officer Like Qualities (OLQ), Physical Stamina, Strategic Tactics, Weaponry & Avionics, Comradeship, Mental Resilience',
      job_roles: 'Lieutenant (Army), Sub-Lieutenant (Navy), Flying Officer (Air Force) -> Captain, Major, Colonel / Brigadier / General',
      salary_range: 'Level 10 (₹56,100 - ₹1,77,500 + Military Service Pay ₹15,500/month + High Altitude & Flying Allowances)',
      job_growth_outlook: 'Supreme national honour, gallantry opportunities, permanent commission, healthcare (ECHS), and premier pension',
      education_path: '10+2 with PCM (Air Force/Navy) or Any Stream (Army) -> Clear UPSC NDA & NA Written Exam -> Clear 5-Day SSB Interview -> Medical Test -> 3 Years Training at NDA Khadakwasla + 1 Year at IMA / INA / AFA',
      image_url: '/images/defence_india.svg'
    },
    {
      title: 'Corporate Advocate & Legal Counsel (NLU Alumni)',
      category_id: catMap['Law & Judicial Services (CLAT / AILET)'],
      stream: 'Any Stream (Humanities / Commerce / Science)',
      overview: 'Handle high-stakes corporate mergers, cross-border commercial litigation, intellectual property rights, arbitration, and represent clients before the High Courts & Supreme Court of India.',
      required_skills: 'Legal Drafting, Constitutional Law, Commercial Contracts, Advocacy, Cross-examination, Negotiation, Case Research',
      job_roles: 'Legal Associate, In-House Corporate Counsel, Litigation Advocate, Compliance Officer, Law Firm Partner',
      salary_range: '₹7 LPA - ₹25 LPA (Top Tier-1 Indian Law Firms pay ₹15-18 LPA starting)',
      job_growth_outlook: '18% rapid corporate legal market expansion across Mumbai, Delhi NCR, and Bengaluru',
      education_path: '10+2 in Any Stream (min 45% marks) -> Crack Common Law Admission Test (CLAT) or AILET -> 5-Year Integrated B.A. LL.B / B.B.A. LL.B from a National Law University -> Enroll in State Bar Council -> Clear All India Bar Exam (AIBE)',
      image_url: '/images/law_india.svg'
    },
    {
      title: 'Data Scientist & Machine Learning Specialist',
      category_id: catMap['Engineering & Technology'],
      stream: 'Science (PCM / MPC)',
      overview: 'Build generative AI, neural networks, predictive models, and big data systems powering Indian digital revolution (UPI, FinTech, E-Commerce, Healthcare).',
      required_skills: 'Python, R, Linear Algebra, Probability & Statistics, PyTorch, SQL, Big Data Hadoop/Spark, LLMs',
      job_roles: 'Data Analyst, Machine Learning Engineer, NLP Scientist, Chief Data Officer',
      salary_range: '₹8 LPA - ₹40 LPA (Avg: ₹14 LPA)',
      job_growth_outlook: '33% massive expansion driven by digital public infrastructure (India Stack) and global R&D centers',
      education_path: '10+2 PCM (Strong Math) -> B.Tech CSE (Data Science/AI) or B.Stat/B.Math from ISI Kolkata -> M.Tech / Direct Campus Placement',
      image_url: '/images/data_science_india.svg'
    },
    {
      title: 'Aerospace Engineer & Space Research Scientist (ISRO / DRDO)',
      category_id: catMap['Engineering & Technology'],
      stream: 'Science (PCM / MPC)',
      overview: 'Design launch vehicles (PSLV, LVM3), satellites (Chandrayaan, Gaganyaan), cryogenic rocket engines, guided missiles, and defence aviation.',
      required_skills: 'Aerodynamics, Propulsion Systems, Orbital Mechanics, Computational Fluid Dynamics (CFD), MATLAB, Structural Dynamics',
      job_roles: 'Scientist / Engineer ‘SC’ (ISRO), Defence Scientist (DRDO), Avionics Engineer, Flight Mechanics Specialist',
      salary_range: '₹8 LPA - ₹22 LPA (ISRO Scientist ‘SC’ Level 10 Pay Matrix + Research Allowances, Quarters & Medical)',
      job_growth_outlook: 'Booming space economy following Indian Space Policy 2023 and private spacetech startups',
      education_path: '10+2 with PCM (min 75% marks) -> JEE Advanced -> B.Tech in Aerospace/Avionics at IIST Thiruvananthapuram (Direct absorption into ISRO) or IIT Bombay/Madras -> Scientist recruitment',
      image_url: '/images/isro_aerospace.svg'
    },
    {
      title: 'Investment Banker & Equity Research Analyst (IIM / Top B-Schools)',
      category_id: catMap['Commerce, Accounting & Finance'],
      stream: 'Commerce / Science / Any with Math',
      overview: 'Structure multi-crore Initial Public Offerings (IPOs) on NSE/BSE, execute corporate mergers & acquisitions, and manage venture capital/private equity funds.',
      required_skills: 'Financial Modeling, DCF Valuation, Pitch Books, Capital Market Regulations (SEBI), Equity Research, Excel VBA',
      job_roles: 'Investment Banking Analyst, Associate, Portfolio Manager, Venture Capital Associate, Managing Director',
      salary_range: '₹12 LPA - ₹50 LPA + Heavy Performance Bonuses (IIM A/B/C grads earn ₹28-35 LPA base)',
      job_growth_outlook: 'Rapid growth due to Indian stock markets hitting record market caps and active startup ecosystem',
      education_path: '10+2 with Math -> B.Com (Hons) at SRCC / BBA / B.Tech from Tier-1 college -> Score 99+ percentile in CAT Exam -> 2-Year MBA/PGDM from IIM Ahmedabad/Bangalore/Calcutta -> Bulge Bracket / Indian I-Banks',
      image_url: '/images/invest_banking_india.svg'
    },
    {
      title: 'UI/UX & Product Experience Designer (NID / IIT IDC)',
      category_id: catMap['Design, Architecture & Media'],
      stream: 'Any Stream (Science / Commerce / Arts)',
      overview: 'Design intuitive, accessible digital experiences, smartphone user interfaces, and design systems for Indian multilingual audiences and global products.',
      required_skills: 'Figma, User Research, Wireframing, Micro-interactions, Usability Testing, Information Architecture',
      job_roles: 'UI Designer, UX Researcher, Product Designer, Design Lead, Creative Director',
      salary_range: '₹6 LPA - ₹28 LPA (Avg: ₹10 LPA)',
      job_growth_outlook: '26% high demand across tech companies and digital consumer brands',
      education_path: '10+2 in Any Stream -> Clear UCEED (for IIT Bombay/Delhi/Guwahati/Hyderabad) or NID DAT (for NID Ahmedabad) -> 4-Year B.Des -> Industry Portfolio -> Product Designer',
      image_url: '/images/design_india.svg'
    },
    {
      title: 'Architect & Urban Infrastructure Planner (COA Registered)',
      category_id: catMap['Design, Architecture & Media'],
      stream: 'Science (PCM / MPC)',
      overview: 'Conceive sustainable residential towers, airport terminals, smart cities, and heritage conservation projects registered under the Council of Architecture (COA).',
      required_skills: 'AutoCAD, Revit BIM, SketchUp, Building Byelaws, Structural Mechanics, Sustainable Architecture',
      job_roles: 'Junior Architect, Project Architect, Urban Planner, Landscape Architect, Principal Consultant',
      salary_range: '₹4.5 LPA - ₹20 LPA + Independent Architectural Practice',
      job_growth_outlook: 'Strong national growth fueled by Smart Cities Mission, PM Awas Yojana, and rapid urbanization',
      education_path: '10+2 with PCM (min 50% marks) -> Clear NATA (National Aptitude Test in Architecture) or JEE Main Paper 2 -> 5-Year B.Arch from SPA New Delhi / IIT Roorkee / CEPT -> Council of Architecture Registration',
      image_url: '/images/architecture_india.svg'
    },
    {
      title: 'Pharmacist & Drug Formulation Scientist',
      category_id: catMap['Medical & Healthcare (NEET UG/PG)'],
      stream: 'Science (PCB / PCM)',
      overview: 'Formulate, test, manufacture, and quality-assure life-saving generic medicines and vaccines in India, the recognized "Pharmacy of the World".',
      required_skills: 'Medicinal Chemistry, Pharmacovigilance, Good Manufacturing Practice (GMP), Clinical Trials, HPLC, Drug Regulatory Affairs',
      job_roles: 'R&D Formulation Scientist, Drug Inspector, Quality Control Executive, Hospital Pharmacist',
      salary_range: '₹4 LPA - ₹16 LPA (Pharma MNCs pay ₹6-12 LPA for NIPER/BITS graduates)',
      job_growth_outlook: 'India exports generics to 200+ countries; persistent pharmaceutical manufacturing expansion',
      education_path: '10+2 with PCB or PCM (min 50%) -> State Pharmacy CETs / BITSAT / NEET -> 4-Year B.Pharm -> GPAT Exam -> M.Pharm at NIPER / Top Universities -> Pharmacy Council of India (PCI) Registration',
      image_url: '/images/pharma_india.svg'
    },
    {
      title: 'Research Scientist & Mathematician (IISc / ISI / TIFR)',
      category_id: catMap['Pure Sciences, Research & Agriculture'],
      stream: 'Science (PCM / PCMB)',
      overview: 'Conduct foundational discovery in quantum physics, pure mathematics, cryptography, nanotechnology, and astrophysics at premier national research labs.',
      required_skills: 'Higher Mathematical Proofs, Statistical Modeling, Quantum Mechanics, Experimental Physics, Scientific Publishing, LaTeX',
      job_roles: 'Junior Research Fellow (JRF), Senior Research Fellow (SRF), Assistant Professor, Senior Scientist (CSIR/DAE)',
      salary_range: '₹4.5 LPA (JRF/SRF Govt Fellowship + HRA) -> ₹12 LPA - ₹25 LPA as Scientist / Professor',
      job_growth_outlook: 'Critical national research domain with prestigious funding from DST, CSIR, and DAE',
      education_path: '10+2 with PCM/PCMB -> IAT (IISER Aptitude Test) or ISI Admission Test -> 4-Year BS or 5-Year BS-MS Dual Degree at IISc Bengaluru / IISERs / ISI Kolkata -> CSIR-UGC NET / GATE -> Ph.D.',
      image_url: '/images/research_india.svg'
    }
  ];

  for (const car of careers) {
    await db.runAsync(
      `INSERT INTO careers (category_id, title, stream, overview, required_skills, job_roles, salary_range, job_growth_outlook, education_path, image_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [car.category_id, car.title, car.stream, car.overview, car.required_skills, car.job_roles, car.salary_range, car.job_growth_outlook, car.education_path, car.image_url]
    );
  }
  console.log('Indian career pathways seeded.');

  const carRows = await db.allAsync('SELECT id, title FROM careers');
  const carMap = {};
  carRows.forEach(c => { carMap[c.title] = c.id; });

  // 3. INDIAN ACADEMIC DEGREE COURSES
  const courses = [
    {
      name: 'B.Tech in Computer Science and Engineering',
      career_id: carMap['Software Development Engineer (SDE)'],
      category_id: catMap['Engineering & Technology'],
      degree_level: 'Undergraduate (UG / 4-Year AICTE Approved)',
      duration: '4 Years (8 Semesters)',
      eligibility: 'Pass 10+2 (CBSE / ICSE / State Board) with Physics, Mathematics, and Chemistry with minimum 75% for IIT/NIT/IIIT or 60% for other universities.',
      required_subjects: 'Mathematics, Physics, Chemistry (PCM / MPC)',
      top_colleges: 'IIT Bombay, IIT Delhi, IIT Madras, BITS Pilani, NIT Trichy, IIIT Hyderabad, DTU Delhi, VIT Vellore',
      admission_process: 'JEE Main (for NITs/IIITs/CFTIs) -> JEE Advanced (for IITs), BITSAT (for BITS), State CETs (MHT-CET, KCET, WBJEE)',
      avg_fee: '₹1.5 - ₹3 Lakhs total (Govt NITs/IITs with scholarships) | ₹8 - ₹16 Lakhs (Private Colleges)',
      description: 'The most sought-after technical undergraduate degree in India covering Algorithms, Data Structures, Operating Systems, Computer Networks, Database Management Systems (DBMS), and Cloud Computing.'
    },
    {
      name: 'MBBS (Bachelor of Medicine and Bachelor of Surgery)',
      career_id: carMap['Medical Doctor & Specialist Physician (MBBS)'],
      category_id: catMap['Medical & Healthcare (NEET UG/PG)'],
      degree_level: 'Undergraduate Professional (NMC Approved)',
      duration: '5.5 Years (4.5 Years Academic + 1 Year Mandatory Internship)',
      eligibility: 'Pass 10+2 with Physics, Chemistry, Biology/Biotechnology and English with minimum 50% aggregate (40% for reserved categories). Candidate must be minimum 17 years old.',
      required_subjects: 'Biology (Botany & Zoology), Chemistry, Physics, English (PCB / BiPC)',
      top_colleges: 'AIIMS New Delhi, CMC Vellore, JIPMER Puducherry, King George Medical University Lucknow, Madras Medical College, KMC Manipal',
      admission_process: 'Mandatory single national entrance examination: NEET UG conducted by NTA, followed by MCC All-India Quota (AIQ) & State Quota Counseling.',
      avg_fee: '₹1,628 total (AIIMS New Delhi) | ₹10,000 - ₹1.5 Lakh/yr (Govt Medical Colleges) | ₹12 - ₹25 Lakhs/yr (Private/Deemed Universities)',
      description: 'The premier medical degree in India recognized by the National Medical Commission (NMC). Rigorous clinical rotations across General Surgery, Pediatrics, Obstetrics & Gynecology, Pathology, and Community Medicine.'
    },
    {
      name: 'Chartered Accountancy (CA Course - ICAI)',
      career_id: carMap['Chartered Accountant (ICAI CA)'],
      category_id: catMap['Commerce, Accounting & Finance'],
      degree_level: 'Professional Qualification (ICAI Statutory Body)',
      duration: '4.5 to 5 Years (Self-paced + 2 Years Mandatory Practical Training)',
      eligibility: 'Can register after passing 10th Class and appear for CA Foundation examination after appearing in 10+2 examination in any stream.',
      required_subjects: 'Accountancy, Business Laws, Economics, Quantitative Aptitude (Any stream eligible; Commerce preferred)',
      top_colleges: 'The Institute of Chartered Accountants of India (ICAI - New Delhi Head Office & 170+ Regional Branches Nationwide)',
      admission_process: 'ICAI CA Foundation Exam -> ICAI CA Intermediate Exam (Both Groups) -> 2 Years Compulsory Articleship -> ICAI CA Final Exam -> ICAI Membership',
      avg_fee: '₹75,000 - ₹1.2 Lakhs total (ICAI registration, examination fees & study materials; articles receive monthly stipend)',
      description: 'Statutory professional certification under the Chartered Accountants Act 1949. Empowers professionals to sign statutory corporate audit reports, conduct forensic investigations, and offer direct/indirect taxation consultancy.'
    },
    {
      name: 'National Defence Academy (NDA Army / Navy / Air Force)',
      career_id: carMap['National Defence Services Officer (Army / Navy / Air Force)'],
      category_id: catMap['Civil Services & Defence (UPSC / NDA)'],
      degree_level: 'Tri-Service Military Academy Degree (JNU Accredited B.Sc / B.A / B.Tech)',
      duration: '3 Years at NDA + 1 Year at IMA / INA / AFA',
      eligibility: 'Unmarried male and female candidates aged 16.5 to 19.5 years. Passed 10+2: Any stream for Army Wing; Physics & Mathematics compulsory for Air Force and Navy Wings.',
      required_subjects: 'Mathematics & Physics (Navy/Air Force) | Any Stream (Army Wing)',
      top_colleges: 'National Defence Academy (NDA Khadakwasla, Pune, Maharashtra) - Joint Services Academy',
      admission_process: 'UPSC NDA & NA Written Examination (Math 300 marks + General Ability Test 600 marks) -> 5-Day Services Selection Board (SSB) Interview -> Detailed Military Medical Examination.',
      avg_fee: 'Free of Cost (Entire tuition, boarding, uniform, horse riding, and mess fully funded by the Government of India + Cadet Allowance)',
      description: 'The world’s premier tri-service military academy training cadets of the Indian Army, Indian Navy, and Indian Air Force together before they proceed to their respective service pre-commission training academies.'
    },
    {
      name: 'B.A. LL.B (Honours) - 5-Year Integrated Law',
      career_id: carMap['Corporate Advocate & Legal Counsel (NLU Alumni)'],
      category_id: catMap['Law & Judicial Services (CLAT / AILET)'],
      degree_level: 'Undergraduate Double Degree (BCI Approved)',
      duration: '5 Years (10 Semesters)',
      eligibility: 'Pass 10+2 (CBSE / ICSE / State Board) in any stream with minimum 45% marks (40% for SC/ST categories). No upper age limit.',
      required_subjects: 'Any Stream (English, Legal Aptitude, Logical Reasoning, Current Affairs, Elementary Math)',
      top_colleges: 'NLSIU Bengaluru, NALSAR Hyderabad, WBNUJS Kolkata, NLU Delhi, NLU Jodhpur, GNLU Gandhinagar, Symbiosis Law School Pune',
      admission_process: 'Common Law Admission Test (CLAT) conducted by the Consortium of NLUs, or AILET (for NLU Delhi), followed by Centralized Counseling.',
      avg_fee: '₹1.8 - ₹3.5 Lakhs per year (Covers academic tuition, moot court facilities, and campus residential hostel)',
      description: 'Comprehensive 5-year integrated double degree teaching Constitutional Law, Criminal Jurisprudence (IPC / Bharatiya Nyaya Sanhita), Corporate Mergers, Intellectual Property, Cyber Law, and Clinical Moot Court advocacy.'
    },
    {
      name: 'B.Com (Honours) / BBA in Finance',
      career_id: carMap['Investment Banker & Equity Research Analyst (IIM / Top B-Schools)'],
      category_id: catMap['Commerce, Accounting & Finance'],
      degree_level: 'Undergraduate (UG / NEP 2020 3 or 4-Year Honors)',
      duration: '3 to 4 Years (Under UGC FYUP NEP 2020 Framework)',
      eligibility: 'Pass 10+2 with Mathematics / Applied Mathematics / Accountancy as one of the subjects with minimum 55% marks.',
      required_subjects: 'Accountancy, Mathematics / Applied Mathematics, Business Studies, Economics, English',
      top_colleges: 'Shri Ram College of Commerce (SRCC Delhi), Lady Shri Ram College (LSR), St. Xavier’s College Mumbai, Christ University Bengaluru, Loyola College Chennai',
      admission_process: 'Common University Entrance Test (CUET UG) conducted by NTA for Delhi University & Central Universities; University Entrance for Christ/Symbiosis.',
      avg_fee: '₹15,000 - ₹35,000 per year (Delhi University colleges) | ₹1.5 - ₹3 Lakhs/year (Private Universities)',
      description: 'India’s most prestigious undergraduate commerce degree offering deep competence in Financial Accounting, Corporate Taxation, Portfolio Management, Banking Operations, and Costing.'
    },
    {
      name: 'B.Tech in Aerospace Engineering',
      career_id: carMap['Aerospace Engineer & Space Research Scientist (ISRO / DRDO)'],
      category_id: catMap['Engineering & Technology'],
      degree_level: 'Undergraduate (UG / AICTE Approved)',
      duration: '4 Years (8 Semesters)',
      eligibility: '10+2 with Physics, Chemistry, and Mathematics with minimum 75% marks in Class 12 board examination.',
      required_subjects: 'Mathematics, Physics, Chemistry (PCM / MPC)',
      top_colleges: 'Indian Institute of Space Science and Technology (IIST Thiruvananthapuram), IIT Bombay, IIT Madras, IIT Kharagpur, MIT Manipal',
      admission_process: 'JEE Main -> JEE Advanced rank list. Candidates with top ranks in JEE Advanced qualify for direct admission to IIST Thiruvananthapuram (ISRO feeder institute).',
      avg_fee: '₹60,000 - ₹2.5 Lakhs per year (Subsidized with full fee waivers for meritorious students at IIST)',
      description: 'Specialized aerospace engineering program covering space propulsion, supersonic flight mechanics, computational aerodynamics, rocket propellant chemistry, and orbital satellite systems.'
    },
    {
      name: 'B.Des (Bachelor of Design in Interaction / Product Design)',
      career_id: carMap['UI/UX & Product Experience Designer (NID / IIT IDC)'],
      category_id: catMap['Design, Architecture & Media'],
      degree_level: 'Undergraduate Professional Degree (UGC / AICTE)',
      duration: '4 Years (8 Semesters)',
      eligibility: 'Pass 10+2 in any stream (Science, Commerce, Arts/Humanities) from any recognized board in India.',
      required_subjects: 'Any Stream (Visual Aptitude, Sketching, Observation, Design Problem Solving)',
      top_colleges: 'National Institute of Design (NID Ahmedabad, Bengaluru, Kurukshetra), IDC School of Design (IIT Bombay), Department of Design (IIT Delhi), NIFT New Delhi',
      admission_process: 'UCEED (Undergraduate Common Entrance Examination for Design - for IITs) or NID DAT (Prelims + Studio Test Mains).',
      avg_fee: '₹2 - ₹3.5 Lakhs per year (includes design studios, prototyping labs, and workshops)',
      description: 'Rigorous four-year professional design degree focused on human-centered design, UI/UX interaction design, design research, physical-digital prototyping, and mobile interface ergonomics.'
    },
    {
      name: 'B.Arch (Bachelor of Architecture)',
      career_id: carMap['Architect & Urban Infrastructure Planner (COA Registered)'],
      category_id: catMap['Design, Architecture & Media'],
      degree_level: 'Undergraduate Professional Degree (COA Approved)',
      duration: '5 Years (10 Semesters)',
      eligibility: 'Pass 10+2 examination with at least 50% aggregate marks in Physics, Chemistry and Mathematics and also at least 50% marks in aggregate of the 10+2 examination.',
      required_subjects: 'Physics, Chemistry, Mathematics (PCM)',
      top_colleges: 'School of Planning and Architecture (SPA New Delhi, Bhopal, Vijayawada), IIT Roorkee, IIT Kharagpur, CEPT University Ahmedabad, Sir J.J. College of Architecture Mumbai',
      admission_process: 'NATA (National Aptitude Test in Architecture conducted by COA) or JEE Main Paper 2 (B.Arch/B.Planning for SPAs and NITs).',
      avg_fee: '₹40,000 - ₹1.5 Lakhs per year (SPA / Govt colleges) | ₹2 - ₹4 Lakhs/yr (Private institutions)',
      description: 'Five-year professional degree statutory accredited by the Council of Architecture (COA) to practice as a licensed architect in India. Focuses on architectural design studio, structural engineering, building services, and sustainable habitat.'
    },
    {
      name: 'B.Pharm (Bachelor of Pharmacy)',
      career_id: carMap['Pharmacist & Drug Formulation Scientist'],
      category_id: catMap['Medical & Healthcare (NEET UG/PG)'],
      degree_level: 'Undergraduate Professional Degree (PCI Approved)',
      duration: '4 Years (8 Semesters)',
      eligibility: 'Pass 10+2 with Physics and Chemistry along with Biology or Mathematics with at least 50% marks.',
      required_subjects: 'Physics, Chemistry, Biology OR Mathematics (PCB / PCM / PCMB)',
      top_colleges: 'Jamia Hamdard New Delhi (NIRF #1 Pharma), Panjab University Chandigarh, BITS Pilani, Manipal College of Pharmaceutical Sciences, JSS College of Pharmacy Ooty',
      admission_process: 'State Pharmacy CETs (e.g. MHT CET, KCET, WBJEE), BITSAT, NEET UG or Class 12 merit criteria.',
      avg_fee: '₹40,000 - ₹1.5 Lakhs per year (Govt/University departments) | ₹1 - ₹2.5 Lakhs/yr (Private colleges)',
      description: 'Professional program regulated by the Pharmacy Council of India (PCI) covering Pharmaceutical Chemistry, Pharmacology, Pharmacognosy, Pharmaceutics, and Drug Quality Assurance.'
    },
    {
      name: 'BS-MS Dual Degree / B.Sc (Research) in Pure Sciences',
      career_id: carMap['Research Scientist & Mathematician (IISc / ISI / TIFR)'],
      category_id: catMap['Pure Sciences, Research & Agriculture'],
      degree_level: 'Integrated Post-Graduate Dual Degree (5 Years)',
      duration: '5 Years (Integrated Master of Science)',
      eligibility: 'Passed 10+2 with Science stream (PCM / PCB / PCMB) with minimum 60% aggregate marks.',
      required_subjects: 'Physics, Chemistry, Mathematics or Biology (Science Stream)',
      top_colleges: 'Indian Institute of Science (IISc Bengaluru - NIRF #1), IISER Pune, IISER Kolkata, IISER Mohali, NISER Bhubaneswar, ISI Kolkata',
      admission_process: 'IISER Aptitude Test (IAT), JEE Advanced rank list, or KVPY/NEEST scores.',
      avg_fee: '₹35,000 - ₹75,000 per year (Eligible students receive ₹5,000/month INSPIRE / KVPY scholarship)',
      description: 'India’s premier pure scientific research curriculum integrating interdisciplinary physics, chemical sciences, biological sciences, and mathematical analysis with high-tech laboratory research.'
    }
  ];

  for (const crs of courses) {
    await db.runAsync(
      `INSERT INTO courses (career_id, category_id, name, degree_level, duration, eligibility, required_subjects, top_colleges, admission_process, avg_fee, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [crs.career_id, crs.category_id, crs.name, crs.degree_level, crs.duration, crs.eligibility, crs.required_subjects, crs.top_colleges, crs.admission_process, crs.avg_fee, crs.description]
    );
  }
  console.log('Indian academic degree courses seeded.');

  // 4. SAMPLE GUIDANCE INQUIRIES (Indian Context)
  await db.runAsync('DELETE FROM guidance_requests');
  await db.runAsync(`
    INSERT INTO guidance_requests (user_id, student_name, student_email, student_phone, current_education, interested_stream, message, status, counsellor_reply)
    VALUES 
    (2, 'Aarav Sharma', 'student@example.com', '+91 98765 43210', '11th / 12th Science (PCM / MPC)', 'Engineering & Technology', 'Sir, I am preparing for JEE Main from CBSE Board. What percentile should I target for B.Tech CSE in top NITs like Trichy, Surathkal, and Warangal?', 'In Review', 'For Top 3 NITs (Trichy, Surathkal, Warangal) in CSE Open Category, you should target a 99.5+ percentile (roughly 210-230+ marks in JEE Main). Keep IIIT Hyderabad and BITSAT as top alternatives!'),
    (NULL, 'Sanya Iyer', 'sanya.iyer@gmail.com', '+91 98123 45678', '11th / 12th Science (PCB / BiPC)', 'Medical & Healthcare (NEET UG/PG)', 'Can I pursue B.Sc Biotechnology or B.Pharm if my NEET UG rank does not make the cutoff for government MBBS seats?', 'Resolved', 'Yes, absolutely! Both B.Pharm (via State CETs or university merit) and B.Sc Biotechnology are exceptional careers with booming job opportunities in vaccine manufacturing, clinical trials, and pharmacology without requiring NEET MBBS cutoff.'),
    (NULL, 'Rohan Verma', 'rohan.v@outlook.com', '+91 97654 32109', '11th / 12th Commerce (with Math)', 'Commerce, Accounting & Finance', 'Is it feasible to prepare for CA Foundation alongside regular B.Com (Hons) in Delhi University?', 'Resolved', 'Yes, a large percentage of DU students prepare for CA Foundation during their 1st year of college. ICAI classes can be taken in morning or evening shifts before your college hours.')
  `);
  console.log('Sample Indian student guidance inquiries seeded.');

  // 5. SAMPLE FAVORITES
  await db.runAsync('DELETE FROM favorites');
  await db.runAsync(`
    INSERT INTO favorites (user_id, item_type, item_id)
    VALUES (2, 'career', 1), (2, 'career', 3), (2, 'course', 1)
  `);
  console.log('Sample favorites seeded for student.');

  console.log('✅ Successfully seeded entire Indian Education System data into database!');
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('Done.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}

module.exports = seedDatabase;
