const { PrismaClient, UserRole, OrgVerificationStatus, OpportunityType, OpportunityStatus, SkillRequirementLevel } = require('@prisma/client');

const cleanUrl = (process.env.DATABASE_URL || 'postgresql://postgres.pbmqdqyzsxchcgqaupxd:nPTOBF4SZhjB4Gzy@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true').replace(/^["']|["']$/g, '');
const prisma = new PrismaClient({
  datasources: {
    db: { url: cleanUrl },
  },
});

async function main() {
  console.log('--- Starting Database Restructuring & Curated Seeding ---');

  // 1. Clean existing dependent tables in order
  console.log('Clearing old assessment attempts & results...');
  await prisma.assessmentAnswer.deleteMany({});
  await prisma.assessmentAttempt.deleteMany({});
  await prisma.assessmentResult.deleteMany({});
  await prisma.assessmentQuestion.deleteMany({});
  await prisma.assessment.deleteMany({});

  console.log('Clearing old applications & saved opportunities...');
  await prisma.application.deleteMany({});
  await prisma.savedOpportunity.deleteMany({});
  await prisma.opportunitySkill.deleteMany({});
  await prisma.opportunity.deleteMany({});

  console.log('Clearing old notifications & reports...');
  await prisma.notification.deleteMany({});
  await prisma.report.deleteMany({});

  console.log('Clearing non-preserved student skills, experiences, and cvs...');
  // Preserve user IDs
  const PRESERVED_USER_IDS = [
    '3213e701-ca7f-4422-9c13-f7efce442751', // Yetem Student
    '859eabcf-bb3f-4590-a0a4-b74119b67bc4', // Yetem Admin
  ];

  await prisma.studentSkill.deleteMany({});
  await prisma.experience.deleteMany({});
  await prisma.cV.deleteMany({});

  console.log('Clearing old organization members & organizations...');
  await prisma.organizationMember.deleteMany({});
  await prisma.organization.deleteMany({});

  console.log('Clearing non-preserved users...');
  await prisma.studentProfile.deleteMany({
    where: {
      userId: { notIn: PRESERVED_USER_IDS },
    },
  });

  await prisma.user.deleteMany({
    where: {
      id: { notIn: PRESERVED_USER_IDS },
    },
  });

  // 2. Update Yetem's Student Profile and User
  console.log('Updating Yetem Student User & Profile...');
  const yetemUser = await prisma.user.upsert({
    where: { id: '3213e701-ca7f-4422-9c13-f7efce442751' },
    update: {
      firstName: 'Yetemgeta',
      lastName: 'Bekele',
      middleName: 'Papa',
      role: UserRole.STUDENT,
      isActive: true,
    },
    create: {
      id: '3213e701-ca7f-4422-9c13-f7efce442751',
      firstName: 'Yetemgeta',
      lastName: 'Bekele',
      middleName: 'Papa',
      role: UserRole.STUDENT,
      isActive: true,
    },
  });

  const yetemProfile = await prisma.studentProfile.upsert({
    where: { userId: yetemUser.id },
    update: {
      university: 'Addis Ababa University',
      fieldOfStudy: 'Computer Science',
      academicYear: 3,
      location: 'Addis Ababa, Ethiopia',
      careerGoals: 'Aspiring Full-Stack & Cloud Software Engineer dedicated to architecting scalable digital platforms, modern web apps, and AI-powered systems across Africa.',
      careerGoalTags: ['Software Engineering', 'Full Stack', 'Cloud Architecture', 'AI & ML'],
      interests: ['Web Development', 'Distributed Systems', 'Cloud Computing', 'AI', 'Open Source'],
      isDiscoverable: true,
    },
    create: {
      userId: yetemUser.id,
      university: 'Addis Ababa University',
      fieldOfStudy: 'Computer Science',
      academicYear: 3,
      location: 'Addis Ababa, Ethiopia',
      careerGoals: 'Aspiring Full-Stack & Cloud Software Engineer dedicated to architecting scalable digital platforms, modern web apps, and AI-powered systems across Africa.',
      careerGoalTags: ['Software Engineering', 'Full Stack', 'Cloud Architecture', 'AI & ML'],
      interests: ['Web Development', 'Distributed Systems', 'Cloud Computing', 'AI', 'Open Source'],
      isDiscoverable: true,
    },
  });

  // Update Yetem Admin User
  await prisma.user.upsert({
    where: { id: '859eabcf-bb3f-4590-a0a4-b74119b67bc4' },
    update: {
      firstName: 'Yetemgeta',
      lastName: 'Bekele',
      role: UserRole.ADMIN,
      isActive: true,
    },
    create: {
      id: '859eabcf-bb3f-4590-a0a4-b74119b67bc4',
      firstName: 'Yetemgeta',
      lastName: 'Bekele',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });

  // Create or update demo organization recruiter user (Nathnael Ashenafi @ Safaricom)
  const recruiterUserId = '080bc54e-96b3-481f-aef8-b59eb9d08391';
  const recruiterUser = await prisma.user.upsert({
    where: { id: recruiterUserId },
    update: {
      firstName: 'Nathnael',
      lastName: 'Ashenafi',
      role: UserRole.ORGANIZATION,
      isActive: true,
    },
    create: {
      id: recruiterUserId,
      firstName: 'Nathnael',
      lastName: 'Ashenafi',
      role: UserRole.ORGANIZATION,
      isActive: true,
    },
  });

  // 3. Populate Standardized Skills
  console.log('Seeding standardized master skills catalog...');
  const SKILLS_DATA = [
    // Software Engineering & Languages
    { name: 'Python', category: 'Software Engineering', description: 'General-purpose programming language for backend, scripting, and data science' },
    { name: 'TypeScript', category: 'Software Engineering', description: 'Strongly typed programming language that builds on JavaScript' },
    { name: 'JavaScript', category: 'Software Engineering', description: 'Core web programming language for client and server development' },
    { name: 'Go', category: 'Software Engineering', description: 'Fast, concurrent, compiled systems language by Google' },
    { name: 'Java', category: 'Software Engineering', description: 'Enterprise object-oriented programming language' },
    { name: 'C++', category: 'Software Engineering', description: 'High-performance systems programming language' },
    { name: 'Rust', category: 'Software Engineering', description: 'Memory-safe systems programming language' },

    // Frontend & Web Frameworks
    { name: 'React', category: 'Web & Mobile', description: 'Popular declarative component-based UI library' },
    { name: 'Next.js', category: 'Web & Mobile', description: 'React framework for server-side rendering and web applications' },
    { name: 'Node.js', category: 'Software Engineering', description: 'Asynchronous event-driven JavaScript runtime environment' },
    { name: 'NestJS', category: 'Software Engineering', description: 'Progressive Node.js framework for building efficient backend applications' },
    { name: 'Tailwind CSS', category: 'Web & Mobile', description: 'Utility-first CSS framework for rapid UI styling' },
    { name: 'Flutter', category: 'Web & Mobile', description: 'Multi-platform mobile app framework by Google' },

    // Databases & Data Engineering
    { name: 'PostgreSQL', category: 'Databases', description: 'Advanced open-source relational database management system' },
    { name: 'SQL', category: 'Databases', description: 'Standard language for storing, manipulating and retrieving data' },
    { name: 'MongoDB', category: 'Databases', description: 'Document-oriented NoSQL database system' },
    { name: 'Redis', category: 'Databases', description: 'In-memory data structure store used as a database and cache' },

    // Cloud & DevOps
    { name: 'Docker', category: 'Cloud & DevOps', description: 'Containerization platform for software packaging and deployment' },
    { name: 'Kubernetes', category: 'Cloud & DevOps', description: 'Automated container orchestration system' },
    { name: 'AWS', category: 'Cloud & DevOps', description: 'Amazon Web Services cloud computing platform' },
    { name: 'Google Cloud', category: 'Cloud & DevOps', description: 'Google Cloud Platform infrastructure and managed services' },
    { name: 'CI/CD', category: 'Cloud & DevOps', description: 'Continuous integration and continuous deployment pipelines' },
    { name: 'Git', category: 'Tools & Workflow', description: 'Distributed version control system for source code management' },
    { name: 'Linux', category: 'Tools & Workflow', description: 'Unix-like operating system family for servers and infrastructure' },

    // AI & Machine Learning
    { name: 'Machine Learning', category: 'AI & Data Science', description: 'Algorithmic models capable of learning patterns from data' },
    { name: 'Deep Learning', category: 'AI & Data Science', description: 'Multi-layered neural networks for complex classification and generation' },
    { name: 'PyTorch', category: 'AI & Data Science', description: 'Tensors and dynamic neural networks library in Python' },
    { name: 'Data Analysis', category: 'AI & Data Science', description: 'Statistical processing and exploratory data inspection' },

    // Design & Product
    { name: 'UI/UX Design', category: 'Design & Product', description: 'User interface design and user experience research' },
    { name: 'Figma', category: 'Design & Product', description: 'Collaborative cloud interface design and prototyping tool' },
    { name: 'Product Management', category: 'Design & Product', description: 'Product strategy, roadmap development, and agile backlog management' },

    // Cybersecurity
    { name: 'Cybersecurity', category: 'Cybersecurity', description: 'Protecting computer systems, networks, and data from digital attacks' },
    { name: 'Network Security', category: 'Cybersecurity', description: 'Securing network infrastructure and data in transit' },
  ];

  const skillMap = {};
  for (const s of SKILLS_DATA) {
    const record = await prisma.skill.upsert({
      where: { name: s.name },
      update: { category: s.category, description: s.description },
      create: s,
    });
    skillMap[s.name] = record.id;
  }

  // 4. Seed Verified Organizations
  console.log('Seeding verified organizations...');
  const ORGS_DATA = [
    {
      name: 'Safaricom Ethiopia',
      description: 'Leading digital communications provider driving financial inclusion, 5G connectivity, and tech innovation across Ethiopia through M-PESA and digital cloud services.',
      websiteUrl: 'https://safaricom.et',
      contactEmail: 'talent@safaricom.et',
      contactPhone: '+251 77 000 0000',
      verificationStatus: OrgVerificationStatus.APPROVED,
    },
    {
      name: 'Google',
      description: 'Global technology leader specializing in search engine technology, cloud computing, software, and hardware.',
      websiteUrl: 'https://google.com',
      contactEmail: 'students@google.com',
      contactPhone: '+1 650 253 0000',
      verificationStatus: OrgVerificationStatus.APPROVED,
    },
    {
      name: 'Spotify',
      description: 'The world\'s most popular audio streaming subscription service connecting millions of creators with billions of fans.',
      websiteUrl: 'https://spotify.com',
      contactEmail: 'earlycareers@spotify.com',
      contactPhone: '+46 8 500 0000',
      verificationStatus: OrgVerificationStatus.APPROVED,
    },
    {
      name: 'Ethiopian Airlines Digital Lab',
      description: 'The digital innovation wing of Africa\'s largest aviation group, engineering modern cloud reservation platforms, analytics, and operational systems.',
      websiteUrl: 'https://ethiopianairlines.com',
      contactEmail: 'digitalhub@ethiopianairlines.com',
      contactPhone: '+251 11 665 0000',
      verificationStatus: OrgVerificationStatus.APPROVED,
    },
    {
      name: 'Ethio Telecom',
      description: 'Ethiopia\'s premier national telecommunications and digital finance operator, pioneering the nationwide Telebirr mobile payment platform.',
      websiteUrl: 'https://ethiotelecom.et',
      contactEmail: 'careers@ethiotelecom.et',
      contactPhone: '+251 11 550 0000',
      verificationStatus: OrgVerificationStatus.APPROVED,
    },
    {
      name: 'African Leadership Academy',
      description: 'Pan-African institution developing the next generation of entrepreneurial leaders, researchers, and changemakers across the continent.',
      websiteUrl: 'https://africanleadershipacademy.org',
      contactEmail: 'fellowships@ala.org',
      contactPhone: '+27 11 699 3000',
      verificationStatus: OrgVerificationStatus.APPROVED,
    },
  ];

  const orgMap = {};
  for (const org of ORGS_DATA) {
    const record = await prisma.organization.upsert({
      where: { name: org.name },
      update: {
        description: org.description,
        websiteUrl: org.websiteUrl,
        contactEmail: org.contactEmail,
        verificationStatus: org.verificationStatus,
      },
      create: org,
    });
    orgMap[org.name] = record.id;
  }

  // Link Recruiter to Safaricom Ethiopia
  console.log('Linking recruiter to Safaricom Ethiopia...');
  await prisma.organizationMember.upsert({
    where: { organizationId: orgMap['Safaricom Ethiopia'] },
    update: { userId: recruiterUser.id },
    create: {
      organizationId: orgMap['Safaricom Ethiopia'],
      userId: recruiterUser.id,
    },
  });

  // 5. Seed High-Quality Curated Opportunities
  console.log('Seeding 16 curated opportunities with skill mappings...');

  const OPPORTUNITIES_DATA = [
    {
      orgName: 'Safaricom Ethiopia',
      title: 'Full-Stack Software Engineering Intern',
      description: 'Join Safaricom Ethiopia’s digital engineering squad building high-throughput services and web interfaces for millions of users. You will collaborate with senior engineers to design RESTful microservices, optimize database schemas, and deliver responsive React web applications.',
      opportunityType: OpportunityType.INTERNSHIP,
      location: 'Addis Ababa, Ethiopia',
      isRemote: false,
      compensation: 'ETB 18,000 / month + Transport Allowance',
      minimumAcademicYear: 3,
      maximumAcademicYear: 5,
      minimumGpa: 3.2,
      eligibleFields: ['Computer Science', 'Software Engineering', 'Information Technology', 'Electrical Engineering'],
      applicationDeadline: new Date('2026-11-30T23:59:59.000Z'),
      requiredSkills: ['Python', 'React', 'PostgreSQL', 'Git'],
      preferredSkills: ['TypeScript', 'Docker'],
    },
    {
      orgName: 'Safaricom Ethiopia',
      title: 'Cloud & DevOps Apprentice',
      description: 'Work with the cloud platform team to deploy, monitor, and scale containerized services across Kubernetes clusters. Hands-on experience with automated CI/CD pipelines, Docker, and infrastructure reliability.',
      opportunityType: OpportunityType.INTERNSHIP,
      location: 'Addis Ababa, Ethiopia',
      isRemote: false,
      compensation: 'ETB 16,500 / month',
      minimumAcademicYear: 3,
      maximumAcademicYear: 5,
      minimumGpa: 3.0,
      eligibleFields: ['Computer Science', 'Software Engineering', 'Computer Engineering'],
      applicationDeadline: new Date('2026-12-15T23:59:59.000Z'),
      requiredSkills: ['Docker', 'Linux', 'Git', 'CI/CD'],
      preferredSkills: ['Kubernetes', 'Python', 'AWS'],
    },
    {
      orgName: 'Spotify',
      title: 'Product Design Intern (Summer 2026)',
      description: 'Help shape the audio discovery experience for over 600 million music and podcast listeners. You will conduct user research, craft responsive design systems in Figma, and build prototypes that bridge design and engineering.',
      opportunityType: OpportunityType.INTERNSHIP,
      location: 'Stockholm, Sweden / Remote',
      isRemote: true,
      compensation: 'Competitive Global Internship Stipend',
      minimumAcademicYear: 2,
      maximumAcademicYear: 5,
      minimumGpa: 3.0,
      eligibleFields: ['Design', 'Computer Science', 'Human-Computer Interaction'],
      applicationDeadline: new Date('2026-11-15T23:59:59.000Z'),
      requiredSkills: ['UI/UX Design', 'Figma'],
      preferredSkills: ['React', 'JavaScript'],
    },
    {
      orgName: 'Google',
      title: 'Google Summer of Code 2026',
      description: 'An international program bringing student developers into open-source software development. Spend your summer writing code, learning from global mentors, and making real-world impact across prominent open-source ecosystems.',
      opportunityType: OpportunityType.FELLOWSHIP,
      location: 'Global (Open Worldwide)',
      isRemote: true,
      compensation: '$3,000 USD Stipend',
      minimumAcademicYear: 1,
      maximumAcademicYear: 6,
      minimumGpa: 2.8,
      eligibleFields: ['Computer Science', 'Software Engineering', 'Mathematics', 'Physics', 'Information Systems'],
      applicationDeadline: new Date('2026-11-20T23:59:59.000Z'),
      requiredSkills: ['Python', 'Git'],
      preferredSkills: ['C++', 'Rust', 'Go'],
    },
    {
      orgName: 'Ethiopian Airlines Digital Lab',
      title: 'Junior Backend API Developer',
      description: 'Architect and modernize high-volume transactional APIs for ticket booking, cargo management, and passenger apps. You will build with Node.js/NestJS and PostgreSQL, ensuring sub-second response times and 99.99% availability.',
      opportunityType: OpportunityType.JOB,
      location: 'Bole, Addis Ababa',
      isRemote: false,
      compensation: 'ETB 25,000 - 32,000 / month',
      minimumAcademicYear: 4,
      maximumAcademicYear: 5,
      minimumGpa: 3.3,
      eligibleFields: ['Computer Science', 'Software Engineering'],
      applicationDeadline: new Date('2026-12-01T23:59:59.000Z'),
      requiredSkills: ['TypeScript', 'Node.js', 'PostgreSQL', 'Git'],
      preferredSkills: ['NestJS', 'Docker', 'Redis'],
    },
    {
      orgName: 'Ethio Telecom',
      title: 'Telebirr Mobile Engineering Intern',
      description: 'Contribute to Ethiopia’s leading mobile money platform serving 40+ million citizens. Develop and optimize cross-platform mobile experiences with Flutter, test biometric authentications, and improve financial UX.',
      opportunityType: OpportunityType.INTERNSHIP,
      location: 'Addis Ababa, Ethiopia',
      isRemote: false,
      compensation: 'ETB 15,000 / month',
      minimumAcademicYear: 2,
      maximumAcademicYear: 5,
      minimumGpa: 3.0,
      eligibleFields: ['Computer Science', 'Software Engineering', 'Information Technology'],
      applicationDeadline: new Date('2026-11-25T23:59:59.000Z'),
      requiredSkills: ['Flutter', 'JavaScript', 'Git'],
      preferredSkills: ['TypeScript', 'UI/UX Design'],
    },
    {
      orgName: 'Google',
      title: 'Machine Learning Research Fellow',
      description: 'Collaborate with researchers on applied natural language processing and computer vision models. Develop benchmarks using PyTorch, analyze training convergence on large-scale datasets, and co-author technical whitepapers.',
      opportunityType: OpportunityType.FELLOWSHIP,
      location: 'Remote / Accra Research Lab',
      isRemote: true,
      compensation: '$2,500 USD / month',
      minimumAcademicYear: 3,
      maximumAcademicYear: 6,
      minimumGpa: 3.5,
      eligibleFields: ['Computer Science', 'Artificial Intelligence', 'Mathematics', 'Statistics'],
      applicationDeadline: new Date('2026-12-30T23:59:59.000Z'),
      requiredSkills: ['Python', 'Machine Learning', 'PyTorch', 'Data Analysis'],
      preferredSkills: ['Deep Learning', 'Docker'],
    },
    {
      orgName: 'African Leadership Academy',
      title: 'Pan-African Social Innovation Hackathon',
      description: '48-hour competitive innovation challenge tackling university education access, youth unemployment, and climate tech across Africa. Top 3 teams receive seed grants and venture mentorship.',
      opportunityType: OpportunityType.HACKATHON,
      location: 'Hybrid (Addis Ababa Hub & Online)',
      isRemote: true,
      compensation: '$5,000 USD Seed Prize Pool',
      minimumAcademicYear: 1,
      maximumAcademicYear: 6,
      minimumGpa: 2.5,
      eligibleFields: ['All Fields of Study'],
      applicationDeadline: new Date('2026-11-10T23:59:59.000Z'),
      requiredSkills: ['Git'],
      preferredSkills: ['React', 'Python', 'Product Management'],
    },
    {
      orgName: 'Spotify',
      title: 'Frontend Web Engineering Intern',
      description: 'Build web playback surfaces and community engagement features using React, Next.js, and TypeScript. Learn how Spotify ships reliable web software tested by millions daily.',
      opportunityType: OpportunityType.INTERNSHIP,
      location: 'London, UK / Remote',
      isRemote: true,
      compensation: 'Competitive Monthly Stipend',
      minimumAcademicYear: 2,
      maximumAcademicYear: 5,
      minimumGpa: 3.2,
      eligibleFields: ['Computer Science', 'Software Engineering'],
      applicationDeadline: new Date('2026-11-28T23:59:59.000Z'),
      requiredSkills: ['React', 'TypeScript', 'JavaScript', 'Tailwind CSS'],
      preferredSkills: ['Next.js', 'Git'],
    },
    {
      orgName: 'Ethio Telecom',
      title: 'Cybersecurity Defense Trainee',
      description: 'Join the telecom Security Operations Center (SOC). Monitor network intrusion attempts, evaluate vulnerability scan reports, and practice incident mitigation on carrier-grade telecommunications backbones.',
      opportunityType: OpportunityType.TRAINING,
      location: 'Churchill Road, Addis Ababa',
      isRemote: false,
      compensation: 'Full Tuition Waiver + Living Stipend',
      minimumAcademicYear: 3,
      maximumAcademicYear: 5,
      minimumGpa: 3.0,
      eligibleFields: ['Computer Science', 'Cybersecurity', 'Electrical Engineering'],
      applicationDeadline: new Date('2026-12-10T23:59:59.000Z'),
      requiredSkills: ['Cybersecurity', 'Network Security', 'Linux'],
      preferredSkills: ['Python', 'Git'],
    },
    {
      orgName: 'African Leadership Academy',
      title: 'Youth Leadership & Tech Fellowship',
      description: 'A prestigious 9-month leadership accelerator designed for university seniors and graduates. Combines entrepreneurial training, digital venture creation, and direct placement with high-growth African startups.',
      opportunityType: OpportunityType.FELLOWSHIP,
      location: 'Johannesburg, South Africa & Remote',
      isRemote: true,
      compensation: 'Fully Funded ($18,000 USD Annual Value)',
      minimumAcademicYear: 4,
      maximumAcademicYear: 6,
      minimumGpa: 3.4,
      eligibleFields: ['Computer Science', 'Business Administration', 'Economics', 'Engineering'],
      applicationDeadline: new Date('2026-12-20T23:59:59.000Z'),
      requiredSkills: ['Product Management'],
      preferredSkills: ['Data Analysis', 'Python'],
    },
    {
      orgName: 'Ethiopian Airlines Digital Lab',
      title: 'Data & Business Intelligence Intern',
      description: 'Analyze flight performance metrics, passenger traffic patterns, and operational efficiency dashboards. Clean and query data using SQL and Python to deliver actionable executive intelligence.',
      opportunityType: OpportunityType.INTERNSHIP,
      location: 'Addis Ababa, Ethiopia',
      isRemote: false,
      compensation: 'ETB 17,000 / month',
      minimumAcademicYear: 3,
      maximumAcademicYear: 5,
      minimumGpa: 3.2,
      eligibleFields: ['Computer Science', 'Information Systems', 'Statistics', 'Economics'],
      applicationDeadline: new Date('2026-12-05T23:59:59.000Z'),
      requiredSkills: ['SQL', 'Python', 'Data Analysis'],
      preferredSkills: ['PostgreSQL', 'Machine Learning'],
    },
  ];

  for (const item of OPPORTUNITIES_DATA) {
    const orgId = orgMap[item.orgName];
    if (!orgId) continue;

    const opp = await prisma.opportunity.create({
      data: {
        organizationId: orgId,
        title: item.title,
        description: item.description,
        opportunityType: item.opportunityType,
        status: OpportunityStatus.PUBLISHED,
        location: item.location,
        isRemote: item.isRemote,
        compensation: item.compensation,
        minimumAcademicYear: item.minimumAcademicYear,
        maximumAcademicYear: item.maximumAcademicYear,
        minimumGpa: item.minimumGpa,
        eligibleFields: item.eligibleFields,
        applicationDeadline: item.applicationDeadline,
      },
    });

    // Attach required skills
    for (const skillName of item.requiredSkills) {
      const sId = skillMap[skillName];
      if (sId) {
        await prisma.opportunitySkill.create({
          data: {
            opportunityId: opp.id,
            skillId: sId,
            requirementLevel: SkillRequirementLevel.REQUIRED,
          },
        });
      }
    }

    // Attach preferred skills
    for (const skillName of item.preferredSkills) {
      const sId = skillMap[skillName];
      if (sId) {
        await prisma.opportunitySkill.create({
          data: {
            opportunityId: opp.id,
            skillId: sId,
            requirementLevel: SkillRequirementLevel.PREFERRED,
          },
        });
      }
    }
  }

  // 6. Attach Student Skills to Yetem
  console.log('Attaching student skills to Yetem profile for high match rating...');
  const YETEM_SKILLS = [
    { name: 'Python', proficiency: 4, years: 2.0 },
    { name: 'React', proficiency: 5, years: 2.5 },
    { name: 'TypeScript', proficiency: 4, years: 1.5 },
    { name: 'JavaScript', proficiency: 5, years: 3.0 },
    { name: 'Node.js', proficiency: 4, years: 2.0 },
    { name: 'PostgreSQL', proficiency: 4, years: 1.5 },
    { name: 'Git', proficiency: 5, years: 2.5 },
    { name: 'Docker', proficiency: 3, years: 1.0 },
  ];

  for (const s of YETEM_SKILLS) {
    const sId = skillMap[s.name];
    if (sId) {
      await prisma.studentSkill.create({
        data: {
          studentProfileId: yetemProfile.userId,
          skillId: sId,
          proficiency: s.proficiency,
          yearsOfExperience: s.years,
        },
      });
    }
  }

  console.log('--- Database Restructuring & Seeding Completed Successfully! ---');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
