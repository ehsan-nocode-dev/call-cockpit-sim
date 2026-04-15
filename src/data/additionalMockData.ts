export interface Person {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  mobile: string;
  company: string;
  companyWebsite: string;
  position: string;
  type: 'Management' | 'Shareholder' | 'External';
  stake: string;
  isDecisionMaker: boolean;
  tags: string[];
  notes: string;
  createdAt: string;
}

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Assistant';
  status: 'Active' | 'Inactive';
  lastLogin: string;
  createdAt: string;
}

export interface Opportunity {
  id: string;
  companyName: string;
  contactName: string;
  value: string;
  stage: string;
  probability: number;
  campaignName: string;
  assignedTo: string;
  expectedClose: string;
  notes: string;
  createdAt: string;
}

export const opportunityStages = [
  'Qualification', 'Discovery', 'Proposal', 'Negotiation', 'Due Diligence', 'Closing', 'Won', 'Lost',
];

export const personTypes = ['Management', 'Shareholder', 'External'] as const;

export const people: Person[] = [
  { id: 'p-1', firstName: 'Hans', lastName: 'Müller', title: 'Dr.', email: 'h.mueller@mueller-maschinenbau.de', phone: '+49 711 1234568', mobile: '+49 170 1234567', company: 'Müller Maschinenbau GmbH', companyWebsite: 'mueller-maschinenbau.de', position: 'CEO & Founder', type: 'Management', stake: '60%', isDecisionMaker: true, tags: ['founder', 'retiring-soon'], notes: 'Open to discussions, prefers morning calls', createdAt: '2025-11-01' },
  { id: 'p-2', firstName: 'Erik', lastName: 'Lindqvist', title: '', email: 'erik@nordicdigital.se', phone: '+46 8 555 1235', mobile: '+46 70 555 1234', company: 'Nordic Digital Solutions AB', companyWebsite: 'nordicdigital.se', position: 'CEO & Co-founder', type: 'Management', stake: '45%', isDecisionMaker: true, tags: ['tech-founder'], notes: 'Prefers email first, then calls', createdAt: '2025-10-15' },
  { id: 'p-3', firstName: 'Matthias', lastName: 'Braun', title: 'Prof.', email: 'm.braun@braun-partners.de', phone: '+49 89 9876544', mobile: '+49 171 9876543', company: 'Braun & Partners KG', companyWebsite: 'braun-partners.de', position: 'CEO', type: 'Management', stake: '30%', isDecisionMaker: true, tags: ['academic'], notes: 'Prefers structured presentations', createdAt: '2025-12-01' },
  { id: 'p-4', firstName: 'James', lastName: 'Whitfield', title: '', email: 'james@thames-eng.co.uk', phone: '+44 20 7946 0124', mobile: '+44 7700 900123', company: 'Thames Engineering Ltd', companyWebsite: 'thames-eng.co.uk', position: 'CEO & Owner', type: 'Shareholder', stake: '80%', isDecisionMaker: true, tags: ['succession'], notes: 'Traditional, prefers face-to-face', createdAt: '2025-12-10' },
  { id: 'p-5', firstName: 'Werner', lastName: 'Hofer', title: 'Dr.', email: 'w.hofer@alpentechnik.ch', phone: '+41 44 555 7891', mobile: '+41 79 555 7890', company: 'Alpentechnik AG', companyWebsite: 'alpentechnik.ch', position: 'CEO', type: 'Management', stake: '55%', isDecisionMaker: true, tags: ['engineer', 'data-driven'], notes: 'Very knowledgeable, asks detailed questions', createdAt: '2025-09-20' },
  { id: 'p-6', firstName: 'Olav', lastName: 'Nordstrom', title: '', email: 'olav@fjordanalytics.no', phone: '+47 22 33 44 56', mobile: '+47 900 12 345', company: 'Fjord Analytics AS', companyWebsite: 'fjordanalytics.no', position: 'CEO & Founder', type: 'Management', stake: '55%', isDecisionMaker: false, tags: [], notes: 'Busy, prefers short calls', createdAt: '2025-11-15' },
  { id: 'p-7', firstName: 'Peter', lastName: 'Gruber', title: 'Mag.', email: 'p.gruber@wiener-sw.at', phone: '+43 1 234 5679', mobile: '+43 664 234 5678', company: 'Wiener Softwarehaus GmbH', companyWebsite: 'wiener-sw.at', position: 'CEO & Sole Owner', type: 'Management', stake: '100%', isDecisionMaker: false, tags: [], notes: 'Hard to reach, try mornings', createdAt: '2025-10-05' },
  { id: 'p-8', firstName: 'Lars', lastName: 'Jensen', title: '', email: 'lars@dansk-industri.dk', phone: '+45 33 12 34 57', mobile: '+45 20 12 34 56', company: 'Dansk Industriservice A/S', companyWebsite: 'dansk-industri.dk', position: 'CEO', type: 'External', stake: '0%', isDecisionMaker: false, tags: [], notes: 'Firm rejection, 6-month cool-off', createdAt: '2025-10-20' },
  { id: 'p-9', firstName: 'Michael', lastName: 'Schwarz', title: 'Dr.', email: 'm.schwarz@fintech-partners.de', phone: '+49 69 111 2234', mobile: '+49 172 111 2233', company: 'FinTech Partners AG', companyWebsite: 'fintech-partners.de', position: 'CEO', type: 'Management', stake: '40%', isDecisionMaker: false, tags: ['finance'], notes: 'Wants detailed financial models', createdAt: '2025-11-10' },
  { id: 'p-10', firstName: 'Mika', lastName: 'Virtanen', title: 'Dr.', email: 'mika@helsinkihealth.fi', phone: '+358 9 555 1235', mobile: '+358 40 555 1234', company: 'Helsinki Health Oy', companyWebsite: 'helsinkihealth.fi', position: 'CEO & Founder', type: 'Shareholder', stake: '70%', isDecisionMaker: true, tags: ['doctor'], notes: 'Medical background, mission-driven', createdAt: '2026-01-05' },
  { id: 'p-11', firstName: 'Eva', lastName: 'Müller-Schmidt', title: 'Ms.', email: 'e.mueller@mueller-maschinenbau.de', phone: '+49 711 1234569', mobile: '+49 170 9876543', company: 'Müller Maschinenbau GmbH', companyWebsite: 'mueller-maschinenbau.de', position: 'COO', type: 'Management', stake: '25%', isDecisionMaker: false, tags: ['next-gen'], notes: 'Daughter of founder, active in company', createdAt: '2025-11-01' },
  { id: 'p-12', firstName: 'Sara', lastName: 'Johansson', title: 'Ms.', email: 'sara@nordicdigital.se', phone: '+46 8 555 1236', mobile: '+46 70 555 5678', company: 'Nordic Digital Solutions AB', companyWebsite: 'nordicdigital.se', position: 'CTO', type: 'Management', stake: '30%', isDecisionMaker: false, tags: ['tech'], notes: 'Co-founder', createdAt: '2025-10-15' },
  { id: 'p-13', firstName: 'Hania', lastName: 'Yousaf', title: 'Dr.', email: 'hania.yousaf@globalbiz.io', phone: '+5501410', mobile: '+4450246', company: 'AndesCore', companyWebsite: 'andescore.co', position: 'Director', type: 'Management', stake: '0%', isDecisionMaker: false, tags: ['apple'], notes: '', createdAt: '2025-12-15' },
  { id: 'p-14', firstName: 'Kiran', lastName: 'Khan', title: 'Mrs.', email: 'kiran.khan@globalbiz.io', phone: '+9108590', mobile: '+6310904', company: 'IslandByte', companyWebsite: 'islandbyte.dm', position: 'Manager', type: 'Shareholder', stake: '0%', isDecisionMaker: false, tags: [], notes: '', createdAt: '2025-12-20' },
  { id: 'p-15', firstName: 'Farhan', lastName: 'Yousaf', title: 'Ms.', email: 'farhan.yousaf@enterprisehub.net', phone: '+1322386', mobile: '+9335957', company: 'LibertyStack', companyWebsite: 'libertystack.us', position: 'VP', type: 'Shareholder', stake: '0%', isDecisionMaker: true, tags: ['wow'], notes: '', createdAt: '2025-11-30' },
];

export const appUsers: AppUser[] = [
  { id: 'u-1', name: 'Ehsan Ellahi', email: 'admin@cockpit.com', role: 'Admin', status: 'Active', lastLogin: '2026-02-21 04:01', createdAt: 'Feb 21st, 2026, 4:01 am' },
  { id: 'u-2', name: 'Tim Hortins', email: 'admin@mysemulator.com', role: 'Admin', status: 'Active', lastLogin: '2026-02-21 04:01', createdAt: 'Feb 21st, 2026, 4:01 am' },
  { id: 'u-3', name: 'Tim', email: 'assistant@cockpit.com', role: 'Assistant', status: 'Active', lastLogin: '2026-02-26 03:55', createdAt: 'Feb 26th, 2026, 3:55 am' },
];

export const opportunities: Opportunity[] = [
  { id: 'opp-1', companyName: 'Müller Maschinenbau GmbH', contactName: 'Hans Müller', value: '€25-35M', stage: 'Discovery', probability: 40, campaignName: 'DACH M&A Q1 2026', assignedTo: 'Max Weber', expectedClose: '2026-09-30', notes: 'Interested in partial exit', createdAt: '2026-01-15' },
  { id: 'opp-2', companyName: 'Nordic Digital Solutions AB', contactName: 'Erik Lindqvist', value: '€15-20M', stage: 'Proposal', probability: 65, campaignName: 'Nordics Growth Equity', assignedTo: 'Anna Schmidt', expectedClose: '2026-07-15', notes: 'Term sheet discussion ongoing', createdAt: '2025-12-10' },
  { id: 'opp-3', companyName: 'Alpentechnik AG', contactName: 'Werner Hofer', value: '€40-55M', stage: 'Due Diligence', probability: 75, campaignName: 'DACH M&A Q1 2026', assignedTo: 'Max Weber', expectedClose: '2026-06-30', notes: 'NDA signed, IRL meeting next week', createdAt: '2025-11-20' },
  { id: 'opp-4', companyName: 'Rhein Logistics GmbH', contactName: 'Wolfgang Krämer', value: '€40-50M', stage: 'Closing', probability: 90, campaignName: 'DACH M&A Q1 2026', assignedTo: 'Max Weber', expectedClose: '2026-05-15', notes: 'LOI signed, DD starting', createdAt: '2025-10-01' },
  { id: 'opp-5', companyName: 'Berliner Medizintechnik GmbH', contactName: 'Thomas Richter', value: '€40-50M', stage: 'Won', probability: 100, campaignName: 'DACH M&A Q1 2026', assignedTo: 'Anna Schmidt', expectedClose: '2026-04-20', notes: 'Deal closed, signing next week', createdAt: '2025-08-15' },
  { id: 'opp-6', companyName: 'Fjord Analytics AS', contactName: 'Olav Nordstrom', value: '€8-12M', stage: 'Qualification', probability: 25, campaignName: 'Nordics Growth Equity', assignedTo: 'Jonas Müller', expectedClose: '2026-12-31', notes: 'Wants to close current funding round first', createdAt: '2026-02-01' },
  { id: 'opp-7', companyName: 'Hamburger Verpackung GmbH', contactName: 'Heinrich Becker', value: '€30-40M', stage: 'Lost', probability: 0, campaignName: 'DACH M&A Q1 2026', assignedTo: 'Max Weber', expectedClose: '2026-03-01', notes: 'Lost to competitor bid from PE fund', createdAt: '2025-09-01' },
  { id: 'opp-8', companyName: 'Scottish Renewables Group', contactName: 'Robert MacGregor', value: '£20-30M', stage: 'Discovery', probability: 35, campaignName: 'UK Succession Planning', assignedTo: 'Sarah Fischer', expectedClose: '2026-11-30', notes: 'Meeting scheduled for next Thursday', createdAt: '2026-03-01' },
];
