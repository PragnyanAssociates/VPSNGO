/**
 * @format
 */

// ✅ THIS IS THE NEW LINE. IT MUST BE THE FIRST IMPORT.
import 'react-native-get-random-values';

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import 'react-native-gesture-handler';

AppRegistry.registerComponent(appName, () => App);