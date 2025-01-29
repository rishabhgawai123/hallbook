import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, query, where } from "https://www.gstatic.com/firebasejs/9.17.2/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_bdZgyZy6yvXSVFozGwtl6xrV575TyHk",
  authDomain: "hall-edaad.firebaseapp.com",
  projectId: "hall-edaad",
  storageBucket: "hall-edaad.firebasestorage.app",
  messagingSenderId: "208320834111",
  appId: "1:208320834111:web:102c387bfb1c7d2fd9668a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const bookingsCollection = collection(db, "bookings");

document.addEventListener('DOMContentLoaded', async () => {
  const checkButton = document.getElementById('check-button');
  const availabilityResult = document.getElementById('availability-result');
  const bookForm = document.getElementById('book-form');
  const checkBookingForm = document.getElementById('check-booking-form');
  const dateInput = document.getElementById('date');

  // Fetch all bookings from Firestore
  const fetchBookings = async () => {
    const querySnapshot = await getDocs(bookingsCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

  const bookings = await fetchBookings();

  // Check availability
  checkButton.addEventListener('click', async () => {
    const selectedDate = dateInput.value;

    if (!selectedDate) {
      availabilityResult.textContent = 'Please select a date.';
      availabilityResult.style.color = 'red';
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (selectedDate < today) {
      availabilityResult.textContent = 'You cannot book a past date.';
      availabilityResult.style.color = 'red';
      bookForm.style.display = 'none';
      return;
    }

    // Check if the date is already booked
    const existingBooking = bookings.find((booking) => booking.date === selectedDate);

    if (existingBooking) {
      availabilityResult.innerHTML = `
        Sorry, the hall is already booked for this date.<br>
        <strong>Name:</strong> ${existingBooking.name}<br>
        <strong>Mobile:</strong> ${existingBooking.mobile}<br>
        <button id="cancel-button">Cancel Booking</button>
      `;
      availabilityResult.style.color = 'red';
      bookForm.style.display = 'none';

      // Add cancel functionality
      document.getElementById('cancel-button').addEventListener('click', async () => {
        if (confirm(`Are you sure you want to cancel the booking for ${selectedDate}?`)) {
          await deleteDoc(bookingsCollection.doc(existingBooking.id));
          alert('Booking canceled successfully.');
          location.reload();
        }
      });
    } else {
      availabilityResult.textContent = 'Great! The hall is available for this date.';
      availabilityResult.style.color = 'green';
      bookForm.style.display = 'block';
    }
  });

  // Handle booking
  bookForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = bookForm.querySelector('input[name="name"]').value.trim();
    const mobile = bookForm.querySelector('input[name="mobile"]').value.trim();
    const selectedDate = dateInput.value;

    if (!name || !mobile) {
      alert('Please fill in all fields.');
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }

    // Add the new booking to Firestore
    await addDoc(bookingsCollection, { date: selectedDate, name, mobile });
    alert(`Thank you, ${name}! Your booking for ${selectedDate} has been confirmed.`);

    // Reset the forms
    checkBookingForm.reset();
    bookForm.reset();
    bookForm.style.display = 'none';
    availabilityResult.textContent = '';
    location.reload();
  });
});
