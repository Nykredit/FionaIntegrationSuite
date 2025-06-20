import { File, Text } from '@asyncapi/generator-react-sdk';

/**
 * Converts AsyncAPI schema types to C# types.
 */
function mapType(schema) {
    if (!schema || typeof schema.type !== 'function') {
        return 'object';
    }

    switch (schema.type()) {
        case 'string':
            if (schema.format() === 'date-time') return 'DateTime';
            return 'string';
        case 'integer':
            return 'int';
        case 'number':
            return 'double';
        case 'boolean':
            return 'bool';
        case 'array':
            return `List<${mapType(schema.items())}>`;
        case 'object':
            return ToPascalCase(schema._json?.['x-parser-schema-id'] || 'Object');
        default:
            return 'object';
    }
}

/**
 * Resolves a $ref to its actual schema from the components map.
 */
function resolveRef(ref, schemas) {
    const refName = ref.split('/').pop();
    return schemas[refName];
}

/**
 * Flattens an allOf schema into a single schema with merged properties and required fields.
 */
function normalizeSchema(schema, schemas, baseProperties) {
    const raw = schema._json;

    if (!raw?.allOf) return schema;

    const merged = { properties: {}, required: [] };

    raw.allOf.forEach(part => {
        let resolved = part;
        if (part.$ref) {
            resolved = resolveRef(part.$ref, schemas)?._json;
        }

        if (resolved?.properties) {
            merged.properties = { ...merged.properties, ...resolved.properties };
        }

        if (resolved?.required) {
            merged.required.push(...resolved.required);
        }
    });



    return {
        ...schema,
        properties: () => merged.properties,
        required: merged.required,
    };
}

function ToPascalCase(str) {
    return str?.replace(/(^\w|_\w)/g, m => m.replace('_', '').toUpperCase()) || '';
}

/**
 * Generates an immutable C# positional record.
 */
function Record({ name, schema, schemas, baseClass, baseProperties, asyncapi, template }) {

    if (!schema) return null;

    const normSchema = normalizeSchema(schema, schemas, baseProperties);

    if (!normSchema.properties || typeof normSchema.properties !== 'function') {
        console.warn(`Schema for ${name} has no properties:`, normSchema);
        return null;
    }

    var baseClassElements = [];

    var props = [];

    if (baseProperties) {

        const baseProps = Object.entries(baseProperties)
            .map(([propName, propSchema]) => {
                const type = mapType(propSchema);
                var paramName = ToPascalCase(propName);
                if (propName == "eventType") paramName = "\"" + name + "\""
                else if (propName == "version") paramName = "\"" + asyncapi.info().version() + "\""

                var parameterElement = `${type} ${paramName}`;


                baseClassElements.push(paramName);
                if (["eventType", "version"].indexOf(propName) == -1) {
                    props.push(parameterElement);
                }

            })
    }

    Object.entries(normSchema.properties())
        .map(([propName, propSchema]) => {
            const type = mapType(propSchema);
            const paramName = ToPascalCase(propName);
            var parameterElement = `${type} ${paramName}`;


            props.push(parameterElement);
        });



    props = props.join(", ");

    baseClassElements = baseClassElements.join(', ');

    const inheritance = baseClass ? ` : ${baseClass}(${baseClassElements})` : '';

    template = template || ""

    if (!inheritance) {
        return (
            <Text>
                {`public record ${name}(${props})${inheritance}`}
                {`\n{\n`}
                {`public virtual string Template => string.Empty;`}
                {`\n}`}
            </Text>
        )
    } else {
        return (
            <Text>
                {`public record ${name}(${props})${inheritance}`}
                {`\n{\n`}
                {`public override string Template => @"${template}";`}
                {`\n}`}

            </Text>
        );
    }
}

export default function ({ asyncapi }) {
    const messages = asyncapi.components().messages();
    const schemas = asyncapi.components().schemas();
    const files = [];


    const schemasReferenced = [];

    Object.entries(messages).forEach(([msgName, msg]) => {
        const schema = msg.payload();
        const schemaName = ToPascalCase(msgName);
        let baseName = null;
        let baseProperties = [];
        const mergedTraitProperties = {};

        let template = null;

        if (msg._json["x-message-template"]) {
            template = `${msg._json["x-message-template"]}`
        }



        // Check if there are traits
        const traits = msg.traits?.();
        if (traits && Object.keys(traits).length > 0) {

            // Merge all trait schemas into one schema

            const mergedRequired = [];

            Object.values(traits).forEach(trait => {
                baseName = ToPascalCase(`${trait.name()}Base`);

                const traitSchema = trait.headers?.();
                if (traitSchema?.properties) {
                    Object.entries(traitSchema.properties()).forEach(([propName, propSchema]) => {
                        baseProperties.push(propName);
                        mergedTraitProperties[propName] = propSchema;
                    });
                }
            });

            const traitSchema = {
                properties: () => mergedTraitProperties,
                required: mergedRequired,
            };

            files.push(
                <File name={`${baseName}.cs`} key={`trait-${msgName}`}>
                    {`namespace FionaIntegrationSuite.Events.Models;\n`}
                    <Record name={baseName} schema={traitSchema} schemas={schemas} asyncapi={asyncapi} />
                </File>
            );
        }

        // Analyze payload schema for referenced schemas
        if (schema?.properties) {
            Object.entries(schema.properties()).forEach(([_, s]) => {
                if (s.type() === "array") {
                    schemasReferenced.push(s.items()._json?.['x-parser-schema-id']);
                }
            });
        }



        files.push(
            <File name={`${schemaName}.cs`} key={`msg-${msgName}`}>
                {`namespace FionaIntegrationSuite.Events.Models;\n`}
                <Record name={schemaName} schema={schema} schemas={schemas} baseClass={baseName} baseProperties={mergedTraitProperties} asyncapi={asyncapi} template={template} />
            </File>
        );
    });

    // Generate records for referenced schemas
    Object.entries(schemas).forEach(([schemaName, schema]) => {
        if (!schemasReferenced.includes(schemaName)) return;
        if (schema.type() !== 'object' && !schema._json?.allOf) return;
        const pascalName = ToPascalCase(schemaName);

        files.push(
            <File name={`${pascalName}.cs`} key={`schema-${schemaName}`}>
                {`namespace FionaIntegrationSuite.Events.Models;\n`}
                <Record name={pascalName} schema={schema} schemas={schemas} />
            </File>
        );
    });

    return files;
}
