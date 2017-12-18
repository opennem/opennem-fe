import * as firebase from 'firebase'
import axios from 'axios'

// init
firebase.initializeApp({
  apiKey: "AIzaSyBb_0dWQMoQdkoJC45bBQ_Z7W4JnvT5dj8",
  authDomain: "opennem-1.firebaseapp.com",
  projectId: "opennem-1",
  storageBucket: "opennem-1.appspot.com",
})

const http = axios.create({
	baseURL: '/',
})
const storageLinks = {}
const storageData = {}
export const FirebaseStorage = firebase.storage()

function addStorageLink(ref) {
  return new Promise((resolve, reject) => {
    FirebaseStorage.ref(ref).getDownloadURL()
      .then(url => {
        storageLinks[ref] = {url}
        resolve(url)
      })
  })
}

function getStorageLink(ref) {
  return new Promise((resolve, reject) => {
    if (storageLinks[ref] === undefined) {
      addStorageLink(ref).then(url => {
        resolve(url)
      })
    } else {
      console.log('existing link')
      resolve(storageLinks[ref].url)
    }
  })
}

function fetchJSON(ref) {
  return new Promise((resolve, reject) => {
    getStorageLink(ref).then(url => {
      http.get(url).then(data => {
        // storageData[ref] = data
        resolve(data)
      })
    })
  })
}

export function getJSON(ref) {
  console.log(ref)
  return new Promise((resolve, reject) => {
    /*** Fetch New Data everytime ***/
    fetchJSON(ref).then(data => {
      resolve(data)
    })

    /*** Check whether there is a cache copy ***/
    // if (storageData[ref] === undefined) {
    //   fetchJSON(ref).then(data => {
    //     resolve(data)
    //   })
    // } else {
    //   console.log('existing data', storageData[ref])
    //   resolve(storageData[ref])
    // }
  })
}
