package com.realestate.duediligence.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import com.realestate.duediligence.dto.DocumentRequest;
import com.realestate.duediligence.dto.DocumentResponse;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.entity.admin.Transaction;
import com.realestate.duediligence.repository.DocumentRepository;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.PropertyFollowRepository;
import com.realestate.duediligence.entity.PropertyFollow;
import com.realestate.duediligence.enums.FollowReason;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.repository.admin.TransactionRepository;
import com.realestate.duediligence.security.CustomUserDetails;
import com.realestate.duediligence.service.DocumentService;

/** Agent-owned property workflow. Ownership is enforced from the JWT principal. */
@RestController
@RequestMapping("/api/agent")
public class AgentController {
    private final PropertyRepository properties;
    private final DocumentRepository documents;
    private final DocumentService documentService;
    private final TransactionRepository transactions;
    private final UserRepository users;
    private final PropertyFollowRepository follows;

    public AgentController(PropertyRepository properties, DocumentRepository documents, DocumentService documentService,
            TransactionRepository transactions, UserRepository users, PropertyFollowRepository follows) {
        this.properties = properties; this.documents = documents; this.documentService = documentService;
        this.transactions = transactions; this.users = users; this.follows = follows;
    }

    @GetMapping("/dashboard")
    public Map<String, Object> dashboard(@AuthenticationPrincipal CustomUserDetails principal) {
        User agent = agent(principal);
        List<Property> recent = properties.findByManagedBy_UserIdOrderByUpdatedAtDesc(agent.getUserId());
        return Map.of("totalProperties", recent.size(),
                "draftProperties", properties.countByManagedBy_UserIdAndStatus(agent.getUserId(), "DRAFT"),
                "underReview", properties.countByManagedBy_UserIdAndStatus(agent.getUserId(), "PENDING_VERIFICATION"),
                "approvedProperties", properties.countByManagedBy_UserIdAndStatus(agent.getUserId(), "APPROVED"),
                "propertiesSold", properties.countByManagedBy_UserIdAndStatus(agent.getUserId(), "SOLD"),
                "buyerRequests", follows.findByProperty_ManagedBy_UserIdAndFollowReason(agent.getUserId(), FollowReason.CONTACTED).size(),
                "recentProperties", recent.stream().limit(8).map(this::propertyRow).toList(),
                "transactions", transactions.findByAgent_UserIdOrderByCreatedAtDesc(agent.getUserId()).stream().limit(8).map(this::transactionRow).toList());
    }

    @GetMapping("/properties") public List<Map<String, Object>> list(@AuthenticationPrincipal CustomUserDetails principal) {
        return properties.findByManagedBy_UserIdOrderByUpdatedAtDesc(agent(principal).getUserId()).stream().map(this::propertyRow).toList();
    }

    @PostMapping("/properties") public ResponseEntity<Map<String, Object>> create(@AuthenticationPrincipal CustomUserDetails principal, @RequestBody Property property) {
        validateProperty(property);
        User agent = agent(principal);
        property.setPropertyId(null); property.setOwner(agent); property.setManagedBy(agent); property.setStatus("DRAFT");
        property.setCreatedAt(LocalDateTime.now()); property.setUpdatedAt(LocalDateTime.now()); property.setLastUpdated(LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.CREATED).body(propertyRow(properties.save(property)));
    }

    @GetMapping("/properties/{id}") public Map<String, Object> get(@AuthenticationPrincipal CustomUserDetails principal, @PathVariable Integer id) { return propertyRow(owned(principal, id)); }
    @PatchMapping("/properties/{id}") public Map<String, Object> edit(@AuthenticationPrincipal CustomUserDetails principal, @PathVariable Integer id, @RequestBody Property changes) {
        Property property = owned(principal, id);
        if (!"DRAFT".equals(property.getStatus()) && !"REJECTED".equals(property.getStatus())) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.CONFLICT, "Only draft or rejected properties can be edited");
        property.setPropertyCode(changes.getPropertyCode()); property.setAddress(changes.getAddress()); property.setCity(changes.getCity()); property.setState(changes.getState()); property.setPropertyType(changes.getPropertyType()); property.setEstimatedPrice(changes.getEstimatedPrice()); property.setOwnerName(changes.getOwnerName()); property.setUpdatedAt(LocalDateTime.now()); property.setLastUpdated(LocalDateTime.now());
        return propertyRow(properties.save(property));
    }
    @DeleteMapping("/properties/{id}") public ResponseEntity<Void> delete(@AuthenticationPrincipal CustomUserDetails principal, @PathVariable Integer id) { Property property = owned(principal, id); if (!"DRAFT".equals(property.getStatus())) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.CONFLICT, "Only draft properties can be deleted"); properties.delete(property); return ResponseEntity.noContent().build(); }
    @PostMapping("/properties/{id}/submit") public Map<String, Object> submit(@AuthenticationPrincipal CustomUserDetails principal, @PathVariable Integer id) { Property property = owned(principal, id); if (!"DRAFT".equals(property.getStatus()) && !"REJECTED".equals(property.getStatus())) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.CONFLICT, "Only draft or rejected properties can be submitted"); property.setStatus("PENDING_VERIFICATION"); property.setUpdatedAt(LocalDateTime.now()); property.setLastUpdated(LocalDateTime.now()); return propertyRow(properties.save(property)); }
    @GetMapping("/properties/{id}/documents") public List<DocumentResponse> documents(@AuthenticationPrincipal CustomUserDetails principal, @PathVariable Integer id) { owned(principal, id); return documentService.getDocuments(id); }
    @PostMapping("/properties/{id}/documents") public DocumentResponse document(@AuthenticationPrincipal CustomUserDetails principal, @PathVariable Integer id, @RequestBody DocumentRequest request) { owned(principal, id); request.setPropertyId(id); return documentService.createDocument(request); }
    @GetMapping("/transactions") public List<Map<String, Object>> transactionList(@AuthenticationPrincipal CustomUserDetails principal) { return transactions.findByAgent_UserIdOrderByCreatedAtDesc(agent(principal).getUserId()).stream().map(this::transactionRow).toList(); }
    @GetMapping("/buyer-requests") public List<Map<String, Object>> buyerRequests(@AuthenticationPrincipal CustomUserDetails principal) { return follows.findByProperty_ManagedBy_UserIdAndFollowReason(agent(principal).getUserId(), FollowReason.CONTACTED).stream().map(this::requestRow).toList(); }
    @GetMapping("/documents") public List<DocumentResponse> allDocuments(@AuthenticationPrincipal CustomUserDetails principal) { return properties.findByManagedBy_UserIdOrderByUpdatedAtDesc(agent(principal).getUserId()).stream().flatMap(p -> documentService.getDocuments(p.getPropertyId()).stream()).toList(); }

    private User agent(CustomUserDetails principal) { return users.findById(principal.getUser().getUserId()).orElseThrow(); }
    private void validateProperty(Property property) { if (property.getPropertyCode() == null || property.getPropertyCode().isBlank() || property.getAddress() == null || property.getAddress().isBlank() || property.getCity() == null || property.getCity().isBlank() || property.getState() == null || property.getState().isBlank() || property.getPropertyType() == null || property.getPropertyType().isBlank() || property.getOwnerName() == null || property.getOwnerName().isBlank() || property.getEstimatedPrice() == null || property.getEstimatedPrice().signum() <= 0) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.BAD_REQUEST, "Property title, address, city, state, property type, owner name, and a positive estimated price are required"); }
    private Property owned(CustomUserDetails principal, Integer id) { Property property = properties.findById(id).orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(HttpStatus.NOT_FOUND)); if (!property.getManagedBy().getUserId().equals(agent(principal).getUserId())) throw new org.springframework.web.server.ResponseStatusException(HttpStatus.FORBIDDEN); return property; }
    private Map<String, Object> propertyRow(Property p) { return Map.of("id", p.getPropertyId(), "title", p.getPropertyCode(), "location", String.join(", ", java.util.stream.Stream.of(p.getAddress(), p.getCity(), p.getState()).filter(v -> v != null && !v.isBlank()).toList()), "status", p.getStatus(), "documents", documents.countByProperty_PropertyId(p.getPropertyId()), "updatedAt", p.getUpdatedAt() == null ? p.getCreatedAt() : p.getUpdatedAt()); }
    private Map<String, Object> transactionRow(Transaction t) { return Map.of("id", t.getTransactionId(), "property", t.getProperty().getPropertyCode(), "buyer", t.getBuyer() == null ? "—" : t.getBuyer().getName(), "status", t.getStatus(), "amount", t.getAmount(), "createdAt", t.getCreatedAt()); }
    private Map<String, Object> requestRow(PropertyFollow follow) { return Map.of("id", follow.getId(), "buyer", follow.getUser().getName(), "property", follow.getProperty().getPropertyCode(), "propertyId", follow.getProperty().getPropertyId(), "status", follow.getFollowReason().name(), "createdAt", follow.getCreatedAt()); }
}
