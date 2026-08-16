package com.realestate.duediligence.service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.RoleRequest;
import com.realestate.duediligence.entity.SupportTicket;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.enums.AccountStatus;
import com.realestate.duediligence.enums.Role;
import com.realestate.duediligence.enums.TicketStatus;
import com.realestate.duediligence.repository.ActivityLogRepository;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.RoleRequestRepository;
import com.realestate.duediligence.repository.SupportTicketRepository;
import com.realestate.duediligence.repository.UserRepository;

/** Builds the admin dashboard entirely from persisted platform data. */
@Service
@Transactional(readOnly = true)
public class AdminDashboardService {

    private static final List<Role> PROFESSIONAL_ROLES = List.of(Role.AGENT, Role.LEGAL_REVIEWER, Role.BANK);

    private final UserRepository userRepository;
    private final RoleRequestRepository roleRequestRepository;
    private final PropertyRepository propertyRepository;
    private final SupportTicketRepository supportTicketRepository;
    private final ActivityLogRepository activityLogRepository;

    public AdminDashboardService(UserRepository userRepository, RoleRequestRepository roleRequestRepository,
            PropertyRepository propertyRepository, SupportTicketRepository supportTicketRepository,
            ActivityLogRepository activityLogRepository) {
        this.userRepository = userRepository;
        this.roleRequestRepository = roleRequestRepository;
        this.propertyRepository = propertyRepository;
        this.supportTicketRepository = supportTicketRepository;
        this.activityLogRepository = activityLogRepository;
    }

    public Map<String, Object> getDashboard() {
        List<User> users = userRepository.findAll();
        List<RoleRequest> roleRequests = roleRequestRepository.findAll();
        List<Property> properties = propertyRepository.findAll();
        List<SupportTicket> tickets = supportTicketRepository.findAll();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("stats", buildStats(users, roleRequests, tickets));
        response.put("activity", buildActivity(users, properties));
        response.put("verification", buildVerification(roleRequests));
        response.put("professionals", buildProfessionals(users));
        response.put("support", buildSupport(tickets));
        response.put("recentProperties", buildRecentProperties());
        response.put("recentActivity", buildRecentActivity());
        return response;
    }

    /**
     * Supplies persisted data for the reusable admin-management screens. Pages
     * without a backing domain model deliberately receive empty rows and zero
     * counts instead of sample records.
     */
    public Map<String, Object> getWorkspace(String pageKey) {
        List<User> users = userRepository.findAll();
        List<RoleRequest> requests = roleRequestRepository.findAll();
        List<Property> properties = propertyRepository.findAll();
        List<SupportTicket> tickets = supportTicketRepository.findAll();
        Map<String, Object> response = new LinkedHashMap<>();

        switch (pageKey) {
            case "property-approvals", "properties" -> {
                response.put("rows", propertyRows(properties));
                response.put("stats", propertyStats(properties, "property-approvals".equals(pageKey)));
            }
            case "advisor-verifications" -> {
                response.put("rows", requestRows(requests));
                response.put("stats", verificationStats(requests));
            }
            case "users" -> {
                response.put("rows", userRows(users));
                response.put("stats", userStats(users, "Total Users"));
            }
            case "agents" -> workspaceForRole(response, users, Role.AGENT, "Agents");
            case "legal-advisors" -> workspaceForRole(response, users, Role.LEGAL_REVIEWER, "Legal Advisors");
            case "financial-institutions" -> workspaceForRole(response, users, Role.BANK, "Financial Institutions");
            case "activity-analytics", "reports" -> {
                response.put("rows", activityRows());
                response.put("stats", List.of(stat("Recorded Activities", activityLogRepository.count()),
                        stat("Properties", properties.size()), stat("Verifications", requests.size()),
                        stat("Support Tickets", tickets.size())));
            }
            // Transactions, enquiries, bookings, and security events have no persisted
            // domain model yet. Returning an empty response keeps their UI truthful.
            default -> {
                response.put("rows", List.of());
                response.put("stats", List.of(stat("Total Records", 0), stat("Pending", 0),
                        stat("Completed", 0), stat("Rejected", 0)));
            }
        }
        return response;
    }

    private void workspaceForRole(Map<String, Object> response, List<User> users, Role role, String label) {
        List<User> matchingUsers = users.stream().filter(user -> user.getRole() == role).toList();
        response.put("rows", userRows(matchingUsers));
        response.put("stats", userStats(matchingUsers, "Total " + label));
    }

    private List<Map<String, Object>> propertyRows(List<Property> properties) {
        return properties.stream().map(property -> Map.<String, Object>of("id", property.getPropertyId(),
                "name", valueOr(property.getPropertyCode(), "Untitled property"),
                "owner", valueOr(property.getOwnerName(), property.getOwner() == null ? "" : property.getOwner().getName()),
                "location", location(property), "type", valueOr(property.getPropertyType(), ""),
                "amount", property.getEstimatedPrice() == null ? "" : property.getEstimatedPrice().toPlainString(),
                "date", property.getCreatedAt() == null ? "" : property.getCreatedAt().toString(),
                "status", valueOr(property.getStatus(), ""))).toList();
    }

    private List<Map<String, Object>> userRows(List<User> users) {
        return users.stream().map(user -> Map.<String, Object>of("id", user.getUserId(),
                "name", valueOr(user.getName(), "Unnamed user"), "email", valueOr(user.getEmail(), ""),
                "role", user.getRole() == null ? "" : user.getRole().name(),
                "detail", valueOr(user.getLocation(), ""), "date", user.getCreatedAt() == null ? "" : user.getCreatedAt().toString(),
                "status", user.getStatus() == null ? "" : user.getStatus().name())).toList();
    }

    private List<Map<String, Object>> requestRows(List<RoleRequest> requests) {
        return requests.stream().map(request -> Map.<String, Object>of("id", request.getId(),
                "name", request.getUser() == null ? "Unnamed user" : valueOr(request.getUser().getName(), "Unnamed user"),
                "email", request.getUser() == null ? "" : valueOr(request.getUser().getEmail(), ""),
                "role", request.getRequestedRole() == null ? "" : request.getRequestedRole().name(),
                "detail", valueOr(request.getYearsOfExperience() == null ? "" : request.getYearsOfExperience() + " years", ""),
                "date", request.getCreatedAt() == null ? "" : request.getCreatedAt().toString(),
                "status", request.getStatus() == null ? "" : request.getStatus().name())).toList();
    }

    private List<Map<String, Object>> activityRows() {
        return activityLogRepository.findAll(PageRequest.of(0, 100, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent().stream()
                .map(activity -> Map.<String, Object>of("id", activity.getActivityId(),
                        "name", valueOr(activity.getDescription(), ""), "owner", valueOr(activity.getPerformedBy(), ""),
                        "type", valueOr(activity.getActivityType(), ""), "date", activity.getCreatedAt() == null ? "" : activity.getCreatedAt().toString(),
                        "status", "")).toList();
    }

    private List<Map<String, Object>> propertyStats(List<Property> properties, boolean approvals) {
        long pending = properties.stream().filter(property -> "PENDING".equalsIgnoreCase(property.getStatus())).count();
        long approved = properties.stream().filter(property -> "APPROVED".equalsIgnoreCase(property.getStatus())).count();
        long rejected = properties.stream().filter(property -> "REJECTED".equalsIgnoreCase(property.getStatus())).count();
        return List.of(stat("Total Properties", properties.size()), stat(approvals ? "Pending Approvals" : "Pending", pending),
                stat("Approved", approved), stat("Rejected", rejected));
    }

    private List<Map<String, Object>> verificationStats(List<RoleRequest> requests) {
        return List.of(stat("Total Advisors", requests.size()),
                stat("Pending", requests.stream().filter(request -> request.getStatus() == AccountStatus.PENDING).count()),
                stat("Verified", requests.stream().filter(request -> request.getStatus() == AccountStatus.ACTIVE).count()),
                stat("Rejected", requests.stream().filter(request -> request.getStatus() == AccountStatus.REJECTED).count()));
    }

    private List<Map<String, Object>> userStats(List<User> users, String totalLabel) {
        return List.of(stat(totalLabel, users.size()),
                stat("Active", users.stream().filter(user -> user.getStatus() == AccountStatus.ACTIVE).count()),
                stat("Pending", users.stream().filter(user -> user.getStatus() == AccountStatus.PENDING).count()),
                stat("Rejected", users.stream().filter(user -> user.getStatus() == AccountStatus.REJECTED).count()));
    }

    private Map<String, Object> stat(String label, long value) { return Map.of("label", label, "value", value); }

    private Map<String, Object> buildStats(List<User> users, List<RoleRequest> roleRequests, List<SupportTicket> tickets) {
        long professionals = users.stream().filter(user -> PROFESSIONAL_ROLES.contains(user.getRole())
                && user.getStatus() == AccountStatus.ACTIVE).count();
        long activeUsers = users.stream().filter(user -> user.getStatus() == AccountStatus.ACTIVE).count();
        long pending = roleRequests.stream().filter(request -> request.getStatus() == AccountStatus.PENDING).count();
        long openTickets = tickets.stream().filter(ticket -> ticket.getStatus() != TicketStatus.RESOLVED
                && ticket.getStatus() != TicketStatus.CLOSED).count();

        return Map.of("totalUsers", users.size(), "verifiedProfessionals", professionals,
                "pendingApprovals", pending, "activeUsers", activeUsers, "openTickets", openTickets);
    }

    private Map<String, Object> buildVerification(List<RoleRequest> requests) {
        long approved = requests.stream().filter(request -> request.getStatus() == AccountStatus.ACTIVE).count();
        long pending = requests.stream().filter(request -> request.getStatus() == AccountStatus.PENDING).count();
        long rejected = requests.stream().filter(request -> request.getStatus() == AccountStatus.REJECTED).count();
        return Map.of("approved", approved, "pending", pending, "rejected", rejected);
    }

    private List<Map<String, Object>> buildProfessionals(List<User> users) {
        return List.of(professional("agents", "Property Agents", Role.AGENT, users),
                professional("legal", "Legal Professionals", Role.LEGAL_REVIEWER, users),
                professional("financial", "Financial Institutions", Role.BANK, users));
    }

    private Map<String, Object> professional(String id, String label, Role role, List<User> users) {
        long count = users.stream().filter(user -> user.getRole() == role && user.getStatus() == AccountStatus.ACTIVE).count();
        return Map.of("id", id, "label", label, "count", count);
    }

    private Map<String, Object> buildSupport(List<SupportTicket> tickets) {
        long open = tickets.stream().filter(ticket -> ticket.getStatus() == TicketStatus.OPEN).count();
        long inProgress = tickets.stream().filter(ticket -> ticket.getStatus() == TicketStatus.IN_PROGRESS).count();
        long resolved = tickets.stream().filter(ticket -> ticket.getStatus() == TicketStatus.RESOLVED
                || ticket.getStatus() == TicketStatus.CLOSED).count();
        return Map.of("open", open, "inProgress", inProgress, "resolved", resolved);
    }

    private Map<String, Object> buildActivity(List<User> users, List<Property> properties) {
        Map<String, Object> activity = new LinkedHashMap<>();
        activity.put("last7Days", activitySeries(users, properties, 7, ChronoUnit.DAYS, "EEE"));
        activity.put("last30Days", activitySeries(users, properties, 4, ChronoUnit.WEEKS, "'Week 'w"));
        activity.put("last90Days", activitySeries(users, properties, 3, ChronoUnit.MONTHS, "MMM"));
        return activity;
    }

    private List<Map<String, Object>> activitySeries(List<User> users, List<Property> properties, int periods,
            ChronoUnit unit, String labelPattern) {
        List<Map<String, Object>> result = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int offset = periods - 1; offset >= 0; offset--) {
            LocalDate start = switch (unit) {
                case DAYS -> today.minusDays(offset);
                case WEEKS -> today.minusWeeks(offset).with(java.time.DayOfWeek.MONDAY);
                case MONTHS -> today.minusMonths(offset).withDayOfMonth(1);
                default -> today;
            };
            LocalDate end = switch (unit) {
                case DAYS -> start.plusDays(1);
                case WEEKS -> start.plusWeeks(1);
                case MONTHS -> start.plusMonths(1);
                default -> start.plusDays(1);
            };
            long userCount = users.stream().filter(user -> isWithin(user.getCreatedAt(), start, end)).count();
            long propertyCount = properties.stream().filter(property -> isWithin(property.getCreatedAt(), start, end)).count();
            String label = unit == ChronoUnit.WEEKS ? "Week " + (periods - offset) : start.format(DateTimeFormatter.ofPattern(labelPattern));
            result.add(Map.of("label", label, "users", userCount, "properties", propertyCount));
        }
        return result;
    }

    private boolean isWithin(LocalDateTime dateTime, LocalDate start, LocalDate end) {
        return dateTime != null && !dateTime.toLocalDate().isBefore(start) && dateTime.toLocalDate().isBefore(end);
    }

    private List<Map<String, Object>> buildRecentProperties() {
        return propertyRepository.findAll(PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent().stream()
                .map(property -> Map.<String, Object>of("id", property.getPropertyId(), "name", valueOr(property.getPropertyCode(), "Untitled property"),
                        "location", location(property), "submittedBy", valueOr(property.getOwnerName(), property.getOwner() != null ? property.getOwner().getName() : "Unknown"),
                        "status", valueOr(property.getStatus(), "PENDING"), "submittedAt", property.getCreatedAt() == null ? "" : property.getCreatedAt().toString()))
                .toList();
    }

    private List<Map<String, Object>> buildRecentActivity() {
        return activityLogRepository.findAll(PageRequest.of(0, 5, Sort.by(Sort.Direction.DESC, "createdAt"))).getContent().stream()
                .map(activity -> Map.<String, Object>of("id", activity.getActivityId(), "title", valueOr(activity.getActivityType(), "Platform activity"),
                        "description", valueOr(activity.getDescription(), "No description available"), "performedBy", valueOr(activity.getPerformedBy(), "System"),
                        "createdAt", activity.getCreatedAt() == null ? "" : activity.getCreatedAt().toString()))
                .toList();
    }

    private String location(Property property) {
        return List.of(property.getAddress(), property.getCity(), property.getState()).stream()
                .filter(value -> value != null && !value.isBlank()).reduce((first, second) -> first + ", " + second).orElse("Location unavailable");
    }

    private String valueOr(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
