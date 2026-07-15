package com.realestate.property_search_api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "search_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "search_id")
    private Long searchId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "search_query", nullable = false, columnDefinition = "TEXT")
    private String searchQuery;

    @Column(name = "searched_at", insertable = false, updatable = false)
    private LocalDateTime searchedAt;
}
