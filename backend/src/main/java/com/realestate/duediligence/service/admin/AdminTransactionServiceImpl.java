package com.realestate.duediligence.service.admin;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.realestate.duediligence.dto.admin.TransactionResponse;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.entity.admin.Transaction;
import com.realestate.duediligence.enums.Role;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.repository.admin.TransactionRepository;

@Service
@Transactional(readOnly = true)
public class AdminTransactionServiceImpl implements AdminTransactionService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public AdminTransactionServiceImpl(
            TransactionRepository transactionRepository,
            UserRepository userRepository) {
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Page<TransactionResponse> getTransactions(
            String adminEmail,
            String status,
            Integer buyerId,
            Integer agentId,
            Integer propertyId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable) {

        requireAdmin(adminEmail);
        Page<Transaction> transactions = transactionRepository.findWithFilters(status, buyerId, agentId, propertyId, startDate, endDate, pageable);
        return transactions.map(this::toResponse);
    }

    @Override
    public TransactionResponse getTransactionById(String adminEmail, Integer transactionId) {
        requireAdmin(adminEmail);
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found: " + transactionId));
        return toResponse(transaction);
    }

    private User requireAdmin(String adminEmail) {
        User user = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Administrator access is required"
                ));

        if (user.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Administrator access is required"
            );
        }

        return user;
    }

    private TransactionResponse toResponse(Transaction t) {
        return TransactionResponse.builder()
                .transactionId(t.getTransactionId())
                .propertyId(t.getProperty() != null ? t.getProperty().getPropertyId() : null)
                .propertyTitle(t.getProperty() != null ? t.getProperty().getPropertyCode() : null)
                .buyerId(t.getBuyer() != null ? t.getBuyer().getUserId() : null)
                .buyerName(t.getBuyer() != null ? t.getBuyer().getName() : null)
                .agentId(t.getAgent() != null ? t.getAgent().getUserId() : null)
                .agentName(t.getAgent() != null ? t.getAgent().getName() : null)
                .amount(t.getAmount())
                .status(t.getStatus())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
