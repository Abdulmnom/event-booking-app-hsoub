import React, { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { EVENTS, CREATE_BOOKING } from "../queries";
import EventItem from '../componets/EventItem';
import EventModal from '../componets/EventModal';
import AuthContext from '../context/auth-context';
import { NavLink } from "react-router-dom";
import Error from '../componets/Error';

const EventPage = () => {
    const [selectedEvent, setSelectedEvent] = useState(null);
    const value = React.useContext(AuthContext);
    const [alert, setAlert] = useState("");
    
    // تعريف متغيرات Query
    const { 
        loading: eventsLoading, 
        error: eventsError, 
        data: eventsData 
    } = useQuery(EVENTS, {
        fetchPolicy: 'network-only',
        onError: (error) => {
            console.error('Events Query Error:', error);
            setAlert("حدث خطأ في جلب البيانات");
        }
    });

    // استخدام useEffect للتحقق من حالة البيانات
    React.useEffect(() => {
        if (!eventsLoading && eventsData?.events.length === 0) {
            setAlert("لا توجد مناسبات متاحة");
        }
    }, [eventsLoading, eventsData]);

    // تعريف متغيرات Mutation
    const [bookingEventHandler, { 
        loading: bookingLoading, 
        error: bookingError 
    }] = useMutation(CREATE_BOOKING, {
        
        onCompleted: (data) => {
            setSelectedEvent(null);
            console.log('تم حجز المناسبة بنجاح', data);
        },
        onError: (error) => {
            console.error('Booking Error:', error);
        }
    });

    if (eventsLoading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">جار التحميل...</span>
                </div>
            </div>
        );
    }

    if (eventsError) {
        return <Error error={eventsError} />;
    }

    const showDetailHandler = eventId => {
        const event = eventsData.events.find(event => event._id === eventId);
        setSelectedEvent(event);
    };

    return (
        <div className="container mt-4 pt-2 text-center pb-3">
            {/* في حالة ضهور اخطاء  */}
            <Error error={eventsError} />

            {alert && <p className="alert alert-info">{alert}</p>}

            {value.token && ( // في حالة وجود توكن يتم عرض الزر
                <div className="events-control mb-4">
                    <h2 className="mb-4 text-center"> انشر مناسباتك </h2>
                    <button className="btn btn-primary"> انشاء مناسبة </button>
                </div>
            )}

           

            {selectedEvent && (
                <EventModal
                    title="تفاصيل المناسبة"
                    onCancel={() => setSelectedEvent(null)}
                    onConfirm={() => {
                        bookingEventHandler({
                            variables: {
                                eventId: selectedEvent._id
                            }
                        });
                    }}
                    confirmText={value.token ? 
                        bookingLoading ? "جاري الحجز..." : "حجز" 
                        : <NavLink to='login'>سجل الدخول لتحجز</NavLink>
                    }
                    isDisabled={selectedEvent.creator._id === value.userId}
                >
                    <div className="text-center">
                        <h2 className="mb-4">{selectedEvent.title}</h2>
                        <p className="mb-4">{selectedEvent.description}</p>
                        <p className="mb-4">السعر: ${selectedEvent.price}</p>
                        <p className="mb-4">
                            التاريخ الهجري :  {new Date(selectedEvent.date).toLocaleDateString('ar-SA')}
                        </p>
                         <p className="mb-4">
                            التاريخ الميلادي: {new Date(selectedEvent.date).toLocaleDateString()}
                        </p>
                        <li  className="list-group-item">اليوم   :{selectedEvent.date.split(' ')[0]} </li>

                        <li  className="list-group-item">الوقت الفعلي  :{selectedEvent.date.split(' ')[2]} </li>
                        {bookingError && (
                            <div className="alert alert-danger">
                                {bookingError.message}
                            </div>
                        )}
                    </div>
                </EventModal>
            )}
            
            <div className="row mb-4">
                <div className="col">
                    <h1 className="text-center">المناسبات المتاحة</h1>
                </div>
            </div>
            
            <div className="row">
                {eventsData?.events.map((event) => (
                    <div className="col-md-4 mb-3" key={event._id}>
                        <EventItem
                            {...event}
                            onDetail={() => showDetailHandler(event._id)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EventPage;