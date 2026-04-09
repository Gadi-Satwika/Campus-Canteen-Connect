import axios from 'axios';

const API = axios.create({
  baseURL: 'https://campus-canteen-connect-production.up.railway.app/api'
});

export default API;