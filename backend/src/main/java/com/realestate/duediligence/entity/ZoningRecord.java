package com.realestate.duediligence.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "zoning_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ZoningRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(name = "zone_type")
    private String zoneType;

    @Column(name = "land_use")
    private String landUse;

    @Column(name = "far")
    private String far;

    @Column(name = "building_height")
    private String buildingHeight;

    @Column(columnDefinition = "TEXT")
    private String restrictions;

    @Column(name = "compliance_status")
    private String complianceStatus;

    @Column(name = "zoning_risk")
    private String zoningRisk;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
