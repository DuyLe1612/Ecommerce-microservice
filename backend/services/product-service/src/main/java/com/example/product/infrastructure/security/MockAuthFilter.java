package com.example.product.infrastructure.security;

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
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Mock auth filter for development/testing.
 * Accepts "Bearer mock-user-{userId}-{role}" tokens.
 * In production, replace with real JWT filter.
 */
@Component
public class MockAuthFilter extends OncePerRequestFilter {
    
    private static final Pattern MOCK_TOKEN = Pattern.compile("mock-user-(\\d+)-(\\w+)");
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer mock-user-")) {
            String token = authHeader.substring(7);
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
        }
        
        filterChain.doFilter(request, response);
    }
}
