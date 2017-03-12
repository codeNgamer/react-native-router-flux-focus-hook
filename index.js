import { Reducer, ActionConst } from 'react-native-router-flux';
import _ from 'lodash';

let keyEvents = [
  ActionConst.REFRESH,
  ActionConst.FOCUS,
];

const attachHandlers = (baseClass) => {
  _.forEach(keyEvents, keyEvent => {
    const actionKey = _.findKey(ActionConst, constant => constant === keyEvent);
    const actionName = _.upperFirst(_.lowerCase(actionKey));
    const registerHookName = `register${actionName}Hook`;
    const unregisterHookName = `unregister${actionName}Hook`;

    baseClass.prototype[registerHookName] = function(component) {
      const handlerName = `handleNavigationScene${actionName}`;
      if (component[handlerName] === undefined) {
        throw `Provided component does not define ${handlerName}`;
      }

      const boundedHandler = component[handlerName].bind(component);
      const { sceneKey } = component.props;
      const hook = {  };
      hook[keyEvent] = boundedHandler; 
      this._addHook(hook, sceneKey);
    };

    baseClass.prototype[unregisterHookName] = function(component) {
      const { sceneKey } = component.props;
      this._removeHook(keyEvent, sceneKey);
    }
  });

  return baseClass;
};

class NavigationStateHandler {
  constructor() {
    this._hooks = { };
  }

  _addHook(hook, sceneKey) {
    this._hooks[sceneKey] = this._hooks[sceneKey] || {};
    this._hooks[sceneKey] = { ...this._hooks[sceneKey], ...hook };
  }

  _removeHook(hookName, sceneKey) {
    this._hooks[sceneKey] = _.omit(this.hooks[sceneKey], hookName);
  }

  getReducer(params) {
    const defaultReducer = Reducer(params);
    const isKeyEvent = (type) => _.includes(keyEvents, type);

    return (state, action) => {
      if (action.scene && isKeyEvent(action.type)) {
        const sceneHandler = this._hooks[action.scene.sceneKey];
        if (sceneHandler) {
          sceneHandler[action.type]();
        }
      }

      return defaultReducer(state, action);
    }
  }

  addEvent(event) {
    if (ActionConst[event]) {
      keyEvents.push(event);
      keyEvents = _.uniq(keyEvents);
    }
  }

  removeEvent(event) {
    if (ActionConst[event]) {
      keyEvents = _.pull(keyEvents, event);
    }
  }
}

export default attachHandlers(NavigationStateHandler);
