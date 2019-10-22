import React, { useState, useEffect} from 'react';
import axios from 'axios';


const style = {
    input: {
        width: 300,
        height: 60,
        padding: '5px',
        fontSize: '1.2rem',
        marginBottom: '8px'
    },
    btn: {
        height: 60
    },

    loginContainer: {
        display: 'flex',
        flexDirection: 'column'
    }
}

const initState = {
    email: '',
    password: ''
}

const Login = props => {
    const [values, setValues] = useState(initState);
    const [done, setDone] = useState(false);

    const handelChange = prpo => event => {
        setValues({...values, [prpo]: event.target.value});
    }

    useEffect(() => {
        const { email, password } = values;
        if(email.length >= 6 && password.length >= 6) {
            return setDone(true);
        } else {
            setDone(false)
        }
    }, [values, setValues])

    useEffect(() => {
        if(localStorage.getItem('token')) {
            props.history.push('/user')
        }
    }, [])

    const submitForm = () => {
        console.log('ss')
        axios({
            method: 'post',
            url: 'http://192.168.1.3:8090/users/login',
            headers: {'Content-Type': 'application/json'},
            data: {
                email: values.email,
                password: values.password
            }
        }).then((res) => {
            if(res.data.token) {
                localStorage.setItem('token', res.data.token);
                props.history.push('/user')
            }
        }).catch(e => {
            console.log(e)
        }).finally(() => {
            console.log('Done fetching')
        })
    }

    return(
        <div style={style.loginContainer}>
            <input 
            type='text' 
            style={style.input}
            value={values.email} 
            onChange={handelChange('email')} 
            placeholder='Email' 
            />
            <input
            style={style.input}
            type='password' 
            value={values.password} 
            onChange={handelChange('password')} 
            placeholder='Password' 
            />
            <button style={style.btn} onClick={submitForm} disabled={done ? false : true}>Login</button>
        </div>
    );
}

export default Login;