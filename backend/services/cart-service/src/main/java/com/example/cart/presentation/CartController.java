package com.example.cart.presentation;

import com.example.cart.application.CartService;
import com.example.cart.application.dto.CartResponse;
import com.example.cart.presentation.dto.AddCartItemRequest;
import com.example.cart.presentation.dto.ApiResponse;
import com.example.cart.presentation.dto.UpdateCartItemRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {
    private final CartService cartService;
    private final UserIdentity userIdentity;

    @GetMapping
    public ResponseEntity<ApiResponse<CartResponse>> getCart(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId) {
        String userId = requireUser(authHeader, xUserId);
        return ResponseEntity.ok(ApiResponse.success(cartService.getCart(userId)));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId) {
        String userId = requireUser(authHeader, xUserId);
        cartService.clear(userId);
        return ResponseEntity.ok(ApiResponse.success(null));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartResponse>> addItem(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @Valid @RequestBody AddCartItemRequest request) {
        String userId = requireUser(authHeader, xUserId);
        return ResponseEntity.ok(ApiResponse.success(cartService.addItem(userId, request.variantId(), request.quantity())));
    }

    @PutMapping("/items/{variantId}")
    public ResponseEntity<ApiResponse<CartResponse>> updateItem(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @PathVariable Long variantId,
            @Valid @RequestBody UpdateCartItemRequest request) {
        String userId = requireUser(authHeader, xUserId);
        return ResponseEntity.ok(ApiResponse.success(cartService.updateItem(userId, variantId, request.quantity())));
    }

    @DeleteMapping("/items/{variantId}")
    public ResponseEntity<ApiResponse<CartResponse>> removeItem(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @PathVariable Long variantId) {
        String userId = requireUser(authHeader, xUserId);
        return ResponseEntity.ok(ApiResponse.success(cartService.removeItem(userId, variantId)));
    }

    private String requireUser(String authHeader, String xUserId) {
        String userId = userIdentity.resolve(authHeader, xUserId);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User identity required");
        }
        return userId;
    }
}
