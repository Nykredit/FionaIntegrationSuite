# Fiona Integration Suite

## Async API

The application uses AsyncApi to document its events, and generates C# classes from this spec.

```sh
cd ./src/FionaIntegrationSuite.Events/

docker run --rm -it --user=root -v "$(pwd)/spec/v1.yaml:/app/asyncapi.yml" -v "$(pwd)/template:/app/template" -v "$(pwd)/Models:/app/output" docker.nykreditnet.net/asyncapi/cli generate fromTemplate -o /app/output /app/asyncapi.yml /app/template --force-write --debug
```

The resulting classes can be found in ./src/FionaIntegrationSuite.Events/Models with project namespace "FionaIntegrationSuite.Events.Models"
 