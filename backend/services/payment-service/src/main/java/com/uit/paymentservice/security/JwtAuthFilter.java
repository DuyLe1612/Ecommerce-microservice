package com.uit.paymentservice.security;

import com.uit.paymentservice.infrastructure.external.AuthServiceClient;
import com.uit.paymentservice.infrastructure.external.AuthServiceClient.AuthResult;
import com.uit.paymentservice.infrastructure.external.MockAuthServiceClient.AuthenticationException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    private final AuthServiceClient authServiceClient;

    public JwtAuthFilter(AuthServiceClient authServiceClient) {
        this.authServiceClient = authServiceClient;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                   FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        String bearerToken = authHeader.substring(7);

        try {
            AuthResult authResult = authServiceClient.validateTokenAndGetUser(bearerToken);
            UserContext userContext = new UserContext(authResult.userId(), authResult.email(), authResult.role());

            List<SimpleGrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + authResult.role())
            );

            UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(userContext, null, authorities);
            SecurityContextHolder.getContext().setAuthentication(authentication);

            log.debug("Authenticated user: userId={}, role={}", authResult.userId(), authResult.role());
        } catch (AuthenticationException e) {
            log.warn("Authentication failed: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"" + e.getMessage() + "\"}");
            return;
        } catch (Exception e) {
            log.error("Authentication error: {}", e.getMessage());
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Authentication failed\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/api/payment/gateways") ||
               path.startsWith("/api/payment/callback") ||
               path.startsWith("/api/payment/vnpay") ||
               path.startsWith("/actuator");
    }
}
