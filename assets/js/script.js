"use strict";

///////////////////////////////////////
// DATA ARCHITECTURE

class Workout {
  constructor(date, coords, distance, duration) {
    this.date = new Date(date);
    this.id = this.date.getTime().toString().slice(-10);
    this.coords = coords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }

  // Set description for the workout
  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Running extends Workout {
  type = "running";

  constructor(date, coords, distance, duration, cadence) {
    super(date, coords, distance, duration);
    this.cadence = cadence;

    this.calcPace();
    this._setDescription();
  }

  // Calculate pace in min/km
  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = "cycling";

  constructor(date, coords, distance, duration, elevationGain) {
    super(date, coords, distance, duration);
    this.elevationGain = elevationGain;

    this.calcSpeed();
    this._setDescription();
  }

  // Calculate speed in km/h
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60); // km/h
    return this.speed;
  }
}

///////////////////////////////////////
// APPLICATION ARCHITECTURE

// DOM Elements
const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form__input--type");
const inputDistance = document.querySelector(".form__input--distance");
const inputDuration = document.querySelector(".form__input--duration");
const inputCadence = document.querySelector(".form__input--cadence");
const inputElevation = document.querySelector(".form__input--elevation");
const btnReset = document.querySelector(".action__btn--reset");
const btnShowAll = document.querySelector(".action__btn--show-all");

class App {
  #map;
  #mapZoomLevel = 13;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition();
    this._getLocalStorage();
    this._enableActionButtons();

    inputType.addEventListener("change", this._toggleWorkoutFields);
    form.addEventListener("submit", this._newWorkout.bind(this));
    document.addEventListener("keydown", this._handleEscKey.bind(this));
    containerWorkouts.addEventListener("click", this._moveToPopup.bind(this));
    btnReset.addEventListener("click", this._reset.bind(this));
    btnShowAll.addEventListener("click", this._fitMapToAllWorkouts.bind(this));
  }

  // Get user's current position using Geolocation API
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("Could not get your position!");
        }
      );
    }
  }

  // Load map using Leaflet library
  _loadMap(position) {
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];

    this.#map = L.map("map").setView(coords, this.#mapZoomLevel);

    L.tileLayer("https://tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Handling clicks on map
    this.#map.on("click", this._showForm.bind(this));

    // Render existing workouts on the map
    this.#workouts.forEach((workout) => {
      this._renderWorkoutMarker(workout);
    });
  }

  // Enable the action buttons
  _enableActionButtons() {
    if (this.#workouts.length) {
      btnReset.disabled = false;
      btnShowAll.disabled = false;
    }
  }

  // Show form on map click
  _showForm(mapE) {
    this.#mapEvent = mapE;

    form.classList.remove("hidden");
    inputDistance.focus();
  }

  // Hide form and reset fields
  _hideForm() {
    inputDistance.value = "";
    inputDuration.value = "";
    inputCadence.value = "";
    inputElevation.value = "";

    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => ((form.style.display = "grid"), 1000));
  }

  // Toggles visibility and required status of input fields based on selected workout type
  _toggleWorkoutFields() {
    inputCadence.closest(".form__row").classList.toggle("form__row--hidden");
    inputElevation.closest(".form__row").classList.toggle("form__row--hidden");

    const type = inputType.value;

    if (type === "running") {
      inputCadence.setAttribute("required", "");
      inputElevation.removeAttribute("required");
    }

    if (type === "cycling") {
      inputElevation.setAttribute("required", "");
      inputCadence.removeAttribute("required");
    }
  }

  // Handle Escape key to hide form
  _handleEscKey(event) {
    if (event.key === "Escape" || event.keyCode === 27) {
      this._hideForm();
    }
  }

  // Create a new workout based on form data
  _newWorkout(event) {
    event.preventDefault();

    const validInputs = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every((inp) => inp > 0);

    // Get data from form
    const date = new Date();
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;

    let workout;

    // If workout running, create running object
    if (type === "running") {
      const cadence = +inputCadence.value;

      // Check if data is valid
      if (!validInputs(distance, duration, cadence))
        return alert(
          "Please enter valid numbers for distance, duration, and cadence."
        );

      if (!allPositive(distance, duration, cadence))
        return alert(
          "Please make sure distance, duration, and cadence are all positive numbers."
        );

      workout = new Running(date, [lat, lng], distance, duration, cadence);
    }

    // If workout cycling, create cycling object
    if (type === "cycling") {
      const elevation = +inputElevation.value;

      // Check if data is valid
      if (!validInputs(distance, duration, elevation))
        return alert(
          "Please enter valid numbers for distance, duration, and elevation."
        );

      if (!allPositive(distance, duration))
        return alert(
          "Please make sure distance, and duration are all positive numbers."
        );

      workout = new Cycling(date, [lat, lng], distance, duration, elevation);
    }

    // Add new object to workout array
    this.#workouts.push(workout);

    // Set local storage to all workouts
    this._setLocalStorage();

    // Render workout on map as marker
    this._renderWorkoutMarker(workout);

    // Render workout on list
    this._renderWorkout(workout);

    // Hide form + clear input fields
    this._hideForm();

    // Enable the action buttons
    this._enableActionButtons();
  }

  // Render workout marker on the map
  _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          minWidth: 100,
          maxWidth: 250,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"} ${workout.description}`
      )
      .openPopup();
  }

  // Render workout on the list
  _renderWorkout(workout) {
    let html = `
      <li class="workout workout--${workout.type}" data-id="${workout.id}">
        <div class="workout__actions">
          <button class="workout__btn workout__btn--edit" title="Edit">🖊</button>
          <button class="workout__btn workout__btn--delete" title="Delete">&times;</button>
        </div>
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
    `;

    if (workout.type === "running") {
      html += ` 
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.pace.toFixed(1)}</span>
          <span class="workout__unit">min/km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">🦶🏼</span>
          <span class="workout__value">${workout.cadence}</span>
          <span class="workout__unit">spm</span>
        </div>
      </li>
      `;
    }

    if (workout.type === "cycling") {
      html += ` 
        <div class="workout__details">
          <span class="workout__icon">⚡️</span>
          <span class="workout__value">${workout.speed.toFixed(1)}</span>
          <span class="workout__unit">km/h</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⛰</span>
          <span class="workout__value">${workout.elevationGain}</span>
          <span class="workout__unit">m</span>
        </div>
      </li>
      `;
    }

    form.insertAdjacentHTML("afterend", html);
  }

  // Move map to workout marker on clicking workout in the list
  _moveToPopup(event) {
    const workoutEL = event.target.closest(".workout");

    if (!workoutEL) return;

    const workout = this.#workouts.find(
      (workout) => workout.id === workoutEL.dataset.id
    );

    this.#map.setView(workout.coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }

  // Store workouts in local storage
  _setLocalStorage() {
    localStorage.setItem("workouts", JSON.stringify(this.#workouts));
  }

  // Retrieve workouts from local storage
  _getLocalStorage() {
    const storedWorkouts = JSON.parse(localStorage.getItem("workouts"));

    if (!storedWorkouts) return;

    this.#workouts = storedWorkouts.map((storedWorkout) => {
      if (storedWorkout.type === "running") {
        return new Running(
          storedWorkout.date,
          storedWorkout.coords,
          storedWorkout.distance,
          storedWorkout.duration,
          storedWorkout.cadence
        );
      }

      if (storedWorkout.type === "cycling") {
        return new Cycling(
          storedWorkout.date,
          storedWorkout.coords,
          storedWorkout.distance,
          storedWorkout.duration,
          storedWorkout.elevationGain
        );
      }
    });

    // Render the local storage workouts
    this.#workouts.forEach((workout) => this._renderWorkout(workout));
  }

  // Reset all workouts and reload the page
  _reset() {
    if (!this.#workouts.length) return;

    const confirmation = confirm(
      "Are you sure you want to reset all workouts?"
    );

    if (!confirmation) return;

    localStorage.removeItem("workouts");
    location.reload();
  }

  // Fit map to show all workout markers
  _fitMapToAllWorkouts() {
    if (!this.#workouts.length) return;

    const workoutLocations = this.#workouts.map((workout) => workout.coords);
    this.#map.fitBounds(workoutLocations);
  }
}

const app = new App();
