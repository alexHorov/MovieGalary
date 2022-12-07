const link = "http://my-json-server.typicode.com/moviedb-tech/movies/list/",
    active = 'active',
    cardViews = 'card'
    listViews = 'list'
    moviesList = document.querySelector('.movies-list'),
    moviesCard = document.querySelector('.movies-card'),
    favoriteList = document.querySelector('.fav-list'),
    select = document.querySelector('#select-genres'),
    viewBlock= document.querySelector('.view-block'),
    modal= document.querySelector('.modal'),
    localFavoriteListArray = JSON.parse(localStorage.getItem('favoriteList'))||[];


let moviedb = [];


// =====================get Data
const fetchData = async () => {
    try {
        const result = await fetch(link);
        return await result.json();

    } catch (err) {
        console.error(err)
    }
}

fetchData(link)
    .then((data) => {
        const info = genresToLowerCase(data);
        renderMoviesCard(info);
        renderSelectGenres(info);
        selectGenre(info);


        let show = localStorage.getItem("showMovies");
        if (show == listViews){
            document.querySelector('.block').classList.remove('active');
            moviesCard.style.display= "none";
            document.querySelector('.list').classList.add('active');
            moviesList.style.display= "flex"
        }else{
            document.querySelector('.list').classList.remove('active');
            document.querySelector('.block').classList.add('active');
            moviesList.style.display= "none";
            moviesCard.style.display= "grid"; 
        }
    })

// =================== Change genres =======================

function genresModifyArray(data) {
    let genresArray = [];
    data.forEach(movie => {
        movie.genres.map(genre => genresArray.push(genre));
    });
    const modifyGenres = [...new Set(genresArray)].sort();
    return modifyGenres
}

function genresToLowerCase(data) {
    let movieDB = [];
    data.map(movie => {
        let movieInfo = { ...movie }
        movieInfo.genres = movie.genres.map(genre => genre.toLowerCase())
        movieDB.push(movieInfo);
    })
    return movieDB;
}

function renderMoviesCard(arr) {
    let movieCardFragment = document.createDocumentFragment();
    let movieListFragment = document.createDocumentFragment();

    //  console.log(arr)

    arr.forEach(movie => {

        let movieCard = document.createElement('div');
        let movieList = document.createElement('div');
        movieCard.classList.add('card-item');
        movieList.classList.add('list-item');
        movieCard.setAttribute('data-target', `${movie.id}`);
        movieList.setAttribute('data-target', `${movie.id}`);
        movieCard.innerHTML = `
            <img class="card-img"src="${movie.img}"alt="${movie.name}">
            <button type="button" class="add-favorite" data-id="${movie.id}"><i class="fas fa-star"></i></button>
            <h3>${movie.name}</h3>
            <p>${movie.year}</p>
        `;
        movieList.innerHTML = `
            <div class="list-item__img">
              <img class="list-img"
                src="${movie.img}"
                alt="${movie.name}">
            </div>
            <button type="button" class="add-favorite list" data-id="${movie.id}"><i class="fas fa-star"></i></button>
            <div class="list-item__info">
              <div class="list-item__info-title">
                <h3>${movie.name}</h3>
                <p>${movie.year}</p>
              </div>
              <div class="list-item__info-desc">
                <p>${movie.description}</p>
              </div>
            </div>
        `
        let genresBlock = document.createElement('div');
        genresBlock.classList.add('list-item__info-genres');
        for (let genre of movie.genres) {
            let item = document.createElement('div');
            item.innerText = genre;
            genresBlock.append(item);
        }
        movieList.querySelector('.list-item__info-desc').after(genresBlock);
        movieCardFragment.append(movieCard);
        movieListFragment.append(movieList);
        toggleMovieEvent(movieCard, movie);
        toggleMovieEvent(movieList, movie);
    })
    moviesCard.append(movieCardFragment);
    moviesList.append(movieListFragment);
   

    // console.log(genres)
}

function renderSelectGenres(info) {
    const arrGenres = genresModifyArray(info)
    console.log(arrGenres)
    arrGenres.forEach(genre => {
        let option = document.createElement("option");
        option.value = `${genre}`;
        option.innerHTML = `${genre}`;
        select.append(option);
    })
}


// ================= MODAL ================================
function getModal(id){
    fetch(link+id)
      .then(response=> response.json())
      .then(result=>renderModal(result))
}

function renderModal(movie){
    // let modalFragment = document.createDocumentFragment();
    // let modalMovie = document.createElement('div');
    // modalMovie.classList.add('modal__description');
    const modalMovie = document.querySelector('.modal__description');
    modalMovie.innerHTML=`
    <div class="modal__close" data-close>&times;</div>
        <div class="modal__info">
          <img class="modal__img"
            src=${movie.img}
            alt="${movie.name}">
          <div class="modal-star">
            <button type="button" class="add-favorite" data-id="${movie.id}"><i class="fas fa-star"></i></button>
            <p>${movie.year}</p>
          </div>
         
        </div>
        <div class="modal__content">
          <div class="modal__title">${movie.name}</div>
          <div class="modal__content-descr">
            <p>${movie.description}</p>
          </div>
          <div class="modal__content-team">
            <p>Director: ${movie.director}</p>
            <p>Starring: ${movie.starring}</p>
          </div>
        
        </div>
    `
    let genresBlock = document.createElement('div');
    genresBlock.classList.add('modal__info-genres');
    movie.genres.forEach(genre=>{
        let div = document.createElement('div');
        div.innerText = `${genre.toLowerCase()}`;
        genresBlock.append(div);
    });
   
    modalMovie.querySelector('.modal-star').after(genresBlock);
    // modalFragment.append(modalMovie);
    // modal.append(modalFragment);
    modal.append(modalMovie);
    let starBtn = modalMovie.querySelector('.add-favorite');
    toggleMovieEvent(starBtn, movie);


}
modal.addEventListener('click', (e) => {
    if (e.target === modal || e.target.getAttribute('data-close') == "") {
        modal.style.display = 'none';
    }
});

function renderfavList(movie) {
    let favMovie = document.createElement('div');
    favMovie.innerHTML = `
    <i class="fa-solid fa-arrow-right"></i>
    <p class="fav-name">${movie.name}</p>
    <i class="far fa-trash-alt"></i>
    `
    favoriteList.append(favMovie);
    favMovie.querySelector('.fav-name').addEventListener('click', ()=>{
        modal.style.display = 'block';
        getModal(movie.id);
    })
    let removeFavMovieBtn = favMovie.querySelector('.fa-trash-alt');
    removeFavMovieBtn.addEventListener('click', (e) => {
        console.log(e.target.parentElement)
        e.target.parentElement.remove();
        if(localFavoriteListArray){
            let storage=localFavoriteListArray.filter(el=>el !== movie.id);
            localStorage.setItem('favoriteList',JSON.stringify(storage));
          }
        let starBtnArray = [...document.querySelectorAll('[data-id]')]
        console.log(starBtnArray)
        starBtnArray.forEach(star => {
            if (star.dataset.id == movie.id) {
                star.childNodes[0].classList.remove('active');
            }
        })
    })

}
// ==================E V E N T   C L I C K=======================

// ===========button event add to favorite list or open modal======

function toggleMovieEvent(selector, movie) {
    let starBtnArray = [...document.querySelectorAll('[data-id]')]
    // console.log(favoriteList)
    selector.addEventListener('click', (e) => {
        e.preventDefault();
        if (e.target.classList.contains('fa-star')) {
            if (e.target.classList.contains('active')) {
                e.target.classList.remove('active')
                let storage = localFavoriteListArray.filter(el => el !== movie.id);
                console.log(storage);
                localStorage.setItem('favoriteList', JSON.stringify(storage));

                let favoriteList = document.querySelectorAll('.fav-list>div');
                console.log(favoriteList)
                for (let movieName of favoriteList) {
                    if (movieName.childNodes[3].innerHTML === movie.name) {
                        movieName.remove()
                    }
                }
                starBtnArray.forEach(star => {
                    if (star.dataset.id == e.target.parentElement.dataset.id) {
                        console.log(star.dataset.id)
                        star.childNodes[0].classList.remove('active');
                    }
                })
            } else {
                e.target.classList.add(active)
                renderfavList(movie);
                localFavoriteListArray.push(movie.id);
                localStorage.setItem('favoriteList', JSON.stringify((localFavoriteListArray)))
            }
        } else {
            modal.style.display = 'block';
            getModal(movie.id)
        }
    })
}
// ===============Event Change view ====================
viewBlock.addEventListener('click', e => {
    e.preventDefault();
    let button = e.target;
    const list = document.querySelector('.list');
    const block = document.querySelector('.block');
console.log(e.target)
    if (button.classList.contains('list') || button.classList.contains('list-img')) {
        block.classList.remove('active');
        moviesCard.style.display= "none";
        list.classList.add('active');
        moviesList.style.display= "flex";
        localStorage.setItem('showMovies', listViews)

    }else{
        list.classList.remove('active');
        block.classList.add('active');
        moviesList.style.display= "none";
        moviesCard.style.display= "grid";
        localStorage.setItem('showMovies', cardViews)
    }
})



// ======== EVENt in input ===================
function selectGenre (movies){
    select.addEventListener('change', (e)=>{
        let value = e.target.value;
        genresFilter(movies, value);

    })
}
// ==========Local Storage ==========================
// function LocalStorageArr ()


// =============== Genres filter ======================
//  function genresFilter(movies, value){
//     const targetMovies = movies.filter(el=el.genres.includes(value));

//  }

console.log(localFavoriteListArray)