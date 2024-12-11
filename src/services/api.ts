import axios from "axios"

export const api = axios.create({
    baseURL: "http://192.168.105.125:3333",
    timeout: 700
})