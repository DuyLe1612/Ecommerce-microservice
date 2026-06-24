package com.example.cart.presentation;

import com.example.cart.application.CartService;
import com.example.cart.application.dto.CartResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/internal/cart")
@RequiredArgsConstructor
public class InternalCartController {
    private final CartService cartService;

    @GetMapping("/{userId}/snapshot")
    public CartResponse snapshot(@PathVariable String userId) {
        return cartService.snapshot(userId);
    }
}
