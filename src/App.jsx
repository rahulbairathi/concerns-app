import { useState, useEffect } from "react";
import {
  Users, Building2, Home, ShieldCheck, AlertTriangle, Scale, ClipboardCheck,
  Lock, ArrowLeft, ArrowRight, Check, Search, Upload, X, Copy, UserCheck, Sparkles,
  LogOut, ClipboardList, Clock, ChevronRight, FileText, BarChart3, Heart, LifeBuoy,
  Globe, Mail, Phone, ChevronDown,
} from "lucide-react";

const CATEGORIES = [
  { id: "employee_relations", label: "Employee relations", desc: "Harassment, discrimination, retaliation, workplace conflict", icon: Users, team: "HR – Employee Relations", color: { bg: "bg-indigo-50", text: "text-indigo-600", ring: "border-indigo-500", fill: "bg-indigo-500", from: "from-indigo-50" } },
  { id: "facilities", label: "Facilities", desc: "Building conditions, maintenance, workplace safety", icon: Building2, team: "Facilities Management", color: { bg: "bg-amber-50", text: "text-amber-600", ring: "border-amber-500", fill: "bg-amber-500", from: "from-amber-50" } },
  { id: "real_estate", label: "Real estate", desc: "Leases, space planning, site issues", icon: Home, team: "Real Estate / Corporate Services", color: { bg: "bg-cyan-50", text: "text-cyan-600", ring: "border-cyan-500", fill: "bg-cyan-500", from: "from-cyan-50" } },
  { id: "compliance", label: "Compliance", desc: "Regulatory or legal policy violations", icon: ShieldCheck, team: "Compliance", color: { bg: "bg-blue-50", text: "text-blue-600", ring: "border-blue-500", fill: "bg-blue-500", from: "from-blue-50" } },
  { id: "financial_fraud", label: "Financial fraud", desc: "Embezzlement, falsified records, theft", icon: AlertTriangle, team: "Internal Audit / Finance Investigations", color: { bg: "bg-rose-50", text: "text-rose-600", ring: "border-rose-500", fill: "bg-rose-500", from: "from-rose-50" } },
  { id: "ethics", label: "Ethics", desc: "Conflicts of interest, bribery, pressure to act against judgment", icon: Scale, team: "Ethics & Compliance Officer", color: { bg: "bg-violet-50", text: "text-violet-600", ring: "border-violet-500", fill: "bg-violet-500", from: "from-violet-50" } },
  { id: "code_of_conduct", label: "Code of conduct", desc: "Specific documented policy violations", icon: ClipboardCheck, team: "Compliance", color: { bg: "bg-emerald-50", text: "text-emerald-600", ring: "border-emerald-500", fill: "bg-emerald-500", from: "from-emerald-50" } },
];

const UNSURE_CATEGORY = { id: "unsure", label: "Not sure which category?", desc: "Describe your concern and Trust AI will help route it.", icon: Search, team: "Intake & Triage Team", color: { bg: "bg-slate-100", text: "text-slate-600", ring: "border-slate-400", fill: "bg-slate-400", from: "from-slate-100" } };

const TEAMS = [...new Set(CATEGORIES.map((c) => c.team))];

const CATEGORY_QUESTIONS = {
  employee_relations: [
    { id: "erConcernType", label: "What type of concern is this?", type: "select", required: true, options: ["Harassment", "Discrimination", "Retaliation", "Workplace conflict"] },
    { id: "frequency", label: "Has this happened once or repeatedly?", type: "select", options: ["One-time incident", "Repeated pattern"] },
  ],
  facilities: [
    { id: "safetyRisk", label: "Is there an immediate safety risk?", type: "yesno", required: true },
    { id: "facilityIssueType", label: "What kind of facilities issue is this?", type: "select", options: ["Maintenance", "Cleanliness", "Equipment/appliance", "Temperature/HVAC", "Other"] },
    { id: "buildingLocation", label: "Which building or floor?", type: "text" },
  ],
  real_estate: [
    { id: "propertyIssueType", label: "What kind of real estate issue is this?", type: "select", options: ["Lease terms", "Space planning", "Site condition", "Relocation"] },
    { id: "buildingLocation", label: "Which site or location?", type: "text" },
  ],
  compliance: [
    { id: "regulationArea", label: "Which area does this relate to?", type: "select", options: ["Data privacy", "Financial reporting", "Labor law", "Industry regulation", "Other"] },
    { id: "policySection", label: "Which policy or regulation, if known?", type: "text" },
  ],
  financial_fraud: [
    { id: "fraudType", label: "What type of concern is this?", type: "select", options: ["Embezzlement", "Falsified records", "Theft", "Vendor/invoice fraud", "Other"] },
    { id: "estimatedImpact", label: "Estimated financial impact, if known", type: "text", help: "Approximate amount" },
    { id: "involvedAccounts", label: "Accounts, vendors, or transactions involved", type: "text" },
  ],
  ethics: [
    { id: "ethicsType", label: "What type of concern is this?", type: "select", options: ["Conflict of interest", "Gifts or bribery", "Misuse of confidential information", "Pressure to act unethically", "Other"] },
    { id: "involvedParties", label: "Who is involved, if you're comfortable sharing?", type: "text" },
  ],
  code_of_conduct: [
    { id: "conductType", label: "What type of policy violation is this?", type: "select", options: ["Dress code", "Attendance", "Expense policy", "Other documented policy"] },
    { id: "policySection", label: "Which policy section, if known?", type: "text" },
  ],
  unsure: [],
};

const CATEGORY_KEYWORDS = {
  employee_relations: ["harass", "harassment", "discriminat", "retaliat", "bully", "bullying", "hostile", "manager", "supervisor", "boss", "coworker", "co-worker", "colleague", "yell", "yelling", "intimidat", "exclude", "excluded", "unfair treatment", "unfairly", "mistreat", "disrespect", "rude", "demean", "belittle", "toxic", "verbal abuse", "team member", "picking on me", "singled out", "made fun of", "put down"],
  financial_fraud: ["fraud", "embezzl", "steal", "stealing", "stole", "theft", "falsif", "invoice", "invoices", "kickback", "money", "payment", "payments", "vendor payment", "expense fraud", "accounting", "books", "ledger", "misappropriat", "fake receipt", "forged", "forging", "financial records", "billing", "overcharg", "double bill"],
  ethics: ["bribe", "bribery", "gift", "gifts", "conflict of interest", "insider", "insider trading", "kickback", "unethical", "favoritism", "personal gain", "nepotism", "self-dealing", "undisclosed relationship", "vendor relationship", "hiring his", "hiring her", "family member", "relative", "personal benefit", "quid pro quo"],
  facilities: ["broken", "leak", "leaking", "air condition", "hvac", "maintenance", "elevator", "clean", "cleanliness", "dirty", "building", "unsafe", "temperature", "too hot", "too cold", "noise", "noisy", "pest", "pests", "bathroom", "restroom", "parking", "lighting", "plumbing", "water damage", "mold", "smell", "smells", "not working", "office is"],
  real_estate: ["lease", "leasing", "office space", "floor plan", "relocat", "site condition", "landlord", "square footage", "renovation", "new office", "move offices", "moving offices", "building lease", "space planning"],
  compliance: ["regulation", "regulatory", "gdpr", "privacy law", "legal violation", "compliance", "data protection", "audit finding", "license", "licensing", "certification", "safety regulation", "environmental regulation", "data breach", "customer data", "personal data", "legal requirement"],
  code_of_conduct: ["dress code", "attendance", "expense report", "policy violation", "late", "absent", "absenteeism", "misuse of company property", "social media policy", "company property", "personal use", "timesheet", "clocking in", "company laptop", "company car", "using work"],
};

function analyzeConcern(text) {
  const t = (text || "").toLowerCase();
  const scores = Object.entries(CATEGORY_KEYWORDS).map(([id, keywords]) => {
    const hits = keywords.reduce((sum, k) => sum + (t.includes(k) ? 1 : 0), 0);
    return { id, hits };
  }).filter((s) => s.hits > 0);

  const totalHits = scores.reduce((sum, s) => sum + s.hits, 0);
  if (totalHits === 0) return [];

  return scores
    .map((s) => ({
      category: CATEGORIES.find((c) => c.id === s.id),
      confidence: Math.round((s.hits / totalHits) * 100),
    }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);
}

function generateSummary(category, form, questions) {
  const clean = (s) => (s || "").trim().replace(/[.\s]+$/, "");
  const article = /^[aeiou]/i.test(category.label) ? "an" : "a";
  const parts = [];
  const ongoing = form.isOngoing === "Yes" ? ", and is described as ongoing" : form.isOngoing === "No" ? ", described as a single incident" : "";
  parts.push(`This is ${article} ${category.label.toLowerCase()} concern${ongoing}, submitted ${form.disclosureType === "named" ? "with the reporter's identity disclosed" : "anonymously"}.`);
  if (form.summary) parts.push(clean(form.summary) + ".");
  if (form.relationshipToInvolved) parts.push(`The reporter's relationship to the person(s) involved: ${form.relationshipToInvolved}.`);
  if (form.othersInvolved) parts.push(`Others involved or affected: ${clean(form.othersInvolved)}.`);
  if (form.location) parts.push(`Location: ${form.location}.`);
  if (form.occurredDate) parts.push(`Reported to have occurred around ${form.occurredDate}.`);
  (questions || []).forEach((q) => {
    if (form[q.id]) parts.push(`${clean(q.label.replace(/\?$/, ""))}: ${form[q.id]}.`);
  });
  if (form.witnesses) parts.push(`Witnesses: ${clean(form.witnesses)}.`);
  if (form.priorReport === "Yes" && form.priorReportDetails) parts.push(`This was previously reported: ${clean(form.priorReportDetails)}.`);
  if (form.impactDescription) parts.push(`Impact described by the reporter: ${clean(form.impactDescription)}.`);
  if (form.desiredOutcome && form.desiredOutcome.length) parts.push(`Desired outcome: ${form.desiredOutcome.join(", ")}.`);
  return parts.join(" ");
}

const COMMON_POLICIES = [
  { title: "Leave Policy", desc: "Annual, sick, parental, and other leave entitlements — how they accrue, how to request time off, and how approvals work." },
  { title: "Medical & Health Benefits Policy", desc: "Health insurance coverage, how to file claims, and wellness benefits available to you and eligible dependents." },
  { title: "Transport & Commute Policy", desc: "Commute reimbursement, company transport options, parking, and guidelines for booking business travel." },
];

const POLICY_DATA = {
  global: {
    label: "Global / Default",
    policies: [
      { title: "Code of Business Conduct", desc: "The baseline standard of behavior expected of every employee, everywhere the company operates, including conflicts of interest and gifts." },
      { title: "Whistleblower Protection Policy", desc: "Explains how good-faith reports are protected from retaliation, and how anonymous reporting is handled where local law allows it." },
      { title: "Anti-Harassment & Discrimination Policy", desc: "Defines prohibited conduct and the process for raising and investigating concerns about harassment or discrimination." },
      { title: "Anti-Bribery & Corruption Policy", desc: "Covers gifts, hospitality, facilitation payments, and dealings with government officials and third parties." },
    ],
    channels: { email: "ethics@company.com", phone: "+1-800-555-0199 (Toll-free, English)", hours: "24/7, multilingual on request" },
    crisis: { name: "Find A Helpline (global directory)", phone: "findahelpline.com", note: "An independent directory to find a crisis line in your own country." },
  },
  us: {
    label: "United States",
    policies: [
      { title: "Equal Employment Opportunity Policy", desc: "Prohibits discrimination and harassment based on protected characteristics under federal and state law." },
      { title: "Whistleblower Protection Policy", desc: "Covers protections consistent with US whistleblower statutes, including Sarbanes-Oxley for financial reporting concerns." },
      { title: "Workplace Safety Policy (OSHA-aligned)", desc: "Standards for reporting unsafe conditions and the process for corrective action." },
    ],
    channels: { email: "ethics.us@company.com", phone: "1-800-555-0111 (Toll-free)", hours: "24/7" },
    crisis: { name: "988 Suicide & Crisis Lifeline", phone: "Call or text 988", note: "Free, confidential, 24/7 — for any kind of emotional crisis, not only suicidal thoughts." },
  },
  uk: {
    label: "United Kingdom",
    policies: [
      { title: "Public Interest Disclosure Policy", desc: "Aligned with UK whistleblowing law (PIDA), covering qualifying disclosures and protection from detriment." },
      { title: "Dignity at Work Policy", desc: "The UK-specific policy on harassment, bullying, and discrimination in the workplace." },
      { title: "Bribery Act Compliance Policy", desc: "Reflects UK Bribery Act obligations, including the corporate offense of failing to prevent bribery." },
    ],
    channels: { email: "ethics.uk@company.com", phone: "0800 555 0122 (Freephone)", hours: "Mon–Fri, 8am–8pm GMT" },
    crisis: { name: "Samaritans", phone: "116 123", note: "Free, confidential, 24/7 — for anyone struggling to cope." },
  },
  india: {
    label: "India",
    policies: [
      { title: "POSH Policy (Prevention of Sexual Harassment)", desc: "Implements the Sexual Harassment of Women at Workplace Act, 2013, including Internal Committee (IC) procedures." },
      { title: "Whistleblower & Vigil Mechanism Policy", desc: "Covers the vigil mechanism required under the Companies Act, with escalation to the Audit Committee where applicable." },
      { title: "Prevention of Bribery Policy", desc: "Guidance on gifts, hospitality, and dealings with public officials under Indian anti-corruption law." },
    ],
    channels: { email: "ethics.india@company.com", phone: "1800-555-0133 (Toll-free)", hours: "Mon–Sat, 9am–9pm IST" },
    crisis: { name: "Tele-MANAS (Govt. of India)", phone: "14416 or 1-800-891-4416", note: "Free, 24/7, multilingual national mental health helpline." },
  },
  germany: {
    label: "Germany",
    policies: [
      { title: "Hinweisgeberschutzgesetz (Whistleblower Protection) Policy", desc: "Reflects Germany's whistleblower protection law, including required internal reporting channel obligations." },
      { title: "AGG Compliance Policy", desc: "Anti-discrimination policy aligned with the General Equal Treatment Act (AGG)." },
      { title: "Data Protection Policy (GDPR/BDSG)", desc: "Covers how personal data — including case data from this tool — is handled under GDPR and German data protection law." },
    ],
    channels: { email: "ethics.de@company.com", phone: "0800 555 0144 (Gebührenfrei)", hours: "Mo–Fr, 9–18 Uhr CET" },
    crisis: { name: "TelefonSeelsorge", phone: "0800 111 0 111 or 0800 111 0 222", note: "Free, anonymous, 24/7 emotional support in German." },
  },
  singapore: {
    label: "Singapore",
    policies: [
      { title: "Workplace Fairness Policy", desc: "Reflects Singapore's Tripartite Guidelines and workplace fairness legislation on discrimination." },
      { title: "Whistleblowing Policy", desc: "Internal reporting and protection standards for employees raising concerns in good faith." },
      { title: "Anti-Corruption Policy (PCA-aligned)", desc: "Guidance consistent with the Prevention of Corruption Act on gifts and improper payments." },
    ],
    channels: { email: "ethics.sg@company.com", phone: "800-555-0155 (Toll-free)", hours: "Mon–Fri, 9am–6pm SGT" },
    crisis: { name: "Samaritans of Singapore (SOS)", phone: "1767 · CareText (WhatsApp) 9151 1767", note: "Free, confidential, 24-hour hotline and crisis text line." },
  },
};

const STEP_TITLES = ["Identity", "What happened", "People & evidence", "More details", "Impact & outcome", "Review"];
const STATUS_FLOW = ["Submitted", "In review", "Investigating", "Resolved", "Closed"];
const URGENCY_RANK = { immediate: 0, high: 1, medium: 2, low: 3 };

const URGENCY_STYLES = {
  low: "bg-slate-100 text-slate-700",
  medium: "bg-amber-100 text-amber-800",
  high: "bg-orange-100 text-orange-800",
  immediate: "bg-red-100 text-red-800",
};

const STATUS_STYLES = {
  "Submitted": "bg-slate-100 text-slate-700",
  "In review": "bg-blue-100 text-blue-800",
  "Investigating": "bg-amber-100 text-amber-800",
  "Resolved": "bg-teal-100 text-teal-800",
  "Closed": "bg-slate-200 text-slate-600",
};

function generateDemoCases() {
  return [
    {
      id: "CNC-2026-100234", category: "employee_relations", categoryLabel: "Employee relations", team: "HR – Employee Relations",
      urgency: "high", status: "Investigating", disclosureType: "anonymous", submittedAt: "7/12/2026, 9:14 AM",
      summary: "My manager has repeatedly made dismissive and hostile comments about my work in front of the team, even after I asked him to stop.",
      occurredDate: "2026-07-08", isOngoing: "Yes", location: "Marketing dept, 3rd floor",
      othersInvolved: "My manager", witnesses: "Two teammates were present during the most recent incident",
      priorReport: "No", priorReportDetails: "", attachments: ["attachment-1.pdf"], referenceNumbers: "",
      impactDescription: "Affecting my confidence and willingness to speak up in meetings.", desiredOutcome: ["Investigation", "Mediation"], followUpConsent: "",
      categoryAnswers: {
        erConcernType: { label: "What type of concern is this?", value: "Harassment" },
        relationshipToInvolved: { label: "What is your relationship to the person involved?", value: "My manager" },
        frequency: { label: "Has this happened once or repeatedly?", value: "Repeated pattern" },
      },
      investigation: { startDate: "2026-07-13", actionsTaken: "Initial interview with reporter completed. Scheduling interviews with named witnesses.", findings: "", outcome: "", correctiveAction: "", closureNotes: "", internalComments: "Sensitive — manager has prior informal complaint on file." },
      auditLog: [
        { action: "Case submitted", actor: "Anonymous reporter", timestamp: "7/12/2026, 9:14 AM" },
        { action: 'Status changed to "In review"', actor: "Priya Sharma", timestamp: "7/12/2026, 2:40 PM" },
        { action: 'Status changed to "Investigating"', actor: "Priya Sharma", timestamp: "7/13/2026, 10:05 AM" },
      ],
    },
    {
      id: "CNC-2026-100587", category: "facilities", categoryLabel: "Facilities", team: "Facilities Management",
      urgency: "medium", status: "Submitted", disclosureType: "named", submittedAt: "7/15/2026, 11:02 AM",
      employeeName: "Alex Turner", employeeId: "EMP4521",
      summary: "The air conditioning on the 2nd floor of Building 4 has not worked properly for two weeks; it's been over 30°C most afternoons.",
      occurredDate: "2026-07-01", isOngoing: "Yes", location: "Building 4, 2nd floor",
      othersInvolved: "Affects the whole floor", witnesses: "", priorReport: "Yes", priorReportDetails: "Emailed facilities helpdesk twice, no response.",
      attachments: [], referenceNumbers: "Ticket #FAC-8821",
      impactDescription: "Team productivity is dropping in the afternoons.", desiredOutcome: ["No specific action — just wanted this on record"], followUpConsent: "Yes",
      categoryAnswers: {
        safetyRisk: { label: "Is there an immediate safety risk?", value: "No" },
        facilityIssueType: { label: "What kind of facilities issue is this?", value: "Temperature/HVAC" },
        buildingLocation: { label: "Which building or floor?", value: "Building 4, 2nd floor" },
      },
      investigation: null,
      auditLog: [{ action: "Case submitted", actor: "Alex Turner", timestamp: "7/15/2026, 11:02 AM" }],
    },
    {
      id: "CNC-2026-100812", category: "financial_fraud", categoryLabel: "Financial fraud", team: "Internal Audit / Finance Investigations",
      urgency: "immediate", status: "In review", disclosureType: "anonymous", submittedAt: "7/17/2026, 8:47 AM",
      summary: "I noticed several invoices from a vendor that don't match any work I'm aware of being done, approved by the same manager each time.",
      occurredDate: "2026-06-20", isOngoing: "Yes", location: "Procurement",
      othersInvolved: "A manager in procurement", witnesses: "", priorReport: "No", priorReportDetails: "",
      attachments: ["attachment-1.pdf", "attachment-2.pdf"], referenceNumbers: "Invoices #4471, #4502, #4530",
      impactDescription: "Estimated at tens of thousands of dollars over several months.", desiredOutcome: ["Investigation"], followUpConsent: "",
      categoryAnswers: {
        fraudType: { label: "What type of concern is this?", value: "Vendor/invoice fraud" },
        estimatedImpact: { label: "Estimated financial impact, if known", value: "$45,000 approx." },
        involvedAccounts: { label: "Accounts, vendors, or transactions involved", value: "Vendor: Meridian Supply Co." },
      },
      investigation: { startDate: "2026-07-17", actionsTaken: "Flagged to audit lead same day given urgency rating.", findings: "", outcome: "", correctiveAction: "", closureNotes: "", internalComments: "" },
      auditLog: [
        { action: "Case submitted", actor: "Anonymous reporter", timestamp: "7/17/2026, 8:47 AM" },
        { action: 'Status changed to "In review"', actor: "Marcus Webb", timestamp: "7/17/2026, 9:30 AM" },
      ],
    },
    {
      id: "CNC-2026-101023", category: "ethics", categoryLabel: "Ethics", team: "Ethics & Compliance Officer",
      urgency: "low", status: "Resolved", disclosureType: "named", submittedAt: "6/28/2026, 3:15 PM",
      employeeName: "Jordan Lee", employeeId: "EMP3390",
      summary: "A vendor sent an expensive gift basket to our team lead around contract renewal time and I wasn't sure if that was appropriate to accept.",
      occurredDate: "2026-06-25", isOngoing: "No", location: "N/A",
      othersInvolved: "Team lead, external vendor", witnesses: "", priorReport: "No", priorReportDetails: "",
      attachments: [], referenceNumbers: "", impactDescription: "None, just wanted to flag it.", desiredOutcome: ["No specific action — just wanted this on record"], followUpConsent: "Yes",
      categoryAnswers: {
        ethicsType: { label: "What type of concern is this?", value: "Gifts or bribery" },
        involvedParties: { label: "Who is involved, if you're comfortable sharing?", value: "Team lead and an external vendor" },
      },
      investigation: { startDate: "2026-06-29", actionsTaken: "Reviewed gift policy, confirmed value with team lead, checked contract renewal timeline.", findings: "Gift was declared and logged per policy; value was under the reportable threshold.", outcome: "Unsubstantiated", correctiveAction: "None required — reminder sent to team about gift declaration process.", closureNotes: "Closed after policy confirmation.", internalComments: "No pattern found with this vendor previously." },
      auditLog: [
        { action: "Case submitted", actor: "Jordan Lee", timestamp: "6/28/2026, 3:15 PM" },
        { action: 'Status changed to "Investigating"', actor: "Sam Okafor", timestamp: "6/29/2026, 9:00 AM" },
        { action: "Investigation details updated", actor: "Sam Okafor", timestamp: "7/02/2026, 4:20 PM" },
        { action: 'Status changed to "Resolved"', actor: "Sam Okafor", timestamp: "7/02/2026, 4:22 PM" },
      ],
    },
    {
      id: "CNC-2026-101190", category: "code_of_conduct", categoryLabel: "Code of conduct", team: "Compliance",
      urgency: "medium", status: "Closed", disclosureType: "anonymous", submittedAt: "6/10/2026, 1:00 PM",
      summary: "A colleague has been submitting expense reports for client dinners that, based on the dates, didn't line up with any client visits I'm aware of.",
      occurredDate: "2026-05-15", isOngoing: "No", location: "Sales team", othersInvolved: "A sales colleague", witnesses: "",
      priorReport: "No", priorReportDetails: "", attachments: [], referenceNumbers: "",
      impactDescription: "", desiredOutcome: ["Investigation"], followUpConsent: "",
      categoryAnswers: {
        conductType: { label: "What type of policy violation is this?", value: "Expense policy" },
        policySection: { label: "Which policy section, if known?", value: "Section 4.2 — Client Entertainment" },
      },
      investigation: { startDate: "2026-06-11", actionsTaken: "Cross-referenced expense reports with client visit logs and calendar entries.", findings: "Two expense claims could not be matched to any recorded client visit.", outcome: "Substantiated", correctiveAction: "Reimbursement clawback processed; formal warning issued.", closureNotes: "Case closed after HR and Finance sign-off.", internalComments: "" },
      auditLog: [
        { action: "Case submitted", actor: "Anonymous reporter", timestamp: "6/10/2026, 1:00 PM" },
        { action: 'Status changed to "Investigating"', actor: "Sam Okafor", timestamp: "6/11/2026, 10:00 AM" },
        { action: 'Status changed to "Resolved"', actor: "Sam Okafor", timestamp: "6/20/2026, 2:30 PM" },
        { action: 'Status changed to "Closed"', actor: "Sam Okafor", timestamp: "6/21/2026, 9:15 AM" },
      ],
    },
  ];
}

function emptyForm() {
  return {
    disclosureType: "", employeeName: "", employeeId: "",
    summary: "", occurredDate: "", isOngoing: "", location: "",
    othersInvolved: "", relationshipToInvolved: "", witnesses: "", priorReport: "", priorReportDetails: "",
    attachments: [], referenceNumbers: "",
    urgency: "", impactDescription: "", desiredOutcome: [], followUpConsent: "",
    draftSummary: "",
  };
}

function emptyInvestigation() {
  return { startDate: "", actionsTaken: "", findings: "", outcome: "", correctiveAction: "", closureNotes: "", internalComments: "" };
}

function Field({ label, required, help, children }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-semibold text-slate-800 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {help && <p className="text-xs text-slate-500 mb-2">{help}</p>}
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/15 focus:border-teal-500 transition-all";

function HeroGraphic({ large }) {
  return (
    <svg viewBox="0 0 200 200" className={large ? "w-56 h-56 sm:w-64 sm:h-64" : "w-32 h-32 mx-auto mb-5"} fill="none">
      <defs>
        <linearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="100" r="72" fill="url(#heroGrad)" opacity="0.10" />
      <circle cx="100" cy="100" r="52" fill="url(#heroGrad)" opacity="0.16" />
      <path d="M100 44l40 15v33c0 26-17 49-40 57-23-8-40-31-40-57V59l40-15z" fill="url(#heroGrad)" />
      <path d="M82 101l13 13 24-26" stroke="white" strokeWidth="6.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="38" cy="58" r="5.5" fill="#4f46e5" className="animate-pulse" />
      <circle cx="167" cy="68" r="4.5" fill="#0d9488" className="animate-pulse" />
      <circle cx="158" cy="152" r="6" fill="#4f46e5" opacity="0.7" />
      <circle cx="30" cy="140" r="4" fill="#0d9488" opacity="0.6" />
      <line x1="58" y1="63" x2="83" y2="76" stroke="#94a3b8" strokeWidth="1.4" strokeDasharray="3 4" />
      <line x1="152" y1="82" x2="122" y2="92" stroke="#94a3b8" strokeWidth="1.4" strokeDasharray="3 4" />
    </svg>
  );
}

function SuccessGraphic() {
  return (
    <svg viewBox="0 0 120 120" className="w-16 h-16 mx-auto mb-4" fill="none">
      <circle cx="60" cy="60" r="38" fill="url(#heroGrad2)" opacity="0.12" />
      <circle cx="60" cy="60" r="27" fill="url(#heroGrad2)" />
      <defs>
        <linearGradient id="heroGrad2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0d9488" />
          <stop offset="100%" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <path d="M48 61l9 9 17-19" stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="18" cy="28" r="4" fill="#4f46e5" />
      <circle cx="101" cy="34" r="3" fill="#0d9488" />
      <circle cx="97" cy="96" r="5" fill="#4f46e5" opacity="0.6" />
      <circle cx="13" cy="90" r="3" fill="#0d9488" opacity="0.6" />
    </svg>
  );
}

function SupportModal({ open, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full p-7 max-h-[85vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600">
          <X size={18} />
        </button>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-100 to-indigo-100 text-rose-500 flex items-center justify-center mb-4">
          <Heart size={22} />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">You're not alone</h2>
        <p className="text-sm text-slate-600 leading-relaxed mb-4">
          Speaking up takes courage, whatever the outcome. This process is designed to support you, not put you on trial —
          you're in control at every step, you can stay anonymous, and nothing is submitted until you choose to.
        </p>
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-2 mb-1.5">
            <ShieldCheck size={15} className="text-teal-700" />
            <span className="text-sm font-semibold text-teal-900">You're protected</span>
          </div>
          <p className="text-xs text-teal-800 leading-relaxed">
            Retaliation of any kind against someone who reports in good faith is strictly prohibited and treated as its own
            violation — regardless of what the investigation finds.
          </p>
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <LifeBuoy size={15} className="text-slate-600" />
            <span className="text-sm font-semibold text-slate-800">Need to talk to someone right now?</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The Employee Assistance Program (EAP) offers free, confidential support 24/7 — separate from this reporting
            tool. <span className="font-medium">1-800-XXX-XXXX</span> · available anytime, for any reason.
          </p>
        </div>
        <button onClick={onClose} className="w-full mt-5 text-sm font-semibold bg-slate-900 text-white py-2.5 rounded-xl hover:bg-slate-800 transition-colors">
          Continue
        </button>
      </div>
    </div>
  );
}

function Logo() {
  return (
    <div className="rounded-2xl bg-teal-600 text-white flex items-center justify-center flex-shrink-0" style={{ width: 32, height: 32 }}>
      <ShieldCheck size={18} />
    </div>
  );
}

function TopBar({ onHome, onTrack, showTrack, onSupport }) {
  return (
    <div className="flex items-center justify-between py-4">
      <button onClick={onHome} className="flex items-center gap-2.5">
        <Logo />
        <div className="text-left">
          <div className="font-semibold text-white text-base leading-tight">Trust AI</div>
          <div className="text-[11px] text-slate-400 leading-tight">Confidential concern reporting</div>
        </div>
      </button>
      <div className="flex items-center gap-4">
        <button onClick={onSupport} className="text-sm text-rose-300 hover:text-rose-200 flex items-center gap-1.5 font-medium">
          <Heart size={14} /> <span className="hidden sm:inline">Support</span>
        </button>
        {showTrack && (
          <button onClick={onTrack} className="text-sm text-teal-300 hover:text-teal-200 flex items-center gap-1.5 font-medium">
            <Search size={14} /> Track a case
          </button>
        )}
      </div>
    </div>
  );
}

function InvestigatorTopBar({ team, name, onLogout, onDashboard, showNav, onSupport }) {
  return (
    <div className="flex items-center justify-between py-4">
      <button onClick={showNav ? onDashboard : undefined} className="flex items-center gap-2.5">
        <Logo />
        <div className="text-left">
          <div className="font-semibold text-white text-base leading-tight">Trust AI <span className="text-slate-400 font-normal">— Investigator Portal</span></div>
          <div className="text-[11px] text-slate-400 leading-tight">{team || "Sign in to continue"}</div>
        </div>
      </button>
      <div className="flex items-center gap-4">
        <button onClick={onSupport} className="text-sm text-rose-300 hover:text-rose-200 flex items-center gap-1.5 font-medium">
          <Heart size={14} /> <span className="hidden sm:inline">Support</span>
        </button>
        {showNav && (
          <>
            <span className="text-sm text-slate-300 hidden sm:inline">{name}</span>
            <button onClick={onLogout} className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors">
              <LogOut size={14} /> Log out
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function HrTopBar({ name, onLogout, showNav, onSupport }) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-2.5">
        <Logo />
        <div className="text-left">
          <div className="font-semibold text-white text-base leading-tight">Trust AI <span className="text-slate-400 font-normal">— HR Leadership</span></div>
          <div className="text-[11px] text-slate-400 leading-tight">Aggregate analytics — no case-level detail</div>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={onSupport} className="text-sm text-rose-300 hover:text-rose-200 flex items-center gap-1.5 font-medium">
          <Heart size={14} /> <span className="hidden sm:inline">Support</span>
        </button>
        {showNav && (
          <>
            <span className="text-sm text-slate-300 hidden sm:inline">{name}</span>
            <button onClick={onLogout} className="flex items-center gap-1.5 text-sm text-slate-300 hover:text-white transition-colors">
              <LogOut size={14} /> Log out
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function TrustAIApp() {
  const [view, setView] = useState("landing");
  const [category, setCategory] = useState(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm());
  const [cases, setCases] = useState(() => generateDemoCases());
  const [caseId, setCaseId] = useState(null);
  const [trackInput, setTrackInput] = useState("");
  const [trackResult, setTrackResult] = useState(undefined);

  const [invTeam, setInvTeam] = useState("");
  const [invName, setInvName] = useState("");
  const [activeCaseId, setActiveCaseId] = useState(null);
  const [hrName, setHrName] = useState("");
  const [showSupport, setShowSupport] = useState(false);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  function startCategory(cat, description) {
    setCategory(cat);
    const f = emptyForm();
    if (description) f.summary = description;
    setForm(f);
    setStep(0);
    setView("wizard");
  }

  function toggleOutcome(val) {
    setForm((f) => ({
      ...f,
      desiredOutcome: f.desiredOutcome.includes(val)
        ? f.desiredOutcome.filter((v) => v !== val)
        : [...f.desiredOutcome, val],
    }));
  }

  function addFile() {
    const n = form.attachments.length + 1;
    update("attachments", [...form.attachments, `attachment-${n}.pdf`]);
  }
  function removeFile(name) {
    update("attachments", form.attachments.filter((a) => a !== name));
  }

  function canContinue() {
    if (step === 0) return !!form.disclosureType && (form.disclosureType === "anonymous" || (form.employeeName && form.employeeId));
    if (step === 1) return !!form.summary && !!form.isOngoing;
    if (step === 4) return !!form.urgency;
    return true;
  }

  function submitCase() {
    const id = `CNC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const categoryAnswers = {};
    (CATEGORY_QUESTIONS[category.id] || []).forEach((q) => {
      if (form[q.id]) categoryAnswers[q.id] = { label: q.label, value: form[q.id] };
    });
    const record = {
      id, category: category.id, categoryLabel: category.label, team: category.team,
      urgency: form.urgency, status: "Submitted",
      disclosureType: form.disclosureType, submittedAt: new Date().toLocaleString(),
      summary: form.summary, draftSummary: form.draftSummary, occurredDate: form.occurredDate, isOngoing: form.isOngoing, location: form.location,
      othersInvolved: form.othersInvolved, relationshipToInvolved: form.relationshipToInvolved, witnesses: form.witnesses,
      priorReport: form.priorReport, priorReportDetails: form.priorReportDetails,
      attachments: form.attachments, referenceNumbers: form.referenceNumbers,
      impactDescription: form.impactDescription, desiredOutcome: form.desiredOutcome, followUpConsent: form.followUpConsent,
      categoryAnswers,
      investigation: null,
      auditLog: [{ action: "Case submitted", actor: form.disclosureType === "named" ? form.employeeName : "Anonymous reporter", timestamp: new Date().toLocaleString() }],
      ...(form.disclosureType === "named" ? { employeeName: form.employeeName, employeeId: form.employeeId } : {}),
    };
    setCases((c) => [...c, record]);
    setCaseId(id);
    setView("confirmation");
  }

  function lookupCase() {
    const found = cases.find((c) => c.id.toLowerCase() === trackInput.trim().toLowerCase());
    setTrackResult(found || null);
  }

  function updateCaseStatus(id, status) {
    setCases((prev) => prev.map((c) => c.id === id ? {
      ...c, status,
      auditLog: [...c.auditLog, { action: `Status changed to "${status}"`, actor: invName || "Investigator", timestamp: new Date().toLocaleString() }],
    } : c));
  }

  function saveInvestigation(id, investigation) {
    setCases((prev) => prev.map((c) => c.id === id ? {
      ...c, investigation,
      auditLog: [...c.auditLog, { action: "Investigation details updated", actor: invName || "Investigator", timestamp: new Date().toLocaleString() }],
    } : c));
  }

  const goHome = () => setView("landing");
  const goTrack = () => { setTrackInput(""); setTrackResult(undefined); setView("track"); };

  function investigatorLogin(team, name) {
    setInvTeam(team);
    setInvName(name);
    setView("invDashboard");
  }
  function investigatorLogout() {
    setInvTeam(""); setInvName(""); setActiveCaseId(null);
    setView("landing");
  }
  function hrLogin(name) {
    setHrName(name);
    setView("analytics");
  }
  function hrLogout() {
    setHrName("");
    setView("landing");
  }
  function openCase(id) {
    setActiveCaseId(id);
    setView("invCase");
  }
  function resetDemo() {
    setCases(generateDemoCases());
  }

  const isInvestigatorView = view === "invLogin" || view === "invDashboard" || view === "invCase";
  const isHrView = view === "hrLogin" || view === "analytics";
  const activeCase = cases.find((c) => c.id === activeCaseId);
  const WIDE_VIEWS = ["categories", "invDashboard", "analytics", "invLogin", "hrLogin", "policies", "channels", "wellbeing"];
  const contentWidthCls = view === "landing" ? "" : WIDE_VIEWS.includes(view) ? "max-w-6xl mx-auto px-6 py-10" : "max-w-2xl mx-auto px-5 py-10";

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 text-slate-800">
      <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          {!isInvestigatorView && !isHrView && (
            <TopBar onHome={goHome} onTrack={goTrack} showTrack={view !== "landing"} onSupport={() => setShowSupport(true)} />
          )}
          {isInvestigatorView && (
            <InvestigatorTopBar team={invTeam} name={invName} onLogout={investigatorLogout} onDashboard={() => setView("invDashboard")} showNav={view !== "invLogin"} onSupport={() => setShowSupport(true)} />
          )}
          {isHrView && (
            <HrTopBar name={hrName} onLogout={hrLogout} showNav={view !== "hrLogin"} onSupport={() => setShowSupport(true)} />
          )}
        </div>
      </div>

      <SupportModal open={showSupport} onClose={() => setShowSupport(false)} />

      {view === "landing" && (
        <Landing
          onStart={() => setView("describe")} onTrack={goTrack}
          onInvestigator={() => setView("invLogin")} onHrLeadership={() => setView("hrLogin")}
          onPolicies={() => setView("policies")} onChannels={() => setView("channels")} onWellbeing={() => setView("wellbeing")}
        />
      )}

      <div className={contentWidthCls}>
        {view === "describe" && (
          <DescribeConcern onSelect={startCategory} onManual={() => setView("categories")} onBack={goHome} onSupport={() => setShowSupport(true)} />
        )}

        {view === "categories" && (
          <CategoryPicker onSelect={(cat) => startCategory(cat)} onBack={() => setView("describe")} />
        )}

        {view === "wizard" && category && (
          <Wizard
            category={category} step={step} setStep={setStep} form={form} update={update}
            toggleOutcome={toggleOutcome} addFile={addFile} removeFile={removeFile}
            canContinue={canContinue()} onCancel={() => setView("categories")} onSubmit={submitCase}
            onSupport={() => setShowSupport(true)}
          />
        )}

        {view === "confirmation" && (
          <Confirmation caseId={caseId} category={category} disclosureType={form.disclosureType} onDone={goHome} onSupport={() => setShowSupport(true)} />
        )}

        {view === "track" && (
          <Track trackInput={trackInput} setTrackInput={setTrackInput} trackResult={trackResult} onLookup={lookupCase} onBack={goHome} />
        )}

        {view === "invLogin" && (
          <InvestigatorLogin onLogin={investigatorLogin} onBack={goHome} />
        )}

        {view === "invDashboard" && (
          <InvestigatorDashboard cases={cases.filter((c) => c.team === invTeam)} onOpen={openCase} onReset={resetDemo} />
        )}

        {view === "invCase" && activeCase && (
          <InvestigatorCaseDetail
            c={activeCase}
            onBack={() => setView("invDashboard")}
            onStatusChange={(s) => updateCaseStatus(activeCase.id, s)}
            onSaveInvestigation={(inv) => saveInvestigation(activeCase.id, inv)}
            investigatorName={invName}
          />
        )}

        {view === "policies" && (
          <PolicyCorner onBack={goHome} />
        )}

        {view === "channels" && (
          <ReportingChannels onBack={goHome} />
        )}

        {view === "wellbeing" && (
          <WellbeingResources onBack={goHome} onSupport={() => setShowSupport(true)} />
        )}

        {view === "hrLogin" && (
          <HrLogin onLogin={hrLogin} onBack={goHome} />
        )}

        {view === "analytics" && (
          <Analytics cases={cases} />
        )}
      </div>
    </div>
  );
}

function Landing({ onStart, onTrack, onInvestigator, onHrLeadership, onPolicies, onChannels, onWellbeing }) {
  const features = [
    { icon: Lock, title: "Anonymous by design", desc: "Disclose your identity or stay fully anonymous — anonymous cases never store identifying data.", bg: "bg-teal-50", text: "text-teal-600" },
    { icon: Sparkles, title: "AI-assisted routing", desc: "Describe your concern in your own words and Trust AI suggests which team it belongs to, with a confidence score.", bg: "bg-violet-50", text: "text-violet-600" },
    { icon: ShieldCheck, title: "Seven dedicated channels", desc: "Employee relations, facilities, real estate, compliance, financial fraud, ethics, and code of conduct.", bg: "bg-blue-50", text: "text-blue-600" },
    { icon: Search, title: "Full visibility", desc: "Track any case status anytime with just a case ID — no login required, even for anonymous reports.", bg: "bg-amber-50", text: "text-amber-600" },
  ];

  return (
    <div className="w-full">
      {/* Full-bleed dark hero */}
      <div className="relative w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "26px 26px" }}
        />
        <div className="pointer-events-none absolute top-10 right-10 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur border border-white/20 text-teal-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              <Sparkles size={12} /> AI-assisted intake & routing
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-3 tracking-tight">
              Speak up,{" "}
              <span className="bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent">safely.</span>
            </h1>
            <p className="text-sm font-bold uppercase tracking-wide bg-gradient-to-r from-teal-400 to-indigo-400 bg-clip-text text-transparent mb-5">
              10x easier to report · 10x faster to resolve
            </p>
            <p className="text-[15px] text-slate-300 max-w-md mx-auto lg:mx-0 mb-8 leading-relaxed">
              Trust AI gives every employee a single, confidential channel to raise concerns — from workplace conflicts
              to compliance and fraud — with AI-assisted routing to the right team.
            </p>
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <button onClick={onStart} className="flex items-center gap-1.5 bg-gradient-to-r from-teal-500 to-teal-400 text-slate-950 text-sm font-bold px-6 py-3 rounded-xl shadow-lg shadow-teal-500/20 hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all">
                Report a concern <ArrowRight size={15} />
              </button>
              <button onClick={onTrack} className="text-sm font-semibold text-white bg-white/10 backdrop-blur border border-white/20 px-6 py-3 rounded-xl hover:bg-white/15 hover:-translate-y-0.5 transition-all">
                Track a case
              </button>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-4 text-xs text-slate-400 mt-8">
              <span>7 categories</span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span>100% anonymous option</span>
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              <span>AI-assisted triage</span>
            </div>
          </div>

          <div className="relative flex justify-center">
            <div className="relative bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-10 sm:p-14">
              <HeroGraphic large />
              <div className="absolute -top-3 -right-3 bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                <Sparkles size={11} className="text-teal-600" /> 94% match confidence
              </div>
              <div className="absolute -bottom-3 -left-3 bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                <Lock size={11} className="text-indigo-600" /> Fully anonymous
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature band */}
      <div className="w-full bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f) => (
              <div key={f.title} className="bg-white border border-slate-200/70 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-5">
                <div className={`w-10 h-10 rounded-xl ${f.bg} ${f.text} flex items-center justify-center mb-3`}>
                  <f.icon size={19} />
                </div>
                <div className="text-sm font-semibold text-slate-900 mb-1.5">{f.title}</div>
                <div className="text-xs text-slate-500 leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resources band: three separate, independent entry points */}
      <div className="w-full bg-slate-50 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-4">Resources — independent of reporting a concern</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button onClick={onPolicies} className="text-left bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 hover:shadow-xl transition-shadow relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-indigo-300 flex items-center justify-center mb-4">
                  <Globe size={20} />
                </div>
                <div className="text-base font-bold text-white mb-1.5">Policy corner</div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">Browse leave, medical, transport, and compliance policies by country.</p>
                <span className="flex items-center gap-1 text-xs font-semibold text-white">Browse policies <ArrowRight size={12} /></span>
              </div>
            </button>

            <button onClick={onChannels} className="text-left bg-gradient-to-br from-teal-700 to-teal-900 rounded-3xl p-6 hover:shadow-xl transition-shadow relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-teal-200 flex items-center justify-center mb-4">
                  <Phone size={20} />
                </div>
                <div className="text-base font-bold text-white mb-1.5">Other ways to report</div>
                <p className="text-xs text-teal-100 leading-relaxed mb-4">Email and toll-free hotline numbers — no app required, still anonymous.</p>
                <span className="flex items-center gap-1 text-xs font-semibold text-white">View channels <ArrowRight size={12} /></span>
              </div>
            </button>

            <button onClick={onWellbeing} className="text-left bg-gradient-to-br from-rose-600 to-rose-900 rounded-3xl p-6 hover:shadow-xl transition-shadow relative overflow-hidden">
              <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
              <div className="relative">
                <div className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur border border-white/20 text-rose-100 flex items-center justify-center mb-4">
                  <Heart size={20} />
                </div>
                <div className="text-base font-bold text-white mb-1.5">Mental health & wellbeing</div>
                <p className="text-xs text-rose-100 leading-relaxed mb-4">Crisis lines, EAP counseling, and everyday wellbeing support — confidential.</p>
                <span className="flex items-center gap-1 text-xs font-semibold text-white">Find support <ArrowRight size={12} /></span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Sign-in links */}
      <div className="w-full">
        <div className="max-w-2xl mx-auto px-6 py-10 text-center">
          <button onClick={onInvestigator} className="text-sm text-slate-600 hover:text-teal-700 flex items-center gap-1.5 mx-auto mb-2 transition-colors">
            <ClipboardList size={14} /> Are you on an investigation team? Investigator sign-in
          </button>
          <button onClick={onHrLeadership} className="text-sm text-slate-600 hover:text-teal-700 flex items-center gap-1.5 mx-auto transition-colors">
            <BarChart3 size={14} /> HR leadership — view aggregate analytics
          </button>
          <p className="text-center text-[11px] text-slate-400 mt-6">Prototype build — proof of concept for internal review</p>
        </div>
      </div>
    </div>
  );
}

function DescribeConcern({ onSelect, onManual, onBack, onSupport }) {
  const [description, setDescription] = useState("");
  const [matches, setMatches] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  function analyze() {
    setAnalyzing(true);
    setMatches(null);
    setTimeout(() => {
      setMatches(analyzeConcern(description));
      setAnalyzing(false);
    }, 700);
  }

  return (
    <div className="relative">
      <button onClick={onBack} className="relative flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 mb-5">
        <ArrowLeft size={14} /> Back
      </button>

      <ResourceHeader
        icon={Sparkles} title="What would you like to report?"
        desc="Describe what happened in your own words. Trust AI will suggest which team it likely belongs to — you'll always confirm before it's submitted."
        from="from-slate-900" to="to-indigo-950" iconText="text-teal-300"
        badge={<><Sparkles size={11} className="text-indigo-600" /> AI-assisted</>}
      />

      <div className="relative">
        <div className="flex items-start gap-2.5 bg-gradient-to-r from-rose-50 to-indigo-50 border border-rose-100 rounded-2xl p-4 mb-5">
          <Heart size={16} className="text-rose-500 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-slate-700 leading-relaxed">
            Take your time — there's no wrong way to describe what happened. You're protected from retaliation for reporting
            in good faith.{" "}
            <button onClick={onSupport} className="font-semibold text-rose-600 hover:text-rose-700 underline underline-offset-2">
              View support resources
            </button>
          </p>
        </div>

        <div className="bg-white border border-slate-200/70 rounded-3xl shadow-sm p-6 sm:p-8">
          <div className="text-sm font-semibold text-slate-800 mb-3">Describe what happened</div>
          <textarea
            rows={5}
            className={inputCls}
            placeholder="e.g. My manager keeps making dismissive comments about my work in front of the team, even after I asked him to stop..."
            value={description}
            onChange={(e) => { setDescription(e.target.value); setMatches(null); }}
          />
          <div className="flex flex-wrap items-center gap-3 mt-3">
            <button
              disabled={description.trim().length < 10 || analyzing}
              onClick={analyze}
              className={`flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all ${description.trim().length >= 10 && !analyzing ? "bg-gradient-to-r from-teal-600 to-indigo-600 text-white shadow-sm hover:shadow-md" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
            >
              {analyzing ? (
                <>
                  <Sparkles size={14} className="animate-pulse" /> Analyzing your description…
                </>
              ) : (
                <>
                  <Sparkles size={14} /> Analyze with AI
                </>
              )}
            </button>
            <span className="text-xs text-slate-400">or</span>
            <button onClick={onManual} className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-800 border border-slate-300 px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
              <ClipboardList size={14} /> Choose the category myself
            </button>
          </div>
          {description.trim().length > 0 && description.trim().length < 10 && (
        <p className="text-xs text-slate-400 mt-2">A few more words will help Trust AI suggest the right team.</p>
      )}

      {matches !== null && (
        <div className="mt-6">
          {matches.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
              <p className="text-sm text-slate-600">No confident match found — that's alright. You can choose a category yourself, or send it straight to our intake team to route.</p>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-700 mb-3">This looks like it may belong to:</p>
              <div className="flex flex-col gap-2 mb-4">
                {matches.map((m, i) => (
                  <div key={m.category.id} className={`border rounded-2xl p-4 transition-all ${i === 0 ? `${m.category.color.ring} ${m.category.color.bg} shadow-sm` : "border-slate-200 bg-white"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${i === 0 ? "bg-white/70" : m.category.color.bg}`}>
                          <m.category.icon size={15} className={m.category.color.text} />
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{m.category.label}</span>
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${i === 0 ? `${m.category.color.fill} text-white` : "bg-slate-100 text-slate-600"}`}>{m.confidence}% match</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200/60 rounded-full overflow-hidden mb-3">
                      <div className={`h-full rounded-full ${m.category.color.fill}`} style={{ width: `${m.confidence}%` }} />
                    </div>
                    <button onClick={() => onSelect(m.category, description)} className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all ${i === 0 ? `${m.category.color.fill} text-white shadow-sm hover:shadow-md hover:brightness-95` : "border border-slate-300 text-slate-700 hover:bg-slate-50"}`}>
                      Select {m.category.label} & continue
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={onManual} className="text-sm text-slate-600 hover:text-teal-700 border border-slate-300 rounded-xl px-4 py-2 flex-1 text-center">
              Choose a category myself
            </button>
            <button onClick={() => onSelect(UNSURE_CATEGORY, description)} className="text-sm text-slate-600 hover:text-teal-700 border border-slate-300 rounded-xl px-4 py-2 flex-1 text-center">
              Send straight to intake team
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-start gap-2 bg-slate-100 border border-slate-200 rounded-xl p-3">
        <Lock size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-600">
          This description is only used to suggest a category. Nothing is submitted until you review and confirm on the next screen.
        </p>
      </div>
        </div>
      </div>
    </div>
  );
}

function CountrySelector({ country, setCountry, onChange }) {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {Object.entries(POLICY_DATA).map(([key, d]) => (
        <button
          key={key}
          onClick={() => { setCountry(key); if (onChange) onChange(); }}
          className={`text-sm font-medium px-4 py-2 rounded-xl border transition-all ${country === key ? "bg-slate-900 text-white border-slate-900 shadow-sm" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}
        >
          {d.label}
        </button>
      ))}
    </div>
  );
}

function ResourceHeader({ icon: Icon, title, desc, from, to, iconText, badge }) {
  return (
    <div className={`relative bg-gradient-to-br ${from} ${to} rounded-3xl p-6 sm:p-7 mb-6 overflow-hidden`}>
      <div className="pointer-events-none absolute inset-0 opacity-[0.1]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
      <div className="pointer-events-none absolute -top-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
      <div className="relative flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl bg-white/10 backdrop-blur border border-white/20 ${iconText} flex items-center justify-center flex-shrink-0 shadow-lg`}>
          <Icon size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">{title}</h1>
          <p className="text-sm text-slate-200 max-w-lg">{desc}</p>
        </div>
      </div>
      {badge && (
        <div className="absolute top-5 right-5 bg-white/95 backdrop-blur text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg hidden sm:flex items-center gap-1.5">
          {badge}
        </div>
      )}
    </div>
  );
}

function PolicyCorner({ onBack }) {
  const [country, setCountry] = useState("global");
  const [openIdx, setOpenIdx] = useState(null);
  const data = POLICY_DATA[country];
  const allPolicies = [...data.policies, ...COMMON_POLICIES];

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 mb-5">
        <ArrowLeft size={14} /> Back
      </button>

      <ResourceHeader
        icon={Globe} title="Policy corner"
        desc="Policies vary by country. Select where you're based to see what applies to you."
        from="from-slate-900" to="to-indigo-950" iconText="text-indigo-300"
        badge={<><Globe size={11} className="text-indigo-600" /> 6 regions</>}
      />

      <CountrySelector country={country} setCountry={setCountry} onChange={() => setOpenIdx(null)} />

      <h2 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">Policies — {data.label}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {allPolicies.map((p, i) => (
          <div key={p.title} className={`bg-white border rounded-2xl shadow-sm overflow-hidden transition-all ${openIdx === i ? "border-indigo-300 shadow-md sm:col-span-2" : "border-slate-200/70 hover:shadow-md hover:-translate-y-0.5"}`}>
            <button
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
              className="w-full flex items-start justify-between gap-3 p-5 text-left"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <FileText size={18} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-bold text-slate-900 mb-1">{p.title}</div>
                  <p className={`text-xs text-slate-500 leading-relaxed ${openIdx === i ? "" : "line-clamp-2"}`}>{p.desc}</p>
                  {openIdx === i && (
                    <p className="text-[11px] text-slate-400 mt-2 italic">Sample summary for this prototype — link to your intranet policy library in production.</p>
                  )}
                </div>
              </div>
              <ChevronDown size={16} className={`text-slate-400 flex-shrink-0 mt-1 transition-transform ${openIdx === i ? "rotate-180" : ""}`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReportingChannels({ onBack }) {
  const [country, setCountry] = useState("global");
  const data = POLICY_DATA[country];

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 mb-5">
        <ArrowLeft size={14} /> Back
      </button>

      <ResourceHeader
        icon={Phone} title="Other ways to report"
        desc="You don't have to use this app to raise a concern. These channels are staffed independently — including the option to stay anonymous."
        from="from-teal-700" to="to-teal-900" iconText="text-teal-200"
        badge={<><Lock size={11} className="text-teal-600" /> Anonymous option</>}
      />

      <CountrySelector country={country} setCountry={setCountry} />

      <h2 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">Reporting channels — {data.label}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
        <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm p-5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
            <Mail size={18} />
          </div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Email</div>
          <p className="text-sm font-medium text-slate-900 break-all">{data.channels.email}</p>
        </div>
        <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm p-5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3">
            <Phone size={18} />
          </div>
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Ethics hotline</div>
          <p className="text-sm font-medium text-slate-900">{data.channels.phone}</p>
          <p className="text-xs text-slate-400 mt-1">{data.channels.hours}</p>
        </div>
      </div>
      <div className="flex items-start gap-2 bg-slate-100 border border-slate-200 rounded-2xl p-3.5 mt-4 max-w-2xl">
        <Lock size={13} className="text-slate-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-600 leading-relaxed">
          These channels are independent of this app — you can report by phone or email without ever using Trust AI, and still stay anonymous by request.
        </p>
      </div>
    </div>
  );
}

function WellbeingResources({ onBack, onSupport }) {
  const [country, setCountry] = useState("global");
  const data = POLICY_DATA[country];

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 mb-5">
        <ArrowLeft size={14} /> Back
      </button>

      <ResourceHeader
        icon={Heart} title="Mental health & wellbeing"
        desc="These resources are separate from Trust AI and from your employer's reporting system. Reaching out is confidential."
        from="from-rose-600" to="to-rose-900" iconText="text-rose-100"
        badge={<><Heart size={11} className="text-rose-600" /> Confidential</>}
      />

      <CountrySelector country={country} setCountry={setCountry} />

      <h2 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wide">Support — {data.label}</h2>
      <div className="max-w-2xl flex flex-col gap-3">
        <div className="bg-gradient-to-r from-rose-50 to-indigo-50 border border-rose-100 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1.5">
            <Heart size={16} className="text-rose-500" />
            <span className="text-sm font-bold text-slate-900">{data.crisis.name}</span>
          </div>
          <p className="text-sm font-semibold text-slate-800">{data.crisis.phone}</p>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{data.crisis.note}</p>
        </div>
        <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1.5">
            <LifeBuoy size={15} className="text-slate-600" />
            <span className="text-sm font-semibold text-slate-800">Employee Assistance Program (EAP)</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Free, confidential counseling sessions, available whether or not you've raised a concern here — talking to the EAP is not the same as filing a report, and nothing is shared with your manager.
          </p>
        </div>
        <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm p-5">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles size={15} className="text-violet-500" />
            <span className="text-sm font-semibold text-slate-800">Everyday wellbeing</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Subsidized mindfulness and sleep app access, manager check-in guides, and flexible-work options for employees managing stress or burnout.
          </p>
        </div>
      </div>
      <button onClick={onSupport} className="mt-5 text-sm font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5">
        <Heart size={14} /> Open the support panel
      </button>
    </div>
  );
}

function CategoryPicker({ onSelect, onBack }) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -top-10 right-0 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl" />
      <button onClick={onBack} className="relative flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 mb-5">
        <ArrowLeft size={14} /> Back
      </button>

      <div className="relative bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-7 sm:p-8 mb-6 overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-[0.1]" style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
        <div className="relative flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-teal-300 flex items-center justify-center flex-shrink-0">
            <ClipboardList size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Raise a concern</h1>
            <p className="text-sm text-slate-300">Choose the category that best fits your concern. You can share your name or stay anonymous.</p>
          </div>
        </div>
      </div>

      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className={`group text-left bg-white border border-slate-200/70 rounded-2xl shadow-sm p-5 hover:shadow-xl hover:-translate-y-1 hover:${c.color.ring} transition-all duration-200`}
            >
              <div className={`w-10 h-10 rounded-xl ${c.color.bg} ${c.color.text} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                <Icon size={19} />
              </div>
              <div className="text-sm font-semibold text-slate-900 mb-1">{c.label}</div>
              <div className="text-xs text-slate-500 leading-relaxed">{c.desc}</div>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onSelect(UNSURE_CATEGORY)}
        className="w-full text-left mt-3 bg-white border border-dashed border-slate-300 rounded-2xl p-4 hover:border-teal-600 transition-colors flex items-center gap-3"
      >
        <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} />
        </div>
        <div>
          <div className="text-sm font-medium text-slate-900">Not sure which category?</div>
          <div className="text-xs text-slate-500">Describe your concern and Trust AI will help figure out where it goes</div>
        </div>
      </button>

      <div className="mt-6 flex items-start gap-2 bg-slate-100 border border-slate-200 rounded-xl p-3">
        <Lock size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-600">
          Anonymous submissions never store your name, employee ID, or any identifying details. You'll get a case ID to check status.
        </p>
      </div>
    </div>
  );
}

function StepHeader({ category, step }) {
  return (
    <div className="mb-7">
      <div className="flex items-center gap-1.5 mb-4">
        {STEP_TITLES.map((t, i) => (
          <div key={t} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= step ? category.color.fill : "bg-slate-200"}`} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl ${category.color.bg} ${category.color.text} flex items-center justify-center flex-shrink-0`}>
            <category.icon size={16} />
          </div>
          <div>
            <div className={`text-xs font-semibold mb-0.5 ${category.color.text}`}>{category.label}</div>
            <h2 className="text-lg font-semibold text-slate-900">{STEP_TITLES[step]}</h2>
          </div>
        </div>
        <div className="text-xs text-slate-400 font-medium">Step {step + 1} of {STEP_TITLES.length}</div>
      </div>
    </div>
  );
}

function Wizard({ category, step, setStep, form, update, toggleOutcome, addFile, removeFile, canContinue, onCancel, onSubmit, onSupport }) {
  const isLast = step === STEP_TITLES.length - 1;
  const questions = CATEGORY_QUESTIONS[category.id] || [];

  useEffect(() => {
    if (step === 5 && !form.draftSummary) {
      update("draftSummary", generateSummary(category, form, questions));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <div className="relative">
      <div className={`pointer-events-none absolute -top-10 -right-16 w-64 h-64 ${category.color.fill} opacity-[0.07] rounded-full blur-3xl`} />
      <div className={`pointer-events-none absolute -bottom-10 -left-16 w-64 h-64 ${category.color.fill} opacity-[0.06] rounded-full blur-3xl`} />
      <div className={`relative bg-gradient-to-b ${category.color.from} to-white border border-slate-200/70 rounded-2xl shadow-sm overflow-hidden`}>
        <div className={`h-1.5 ${category.color.fill}`} />
        <div className="p-6">
          <StepHeader category={category} step={step} />

          {step === 0 && (
        <div>
          <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-200 rounded-2xl p-3.5 mb-5">
            <Heart size={14} className="text-rose-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-600 leading-relaxed">
              Whatever you choose here, you're protected from retaliation for reporting in good faith.{" "}
              <button onClick={onSupport} className="font-semibold text-slate-700 hover:text-teal-700 underline underline-offset-2">Need support?</button>
            </p>
          </div>
          <Field label="How would you like to submit this?" required>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { v: "named", label: "Disclose my identity", d: "Your name is attached to the case", Icon: UserCheck },
                { v: "anonymous", label: "Stay anonymous", d: "No identifying info is stored", Icon: Lock },
              ].map((o) => (
                <button
                  key={o.v}
                  onClick={() => update("disclosureType", o.v)}
                  className={`text-left border rounded-2xl p-4 transition-colors ${form.disclosureType === o.v ? "border-teal-600 bg-teal-50" : "border-slate-200 hover:border-slate-300"}`}
                >
                  <o.Icon size={16} className={form.disclosureType === o.v ? "text-teal-700" : "text-slate-500"} />
                  <div className="text-sm font-medium text-slate-900 mt-2">{o.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{o.d}</div>
                </button>
              ))}
            </div>
          </Field>
          {form.disclosureType === "named" && (
            <>
              <Field label="Full name" required>
                <input className={inputCls} value={form.employeeName} onChange={(e) => update("employeeName", e.target.value)} />
              </Field>
              <Field label="Employee ID" required>
                <input className={inputCls} value={form.employeeId} onChange={(e) => update("employeeId", e.target.value)} />
              </Field>
            </>
          )}
          {form.disclosureType === "anonymous" && (
            <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <Lock size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-slate-600">Save your case ID at the end — it's the only way to check status anonymously.</p>
            </div>
          )}
        </div>
      )}

      {step === 1 && (
        <div>
          <Field label="Briefly describe what happened" required>
            <textarea rows={5} className={inputCls} value={form.summary} onChange={(e) => update("summary", e.target.value)} />
          </Field>
          <Field label="When did this occur?" help="Approximate date is fine">
            <input type="date" className={inputCls} value={form.occurredDate} onChange={(e) => update("occurredDate", e.target.value)} />
          </Field>
          <Field label="Is this an ongoing issue?" required>
            <div className="flex gap-2">
              {["Yes", "No"].map((o) => (
                <button key={o} onClick={() => update("isOngoing", o)} className={`px-4 py-1.5 rounded-xl text-sm border ${form.isOngoing === o ? "bg-teal-600 text-white border-teal-600" : "border-slate-300 text-slate-600"}`}>{o}</button>
              ))}
            </div>
          </Field>
          <Field label="Location" help="Department, building, system, or platform">
            <input className={inputCls} value={form.location} onChange={(e) => update("location", e.target.value)} />
          </Field>

        </div>
      )}

      {step === 2 && (
        <div>
          <div className={`text-[11px] font-bold uppercase tracking-wide mb-3 ${category.color.text}`}>Who was involved</div>
          <Field label="Who else was involved or affected?" help="Names optional if you're anonymous — roles are fine">
            <textarea rows={3} className={inputCls} value={form.othersInvolved} onChange={(e) => update("othersInvolved", e.target.value)} />
          </Field>
          <Field label="What is your relationship to the person(s) involved?" help="Helps the investigating team understand context">
            <select className={inputCls} value={form.relationshipToInvolved} onChange={(e) => update("relationshipToInvolved", e.target.value)}>
              <option value="">Select one</option>
              <option>My manager</option>
              <option>A peer or colleague</option>
              <option>My direct report</option>
              <option>Someone in another team</option>
              <option>An external party (vendor, client, contractor)</option>
              <option>Other</option>
              <option>Prefer not to say</option>
            </select>
          </Field>
          <Field label="Were there any witnesses?">
            <textarea rows={2} className={inputCls} value={form.witnesses} onChange={(e) => update("witnesses", e.target.value)} />
          </Field>

          <div className={`text-[11px] font-bold uppercase tracking-wide mb-3 mt-6 pt-5 border-t border-slate-100 ${category.color.text}`}>Prior reports & evidence</div>
          <Field label="Has this been reported to anyone else already?" required>
            <div className="flex gap-2 mb-2">
              {["Yes", "No"].map((o) => (
                <button key={o} onClick={() => update("priorReport", o)} className={`px-4 py-1.5 rounded-xl text-sm border transition-colors ${form.priorReport === o ? `${category.color.fill} text-white border-transparent` : "border-slate-300 text-slate-600"}`}>{o}</button>
              ))}
            </div>
            {form.priorReport === "Yes" && (
              <textarea rows={2} placeholder="What happened when you reported it?" className={inputCls} value={form.priorReportDetails} onChange={(e) => update("priorReportDetails", e.target.value)} />
            )}
          </Field>
          <Field label="Supporting documents" help="Emails, photos, or messages — mocked for this prototype">
            <div className="flex flex-wrap gap-2 mb-2">
              {form.attachments.map((a) => (
                <span key={a} className="flex items-center gap-1 bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-xl">
                  {a}<button onClick={() => removeFile(a)}><X size={12} /></button>
                </span>
              ))}
            </div>
            <button onClick={addFile} className="flex items-center gap-1.5 text-sm text-teal-700 border border-dashed border-teal-300 rounded-xl px-3 py-1.5 hover:bg-teal-50">
              <Upload size={14} /> Attach a file
            </button>
          </Field>
          <Field label="Reference numbers" help="Ticket numbers, transaction IDs, dates">
            <input className={inputCls} value={form.referenceNumbers} onChange={(e) => update("referenceNumbers", e.target.value)} />
          </Field>
        </div>
      )}

      {step === 3 && (
        <div>
          <div className={`flex items-start gap-2.5 ${category.color.bg} border border-slate-200/60 rounded-xl p-3.5 mb-5`}>
            <category.icon size={15} className={`${category.color.text} mt-0.5 flex-shrink-0`} />
            <p className="text-xs text-slate-600 leading-relaxed">
              These questions are specific to <span className={`font-semibold ${category.color.text}`}>{category.label}</span> concerns — they help {category.team} understand the situation faster.
            </p>
          </div>
          {category.id === "unsure" ? (
            <p className="text-sm text-slate-500">No additional details needed — our triage team will determine the right category from your description.</p>
          ) : questions.length === 0 ? (
            <p className="text-sm text-slate-500">No additional details needed for this category.</p>
          ) : (
            questions.map((q) => (
              <Field key={q.id} label={q.label} required={q.required} help={q.help}>
                {q.type === "select" && (
                  <select className={inputCls} value={form[q.id] || ""} onChange={(e) => update(q.id, e.target.value)}>
                    <option value="">Select one</option>
                    {q.options.map((o) => <option key={o}>{o}</option>)}
                  </select>
                )}
                {q.type === "text" && (
                  <input className={inputCls} value={form[q.id] || ""} onChange={(e) => update(q.id, e.target.value)} />
                )}
                {q.type === "yesno" && (
                  <div className="flex gap-2">
                    {["Yes", "No"].map((o) => (
                      <button
                        key={o}
                        onClick={() => update(q.id, o)}
                        className={`px-4 py-1.5 rounded-xl text-sm border transition-colors ${form[q.id] === o ? (q.id === "safetyRisk" && o === "Yes" ? "bg-red-600 text-white border-transparent" : `${category.color.fill} text-white border-transparent`) : "border-slate-300 text-slate-600"}`}
                      >
                        {o}
                      </button>
                    ))}
                  </div>
                )}
              </Field>
            ))
          )}
        </div>
      )}

      {step === 4 && (
        <div>
          <Field label="How would you rate the urgency?" required>
            <div className="grid grid-cols-2 gap-2">
              {["low", "medium", "high", "immediate"].map((u) => (
                <button key={u} onClick={() => update("urgency", u)} className={`px-3 py-1.5 rounded-xl text-sm border capitalize ${form.urgency === u ? "border-teal-600 " + URGENCY_STYLES[u] : "border-slate-300 text-slate-600"}`}>
                  {u === "immediate" ? "Immediate safety risk" : u}
                </button>
              ))}
            </div>
          </Field>
          <Field label="What impact has this had on you or others?">
            <textarea rows={3} className={inputCls} value={form.impactDescription} onChange={(e) => update("impactDescription", e.target.value)} />
          </Field>
          <Field label="What outcome are you hoping for?">
            <div className="flex flex-col gap-2">
              {["Investigation", "Mediation", "Policy change", "No specific action — just wanted this on record"].map((o) => (
                <label key={o} className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={form.desiredOutcome.includes(o)} onChange={() => toggleOutcome(o)} />
                  {o}
                </label>
              ))}
            </div>
          </Field>
          {form.disclosureType === "named" && (
            <Field label="Would you be open to a follow-up conversation?">
              <div className="flex gap-2">
                {["Yes", "No"].map((o) => (
                  <button key={o} onClick={() => update("followUpConsent", o)} className={`px-4 py-1.5 rounded-xl text-sm border ${form.followUpConsent === o ? "bg-teal-600 text-white border-teal-600" : "border-slate-300 text-slate-600"}`}>{o}</button>
                ))}
              </div>
            </Field>
          )}
        </div>
      )}

      {step === 5 && (
        <div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-indigo-500" />
                <span className="text-sm font-semibold text-slate-900">AI-drafted summary</span>
              </div>
              <button
                onClick={() => update("draftSummary", generateSummary(category, form, questions))}
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
              >
                <Sparkles size={11} /> Regenerate
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-2">Drafted from your answers — this is what the investigating team will see first. Edit anything that isn't quite right.</p>
            <textarea
              rows={7}
              className={inputCls}
              value={form.draftSummary}
              onChange={(e) => update("draftSummary", e.target.value)}
            />
          </div>

          <ReviewRow label="Category" value={category.label} />
          <ReviewRow label="Submitting as" value={form.disclosureType === "named" ? `${form.employeeName} (named)` : "Anonymous"} />
          <ReviewRow label="Ongoing" value={form.isOngoing || "—"} />
          <ReviewRow label="Relationship to those involved" value={form.relationshipToInvolved || "—"} />
          {questions.map((q) => form[q.id] ? <ReviewRow key={q.id} label={q.label} value={form[q.id]} /> : null)}
          <ReviewRow label="Urgency" value={form.urgency || "—"} />
          <ReviewRow label="Attachments" value={form.attachments.length ? form.attachments.join(", ") : "None"} />
          <ReviewRow label="Will route to" value={category.team} />
          <div className="mt-4 flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
            <Lock size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-600">
              {form.disclosureType === "anonymous"
                ? "This submission will not include your name or employee ID."
                : "Your name and employee ID will be visible to the investigating team."}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-200">
        <button
          onClick={() => (step === 0 ? onCancel() : setStep(step - 1))}
          className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800"
        >
          <ArrowLeft size={14} /> {step === 0 ? "Cancel" : "Back"}
        </button>
        {isLast ? (
          <button onClick={onSubmit} className="flex items-center gap-1.5 text-sm font-semibold bg-teal-600 text-white px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:bg-teal-700 transition-all">
            Submit concern <Check size={14} />
          </button>
        ) : (
          <button
            disabled={!canContinue}
            onClick={() => setStep(step + 1)}
            className={`flex items-center gap-1.5 text-sm font-semibold px-5 py-2.5 rounded-xl transition-all ${canContinue ? "bg-teal-600 text-white shadow-sm hover:shadow-md hover:bg-teal-700" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
          >
            Continue <ArrowRight size={14} />
          </button>
        )}
      </div>
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="py-2.5 border-b border-slate-100 last:border-0">
      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-sm text-slate-800 leading-relaxed">{value}</div>
    </div>
  );
}

function Confirmation({ caseId, category, disclosureType, onDone, onSupport }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -top-10 left-1/4 w-64 h-64 bg-teal-200/25 rounded-full blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 right-1/4 w-64 h-64 bg-indigo-200/25 rounded-full blur-3xl" />
      <div className="relative bg-white border border-slate-200/70 rounded-3xl shadow-sm p-8 sm:p-10 text-center">
        <SuccessGraphic />
        <h2 className="text-xl font-bold text-slate-900 mb-1">Thank you for speaking up</h2>
        <p className="text-sm text-slate-600 mb-5">
          Routed to <span className="font-medium text-slate-800">{category.team}</span>
        </p>
      <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-4 py-2 mb-5">
        <span className="font-mono text-sm text-slate-800">{caseId}</span>
        <button onClick={() => { navigator.clipboard.writeText(caseId); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="text-slate-500 hover:text-teal-700">
          <Copy size={14} />
        </button>
      </div>
      {copied && <p className="text-xs text-teal-700 -mt-3 mb-4">Copied</p>}
      <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
        {disclosureType === "anonymous"
          ? "Save this case ID — it's the only way to check your status, since no identifying information was stored."
          : "You'll be notified directly as your case is reviewed. You can also check status anytime with this case ID."}
      </p>
      <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3.5 mb-6 text-left flex items-start gap-2.5 max-w-sm mx-auto">
        <Heart size={14} className="text-rose-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-rose-800 leading-relaxed">
          Retaliation for reporting in good faith is against policy, regardless of outcome.{" "}
          <button onClick={onSupport} className="font-semibold underline underline-offset-2">Support resources are here if you need them.</button>
        </p>
      </div>
      <button onClick={onDone} className="text-sm text-teal-700 hover:text-teal-800 font-semibold">Back to home</button>
      </div>
    </div>
  );
}

function Track({ trackInput, setTrackInput, trackResult, onLookup, onBack }) {
  return (
    <div className="relative">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 mb-5">
        <ArrowLeft size={14} /> Back
      </button>
      <ResourceHeader
        icon={Search} title="Track a case"
        desc="Enter your case ID below. No login required, even for anonymous reports."
        from="from-teal-700" to="to-teal-900" iconText="text-teal-200"
        badge={<><Lock size={11} className="text-teal-600" /> No login</>}
      />
      <div className="relative bg-white border border-slate-200/70 rounded-3xl shadow-sm p-6 sm:p-8">
        <div className="flex gap-2 mb-5">
          <input
            className={inputCls}
            placeholder="CNC-2026-000123"
            value={trackInput}
            onChange={(e) => setTrackInput(e.target.value)}
          />
          <button onClick={onLookup} className="bg-teal-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md hover:bg-teal-700 transition-all flex-shrink-0">Look up</button>
        </div>

        {trackResult === null && (
          <p className="text-sm text-slate-500">No case found for that ID in this session. In production this would query the case database.</p>
        )}
        {trackResult && (
          <div className={`border rounded-2xl p-5 ${STATUS_STYLES[trackResult.status] ? "border-teal-200 bg-teal-50/40" : "border-slate-200"}`}>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono text-sm font-semibold text-slate-800">{trackResult.id}</span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${URGENCY_STYLES[trackResult.urgency] || "bg-slate-100 text-slate-700"}`}>{trackResult.urgency}</span>
            </div>
            <div className="flex items-center gap-1.5 mb-4">
              {STATUS_FLOW.map((s, i) => {
                const idx = STATUS_FLOW.indexOf(trackResult.status);
                return <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= idx ? "bg-teal-500" : "bg-slate-200"}`} />;
              })}
            </div>
            <ReviewRow label="Status" value={trackResult.status} />
            <ReviewRow label="Team" value={trackResult.team} />
            <ReviewRow label="Submitted" value={trackResult.submittedAt} />
          </div>
        )}
      </div>
    </div>
  );
}

function HrLogin({ onLogin, onBack }) {
  const [name, setName] = useState("");
  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 mb-6">
        <ArrowLeft size={14} /> Back
      </button>
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-lg border border-slate-200/70">
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950 p-10 flex flex-col justify-center overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "22px 22px" }}
          />
          <div className="pointer-events-none absolute -bottom-10 -right-10 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-teal-300 flex items-center justify-center mb-5">
              <BarChart3 size={22} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">HR Leadership</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Aggregate trends across every team — volume, status, and investigation outcomes. No individual case
              details or reporter identities are ever shown here, named or anonymous.
            </p>
          </div>
        </div>
        <div className="bg-white p-8 sm:p-10 flex flex-col justify-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Simulated SSO</p>
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Sign in to continue</h3>

          <Field label="Your name" required>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Morgan Reyes" />
          </Field>

          <button
            disabled={!name}
            onClick={() => onLogin(name)}
            className={`w-full mt-2 text-sm font-semibold px-4 py-3 rounded-xl transition-all ${name ? "bg-teal-600 text-white shadow-sm hover:shadow-md hover:bg-teal-700" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
          >
            View analytics
          </button>
          <p className="text-[11px] text-slate-400 mt-4 text-center">Prototype only — a real deployment would restrict this to a leadership role via SSO.</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, bg, text }) {
  return (
    <div className="group relative bg-white border border-slate-200/70 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all p-5 overflow-hidden">
      <div className={`pointer-events-none absolute -top-6 -right-6 w-20 h-20 ${bg} rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity`} />
      {Icon && (
        <div className={`relative w-10 h-10 rounded-xl ${bg} ${text} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
          <Icon size={18} />
        </div>
      )}
      <div className="relative text-3xl font-extrabold bg-gradient-to-br from-teal-600 to-indigo-600 bg-clip-text text-transparent">{value}</div>
      <div className="relative text-xs text-slate-500 mt-0.5 font-medium">{label}</div>
      {sub && <div className="relative text-[11px] text-slate-400 mt-1">{sub}</div>}
    </div>
  );
}

function BarRow({ label, count, total, colorClass = "bg-teal-600" }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="mb-3.5 last:mb-0">
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="text-slate-700 font-medium">{label}</span>
        <span className="text-slate-500 font-semibold">{count}</span>
      </div>
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${colorClass} rounded-full shadow-sm transition-all duration-700 ease-out relative overflow-hidden`} style={{ width: `${pct}%` }}>
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/25 to-white/0" />
        </div>
      </div>
    </div>
  );
}

function Analytics({ cases }) {
  const total = cases.length;
  const openCount = cases.filter((c) => c.status !== "Resolved" && c.status !== "Closed").length;
  const closedCount = total - openCount;
  const anonymousCount = cases.filter((c) => c.disclosureType === "anonymous").length;
  const anonymousPct = total > 0 ? Math.round((anonymousCount / total) * 100) : 0;

  const categoryCounts = [...CATEGORIES, UNSURE_CATEGORY].map((c) => ({
    label: c.label,
    count: cases.filter((k) => k.category === c.id).length,
    colorClass: c.color.fill,
  })).filter((c) => c.count > 0).sort((a, b) => b.count - a.count);

  const statusCounts = STATUS_FLOW.map((s) => ({ label: s, count: cases.filter((c) => c.status === s).length }));
  const urgencyOrder = ["immediate", "high", "medium", "low"];
  const urgencyCounts = urgencyOrder.map((u) => ({ label: u, count: cases.filter((c) => c.urgency === u).length, colorClass: u === "immediate" ? "bg-red-500" : u === "high" ? "bg-orange-500" : u === "medium" ? "bg-amber-500" : "bg-slate-400" }));

  const withOutcome = cases.filter((c) => c.investigation && c.investigation.outcome);
  const outcomeOptions = ["Substantiated", "Partially substantiated", "Unsubstantiated", "Inconclusive"];
  const outcomeCounts = outcomeOptions.map((o) => ({ label: o, count: withOutcome.filter((c) => c.investigation.outcome === o).length }));

  return (
    <div>
      <ResourceHeader
        icon={BarChart3} title="Analytics"
        desc={`Aggregate trends across all teams — ${total} case${total !== 1 ? "s" : ""} tracked this session.`}
        from="from-slate-900" to="to-teal-950" iconText="text-teal-300"
        badge={<><Lock size={11} className="text-teal-600" /> No case details</>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total cases" value={total} icon={FileText} bg="bg-slate-100" text="text-slate-600" />
        <StatCard label="Open" value={openCount} icon={Clock} bg="bg-amber-50" text="text-amber-600" />
        <StatCard label="Resolved / Closed" value={closedCount} icon={Check} bg="bg-teal-50" text="text-teal-600" />
        <StatCard label="Anonymous" value={`${anonymousPct}%`} sub={`${anonymousCount} of ${total}`} icon={Lock} bg="bg-indigo-50" text="text-indigo-600" />
      </div>

      <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm p-5 mb-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Cases by category</h3>
        {categoryCounts.length === 0 ? (
          <p className="text-sm text-slate-400">No cases yet.</p>
        ) : (
          categoryCounts.map((c) => <BarRow key={c.label} label={c.label} count={c.count} total={total} colorClass={c.colorClass} />)
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Cases by status</h3>
          {statusCounts.map((s) => <BarRow key={s.label} label={s.label} count={s.count} total={total} colorClass="bg-slate-600" />)}
        </div>
        <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Cases by urgency</h3>
          {urgencyCounts.map((u) => <BarRow key={u.label} label={u.label} count={u.count} total={total} colorClass={u.colorClass} />)}
        </div>
      </div>

      <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm p-5 mb-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">Investigation outcomes</h3>
        <p className="text-xs text-slate-500 mb-3">Based on {withOutcome.length} of {total} cases with a recorded outcome.</p>
        {withOutcome.length === 0 ? (
          <p className="text-sm text-slate-400">No investigations recorded yet.</p>
        ) : (
          outcomeCounts.map((o) => <BarRow key={o.label} label={o.label} count={o.count} total={withOutcome.length} colorClass="bg-teal-600" />)
        )}
      </div>

      <div className="flex items-start gap-2 bg-slate-100 border border-slate-200 rounded-xl p-3">
        <Lock size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-600">
          This view shows counts only — no case summaries, names, or reporter identities are ever surfaced here, anonymous or named.
        </p>
      </div>
    </div>
  );
}

function InvestigatorLogin({ onLogin, onBack }) {
  const [team, setTeam] = useState("");
  const [name, setName] = useState("");
  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 mb-6">
        <ArrowLeft size={14} /> Back
      </button>
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 rounded-3xl overflow-hidden shadow-lg border border-slate-200/70">
        <div className="relative bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-10 flex flex-col justify-center overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)", backgroundSize: "22px 22px" }}
          />
          <div className="pointer-events-none absolute -bottom-10 -right-10 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl" />
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-teal-300 flex items-center justify-center mb-5">
              <ClipboardList size={22} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Investigator Portal</h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Review cases routed to your team, log structured investigations, and track resolution — scoped so you only
              ever see what belongs to your category.
            </p>
          </div>
        </div>
        <div className="bg-white p-8 sm:p-10 flex flex-col justify-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Simulated SSO</p>
          <h3 className="text-lg font-semibold text-slate-900 mb-6">Sign in to continue</h3>

          <Field label="Your name" required>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Priya Sharma" />
          </Field>
          <Field label="Your team" required>
            <select className={inputCls} value={team} onChange={(e) => setTeam(e.target.value)}>
              <option value="">Select your team</option>
              {TEAMS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Field>

          <button
            disabled={!team || !name}
            onClick={() => onLogin(team, name)}
            className={`w-full mt-2 text-sm font-semibold px-4 py-3 rounded-xl transition-all ${team && name ? "bg-teal-600 text-white shadow-sm hover:shadow-md hover:bg-teal-700" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
          >
            Sign in
          </button>
          <p className="text-[11px] text-slate-400 mt-4 text-center">Prototype only — a real deployment would use company SSO with role-based scoping.</p>
        </div>
      </div>
    </div>
  );
}
function InvestigatorDashboard({ cases, onOpen, onReset }) {
  const sorted = [...cases].sort((a, b) => (URGENCY_RANK[a.urgency] ?? 9) - (URGENCY_RANK[b.urgency] ?? 9));
  const openCount = cases.filter((c) => c.status !== "Closed" && c.status !== "Resolved").length;
  const urgentCount = cases.filter((c) => c.urgency === "immediate" || c.urgency === "high").length;
  const resolvedCount = cases.length - openCount;

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Case queue</h1>
          <p className="text-sm text-slate-600">Cases routed to your team, sorted by urgency</p>
        </div>
        <button onClick={onReset} className="text-xs text-slate-400 hover:text-slate-600 mt-1">Reset demo data</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total cases" value={cases.length} icon={FileText} bg="bg-slate-100" text="text-slate-600" />
        <StatCard label="Open" value={openCount} icon={Clock} bg="bg-amber-50" text="text-amber-600" />
        <StatCard label="High/Immediate" value={urgentCount} icon={AlertTriangle} bg="bg-red-50" text="text-red-600" />
        <StatCard label="Resolved/Closed" value={resolvedCount} icon={Check} bg="bg-teal-50" text="text-teal-600" />
      </div>

      {sorted.length === 0 && (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center text-sm text-slate-500">
          No cases yet for this team in this session. Submit a concern from the employee side matching this team to see it appear here.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {sorted.map((c) => {
          const cat = [...CATEGORIES, UNSURE_CATEGORY].find((x) => x.id === c.category) || UNSURE_CATEGORY;
          return (
            <button key={c.id} onClick={() => onOpen(c.id)} className="text-left bg-white border border-slate-200/70 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex items-stretch gap-0 overflow-hidden">
              <div className={`w-1.5 flex-shrink-0 ${cat.color.fill}`} />
              <div className="flex items-center justify-between gap-3 p-4 flex-1 min-w-0">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl ${cat.color.bg} ${cat.color.text} flex items-center justify-center flex-shrink-0`}>
                    <cat.icon size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-xs text-slate-500">{c.id}</span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${URGENCY_STYLES[c.urgency] || "bg-slate-100 text-slate-700"}`}>{c.urgency}</span>
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[c.status] || "bg-slate-100 text-slate-700"}`}>{c.status}</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900">{c.categoryLabel}</div>
                    <div className="text-xs text-slate-500 truncate max-w-xs">{c.summary}</div>
                  </div>
                </div>
                <ChevronRight size={16} className="text-slate-400 flex-shrink-0" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DetailSection({ title, icon: Icon, children, bg = "bg-teal-50", text = "text-teal-700" }) {
  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl shadow-sm p-5 mb-4">
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`w-8 h-8 rounded-lg ${bg} ${text} flex items-center justify-center flex-shrink-0`}>
          <Icon size={15} />
        </div>
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InvestigatorCaseDetail({ c, onBack, onStatusChange, onSaveInvestigation, investigatorName }) {
  const [inv, setInv] = useState(c.investigation || emptyInvestigation());
  const [saved, setSaved] = useState(false);
  const cat = [...CATEGORIES, UNSURE_CATEGORY].find((x) => x.id === c.category) || UNSURE_CATEGORY;

  function updateInv(field, value) {
    setInv((f) => ({ ...f, [field]: value }));
    setSaved(false);
  }
  function handleSave() {
    onSaveInvestigation(inv);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 mb-5">
        <ArrowLeft size={14} /> Back to queue
      </button>

      <div className={`bg-gradient-to-br ${cat.color.from} to-white border border-slate-200/70 rounded-3xl p-6 sm:p-7 mb-6`}>
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl ${cat.color.fill} text-white flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <cat.icon size={26} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-mono text-xs text-slate-500">{c.id}</span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${URGENCY_STYLES[c.urgency] || "bg-slate-100 text-slate-700"}`}>{c.urgency}</span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[c.status] || "bg-slate-100 text-slate-700"}`}>{c.status}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{c.categoryLabel}</h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Reported by {c.disclosureType === "named" ? `${c.employeeName} (${c.employeeId})` : "Anonymous"} · Submitted {c.submittedAt}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: narrative content */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <DetailSection title="What happened" icon={FileText} bg="bg-indigo-50" text="text-indigo-600">
            {c.draftSummary && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-3">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles size={12} className="text-indigo-500" />
                  <span className="text-xs font-semibold text-indigo-900">AI-drafted summary (reviewed by reporter)</span>
                </div>
                <p className="text-[15px] text-slate-700 leading-relaxed whitespace-pre-wrap">{c.draftSummary}</p>
              </div>
            )}
            <ReviewRow label="Raw description" value={c.summary || "—"} />
            <div className="grid grid-cols-2 gap-x-4">
              <ReviewRow label="Occurred" value={c.occurredDate || "—"} />
              <ReviewRow label="Ongoing" value={c.isOngoing || "—"} />
            </div>
            <ReviewRow label="Location" value={c.location || "—"} />
          </DetailSection>

          <DetailSection title="People & evidence" icon={Users} bg="bg-violet-50" text="text-violet-600">
            <ReviewRow label="Others involved" value={c.othersInvolved || "—"} />
            <ReviewRow label="Relationship to those involved" value={c.relationshipToInvolved || "—"} />
            <ReviewRow label="Witnesses" value={c.witnesses || "—"} />
            <div className="grid grid-cols-2 gap-x-4">
              <ReviewRow label="Prior report" value={c.priorReport || "—"} />
              <ReviewRow label="Attachments" value={c.attachments?.length ? c.attachments.join(", ") : "None"} />
            </div>
          </DetailSection>

          {Object.keys(c.categoryAnswers || {}).length > 0 && (
            <DetailSection title="Category-specific details" icon={ClipboardCheck} bg={cat.color.bg} text={cat.color.text}>
              {Object.values(c.categoryAnswers).map((a, i) => (
                <ReviewRow key={i} label={a.label} value={a.value} />
              ))}
            </DetailSection>
          )}

          <DetailSection title="Impact & desired outcome" icon={AlertTriangle} bg="bg-amber-50" text="text-amber-600">
            <ReviewRow label="Impact" value={c.impactDescription || "—"} />
            <ReviewRow label="Desired outcome" value={c.desiredOutcome?.length ? c.desiredOutcome.join(", ") : "—"} />
          </DetailSection>
        </div>

        {/* Right: status + actions, sticky */}
        <div className="lg:sticky lg:top-24 lg:self-start flex flex-col gap-4">
          <DetailSection title="Status" icon={ClipboardList} bg="bg-slate-100" text="text-slate-600">
            <div className="flex flex-wrap gap-2">
              {STATUS_FLOW.map((s) => (
                <button key={s} onClick={() => onStatusChange(s)} className={`px-3 py-1.5 rounded-xl text-xs font-medium border ${c.status === s ? "bg-teal-600 text-white border-teal-600" : "border-slate-300 text-slate-600 hover:bg-slate-50"}`}>
                  {s}
                </button>
              ))}
            </div>
            {(c.status === "Resolved" || c.status === "Closed") && (
              <div className="mt-3 flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
                <Lock size={13} className="text-slate-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-slate-600">
                  {c.disclosureType === "named"
                    ? `Notification would be sent directly to ${c.employeeName}.`
                    : "No direct notification — the reporter must check status via their case ID."}
                </p>
              </div>
            )}
          </DetailSection>

          <DetailSection title="Investigation" icon={ClipboardList} bg="bg-teal-50" text="text-teal-600">
            <Field label="Investigation start date">
              <input type="date" className={inputCls} value={inv.startDate} onChange={(e) => updateInv("startDate", e.target.value)} />
            </Field>
            <Field label="Actions taken" help="Interviews conducted, documents reviewed, systems checked">
              <textarea rows={2} className={inputCls} value={inv.actionsTaken} onChange={(e) => updateInv("actionsTaken", e.target.value)} />
            </Field>
            <Field label="Findings summary">
              <textarea rows={2} className={inputCls} value={inv.findings} onChange={(e) => updateInv("findings", e.target.value)} />
            </Field>
            <Field label="Outcome classification">
              <select className={inputCls} value={inv.outcome} onChange={(e) => updateInv("outcome", e.target.value)}>
                <option value="">Select one</option>
                <option>Substantiated</option><option>Partially substantiated</option><option>Unsubstantiated</option><option>Inconclusive</option>
              </select>
            </Field>
            <Field label="Corrective action" help="If any">
              <textarea rows={2} className={inputCls} value={inv.correctiveAction} onChange={(e) => updateInv("correctiveAction", e.target.value)} />
            </Field>
            <Field label="Closure notes">
              <textarea rows={2} className={inputCls} value={inv.closureNotes} onChange={(e) => updateInv("closureNotes", e.target.value)} />
            </Field>
            <Field label="Internal-only comments" help="Never visible to the reporter">
              <textarea rows={2} className={inputCls} value={inv.internalComments} onChange={(e) => updateInv("internalComments", e.target.value)} />
            </Field>
            <div className="flex items-center gap-3 mt-2">
              <button onClick={handleSave} className="bg-teal-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md hover:bg-teal-700 transition-all">
                Save investigation
              </button>
              {saved && <span className="text-xs text-teal-700">Saved</span>}
            </div>
          </DetailSection>

          <DetailSection title="Audit trail" icon={Clock} bg="bg-slate-100" text="text-slate-600">
            <div className="flex flex-col gap-2">
              {c.auditLog.map((entry, i) => (
                <div key={i} className="flex items-start justify-between text-xs border-b border-slate-100 pb-2 last:border-0">
                  <div>
                    <div className="text-slate-800">{entry.action}</div>
                    <div className="text-slate-400">{entry.actor}</div>
                  </div>
                  <div className="text-slate-400 flex-shrink-0 ml-3">{entry.timestamp}</div>
                </div>
              ))}
            </div>
          </DetailSection>
        </div>
      </div>
    </div>
  );
}
