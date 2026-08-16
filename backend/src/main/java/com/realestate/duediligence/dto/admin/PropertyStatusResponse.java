package com.realestate.duediligence.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PropertyStatusResponse {
    private Long approved;
    private Long pending;
    private Long rejected;
    private Long underReview;
}
