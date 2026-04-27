package com.example.product.infrastructure.persistence.repository;

import com.example.product.domain.model.product.Product;
import com.example.product.domain.model.product.ProductId;
import com.example.product.domain.repository.ProductRepository;
import com.example.product.infrastructure.persistence.entity.ProductJpaEntity;
import com.example.product.infrastructure.persistence.mapper.ProductMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class ProductRepositoryImpl implements ProductRepository {

    private final SpringDataProductRepository springDataRepository;
    private final ProductMapper productMapper;

    @Override
    @Transactional
    public void save(Product product) {
        ProductJpaEntity entity = productMapper.toEntity(product);
        springDataRepository.save(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Product> findById(ProductId id) {
        return springDataRepository.findById(id.getValue())
                .map(productMapper::toDomain);
    }

    @Override
    @Transactional
    public void delete(ProductId id) {
        springDataRepository.deleteById(id.getValue());
    }
}
