(doc => {
  const getUsersFromApi = () => {
    const apiUrl = `https://randomuser.me/api/?results=12`;

    axios
      .get(apiUrl)
      .then(response => {
        console.log('response.data.results: ', response);
      })
      .catch(error => console.log('ERROR: ', error));
  };

  getUsersFromApi();
})(document);
