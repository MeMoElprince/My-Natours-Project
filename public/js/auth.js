import axios from 'axios'
import {showAlert} from './alert'

export const logout = async () => {
    try {
        const res = await axios({
            method: 'GET',
            url: '/api/v1/users/logout'
        });
        if(res.data.status == 'success')
        {
            showAlert('success', 'logged out successfully...');
            location.reload(true);
        }
    } catch(err)
    {
        showAlert('error', err.response.data.message);
    }
}

export const authAccount = async (obj, type) => {
    try{
        let message = type === 'login' ? 'You have logged in successfully..' : 'Your account has been successfully created.';
        const res = await axios({
            method: 'POST',
            url: `/api/v1/users/${type}`,
            data: obj
        });
        if(res.data.status == 'success') 
        {
            showAlert('success', message);
            location.assign('/');
        }
    } catch(err){
        showAlert('error', err.response.data.message);
    }
}

// type could be 'password' or 'data' 
export const updateSettings = async(data, type) => {
    try{
        const url = type === 'password' ? `/api/v1/users/updatePassword` : `/api/v1/users/updateMe`
        const res = await axios({
            method: 'PATCH',
            url,
            data
        });
        if(res.data.status === 'success')
        {
            showAlert('success', `${type} has been updated successfully`);
            location.reload(true);
        }
    } catch (err)
    {
        showAlert('error', err.response.data.message);
    }
}