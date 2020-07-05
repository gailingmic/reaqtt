import React, { Children, useEffect, useState } from 'react';
import MQTT from 'mqtt';
import {useComponentWillMount} from './useComponentWillMount';

function Connector(props) {
    const [localMqtt, setLocalMqtt] = useState({});
    const [status, setStatus] = useState("offline");

    const statusHandler = status => _ => setStatus(status);

	useComponentWillMount(() => {
        const { mqtt, mqttProps } = props;
        const typeofProp = typeof mqttProps === 'string' ? true : false;
        
        const mqttObj = mqtt ? mqtt : typeofProp ? MQTT.connect(mqttProps) : MQTT.connect(mqttProps.url, mqttProps.options);
        
        mqttObj.on('connect', statusHandler('connected'));
		mqttObj.on('reconnect', statusHandler('reconnect'));
		mqttObj.on('close', statusHandler('closed'));
		mqttObj.on('offline', statusHandler('offline'));
        mqttObj.on('error', console.error);
        
        setLocalMqtt(mqttObj);
    });

    useEffect(() => {
        return () => {
            localMqtt.end();
        };
    }, [localMqtt]);

    const { children } = props;
	return React.cloneElement(Children.only(children), { client: localMqtt, status: status });
}

export default Connector;