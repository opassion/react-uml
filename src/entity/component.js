// @flow

import React from 'react';
import style from 'styled-components';
import { connect } from 'react-redux';
import {
  move,
  linkTo,
  addLinkedEntity,
  removeEntity,
  selectEntity,
} from './reducer';
import { connecting } from '../canvas/reducer';
import defaultEntity from './defaultEntity';
import ContextMenu from '../contextMenu/component';

import type { ComponentType, Node } from 'react';
import type {
  Id,
  EntityModel,
  MetaEntityModel,
  MovePayload,
  AddLinkedEntityPayload,
  EntityAction,
  MetaEntityAction,
} from './reducer';
import type {
  CanvasState,
  CanvasAction,
  ConnectingPayload,
} from '../canvas/reducer';
import type { State } from '../diagram/reducer';
import type { DefaultEntityProps } from './defaultEntity';

/*
 * Presentational
 * ==================================== */

const EntityStyle = style.div`
  position: absolute;
  top: 0;
  left: 0;
  text-align: center;
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  user-select: none;
`;

type EntityProps = {
  model: EntityModel,
  isAnchored: boolean,
  isSelected: boolean,
  toBeConnected: boolean,
  onMouseDown: (SyntheticMouseEvent<HTMLElement>) => void,
  onMouseLeave: (SyntheticMouseEvent<HTMLElement>) => void,
  onMouseMove: (SyntheticMouseEvent<HTMLElement>) => void,
  onMouseUp: () => void,
  children: Node,
  addLinkedEntity: AddLinkedEntityPayload => EntityAction,
  removeEntity: Id => EntityAction,
  connecting: ConnectingPayload => CanvasAction,
  defaultEntity: DefaultEntityProps => EntityModel & MetaEntityModel,
};
const Entity = (props: EntityProps) => (
  <EntityStyle
    style={{
      transform: `translate(${props.model.x}px, ${props.model.y}px)`,
      zIndex: props.isAnchored ? '100' : '10',
      cursor: props.toBeConnected ? 'pointer' : 'move',
    }}
  >
    <div
      onMouseDown={props.onMouseDown}
      onMouseLeave={props.onMouseLeave}
      onMouseMove={props.onMouseMove}
      onMouseUp={props.onMouseUp}
      role="presentation"
    >
      {props.children}
    </div>
    {props.isSelected && (
      <ContextMenu
        actions={[
          {
            action: () => props.removeEntity(props.model.id),
            iconVariety: 'delete',
            label: 'Remove',
          },
          {
            action: ev =>
              props.addLinkedEntity({
                entity: props.defaultEntity({ entityType: 'Task', ev }),
                id: props.model.id,
              }),
            iconVariety: 'task',
            label: 'Add Task',
          },
          {
            action: ev =>
              props.addLinkedEntity({
                entity: props.defaultEntity({ entityType: 'Event', ev }),
                id: props.model.id,
              }),
            iconVariety: 'event',
            label: 'Add Event',
          },
          {
            action: () =>
              props.connecting({ currently: true, from: props.model.id }),
            iconVariety: 'arrow',
            label: 'connect',
          },
        ]}
      />
    )}
  </EntityStyle>
);

/*
 * Container
 * ==================================== */

type EntityContainerState = {
  anchorX: number,
  anchorY: number,
  isAnchored: boolean,
  onMouseUpWouldBeClick: boolean,
};
// TODO: These signatures are probably wrong. The original action does return
// an EntityAction, but after we connect we're dispatching the action, so this
// signature is probably incorrect. Gotta research what's the proper signature
// after connecting the component
type EntityContainerProps = {
  model: EntityModel,
  meta: MetaEntityModel,
  canvas: CanvasState,
  move: MovePayload => EntityAction,
  linkTo: Id => EntityAction,
  addLinkedEntity: AddLinkedEntityPayload => EntityAction,
  removeEntity: Id => EntityAction,
  connecting: ConnectingPayload => CanvasAction,
  selectEntity: (Id, isSelected?: boolean) => MetaEntityAction,
  defaultEntity: DefaultEntityProps => EntityModel & MetaEntityModel,
};
const EntityContainerHOC = WrappedComponent =>
  class extends React.PureComponent<
    EntityContainerProps,
    EntityContainerState
  > {
    onMouseDown: (SyntheticMouseEvent<HTMLElement>) => void;
    onMouseLeave: (SyntheticMouseEvent<HTMLElement>) => void;
    onMouseMove: (SyntheticMouseEvent<HTMLElement>) => void;
    onMouseUp: () => void;

    constructor(props: EntityContainerProps) {
      super(props);
      this.state = {
        anchorX: this.props.meta.width / 2,
        anchorY: this.props.meta.height / 2,
        isAnchored: this.props.meta.isAnchored,
        onMouseUpWouldBeClick: true,
      };
      /* TODO: I should switch to:
       * https://flow.org/en/docs/react/events/
       * https://babeljs.io/docs/plugins/transform-class-properties/
       * so I avoid having to duplicate bound function type on the class
       * and also these bounding down here
       */
      this.onMouseDown = this.onMouseDown.bind(this);
      this.onMouseLeave = this.onMouseLeave.bind(this);
      this.onMouseMove = this.onMouseMove.bind(this);
      this.onMouseUp = this.onMouseUp.bind(this);
    }

    componentDidMount() {
      const wouldBeClick = () =>
        this.setState({ onMouseUpWouldBeClick: false });
      if (this.state.isAnchored) {
        setTimeout(wouldBeClick, 16 * 12);
      } else {
        wouldBeClick();
      }
    }

    onMouseDown(ev: SyntheticMouseEvent<HTMLElement>) {
      if (this.props.canvas.connecting.currently) {
        // In this case we want to select an entity to be connected to a
        // previously selected entity to connect from
        this.props.linkTo(this.props.model.id);
      } else {
        // Most common behavior is that when you click on an entity, your
        // intention is to start dragging the entity
        this.setState({
          anchorX: ev.pageX - this.props.canvas.offset.x - this.props.model.x,
          anchorY: ev.pageY - this.props.canvas.offset.y - this.props.model.y,
          isAnchored: true,
        });
      }
    }

    onMouseLeave(ev: SyntheticMouseEvent<HTMLElement>) {
      if (this.state.isAnchored) {
        // If the entity is still being dragged while leaving (mouse movement
        // faster than state refresh on DOM) then (discussing only X
        // coordinate, calculations the same with Y):
        //
        // This is where the anchor point was (in relation to diagram coordinates):
        // this.state.anchorX + this.props.model.x
        //
        // This is where the mouse was (in relation to diagram coordinates)
        // ev.pageX - this.props.canvas.offsetX
        //
        // This is the difference:
        // (ev.pageX - this.props.canvas.offsetX) - (this.state.anchorX + this.props.model.x)
        //
        // The above number signifies by how much has the mouse left the original
        // anchor point. If we add this difference to where we would have
        // calculated our original location, we're left with:
        // (ev.pageX - this.props.canvas.offsetX - this.state.anchorX) +
        // ((ev.pageX - this.props.canvas.offsetX) - (this.state.anchorX + this.props.model.x))
        //
        // Which simplified leaves us with:
        // 2 * (ev.pageX - this.props.canvas.offsetX - this.state.anchorX) - this.props.model.x
        //
        this.props.move({
          x:
            2 * (ev.pageX - this.props.canvas.offset.x - this.state.anchorX) -
            this.props.model.x,
          y:
            2 * (ev.pageY - this.props.canvas.offset.y - this.state.anchorY) -
            this.props.model.y,
          id: this.props.model.id,
        });
      }
    }

    onMouseMove(ev: SyntheticMouseEvent<HTMLElement>) {
      if (this.state.isAnchored) {
        this.props.move({
          x: ev.pageX - this.props.canvas.offset.x - this.state.anchorX,
          y: ev.pageY - this.props.canvas.offset.y - this.state.anchorY,
          id: this.props.model.id,
        });
      }
    }

    onMouseUp(/* ev: SyntheticMouseEvent<HTMLElement> */) {
      if (!this.state.onMouseUpWouldBeClick) {
        // Behaves as if it was spawned with a mouse drag
        // meaning that when you release the mouse button,
        // the element will de-anchor
        this.setState({
          isAnchored: false,
        });
        this.props.selectEntity(this.props.model.id);
      }
      // else it behaves as if it was spawned with a mouse click
      // meaning it needs another click to de-anchor from mouse
    }

    render() {
      return (
        <Entity
          model={this.props.model}
          isAnchored={this.state.isAnchored}
          isSelected={this.props.meta.isSelected}
          toBeConnected={this.props.canvas.connecting.currently}
          addLinkedEntity={this.props.addLinkedEntity}
          removeEntity={this.props.removeEntity}
          connecting={this.props.connecting}
          defaultEntity={this.props.defaultEntity}
          onMouseDown={this.onMouseDown}
          onMouseLeave={this.onMouseLeave}
          onMouseMove={this.onMouseMove}
          onMouseUp={this.onMouseUp}
        >
          <WrappedComponent model={this.props.model} meta={this.props.meta} />
        </Entity>
      );
    }
  };

const mapStateToProps = (state: State, ownProps) => ({
  canvas: state.canvas,
  meta: state.metaEntity.find(
    metaEntity => metaEntity.id === ownProps.model.id
  ),
  defaultEntity: defaultEntity(state),
});

export default (WrappedComponent: ComponentType<*>) =>
  connect(mapStateToProps, {
    move,
    linkTo,
    addLinkedEntity,
    removeEntity,
    selectEntity,
    connecting,
  })(EntityContainerHOC(WrappedComponent));
