import { LuFileText } from "react-icons/lu";

export default function Documents({ documents = [] }) {
  return (
    <div className="details-card">
      <h3>Documents</h3>

      <div className="documents-grid">

        {documents.map((doc, index) => (
          <div key={index} className="document-item">
            <LuFileText />
            <span>{doc}</span>
            <span className="doc-status">Available</span>
          </div>
        ))}

      </div>
    </div>
  );
}