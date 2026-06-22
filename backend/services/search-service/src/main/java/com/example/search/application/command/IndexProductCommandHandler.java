package com.example.search.application.command;

import com.example.search.domain.repository.ProductSearchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class IndexProductCommandHandler {

    private final ProductSearchRepository repository;

    public void execute(IndexProductCommand command) {
        repository.save(command.getProduct());
        log.info("Indexed product: {}", command.getProduct().getId());
    }
}
