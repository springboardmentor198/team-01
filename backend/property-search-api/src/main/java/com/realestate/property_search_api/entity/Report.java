package com.realestate.property_search_api.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;

    @Column(name = "assessment_id", nullable = false)
    private Long assessmentId;

    @Column(name = "report_name", length = 150)
    private String reportName;

    @Column(name = "report_url", columnDefinition = "TEXT")
    private String reportUrl;

    @Column(name = "generated_at", insertable = false, updatable = false)
    private LocalDateTime generatedAt;
}
