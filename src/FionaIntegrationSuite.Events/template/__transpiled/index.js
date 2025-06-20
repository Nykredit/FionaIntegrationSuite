'use strict';

require('source-map-support/register');
var generatorReactSdk = require('@asyncapi/generator-react-sdk');
var jsxRuntime = require('/libraries/node_modules/@asyncapi/generator-react-sdk/node_modules/react/cjs/react-jsx-runtime.production.min.js');

function mapType(schema) {
  var _schema$_json;
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
      return ToPascalCase(((_schema$_json = schema._json) === null || _schema$_json === void 0 ? void 0 : _schema$_json['x-parser-schema-id']) || 'Object');
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
  if (!(raw !== null && raw !== void 0 && raw.allOf)) return schema;
  const merged = {
    properties: {},
    required: []
  };
  raw.allOf.forEach(part => {
    var _resolved, _resolved2;
    let resolved = part;
    if (part.$ref) {
      var _resolveRef;
      resolved = (_resolveRef = resolveRef(part.$ref, schemas)) === null || _resolveRef === void 0 ? void 0 : _resolveRef._json;
    }
    if ((_resolved = resolved) !== null && _resolved !== void 0 && _resolved.properties) {
      merged.properties = {
        ...merged.properties,
        ...resolved.properties
      };
    }
    if ((_resolved2 = resolved) !== null && _resolved2 !== void 0 && _resolved2.required) {
      merged.required.push(...resolved.required);
    }
  });
  return {
    ...schema,
    properties: () => merged.properties,
    required: merged.required
  };
}
function ToPascalCase(str) {
  return (str === null || str === void 0 ? void 0 : str.replace(/(^\w|_\w)/g, m => m.replace('_', '').toUpperCase())) || '';
}

/**
 * Generates an immutable C# positional record.
 */
function Record({
  name,
  schema,
  schemas,
  baseClass,
  baseProperties,
  asyncapi,
  template
}) {
  if (!schema) return null;
  const normSchema = normalizeSchema(schema, schemas);
  if (!normSchema.properties || typeof normSchema.properties !== 'function') {
    console.warn(`Schema for ${name} has no properties:`, normSchema);
    return null;
  }
  var baseClassElements = [];
  var props = [];
  if (baseProperties) {
    Object.entries(baseProperties).map(([propName, propSchema]) => {
      const type = mapType(propSchema);
      var paramName = ToPascalCase(propName);
      if (propName == "eventType") paramName = "\"" + name + "\"";else if (propName == "version") paramName = "\"" + asyncapi.info().version() + "\"";
      var parameterElement = `${type} ${paramName}`;
      baseClassElements.push(paramName);
      if (["eventType", "version"].indexOf(propName) == -1) {
        props.push(parameterElement);
      }
    });
  }
  Object.entries(normSchema.properties()).map(([propName, propSchema]) => {
    const type = mapType(propSchema);
    const paramName = ToPascalCase(propName);
    var parameterElement = `${type} ${paramName}`;
    props.push(parameterElement);
  });
  props = props.join(", ");
  baseClassElements = baseClassElements.join(', ');
  const inheritance = baseClass ? ` : ${baseClass}(${baseClassElements})` : '';
  template = template || "";
  if (!inheritance) {
    return /*#__PURE__*/jsxRuntime.jsxs(generatorReactSdk.Text, {
      children: [`public record ${name}(${props})${inheritance}`, `\n{\n`, `public virtual string Template => string.Empty;`, `\n}`]
    });
  } else {
    return /*#__PURE__*/jsxRuntime.jsxs(generatorReactSdk.Text, {
      children: [`public record ${name}(${props})${inheritance}`, `\n{\n`, `public override string Template => @"${template}";`, `\n}`]
    });
  }
}
function index ({
  asyncapi
}) {
  const messages = asyncapi.components().messages();
  const schemas = asyncapi.components().schemas();
  const files = [];
  const schemasReferenced = [];
  Object.entries(messages).forEach(([msgName, msg]) => {
    var _msg$traits;
    const schema = msg.payload();
    const schemaName = ToPascalCase(msgName);
    let baseName = null;
    const mergedTraitProperties = {};
    let template = null;
    if (msg._json["x-message-template"]) {
      template = `${msg._json["x-message-template"]}`;
    }

    // Check if there are traits
    const traits = (_msg$traits = msg.traits) === null || _msg$traits === void 0 ? void 0 : _msg$traits.call(msg);
    if (traits && Object.keys(traits).length > 0) {
      // Merge all trait schemas into one schema

      const mergedRequired = [];
      Object.values(traits).forEach(trait => {
        var _trait$headers;
        baseName = ToPascalCase(`${trait.name()}Base`);
        const traitSchema = (_trait$headers = trait.headers) === null || _trait$headers === void 0 ? void 0 : _trait$headers.call(trait);
        if (traitSchema !== null && traitSchema !== void 0 && traitSchema.properties) {
          Object.entries(traitSchema.properties()).forEach(([propName, propSchema]) => {
            mergedTraitProperties[propName] = propSchema;
          });
        }
      });
      const traitSchema = {
        properties: () => mergedTraitProperties,
        required: mergedRequired
      };
      files.push(/*#__PURE__*/jsxRuntime.jsxs(generatorReactSdk.File, {
        name: `${baseName}.cs`,
        children: [`namespace DataTransformationHub.Events.Models;\n`, /*#__PURE__*/jsxRuntime.jsx(Record, {
          name: baseName,
          schema: traitSchema,
          schemas: schemas,
          asyncapi: asyncapi
        })]
      }, `trait-${msgName}`));
    }

    // Analyze payload schema for referenced schemas
    if (schema !== null && schema !== void 0 && schema.properties) {
      Object.entries(schema.properties()).forEach(([_, s]) => {
        if (s.type() === "array") {
          var _s$items$_json;
          schemasReferenced.push((_s$items$_json = s.items()._json) === null || _s$items$_json === void 0 ? void 0 : _s$items$_json['x-parser-schema-id']);
        }
      });
    }
    files.push(/*#__PURE__*/jsxRuntime.jsxs(generatorReactSdk.File, {
      name: `${schemaName}.cs`,
      children: [`namespace DataTransformationHub.Events.Models;\n`, /*#__PURE__*/jsxRuntime.jsx(Record, {
        name: schemaName,
        schema: schema,
        schemas: schemas,
        baseClass: baseName,
        baseProperties: mergedTraitProperties,
        asyncapi: asyncapi,
        template: template
      })]
    }, `msg-${msgName}`));
  });

  // Generate records for referenced schemas
  Object.entries(schemas).forEach(([schemaName, schema]) => {
    var _schema$_json2;
    if (!schemasReferenced.includes(schemaName)) return;
    if (schema.type() !== 'object' && !((_schema$_json2 = schema._json) !== null && _schema$_json2 !== void 0 && _schema$_json2.allOf)) return;
    const pascalName = ToPascalCase(schemaName);
    files.push(/*#__PURE__*/jsxRuntime.jsxs(generatorReactSdk.File, {
      name: `${pascalName}.cs`,
      children: [`namespace DataTransformationHub.Events.Models;\n`, /*#__PURE__*/jsxRuntime.jsx(Record, {
        name: pascalName,
        schema: schema,
        schemas: schemas
      })]
    }, `schema-${schemaName}`));
  });
  return files;
}

module.exports = index;
//# sourceMappingURL=index.js.map
