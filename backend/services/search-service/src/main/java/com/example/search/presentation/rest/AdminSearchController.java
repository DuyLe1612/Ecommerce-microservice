package com.example.search.presentation.rest;

import com.example.search.application.command.ReindexAllCommand;
import com.example.search.application.command.ReindexAllCommandHandler;
import com.example.search.application.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/search")
@RequiredArgsConstructor
public class AdminSearchController {

    private final ReindexAllCommandHandler reindexAllCommandHandler;

    @PostMapping("/reindex")
    public ApiResponse<String> reindex() {
        int count = reindexAllCommandHandler.execute(new ReindexAllCommand());
        return ApiResponse.success("Reindexed " + count + " products");
    }
}
