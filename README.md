# Fiona Integration Suite

## Local Development

Run the system's dependencies with docker:

```sh
    docker-compose up -d
```

Verify that kafka topics are created succesfully:

```sh
    docker exec -it broker /opt/kafka/bin/kafka-topics.sh --list --bootstrap-server broker:29092
```

## Async API

The application uses AsyncApi to document its events, and generates C# classes from this spec.

```sh
cd ./src/FionaIntegrationSuite.Events/

docker run --rm -it --user=root -v "$(pwd)/spec/v1.yaml:/app/asyncapi.yml" -v "$(pwd)/template:/app/template" -v "$(pwd)/Models:/app/output" docker.nykreditnet.net/asyncapi/cli generate fromTemplate -o /app/output /app/asyncapi.yml /app/template --force-write --debug
```

The resulting classes can be found in ./src/FionaIntegrationSuite.Events/Models with project namespace "FionaIntegrationSuite.Events.Models"
