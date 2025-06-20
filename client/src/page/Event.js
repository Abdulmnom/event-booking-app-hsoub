import React, { useState, useEffect, useContext } from "react";
import { useMutation, useQuery, useApolloClient } from "@apollo/client";
import { EVENTS, CREATE_BOOKING, CREATE_EVENT , EVENT_ADDED_SUBSCRIPTION } from "../queries";
import EventItem from "../componets/EventItem";
import EventModal from "../componets/EventModal";
import AuthContext from "../context/auth-context";
import { NavLink } from "react-router-dom";
import Error from "../componets/Error";
import { useSubscription } from "@apollo/client";
import Spinner from "../componets/Spinner";

const EventPage = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const value = useContext(AuthContext);
  const [alert, setAlert] = useState("");
  const [creatingEvent, setCreatingEvent] = useState(false);
  const [modelAlert, setModelAlert] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [price, setPrice] = useState("");
  const client = useApolloClient();
  useSubscription(EVENT_ADDED_SUBSCRIPTION, {
    onSubscriptionData: async ({ subscriptionData }) => {
      if (subscriptionData) {
        const addedEvent = subscriptionData.data.eventAdded;
        setAlert(`تم انشاء مناسبة جديدة ${addedEvent.title}`);
      }
      if(subscriptionData.data.eventAdded.creator._id === value.userId){
        setAlert("تم انشاء مناسبة جديدة من قبلك");
      }
      if(subscriptionData.error) {
        setAlert("فشل جلب المناسبات الجديدة");
      }
    },
    
  })

  const {
    loading: eventsLoading,
    error: eventsError,
    data: eventsData,
  } = useQuery(EVENTS, {
    fetchPolicy: "network-only",
    onError: (error) => {
      console.error("Events Query Error:", error);
      setAlert("حدث خطأ في جلب البيانات");
    },
  });

  useEffect(() => {
    if (!eventsLoading && eventsData?.events.length === 0) {
      setAlert("لا توجد مناسبات متاحة");
    }
  }, [eventsLoading, eventsData]);

  const [bookingEventHandler, { loading: bookingLoading, error: bookingError }] =
    useMutation(CREATE_BOOKING, {
      onCompleted: (data) => {
        setSelectedEvent(null);
        console.log("تم حجز المناسبة بنجاح", data);
      },
      onError: (error) => {
        console.error("Booking Error:", error);
      },
    });

  const [eventConfirmHandler] =
    useMutation(CREATE_EVENT, {
      onCompleted: () => {
        setCreatingEvent(false);
        setAlert("تم انشاء المناسبة بنجاح");
        setTitle("");
        setDescription("");
        setDate("");
        setPrice("");
        client.refetchQueries({ include: [EVENTS] });
      },
      onError: (error) => {
        console.error("Create Event Error:", error);
        setModelAlert(error.message || "حدث خطأ أثناء انشاء المناسبة");
      },
      refetchQueries: [{ query: EVENTS }],
    });

  if (eventsLoading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">جار التحميل...</span>
          <Spinner />
        </div>
      </div>
    );
  }

  if (eventsError) return <Error error={eventsError} />;

  const formatEventDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      hijriDate: date.toLocaleDateString("ar-SA"),
      gregorianDate: date.toLocaleDateString(),
      time: date.toLocaleTimeString("ar-SA"),
      day: date.toLocaleDateString("ar-SA-u-ca-islamic", { weekday: "long" }),
    };
  };

  const showDetailHandler = (eventId) => {
    const event = eventsData.events.find((event) => event._id === eventId);
    setSelectedEvent(event);
  };

  return (
    <div className="container mt-4 pt-2 text-center pb-3">
      <Error error={eventsError} />
      {alert && <p className="alert alert-info">{alert}</p>}

      {value.token && (
        <div className="events-control mb-4">
          <h2 className="mb-4 text-center">انشر مناسباتك</h2>
          <button className="btn btn-primary" onClick={() => setCreatingEvent(true)}>
            انشاء مناسبة
          </button>
        </div>
      )}

      {creatingEvent && (
        <EventModal
          title="انشاء مناسبة جديدة"
          onCancel={() => setCreatingEvent(false)}
          onConfirm={() => {
            if (!title || !description || !date || !price) {
              setModelAlert("جميع الحقول مطلوبة");
              return;
            }

            const parsedPrice = parseFloat(price);
            if (isNaN(Date.parse(date)) || isNaN(parsedPrice) || parsedPrice <= 0) {
              setModelAlert("التاريخ أو السعر غير صالح");
              return;
            }

            eventConfirmHandler({
              variables: {
                eventInput: { title, description, date, price: parsedPrice },
              },
            });

            setModelAlert("");
            setTitle("");
            setDescription("");
            setDate("");
            setPrice("");
          }}
          confirmText="انشاء"
        >
          <div className="text-center">
            <form>
              <Error error={modelAlert} />
              <div className="form-group">
                <label htmlFor="title">العنوان</label>
                <input
                  type="text"
                  className="form-control"
                  id="title"
                  value={title}
                  onChange={({ target }) => setTitle(target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">الوصف</label>
                <textarea
                  className="form-control"
                  id="description"
                  rows="3"
                  value={description}
                  onChange={({ target }) => setDescription(target.value)}
                ></textarea>
              </div>
              <div className="form-group">
                <label htmlFor="price">السعر</label>
                <input
                  type="number"
                  className="form-control"
                  id="price"
                  value={price}
                  onChange={({ target }) => setPrice(target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="date">التاريخ</label>
                <input
                  type="date"
                  className="form-control"
                  id="date"
                  value={date}
                  onChange={({ target }) => setDate(target.value)}
                />
              </div>
            </form>
          </div>
        </EventModal>
      )}

      {selectedEvent && (
        <EventModal
          title="تفاصيل المناسبة"
          onCancel={() => {
            setSelectedEvent(null);
            setAlert("");
          }}
          onConfirm={() => {
            bookingEventHandler({ variables: { eventId: selectedEvent._id } });
          }}
          confirmText={value.token ? (
            bookingLoading ? "جاري الحجز..." : "حجز"
          ) : (
            <NavLink to="/login">سجل الدخول لتحجز</NavLink>
          )}
          isDisabled={selectedEvent.creator._id === value.userId}
        >
          <div className="text-center">
            <h2 className="mb-4">{selectedEvent.title}</h2>
            <p className="mb-4">{selectedEvent.description}</p>
            <p className="mb-4">السعر: ${selectedEvent.price}</p>
            {(() => {
              const { hijriDate, gregorianDate, time, day } = formatEventDateTime(
                selectedEvent.date
              );
              return (
                <>
                  <p className="mb-4">التاريخ الهجري: {hijriDate}</p>
                  <p className="mb-4">التاريخ الميلادي: {gregorianDate}</p>
                  <p className="mb-4">الوقت: {time}</p>
                  <p className="mb-4">اليوم: {day}</p>
                </>
              );
            })()}
            {bookingError && (
              <div className="alert alert-danger">{bookingError.message}</div>
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
            <EventItem {...event} onDetail={() => showDetailHandler(event._id)} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventPage;
