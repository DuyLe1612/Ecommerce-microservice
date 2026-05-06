package com.example.product.domain.repository;

import com.example.product.application.dto.ProductAdminRequest;
import com.example.product.application.dto.ProductImageReorderRequest;
import com.example.product.application.dto.ProductVariantRequest;
import com.example.product.domain.event.ProductEventV1;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface ProductCommandRepository {
    List<?> listProducts();
    Object getProduct(Long id);
    ProductEventV1 createProduct(ProductAdminRequest request);
    ProductEventV1 updateProduct(Long id, ProductAdminRequest request);
    ProductEventV1 deleteProduct(Long id);
    Object uploadImage(Long productId, MultipartFile file, Boolean isPrimary);
    void deleteImage(Long imageId);
    void reorderImages(ProductImageReorderRequest request);
    Object addVariant(ProductVariantRequest request);
    Object updateVariant(Long variantId, ProductVariantRequest request);
    void deleteVariant(Long variantId);
    Object getVariant(Long variantId);
}
