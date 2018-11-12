import React from 'react';
import { View } from 'react-native';
import Photo from './Photo'
import ARCamera from './ARCamera'

export default class App extends React.Component {
	constructor(props) {
		super(props);

	}

	componentDidMount() {
	}

	render() {
		return (
			<ARCamera />
			// <View style={{ flex: 1 }}>
			// 	<Photo />
			// </View>
		);
	}
}
