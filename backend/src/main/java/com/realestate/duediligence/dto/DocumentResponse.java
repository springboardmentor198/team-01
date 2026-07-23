package com.realestate.duediligence.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponse {

    private Integer id;
    private Integer propertyId;
    private String documentName;
    private String documentType;
    private String fileUrl;
    private LocalDateTime uploadedAt;
}