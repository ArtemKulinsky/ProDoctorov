'use strict'

export const getAlbums = async (albumId) => {
   let albums;
   
   await $.ajax({
      url: `https://json.medrating.org/albums?userId=${albumId}`,
      method: 'get',
      success: function (response) {
         albums = response;
      }
   });

   return albums;
}

export const getUsers = async () => {
   let users;

   await $.ajax({
      url: 'https://json.medrating.org/users/',
      method: 'get',
      dataFilter: usersFilter,
      success: function (response) {
         users = response;
      }
   });

   return users;
}

function usersFilter(response) {
   let data = JSON.parse(response)
      .filter((item, index) => {             //!extra users are removed, since there are no paginations
         return index <= 9 ? true : false
      });

   data = JSON.stringify(data);

   return data;
}

export const getAlbumPhotos = async (albumId) => {
   let photos;

   await $.ajax({
      url: `https://json.medrating.org/photos?albumId=${albumId}`,
      method: 'get',
      success: function (response) {
         photos = response;
      }
   });

   return photos;
}