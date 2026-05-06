package com.example.product.application.usecase;

import org.springframework.stereotype.Service;
import java.lang.annotation.*;

@Target({ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Service
public @interface UseCase {
}
