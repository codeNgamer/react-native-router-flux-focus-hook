# Facilitating re-render, state-update, etc on navigation change 

[react-native-router-flux](https://github.com/aksonov/react-native-router-flux)
doesn't currently make it possible to hook onto the action on a `Scene` 
navigation event, which makes it impossible update a `Scene` purely based on
navigation. Instead a `Scene` is currently only rendered if the `props`
provided to the scene are changed, which is not always possible or convenient.
This module implements a reducer for the navigation state in which it is
possible to indicate which scene components would like to have a method
(`navigationStateRouter`) called when a `Scene` is change/update according to a Scene navigation constant.

Installation

    npm install --save react-native-router-flux-hooks


```diff
+import NavigationStateHandler from 'react-native-router-flux-focus-hook'
+const navigationStateHandler = new NavigationStateHandler()

class App extends Component {
  render() {
    return (
      <Router 
+      createReducer={navigationStateHandler.getReducer.bind(navigationStateHandler)} 
+      navigationStateHandler={navigationStateHandler}
        >
        <Scene key="root" component={MainComponent}>
        <Scene key="root" component={DynamicComponent}>
        <Scene key="root" component={OtherComponent}>
      </Router>
  }
}
```

This ensures that we can hook on to when navigation actions are fired and
that `navigationStateRouter` is available to every scene component.

Next indicate that a scene component wants to have its
`handleNavigationSceneFocus` method called when the scene is focused:
`handleNavigationSceneRefresh` method called when the scene is refreshed:
`handleNavigationScene${camelCase(ActionConst['event'])}` method called when the scene is (ActionConst['event']):

```diff
NavigationStateHandler comes equipped with hooks for ActionConst.FOCUS and ActionConst.REFRESH. To handle other events, simply add that event like so: 
+const navigationStateHandler = new NavigationStateHandler();
navigationStateRouter.addEvent(ActionConst.Pop);

then you can use this.props.navigationStateHandler.registerPopHook in your component..
```

```diff
class DynamicComponent extends Component {
  componentDidMount() {
    const registerHandler = `register${camelCase(ActionConst['event'])}Hook`; 
+   this.props.navigationStateHandler.registerFocusHook(this);
+   this.props.navigationStateHandler[registerHandler](this);
  }

  componentWillUnmount() {
    const unregisterHandler = `register${camelCase(ActionConst['event'])}Hook`; 
+   this.props.navigationStateHandler.unregisterFocusHook(this)
+   this.props.navigationStateHandler[unregisterHandler](this);
  }

  handleNavigationSceneFocus() {
+   this.setState({ date: "load new data" })
  }
}
```

And finally implement in your appropriate `handleNavigationScene` handler the functionality you need :)

Pull-requests welcome!
