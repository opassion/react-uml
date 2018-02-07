# React Flow Diagram

{{Logo}}

Batteries included React Component for renderizing, creating and editing diagrams.

{{Animation gif that shows some of the features}}

## Features

- The data is the source of truth
- Can add custom Components as entities
- Continous feedback while editing
- Configurable grid, snap to grid (or no grid at all)
- History, undo, redo; keyboard shortcuts
- Panel for adding new Entities, with drag or click
- Automatic arrow placement
- Labels for arrows

### Missing features (currently working on)

- Editable arrow labels (From the UI, you can always edit the model)
- Panning, zooming (viewport and camera as separate concepts)
- Editable arrow paths (From the UI, you can always edit the model)
- Select several entities
- Copy and paste entities
- Alignment tools

## Installation

It's easier to see the an example already working to explain what we need to add. Pull (react-flow-diagram-example)[https://github.com/DrummerHead/react-flow-diagram-example] and follow along; consider it a finished state of following these instructions. You can also use this repo as a starting point for your own implementation.

Let's assume a fresh [create-react-app](https://github.com/facebook/create-react-app) (which the example is created from) strucure, then:

```
yarn add react-flow-diagram
```

And we'll also add [styled-components](https://github.com/styled-components/styled-components) for our custom entities, although this is not a requirement. You can just add classNames to elements and use regular css or any css transpilation language.

```
yarn add styled-components
```

in `/src/` we create a `/CustomDiagram/` following a standard of [Grouping by features](https://reactjs.org/docs/faq-structure.html#grouping-by-features-or-routes)

And in it we create:

* [model-example.js](https://github.com/DrummerHead/react-flow-diagram-example/blob/master/src/CustomDiagram/model-example.js)
* [config-example.js](https://github.com/DrummerHead/react-flow-diagram-example/blob/master/src/CustomDiagram/config-example.js)
* event
  * [component.js](https://github.com/DrummerHead/react-flow-diagram-example/blob/master/src/CustomDiagram/event/component.js)
  * [icon.js](https://github.com/DrummerHead/react-flow-diagram-example/blob/master/src/CustomDiagram/event/icon.js)
* task
  * [component.js](https://github.com/DrummerHead/react-flow-diagram-example/blob/master/src/CustomDiagram/task/component.js)
  * [icon.js](https://github.com/DrummerHead/react-flow-diagram-example/blob/master/src/CustomDiagram/task/icon.js)
* [index.js](https://github.com/DrummerHead/react-flow-diagram-example/blob/master/src/CustomDiagram/index.js)

### [model-example.js](https://github.com/DrummerHead/react-flow-diagram-example/blob/master/src/CustomDiagram/model-example.js)

The star of the show, the model that holds the data that will be represented as a diagram.

You don't need to conciously know the structure of the model, since you can always start a diagram via the UI, save it and resume from the UI without ever touching the model. But you may need this information for your specific use case.

The structure held in the `model` const can be defined in [flow types](https://flow.org/en/docs/types/) as (you don't really need to know flowtype to grasp this):

```
type EntityState = Array<EntityModel>;
```

model is an array with `EntityModel`s representing each entity

```
type EntityType = string;
type EntityModel = {
  id: EntityId,      // unique identifier of the Entity
  type: EntityType,  // type of entity, according to your custom entity components
  width: number,     // width
  height: number,    // height
  x: number,         // x position
  y: number,         // y position
  name: string,      // label of the entity
  linksTo?: Links,   // reference to other entities
  custom?: Object,   // custom data for you to extend functionalities
};
```

The `id` of an `EntityModel` is an `EntityId`; which is just a string

```
type EntityId = string;
```

The `linksTo` attribute is [optional](https://flow.org/en/docs/types/objects/#toc-optional-object-type-properties) (an entity may not link to anyone) and holds a `Links` type, which is an array of `Link`

```
type Links = Array<Link>;

type Link = {
  target: EntityId,      // Id of another entity which is being linked to
  edited: boolean,       // whether or not the link was autogenerated or was edited by the user
  points?: Array<Point>, // Array of points that define the position of the link
  label?: string,        // link label
  color?: string,        // link color (currently not implemented)
};
```

The `points` attribute is also optional (as well as any attribute ending with `?`) and holds an array of `Point`

```
type Point = {
  x: number,  // x position
  y: number,  // y position
};
```

Check [model-example.js](https://github.com/DrummerHead/react-flow-diagram-example/blob/master/src/CustomDiagram/model-example.js) to see who this all pans out.



## Configuration

## Examples

## Some History

Why did I end up creating this project

## Alternatives

## Contributing

## Companies using React Flow Diagram

## Sponsored by
