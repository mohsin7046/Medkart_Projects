import { app } from '../utilities/import.config.js'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
dotenv.config()

app.use(bodyParser.json())
app.use(express.json())
app.use(cors())

