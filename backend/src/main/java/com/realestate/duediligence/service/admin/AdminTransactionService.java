package com.realestate.duediligence.service.admin;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.realestate.duediligence.dto.admin.TransactionResponse;

public interface AdminTransactionService {
    Page<TransactionResponse> getTransactions(
            String adminEmail,
            String status,
            Integer buyerId,
            Integer agentId,
            Integer propertyId,
            LocalDateTime startDate,
            LocalDateTime endDate,
            Pageable pageable);

    TransactionResponse getTransactionById(String adminEmail, Integer transactionId);
}
