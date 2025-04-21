FROM gradle:8.7-jdk17 AS builder
WORKDIR /app/CognoQuest
COPY CognoQuest /app/CognoQuest
RUN gradle build -x test

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=builder /app/CognoQuest/build/libs/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]