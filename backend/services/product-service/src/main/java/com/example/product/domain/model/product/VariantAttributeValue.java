package com.example.product.domain.model.product;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class VariantAttributeValue {
    private final Long attributeId;
    private final Long valueId;
}
