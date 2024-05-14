// export const toBase64 = (file: File) =>
//   new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = () => resolve(reader.result);
//     reader.onerror = (error) => reject(error);
//   });

import axios from "axios";

export const addMeta = (name: string, content: string) => {
  let meta = document.querySelector(`meta[name = "${name}"`) as HTMLMetaElement;

  if (!meta)
    meta = (document.createElement('meta') as HTMLMetaElement);

  meta.name = name;
  meta.content = content;
  document.head.appendChild(meta);
}

export const formToJson = (form: FormData) => {
  var jsonObj: any = {}

  form.forEach((value, key) => {
    // Reflect.has in favor of: object.hasOwnProperty(key)
    if (!Reflect.has(jsonObj, key)) {
      jsonObj[key] = value;
      return;
    }
    if (!Array.isArray(jsonObj[key])) {
      jsonObj[key] = [jsonObj[key]];
    }
    jsonObj[key].push(value);
  });

  return jsonObj
}

export const fetchData = async (method: string) => {
  return axios.get(method)
    .then(res => res.data)
    .catch(e => {
      console.log(e)
    })
}

export function div(x: number, y: number){
  return (x - x % y) / y;
}

export function instructionStepSortFunc(a: { step: number; instructionImage: number; instructionText: string; }, b: { step: number; instructionImage: number; instructionText: string; }) {
  if (a.step < b.step) { return -1; }
  if (a.step > b.step) { return 1; }
  return 0;
}
// const DEFAULT_OPTIONS = {
//   headers: {
//     'Accept': 'application/json',
//     'Content-Type': 'application/json'
//   }
// }

// export async function useFetch(url:RequestInfo | URL, options: RequestInit | undefined = {}) {
//       return fetch(url, { ...DEFAULT_OPTIONS, ...options }).then(res => {
//           if (!res.ok) return res.json()
//           return res.json().then(json => Promise.reject(json))
//       })
// }