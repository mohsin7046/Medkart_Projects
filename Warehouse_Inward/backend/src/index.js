import { app } from './utilities/import.config.js'
import './middleware/index.middleware.js'
import './routes/index.routes.js'
import './cache/workers/index.worker.js'


app.listen(process.env.PORT || 8000, () => {
  console.log('Warehouse Inward service running on port 5000')
})
