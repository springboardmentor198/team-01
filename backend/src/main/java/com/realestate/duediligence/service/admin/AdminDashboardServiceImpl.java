package com.realestate.duediligence.service.admin;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.Comparator;
import java.util.stream.Stream;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.realestate.duediligence.dto.admin.AdminDashboardOverviewResponse;
import com.realestate.duediligence.dto.admin.PlatformActivityResponse;
import com.realestate.duediligence.dto.admin.PropertyStatusResponse;
import com.realestate.duediligence.dto.admin.UserDistributionResponse;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.AccountStatus;
import com.realestate.duediligence.enums.Role;
import com.realestate.duediligence.repository.ActivityLogRepository;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.RoleRequestRepository;
import com.realestate.duediligence.repository.ReportHistoryRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.repository.admin.SecurityEventRepository;
import com.realestate.duediligence.repository.admin.TransactionRepository;

@Service
@Transactional(readOnly = true)
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final UserRepository userRepository;
    private final RoleRequestRepository roleRequestRepository;
    private final PropertyRepository propertyRepository;
    private final ActivityLogRepository activityLogRepository;
    private final TransactionRepository transactionRepository;
    private final SecurityEventRepository securityEventRepository;
    private final ReportHistoryRepository reportHistoryRepository;

    public AdminDashboardServiceImpl(
            UserRepository userRepository,
            RoleRequestRepository roleRequestRepository,
            PropertyRepository propertyRepository,
            ActivityLogRepository activityLogRepository,
            TransactionRepository transactionRepository,
            SecurityEventRepository securityEventRepository,
            ReportHistoryRepository reportHistoryRepository) {
        this.userRepository = userRepository;
        this.roleRequestRepository = roleRequestRepository;
        this.propertyRepository = propertyRepository;
        this.activityLogRepository = activityLogRepository;
        this.transactionRepository = transactionRepository;
        this.securityEventRepository = securityEventRepository;
        this.reportHistoryRepository = reportHistoryRepository;
    }

    @Override
    public AdminDashboardOverviewResponse getOverview(String adminEmail) {
        requireAdmin(adminEmail);

        long totalUsers = userRepository.count();
        long verifiedProfessionals = userRepository.countByRoleIn(List.of(Role.AGENT, Role.LEGAL_REVIEWER, Role.BANK));
        long pendingRoleRequests = roleRequestRepository.findByStatus(AccountStatus.PENDING).size();
        long totalProperties = propertyRepository.count();
        long approvedProperties = propertyRepository.countByStatusIgnoreCase("APPROVED") 
                                 + propertyRepository.countByStatusIgnoreCase("AVAILABLE");
        long pendingProperties = propertyRepository.countByStatusIgnoreCase("PENDING");

        return AdminDashboardOverviewResponse.builder()
                .totalUsers(totalUsers)
                .verifiedProfessionals(verifiedProfessionals)
                .pendingRoleRequests(pendingRoleRequests)
                .totalProperties(totalProperties)
                .approvedProperties(approvedProperties)
                .pendingProperties(pendingProperties)
                .build();
    }

    @Override
    public List<PlatformActivityResponse> getActivity(String adminEmail, String period, String metric) {
        requireAdmin(adminEmail);

        LocalDateTime since = getSinceDate(period);
        List<Object[]> results;

        if ("USERS".equalsIgnoreCase(metric)) {
            results = userRepository.findActivityCountGroupByDate(since);
        } else if ("PROPERTIES".equalsIgnoreCase(metric)) {
            results = propertyRepository.findActivityCountGroupByDate(since);
        } else if ("TRANSACTIONS".equalsIgnoreCase(metric)) {
            results = transactionRepository.findActivityCountGroupByDate(since);
        } else if ("VIEWS".equalsIgnoreCase(metric)) {
            results = activityLogRepository.findActivityCountGroupByDate("PROPERTY_VIEW", since);
        } else if ("DOWNLOADS".equalsIgnoreCase(metric)) {
            results = activityLogRepository.findActivityCountGroupByDate("DOCUMENT_DOWNLOADED", since);
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid metric: " + metric);
        }

        // Map date to count using a TreeMap to sort and fill empty days
        Map<String, Long> dateMap = new TreeMap<>();
        
        // Pre-fill all dates in the range with 0 to ensure smooth line charts
        LocalDateTime temp = since;
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        while (temp.isBefore(now) || temp.toLocalDate().isEqual(now.toLocalDate())) {
            dateMap.put(temp.format(formatter), 0L);
            temp = temp.plusDays(1);
        }

        // Populate counts from DB
        for (Object[] row : results) {
            if (row[0] != null) {
                String dateStr;
                if (row[0] instanceof java.sql.Timestamp) {
                    dateStr = ((java.sql.Timestamp) row[0]).toLocalDateTime().format(formatter);
                } else if (row[0] instanceof LocalDateTime) {
                    dateStr = ((LocalDateTime) row[0]).format(formatter);
                } else {
                    dateStr = row[0].toString().substring(0, 10);
                }
                
                Long count = ((Number) row[1]).longValue();
                if (dateMap.containsKey(dateStr)) {
                    dateMap.put(dateStr, dateMap.get(dateStr) + count);
                } else {
                    dateMap.put(dateStr, count);
                }
            }
        }

        List<PlatformActivityResponse> response = new ArrayList<>();
        dateMap.forEach((date, count) -> response.add(new PlatformActivityResponse(date, count)));
        return response;
    }

    @Override
    public UserDistributionResponse getUserDistribution(String adminEmail) {
        requireAdmin(adminEmail);

        return UserDistributionResponse.builder()
                .buyer(userRepository.countByRole(Role.BUYER))
                .agent(userRepository.countByRole(Role.AGENT))
                .legalReviewer(userRepository.countByRole(Role.LEGAL_REVIEWER))
                .bank(userRepository.countByRole(Role.BANK))
                .admin(userRepository.countByRole(Role.ADMIN))
                .build();
    }

    @Override
    public PropertyStatusResponse getPropertyStatus(String adminEmail) {
        requireAdmin(adminEmail);

        long approved = propertyRepository.countByStatusIgnoreCase("APPROVED") 
                       + propertyRepository.countByStatusIgnoreCase("AVAILABLE");
        long pending = propertyRepository.countByStatusIgnoreCase("PENDING");
        long rejected = propertyRepository.countByStatusIgnoreCase("REJECTED");
        long underReview = propertyRepository.countByStatusIgnoreCase("UNDER_REVIEW") 
                          + propertyRepository.countByStatusIgnoreCase("UNDER REVIEW");

        return PropertyStatusResponse.builder()
                .approved(approved)
                .pending(pending)
                .rejected(rejected)
                .underReview(underReview)
                .build();
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

    private LocalDateTime getSinceDate(String period) {
        LocalDateTime now = LocalDateTime.now();
        if ("7D".equalsIgnoreCase(period)) {
            return now.minusDays(7);
        } else if ("30D".equalsIgnoreCase(period)) {
            return now.minusDays(30);
        } else if ("3M".equalsIgnoreCase(period)) {
            return now.minusMonths(3);
        } else if ("1Y".equalsIgnoreCase(period)) {
            return now.minusYears(1);
        }
        return now.minusDays(30); // Default to 30D
    }

    @Override
    public List<com.realestate.duediligence.dto.ActivityLogResponse> getRecentActivity(String adminEmail) {
        requireAdmin(adminEmail);
        
        var pageable = org.springframework.data.domain.PageRequest.of(0, 50);
        var logs = activityLogRepository.findRecentActivity(pageable).stream().map(log -> com.realestate.duediligence.dto.ActivityLogResponse.builder()
                .id(log.getActivityId())
                .activityType(log.getActivityType())
                .description(log.getDescription())
                .performedBy(log.getPerformedBy())
                .propertyId(log.getProperty() != null ? log.getProperty().getPropertyId() : null)
                .propertyCode(log.getProperty() != null ? log.getProperty().getPropertyCode() : null)
                .createdAt(log.getCreatedAt())
                .build()
        );
        var securityEvents = securityEventRepository.findAll(pageable).stream().map(event -> com.realestate.duediligence.dto.ActivityLogResponse.builder()
                .id(1_000_000 + event.getEventId())
                .activityType(event.getEventType())
                .description(event.getAction())
                .performedBy(event.getUser() != null ? event.getUser().getName() : null)
                .createdAt(event.getCreatedAt())
                .build()
        );
        var reportEvents = reportHistoryRepository.findAll(pageable).stream().map(history -> com.realestate.duediligence.dto.ActivityLogResponse.builder()
                .id(2_000_000 + Math.toIntExact(history.getId()))
                .activityType("REPORT_" + history.getAction())
                .description("Report " + history.getAction().toLowerCase().replace('_', ' '))
                .performedBy(history.getPerformedBy())
                .propertyId(history.getReport().getPropertyId())
                .createdAt(history.getPerformedAt())
                .build()
        );
        return Stream.of(logs, securityEvents, reportEvents)
                .flatMap(stream -> stream)
                .sorted(Comparator.comparing(com.realestate.duediligence.dto.ActivityLogResponse::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(50)
                .toList();
    }
}
