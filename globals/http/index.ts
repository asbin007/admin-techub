import axios from 'axios'

const API = axios.create({
    baseURL : "http://localhost:2000/api", 
    headers : {
        "Content-Type" : "application/json", 
        "Accept" : "application/json" 
    }
})

const APIS = axios.create({
    baseURL : "http://localhost:2000/api", 
    headers : {
        "Content-Type" : "application/json", 
        "Accept" : "application/json" , 
        "Authorization" : localStorage.getItem("token")
    }
})

export {API,APIS}