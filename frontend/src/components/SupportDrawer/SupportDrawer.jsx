import { useEffect, useRef, useState } from "react";
import { FiAlertCircle, FiArrowLeft, FiChevronRight, FiCreditCard, FiFile, FiHelpCircle, FiMail, FiPhone, FiSend, FiThumbsDown, FiThumbsUp, FiTool, FiTrash2, FiUploadCloud, FiUser, FiX } from "react-icons/fi";
import { RiCustomerService2Line } from "react-icons/ri";
import { api } from "../../services/api";
import "./SupportDrawer.css";

const topics = [
  { title: "General Inquiry", description: "Questions about the platform", icon: FiHelpCircle, tone: "blue", button: "Submit Inquiry" },
  { title: "Technical Support", description: "Report an issue or get help", icon: FiTool, tone: "violet", button: "Submit Support Request", field: "Issue Type", options: ["Page not loading", "Feature not working", "Error message", "Performance issue", "Other"] },
  { title: "Report an Issue", description: "Something not working as expected", icon: FiAlertCircle, tone: "rose", button: "Report Issue", field: "Issue Type", options: ["Bug", "Incorrect data", "Broken functionality", "UI issue", "Other"] },
  { title: "Account & Access", description: "Login, profile or permission issues", icon: FiUser, tone: "amber", button: "Submit Request", field: "Issue Type", options: ["Login problem", "Password reset", "Account locked", "Permission issue", "Profile issue"] },
  { title: "Billing & Payments", description: "Invoice, payment or subscription queries", icon: FiCreditCard, tone: "emerald", button: "Submit Billing Request", field: "Billing Type", options: ["Payment issue", "Invoice", "Subscription", "Refund", "Other"] },
];

const emptyForm = { subject: "", description: "", property: "", priority: "Medium", type: "" };
const propertyLabel = (property) => property.propertyCode || [property.address, property.city].filter(Boolean).join(" — ") || `Property #${property.propertyId}`;

function SupportDrawer({ isOpen, onClose }) {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [files, setFiles] = useState([]);
  const [properties, setProperties] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ticket, setTicket] = useState("");
  const fileInput = useRef(null);

  useEffect(() => {
    if (!isOpen || properties.length) return;
    api.getProperties().then((data) => setProperties(Array.isArray(data) ? data : [])).catch(() => setProperties([]));
  }, [isOpen, properties.length]);

  const resetDetail = () => { setSelectedTopic(null); setForm(emptyForm); setErrors({}); setFiles([]); setTicket(""); };
  const closeDrawer = () => { resetDetail(); onClose(); };
  const updateField = (field, value) => { setForm((current) => ({ ...current, [field]: value })); setErrors((current) => ({ ...current, [field]: "" })); };
  const addFiles = (incoming) => {
    const accepted = Array.from(incoming).filter((file) => file.size <= 10 * 1024 * 1024 && ["application/pdf", "image/jpeg", "image/png"].includes(file.type));
    setFiles((current) => [...current, ...accepted].slice(0, 5));
  };
  const submit = (event) => {
    event.preventDefault();
    const nextErrors = { subject: !form.subject.trim() ? "Subject is required" : "", description: !form.description.trim() ? "Please describe your issue" : "", priority: !form.priority ? "Priority is required" : "" };
    setErrors(nextErrors);
    if (Object.values(nextErrors).some(Boolean)) return;
    setIsSubmitting(true);
    window.setTimeout(() => { setTicket(`SUP-${Math.floor(10000 + Math.random() * 90000)}`); setIsSubmitting(false); }, 800);
  };

  if (!isOpen) return null;
  return <div className="support-drawer-layer" role="presentation">
    <button className="support-drawer-backdrop" aria-label="Close support panel" onClick={closeDrawer} />
    <aside className="support-drawer" role="dialog" aria-modal="true" aria-labelledby="support-drawer-title">
      <header className="support-drawer-header"><div className="support-heading"><span className="support-heading-icon"><RiCustomerService2Line /></span><div><h2 id="support-drawer-title">Contact Support</h2><p>We&apos;re here to help!</p></div></div><button className="support-close-button" type="button" aria-label="Close support panel" onClick={closeDrawer}><FiX /></button></header>
      {!selectedTopic ? <CategoryList onSelect={setSelectedTopic} /> : ticket ? <SuccessView ticket={ticket} onClose={closeDrawer} onBack={resetDetail} /> : <RequestForm topic={selectedTopic} form={form} errors={errors} files={files} properties={properties} isDragging={isDragging} isSubmitting={isSubmitting} fileInput={fileInput} onBack={resetDetail} onField={updateField} onFiles={addFiles} onDragging={setIsDragging} onRemoveFile={(index) => setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index))} onSubmit={submit} />}
      {!selectedTopic && <footer className="support-feedback"><span>Was this helpful?</span><div><button type="button" aria-label="This was helpful"><FiThumbsUp /></button><button type="button" aria-label="This was not helpful"><FiThumbsDown /></button></div></footer>}
    </aside>
  </div>;
}

function CategoryList({ onSelect }) { return <div className="support-drawer-body"><section aria-labelledby="support-topics-title"><h3 id="support-topics-title">How can we help you?</h3><p className="support-section-copy">Choose a topic or send us a message.</p><div className="support-topic-list">{topics.map((topic) => { const Icon = topic.icon; return <button className="support-topic-card" type="button" key={topic.title} onClick={() => onSelect(topic)}><span className={`support-topic-icon ${topic.tone}`}><Icon /></span><span className="support-topic-content"><strong>{topic.title}</strong><small>{topic.description}</small></span><FiChevronRight className="support-topic-chevron" /></button>; })}</div></section><section className="support-direct"><h3>Still need help?</h3><p className="support-section-copy">Our support team typically replies within 24 hours.</p><div className="support-contact-list"><a className="support-contact-card" href="mailto:support@duediligence.com"><span className="support-contact-icon"><FiMail /></span><span><strong>Email Support</strong><small>support@duediligence.com</small></span><FiChevronRight className="support-topic-chevron" /></a><a className="support-contact-card" href="tel:+919876543210"><span className="support-contact-icon"><FiPhone /></span><span><strong>Call Us</strong><small>+91 98765 43210</small></span><FiChevronRight className="support-topic-chevron" /></a></div></section></div>; }

function RequestForm({ topic, form, errors, files, properties, isDragging, isSubmitting, fileInput, onBack, onField, onFiles, onDragging, onRemoveFile, onSubmit }) { return <form className="support-form" onSubmit={onSubmit}><div className="support-drawer-body"><button className="support-back" type="button" onClick={onBack}><FiArrowLeft /> <span>{topic.title}</span></button><p className="support-detail-description">{topic.description}</p><div className="support-fields"><Field label="Subject" required error={errors.subject}><input value={form.subject} onChange={(event) => onField("subject", event.target.value)} placeholder="Enter a short subject" /></Field><Field label="Description" required error={errors.description}><textarea value={form.description} maxLength="1000" onChange={(event) => onField("description", event.target.value)} placeholder="Please provide details of your query" /><small className="support-counter">{form.description.length}/1000</small></Field>{topic.field && <Field label={topic.field}><select value={form.type} onChange={(event) => onField("type", event.target.value)}><option value="">Select an option</option>{topic.options.map((option) => <option key={option}>{option}</option>)}</select></Field>}<Field label="Property (Optional)"><select value={form.property} onChange={(event) => onField("property", event.target.value)}><option value="">Select a property</option>{properties.map((property) => <option value={property.propertyId} key={property.propertyId}>{propertyLabel(property)}</option>)}</select></Field><Field label="Priority" required error={errors.priority}><select className={`priority-${form.priority.toLowerCase()}`} value={form.priority} onChange={(event) => onField("priority", event.target.value)}>{["Low", "Medium", "High", "Urgent"].map((option) => <option key={option}>{option}</option>)}</select></Field><div className="support-field"><label>Attachments <span>(Optional)</span></label><div className={`support-upload ${isDragging ? "dragging" : ""}`} onDragOver={(event) => { event.preventDefault(); onDragging(true); }} onDragLeave={() => onDragging(false)} onDrop={(event) => { event.preventDefault(); onDragging(false); onFiles(event.dataTransfer.files); }}><FiUploadCloud /><strong>Drag &amp; drop files here</strong><span>or <button type="button" onClick={() => fileInput.current?.click()}>click to browse</button></span><small>Max size: 10MB (PDF, JPG, PNG)</small><input ref={fileInput} type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => { onFiles(event.target.files); event.target.value = ""; }} /></div>{files.map((file, index) => <div className="support-file" key={`${file.name}-${index}`}><FiFile /><span><strong>{file.name}</strong><small>{file.type.replace("image/", "").toUpperCase()} · {(file.size / 1024 / 1024).toFixed(1)} MB · 100% uploaded</small></span><button type="button" aria-label={`Remove ${file.name}`} onClick={() => onRemoveFile(index)}><FiTrash2 /></button></div>)}</div></div><button className="support-submit" type="submit" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : <><FiSend /> {topic.button}</>}</button><div className="support-response-note"><RiCustomerService2Line /><span>Our support team typically replies within 24 hours.</span></div></div></form>; }

function Field({ label, required, error, children }) { return <div className={`support-field ${error ? "has-error" : ""}`}><label>{label} {required && <b>*</b>}</label>{children}{error && <em>{error}</em>}</div>; }
function SuccessView({ ticket, onClose, onBack }) { return <div className="support-success"><span className="support-success-icon"><RiCustomerService2Line /></span><h3>Support request submitted</h3><p>Your request has been sent to our support team.</p><strong>Ticket #{ticket}</strong><small>Our support team typically replies within 24 hours.</small><button className="support-submit" type="button" onClick={onClose}>Close</button><button className="support-secondary-action" type="button" onClick={onBack}>Back to Support</button></div>; }
export default SupportDrawer;
