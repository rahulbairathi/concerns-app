import { useState } from "react";
import {
  Users, Building2, Home, ShieldCheck, AlertTriangle, Scale, ClipboardCheck,
  Lock, ArrowLeft, ArrowRight, Check, Search, Upload, X, Copy, UserCheck, Sparkles,
  LogOut, ClipboardList, Clock, ChevronRight, FileText, BarChart3,
} from "lucide-react";

const CATEGORIES = [
  { id: "employee_relations", label: "Employee relations", desc: "Harassment, discrimination, retaliation, workplace conflict", icon: Users, team: "HR – Employee Relations" },
  { id: "facilities", label: "Facilities", desc: "Building conditions, maintenance, workplace safety", icon: Building2, team: "Facilities Management" },
  { id: "real_estate", label: "Real estate", desc: "Leases, space planning, site issues", icon: Home, team: "Real Estate / Corporate Services" },
  { id: "compliance", label: "Compliance", desc: "Regulatory or legal policy violations", icon: ShieldCheck, team: "Compliance" },
  { id: "financial_fraud", label: "Financial fraud", desc: "Embezzlement, falsified records, theft", icon: AlertTriangle, team: "Internal Audit / Finance Investigations" },
  { id: "ethics", label: "Ethics", desc: "Conflicts of interest, bribery, pressure to act against judgment", icon: Scale, team: "Ethics & Compliance Officer" },
  { id: "code_of_conduct", label: "Code of conduct", desc: "Specific documented policy violations", icon: ClipboardCheck, team: "Compliance" },
];

const UNSURE_CATEGORY = { id: "unsure", label: "Not sure which category?", desc: "Describe your concern and Trust AI will help route it.", icon: Search, team: "Intake & Triage Team" };

const TEAMS = [...new Set(CATEGORIES.map((c) => c.team))];

const CATEGORY_QUESTIONS = {
  employee_relations: [
    { id: "erConcernType", label: "What type of concern is this?", type: "select", required: true, options: ["Harassment", "Discrimination", "Retaliation", "Workplace conflict"] },
    { id: "relationshipToInvolved", label: "What is your relationship to the person involved?", type: "select", options: ["My manager", "A peer", "My direct report", "Someone in another team", "Other"] },
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
  employee_relations: ["harass", "discriminat", "retaliat", "bully", "hostile", "manager", "coworker", "colleague", "yell", "intimidat", "excluded", "unfair treatment"],
  financial_fraud: ["fraud", "embezzl", "steal", "theft", "falsif", "invoice", "kickback", "money", "payment", "vendor payment", "expense fraud"],
  ethics: ["bribe", "bribery", "gift", "conflict of interest", "insider", "kickback", "unethical", "favoritism", "personal gain"],
  facilities: ["broken", "leak", "air condition", "hvac", "maintenance", "elevator", "clean", "building", "unsafe", "temperature", "noise", "pest"],
  real_estate: ["lease", "office space", "floor plan", "relocat", "site condition", "landlord", "square footage", "renovation"],
  compliance: ["regulation", "gdpr", "privacy law", "legal violation", "compliance", "data protection", "audit finding", "regulatory"],
  code_of_conduct: ["dress code", "attendance", "expense report", "policy violation", "late", "absent", "misuse of company property", "social media policy"],
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
    othersInvolved: "", witnesses: "", priorReport: "", priorReportDetails: "",
    attachments: [], referenceNumbers: "",
    urgency: "", impactDescription: "", desiredOutcome: [], followUpConsent: "",
  };
}

function emptyInvestigation() {
  return { startDate: "", actionsTaken: "", findings: "", outcome: "", correctiveAction: "", closureNotes: "", internalComments: "" };
}

function Field({ label, required, help, children }) {
  return (
    <div className="mb-5">
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {help && <p className="text-xs text-slate-500 mb-2">{help}</p>}
      {children}
    </div>
  );
}

const inputCls = "w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-teal-600";

function Logo() {
  return (
    <div className="rounded-lg bg-teal-600 text-white flex items-center justify-center flex-shrink-0" style={{ width: 32, height: 32 }}>
      <ShieldCheck size={18} />
    </div>
  );
}

function TopBar({ onHome, onTrack, showTrack }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <button onClick={onHome} className="flex items-center gap-2.5">
        <Logo />
        <div className="text-left">
          <div className="font-semibold text-slate-900 text-base leading-tight">Trust AI</div>
          <div className="text-[11px] text-slate-500 leading-tight">Confidential concern reporting</div>
        </div>
      </button>
      {showTrack && (
        <button onClick={onTrack} className="text-sm text-teal-700 hover:text-teal-800 flex items-center gap-1">
          <Search size={14} /> Track a case
        </button>
      )}
    </div>
  );
}

function InvestigatorTopBar({ team, name, onLogout, onDashboard }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <button onClick={onDashboard} className="flex items-center gap-2.5">
        <Logo />
        <div className="text-left">
          <div className="font-semibold text-slate-900 text-base leading-tight">Trust AI <span className="text-slate-400 font-normal">— Investigator Portal</span></div>
          <div className="text-[11px] text-slate-500 leading-tight">{team}</div>
        </div>
      </button>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600 hidden sm:inline">{name}</span>
        <button onClick={onLogout} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800">
          <LogOut size={14} /> Log out
        </button>
      </div>
    </div>
  );
}

function HrTopBar({ name, onLogout }) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-2.5">
        <Logo />
        <div className="text-left">
          <div className="font-semibold text-slate-900 text-base leading-tight">Trust AI <span className="text-slate-400 font-normal">— HR Leadership</span></div>
          <div className="text-[11px] text-slate-500 leading-tight">Aggregate analytics — no case-level detail</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-600 hidden sm:inline">{name}</span>
        <button onClick={onLogout} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800">
          <LogOut size={14} /> Log out
        </button>
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
      summary: form.summary, occurredDate: form.occurredDate, isOngoing: form.isOngoing, location: form.location,
      othersInvolved: form.othersInvolved, witnesses: form.witnesses,
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

  return (
    <div className="w-full min-h-[560px] bg-slate-50 text-slate-800">
      <div className="max-w-2xl mx-auto px-5 py-8">
        {!isInvestigatorView && !isHrView && (
          <TopBar onHome={goHome} onTrack={goTrack} showTrack={view !== "landing"} />
        )}
        {isInvestigatorView && view !== "invLogin" && (
          <InvestigatorTopBar team={invTeam} name={invName} onLogout={investigatorLogout} onDashboard={() => setView("invDashboard")} />
        )}
        {isHrView && view !== "hrLogin" && (
          <HrTopBar name={hrName} onLogout={hrLogout} />
        )}

        {view === "landing" && (
          <Landing onStart={() => setView("describe")} onTrack={goTrack} onInvestigator={() => setView("invLogin")} onHrLeadership={() => setView("hrLogin")} />
        )}

        {view === "describe" && (
          <DescribeConcern onSelect={startCategory} onManual={() => setView("categories")} onBack={goHome} />
        )}

        {view === "categories" && (
          <CategoryPicker onSelect={(cat) => startCategory(cat)} onBack={() => setView("describe")} />
        )}

        {view === "wizard" && category && (
          <Wizard
            category={category} step={step} setStep={setStep} form={form} update={update}
            toggleOutcome={toggleOutcome} addFile={addFile} removeFile={removeFile}
            canContinue={canContinue()} onCancel={() => setView("categories")} onSubmit={submitCase}
          />
        )}

        {view === "confirmation" && (
          <Confirmation caseId={caseId} category={category} disclosureType={form.disclosureType} onDone={goHome} />
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

function Landing({ onStart, onTrack, onInvestigator, onHrLeadership }) {
  const features = [
    { icon: Lock, title: "Anonymous by design", desc: "Disclose your identity or stay fully anonymous — the choice is always yours, and anonymous cases never store identifying data." },
    { icon: Sparkles, title: "AI-assisted routing", desc: "Not sure where a concern belongs? Describe it in your own words and Trust AI suggests the right category." },
    { icon: ShieldCheck, title: "Seven dedicated channels", desc: "Employee relations, facilities, real estate, compliance, financial fraud, ethics, and code of conduct." },
    { icon: Search, title: "Full visibility", desc: "Track any case status anytime with just a case ID — no login required, even for anonymous reports." },
  ];

  return (
    <div>
      <div className="text-center py-6 mb-8">
        <div className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 text-xs font-medium px-3 py-1 rounded-full mb-4">
          <Sparkles size={12} /> AI-assisted intake & routing
        </div>
        <h1 className="text-3xl font-semibold text-slate-900 mb-3 tracking-tight">Speak up, safely.</h1>
        <p className="text-sm text-slate-600 max-w-md mx-auto mb-8 leading-relaxed">
          Trust AI gives every employee a single, confidential channel to raise concerns — from workplace conflicts
          to compliance and fraud — with AI-assisted routing to the right team.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={onStart} className="flex items-center gap-1.5 bg-teal-600 text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-teal-700">
            Report a concern <ArrowRight size={15} />
          </button>
          <button onClick={onTrack} className="text-sm font-medium text-slate-700 border border-slate-300 px-5 py-2.5 rounded-md hover:bg-slate-100">
            Track a case
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {features.map((f) => (
          <div key={f.title} className="bg-white border border-slate-200 rounded-lg p-4">
            <div className="w-9 h-9 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
              <f.icon size={18} />
            </div>
            <div className="text-sm font-medium text-slate-900 mb-1">{f.title}</div>
            <div className="text-xs text-slate-500 leading-relaxed">{f.desc}</div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-4 text-xs text-slate-400 mb-4">
        <span>7 categories</span>
        <span className="w-1 h-1 rounded-full bg-slate-300" />
        <span>100% anonymous option</span>
        <span className="w-1 h-1 rounded-full bg-slate-300" />
        <span>AI-assisted triage</span>
      </div>

      <div className="text-center border-t border-slate-200 pt-5">
        <button onClick={onInvestigator} className="text-sm text-slate-600 hover:text-teal-700 flex items-center gap-1.5 mx-auto mb-2">
          <ClipboardList size={14} /> Are you on an investigation team? Investigator sign-in
        </button>
        <button onClick={onHrLeadership} className="text-sm text-slate-600 hover:text-teal-700 flex items-center gap-1.5 mx-auto">
          <BarChart3 size={14} /> HR leadership — view aggregate analytics
        </button>
      </div>
      <p className="text-center text-[11px] text-slate-400 mt-4">Prototype build — proof of concept for internal review</p>
    </div>
  );
}

function DescribeConcern({ onSelect, onManual, onBack }) {
  const [description, setDescription] = useState("");
  const [matches, setMatches] = useState(null);

  function analyze() {
    setMatches(analyzeConcern(description));
  }

  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 mb-5">
        <ArrowLeft size={14} /> Back
      </button>
      <div className="inline-flex items-center gap-1.5 bg-teal-50 text-teal-700 text-xs font-medium px-3 py-1 rounded-full mb-4">
        <Sparkles size={12} /> AI-assisted routing
      </div>
      <h1 className="text-xl font-medium text-slate-900 mb-1">What would you like to report?</h1>
      <p className="text-sm text-slate-600 mb-5">Describe what happened in your own words. Trust AI will suggest which team it likely belongs to — you'll always confirm before it's submitted.</p>

      <textarea
        rows={5}
        className={inputCls}
        placeholder="e.g. My manager keeps making dismissive comments about my work in front of the team, even after I asked him to stop..."
        value={description}
        onChange={(e) => { setDescription(e.target.value); setMatches(null); }}
      />
      <button
        disabled={description.trim().length < 10}
        onClick={analyze}
        className={`mt-3 flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-md ${description.trim().length >= 10 ? "bg-teal-600 text-white hover:bg-teal-700" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
      >
        <Sparkles size={14} /> Analyze with AI
      </button>
      {description.trim().length > 0 && description.trim().length < 10 && (
        <p className="text-xs text-slate-400 mt-2">A few more words will help Trust AI suggest the right team.</p>
      )}

      {matches !== null && (
        <div className="mt-6">
          {matches.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-md p-4 mb-4">
              <p className="text-sm text-slate-600">No confident match found — that's alright. You can choose a category yourself, or send it straight to our intake team to route.</p>
            </div>
          ) : (
            <>
              <p className="text-sm font-medium text-slate-700 mb-3">This looks like it may belong to:</p>
              <div className="flex flex-col gap-2 mb-4">
                {matches.map((m, i) => (
                  <div key={m.category.id} className={`border rounded-lg p-4 ${i === 0 ? "border-teal-600 bg-teal-50" : "border-slate-200 bg-white"}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <m.category.icon size={16} className={i === 0 ? "text-teal-700" : "text-slate-500"} />
                        <span className="text-sm font-medium text-slate-900">{m.category.label}</span>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${i === 0 ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-600"}`}>{m.confidence}% match</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                      <div className={`h-full rounded-full ${i === 0 ? "bg-teal-600" : "bg-slate-400"}`} style={{ width: `${m.confidence}%` }} />
                    </div>
                    <button onClick={() => onSelect(m.category, description)} className={`text-sm font-medium px-4 py-1.5 rounded-md ${i === 0 ? "bg-teal-600 text-white hover:bg-teal-700" : "border border-slate-300 text-slate-700 hover:bg-slate-50"}`}>
                      Select {m.category.label} & continue
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="flex flex-col sm:flex-row gap-2">
            <button onClick={onManual} className="text-sm text-slate-600 hover:text-teal-700 border border-slate-300 rounded-md px-4 py-2 flex-1 text-center">
              Choose a category myself
            </button>
            <button onClick={() => onSelect(UNSURE_CATEGORY, description)} className="text-sm text-slate-600 hover:text-teal-700 border border-slate-300 rounded-md px-4 py-2 flex-1 text-center">
              Send straight to intake team
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 flex items-start gap-2 bg-slate-100 border border-slate-200 rounded-md p-3">
        <Lock size={14} className="text-slate-500 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-slate-600">
          This description is only used to suggest a category. Nothing is submitted until you review and confirm on the next screen.
        </p>
      </div>
    </div>
  );
}

function CategoryPicker({ onSelect, onBack }) {
  return (
    <div>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 mb-5">
        <ArrowLeft size={14} /> Back
      </button>
      <h1 className="text-xl font-medium text-slate-900 mb-1">Raise a concern</h1>
      <p className="text-sm text-slate-600 mb-6">
        Choose the category that best fits your concern. You can share your name or stay anonymous.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {CATEGORIES.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c)}
              className="text-left bg-white border border-slate-200 rounded-lg p-4 hover:border-teal-600 hover:shadow-sm transition-colors"
            >
              <div className="w-9 h-9 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
                <Icon size={18} />
              </div>
              <div className="text-sm font-medium text-slate-900 mb-1">{c.label}</div>
              <div className="text-xs text-slate-500 leading-relaxed">{c.desc}</div>
            </button>
          );
        })}
      </div>

      <button
        onClick={() => onSelect(UNSURE_CATEGORY)}
        className="w-full text-left mt-3 bg-white border border-dashed border-slate-300 rounded-lg p-4 hover:border-teal-600 transition-colors flex items-center gap-3"
      >
        <div className="w-9 h-9 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
          <Sparkles size={18} />
        </div>
        <div>
          <div className="text-sm font-medium text-slate-900">Not sure which category?</div>
          <div className="text-xs text-slate-500">Describe your concern and Trust AI will help figure out where it goes</div>
        </div>
      </button>

      <div className="mt-6 flex items-start gap-2 bg-slate-100 border border-slate-200 rounded-md p-3">
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
    <div className="mb-6">
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
        {STEP_TITLES.map((t, i) => (
          <div key={t} className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${i < step ? "bg-teal-600 text-white" : i === step ? "bg-teal-100 text-teal-800 border border-teal-600" : "bg-slate-100 text-slate-400"}`}>
              {i < step ? <Check size={11} /> : i + 1}
            </div>
            {i < STEP_TITLES.length - 1 && <div className="w-4 h-px bg-slate-300" />}
          </div>
        ))}
      </div>
      <div className="text-xs text-teal-700 font-medium mb-1">{category.label}</div>
      <h2 className="text-lg font-medium text-slate-900">{STEP_TITLES[step]}</h2>
    </div>
  );
}

function Wizard({ category, step, setStep, form, update, toggleOutcome, addFile, removeFile, canContinue, onCancel, onSubmit }) {
  const isLast = step === STEP_TITLES.length - 1;
  const questions = CATEGORY_QUESTIONS[category.id] || [];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <StepHeader category={category} step={step} />

      {step === 0 && (
        <div>
          <Field label="How would you like to submit this?" required>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { v: "named", label: "Disclose my identity", d: "Your name is attached to the case", Icon: UserCheck },
                { v: "anonymous", label: "Stay anonymous", d: "No identifying info is stored", Icon: Lock },
              ].map((o) => (
                <button
                  key={o.v}
                  onClick={() => update("disclosureType", o.v)}
                  className={`text-left border rounded-lg p-4 transition-colors ${form.disclosureType === o.v ? "border-teal-600 bg-teal-50" : "border-slate-200 hover:border-slate-300"}`}
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
            <div className="flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-md p-3">
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
                <button key={o} onClick={() => update("isOngoing", o)} className={`px-4 py-1.5 rounded-md text-sm border ${form.isOngoing === o ? "bg-teal-600 text-white border-teal-600" : "border-slate-300 text-slate-600"}`}>{o}</button>
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
          <Field label="Who else was involved or affected?" help="Names optional if you're anonymous — roles are fine">
            <textarea rows={3} className={inputCls} value={form.othersInvolved} onChange={(e) => update("othersInvolved", e.target.value)} />
          </Field>
          <Field label="Were there any witnesses?">
            <textarea rows={2} className={inputCls} value={form.witnesses} onChange={(e) => update("witnesses", e.target.value)} />
          </Field>
          <Field label="Has this been reported to anyone else already?" required>
            <div className="flex gap-2 mb-2">
              {["Yes", "No"].map((o) => (
                <button key={o} onClick={() => update("priorReport", o)} className={`px-4 py-1.5 rounded-md text-sm border ${form.priorReport === o ? "bg-teal-600 text-white border-teal-600" : "border-slate-300 text-slate-600"}`}>{o}</button>
              ))}
            </div>
            {form.priorReport === "Yes" && (
              <textarea rows={2} placeholder="What happened when you reported it?" className={inputCls} value={form.priorReportDetails} onChange={(e) => update("priorReportDetails", e.target.value)} />
            )}
          </Field>
          <Field label="Supporting documents" help="Emails, photos, or messages — mocked for this prototype">
            <div className="flex flex-wrap gap-2 mb-2">
              {form.attachments.map((a) => (
                <span key={a} className="flex items-center gap-1 bg-slate-100 text-slate-700 text-xs px-2 py-1 rounded-md">
                  {a}<button onClick={() => removeFile(a)}><X size={12} /></button>
                </span>
              ))}
            </div>
            <button onClick={addFile} className="flex items-center gap-1.5 text-sm text-teal-700 border border-dashed border-teal-300 rounded-md px-3 py-1.5 hover:bg-teal-50">
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
                        className={`px-4 py-1.5 rounded-md text-sm border ${form[q.id] === o ? (q.id === "safetyRisk" && o === "Yes" ? "bg-red-600 text-white border-red-600" : "bg-teal-600 text-white border-teal-600") : "border-slate-300 text-slate-600"}`}
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
                <button key={u} onClick={() => update("urgency", u)} className={`px-3 py-1.5 rounded-md text-sm border capitalize ${form.urgency === u ? "border-teal-600 " + URGENCY_STYLES[u] : "border-slate-300 text-slate-600"}`}>
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
                  <button key={o} onClick={() => update("followUpConsent", o)} className={`px-4 py-1.5 rounded-md text-sm border ${form.followUpConsent === o ? "bg-teal-600 text-white border-teal-600" : "border-slate-300 text-slate-600"}`}>{o}</button>
                ))}
              </div>
            </Field>
          )}
        </div>
      )}

      {step === 5 && (
        <div>
          <ReviewRow label="Category" value={category.label} />
          <ReviewRow label="Submitting as" value={form.disclosureType === "named" ? `${form.employeeName} (named)` : "Anonymous"} />
          <ReviewRow label="Summary" value={form.summary || "—"} />
          <ReviewRow label="Ongoing" value={form.isOngoing || "—"} />
          {questions.map((q) => form[q.id] ? <ReviewRow key={q.id} label={q.label} value={form[q.id]} /> : null)}
          <ReviewRow label="Urgency" value={form.urgency || "—"} />
          <ReviewRow label="Attachments" value={form.attachments.length ? form.attachments.join(", ") : "None"} />
          <ReviewRow label="Will route to" value={category.team} />
          <div className="mt-4 flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-md p-3">
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
          <button onClick={onSubmit} className="flex items-center gap-1.5 text-sm bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">
            Submit concern <Check size={14} />
          </button>
        ) : (
          <button
            disabled={!canContinue}
            onClick={() => setStep(step + 1)}
            className={`flex items-center gap-1.5 text-sm px-4 py-2 rounded-md ${canContinue ? "bg-teal-600 text-white hover:bg-teal-700" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
          >
            Continue <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}

function ReviewRow({ label, value }) {
  return (
    <div className="flex items-start justify-between py-2 border-b border-slate-100 text-sm">
      <span className="text-slate-500 w-32 flex-shrink-0">{label}</span>
      <span className="text-slate-800 text-right flex-1">{value}</span>
    </div>
  );
}

function Confirmation({ caseId, category, disclosureType, onDone }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center mx-auto mb-4">
        <Check size={22} />
      </div>
      <h2 className="text-lg font-medium text-slate-900 mb-1">Concern submitted</h2>
      <p className="text-sm text-slate-600 mb-5">
        Routed to <span className="font-medium text-slate-800">{category.team}</span>
      </p>
      <div className="inline-flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-md px-4 py-2 mb-5">
        <span className="font-mono text-sm text-slate-800">{caseId}</span>
        <button onClick={() => { navigator.clipboard.writeText(caseId); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="text-slate-500 hover:text-teal-700">
          <Copy size={14} />
        </button>
      </div>
      {copied && <p className="text-xs text-teal-700 -mt-3 mb-4">Copied</p>}
      <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
        {disclosureType === "anonymous"
          ? "Save this case ID — it's the only way to check your status, since no identifying information was stored."
          : "You'll be notified directly as your case is reviewed. You can also check status anytime with this case ID."}
      </p>
      <button onClick={onDone} className="text-sm text-teal-700 hover:text-teal-800 font-medium">Back to home</button>
    </div>
  );
}

function Track({ trackInput, setTrackInput, trackResult, onLookup, onBack }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 mb-6">
        <ArrowLeft size={14} /> Back
      </button>
      <h2 className="text-lg font-medium text-slate-900 mb-1">Track a case</h2>
      <p className="text-sm text-slate-600 mb-5">Enter your case ID. No login required.</p>
      <div className="flex gap-2 mb-5">
        <input
          className={inputCls}
          placeholder="CNC-2026-000123"
          value={trackInput}
          onChange={(e) => setTrackInput(e.target.value)}
        />
        <button onClick={onLookup} className="bg-teal-600 text-white px-4 py-2 rounded-md text-sm hover:bg-teal-700 flex-shrink-0">Look up</button>
      </div>

      {trackResult === null && (
        <p className="text-sm text-slate-500">No case found for that ID in this session. In production this would query the case database.</p>
      )}
      {trackResult && (
        <div className="border border-slate-200 rounded-md p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-sm text-slate-800">{trackResult.id}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${URGENCY_STYLES[trackResult.urgency] || "bg-slate-100 text-slate-700"}`}>{trackResult.urgency}</span>
          </div>
          <ReviewRow label="Status" value={trackResult.status} />
          <ReviewRow label="Team" value={trackResult.team} />
          <ReviewRow label="Submitted" value={trackResult.submittedAt} />
        </div>
      )}
    </div>
  );
}

function HrLogin({ onLogin, onBack }) {
  const [name, setName] = useState("");
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 mb-6">
        <ArrowLeft size={14} /> Back
      </button>
      <div className="w-10 h-10 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
        <BarChart3 size={20} />
      </div>
      <h2 className="text-lg font-medium text-slate-900 mb-1">HR leadership sign-in</h2>
      <p className="text-sm text-slate-600 mb-6">Simulated SSO — see aggregate trends across every team. No individual case details or reporter identities are shown here.</p>

      <Field label="Your name" required>
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Morgan Reyes" />
      </Field>

      <button
        disabled={!name}
        onClick={() => onLogin(name)}
        className={`w-full mt-2 text-sm font-medium px-4 py-2.5 rounded-md ${name ? "bg-teal-600 text-white hover:bg-teal-700" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
      >
        View analytics
      </button>
      <p className="text-[11px] text-slate-400 mt-4 text-center">Prototype only — a real deployment would restrict this to a leadership role via SSO.</p>
    </div>
  );
}

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <div className="text-2xl font-semibold text-slate-900">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      {sub && <div className="text-[11px] text-slate-400 mt-1">{sub}</div>}
    </div>
  );
}

function BarRow({ label, count, total, colorClass = "bg-teal-600" }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-slate-700">{label}</span>
        <span className="text-slate-500">{count}</span>
      </div>
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full ${colorClass} rounded-full`} style={{ width: `${pct}%` }} />
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
  })).filter((c) => c.count > 0).sort((a, b) => b.count - a.count);

  const statusCounts = STATUS_FLOW.map((s) => ({ label: s, count: cases.filter((c) => c.status === s).length }));
  const urgencyOrder = ["immediate", "high", "medium", "low"];
  const urgencyCounts = urgencyOrder.map((u) => ({ label: u, count: cases.filter((c) => c.urgency === u).length, colorClass: u === "immediate" ? "bg-red-500" : u === "high" ? "bg-orange-500" : u === "medium" ? "bg-amber-500" : "bg-slate-400" }));

  const withOutcome = cases.filter((c) => c.investigation && c.investigation.outcome);
  const outcomeOptions = ["Substantiated", "Partially substantiated", "Unsubstantiated", "Inconclusive"];
  const outcomeCounts = outcomeOptions.map((o) => ({ label: o, count: withOutcome.filter((c) => c.investigation.outcome === o).length }));

  return (
    <div>
      <h1 className="text-xl font-medium text-slate-900 mb-1">Analytics</h1>
      <p className="text-sm text-slate-600 mb-6">Aggregate trends across all teams — {total} case{total !== 1 ? "s" : ""} tracked this session.</p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total cases" value={total} />
        <StatCard label="Open" value={openCount} />
        <StatCard label="Resolved / Closed" value={closedCount} />
        <StatCard label="Anonymous" value={`${anonymousPct}%`} sub={`${anonymousCount} of ${total}`} />
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5 mb-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Cases by category</h3>
        {categoryCounts.length === 0 ? (
          <p className="text-sm text-slate-400">No cases yet.</p>
        ) : (
          categoryCounts.map((c) => <BarRow key={c.label} label={c.label} count={c.count} total={total} />)
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Cases by status</h3>
          {statusCounts.map((s) => <BarRow key={s.label} label={s.label} count={s.count} total={total} colorClass="bg-slate-600" />)}
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-3">Cases by urgency</h3>
          {urgencyCounts.map((u) => <BarRow key={u.label} label={u.label} count={u.count} total={total} colorClass={u.colorClass} />)}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5 mb-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">Investigation outcomes</h3>
        <p className="text-xs text-slate-500 mb-3">Based on {withOutcome.length} of {total} cases with a recorded outcome.</p>
        {withOutcome.length === 0 ? (
          <p className="text-sm text-slate-400">No investigations recorded yet.</p>
        ) : (
          outcomeCounts.map((o) => <BarRow key={o.label} label={o.label} count={o.count} total={withOutcome.length} colorClass="bg-teal-600" />)
        )}
      </div>

      <div className="flex items-start gap-2 bg-slate-100 border border-slate-200 rounded-md p-3">
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
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-slate-800 mb-6">
        <ArrowLeft size={14} /> Back
      </button>
      <div className="w-10 h-10 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
        <ClipboardList size={20} />
      </div>
      <h2 className="text-lg font-medium text-slate-900 mb-1">Investigator sign-in</h2>
      <p className="text-sm text-slate-600 mb-6">Simulated SSO — pick your team to see only cases routed to it.</p>

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
        className={`w-full mt-2 text-sm font-medium px-4 py-2.5 rounded-md ${team && name ? "bg-teal-600 text-white hover:bg-teal-700" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
      >
        Sign in
      </button>
      <p className="text-[11px] text-slate-400 mt-4 text-center">Prototype only — real deployment would use company SSO with role-based scoping.</p>
    </div>
  );
}

function InvestigatorDashboard({ cases, onOpen, onReset }) {
  const sorted = [...cases].sort((a, b) => (URGENCY_RANK[a.urgency] ?? 9) - (URGENCY_RANK[b.urgency] ?? 9));
  const openCount = cases.filter((c) => c.status !== "Closed" && c.status !== "Resolved").length;

  return (
    <div>
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-medium text-slate-900 mb-1">Case queue</h1>
          <p className="text-sm text-slate-600 mb-6">{cases.length} case{cases.length !== 1 ? "s" : ""} routed to your team · {openCount} open</p>
        </div>
        <button onClick={onReset} className="text-xs text-slate-400 hover:text-slate-600 mt-1">Reset demo data</button>
      </div>

      {sorted.length === 0 && (
        <div className="bg-white border border-dashed border-slate-300 rounded-lg p-8 text-center text-sm text-slate-500">
          No cases yet for this team in this session. Submit a concern from the employee side matching this team to see it appear here.
        </div>
      )}

      <div className="flex flex-col gap-2">
        {sorted.map((c) => (
          <button key={c.id} onClick={() => onOpen(c.id)} className="text-left bg-white border border-slate-200 rounded-lg p-4 hover:border-teal-600 transition-colors flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xs text-slate-500">{c.id}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${URGENCY_STYLES[c.urgency] || "bg-slate-100 text-slate-700"}`}>{c.urgency}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full ${STATUS_STYLES[c.status] || "bg-slate-100 text-slate-700"}`}>{c.status}</span>
              </div>
              <div className="text-sm font-medium text-slate-900">{c.categoryLabel}</div>
              <div className="text-xs text-slate-500 truncate">{c.summary}</div>
            </div>
            <ChevronRight size={16} className="text-slate-400 flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}

function DetailSection({ title, icon: Icon, children }) {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={15} className="text-teal-700" />
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function InvestigatorCaseDetail({ c, onBack, onStatusChange, onSaveInvestigation, investigatorName }) {
  const [inv, setInv] = useState(c.investigation || emptyInvestigation());
  const [saved, setSaved] = useState(false);

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

      <div className="flex items-center gap-2 mb-1">
        <span className="font-mono text-sm text-slate-600">{c.id}</span>
        <span className={`text-[11px] px-2 py-0.5 rounded-full ${URGENCY_STYLES[c.urgency] || "bg-slate-100 text-slate-700"}`}>{c.urgency}</span>
      </div>
      <h1 className="text-xl font-medium text-slate-900 mb-1">{c.categoryLabel}</h1>
      <p className="text-sm text-slate-600 mb-5">
        Reported by {c.disclosureType === "named" ? `${c.employeeName} (${c.employeeId})` : "Anonymous"} · Submitted {c.submittedAt}
      </p>

      <DetailSection title="Status" icon={ClipboardList}>
        <div className="flex flex-wrap gap-2">
          {STATUS_FLOW.map((s) => (
            <button key={s} onClick={() => onStatusChange(s)} className={`px-3 py-1.5 rounded-md text-xs font-medium border ${c.status === s ? "bg-teal-600 text-white border-teal-600" : "border-slate-300 text-slate-600 hover:bg-slate-50"}`}>
              {s}
            </button>
          ))}
        </div>
        {(c.status === "Resolved" || c.status === "Closed") && (
          <div className="mt-3 flex items-start gap-2 bg-slate-50 border border-slate-200 rounded-md p-3">
            <Lock size={13} className="text-slate-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-600">
              {c.disclosureType === "named"
                ? `Notification would be sent directly to ${c.employeeName}.`
                : "No direct notification — the reporter must check status via their case ID."}
            </p>
          </div>
        )}
      </DetailSection>

      <DetailSection title="What happened" icon={FileText}>
        <ReviewRow label="Summary" value={c.summary || "—"} />
        <ReviewRow label="Occurred" value={c.occurredDate || "—"} />
        <ReviewRow label="Ongoing" value={c.isOngoing || "—"} />
        <ReviewRow label="Location" value={c.location || "—"} />
      </DetailSection>

      <DetailSection title="People & evidence" icon={Users}>
        <ReviewRow label="Others involved" value={c.othersInvolved || "—"} />
        <ReviewRow label="Witnesses" value={c.witnesses || "—"} />
        <ReviewRow label="Prior report" value={c.priorReport || "—"} />
        <ReviewRow label="Attachments" value={c.attachments?.length ? c.attachments.join(", ") : "None"} />
      </DetailSection>

      {Object.keys(c.categoryAnswers || {}).length > 0 && (
        <DetailSection title="Category-specific details" icon={ClipboardCheck}>
          {Object.values(c.categoryAnswers).map((a, i) => (
            <ReviewRow key={i} label={a.label} value={a.value} />
          ))}
        </DetailSection>
      )}

      <DetailSection title="Impact & desired outcome" icon={AlertTriangle}>
        <ReviewRow label="Impact" value={c.impactDescription || "—"} />
        <ReviewRow label="Desired outcome" value={c.desiredOutcome?.length ? c.desiredOutcome.join(", ") : "—"} />
      </DetailSection>

      <DetailSection title="Investigation" icon={ClipboardList}>
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
          <button onClick={handleSave} className="bg-teal-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-teal-700">
            Save investigation
          </button>
          {saved && <span className="text-xs text-teal-700">Saved</span>}
        </div>
      </DetailSection>

      <DetailSection title="Audit trail" icon={Clock}>
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
  );
}
