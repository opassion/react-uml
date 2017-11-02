// @flow

import Diagram, { store } from './diagram/component';
import { setEntities } from './entity/reducer';
import { setConfig } from './config/reducer';
import diagramOn from './diagramOn/';

export { Diagram, diagramOn, store, setEntities, setConfig };
