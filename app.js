// Variable containing API key
const API_KEY = `4335f010aa8176ebcc75d83d88dc9877`
// Image Path for poster
const Image_Path = `https://image.tmdb.org/t/p/w1280`

// Importing DOM content from html
const input = document.querySelector('.search input')
const button = document.querySelector('.search button')
const main_grid_title = document.querySelector('.favorites h1')
const main_grid = document.querySelector('.favorites .movies-grid')

const trendingElement = document.querySelector('.trending .movies-grid')

const popup_container = document.querySelector('.popup-container')

// Search movie which searched in searched box
async function getMovieBySearch (searchTerm) {
    const resp = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${searchTerm}`)
    const respData = await resp.json()
    return respData.results
}

// Search Movie by using id of movie
async function getMovieById (id) {
    const resp = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`)
    const respData = await resp.json()
    return respData
}

// Searchng trailer and adding to the trailer
async function getMovieTrailer (id) {
    const resp = await fetch(`https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}`)
    const respData = await resp.json()
    return respData.results[0].key
}

// Adding event litner to button when clicked content in input get searched 
button.addEventListener('click', addSearchMovieToDOM)
async function addSearchMovieToDOM () {
    if(input.value===null){
        return;
    }
    const data = await getMovieBySearch(input.value)

    main_grid_title.innerText = `Search Results...`
    main_grid.innerHTML = data.map(e => {
        return `
            <div class="card" data-id="${e.id}">
                <div class="img">
                    <img src="${Image_Path + e.poster_path}">
                </div>
                <div class="info">
                    <h2>${e.title}</h2>
                    <div class="single-info">
                        <span>Rate: </span>
                        <span>${e.vote_average} / 10</span>
                    </div>
                    <div class="single-info">
                        <span>Release Date: </span>
                        <span>${e.release_date}</span>
                    </div>
                </div>
            </div>
        `
    }).join('')

    // Now when we click in the card we want to show a popup with the movie info with movie page

    const cards = document.querySelectorAll('.card')
    addClickEffectOnCard(cards)
}

// Let's create the popup in the html it will show the movie page when movie card get clicked

// Adding Click effect on the card after click it shows popup with movie page
function addClickEffectOnCard (cards) {
    cards.forEach(card => {
        card.addEventListener('click', () => showPopup(card))
    })
}

async function showPopup (card) {
    popup_container.classList.add('show-popup')

    const movieId = card.getAttribute('data-id')
    const movie = await getMovieById(movieId)
    const movieTrailer = await getMovieTrailer(movieId)

    popup_container.style.background = `linear-gradient(rgba(0, 0, 0, .8), rgba(0, 0, 0, 1)), url(${Image_Path + movie.poster_path})`

    popup_container.innerHTML = `
            <span class="x-icon">&#10006;</span>
            <div class="content">
                <div class="left">
                    <div class="poster-img">
                        <img src="${Image_Path + movie.poster_path}" alt="">
                    </div>
                    <div class="single-info">
                        <span>Add to favorites:</span>
                        <span class="heart-icon">&#9829;</span>
                    </div>
                </div>
                <div class="right">
                    <h1>${movie.title}</h1>
                    <h3>${movie.tagline}</h3>
                    <div class="single-info-container">
                        <div class="single-info">
                            <span>Language:</span>
                            <span>${movie.spoken_languages[0].name}</span>
                        </div>
                        <div class="single-info">
                            <span>Length:</span>
                            <span>${movie.runtime} minutes</span>
                        </div>
                        <div class="single-info">
                            <span>Rate:</span>
                            <span>${movie.vote_average} / 10</span>
                        </div>
                        <div class="single-info">
                            <span>Budget:</span>
                            <span>$ ${movie.budget}</span>
                        </div>
                        <div class="single-info">
                            <span>Release Date:</span>
                            <span>${movie.release_date}</span>
                        </div>
                    </div>
                    <div class="genres">
                        <h2>Genres</h2>
                        <ul>
                            ${movie.genres.map(e => `<li>${e.name}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="overview">
                        <h2>Overview</h2>
                        <p>${movie.overview}</p>
                    </div>
                    <div class="trailer">
                        <h2>Trailer</h2>
                        <iframe width="560" height="315" src="https://www.youtube.com/embed/${movieTrailer}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                    </div>
                </div>
            </div>
    `
    // adding event listner to th X icon when clicked it will close the movie page
    const xIcon = document.querySelector('.x-icon')
    xIcon.addEventListener('click', () => popup_container.classList.remove('show-popup'))

    // Getting heart icon from dom
    const heartIcon = popup_container.querySelector('.heart-icon')

    const movieIds = getLocalStorage()
    for(let i = 0; i <= movieIds.length; i++) {
        if (movieIds[i] == movieId) heartIcon.classList.add('change-color')
    }

    // adding event litner to the heart icon it change or remove the movie from favorites 
    // Color of heart icon get change when heart icon get click
    heartIcon.addEventListener('click', () => {
        if(heartIcon.classList.contains('change-color')) {
            removeLocalStorage(movieId)
            heartIcon.classList.remove('change-color')
        } else {
            addToLocalStorage(movieId)
            heartIcon.classList.add('change-color')
        }
        fetchFavoriteMovies()
    })
}

// Making Local Storage for favorite movies
// getting movie id
function getLocalStorage () {
    const movieIds = JSON.parse(localStorage.getItem('movie-id'))
    // This means if there's not an id just return an empty array else return movie id
    return movieIds === null ? [] : movieIds
}

// function add movie to local storage
function addToLocalStorage (id) {
    const movieIds = getLocalStorage()
    localStorage.setItem('movie-id', JSON.stringify([...movieIds, id]))
}
// Function removes the movie from local storage 
function removeLocalStorage (id) {
    const movieIds = getLocalStorage()
    localStorage.setItem('movie-id', JSON.stringify(movieIds.filter(e => e !== id)))
}

// Favorite Movies
fetchFavoriteMovies()
async function fetchFavoriteMovies() {
    main_grid.innerHTML = ''

    const moviesLS = await getLocalStorage()
    const movies = []
    for(let i = 0; i <= moviesLS.length - 1; i++) {
        const movieId = moviesLS[i]
        let movie = await getMovieById(movieId)
        addFavoritesFromLS(movie)
        movies.push(movie)
    }
}

// Adding Movies to favorite
function addFavoritesFromLS (movieData) {
    main_grid_title.innerText='Favorites'
    main_grid.innerHTML += `
        <div class="card" data-id="${movieData.id}">
            <div class="img">
                <img src="${Image_Path + movieData.poster_path}">
            </div>
            <div class="info">
                <h2>${movieData.title}</h2>
                <div class="single-info">
                    <span>Rate: </span>
                    <span>${movieData.vote_average} / 10</span>
                </div>
                <div class="single-info">
                    <span>Release Date: </span>
                    <span>${movieData.release_date}</span>
                </div>
            </div>
        </div>
    `
    const cards = document.querySelectorAll('.card');
    addClickEffectOnCard(cards);
}

// Getting Trending Movies
getTrendingMovies()
async function getTrendingMovies () {
    const resp = await fetch(`https://api.themoviedb.org/3/trending/all/day?api_key=${API_KEY}`)
    const respData = await resp.json()
    return respData.results
}

// Adding trending movies to the page
addToTrendingDOM()
async function addToTrendingDOM () {

    const data = await getTrendingMovies()
    console.log(data);

    trendingElement.innerHTML = data.slice(0, 5).map(e => {
        return `
            <div class="card" data-id="${e.id}">
                <div class="img">
                    <img src="${Image_Path + e.poster_path}">
                </div>
                <div class="info">
                    <h2>${e.title}</h2>
                    <div class="single-info">
                        <span>Rate: </span>
                        <span>${e.vote_average} / 10</span>
                    </div>
                    <div class="single-info">
                        <span>Release Date: </span>
                        <span>${e.release_date}</span>
                    </div>
                </div>
            </div>
        `
    }).join('')
    const cards = document.querySelectorAll('.card');
    addClickEffectOnCard(cards);
}