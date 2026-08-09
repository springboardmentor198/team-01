package com.realestate.duediligence.controller;

import java.security.Principal;
import java.time.Instant;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;

import com.realestate.duediligence.dto.ChatDtos.*;
import com.realestate.duediligence.dto.ChatDtos.MessageHistoryRequest;
import com.realestate.duediligence.dto.ChatDtos.MessageHistoryResponse;
import com.realestate.duediligence.dto.ChatDtos.ReadReceipt;
import com.realestate.duediligence.dto.ChatDtos.ReadRequest;
import com.realestate.duediligence.dto.ChatDtos.SendMessageRequest;
import com.realestate.duediligence.dto.ChatDtos.StartConversationRequest;
import com.realestate.duediligence.dto.ChatDtos.StatusUpdateRequest;
import com.realestate.duediligence.dto.ChatDtos.TypingBroadcast;
import com.realestate.duediligence.dto.ChatDtos.TypingEvent;
import com.realestate.duediligence.entity.Conversation;
import com.realestate.duediligence.entity.ConversationStatus;
import com.realestate.duediligence.entity.Message;
import com.realestate.duediligence.repository.ConversationRepository;
import com.realestate.duediligence.repository.MessageRepository;

@Controller
public class ChatController {

    private final ConversationRepository conversations;
    private final MessageRepository messages;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(
            ConversationRepository conversations,
            MessageRepository messages,
            SimpMessagingTemplate messagingTemplate) {

        this.conversations = conversations;
        this.messages = messages;
        this.messagingTemplate = messagingTemplate;
    }

    // Principal.getName() contains the numeric user ID
    private Long userId(Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new IllegalStateException("User not authenticated");
        }

        return Long.parseLong(principal.getName());
    }

    @MessageMapping("/conversations.list")
    @SendToUser("/queue/conversations.list")
    public Iterable<Conversation> listConversations(Principal principal) {

        Long uid = userId(principal);

        return conversations.findByBuyerIdOrOwnerIdOrderByLastMessageAtDesc(
                uid,
                uid
        );
    }

    @MessageMapping("/conversations.start")
    public void startConversation(
            StartConversationRequest req,
            Principal principal) {

        Long buyerId = userId(principal);

        Conversation convo =
                conversations.findByPropertyIdAndBuyerId(
                        req.propertyId(),
                        buyerId
                ).orElseGet(() -> {

                    Conversation c = new Conversation();

                    c.setPropertyId(req.propertyId());
                    c.setBuyerId(buyerId);
                    c.setOwnerId(req.ownerId());

                    return conversations.save(c);
                });

        messagingTemplate.convertAndSendToUser(
                String.valueOf(buyerId),
                "/queue/conversations.new",
                convo
        );

        messagingTemplate.convertAndSendToUser(
                String.valueOf(req.ownerId()),
                "/queue/conversations.new",
                convo
        );
    }

    @MessageMapping("/messages.history")
    @SendToUser("/queue/messages.history")
    public MessageHistoryResponse getMessages(
            MessageHistoryRequest req,
            Principal principal) {

        assertParticipant(req.conversationId(), principal);

        return new MessageHistoryResponse(
                req.conversationId(),
                messages.findByConversationIdOrderBySentAtAsc(
                        req.conversationId()
                )
        );
    }

    @MessageMapping("/chat.send")
    public void sendMessage(
            SendMessageRequest req,
            Principal principal) {

        Long senderId = userId(principal);

        Conversation convo =
                assertParticipant(req.conversationId(), principal);

        Message message = new Message();

        message.setConversationId(req.conversationId());
        message.setSenderId(senderId);
        message.setBody(req.body());
        message.setSentAt(Instant.now());

        messages.save(message);

        convo.setLastMessageAt(message.getSentAt());

        if (convo.getStatus() == ConversationStatus.INQUIRY) {
            convo.setStatus(ConversationStatus.CHATTING);
        }

        conversations.save(convo);

        messagingTemplate.convertAndSend(
                "/topic/conversation." + req.conversationId(),
                message
        );

        Long otherId =
                senderId.equals(convo.getBuyerId())
                        ? convo.getOwnerId()
                        : convo.getBuyerId();

        messagingTemplate.convertAndSendToUser(
                String.valueOf(otherId),
                "/queue/conversations.updated",
                convo
        );
    }

    @MessageMapping("/chat.typing")
    public void typing(
            TypingEvent event,
            Principal principal) {

        messagingTemplate.convertAndSend(
                "/topic/conversation."
                        + event.conversationId()
                        + ".typing",
                new TypingBroadcast(
                        principal.getName(),
                        event.typing()
                )
        );
    }

    @MessageMapping("/chat.read")
    public void markRead(
            ReadRequest req,
            Principal principal) {

        Long readerId = userId(principal);

        assertParticipant(req.conversationId(), principal);

        messages.markReadForOthers(
                req.conversationId(),
                readerId,
                Instant.now()
        );

        messagingTemplate.convertAndSend(
                "/topic/conversation."
                        + req.conversationId()
                        + ".read",
                new ReadReceipt(
                        req.conversationId(),
                        readerId
                )
        );
    }

    @MessageMapping("/chat.status")
    public void updateStatus(
            StatusUpdateRequest req,
            Principal principal) {

        Conversation convo =
                conversations.findById(req.conversationId())
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "conversation_not_found"
                                ));

        Long uid = userId(principal);

        if (!convo.getOwnerId().equals(uid)) {
            throw new IllegalStateException("not_authorized");
        }

        convo.setStatus(
                ConversationStatus.valueOf(
                        req.status()
                )
        );

        conversations.save(convo);

        messagingTemplate.convertAndSend(
                "/topic/conversation."
                        + req.conversationId(),
                convo
        );
    }

    private Conversation assertParticipant(
            Long conversationId,
            Principal principal) {

        Conversation convo =
                conversations.findById(conversationId)
                        .orElseThrow(() ->
                                new IllegalStateException(
                                        "conversation_not_found"
                                ));

        Long uid = userId(principal);

        if (!convo.getBuyerId().equals(uid)
                && !convo.getOwnerId().equals(uid)) {

            throw new IllegalStateException(
                    "not_authorized"
            );
        }

        return convo;
    }
}