package com.realestate.duediligence.service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.realestate.duediligence.dto.RecentSearchResponse;
import com.realestate.duediligence.dto.SearchHistoryRequest;
import com.realestate.duediligence.entity.Property;
import com.realestate.duediligence.entity.RiskSummary;
import com.realestate.duediligence.entity.SearchHistory;
import com.realestate.duediligence.entity.User;
import com.realestate.duediligence.repository.PropertyRepository;
import com.realestate.duediligence.repository.RiskSummaryRepository;
import com.realestate.duediligence.repository.SearchHistoryRepository;
import com.realestate.duediligence.repository.UserRepository;

@Service
public class SearchHistoryServiceImpl implements SearchHistoryService {

    private final SearchHistoryRepository searchHistoryRepository;
    private final UserRepository userRepository;
    private final PropertyRepository propertyRepository;
    private final RiskSummaryRepository riskSummaryRepository;

    public SearchHistoryServiceImpl(
            SearchHistoryRepository searchHistoryRepository,
            UserRepository userRepository,
            PropertyRepository propertyRepository,
            RiskSummaryRepository riskSummaryRepository) {
        this.searchHistoryRepository = searchHistoryRepository;
        this.userRepository = userRepository;
        this.propertyRepository = propertyRepository;
        this.riskSummaryRepository = riskSummaryRepository;
    }

    @Override
    @Transactional
    public RecentSearchResponse recordSearch(String email, SearchHistoryRequest request) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Property property = resolveMatchingProperty(request);

        String searchQuery = buildSearchQuery(request, property);

        String propertyType = request.getPropertyType();
        String status = request.getStatus();
        String riskLevel = request.getRisk();

        if (property != null) {
            if (propertyType == null || propertyType.isBlank()) {
                propertyType = property.getPropertyType();
            }
            if (status == null || status.isBlank()) {
                status = property.getStatus();
            }
            if (riskLevel == null || riskLevel.isBlank()) {
                riskLevel = riskSummaryRepository
                        .findByProperty_PropertyId(property.getPropertyId())
                        .map(RiskSummary::getOverallRisk)
                        .orElse(null);
            }
        }

        SearchHistory history = SearchHistory.builder()
                .user(user)
                .searchQuery(searchQuery)
                .propertyType(propertyType)
                .city(request.getCity())
                .riskLevel(riskLevel)
                .status(status)
                .property(property)
                .searchedAt(LocalDateTime.now())
                .build();

        SearchHistory saved = searchHistoryRepository.save(history);

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecentSearchResponse> getRecentSearches(String email, int limit) {

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return List.of();
        }

        List<SearchHistory> records = searchHistoryRepository
                .findByUser_UserIdOrderBySearchedAtDesc(
                        user.getUserId(),
                        PageRequest.of(0, limit));

        return records.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecentSearchResponse> getRecentSearches(int limit) {

        return searchHistoryRepository
                .findAllByOrderBySearchedAtDesc(PageRequest.of(0, limit))
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private RecentSearchResponse toResponse(SearchHistory history) {

        Property property = history.getProperty();
        if (property == null) {
            property = resolveMatchingProperty(SearchHistoryRequest.builder()
                    .query(extractPrimaryQuery(history.getSearchQuery()))
                    .city(history.getCity())
                    .propertyType(history.getPropertyType())
                    .status(history.getStatus())
                    .risk(history.getRiskLevel())
                    .build());
        }

        RiskSummary risk = null;
        if (property != null) {
            risk = riskSummaryRepository
                    .findByProperty_PropertyId(property.getPropertyId())
                    .orElse(null);
        }

        String riskLevel = history.getRiskLevel();
        if ((riskLevel == null || riskLevel.isBlank()) && risk != null) {
            riskLevel = risk.getOverallRisk();
        }

        String propertyType = history.getPropertyType();
        String status = history.getStatus();

        if (property != null) {
            if (propertyType == null || propertyType.isBlank()) {
                propertyType = property.getPropertyType();
            }
            if (status == null || status.isBlank()) {
                status = property.getStatus();
            }
        }

        String propertyName = formatSearchDisplayName(history, property);

        User user = history.getUser();

        return RecentSearchResponse.builder()
                .searchId(history.getSearchId())
                .userId(user != null ? user.getUserId() : null)
                .userName(user != null ? user.getName() : null)
                .userEmail(user != null ? user.getEmail() : null)
                .property(propertyName)
                .propertyType(propertyType)
                .risk(riskLevel != null && !riskLevel.isBlank() ? riskLevel : "Unrated")
                .status(status)
                .query(history.getSearchQuery())
                .city(history.getCity() != null ? history.getCity()
                        : property != null ? property.getCity() : null)
                .propertyId(property != null ? property.getPropertyId() : null)
                .searchedAt(history.getSearchedAt())
                .build();
    }

    private Property resolveMatchingProperty(SearchHistoryRequest request) {
        if (request.getPropertyId() != null) {
            return propertyRepository.findById(request.getPropertyId()).orElse(null);
        }

        if (isCityOnlySearch(request)) {
            return null;
        }

        String term = request.getQuery();
        if (term == null || term.isBlank()) {
            return null;
        }

        return pickBestMatch(
                propertyRepository.searchByTerm(term.trim()),
                request);
    }

    private Property pickBestMatch(List<Property> candidates, SearchHistoryRequest request) {
        if (candidates == null || candidates.isEmpty()) {
            return null;
        }

        List<Property> filtered = candidates.stream()
                .filter(property -> matchesOptionalFilter(request.getCity(), property.getCity()))
                .filter(property -> matchesOptionalFilter(request.getPropertyType(), property.getPropertyType()))
                .filter(property -> matchesOptionalFilter(request.getStatus(), property.getStatus()))
                .filter(property -> matchesRiskFilter(request.getRisk(), property))
                .toList();

        List<Property> pool = filtered.isEmpty() ? candidates : filtered;
        String term = request.getQuery() != null
                ? request.getQuery().trim().toLowerCase()
                : "";

        return pool.stream()
                .min(Comparator
                        .comparing((Property property) -> rankMatch(term, property)))
                .orElse(pool.get(0));
    }

    private int rankMatch(String term, Property property) {
        if (term.isBlank()) {
            return 0;
        }

        String title = safeLower(property.getPropertyCode());
        String address = safeLower(property.getAddress());

        if (title.equals(term) || address.equals(term)) {
            return 0;
        }
        if (title.startsWith(term) || address.startsWith(term)) {
            return 1;
        }
        if (title.contains(term) || address.contains(term)) {
            return 2;
        }
        return 3;
    }

    private boolean matchesOptionalFilter(String filter, String value) {
        if (filter == null || filter.isBlank()) {
            return true;
        }
        return value != null && value.equalsIgnoreCase(filter);
    }

    private boolean matchesRiskFilter(String riskFilter, Property property) {
        if (riskFilter == null || riskFilter.isBlank()) {
            return true;
        }

        return riskSummaryRepository
                .findByProperty_PropertyId(property.getPropertyId())
                .map(risk -> risk.getOverallRisk() != null
                        && risk.getOverallRisk().equalsIgnoreCase(riskFilter))
                .orElse(false);
    }

    private String buildSearchQuery(SearchHistoryRequest request, Property property) {
        StringBuilder query = new StringBuilder();
        String trimmedQuery = request.getQuery() != null ? request.getQuery().trim() : "";
        String trimmedCity = request.getCity() != null ? request.getCity().trim() : "";

        if (!trimmedQuery.isBlank()) {
            query.append(trimmedQuery);
        }

        if (!trimmedCity.isBlank() && !trimmedQuery.equalsIgnoreCase(trimmedCity)) {
            if (query.length() > 0) {
                query.append(", ");
            }
            query.append(trimmedCity);
        }

        if (query.length() > 0) {
            return query.toString();
        }

        if (!trimmedCity.isBlank()) {
            return trimmedCity;
        }

        if (property != null) {
            return formatPropertyDisplayName(property);
        }

        return "General Search";
    }

    private String formatSearchDisplayName(SearchHistory history, Property property) {
        if (property != null) {
            return formatPropertyDisplayName(property);
        }

        String city = history.getCity() != null ? history.getCity().trim() : "";
        String primaryQuery = extractPrimaryQuery(history.getSearchQuery());

        if (!city.isBlank()
                && (primaryQuery == null
                        || primaryQuery.isBlank()
                        || primaryQuery.equalsIgnoreCase(city))) {
            return "Properties in " + city;
        }

        if (primaryQuery != null && !primaryQuery.isBlank()) {
            return primaryQuery;
        }

        return city.isBlank() ? "General Search" : "Properties in " + city;
    }

    private boolean isCityOnlySearch(SearchHistoryRequest request) {
        String city = request.getCity() != null ? request.getCity().trim() : "";
        String query = request.getQuery() != null ? request.getQuery().trim() : "";

        if (city.isBlank()) {
            return false;
        }

        return query.isBlank() || query.equalsIgnoreCase(city);
    }

    private String formatPropertyDisplayName(Property property) {
        if (property == null) {
            return null;
        }

        String title = property.getPropertyCode();
        String address = property.getAddress();
        String city = property.getCity();

        if (title != null && !title.isBlank()) {
            if (address != null && !address.isBlank()
                    && !address.equalsIgnoreCase(title)) {
                if (city != null && !city.isBlank()) {
                    return title + " — " + address + ", " + city;
                }
                return title + " — " + address;
            }
            if (city != null && !city.isBlank()) {
                return title + ", " + city;
            }
            return title;
        }

        if (address != null && !address.isBlank()) {
            if (city != null && !city.isBlank()) {
                return address + ", " + city;
            }
            return address;
        }

        return null;
    }

    private String extractPrimaryQuery(String searchQuery) {
        if (searchQuery == null || searchQuery.isBlank()) {
            return null;
        }

        String primary = searchQuery;
        int commaIndex = searchQuery.indexOf(',');
        if (commaIndex > 0) {
            primary = searchQuery.substring(0, commaIndex).trim();
        } else {
            primary = searchQuery.trim();
        }

        return primary.isBlank() ? null : primary;
    }

    private String safeLower(String value) {
        return value == null ? "" : value.toLowerCase();
    }
}
