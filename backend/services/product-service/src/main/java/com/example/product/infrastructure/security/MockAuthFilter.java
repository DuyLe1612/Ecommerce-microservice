package com.example.product.infrastructure.security;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Mock auth filter for development/testing.
 * Accepts "Bearer mock-user-{userId}-{role}" tokens.
 * Also decodes standard JWT payload to support real auth-service tokens.
 * In production, replace with real JWT filter.
 */
@Component
public class MockAuthFilter extends OncePerRequestFilter {
    
    private static final Pattern MOCK_TOKEN = Pattern.compile("mock-user-(\\d+)-(\\w+)");
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        String rolesHeader = request.getHeader("X-User-Roles");
        String userIdHeader = request.getHeader("X-User-Id");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (token.startsWith("mock-user-")) {
                Matcher m = MOCK_TOKEN.matcher(token);
                if (m.matches()) {
                    String role = m.group(2).toUpperCase();
                    var auth = new UsernamePasswordAuthenticationToken(
                        "user-" + m.group(1),
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role))
                    );
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }
            } else {
                // Decode standard JWT payload
                try {
                    String[] parts = token.split("\\.");
                    if (parts.length == 3) {
                        String payloadJson = new String(Base64.getUrlDecoder().decode(parts[1]));
                        JsonNode payload = objectMapper.readTree(payloadJson);
                        if (payload.has("sub") && payload.has("role")) {
                            String userId = payload.get("sub").asText();
                            String role = payload.get("role").asText().toUpperCase();
                            var auth = new UsernamePasswordAuthenticationToken(
                                "user-" + userId,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + role))
                            );
                            SecurityContextHolder.getContext().setAuthentication(auth);
                        }
                    }
                } catch (Exception e) {
                    // Ignore decoding failures
                }
            }
        } else if (rolesHeader != null && !rolesHeader.isEmpty()) {
            // Support gateway headers
            String[] roles = rolesHeader.split(",");
            List<SimpleGrantedAuthority> authorities = java.util.Arrays.stream(roles)
                .map(String::trim)
                .map(SimpleGrantedAuthority::new)
                .toList();
                
            String principal = (userIdHeader != null) ? "user-" + userIdHeader : "unknown-user";
            var auth = new UsernamePasswordAuthenticationToken(
                principal,
                null,
                authorities
            );
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        
        filterChain.doFilter(request, response);
    }
}

