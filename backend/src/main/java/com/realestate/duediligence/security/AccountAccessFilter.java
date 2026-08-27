package com.realestate.duediligence.security;

import java.io.IOException;
import java.util.Set;

import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.realestate.duediligence.enums.AccountStatus;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/** Blocks unapproved accounts from business APIs while retaining profile/status access. */
@Component
public class AccountAccessFilter extends OncePerRequestFilter {
    private static final Set<String> PENDING_ALLOWED_PATHS = Set.of(
            "/api/users/profile", "/api/role-request", "/api/profile/complete");

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails details
                && details.getUser().getRole().name().equals("ADMIN") == false
                && details.getUser().getStatus() != AccountStatus.ACTIVE
                && !PENDING_ALLOWED_PATHS.contains(request.getRequestURI())) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Account approval is required");
            return;
        }
        filterChain.doFilter(request, response);
    }
}
