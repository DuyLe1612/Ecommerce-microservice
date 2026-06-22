package com.example.search.application.command;

import com.example.search.domain.model.ProductDocument;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IndexProductCommand {
    private ProductDocument product;
}
