package com.realestate.duediligence.entity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "conversations", uniqueConstraints = @UniqueConstraint(columnNames = {"property_id", "buyer_id"}))
@Getter
@Setter
@NoArgsConstructor
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "conversation_id")
    private Long id;

    @Column(name = "property_id", nullable = false)
    private Long propertyId;

    @Column(name = "buyer_id", nullable = false)
    private Long buyerId;

    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Enumerated(EnumType.STRING)
    private ConversationStatus status = ConversationStatus.INQUIRY;

    private Instant lastMessageAt = Instant.now();
    private Instant createdAt = Instant.now();
}