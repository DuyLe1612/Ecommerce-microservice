# syntax=docker/dockerfile:1

# ── Build stage ───────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jdk-alpine AS builder

WORKDIR /app

# Copy only what's needed for dependency caching
COPY pom.xml .
COPY mvnw mvnw.cmd ./
COPY .mvn .mvn

# Download dependencies (cached layer — only re-runs if pom.xml changes)
RUN ./mvnw dependency:go-offline -B

# Copy source and build
COPY src src
RUN ./mvnw package -DskipTests -B

# ── Runtime stage ─────────────────────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

WORKDIR /app

# Copy the fat JAR from build stage
COPY --from=builder /app/target/*.jar app.jar

# Copy Flyway migration scripts
COPY --from=builder /app/src/main/resources/db/migration ./db/migration

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8086

ENV JAVA_OPTS="-Xms256m -Xmx512m -XX:+UseG1GC"

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD wget -qO- http://localhost:8086/actuator/health || exit 1

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
