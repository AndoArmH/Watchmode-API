const readline = require('readline');
const axios = require('axios');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const API_KEY = '***';

function searchMovies(title) {
  const searchUrl = `https://api.watchmode.com/v1/search/?apiKey=${API_KEY}&search_field=name&search_value=${encodeURIComponent(title)}`;

  axios.get(searchUrl)
    .then(response => {
      const movies = response.data.title_results;
      movies.forEach((movie, index) => {
        console.log(`${index + 1}. ${movie.name} (${movie.year}), ${movie.type}`);
      });

      askForDetails(movies);
    })
    .catch(error => {
      console.error('Error fetching movie data:', error);
    });
}

function getMovieDetails(movieId, movies) {
  const detailsUrl = `https://api.watchmode.com/v1/title/${movieId}/details/?apiKey=${API_KEY}`;

  axios.get(detailsUrl)
    .then(response => {
      const movie = response.data;

      console.log(`Title: ${movie.title}`);
      console.log(`Plot Overview: ${movie.plot_overview}`);
      console.log(`Runtime: ${movie.runtime_minutes} minutes`);
      console.log(`Release Date: ${movie.release_date}`);
      console.log(`Genres: ${movie.genre_names.join(', ')}`);
      console.log(`Critic Score: ${movie.critic_score}`);
      console.log(`US Rating: ${movie.us_rating}`);

      askForNextStep(movies);
    })
    .catch(error => {
      console.error('Error fetching movie details:', error);
    });
}

function askForDetails(movies) {
  rl.question('Do you want to get details about any of the printed movies? (1-' + movies.length + ') or press Enter to search for another movie: ', (input) => {
    if (input) {
      const index = parseInt(input) - 1;
      if (index >= 0 && index < movies.length) {
        getMovieDetails(movies[index].id, movies);
      } else {
        console.log('Invalid input. Please enter a number between 1-' + movies.length + '.');
        askForDetails(movies);
      }
    } else {
      askForMovieName();
    }
  });
}

function askForNextStep(movies) {
  console.log('Movies:');
  movies.forEach((movie, index) => {
    console.log(`${index + 1}. ${movie.name} (${movie.year}), ${movie.type}`);
  });

  rl.question('Do you want to get details of another movie from the list or search for another movie? (1/2) ', (input) => {
    if (input === '1') {
      askForDetails(movies);
    } else if (input === '2') {
      askForMovieName();
    } else {
      console.log('Invalid input. Please enter 1 or 2.');
      askForNextStep(movies);
    }
  });
}

function askForMovieName() {
  rl.question('Enter the name of a movie to search (or type "menu" to go back to the main menu): ', (title) => {
    if (title === 'menu') {
      showMainMenu();
    } else if (title) {
      searchMovies(title);
    } else {
      console.log('Please enter a movie name.');
      askForMovieName();
    }
  });
}

function getStreamingSources(title) {
  const searchUrl = `https://api.watchmode.com/v1/search/?apiKey=${API_KEY}&search_field=name&search_value=${encodeURIComponent(title)}`;

  axios.get(searchUrl)
    .then(response => {
      const movie = response.data.title_results[0];

      const sourcesUrl = `https://api.watchmode.com/v1/title/${movie.id}/sources/?apiKey=${API_KEY}`;

      return axios.get(sourcesUrl);
    })
    .then(response => {
      const sources = response.data.slice(0, 10);

      console.log('Streaming Sources:');
      if (sources.length === 0) {
        console.log('No streaming sources found.');
      } else {
        console.table(sources.slice(0, 10).map(source => ({
          'Name': source.name,
          'URL': source.web_url
        })));
      }

      askForAnotherStreamingSearch();
    })
    .catch(error => {
      console.error('Error fetching streaming sources:', error);
    });
}

function askForAnotherStreamingSearch() {
  rl.question('Do you want to do another streaming platform search for a movie or return to the main menu? (1/2) ', (input) => {
    if (input === '1') {
      askForStreamingSources();
    } else if (input === '2') {
      showMainMenu();
    } else {
      console.log('Invalid input. Please enter 1 or 2.');
      askForAnotherStreamingSearch();
    }
  });
}

function askForStreamingSources() {
  rl.question('Enter the name of a movie to get streaming sources (or type "menu" to go back to the main menu): ', (title) => {
    if (title === 'menu') {
      showMainMenu();
    } else if (title) {
      getStreamingSources(title);
    } else {
      console.log('Please enter a movie name.');
      askForStreamingSources();
    }
  });
}

function showMainMenu() {
  rl.question('Choose an option:\n1. Search for a movie\n2. Get Streaming Sources For A Movie\n3. Exit\n', (input) => {
    if (input === '1') {
      askForMovieName();
    } else if (input === '2') {
      askForStreamingSources();
    } else if (input === '3') {
      rl.close();
    } else {
      console.log('Invalid input. Please enter 1, 2, or 3.');
      showMainMenu();
    }
  });
}

// Start the program by showing the main menu
showMainMenu();
