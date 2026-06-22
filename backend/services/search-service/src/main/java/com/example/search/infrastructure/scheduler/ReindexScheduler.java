package com.example.search.infrastructure.scheduler;

import com.example.search.application.command.ReindexAllCommand;
import com.example.search.application.command.ReindexAllCommandHandler;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ReindexScheduler {

    private final ReindexAllCommandHandler reindexAllCommandHandler;

    @Scheduled(cron = "${search.reindex.cron:0 */15 * * * *}")
    public void scheduleReindex() {
        log.info("Scheduled reindex started");
        try {
            reindexAllCommandHandler.execute(new ReindexAllCommand());
        } catch (Exception e) {
            log.error("Scheduled reindex failed", e);
        }
    }
}
