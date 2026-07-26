import { useEffect, useState } from "react";
import { LuDownload, LuFileText, LuPlus, LuTrash2 } from "react-icons/lu";
import { api } from "../../../services/api";

export default function Documents({ propertyId }) {
  const [documents, setDocuments] = useState([]); const [error, setError] = useState(""); const [adding, setAdding] = useState(false); const [form, setForm] = useState({ documentName: "", documentType: "", fileUrl: "" });
  const load = () => api.getDocuments(propertyId).then(setDocuments).catch((e) => setError(e.message));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [propertyId]);
  const add = async (e) => { e.preventDefault(); try { await api.createDocument({ ...form, propertyId: Number(propertyId) }); setForm({ documentName: "", documentType: "", fileUrl: "" }); setAdding(false); load(); } catch (err) { setError(err.message); } };
  const remove = async (doc) => { if (!window.confirm(`Delete ${doc.documentName}?`)) return; try { await api.deleteDocument(doc.id); load(); } catch (err) { setError(err.message); } };
  return <div className="details-card"><div className="card-actions"><h3>Documents</h3><button className="small-primary" onClick={() => setAdding(!adding)}><LuPlus />Add Document</button></div>{adding && <form className="inline-form" onSubmit={add}><input required placeholder="Document name" value={form.documentName} onChange={(e) => setForm({ ...form, documentName: e.target.value })} /><input required placeholder="Document type" value={form.documentType} onChange={(e) => setForm({ ...form, documentType: e.target.value })} /><input placeholder="Download URL (optional)" value={form.fileUrl} onChange={(e) => setForm({ ...form, fileUrl: e.target.value })} /><button className="small-primary">Save</button></form>}{error && <p className="error-message">{error}</p>}<div className="documents-grid">{documents.map((doc) => <div key={doc.id} className="document-item"><LuFileText /><span><strong>{doc.documentName}</strong><small>{doc.documentType}</small></span>{doc.fileUrl && <a href={doc.fileUrl} target="_blank" rel="noreferrer" aria-label="Download document"><LuDownload /></a>}<button className="icon-danger" onClick={() => remove(doc)} aria-label="Delete document"><LuTrash2 /></button></div>)}</div>{!error && documents.length === 0 && <p className="no-data">No documents have been added to this property.</p>}</div>;
}
