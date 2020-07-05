import { useState, useEffect, createElement } from 'react';
import { useComponentWillMount } from './useComponentWillMount';

const Subscriber = (topic, dispatch, TargetComponent) => props => {
	const [subscribed, setSubscribed] = useState(false);
	const [data, setData] = useState([]);
	const client = props.client;

	useComponentWillMount(() => {
		client.subscribe(topic);
		setSubscribed(true);
	});

	useEffect(() => {
		client.on('message', (topic, message, packet) => {
			setData(prevState => dispatch(prevState, message));
		});

		return () => {
			client.unsubscribe(topic);
			setSubscribed(false);
		};
	}, []);

	return createElement(TargetComponent, {
		...props,
		data: data,
		subscribed: subscribed,
		mqtt: client,
	});
};

const parse = message => {
	try {
		return JSON.parse(message);
	} catch (e) {
		return message.toString();
	}
};

const defaultDispatch = (storeData = true) => (old, message) => {
	const m = parse(message);
	const newData = storeData ? [m, ...old] : [m];
	return newData;
};

export default ({ topic, dispatch, storeData = true }) => TargetComponent => {
	const dispatcher = dispatch !== undefined ? dispatch : defaultDispatch(storeData);

	return Subscriber(topic, dispatcher, TargetComponent);
};