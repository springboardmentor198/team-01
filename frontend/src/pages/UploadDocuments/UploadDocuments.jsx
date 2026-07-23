import { useState } from "react";
import Layout from "../../components/Layout/Layout";
import "./UploadDocuments.css";

import {
  LuUpload,
  LuFileText,
  LuTrash2,
  LuCircleCheck,
} from "react-icons/lu";

const propertyList = [
  "3 BHK Luxury Villa",
  "Commercial Office",
  "Farm House",
];

const documentTypes = [
  "Sale Deed",
  "Property Tax Receipt",
  "Occupancy Certificate",
  "Building Plan",
  "Encumbrance Certificate",
  "Other",
];

export default function UploadDocuments() {
  const [property, setProperty] = useState("");
  const [docName, setDocName] = useState("");
  const [docType, setDocType] = useState("");
  const [file, setFile] = useState(null);

  const [documents, setDocuments] = useState([]);

  const handleUpload = () => {
    if (!property || !docName || !docType || !file) {
      alert("Please fill all fields.");
      return;
    }

    const newDocument = {
      id: Date.now(),
      property,
      name: docName,
      type: docType,
      fileName: file.name,
      status: "Uploaded",
    };

    setDocuments([...documents, newDocument]);

    setProperty("");
    setDocName("");
    setDocType("");
    setFile(null);

    document.getElementById("document-file").value = "";
  };

  const removeDocument = (id) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
  };

  return (
    <Layout title="Upload Documents">
      <div className="upload-page">

        <div className="upload-header">
          <h2>
            <LuUpload />
            Upload Property Documents
          </h2>

          <p>
            Upload legal and verification documents for any property.
          </p>
        </div>

        <div className="upload-card">

          <div className="form-group">
            <label>Select Property</label>

            <select
              value={property}
              onChange={(e) => setProperty(e.target.value)}
            >
              <option value="">Choose Property</option>

              {propertyList.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Document Name</label>

            <input
              type="text"
              placeholder="Enter document name"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Document Type</label>

            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            >
              <option value="">Choose Type</option>

              {documentTypes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Select File</label>

            <input
              id="document-file"
              type="file"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </div>

          <button
            className="upload-btn"
            onClick={handleUpload}
          >
            <LuUpload />
            Upload Document
          </button>

        </div>

        <div className="documents-card">

          <h3>Uploaded Documents</h3>

          {documents.length === 0 ? (
            <div className="empty-documents">
              No documents uploaded yet.
            </div>
          ) : (
            <table className="documents-table">

              <thead>

                <tr>
                  <th>Property</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>File</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>

              </thead>

              <tbody>

                {documents.map((doc) => (
                  <tr key={doc.id}>

                    <td>{doc.property}</td>

                    <td>{doc.name}</td>

                    <td>{doc.type}</td>

                    <td>
                      <LuFileText />
                      {" "}
                      {doc.fileName}
                    </td>

                    <td>
                      <span className="status uploaded">
                        <LuCircleCheck />
                        Uploaded
                      </span>
                    </td>

                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => removeDocument(doc.id)}
                      >
                        <LuTrash2 />
                      </button>
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>
          )}

        </div>

      </div>
    </Layout>
  );
}