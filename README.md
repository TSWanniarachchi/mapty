# Mapty Application

## Description

Welcome to the Mapty Application! This web application enables you to track your running and cycling workouts. Visualize your workouts on a map, save them locally, and edit or delete them as needed. Explore your exercise routines in a whole new way!

## How to Use

1. **Allow Location Access**: When prompted, allow the browser to access your location.
2. **Log a Workout**:
   - Click on the map to open the workout form.
   - Select the workout type (running or cycling).
   - Fill in the workout details: distance, duration, cadence (for running), or elevation gain (for cycling).
   - Submit the form to log the workout.
3. **Hide Workout Form**: Press the Escape key to hide the form.
4. **Edit or Delete a Workout**:
   - Click the edit (🖊) button on the workout item to modify it.
   - Click the delete (×) button on the workout item to remove it.
5. **Reset Application**: Click the reset button to clear all workouts and reset the application to its initial state.
6. **Show All Workouts**: Click the show all button to adjust the map view to fit all workouts.
7. **Sort Workouts**: Click the sort button to sort workouts by distance in ascending or descending order.

## Features

- **Interactive Map**: View and interact with your workouts on a map.
- **Geolocation**: Use the Geolocation API to get the user's current position and center the map.
- **Workout Logging**: Log running and cycling workouts with various details.
- **Form Toggle**: Dynamic form that toggles between running and cycling input fields based on the workout type.
- **Escape Key Support**: Hide the form using the Escape key.
- **Edit Workouts**: Modify details of existing workouts.
- **Delete Workouts**: Remove unwanted workouts.
- **Reset Application**: Reset the application to its initial state.
- **Show All Workouts**: Automatically adjust the map view to fit all workouts.
- **Sort Workouts**: Sort workouts by distance in ascending or descending order.
- **Error Handling and Confirmation**: Handle invalid input data and confirm actions effectively.
- **Local Storage Integration**: Save and retrieve workouts from the browser's local storage.
- **Persistent Storage**: Persist workouts using Local Storage so that data is not lost on page reload.
- **Rebuild Workouts**: Re-build running and cycling objects coming from Local Storage.
- **Responsive Interface**: User-friendly interface that adapts to different devices and screen sizes.

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Leaflet
- Geolocation API
- Local Storage

## Getting Started

To run the application locally, follow these steps:

1. Clone this repository to your local machine.
2. Open the `index.html` file in your web browser.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This application is for educational purposes and personal use. The code provided is open-source, and you are free to use, modify, and distribute it as per the license agreement.

Enjoy your workout tracking with Mapty! 🏃‍♂️🚴‍♀️
