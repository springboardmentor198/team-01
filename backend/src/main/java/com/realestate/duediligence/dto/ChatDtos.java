package com.realestate.duediligence.dto;

import java.util.List;

import com.realestate.duediligence.entity.Message;

public class ChatDtos {

    public record StartConversationRequest(
            Long propertyId,
            Long ownerId
    ) {}

    public record SendMessageRequest(
            Long conversationId,
            String body
    ) {}

    public record MessageHistoryRequest(
            Long conversationId
    ) {}

    public record MessageHistoryResponse(
            Long conversationId,
            List<Message> messages
    ) {}

    public record TypingEvent(
            Long conversationId,
            boolean typing
    ) {}

    public record TypingBroadcast(
            String userId,
            boolean typing
    ) {}

    public record ReadRequest(
            Long conversationId
    ) {}

    public record ReadReceipt(
            Long conversationId,
            Long readerId
    ) {}

    public record StatusUpdateRequest(
            Long conversationId,
            String status
    ) {}
}