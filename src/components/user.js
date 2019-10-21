import React, {useEffect, useState} from 'react'
import axios from 'axios';
import * as socket from 'socket.io-client';
import _ from 'lodash'

const initState = {
    email: '',
    username: '',
    id: '',
    socktId: '',
    devices: []
}

const io = socket.connect('http://localhost:8090', {
    transports: ['websocket', 'polling'],
    query: {
        token: localStorage.getItem('token'),
    }
})


// how to fix connection with socket ????

const User = props => {
    const [user, setUser] = useState(initState);
    const [loading, setLoading] = useState(false);
    const [connected, setConnected] = useState([]);


    useEffect(() => {

        io.emit('sign-User-Id', user.id, true);
        user.devices.map((res) => {
            io.emit('device-connection', res.socketId);
        })
    }, [user, setUser])


    useEffect(() => {
        io.on('device-connection', (id, con) => {
            const ms = Object.assign(connected, {id, online: con});
            setConnected(ms)
        })
    })

    useEffect(() => {
        if(!localStorage.getItem('token')) {
            props.history.push('/signin')
            io.close();
        }
        setLoading(true);
        axios({
            method: 'get',
            url: 'http://localhost:8090/users/user',
            headers: {'auth': localStorage.getItem('token')}
        }).then((res) => {
            const { email, username, id, devices } = res.data;
            setUser({...user, email, username, socktId: io.id, id, devices});
            setLoading(false);
        }).finally(() => {
            console.log('done!')
        })
        .catch(e => console.log('Error from user component', e))
    }, [])

    const logout = () => {
        localStorage.removeItem('token');
        io.close();
        props.history.push('/signin')
    }

    const talkToSocket = () => {
        io.emit('userMe', 'hello from ' + user.username )
    }

    const connectDevice = id => {
        console.log('to', id)
        io.emit('callDevice', id);
    }

    const Devices = () => {
        if(!loading && user.devices.length !== 0) {
            return user.devices.map((item, index) => {
                return <div key={index}>
                    <p>Device: {item.deviceName}</p>
                    <p>Type: {item.deviceType}</p>
                    <button onClick={() => connectDevice(item.socketId)}>Test</button>
                </div>
            })
        }
        return <p>loading...</p>
    }

    return(
        <div>
            <h3>User</h3>
            {loading ? <span>Loading...</span> : <p>{user.username} : {user.email}</p>}
            <Devices />
            <button onClick={talkToSocket}>test</button>
            <button onClick={logout}>Logout</button>
        </div>
    )
}

export default User;