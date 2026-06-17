package com.uit.orderservice.infrastructure.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Mock auth filter — active until auth-service is production-ready.
 *
 * Accepts two identity sources (in priority order):
 *   1. Authorization: Bearer mock-user-{userId}-{role}
 *   2. X-User-Id: {userId}  (role defaults to CUSTOMER)
 *
 * To migrate to real JWT: replace this filter with a JwtAuthFilter
 * that calls auth-service or validates the JWT locally.
 * No other code needs to change.
 */
@Component
public class MockAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(MockAuthFilter.class);
    private static final Pattern MOCK_TOKEN = Pattern.compile("mock-user-(\\d+)-(\\w+)");

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");
        String xUserId = request.getHeader("X-User-Id");

        if (authHeader != null && authHeader.startsWith("Bearer mock-user-")) {
            String token = authHeader.substring(7);
            Matcher m = MOCK_TOKEN.matcher(token);
            if (m.matches()) {
                Long userId = Long.parseLong(m.group(1));
                String role = m.group(2).toUpperCase();
                setAuthentication("user-" + userId, role);
                log.debug("Mock auth via token: userId={}, role={}", userId, role);
            }
        } else if (xUserId != null && !xUserId.isBlank()) {
            try {
                Long userId = Long.parseLong(xUserId.trim());
                setAuthentication("user-" + userId, "CUSTOMER");
                log.debug("Mock auth via X-User-Id header: userId={}", userId);
            } catch (NumberFormatException e) {
                log.warn("Invalid X-User-Id header value: {}", xUserId);
            }
        }

        filterChain.doFilter(request, response);
    }

    private void setAuthentication(String principal, String role) {
        var auth = new UsernamePasswordAuthenticationToken(
            principal,
            null,
            List.of(new SimpleGrantedAuthority("ROLE_" + role))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
}
