package com.realestate.duediligence.dto;
import lombok.*; import java.time.LocalDateTime;
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationResponse { private String type; private String title; private String message; private LocalDateTime createdAt; }
