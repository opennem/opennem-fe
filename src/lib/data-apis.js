import axios from 'axios';

const http = axios.create({
  baseURL: 'https://data.opennem.org.au/',
});

function fetchJSON(ref) {
  return new Promise((resolve, reject) => {
    http.get(ref).then((data) => {
      resolve(data);
    }).catch((e) => {
      reject(e);
    });
  });
}

export default function (ref) {
  return new Promise((resolve, reject) => {
    fetchJSON(ref).then((data) => {
      resolve(data);
    }).catch((e) => {
      reject(e);
    });
  });
}
