package com.example.cart.presentation;

import com.example.cart.application.WishlistService;
import com.example.cart.application.dto.WishlistItemResponse;
import com.example.cart.presentation.dto.AddWishlistItemRequest;
import com.example.cart.presentation.dto.ApiResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {
    private final WishlistService wishlistService;
    private final UserIdentity userIdentity;

    @GetMapping
    public ResponseEntity<ApiResponse<List<WishlistItemResponse>>> list(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) Long xUserId) {
        Long userId = requireUser(authHeader, xUserId);
        return ResponseEntity.ok(ApiResponse.success(wishlistService.list(userId)));
    }

    @GetMapping("/items")
    public ResponseEntity<ApiResponse<List<WishlistItemResponse>>> items(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) Long xUserId) {
        return list(authHeader, xUserId);
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<List<WishlistItemResponse>>> add(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) Long xUserId,
            @Valid @RequestBody AddWishlistItemRequest request) {
        Long userId = requireUser(authHeader, xUserId);
        return ResponseEntity.ok(ApiResponse.success(wishlistService.add(userId, request.productId())));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<ApiResponse<List<WishlistItemResponse>>> remove(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) Long xUserId,
            @PathVariable Long productId) {
        Long userId = requireUser(authHeader, xUserId);
        return ResponseEntity.ok(ApiResponse.success(wishlistService.remove(userId, productId)));
    }

    @GetMapping("/check/{productId}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> check(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestHeader(value = "X-User-Id", required = false) Long xUserId,
            @PathVariable Long productId) {
        Long userId = requireUser(authHeader, xUserId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("isWishlisted", wishlistService.isWishlisted(userId, productId))));
    }

    private Long requireUser(String authHeader, Long xUserId) {
        Long userId = userIdentity.resolve(authHeader, xUserId);
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User identity required");
        }
        return userId;
    }
}
