package com.realestate.duediligence.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "flood_zone_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FloodZoneRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(name = "zone")
    private String zone;

    @Column(name = "risk_level")
    private String riskLevel;

    @Column(name = "elevation")
    private String elevation;

    @Column(name = "fema_classification")
    private String femaClassification;

    @Column(name = "insurance_required")
    private Boolean insuranceRequired;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
