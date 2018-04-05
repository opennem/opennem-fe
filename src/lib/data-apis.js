import axios from 'axios';

const http = axios.create({
  baseURL: '/',
});

function fetchJSON(ref) {
  return new Promise((resolve) => {
    http.get(ref).then((data) => {
      resolve(data);
    });
  });
}

export default function (ref) {
  return new Promise((resolve) => {
    fetchJSON(ref).then((data) => {
      resolve(data);
    });
  });
}
