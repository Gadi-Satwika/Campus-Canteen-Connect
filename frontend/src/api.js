import axios from 'axios';

const API = axios.create({
  baseURL: 'https://campus-canteen-connect-production-2564.up.railway.app/api'
});

export default API;