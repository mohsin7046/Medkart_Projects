import { app } from './utilities/import.config.js'
import './middleware/index.middleware.js'
import './routes/index.routes.js'


app.listen(3000, () => {
  console.log('Warehouse Inward service running on port 3000')
})
