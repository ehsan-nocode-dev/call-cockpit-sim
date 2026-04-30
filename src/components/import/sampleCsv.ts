// Hardcoded sample CSV payloads + existing-domain list for duplicate detection.

export const EXISTING_DOMAINS = ['andeanshift.com', 'savannacore.de', 'monsoonedge.com'];

export const COMPANY_TEMPLATE_COLUMNS = [
  'Company Name', 'Website/Domain', 'Industry', 'Country', 'City',
  'Revenue', 'EBITDA', 'EBIT', 'Revenue LFS', 'Employees', 'Phone',
  'Tags', 'Status', 'Next Contact Date', 'Certain Potential', 'Comment',
];

export const PERSON_TEMPLATE_COLUMNS = [
  'First Name', 'Last Name', 'Email', 'Phone', 'Designation',
  'Company Website', 'Birth Year', 'Notes',
];

export const COMPANY_REQUIRED = ['Company Name', 'Website/Domain'];
export const PERSON_REQUIRED = ['First Name', 'Last Name', 'Company Website'];

export const SAMPLE_COMPANY_CSV = `Company Name,Website/Domain,Industry,Country,City,Revenue,EBITDA,EBIT,Revenue LFS,Employees,Phone,Tags,Status,Next Contact Date,Certain Potential,Comment
Andean Shift GmbH,andeanshift.com,Manufacturing,DE,Munich,42M,8M,7M,40M,180,+49 89 1234567,manufacturing;family-owned,offen,2026-05-10,A,Existing record
Savanna Core AG,savannacore.de,Automation,DE,Berlin,28M,5M,4M,26M,120,+49 30 7654321,automation,offen,2026-05-12,B,Existing record
Monsoon Edge Ltd,monsoonedge.com,Logistics,UK,London,65M,12M,10M,60M,260,+44 20 9988776,logistics,offen,2026-05-14,A,Existing record
Northwind Robotics,northwindrobotics.io,Robotics,US,Boston,18M,3M,2M,17M,85,+1 617 5550101,automation;robotics,offen,2026-05-15,B,New record
Helios Precision,heliosprecision.de,Manufacturing,DE,Stuttgart,33M,6M,5M,31M,150,+49 711 4448822,manufacturing,offen,2026-05-16,A,Family-owned
Polar Drift Systems,polardrift.no,Energy,NO,Oslo,52M,11M,9M,49M,210,+47 22 334455,energy,offen,2026-05-17,A,Strong potential
Cobalt Mesh Networks,cobaltmesh.com,Telecom,US,Austin,22M,4M,3M,21M,95,+1 512 5557788,telecom,offen,2026-05-18,C,
Verdant Forge Industries,verdantforge.co,Materials,CA,Toronto,40M,7M,6M,38M,170,+1 416 5559911,materials;family-owned,offen,2026-05-19,B,
`;

export const SAMPLE_PERSON_CSV = `First Name,Last Name,Email,Phone,Designation,Company Website,Birth Year,Notes
Anna,Becker,anna.becker@northwindrobotics.io,+1 617 5550102,CEO,northwindrobotics.io,1972,Founder
Lukas,Hartmann,lukas@heliosprecision.de,+49 711 4448823,CFO,heliosprecision.de,1968,
Sofia,Lindqvist,sofia@polardrift.no,+47 22 334466,Managing Director,polardrift.no,1975,
Jamal,Okonkwo,jamal@cobaltmesh.com,+1 512 5557799,VP Sales,cobaltmesh.com,1980,
Marie,Tremblay,marie@verdantforge.co,+1 416 5559922,Owner,verdantforge.co,1965,Retiring soon
`;
