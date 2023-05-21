'use strict';

import { api_key, imageBaseURL, fetchDataFromServer } from "./api.js";
import { sidebar } from "./sidebar.js";
import { createMovieCard } from "./movie-card.js";
import { search } from "./search.js";


const movieId = window.localStorage.getItem("movieId");
const isMovieBookmarked = window.localStorage.getItem("isMovieBookmarked");
const pageContent = document.querySelector("[page-content]");

console.log("session bookmarked", isMovieBookmarked)

sidebar();



const getGenres = function (genreList) {
  const newGenreList = [];

  for (const { name } of genreList) newGenreList.push(name);

  return newGenreList.join(", ");
}

const getCasts = function (castList) {
  const newCastList = [];

  for (let i = 0, len = castList.length; i < len && i < 10; i++) {
    const { name } = castList[i];
    newCastList.push(name);
  }

  return newCastList.join(", ");
}

const getDirectors = function (crewList) {
  const directors = crewList.filter(({ job }) => job === "Director");

  const directorList = [];
  for (const { name } of directors) directorList.push(name);

  return directorList.join(", ");
}

// returns only trailers and teasers as array
const filterVideos = function (videoList) {
  return videoList.filter(({ type, site }) => (type === "Trailer" || type === "Teaser") && site === "YouTube");
}

fetchDataFromServer(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${api_key}&append_to_response=casts,videos,images,releases`, function (movie) {

  const {
    backdrop_path,
    poster_path,
    title,
    release_date,
    runtime,
    vote_average,
    releases: { countries: [{ certification } = { certification: "N/A" }] },
    genres,
    overview,
    casts: { cast, crew },
    videos: { results: videos }
  } = movie;

  
  document.title = `${title} - Dat.mov`;

  const movieDetail = document.createElement("div");
  movieDetail.classList.add("movie-detail");

  movieDetail.innerHTML = `
    <div class="backdrop-image" style="background-image: url('${imageBaseURL}${"w1280" || "original"}${backdrop_path || poster_path}')"></div>
    
    <figure class="poster-box movie-poster">
      <img src="${imageBaseURL}w342${poster_path}" alt="${title} poster" class="img-cover">
    </figure>
    
    <div class="detail-box">
    
      <div class="detail-content">
        <h1 class="heading">${title}</h1>
    
        <div class="meta-list">
    
          <div class="meta-item">
            <img src="/assets/images/star.png" width="20" height="20" alt="rating">
    
            <span class="span">${vote_average.toFixed(1)}</span>
          </div>
    
          <div class="separator"></div>
    
          <div class="meta-item">${runtime}m</div>
    
          <div class="separator"></div>
    
          <div class="meta-item">${release_date?.split("-")[0] ?? "Not Released"}</div>
    
          <div class="meta-item card-badge">${certification}</div>

          <div class="separator"></div>
          <form method="post" action="/bookmark/?id=${movieId}">
          <input type="hidden" name="id" value="${movieId}">
          <input type="hidden" name="title" value="${title}">
          <input type="hidden" name="ratings" value="${vote_average.toFixed(1)}">
          <input type="hidden" name="date" value="${release_date?.split("-")[0] ?? "Not Released"}">
          <input type="hidden" name="poster" value="${imageBaseURL}w342${poster_path}">
        <button type="submit" class="meta-item">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-bookmark" viewBox="0 0 16 16">
      <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"/>
    </svg>
  </button>
</form>

          
        </div>
    
        <p class="genre">${getGenres(genres)}</p>
    
        <p class="overview">${overview}</p>
    
        <ul class="detail-list">
    
          <div class="list-item">
            <p class="list-name">Starring</p>
    
            <p>${getCasts(cast)}</p>
          </div>
    
          <div class="list-item">
            <p class="list-name">Directed By</p>
    
            <p>${getDirectors(crew)}</p>
          </div>
    
        </ul>
          <a href="" class="link">Watch Movie on platform</a>
      </div>
    
      <div class="title-wrapper">
        <h3 class="title-large">Trailers and Clips</h3>
      </div>
    
      <div class="slider-list">
        <div class="slider-inner"></div>
      </div>
    
    </div>
  `;

  for (const { key, name } of filterVideos(videos)) {
    const videoCard = document.createElement("div");
    videoCard.classList.add("video-card");

    videoCard.innerHTML = `
      <iframe width="500" height="294" src="https://www.youtube.com/embed/${key}?&theme=dark&color=white&rel=0"
        frameborder="0" allowfullscreen="1" title="${name}" class="img-cover" loading="lazy"></iframe>
    `;

    movieDetail.querySelector(".slider-inner").appendChild(videoCard);
  }

  pageContent.appendChild(movieDetail);

  fetchDataFromServer(`https://api.themoviedb.org/3/movie/${movieId}/recommendations?api_key=${api_key}&page=1`, addSuggestedMovies);

});



const addSuggestedMovies = function ({ results: movieList }, title) {
  console.log(movieList)
  const movieListElem = document.createElement("section");
  movieListElem.classList.add("movie-list");
  movieListElem.ariaLabel = "You May Also Like";

  movieListElem.innerHTML = `
    <div class="title-wrapper">
      <h3 class="title-large">You May Also Like</h3>
    </div>
    
    <div class="slider-list">
      <div class="slider-inner"></div>
    </div>
  `;

  for (const movie of movieList) {
    const movieCard = createMovieCard(movie); // called from movie_card.js

    movieListElem.querySelector(".slider-inner").appendChild(movieCard);
  }

  pageContent.appendChild(movieListElem);

}



search();