import axios from "axios"
import { BASE_URL } from "@/constants/endpoint"

const axiosPublicInstance = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
})

export { axiosPublicInstance }
