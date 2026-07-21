package com.realestate.duediligence.dto;

<<<<<<< HEAD
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
=======
>>>>>>> upstream/develop
import lombok.Data;

@Data
public class ForgotPasswordRequest {
<<<<<<< HEAD
    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email address")
    private String email;
}
=======

    private String email;

}
>>>>>>> upstream/develop
