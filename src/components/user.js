import React, {useEffect, useState} from 'react'
import axios from 'axios';
import * as socket from 'socket.io-client';
import _ from 'lodash'
import './user.css'

const initState = {
    email: '',
    username: '',
    id: '',
    socktId: '',
    devices: []
}

const io = socket.connect('http://192.168.1.3:8090', {
    transports: ['websocket', 'polling'],
    query: {
        token: localStorage.getItem('token'),
    }
})


const DeviceContainerLoading = () => {
    return (
        <div className='device-container'>
            <p>Loading</p>
        </div>  
    );
}

const DeviceContainer = ({ item }) => {

    const handelDevice = prop => {
        if(item.connected) {
            console.log(prop)
            return io.emit('callDevice', item.socketId, prop);
        }
        console.log('notConnected')
    }

    return(
        <div className='device-container'>
            <div className='device-status' style={{backgroundColor: item.connected ? '#19f94d' : 'red'}} />
            <div className='device-headline'>
                <p>{item.deviceName}</p>
                <p>{item.deviceType}</p>
            </div>
            <div className='device-controlls-btns'>
                <button className='controlle-btn' onClick={() => handelDevice('lock')}>Lock</button>
                <button className='controlle-btn' onClick={() => handelDevice('camera')}>Camera</button>
                <button className='controlle-btn' onClick={() => handelDevice('open')}>open web</button>
            </div>
        </div>
    )
}


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
        io.on('device-status', () => {
            LoadUserData();
        });
    })


    const LoadUserData = () => {
        setLoading(true);
        axios({
            method: 'get',
            url: 'http://192.168.1.3:8090/users/user',
            headers: {'auth': localStorage.getItem('token')}
        }).then((res) => {
            const { email, username, id, devices } = res.data;
            setUser({...user, email, username, socktId: io.id, id, devices});
            setLoading(false);
        }).finally(() => {
            console.log('done!')
        })
        .catch(e => {
            localStorage.removeItem('token');
            props.history.push('/signin')
            io.close();
        })
    }

    useEffect(() => {
        if(!localStorage.getItem('token')) {
            props.history.push('/signin')
            io.close();
        }
        // load user on did mount
        LoadUserData();
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
                return <DeviceContainer loading={false} key={index} item={item} />
            })
        }
        return <DeviceContainerLoading />
    }

    return(
        <div>
            <h3>User</h3>
            {loading ? <span>Loading...</span> : <p>{user.username} : {user.email}</p>}
            <div className='devices'>
                <Devices />
            </div>
            <button onClick={talkToSocket}>test</button>
            <button onClick={logout}>Logout</button>
        </div>
    )
}

export default User;