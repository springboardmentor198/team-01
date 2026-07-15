package com.realestate.duediligence.entity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
@Entity
@Table(name = "properties")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Property {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "property_id")
    private Integer propertyId;

    @Column(name = "property_code", nullable = false, unique = true)
    private String propertyCode;

    @Column(name = "parcel_id")
    private String parcelId;

    @Column(nullable = false)
    private String address;

    private String city;

    private String country;

    @Column(name = "property_type")
    private String propertyType;

    @Column(name = "land_use")
    private String landUse;

    @Column(name = "lot_size_sqft")
    private BigDecimal lotSizeSqft;

    @Column(name = "year_built")
    private Integer yearBuilt;

    private Integer bedrooms;

    private Integer bathrooms;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    private User owner;

    @Column(name = "owner_name")
    private String ownerName;

    private String status;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}
