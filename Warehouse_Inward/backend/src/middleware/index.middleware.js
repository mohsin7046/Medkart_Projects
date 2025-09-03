import { app } from '../utilities/import.config.js'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'

app.use(bodyParser.json())
app.use(express.json())
app.use(cors())
