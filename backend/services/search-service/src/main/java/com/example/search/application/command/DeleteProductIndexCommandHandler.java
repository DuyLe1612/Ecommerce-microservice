package com.example.search.application.command;

import com.example.search.domain.repository.ProductSearchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeleteProductIndexCommandHandler {

    private final ProductSearchRepository repository;

    public void execute(DeleteProductIndexCommand command) {
        repository.deleteById(command.getProductId());
        log.info("Deleted product index: {}", command.getProductId());
    }
}
