package com.realestate.duediligence.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.realestate.duediligence.entity.Conversation;

public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    Optional<Conversation> findByPropertyIdAndBuyerId(
            Long propertyId,
            Long buyerId
    );

    List<Conversation> findByBuyerIdOrOwnerIdOrderByLastMessageAtDesc(
            Long buyerId,
            Long ownerId
    );
}