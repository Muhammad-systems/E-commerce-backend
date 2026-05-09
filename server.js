import {config} from './src/configs/config.js';
import {dbConnect} from './src/configs/db.config.js'; 
import app from './src/app.js'

const startServer = ()=>{
  try {
    dbConnect()
    app.listen(config.port,()=>{
      console.log('[Server started]');
  })
  } catch (error) {
    console.log(error);
  }
}

startServer()