import React from 'react';
import { View } from 'react-native';
import Photo from './Photo'
import ARCamera from './ARCamera'

export default class App extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			plantArrayData: null
		}

		this.handleArrayDataReceived = this.handleArrayDataReceived.bind(this)
	}
	handleArrayDataReceived(arrayData) {
		console.log(arrayData.length);
		this.setState({plantArrayData: arrayData})
	}

	render() {
		return (
			this.state.plantArrayData &&
				<ARCamera arrayData={this.state.plantArrayData} /> ||
			<View style={{ flex: 1 }}>
				<Photo onReceiveArrayData={this.handleArrayDataReceived}/>
			</View>
		);
	}
}
