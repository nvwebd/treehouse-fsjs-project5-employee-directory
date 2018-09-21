(doc => {

  /**
   * [state whole application state to track state changes]
   * @type {Object}
   */
  const state = {
    users: undefined,
    selectedUser: undefined,
    modalOpen: undefined
  };

  /**
   * [filterUsersByUsernameOrName filters the users on the input from searchbox]
   * @param  {[DOMEvent]} event [DOMEvent which fires on every input]
   * @return {[void]}       [no return value]
   */
  const filterUsersByUsernameOrName = event => {
    // TODO: every typed character should filter the users!

    injectUsersData(
      state.users.filter(userdata => {
        const fullName = userdata.name.first + userdata.name.last;

        return fullName.includes(event.target.value);
      })
    );
    console.log("typing: ", event.target.value);
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

  const eventDisolver = (elementToDisolveFrom, eventType, eventToRemove) =>
    elementToDisolveFrom.addEventListener(eventType, eventToRemove);

  const capitalizeString = string => string[0].toUpperCase() + string.substr(1);

  const buildEmployeeGrid = users => {
    let gridTemplate = "<section class=\"three-column-row\">";

    users.map((user, index) => {
      gridTemplate += `<figure class="user-container col" id="${index}">
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
      </figure>`;

      if (index === 2 || index === 5 || index === 8) {
        gridTemplate += "</section><section class=\"three-column-row\">";
      }
    });

    gridTemplate += "</section>";

    return gridTemplate;
  };

  const injectUsersData = users => {
    doc.getElementById("employee-grid-container").innerHTML = buildEmployeeGrid(
      users
    );
  };

  const escKeyResolver = event => {
    if (event.keyCode === 27) {
      state.modalOpen = false;
      doc.getElementById("user-modal").style.display = "none";
      toggleOverlay(false);
    }
  };

  const buildUserModal = user => {
    // tODO: implement a loader until all data is loaded
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

  const closeButtonResolver = () => {
    doc.getElementById("user-modal").style.display = "none";
    toggleOverlay(false);
  };

  const outsideModalClickResolver = event => {
    // console.log(event.target);
  };

  const leftArrowClickResolver = () => {
    const currentUser =
      parseInt(state.selectedUser, 10) !== 0
        ? parseInt(state.selectedUser, 10) - 1
        : state.users.length - 1;
    injectModalData(currentUser);
  };

  const rightArrowClickResolver = () => {
    const currentUser =
      parseInt(state.selectedUser, 10) < state.users.length - 1
        ? parseInt(state.selectedUser, 10) + 1
        : 1;
    injectModalData(currentUser);
  };

  const injectModalData = userId => {
    const userModalDiv = doc.getElementById("user-modal");

    state.modalOpen = true;
    state.selectedUser = userId;
    userModalDiv.innerHTML = buildUserModal(state.users[userId]);
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
    eventBinder(doc, "click", outsideModalClickResolver);
  };

  const cardClickHandler = event => {
    console.log("clicked card");

    toggleOverlay(true);

    if (event.target.id) {
      injectModalData(event.target.id);
    } else if (event.target.parentNode.id) {
      injectModalData(event.target.parentNode.id);
    } else if (event.target.parentNode.parentNode.id) {
      injectModalData(event.target.parentNode.parentNode.id);
    }
  };

  const bindClickListenerToUserCard = () => {
    const userCards = doc.getElementsByClassName("user-container");

    for (let i = 0; i < userCards.length; i++) {
      eventBinder(userCards[i], "click", cardClickHandler, true);
    }
  };

  const bindKeydownToSearchFilter = () => {
    const filterInput = doc.getElementById("search");

    eventBinder(filterInput, "keyup", filterUsersByUsernameOrName);
  };

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

  const windowLoaderToggler = enable => {
    if (enable) {
      doc.getElementById(
        "employee-grid-container"
      ).innerHTML = windowLoaderTemplate();
    } else {
      doc.getElementById("employee-grid-container").innerHTML = "";
    }
  };

  const toggleOverlay = enable => {
    if (enable) {
      doc.getElementById("overlay").classList.add("overlay");
    } else {
      doc.getElementById("overlay").classList.remove("overlay");
    }
  };

  const main = () => {
    doc.getElementById("overlay").addEventListener("click", () => {
      toggleOverlay(false);
      state.modalOpen = false;
      doc.getElementById("user-modal").style.display = "none";
    });

    // tODO: add a loader until the data is fetched
    windowLoaderToggler(true);
    fetch("https://randomuser.me/api/?results=12&nat=us")
      .then(response => response.json())
      .then(data => {
        state.users = [...data.results];
        windowLoaderToggler(false);
        injectUsersData(data.results);
        bindClickListenerToUserCard();
        bindKeydownToSearchFilter();
        console.log(state.users);
      })
      .catch(error => console.error(error));
  };

  main();
})(document);

// setUsersState(response.data.results);
