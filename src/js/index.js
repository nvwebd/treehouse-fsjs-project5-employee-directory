(doc => {

  /**
   * [state whole application state to track state changes]
   * @type {Object}
   */
  const state = {
    users: undefined,
    selectedUser: undefined,
    modalOpen: undefined,
    usersFiltered: false,
    filteredUsers: undefined
  };

  /**
   * [filterUsersByUsernameOrName filters the users on the input from searchbox]
   * @param  {[DOMEvent]} event [DOMEvent which fires on every input]
   * @return {[void]}       [no return value]
   */
  const filterUsersByUsernameOrName = event => {
    state.usersFiltered = event.target.value.length > 0;

    state.filteredUsers = state.users.filter(userdata => {
      const fullName = `${userdata.name.first} ${userdata.name.last}`;

      if (
        fullName.includes(event.target.value) ||
        userdata.login.username.includes(event.target.value)
      ) {
        return userdata;
      }

      return null;
    });

    injectUsersData(state.filteredUsers);
  };

  /**
   * [eventBinder this function binds events to the input elements]
   * @param  {[DOMElement]} elementToBindTo [which element should be bound with an event]
   * @param  {[DOMEvent]} eventName       [event type to be bound]
   * @param  {[function]} eventResolver   [the function that will take care of the event trigger]
   * @return {[void]}                 [no return]
   */
  const eventBinder = (elementToBindTo, eventName, eventResolver) =>
    elementToBindTo.addEventListener(eventName, eventResolver);

  /**
   * [capitalizeString function capitalizes the input string]
   * @param  {String} string [input string that has to be capitalized]
   * @return {String}        [capitalized string]
   */
  const capitalizeString = string => string[0].toUpperCase() + string.substr(1);

  /**
   * [buildEmployeeGrid description]
   * @param  {Array} users [array of user objects to be used in the grid]
   * @return {String}       [returns the template string to be injected in the DOM]
   */
  const buildEmployeeGrid = users => {
    let gridTemplate = "";
    gridTemplate += users.map(
      (user, index) =>
        `<figure class="user-container" id="${index}">
        <div>
          <img src="${user.picture.large}" alt="">
        </div>
        <figcaption>
          <h1>
            ${capitalizeString(user.name.first)} ${capitalizeString(
          user.name.last
        )}
          </h1>
          <h3>${user.email}</h3>
          <h3>${capitalizeString(user.location.city)}</h3>
        </figcaption>
      </figure>`
    );

    return gridTemplate.replace(/,/g, "");
  };

  /**
   * [injectUsersData injects the user data into the DOM]
   * @param  {Array} users [array of user objects]
   * @return {void}       [function has no return value]
   */
  const injectUsersData = users => {
    doc.getElementById("employee-grid-container").innerHTML = buildEmployeeGrid(
      users
    );
    bindClickListenerToUserCard();
  };

  /**
   * [escKeyResolver function resolves the ESC keypress event]
   * @param  {DOMEvent} event [keypress event]
   * @return {void}       [no return value]
   */
  const escKeyResolver = event => {
    if (event.keyCode === 27) {
      state.modalOpen = false;
      doc.getElementById("user-modal").style.display = "none";
      toggleOverlay(false);
    }
  };

  /**
   * [buildUserModal builds the users modal template]
   * @param  {Object} user [the user that was clicked on]
   * @return {String}      [returns the template string array]
   */
  const buildUserModal = user => {
    const birthDayRaw = new Date(user.dob.date);
    const birthDay = birthDayRaw.toLocaleDateString("en-US");

    eventBinder(window, "keydown", escKeyResolver);

    return `<section class="close-btn" id="close-btn">
        &times;
      </section>
      <section class="main-row-container">
        <section class="left-arrow-container">
          <i class="modal-arrow-left"></i>
        </section>
        <section class="main-modal-content">
          <section class="user-img">
            <img src="${user.picture.large}" alt="">
          </section>
          <section class="user-main-data">
            <p class="user-name">${capitalizeString(
              user.name.first
            )} ${capitalizeString(user.name.last)}</p>
            <p class="user-mail">${user.email}</p>
            <p class="user-area">${capitalizeString(user.location.city)}</p>
          </section>
          <hr class="modal-divider">
          <section class="user-details">
            <p class="user-phone">${user.phone}</p>
            <p class="user-address">${user.location.street}, WV ${
      user.location.postcode
    }</p>
            <p class="user-bday">Birthday: ${birthDay}</p>
          </section>
        </section>
        <section class="right-arrow-container">
          <i class="modal-arrow-right"></i>
        </section>
      </section>
      `;
  };

  /**
   * [closeButtonResolver function resolves the click event on "X" button of the modal]
   * @return {void} [no return value]
   */
  const closeButtonResolver = () => {
    doc.getElementById("user-modal").style.display = "none";
    state.modalOpen = false;
    toggleOverlay(false);
  };

  /**
   * [leftArrowClickResolver function resolves the click event on the left arrow in the modal]
   * @return {void} [no return value]
   */
  const leftArrowClickResolver = () => {
    let currentUser;

    if (state.usersFiltered) {
      currentUser =
        parseInt(state.selectedUser, 10) !== 0
          ? parseInt(state.selectedUser, 10) - 1
          : state.filteredUsers.length - 1;
    } else {
      currentUser =
        parseInt(state.selectedUser, 10) !== 0
          ? parseInt(state.selectedUser, 10) - 1
          : state.users.length - 1;
    }

    injectModalData(currentUser);
  };

  /**
   * [rightArrowClickResolver function resolves the click event on the right arrow in the modal]
   * @return {void} [no return value]
   */
  const rightArrowClickResolver = () => {
    let currentUser;

    if (state.usersFiltered) {
      currentUser =
        parseInt(state.selectedUser, 10) < state.filteredUsers.length - 1
          ? parseInt(state.selectedUser, 10) + 1
          : 0;
    } else {
      currentUser =
        parseInt(state.selectedUser, 10) < state.users.length - 1
          ? parseInt(state.selectedUser, 10) + 1
          : 0;
    }

    injectModalData(currentUser);
  };

  /**
   * [injectModalData function injects all data and resolvers for the user modal]
   * @param  {String} userId [the users ID that should be shown]
   * @return {void}        [no return value]
   */
  const injectModalData = userId => {
    const userModalDiv = doc.getElementById("user-modal");
    state.modalOpen = true;
    state.selectedUser = userId;
    if (state.filteredUsers) {
      userModalDiv.innerHTML = buildUserModal(
        state.filteredUsers[state.selectedUser]
      );
    } else {
      userModalDiv.innerHTML = buildUserModal(state.users[state.selectedUser]);
    }
    userModalDiv.style.display = "flex";

    eventBinder(
      doc.getElementsByClassName("modal-arrow-left")[0],
      "click",
      leftArrowClickResolver
    );

    eventBinder(
      doc.getElementsByClassName("modal-arrow-right")[0],
      "click",
      rightArrowClickResolver
    );
    eventBinder(doc.getElementById("close-btn"), "click", closeButtonResolver);
  };

  /**
   * [cardClickHandler function resolves - injects the right data into the modal]
   * @param  {DOMEvent} event [event triggered on the user card]
   * @return {void}       [no return value]
   */
  const cardClickHandler = event => {
    toggleOverlay(true);

    if (event.target.id) {
      injectModalData(event.target.id);
    } else if (event.target.parentNode.id) {
      injectModalData(event.target.parentNode.id);
    } else if (event.target.parentNode.parentNode.id) {
      injectModalData(event.target.parentNode.parentNode.id);
    }
  };

  /**
   * [bindClickListenerToUserCard binds an click event listener to the user card]
   * @return {void} [no return value]
   */
  const bindClickListenerToUserCard = () => {
    const userCards = doc.getElementsByClassName("user-container");

    for (let i = 0; i < userCards.length; i++) {
      eventBinder(userCards[i], "click", cardClickHandler, true);
    }
  };

  /**
   * [bindKeydownToSearchFilter binds an event listner to the search input box]
   * @return {void} [no return value]
   */
  const bindKeydownToSearchFilter = () => {
    const filterInput = doc.getElementById("search");

    eventBinder(filterInput, "keyup", filterUsersByUsernameOrName);
  };

  /**
   * [windowLoaderTemplate returns the template for the loader]
   * @return {String} [returns the template string]
   */
  const windowLoaderTemplate = () => {
    return `<div class="spinner-wrapper">
      <div class="lds-spinner">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      </div>
    </div>`;
  };

  /**
   * [windowLoaderToggler toggles on/off the loader]
   * @param  {Boolean} enable [true when it should be shown / false when to hide it]
   * @return {void}        [no return value]
   */
  const windowLoaderToggler = enable => {
    if (enable) {
      doc.getElementById(
        "employee-grid-container"
      ).innerHTML = windowLoaderTemplate();
    } else {
      doc.getElementById("employee-grid-container").innerHTML = "";
    }
  };

  /**
   * [toggleOverlay shows/hides the overlay for modal]
   * @param  {Boolean} enable [true: show the overlay / false: hide the overlay]
   * @return {void}        [no return value]
   */
  const toggleOverlay = enable => {
    if (enable) {
      doc.getElementById("overlay").classList.add("overlay");
    } else {
      doc.getElementById("overlay").classList.remove("overlay");
    }
  };

  /**
   * [main function starts the app and bind all the data / listeners]
   * @return {void} [no return value]
   */
  const main = () => {
    doc.getElementById("overlay").addEventListener("click", () => {
      toggleOverlay(false);
      state.modalOpen = false;
      doc.getElementById("user-modal").style.display = "none";
    });

    windowLoaderToggler(true);
    fetch("https://randomuser.me/api/?results=12&nat=us")
      .then(response => response.json())
      .then(data => {
        state.users = [...data.results];

        windowLoaderToggler(false);
        injectUsersData(data.results);

        bindClickListenerToUserCard();
        bindKeydownToSearchFilter();
      })
      .catch(error => console.error(error));
  };

  main();
})(document);
