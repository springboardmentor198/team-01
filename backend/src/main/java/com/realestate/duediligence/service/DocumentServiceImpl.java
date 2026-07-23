package com.realestate.duediligence.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.realestate.duediligence.dto.DocumentRequest;
import com.realestate.duediligence.dto.DocumentResponse;
import com.realestate.duediligence.entity.Document;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.repository.DocumentRepository;
import com.realestate.duediligence.repository.PropertyRepository;

@Service
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository repository;
    private final PropertyRepository propertyRepository;

    public DocumentServiceImpl(DocumentRepository repository,
                               PropertyRepository propertyRepository) {
        this.repository = repository;
        this.propertyRepository = propertyRepository;
    }

    @Override
    public DocumentResponse createDocument(DocumentRequest request) {

        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new RuntimeException("Property not found"));

        Document document = Document.builder()
                .property(property)
                .documentName(request.getDocumentName())
                .documentType(request.getDocumentType())
                .fileUrl(request.getFileUrl())
                .uploadedAt(LocalDateTime.now())
                .build();

        repository.save(document);

        return mapToResponse(document);
    }

    @Override
    public List<DocumentResponse> getDocuments(Integer propertyId) {

        return repository.findByProperty_PropertyId(propertyId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public DocumentResponse updateDocument(Integer id, DocumentRequest request) {

        Document document = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        document.setDocumentName(request.getDocumentName());
        document.setDocumentType(request.getDocumentType());
        document.setFileUrl(request.getFileUrl());

        repository.save(document);

        return mapToResponse(document);
    }

    @Override
    public void deleteDocument(Integer id) {

        repository.deleteById(id);

    }

    private DocumentResponse mapToResponse(Document document) {

        return DocumentResponse.builder()
                .id(document.getId())
                .propertyId(document.getProperty().getPropertyId())
                .documentName(document.getDocumentName())
                .documentType(document.getDocumentType())
                .fileUrl(document.getFileUrl())
                .uploadedAt(document.getUploadedAt())
                .build();
    }
}