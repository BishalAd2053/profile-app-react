# --- Build stage ---
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

# Cache dependencies first
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

# Build the app
COPY src ./src
RUN mvn -B -q -DskipTests package

# --- Runtime stage ---
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

RUN addgroup -S app && adduser -S app -G app && \
    mkdir -p /data && chown app:app /data
COPY --from=build /app/target/profile-backend.jar app.jar
RUN chown app:app app.jar
USER app
VOLUME ["/data"]

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD wget -qO- http://localhost:8080/actuator/health | grep -q '"status":"UP"' || exit 1

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
