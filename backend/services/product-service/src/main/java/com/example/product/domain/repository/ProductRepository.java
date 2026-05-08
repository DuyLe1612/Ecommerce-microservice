package com.example.product.domain.repository;

import com.example.product.domain.model.product.Product;
import com.example.product.domain.model.product.ProductId;

import java.util.Optional;

public interface ProductRepository {
    void save(Product product);
    Optional<Product> findById(ProductId id);
    void delete(ProductId id);
}
