package com.realestate.duediligence.service;

import java.util.List;

import com.realestate.duediligence.dto.DocumentRequest;
import com.realestate.duediligence.dto.DocumentResponse;

public interface DocumentService {

    DocumentResponse createDocument(DocumentRequest request);

    List<DocumentResponse> getDocuments(Integer propertyId);

    DocumentResponse updateDocument(Integer id, DocumentRequest request);

    void deleteDocument(Integer id);

    DocumentResponse downloadDocument(Integer id, String email);

}
