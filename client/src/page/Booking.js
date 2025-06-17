import React  from 'react';

import AuthContext  from '../context/auth-context';
import { useApolloClient } from '@apollo/client';
import { useQuery } from '@apollo/client';
import Error from '../componets/Error';
import BookingItem from '../componets/BookingItem';
import { CANCEL_BOOKING, BOOKINGS } from '../queries';
import { useMutation } from '@apollo/client';


const BookingPage = () => {
    const [alert , setAlert] = React.useState(null);
    const authContext = React.useContext(AuthContext);
    const client = useApolloClient();

    function BookingList(){
        const {loading, error, data} = useQuery(BOOKINGS)

            if(loading) return <p>Loading...</p>;
            if(error) return <p>Error: {error.message}</p>;
            if(!data || !data.bookings || data.bookings.length === 0) {
                return <p>لا توجد حجوزات حالياً.</p>;
            }
            client.refetchQueries({ include: [BOOKINGS] });
            return(
               <div>
                <Error error={alert} />
                <div className="row">
                    <div className ="col-md-4 offset-md-4">
                        {data.bookings.map(booking => (
                            <BookingItem
                                key={booking._id}
                                {...booking}
                                onCancelBooking={() => {
                                    cancelBooking({
                                        variables: { bookingId: booking._id },
                                    });
                                }}
                            />
                        ))}
                    </div>
                </div>
               </div>
            )

    }
const [cancelBooking] = useMutation(CANCEL_BOOKING, {
      onCompleted: (cancelBookingData) => {
        setAlert("تم إلغاء الحجز بنجاح");
        client.refetchQueries({ include: [BOOKINGS] });
      },
      onError: (error) => {
        console.error("Cancel Booking Error:", error);
        setAlert(error.message);
      },
    });


    // BookingPage component

    return (
        <div>
            
            {authContext.token && <BookingList />}
           
            {!authContext.token && <p>يجب تسجيل الدخول لعرض الحجوزات <br/> <a href="/login">تسجيل الدخول</a></p>}
        </div>
    );
}
export default BookingPage;