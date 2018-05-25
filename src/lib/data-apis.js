import axios from 'axios';
import { create } from 'apisauce';

const external = 'https://data.opennem.org.au/';
const local = 'data/';
const http = create({
  baseURL: local,
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

export default function (ref, externalData) {
  if (externalData) {
    http.setBaseURL(external);
  } else {
    http.setBaseURL(local);
  }

  return new Promise((resolve, reject) => {
    const calls = ref.map(r => fetchJSON(r));
    axios.all(calls)
      .then(axios.spread((...args) => {
        args.forEach((a) => {
          if (a.status !== 200) {
            reject(a.originalError);
          }
        });
        resolve(args);
      }))
      .catch((e) => {
        reject(e);
      });
  });
}
