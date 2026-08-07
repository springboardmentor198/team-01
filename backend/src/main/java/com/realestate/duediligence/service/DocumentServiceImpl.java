package com.realestate.duediligence.service;

import com.realestate.duediligence.exception.ResourceNotFoundException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import com.realestate.duediligence.dto.DocumentRequest;
import com.realestate.duediligence.dto.DocumentResponse;
import com.realestate.duediligence.entity.ActivityLog;
import com.realestate.duediligence.entity.Document;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.event.NotificationEvents;
import com.realestate.duediligence.repository.ActivityLogRepository;
import com.realestate.duediligence.repository.DocumentRepository;
import com.realestate.duediligence.repository.PropertyRepository;

@Service
public class DocumentServiceImpl implements DocumentService {

    private final DocumentRepository repository;
    private final PropertyRepository propertyRepository;
    private final ActivityLogRepository activityLogRepository;
    private final ApplicationEventPublisher eventPublisher;

    public DocumentServiceImpl(DocumentRepository repository,
                               PropertyRepository propertyRepository,
                               ActivityLogRepository activityLogRepository,
                               ApplicationEventPublisher eventPublisher) {
        this.repository = repository;
        this.propertyRepository = propertyRepository;
        this.activityLogRepository = activityLogRepository;
        this.eventPublisher = eventPublisher;
    }

    @Override
    public DocumentResponse createDocument(DocumentRequest request) {

        Property property = propertyRepository.findById(request.getPropertyId())
                .orElseThrow(() -> new ResourceNotFoundException("Property not found"));

        Document document = Document.builder()
                .property(property)
                .documentName(request.getDocumentName())
                .documentType(request.getDocumentType())
                .fileUrl(request.getFileUrl())
                .uploadedAt(LocalDateTime.now())
                .build();

        repository.save(document);

        activityLogRepository.save(
    ActivityLog.builder()
        .property(document.getProperty())
        .activityType("DOCUMENT_UPLOADED")
        .description(document.getDocumentType() + " uploaded.")
        .performedBy("Samridhi Prakash")
        .createdAt(LocalDateTime.now())
        .build()
);

        eventPublisher.publishEvent(new NotificationEvents.DocumentUploadedEvent(
                property.getPropertyId(),
                property.getPropertyCode(),
                document.getDocumentName(),
                null));

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
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        document.setDocumentName(request.getDocumentName());
        document.setDocumentType(request.getDocumentType());
        document.setFileUrl(request.getFileUrl());

        repository.save(document);

        eventPublisher.publishEvent(new NotificationEvents.DocumentUpdatedEvent(
                document.getProperty().getPropertyId(),
                document.getProperty().getPropertyCode(),
                document.getDocumentName(),
                null));

        return mapToResponse(document);
    }

    @Override
    public void deleteDocument(Integer id) {

        Document document = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        eventPublisher.publishEvent(new NotificationEvents.DocumentDeletedEvent(
                document.getProperty().getPropertyId(),
                document.getProperty().getPropertyCode(),
                document.getDocumentName(),
                null));

        repository.deleteById(id);

    }

    @Override
    public DocumentResponse downloadDocument(Integer id) {
        Document document = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        activityLogRepository.save(
            ActivityLog.builder()
                .property(document.getProperty())
                .activityType("DOCUMENT_DOWNLOADED")
                .description("Downloaded " + document.getDocumentName() + " PDF.")
                .performedBy("bhavishya.mentor@example.com")
                .createdAt(LocalDateTime.now())
                .build()
        );

        return mapToResponse(document);
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
