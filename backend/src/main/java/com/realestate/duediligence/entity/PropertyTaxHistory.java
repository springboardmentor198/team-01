package com.realestate.duediligence.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "property_tax_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyTaxHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "tax_history_id")
    private Long taxHistoryId;

    @ManyToOne
    @JoinColumn(name = "property_id", nullable = false)
    private Property property;

    @Column(name = "tax_year", nullable = false)
    private Integer taxYear;

    @Column(name = "assessed_value")
    private BigDecimal assessedValue;

    @Column(name = "tax_amount")
    private BigDecimal taxAmount;

    @Column(name = "payment_status")
    private String paymentStatus;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "payment_date")
    private LocalDate paymentDate;
}
