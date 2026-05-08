<<<<<<< HEAD
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
=======
FROM alpine:3.20
WORKDIR /app
CMD ["sh", "-c", "echo promotion-service container started; tail -f /dev/null"]
>>>>>>> origin/main
