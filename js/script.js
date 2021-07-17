'use strict'

import { getAlbumPhotos, getAlbums, getUsers } from "../api/api.js"

document.addEventListener('DOMContentLoaded', function() {

   function createFavouritePhotosStorage() {
      let favouritePhotos = new Map();
      localStorage.setItem('favouritePhotos', JSON.stringify(favouritePhotos));
   };



   ///_________Catalog______________________________

   async function createCatalog() {
      if(document.querySelector('.catalog')) return;

      let catalog = document.createElement('div');
      catalog.classList.add('catalog');

      let otherContent = document.querySelector('.favourite');

      otherContent 
         ? otherContent.replaceWith(catalog)
         : document.querySelector('.main').append(catalog);

      let users = await createUsers();

      catalog.append(users)
   };



    /// ________Users_____________________________

   async function createUsers() {
      let usersData = await getUsers();

      let usersContainer = document.createElement('ul');
      usersContainer.classList.add('catalog__users');
      usersContainer.classList.add('users');

      usersData.forEach(userData => {
         usersContainer.append(createUser(userData))
      });

      usersContainer.addEventListener('click', (e) => showOrHideAlbums(e, usersData))

      return usersContainer;
   };


   function createUser(userData) {
      let user = document.createElement('li')
      user.innerHTML = `<span class="user__name">${userData.name}</span>`;
      user.classList.add('users__user');
      user.classList.add('user');
      user.userData = userData;

      return user;
   };

   /// _________________________________________________



   /// ________Albums___________________________________

   function showOrHideAlbums(e) {
      let userName = e.target.closest('.user__name');
      if (!userName) return;

      let user = userName.closest('.user')
      addAlbums(user);

      $(user).toggleClass('active');
   };


   async function addAlbums(user) {
      if (user.querySelector('.user__albums')) return;

      let albums = await createAlbums(user.userData.id);

      user.append(albums);
   };


   async function createAlbums(userId) {
      let albumsData = await getAlbums(userId);

      let albumsContainer = document.createElement('ul');
      albumsContainer.classList.add('user__albums');
      albumsContainer.classList.add('albums');

      albumsData.forEach(albumData => {
         albumsContainer.append(createAlbum(albumData))
      });

      albumsContainer.addEventListener('click', showOrHideAlbum )

      return albumsContainer;
   };


   function createAlbum(albumData) {
      let album = document.createElement('li');
      album.classList.add('albums__album');
      album.classList.add('album');
      album.albumData = albumData;

      album.innerHTML = `<span class="album__name">${albumData.title}</span>`;

      return album;
   };


   function showOrHideAlbum(e) {
      let albumName = e.target.closest('.album__name');
      if (!albumName) return;

      let album = albumName.closest('.album');

      addAlbumsPhotos(album);

      $(album).toggleClass('active');
   };

   /// ___________________________________________________



   /// ________Album photos___________________________

   async function addAlbumsPhotos(album) {
      if (album.querySelector('.album__photos')) return;

      let photos = await createAlbumPhotos(album.albumData.id);

      album.append(photos);
   };


   async function createAlbumPhotos(albumId) {
      let photosData = await getAlbumPhotos(albumId);

      let photosContainer = document.createElement('div');
      photosContainer.classList.add('album__photos');
      photosContainer.classList.add('photos');

      photosData.forEach((photoData) => {
         photosContainer.append(createAlbumPhoto(photoData))
      })

      photosContainer.addEventListener('click', (e) => onPhotoClick(e, 'catalog') )
      photosContainer.addEventListener('mouseover', (e) => onPhotoMouseover(e, 'catalog'))
      photosContainer.addEventListener('mouseout', (e) => onPhotoMouseout(e, 'catalog'))

      return photosContainer;
   };


   function createAlbumPhoto(photoData) {
      let photoContainer = document.createElement('div');

      let isFavouriteImg;

      checkIsFavouritePhoto(photoData) 
         ? isFavouriteImg = "./resources/images/star_active.jpg"
         : isFavouriteImg = "./resources/images/star_not_active.jpg"

      photoContainer.innerHTML = `<div class="photo__title">
            ${photoData.title}
         </div>
         <div class="photo__is-favorite">
            <img src="${isFavouriteImg}" alt="">
         </div>
         <div class="photo__img">
            <img src=${photoData.thumbnailUrl} alt="">
         </div>`;
      photoContainer.classList.add('photos__photo');
      photoContainer.classList.add('photo');
      photoContainer.setAttribute('photoId', photoData.id)
      photoContainer.photoData = photoData;

      return photoContainer;
   };



   ///_____Photo actions_____________________________________

   function checkIsFavouritePhoto(photoData) {
      let favouritePhotos = new Map(Object.entries(JSON.parse(localStorage.favouritePhotos)));
      let photoKey = `${photoData.albumId},${photoData.id}`;

      return favouritePhotos.has(photoKey);
   };


   function onPhotoClick(e, container) {
      let photoImg = e.target.closest('.photo__img');
      let isFavouriteIcon = e.target.closest('.photo__is-favorite');

      if (photoImg) {
         showFullImage( getPhotoData(photoImg), container );
      } else if (isFavouriteIcon) {
         toggleIsFavouritePhoto( getPhotoData(isFavouriteIcon), container )
      } else return;
   };


   async function showFullImage( photoData, container) {
      if(document.querySelector(`.${container}__full-image`)) return;

      let fullImageContainer = document.createElement('div');
      fullImageContainer.classList.add(`${container}__full-image`);
      fullImageContainer.classList.add('full-image');
      fullImageContainer.innerHTML = `<img src=${photoData.url} alt="">`;

      let photoImg = fullImageContainer.querySelector('img');
      photoImg.onload = function() {
         fullImageContainer.style.top = ((document.documentElement.clientHeight / 2 + window.pageYOffset - fullImageContainer.offsetHeight / 2) / 
            document.documentElement.clientHeight) * 100 + '%';
         fullImageContainer.style.left = ((document.documentElement.clientWidth / 2 - fullImageContainer.offsetWidth / 2) /
            document.documentElement.clientWidth) * 100 + '%';
      }

      document.querySelector(`.${container}`).prepend(fullImageContainer);

      setTimeout(() => {     //!that hideFullImage doesn`t occur immediately
         document.addEventListener('click', hideFullImage);
      }, 200);

      document.body.style.overflowY = 'hidden';
   };


   function hideFullImage(e) {
      let container = document.querySelector('.main').childNodes[1].classList[0]

      let target = e.target.closest(`.${container}__full-image`)

      if (target) return;

      document.querySelector(`.${container}__full-image`).remove();
      document.removeEventListener('click', hideFullImage);
      document.body.style.overflowY = 'auto';
   };


   function getPhotoData(elem) {
      return elem.closest('.photo').photoData
   };


   function toggleIsFavouritePhoto(photoData, container) {
      let favouritePhotos = new Map(Object.entries( JSON.parse(localStorage.favouritePhotos) ));
      let photoKey = `${photoData.albumId},${photoData.id}`;

      if (checkIsFavouritePhoto(photoData)) {
         favouritePhotos.delete(photoKey)

         let isFavouriteImg = document.querySelector(`.${container} .photo[photoId='${photoData.id}'] .photo__is-favorite img`)
         isFavouriteImg.setAttribute('src', './resources/images/star_not_active.jpg')
      } else {
         favouritePhotos.set(photoKey, photoData);

         let isFavouriteImg = document.querySelector(`.catalog .photo[photoId='${photoData.id}'] .photo__is-favorite img`)
         isFavouriteImg.setAttribute('src', './resources/images/star_active.jpg')
      }

      let serialFavouritePhotos = JSON.stringify(Object.fromEntries(favouritePhotos.entries()))

      localStorage.setItem('favouritePhotos', serialFavouritePhotos);
   };


   function onPhotoMouseover(e, container) {
      let photoImg = e.target.closest('.photo__img');

      if (!photoImg) return;

      let photoId = getPhotoData(photoImg).id

      let photoTitle = document.querySelector(`.${container} .photo[photoId='${photoId}'] .photo__title`);
      photoTitle.classList.add('active');
   }


   function onPhotoMouseout(e, container) {
      let photoImg = e.target.closest('.photo__img');

      if (!photoImg) return;

      let photoId = getPhotoData(photoImg).id

      let photoTitle = document.querySelector(`.${container} .photo[photoId='${photoId}'] .photo__title`);
      photoTitle.classList.remove('active');
   }

   ///___________________________________________________________




   /// Favourite Photos _________________________________________

   function createFavourite() {
      if (document.querySelector('.favourites')) return;

      let favourites = document.createElement('div');
      favourites.classList.add('favourite');

      let otherContent = document.querySelector('.catalog');

      otherContent
         ? otherContent.replaceWith(favourites)
         : document.querySelector('.main').append(favourites);

      favourites.append(createFavouritePhotos())
   };


   function createFavouritePhotos() {
      let favouritePhotos = new Map(Object.entries(JSON.parse(localStorage.favouritePhotos)));
      
      let favouritePhotosContainer = document.createElement('div');
      favouritePhotosContainer.classList.add('favourite__photos');

      for (let photo of favouritePhotos.values()) {
         favouritePhotosContainer.append( createAlbumPhoto(photo) );
      }

      favouritePhotosContainer.addEventListener('click', (e) => { 
         let photo = e.target.closest('.photo');

         onPhotoClick(e, 'favourite') 

         if (e.target.closest('.photo__is-favorite')) photo.remove();
      })
      favouritePhotosContainer.addEventListener('mouseover', (e) => onPhotoMouseover(e, 'favourite'))
      favouritePhotosContainer.addEventListener('mouseout', (e) => onPhotoMouseout(e, 'favourite'))

      
      return favouritePhotosContainer;
   };

   /// _________________________________________________________
   
   document.querySelector('.header__nav').addEventListener('click', (e) => {
      let catalog = e.target.closest('.nav__item_catalog');
      let favouritePhotos = e.target.closest('.nav__item_favourites');

      if (catalog) createCatalog();
      if (favouritePhotos) createFavourite();
   })

   if (!localStorage.favouritePhotos) {
      createFavouritePhotosStorage();
   };
});