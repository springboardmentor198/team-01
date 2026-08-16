package com.realestate.duediligence.service.admin;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.realestate.duediligence.dto.admin.PlatformActivityResponse;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.Role;
import com.realestate.duediligence.repository.ActivityLogRepository;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.UserRepository;
import com.realestate.duediligence.repository.admin.TransactionRepository;

@Service
@Transactional(readOnly = true)
public class AdminAnalyticsServiceImpl implements AdminAnalyticsService {

    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final TransactionRepository transactionRepository;
    private final ActivityLogRepository activityLogRepository;

    public AdminAnalyticsServiceImpl(
            UserRepository userRepository,
            PropertyRepository propertyRepository,
            TransactionRepository transactionRepository,
            ActivityLogRepository activityLogRepository) {
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.transactionRepository = transactionRepository;
        this.activityLogRepository = activityLogRepository;
    }

    @Override
    public List<PlatformActivityResponse> getUserGrowth(String adminEmail, String period) {
        requireAdmin(adminEmail);
        return aggregate(userRepository.findActivityCountGroupByDate(getSinceDate(period)), period);
    }

    @Override
    public List<PlatformActivityResponse> getPropertyGrowth(String adminEmail, String period) {
        requireAdmin(adminEmail);
        return aggregate(propertyRepository.findActivityCountGroupByDate(getSinceDate(period)), period);
    }

    @Override
    public List<PlatformActivityResponse> getTransactions(String adminEmail, String period) {
        requireAdmin(adminEmail);
        return aggregate(transactionRepository.findActivityCountGroupByDate(getSinceDate(period)), period);
    }

    @Override
    public List<PlatformActivityResponse> getPropertyViews(String adminEmail, String period) {
        requireAdmin(adminEmail);
        return aggregate(activityLogRepository.findActivityCountGroupByDate("PROPERTY_VIEW", getSinceDate(period)), period);
    }

    @Override
    public List<PlatformActivityResponse> getDownloads(String adminEmail, String period) {
        requireAdmin(adminEmail);
        return aggregate(activityLogRepository.findActivityCountGroupByDate("DOCUMENT_DOWNLOADED", getSinceDate(period)), period);
    }

    @Override
    public List<PlatformActivityResponse> getActiveUsers(String adminEmail, String period) {
        requireAdmin(adminEmail);
        return aggregate(activityLogRepository.findActiveUsersCountGroupByDate(getSinceDate(period)), period);
    }

    private List<PlatformActivityResponse> aggregate(List<Object[]> results, String period) {
        LocalDateTime since = getSinceDate(period);
        Map<String, Long> dateMap = new TreeMap<>();
        
        LocalDateTime temp = since;
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        while (temp.isBefore(now) || temp.toLocalDate().isEqual(now.toLocalDate())) {
            dateMap.put(temp.format(formatter), 0L);
            temp = temp.plusDays(1);
        }

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
        return now.minusDays(30);
    }
}
