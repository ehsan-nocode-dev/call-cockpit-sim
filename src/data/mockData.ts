export type UserRole = 'admin' | 'assistant';

export type CompanyPriority = 'A' | 'B' | 'C' | 'D' | 'E';
export type CallPriority = 1 | 2 | 3 | 4;

export type Status = 'new' | 'active' | 'pending' | 'blocked' | 'completed' | 'lost';
export type StatusSpec = 'interested' | 'follow-up' | 'negotiation' | 'no-answer' | 'rejected' | 'callback' | '';

export interface Campaign {
  id: string;
  name: string;
  pitchText: string;
  pitchLink: string;
}

export interface Shareholder {
  id: string;
  name: string;
  birthYear: number;
  ownershipPct: number;
  externalNote: string;
  isDecisionMaker?: boolean;
}

export interface Manager {
  id: string;
  name: string;
  birthYear: number;
  position: string;
  externalNote: string;
  isCEO?: boolean;
  isDecisionMaker?: boolean;
}

export interface DecisionMaker {
  title: string;
  firstName: string;
  lastName: string;
  position: string;
  birthYear: number;
  ownershipPct: number;
  comment: string;
  tags: string[];
  mobile: string;
  direct: string;
  email: string;
}

export interface HistoryEntry {
  id: string;
  timestamp: Date;
  type: 'call' | 'time' | 'email' | 'note' | 'status' | 'dm-change';
  content: string;
  user: string;
}

export interface Company {
  id: string;
  name: string;
  city: string;
  country: string;
  centralPhone: string;
  website: string;
  revenue: string;
  ebitda: string;
  ebit: string;
  netProfit: string;
  employees: number;
  lastAnnualFinancials: string;
  description: string;
  companyPriority: CompanyPriority;
  tags: string[];
  campaignId: string;
  status: Status;
  statusSpec: StatusSpec;
  statusComment: string;
  callPriority?: CallPriority;
  nextContact: Date | null;
  queueTags: string[];
  shareholders: Shareholder[];
  management: Manager[];
  decisionMaker: DecisionMaker;
  history: HistoryEntry[];
}

// --- CAMPAIGNS ---
export const campaigns: Campaign[] = [
  {
    id: 'camp-1',
    name: 'DACH M&A Q1 2026',
    pitchText: 'We are reaching out to successful mid-market companies in the DACH region regarding potential strategic partnerships or acquisition opportunities. Our client is a well-capitalized PE fund...',
    pitchLink: 'https://pitch.example.com/dach-ma',
  },
  {
    id: 'camp-2',
    name: 'Nordics Growth Equity',
    pitchText: 'Our Scandinavian growth equity fund is seeking established SaaS and tech-enabled service companies with €5-50M revenue for minority or majority investments...',
    pitchLink: 'https://pitch.example.com/nordics',
  },
  {
    id: 'camp-3',
    name: 'UK Succession Planning',
    pitchText: 'We specialize in helping family-owned businesses plan ownership transitions. Our approach ensures business continuity while maximizing value for founding families...',
    pitchLink: 'https://pitch.example.com/uk-succession',
  },
];

const now = new Date();
const today = (h: number, m: number) => {
  const d = new Date(now);
  d.setHours(h, m, 0, 0);
  return d;
};
const tomorrow = (h: number, m: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + 1);
  d.setHours(h, m, 0, 0);
  return d;
};
const daysFromNow = (days: number, h: number, m: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  d.setHours(h, m, 0, 0);
  return d;
};

let historyId = 1;
const hEntry = (type: HistoryEntry['type'], content: string, daysAgo: number): HistoryEntry => ({
  id: `h-${historyId++}`,
  timestamp: new Date(now.getTime() - daysAgo * 86400000),
  type,
  content,
  user: 'M. Weber',
});

export const companies: Company[] = [
  {
    id: 'co-1', name: 'Müller Maschinenbau GmbH', city: 'Stuttgart', country: 'DE',
    centralPhone: '+49 711 1234567', website: 'www.mueller-maschinenbau.de',
    revenue: '€45M', ebitda: '€8.2M', ebit: '€6.1M', netProfit: '€4.3M',
    employees: 280, lastAnnualFinancials: '2025',
    description: 'Leading manufacturer of precision CNC machinery and industrial automation systems. Founded in 1978, the company serves automotive and aerospace sectors across Europe. Strong IP portfolio with 23 active patents.',
    companyPriority: 'A', tags: ['manufacturing', 'automation', 'family-owned'],
    campaignId: 'camp-1', status: 'active', statusSpec: 'follow-up', statusComment: 'CEO interested, wants second call',
    callPriority: 1, nextContact: today(10, 30), queueTags: [],
    shareholders: [
      { id: 's1', name: 'Hans Müller', birthYear: 1958, ownershipPct: 60, externalNote: 'Founder, considering retirement', isDecisionMaker: true },
      { id: 's2', name: 'Eva Müller-Schmidt', birthYear: 1985, ownershipPct: 25, externalNote: 'Daughter, active in company' },
      { id: 's3', name: 'Thomas Müller', birthYear: 1987, ownershipPct: 15, externalNote: 'Son, passive investor' },
    ],
    management: [
      { id: 'm1', name: 'Hans Müller', birthYear: 1958, position: 'CEO', externalNote: 'Founder, running company since 1978', isCEO: true, isDecisionMaker: true },
      { id: 'm2', name: 'Klaus Berger', birthYear: 1972, position: 'CFO', externalNote: 'Joined 2015' },
      { id: 'm3', name: 'Eva Müller-Schmidt', birthYear: 1985, position: 'COO', externalNote: 'Daughter of founder' },
    ],
    decisionMaker: {
      title: 'Dr.', firstName: 'Hans', lastName: 'Müller', position: 'CEO & Founder',
      birthYear: 1958, ownershipPct: 60, comment: 'Open to discussions, prefers morning calls',
      tags: ['founder', 'retiring-soon'], mobile: '+49 170 1234567', direct: '+49 711 1234568', email: 'h.mueller@mueller-maschinenbau.de',
    },
    history: [
      hEntry('call', 'Initial cold call. Receptionist transferred to CEO office. Left voicemail.', 14),
      hEntry('call', 'Spoke with CEO briefly. Interested but busy this week. Callback requested.', 10),
      hEntry('email', 'Sent company profile and NDA draft.', 9),
      hEntry('note', 'CEO mentioned potential interest in partial exit. Wants to keep operational control.', 7),
      hEntry('call', 'Detailed discussion about valuation expectations. Very engaged.', 3),
      hEntry('status', 'Status changed: new → active', 3),
    ],
  },
  {
    id: 'co-2', name: 'Nordic Digital Solutions AB', city: 'Stockholm', country: 'SE',
    centralPhone: '+46 8 555 1234', website: 'www.nordicdigital.se',
    revenue: '€12M', ebitda: '€3.1M', ebit: '€2.5M', netProfit: '€1.8M',
    employees: 85, lastAnnualFinancials: '2025',
    description: 'SaaS platform for B2B procurement automation. Strong growth trajectory with 40% YoY revenue increase. Key clients include IKEA, Volvo, and Ericsson.',
    companyPriority: 'A', tags: ['saas', 'procurement', 'high-growth'],
    campaignId: 'camp-2', status: 'active', statusSpec: 'negotiation', statusComment: 'Term sheet discussion ongoing',
    callPriority: 1, nextContact: today(11, 0), queueTags: [],
    shareholders: [
      { id: 's4', name: 'Erik Lindqvist', birthYear: 1980, ownershipPct: 45, externalNote: 'Co-founder & CEO' },
      { id: 's5', name: 'Sara Johansson', birthYear: 1982, ownershipPct: 30, externalNote: 'Co-founder & CTO' },
      { id: 's6', name: 'Nordic Ventures Fund II', birthYear: 0, ownershipPct: 25, externalNote: 'Series A investor' },
    ],
    management: [
      { id: 'm4', name: 'Erik Lindqvist', birthYear: 1980, position: 'CEO', externalNote: 'Technical background, ex-Spotify', isCEO: true, isDecisionMaker: true },
      { id: 'm5', name: 'Sara Johansson', birthYear: 1982, position: 'CTO', externalNote: 'Co-founder' },
    ],
    decisionMaker: {
      title: '', firstName: 'Erik', lastName: 'Lindqvist', position: 'CEO & Co-founder',
      birthYear: 1980, ownershipPct: 45, comment: 'Prefers email first, then calls. Very data-driven.',
      tags: ['tech-founder', 'growth-focused'], mobile: '+46 70 555 1234', direct: '+46 8 555 1235', email: 'erik@nordicdigital.se',
    },
    history: [
      hEntry('email', 'Cold email sent with fund overview.', 21),
      hEntry('email', 'Reply received — interested in growth equity.', 18),
      hEntry('call', 'First call with CEO. Very professional. Wants to explore minority investment.', 14),
      hEntry('call', 'Follow-up with CEO and CTO. Deep dive on tech stack and growth metrics.', 7),
      hEntry('note', 'Company growing fast. NRR >130%. Strong fit.', 5),
      hEntry('status', 'Status changed: new → active → negotiation', 3),
    ],
  },
  {
    id: 'co-3', name: 'Braun & Partners KG', city: 'Munich', country: 'DE',
    centralPhone: '+49 89 9876543', website: 'www.braun-partners.de',
    revenue: '€22M', ebitda: '€4.5M', ebit: '€3.2M', netProfit: '€2.1M',
    employees: 150, lastAnnualFinancials: '2024',
    description: 'Specialized consulting firm for industrial process optimization. Strong presence in automotive and chemicals. Family-owned since 1965.',
    companyPriority: 'B', tags: ['consulting', 'industrial', 'family-owned'],
    campaignId: 'camp-1', status: 'pending', statusSpec: 'callback', statusComment: 'DM on vacation until Feb 15',
    callPriority: 3, nextContact: daysFromNow(5, 9, 30), queueTags: ['evening-ok'],
    shareholders: [
      { id: 's7', name: 'Friedrich Braun', birthYear: 1950, ownershipPct: 70, externalNote: 'Founder, semi-retired' },
      { id: 's8', name: 'Matthias Braun', birthYear: 1978, ownershipPct: 30, externalNote: 'Son, active MD' },
    ],
    management: [
      { id: 'm6', name: 'Matthias Braun', birthYear: 1978, position: 'CEO', externalNote: 'Took over operations in 2020', isCEO: true, isDecisionMaker: true },
      { id: 'm7', name: 'Claudia Weiss', birthYear: 1975, position: 'CFO', externalNote: 'Joined 2018' },
    ],
    decisionMaker: {
      title: 'Prof.', firstName: 'Matthias', lastName: 'Braun', position: 'CEO',
      birthYear: 1978, ownershipPct: 30, comment: 'Academic background, methodical. Prefers structured presentations.',
      tags: ['academic', 'cautious'], mobile: '+49 171 9876543', direct: '+49 89 9876544', email: 'm.braun@braun-partners.de',
    },
    history: [
      hEntry('call', 'Called main line. Receptionist says DM on vacation.', 2),
      hEntry('note', 'Will retry after Feb 15.', 2),
    ],
  },
  {
    id: 'co-4', name: 'Thames Engineering Ltd', city: 'London', country: 'UK',
    centralPhone: '+44 20 7946 0123', website: 'www.thames-eng.co.uk',
    revenue: '£18M', ebitda: '£3.8M', ebit: '£2.9M', netProfit: '£2.0M',
    employees: 120, lastAnnualFinancials: '2025',
    description: 'Precision engineering firm specializing in aerospace components. Third-generation family business. Considering succession options.',
    companyPriority: 'B', tags: ['aerospace', 'precision', 'succession'],
    campaignId: 'camp-3', status: 'new', statusSpec: '', statusComment: '',
    callPriority: 2, nextContact: today(14, 15), queueTags: [],
    shareholders: [
      { id: 's9', name: 'James Whitfield', birthYear: 1955, ownershipPct: 80, externalNote: 'Third-gen owner' },
      { id: 's10', name: 'Margaret Whitfield', birthYear: 1958, ownershipPct: 20, externalNote: 'Spouse' },
    ],
    management: [
      { id: 'm8', name: 'James Whitfield', birthYear: 1955, position: 'CEO', externalNote: 'Considering retirement', isCEO: true, isDecisionMaker: true },
      { id: 'm9', name: 'David Chen', birthYear: 1980, position: 'Operations Director', externalNote: 'Potential successor' },
    ],
    decisionMaker: {
      title: '', firstName: 'James', lastName: 'Whitfield', position: 'CEO & Owner',
      birthYear: 1955, ownershipPct: 80, comment: 'Traditional, prefers face-to-face meetings',
      tags: ['succession', 'traditional'], mobile: '+44 7700 900123', direct: '+44 20 7946 0124', email: 'james@thames-eng.co.uk',
    },
    history: [
      hEntry('note', 'Identified via industry conference attendee list.', 5),
    ],
  },
  {
    id: 'co-5', name: 'Alpentechnik AG', city: 'Zurich', country: 'CH',
    centralPhone: '+41 44 555 7890', website: 'www.alpentechnik.ch',
    revenue: 'CHF 65M', ebitda: 'CHF 12M', ebit: 'CHF 9.5M', netProfit: 'CHF 7.2M',
    employees: 380, lastAnnualFinancials: '2025',
    description: 'Leading Swiss manufacturer of high-precision measurement instruments. Strong export business (75% international). Key markets: pharma, food & beverage.',
    companyPriority: 'A', tags: ['instruments', 'swiss-quality', 'export'],
    campaignId: 'camp-1', status: 'active', statusSpec: 'interested', statusComment: 'Very receptive. Second meeting scheduled.',
    callPriority: 1, nextContact: today(9, 0), queueTags: [],
    shareholders: [
      { id: 's11', name: 'Werner Hofer', birthYear: 1962, ownershipPct: 55, externalNote: 'CEO and majority owner' },
      { id: 's12', name: 'Swiss Industrial Holding AG', birthYear: 0, ownershipPct: 30, externalNote: 'Strategic investor' },
      { id: 's13', name: 'Employee Trust', birthYear: 0, ownershipPct: 15, externalNote: 'ESOP' },
    ],
    management: [
      { id: 'm10', name: 'Werner Hofer', birthYear: 1962, position: 'CEO', externalNote: 'Engineering PhD, hands-on leader', isCEO: true, isDecisionMaker: true },
      { id: 'm11', name: 'Anna Keller', birthYear: 1975, position: 'CFO', externalNote: 'Ex-UBS' },
      { id: 'm12', name: 'Reto Brunner', birthYear: 1968, position: 'CTO', externalNote: '15 patents' },
    ],
    decisionMaker: {
      title: 'Dr.', firstName: 'Werner', lastName: 'Hofer', position: 'CEO',
      birthYear: 1962, ownershipPct: 55, comment: 'Very knowledgeable. Asks detailed questions. Responds well to data.',
      tags: ['engineer', 'data-driven', 'decisive'], mobile: '+41 79 555 7890', direct: '+41 44 555 7891', email: 'w.hofer@alpentechnik.ch',
    },
    history: [
      hEntry('call', 'Cold call. Spoke directly with CEO. Very open and curious.', 12),
      hEntry('email', 'Sent detailed company profile and case studies.', 11),
      hEntry('call', 'Second call. Deep discussion about valuation methodology.', 7),
      hEntry('email', 'CEO sent financials proactively.', 5),
      hEntry('note', 'Premium target. High motivation for partial exit to secure succession.', 4),
      hEntry('status', 'Status: new → active → interested', 4),
      hEntry('call', 'Scheduled in-person meeting in Zurich for next week.', 1),
    ],
  },
  {
    id: 'co-6', name: 'Fjord Analytics AS', city: 'Oslo', country: 'NO',
    centralPhone: '+47 22 33 44 55', website: 'www.fjordanalytics.no',
    revenue: '€8M', ebitda: '€2.1M', ebit: '€1.6M', netProfit: '€1.2M',
    employees: 52, lastAnnualFinancials: '2025',
    description: 'Data analytics platform for maritime and offshore industries. Niche player with strong domain expertise and sticky customer base.',
    companyPriority: 'B', tags: ['analytics', 'maritime', 'niche'],
    campaignId: 'camp-2', status: 'active', statusSpec: 'follow-up', statusComment: 'Interested but wants to close current funding round first',
    callPriority: 2, nextContact: today(15, 30), queueTags: ['evening-ok'],
    shareholders: [
      { id: 's14', name: 'Olav Nordstrom', birthYear: 1976, ownershipPct: 55, externalNote: 'Founder' },
      { id: 's15', name: 'Bergen Tech Ventures', birthYear: 0, ownershipPct: 35, externalNote: 'Seed investor' },
      { id: 's16', name: 'Angel pool', birthYear: 0, ownershipPct: 10, externalNote: '' },
    ],
    management: [
      { id: 'm13', name: 'Olav Nordstrom', birthYear: 1976, position: 'CEO', externalNote: 'Maritime industry veteran', isCEO: true, isDecisionMaker: true },
    ],
    decisionMaker: {
      title: '', firstName: 'Olav', lastName: 'Nordstrom', position: 'CEO & Founder',
      birthYear: 1976, ownershipPct: 55, comment: 'Busy, prefers short calls. Gets straight to point.',
      tags: ['efficient', 'maritime-expert'], mobile: '+47 900 12 345', direct: '+47 22 33 44 56', email: 'olav@fjordanalytics.no',
    },
    history: [
      hEntry('email', 'Outreach email sent.', 15),
      hEntry('call', 'Quick call. Interested but focused on current round.', 10),
      hEntry('note', 'Follow up in Feb.', 10),
    ],
  },
  {
    id: 'co-7', name: 'Wiener Softwarehaus GmbH', city: 'Vienna', country: 'AT',
    centralPhone: '+43 1 234 5678', website: 'www.wiener-sw.at',
    revenue: '€15M', ebitda: '€3.5M', ebit: '€2.8M', netProfit: '€2.0M',
    employees: 95, lastAnnualFinancials: '2025',
    description: 'Enterprise software development firm specializing in ERP customization for manufacturing. Strong Oracle and SAP partnerships.',
    companyPriority: 'C', tags: ['erp', 'enterprise', 'oracle'],
    campaignId: 'camp-1', status: 'new', statusSpec: 'no-answer', statusComment: 'Multiple attempts, no answer',
    callPriority: 4, nextContact: tomorrow(10, 0), queueTags: [],
    shareholders: [
      { id: 's17', name: 'Peter Gruber', birthYear: 1965, ownershipPct: 100, externalNote: 'Sole owner' },
    ],
    management: [
      { id: 'm14', name: 'Peter Gruber', birthYear: 1965, position: 'CEO', externalNote: 'Solo founder', isCEO: true, isDecisionMaker: true },
      { id: 'm15', name: 'Maria Steiner', birthYear: 1980, position: 'Head of Development', externalNote: '' },
    ],
    decisionMaker: {
      title: 'Mag.', firstName: 'Peter', lastName: 'Gruber', position: 'CEO & Sole Owner',
      birthYear: 1965, ownershipPct: 100, comment: 'Hard to reach. Try mornings.',
      tags: ['sole-owner'], mobile: '+43 664 234 5678', direct: '+43 1 234 5679', email: 'p.gruber@wiener-sw.at',
    },
    history: [
      hEntry('call', 'No answer.', 5),
      hEntry('call', 'No answer again.', 3),
      hEntry('call', 'No answer. Left voicemail.', 1),
    ],
  },
  {
    id: 'co-8', name: 'Dansk Industriservice A/S', city: 'Copenhagen', country: 'DK',
    centralPhone: '+45 33 12 34 56', website: 'www.dansk-industri.dk',
    revenue: '€28M', ebitda: '€5.2M', ebit: '€4.0M', netProfit: '€2.8M',
    employees: 210, lastAnnualFinancials: '2025',
    description: 'Industrial maintenance and facility management services for large-scale manufacturing plants in Scandinavia.',
    companyPriority: 'B', tags: ['services', 'industrial', 'facility-mgmt'],
    campaignId: 'camp-2', status: 'blocked', statusSpec: 'rejected', statusComment: 'Not interested at this time',
    nextContact: null, queueTags: [],
    shareholders: [
      { id: 's18', name: 'Lars Jensen', birthYear: 1970, ownershipPct: 50, externalNote: '' },
      { id: 's19', name: 'Henrik Nielsen', birthYear: 1972, ownershipPct: 50, externalNote: '' },
    ],
    management: [
      { id: 'm16', name: 'Lars Jensen', birthYear: 1970, position: 'CEO', externalNote: '', isCEO: true, isDecisionMaker: true },
      { id: 'm17', name: 'Henrik Nielsen', birthYear: 1972, position: 'COO', externalNote: '' },
    ],
    decisionMaker: {
      title: '', firstName: 'Lars', lastName: 'Jensen', position: 'CEO',
      birthYear: 1970, ownershipPct: 50, comment: 'Firm rejection. Do not call again for 6 months.',
      tags: ['rejected'], mobile: '+45 20 12 34 56', direct: '+45 33 12 34 57', email: 'lars@dansk-industri.dk',
    },
    history: [
      hEntry('call', 'Spoke with CEO. Not interested. Clear rejection.', 8),
      hEntry('status', 'Status: new → blocked', 8),
    ],
  },
  {
    id: 'co-9', name: 'FinTech Partners AG', city: 'Frankfurt', country: 'DE',
    centralPhone: '+49 69 111 2233', website: 'www.fintech-partners.de',
    revenue: '€9M', ebitda: '€1.8M', ebit: '€1.2M', netProfit: '€0.8M',
    employees: 60, lastAnnualFinancials: '2025',
    description: 'Regulatory technology (RegTech) solutions for European banks. Specialized in AML/KYC compliance automation.',
    companyPriority: 'C', tags: ['fintech', 'regtech', 'compliance'],
    campaignId: 'camp-1', status: 'pending', statusSpec: 'follow-up', statusComment: 'Waiting for board meeting results',
    callPriority: 3, nextContact: daysFromNow(3, 14, 0), queueTags: [],
    shareholders: [
      { id: 's20', name: 'Michael Schwarz', birthYear: 1978, ownershipPct: 40, externalNote: '' },
      { id: 's21', name: 'Deutsche Tech Ventures', birthYear: 0, ownershipPct: 40, externalNote: 'Series B' },
      { id: 's22', name: 'ESOP', birthYear: 0, ownershipPct: 20, externalNote: '' },
    ],
    management: [
      { id: 'm18', name: 'Michael Schwarz', birthYear: 1978, position: 'CEO', externalNote: 'Ex-Deutsche Bank', isCEO: true, isDecisionMaker: true },
      { id: 'm19', name: 'Julia Meier', birthYear: 1985, position: 'CTO', externalNote: '' },
    ],
    decisionMaker: {
      title: 'Dr.', firstName: 'Michael', lastName: 'Schwarz', position: 'CEO',
      birthYear: 1978, ownershipPct: 40, comment: 'Analytical, wants detailed financial models',
      tags: ['finance', 'analytical'], mobile: '+49 172 111 2233', direct: '+49 69 111 2234', email: 'm.schwarz@fintech-partners.de',
    },
    history: [
      hEntry('call', 'Initial call. Interested but needs board approval.', 10),
      hEntry('email', 'Sent preliminary term sheet.', 8),
      hEntry('call', 'Follow up. Board meeting scheduled for next week.', 3),
    ],
  },
  {
    id: 'co-10', name: 'Helsinki Health Oy', city: 'Helsinki', country: 'FI',
    centralPhone: '+358 9 555 1234', website: 'www.helsinkihealth.fi',
    revenue: '€6M', ebitda: '€1.2M', ebit: '€0.8M', netProfit: '€0.5M',
    employees: 40, lastAnnualFinancials: '2025',
    description: 'Digital health platform for occupational health services. Fast-growing with key contracts in Finnish public sector.',
    companyPriority: 'C', tags: ['healthtech', 'digital-health', 'public-sector'],
    campaignId: 'camp-2', status: 'new', statusSpec: '', statusComment: '',
    callPriority: 3, nextContact: today(16, 0), queueTags: ['evening-ok'],
    shareholders: [
      { id: 's23', name: 'Mika Virtanen', birthYear: 1983, ownershipPct: 60, externalNote: 'Founder' },
      { id: 's24', name: 'Health Fund Nordic', birthYear: 0, ownershipPct: 40, externalNote: '' },
    ],
    management: [
      { id: 'm20', name: 'Mika Virtanen', birthYear: 1983, position: 'CEO', externalNote: 'Doctor turned entrepreneur', isCEO: true, isDecisionMaker: true },
    ],
    decisionMaker: {
      title: 'Dr.', firstName: 'Mika', lastName: 'Virtanen', position: 'CEO & Founder',
      birthYear: 1983, ownershipPct: 60, comment: 'Medical background, mission-driven',
      tags: ['doctor', 'mission-driven'], mobile: '+358 40 555 1234', direct: '+358 9 555 1235', email: 'mika@helsinkihealth.fi',
    },
    history: [
      hEntry('note', 'Identified through health tech conference.', 3),
    ],
  },
  {
    id: 'co-11', name: 'Rhein Logistics GmbH', city: 'Düsseldorf', country: 'DE',
    centralPhone: '+49 211 333 4444', website: 'www.rhein-logistics.de',
    revenue: '€52M', ebitda: '€7.8M', ebit: '€5.5M', netProfit: '€3.8M',
    employees: 420, lastAnnualFinancials: '2025',
    description: 'Full-service logistics provider specializing in chemical and hazardous materials transport across Europe.',
    companyPriority: 'A', tags: ['logistics', 'hazmat', 'chemicals'],
    campaignId: 'camp-1', status: 'active', statusSpec: 'interested', statusComment: 'Strong interest, NDA signed',
    callPriority: 2, nextContact: today(13, 0), queueTags: [],
    shareholders: [
      { id: 's25', name: 'Wolfgang Krämer', birthYear: 1960, ownershipPct: 75, externalNote: 'Second generation' },
      { id: 's26', name: 'Krämer Family Trust', birthYear: 0, ownershipPct: 25, externalNote: '' },
    ],
    management: [
      { id: 'm21', name: 'Wolfgang Krämer', birthYear: 1960, position: 'CEO', externalNote: '', isCEO: true, isDecisionMaker: true },
      { id: 'm22', name: 'Stefan Vogel', birthYear: 1975, position: 'COO', externalNote: '' },
      { id: 'm23', name: 'Ingrid Bauer', birthYear: 1978, position: 'CFO', externalNote: '' },
    ],
    decisionMaker: {
      title: '', firstName: 'Wolfgang', lastName: 'Krämer', position: 'CEO',
      birthYear: 1960, ownershipPct: 75, comment: 'Very direct, appreciates honesty',
      tags: ['direct', 'experienced'], mobile: '+49 172 333 4444', direct: '+49 211 333 4445', email: 'w.kraemer@rhein-logistics.de',
    },
    history: [
      hEntry('call', 'Initial outreach. Warm lead from network.', 20),
      hEntry('call', 'Detailed call. NDA requested.', 15),
      hEntry('email', 'NDA sent and signed.', 13),
      hEntry('call', 'Deep dive on business model and fleet.', 8),
      hEntry('status', 'Status: new → active → interested', 8),
    ],
  },
  {
    id: 'co-12', name: 'Scottish Renewables Group', city: 'Edinburgh', country: 'UK',
    centralPhone: '+44 131 555 6789', website: 'www.scottish-renewables.co.uk',
    revenue: '£32M', ebitda: '£6.5M', ebit: '£4.8M', netProfit: '£3.2M',
    employees: 195, lastAnnualFinancials: '2025',
    description: 'Wind farm development and management company. Portfolio of 12 operational sites across Scotland.',
    companyPriority: 'B', tags: ['renewables', 'wind', 'infrastructure'],
    campaignId: 'camp-3', status: 'pending', statusSpec: 'callback', statusComment: 'DM traveling, call back next week',
    callPriority: 3, nextContact: daysFromNow(4, 10, 0), queueTags: [],
    shareholders: [
      { id: 's27', name: 'Robert MacGregor', birthYear: 1968, ownershipPct: 45, externalNote: '' },
      { id: 's28', name: 'Green Energy Fund', birthYear: 0, ownershipPct: 35, externalNote: '' },
      { id: 's29', name: 'Edinburgh Angels', birthYear: 0, ownershipPct: 20, externalNote: '' },
    ],
    management: [
      { id: 'm24', name: 'Robert MacGregor', birthYear: 1968, position: 'CEO', externalNote: 'Industry pioneer', isCEO: true, isDecisionMaker: true },
    ],
    decisionMaker: {
      title: '', firstName: 'Robert', lastName: 'MacGregor', position: 'CEO',
      birthYear: 1968, ownershipPct: 45, comment: 'Traveling frequently. Best reached Tuesdays/Thursdays.',
      tags: ['traveler', 'pioneer'], mobile: '+44 7700 567890', direct: '+44 131 555 6790', email: 'robert@scottish-renewables.co.uk',
    },
    history: [
      hEntry('call', 'Brief call. Interested but traveling.', 5),
      hEntry('note', 'Schedule follow-up for next week.', 5),
    ],
  },
  {
    id: 'co-13', name: 'Berliner Medizintechnik GmbH', city: 'Berlin', country: 'DE',
    centralPhone: '+49 30 777 8888', website: 'www.berliner-medtech.de',
    revenue: '€35M', ebitda: '€6.8M', ebit: '€5.0M', netProfit: '€3.5M',
    employees: 230, lastAnnualFinancials: '2025',
    description: 'Medical device manufacturer specializing in orthopedic implants. CE and FDA certified. Growing US export business.',
    companyPriority: 'A', tags: ['medtech', 'implants', 'fda-certified'],
    campaignId: 'camp-1', status: 'active', statusSpec: 'negotiation', statusComment: 'Valuation discussion, competitive process',
    callPriority: 1, nextContact: today(11, 30), queueTags: [],
    shareholders: [
      { id: 's30', name: 'Prof. Thomas Richter', birthYear: 1955, ownershipPct: 65, externalNote: 'Founder, orthopedic surgeon' },
      { id: 's31', name: 'Charité Foundation', birthYear: 0, ownershipPct: 20, externalNote: '' },
      { id: 's32', name: 'Family Richter', birthYear: 0, ownershipPct: 15, externalNote: '' },
    ],
    management: [
      { id: 'm25', name: 'Prof. Thomas Richter', birthYear: 1955, position: 'CEO', externalNote: 'Renowned surgeon', isCEO: true, isDecisionMaker: true },
      { id: 'm26', name: 'Dr. Lisa Hartmann', birthYear: 1980, position: 'COO', externalNote: 'Running daily operations' },
    ],
    decisionMaker: {
      title: 'Prof.', firstName: 'Thomas', lastName: 'Richter', position: 'CEO & Founder',
      birthYear: 1955, ownershipPct: 65, comment: 'Competitive process running. Needs quick decisions.',
      tags: ['surgeon', 'competitive-process'], mobile: '+49 171 777 8888', direct: '+49 30 777 8889', email: 't.richter@berliner-medtech.de',
    },
    history: [
      hEntry('call', 'Warm intro from advisor network.', 30),
      hEntry('call', 'First call with CEO. Very professional.', 25),
      hEntry('email', 'Teaser sent.', 24),
      hEntry('call', 'Management presentation.', 18),
      hEntry('note', 'Competitive process with 3 other bidders.', 14),
      hEntry('status', 'Moved to negotiation phase.', 10),
      hEntry('call', 'Valuation range discussed. €40-50M EV.', 5),
      hEntry('email', 'Updated term sheet sent.', 3),
    ],
  },
  {
    id: 'co-14', name: 'Göteborg Maritime Tech AB', city: 'Gothenburg', country: 'SE',
    centralPhone: '+46 31 444 5555', website: 'www.gbg-maritime.se',
    revenue: '€11M', ebitda: '€2.8M', ebit: '€2.1M', netProfit: '€1.5M',
    employees: 70, lastAnnualFinancials: '2024',
    description: 'Maritime IoT solutions for fleet monitoring and predictive maintenance. Growing rapidly in the green shipping segment.',
    companyPriority: 'C', tags: ['maritime', 'iot', 'green-shipping'],
    campaignId: 'camp-2', status: 'new', statusSpec: '', statusComment: '',
    nextContact: daysFromNow(2, 9, 30), queueTags: [],
    shareholders: [
      { id: 's33', name: 'Gustav Andersson', birthYear: 1979, ownershipPct: 50, externalNote: '' },
      { id: 's34', name: 'Maritime Angels', birthYear: 0, ownershipPct: 30, externalNote: '' },
      { id: 's35', name: 'Green Ship Fund', birthYear: 0, ownershipPct: 20, externalNote: '' },
    ],
    management: [
      { id: 'm27', name: 'Gustav Andersson', birthYear: 1979, position: 'CEO', externalNote: '', isCEO: true, isDecisionMaker: true },
    ],
    decisionMaker: {
      title: '', firstName: 'Gustav', lastName: 'Andersson', position: 'CEO & Founder',
      birthYear: 1979, ownershipPct: 50, comment: 'Not yet contacted',
      tags: [], mobile: '+46 70 444 5555', direct: '+46 31 444 5556', email: 'gustav@gbg-maritime.se',
    },
    history: [],
  },
  {
    id: 'co-15', name: 'Salzburg Precision Tools KG', city: 'Salzburg', country: 'AT',
    centralPhone: '+43 662 888 9999', website: 'www.salzburg-precision.at',
    revenue: '€19M', ebitda: '€4.1M', ebit: '€3.0M', netProfit: '€2.2M',
    employees: 130, lastAnnualFinancials: '2025',
    description: 'Manufacturer of precision cutting tools for metalworking industry. Strong presence in Central Europe with growing Middle East exports.',
    companyPriority: 'B', tags: ['tools', 'precision', 'metalworking'],
    campaignId: 'camp-1', status: 'pending', statusSpec: 'no-answer', statusComment: 'Trying to reach DM',
    callPriority: 3, nextContact: today(16, 30), queueTags: ['evening-ok'],
    shareholders: [
      { id: 's36', name: 'Karl Huber', birthYear: 1963, ownershipPct: 80, externalNote: 'Founder' },
      { id: 's37', name: 'Anita Huber', birthYear: 1965, ownershipPct: 20, externalNote: 'Spouse' },
    ],
    management: [
      { id: 'm28', name: 'Karl Huber', birthYear: 1963, position: 'CEO', externalNote: '', isCEO: true, isDecisionMaker: true },
    ],
    decisionMaker: {
      title: '', firstName: 'Karl', lastName: 'Huber', position: 'CEO & Owner',
      birthYear: 1963, ownershipPct: 80, comment: 'Try afternoons. Usually in production mornings.',
      tags: ['hands-on'], mobile: '+43 664 888 9999', direct: '+43 662 888 9990', email: 'k.huber@salzburg-precision.at',
    },
    history: [
      hEntry('call', 'No answer. In production.', 4),
      hEntry('call', 'Brief call. Asked to call back.', 2),
    ],
  },
];
