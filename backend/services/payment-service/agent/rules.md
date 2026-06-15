
GENERAL RULES

- Always generate production-ready code.
- Never generate pseudo-code.
- Never leave TODO comments unless explicitly requested.
- Never create duplicate implementations.
- Reuse existing classes/services before creating new ones.
- Follow SOLID principles.
- Follow Clean Code principles.
- Prefer composition over inheritance.
- Minimize code changes.
- Do not refactor unrelated code.
- Do not modify files not related to the task.
- Keep backward compatibility unless explicitly requested.
JAVA RULES

- Use Java 21 features when applicable.
- Always use explicit imports.
- Never use wildcard imports (*).
- Organize imports automatically.
- Remove unused imports.

- Use final for immutable variables.
- Prefer constructor injection.
- Never use field injection.

- Prefer records for DTOs.
- Use enums instead of String constants.
- Use Optional only as return type.
- Never use Optional as entity field.

- Prefer Stream API only when readability improves.
- Avoid overusing streams.
ERROR HANDLING RULES

- Never swallow exceptions.
- Never use empty catch blocks.
- Always log exceptions.
- Always preserve root cause.

- Catch specific exceptions.
- Avoid catch(Exception).

- Throw domain-specific exceptions.
- Use GlobalExceptionHandler.

- Never return null on failure.
LOGGING RULES

- Use SLF4J.
- Never use System.out.println.
- Never log passwords.
- Never log JWT tokens.
- Never log secrets.
- Log business context.

- ERROR:
  unexpected failures

- WARN:
  recoverable problems

- INFO:
  business events

- DEBUG:
  troubleshooting only
  SPRING RULES

- Use constructor injection only.
- Avoid @Autowired fields.
- Use @ConfigurationProperties.
- Avoid @Value when many properties exist.

- Use @Transactional only in service layer.

- Controllers contain no business logic.
- Services contain business logic.
- Repositories contain persistence logic only.

- Validate request DTOs using Bean Validation.
JPA RULES

- Never expose Entity directly from controller.
- Use DTO mapping.

- Avoid EAGER fetch.
- Prefer LAZY fetch.

- Avoid N+1 queries.
- Use EntityGraph or fetch joins.

- Never put business logic in entities.

- Use UUID as external identifiers.
MICROSERVICE RULES

- Never share entities across services.
- Share contracts only.

- External communication

- Async communication

- Never call database of another service.

- Use idempotency for message consumers.

- Design consumers to be retry-safe.

PERFORMANCE RULES

- Avoid unnecessary object creation.

- Avoid loading large collections.

- Use pagination.

- Use batch operations when possible.

- Avoid nested loops with O(n²) complexity.

- Cache expensive operations.