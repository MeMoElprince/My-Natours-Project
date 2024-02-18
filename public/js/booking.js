import axios from 'axios'
import {showAlert} from './alert'


export const checkout = async (tourId) => {
    // 1) getting the session from our API
    try {
        const res = await axios({
            method: 'GET',
            url: `/api/v1/bookings/check-out/${tourId}`
        });
        // 2) proccessing the checkout
        if(res.data.status === 'success')
        {
            const stripe = Stripe('pk_test_51OjcvaDlPQ0LmXB9TNJAVulF9L7CBgs2syqSQhg613yMNYXTYJ278aAw76OO9VyYx1YnhGbprSVwDncFXiu4hJnp00kZ92oHwt');
            showAlert('success', 'Please wait, we are trying to direct you...');
            const {session} = res.data;
            await stripe.redirectToCheckout({
                sessionId: session.id
            });
        }
    } catch (err)
    {
        showAlert('error', err.response.data.message);
    }
}