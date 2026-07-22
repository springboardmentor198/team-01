package com.realestate.duediligence.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "ownership_records")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OwnershipRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ownership_id")
    private Integer ownershipId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(name = "owner_name", nullable = false)
    private String ownerName;

    @Column(name = "owner_type")
    private String ownerType;

    @Column(name = "registration_number", unique = true)
    private String registrationNumber;

    @Column(name = "is_verified")
    private Boolean verified;

    @Column(name = "ownership_start_date")
    private LocalDateTime ownershipStartDate;

    @Column(name = "ownership_end_date")
    private LocalDateTime ownershipEndDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}