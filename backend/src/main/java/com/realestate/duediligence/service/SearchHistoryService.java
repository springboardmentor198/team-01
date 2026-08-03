package com.realestate.duediligence.service;

import java.util.List;

import com.realestate.duediligence.dto.RecentSearchResponse;
import com.realestate.duediligence.dto.SearchHistoryRequest;

public interface SearchHistoryService {

    RecentSearchResponse recordSearch(String email, SearchHistoryRequest request);

    List<RecentSearchResponse> getRecentSearches(String email, int limit);

    List<RecentSearchResponse> getRecentSearches(int limit);
}

