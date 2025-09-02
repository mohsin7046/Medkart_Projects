import { app } from '../utilities/import.config'
import cors from 'cors'
import bodyParser from 'body-parser'

app.use(bodyParser.json())
app.use(cors())
